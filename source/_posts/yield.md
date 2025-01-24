---
tags:
  - CSharp
created: 2025-01-11
updated: 2025-01-19
published: true
title: C# Yield 关键字
date: 2025-01-12
description: 介绍 C# 中 Yield 关键字的用法和工作原理，且通过一个示例说明如何通过 Yield 关键字节省性能。
---

# Yield 概述

`yield` 用来在 Iterator 中返回数据的关键字，`yield return` 和直接使用 return 不同的点在于它可以在返回数据的同时保持当前迭代器的状态并在下次对 `Iterator` 调用 `MoveNext` 时继续迭代器的执行，`yield break` 则是用来结束迭代器。 

可以认为 `yield` 实现了 [迭代器模式](/ch_09_the_iterator_and_composite_pattern/#迭代器模式) ，它可以用来延迟数据的获取（例如针对一个集合，不需要一次性获得所有数据，而是在每一个数据真正使用时才获取）。 

本文会首先通过用 Yield 改写代码的示例来说明 `yield` 的用法以说明上述的介绍，然后会介绍 `yield` 更具体的工作原理。

# 使用 Yield 改写代码的示例

## 没有 Yield 的情况

我们通过一个非常简单的例子来说明 `yield` 的用法，假设我们有一个支付的列表，数量为 10000，对于 ID 数小于 10 的情况，我们打印 ID 并打印支付的名称，实现如下：

```csharp
internal abstract class Program
{
    private static void Main() { ProcessPayment(); }

    private static void ProcessPayment()
    {
        IEnumerable<Payment> payment = GetPayments(10000);
        foreach (Payment p in payment)
        {
            if (p.id < 10)
                Console.WriteLine($"Payment ID: {p.id}, Name: {p.name}");
            else
                break;
        }
    }

    private static IEnumerable<Payment> GetPayments(int count)
    {
        var payments = new List<Payment>();

        for (int i = 0; i != count; i++)
        {
            var p = new Payment();
            p.id = i;
            p.name = "Payment " + i;
            payments.Add(p);
        }

        return payments;
    }
}
```

运行结果为，可以看到正确的输出了 ID 从 0 到 9 的支付信息：
![运行结果](/yield/2025-01-11-11-18-30.png)

上述的代码并无错误，但如果进行 Debug 会发现其性能会有巨大浪费。因为在目前的实现中，我们是先生成了完整的 Payments 对象列表，再对其进行遍历，无论我们是否需要这些对象，都会生成这些对象，这样会导致性能的浪费。
![10000 个 Payment 对象](/yield/2025-01-11-11-21-49.png)

如果有一种方式，可以在遍历 Payments 对象的时候只生成需要的对象，就可以避免性能的浪费。`yield` 语句就能满足这样的期望。

## 使用 Yield 的情况

可以将上述的代码 使用 `yield` 关键字进行改写，只需要对生成 `IEnumerable<Payment>` 的方法进行修改即可，如下：

```csharp
// .....

private static void ProcessPayment()
{
    // IEnumerable<Payment> payment = GetPayments(10000);
    IEnumerable<Payment> payment = GetPaymentsWithYield(10000);
    foreach (Payment p in payment)
    {
        if (p.id < 10)
            Console.WriteLine($"Payment ID: {p.id}, Name: {p.name}");
        else
            break;
    }
}

private static IEnumerable<Payment> GetPaymentsWithYield(int count)
{
    for (int i = 0; i != count; i++)
    {
        var p = new Payment();
        p.id = i;
        p.name = "Payment " + i;
        yield return p;
    }
}
```

此时运行结果与之前相同，但 Debug 的时候，可以看到运行到 `ProcessPayment` 函数的 `in` 关键字时，才会进入 `GetPaymentsWithYield` 函数并生成 Payment 对象，且后续每一次运行到 `in` 时都会再次进入 `GetPaymentsWithYield` 函数，即在每一次需要使用 `IEnumerable<Payment>` 中的元素时才会去真正的生成该对象，这就极大的节省了性能。

![仅在需要时生成对象](/yield/gif_1-11-2025_11-30-13_am.gif)

{% note info %}
并不是只有 `foreach` 封装了对于 `IEnumerator` 的使用，也可以使用普通的 `while` 循环或者 `for` 循环来进行迭代，只不过需要使用 `ElementAt` 来获取元素。
```csharp
for (int i = 0; i != 10; i++)
{
Payment p = payment.ElementAt(i);
Console.WriteLine($"Payment ID: {p.id}, Name: {p.name}");
}
```
{% endnote %}

# Yield 是如何工作的

为了解 `yield` 是如何工作的，首先要明确 `IEnumerable` 和 `IEnumerator` 的工作原理。

{% note 'fas fa-quote-left' %}
# IEnumerable 和 IEnumerator 的构成

`IEnumerable` 和 `IEnumerator` 是用来实现迭代器的接口，`IEnumerable` 接口包含一个方法 `GetEnumerator`，该方法返回一个实现了 `IEnumerator` 接口的对象，`IEnumerator` 接口包含了两个方法，`MoveNext` 和 `Reset`，以及一个属性 `Current`。

```csharp
public interface IEnumerable
{
    IEnumerator GetEnumerator();
}

public interface IEnumerator
{
    bool MoveNext();
    void Reset();
    object Current { get; }
}
```

泛型版本的 `IEnumerable<T>` 和 `IEnumerator<T>` 和非泛型版本的接口类似，只是泛型版本的接口中的 `Current` 属性的类型是泛型类型 `T`。


———— IEnumerable and IEnumerator
{% endnote %}

当使用 `foreach`  对 `IEnumerable` 对象进行迭代时，它实际上会对 `IEumberable` 对象调用 `GetEnumerator` 函数获取 `IEnumerator`，并使用其中的 `MoveNext` 和 `Current` 判断是否仍然有下一个元素和获取当前元素。

即上述使用 `foreach` 的 `ProcessPayment` 函数实际上会被编译成类似如下的代码，在其中真正依赖的是通过 `IEnumerable.GetEnumerator` 获取的 `IEnumerator`： 
```csharp
private static void ProcessPaymentUsingWhile()
{
    IEnumerable<Payment> payment = GetPaymentsWithYield(10000);
    using IEnumerator<Payment> paymentEnumerator = payment.GetEnumerator();
    while (paymentEnumerator.MoveNext())
    {
        Payment p = paymentEnumerator.Current;
        if (p.id < 10)
            Console.WriteLine($"Payment ID: {p.id}, Name: {p.name}");
        else
            break;
    }
}
```

也因此，可以直接定义 `yield` 返回的数据类型为 `IEnumerator`，并手动调用 `MoveNext` 和 `Current` 来获取元素，如下：
```csharp
private static IEnumerator<Payment> GetPaymentsEnumerator(int count)
{
    for (int i = 0; i != count; i++)
    {
        var p = new Payment();
        p.id = i;
        p.name = "Payment " + i;
        yield return p;
    }
}

public static void ProcessPaymentUsingWhileBasedOnIEnumerator()
{
    IEnumerator<Payment> payment = GetPaymentsEnumerator(10000);
    while (payment.MoveNext())
    {
        Payment p = payment.Current;
        if (p.id < 10)
            Console.WriteLine($"Payment ID: {p.id}, Name: {p.name}");
        else
            break;
    }
}
```

{% note info %}
定义返回 `IEnumerable` 的函数是为了可以直接使用 `foreach` 进行迭代，`yield` 本身并不依赖 `IEnumerable`。Unity 中定义的 [Coroutine](/yield_and_coroutine) 同样包含 `yield` 关键字，但并不依赖 `IEnumerable`，而是要求返回 `IEnumerator`。
{% endnote %}

## yield 的执行顺序

`yield` 的作用就是在迭代器中返回一个值或信号（ `yield break` 表示迭代器结束），并保持迭代器的当前状态。当调用迭代器 `MoveNext` 时，其执行逻辑为：
- 如果是首次迭代，则执行语句直到遇到 `yield return`，返回一个值，并保持当前状态，挂起迭代器。迭代器的调用者可以获取到这个值并对其进行处理
- 如果是后续迭代，则从上次挂起的地方继续执行，直到遇到下一个 `yield return` 或 `yield break`，返回一个值或信号，并保持当前状态，挂起迭代器。

这也就解释了为何在之前的 Debug 中，每一次 `ProcessPayment` 函数的 `in` 关键字处都会进入 `GetPaymentsWithYield` 函数：`GetPaymentsWithYield` 函数并没有真正的被完全执行完，而是在 `yield` 语句处返回了数据且保存了当前迭代器状态，等待一下次的进入。

根据如下代码，可以进一步验证 `yield` 的执行逻辑：
```csharp
public static void Output()
{
    var numbers = ProduceEvenNumbers(5);
    Console.WriteLine("Caller: about to iterate.");
    foreach (int i in numbers)
    {
        Console.WriteLine($"Caller: {i}");
    }
}

private static IEnumerable<int> ProduceEvenNumbers(int upto)
{
    Console.WriteLine("Iterator: start.");

    for (int i = 0; i <= upto; i += 2)
    {
        Console.WriteLine($"Iterator: about to yield {i}");
        yield return i;
        Console.WriteLine($"Iterator: yielded {i}");
    }

    Console.WriteLine("Iterator: end.");
}
```

当调用 `Output` 函数时，输出如下：
```shell
Caller: about to iterate.
Iterator: start.
Iterator: about to yield 0
Caller: 0
Iterator: yielded 0
Iterator: about to yield 2
Caller: 2
Iterator: yielded 2
Iterator: about to yield 4
Caller: 4
Iterator: yielded 4
Iterator: end
```


# Reference

- [yield statement - provide the next element in an iterator - C# reference \| Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield)

- [C# Yield Return: What is it and how does it work? - YouTube](https://www.youtube.com/watch?v=HRXkeaeImGs)
