---
tags:
  - Unity
  - CSharp
created: 2025-01-14
updated: 2025-01-24
published: true
title: Unity Coroutine 与 Yield 的关系
date: 2025-01-24
description: 本文主要介绍 Unity 中的协程（Coroutine）和 Yield 的关系，分别会在 Unity 中进行协程原理的论证，以及通过 .Net Tool 自定义一个简易的协程系统说明协程原理。
---

{% note info %}
本文主要介绍 Unity 中的协程（Coroutine）和 Yield 的关系，建议先阅读 [Yield](/yield) 了解 Yield 的基本概念。
{% endnote %}

# Unity 协程

Unity 依赖 [Yield](/yield) 实现了异步编程的 `协程（Coroutine）`。


{% note primary %}
[Yield](/yield) 是 C# 提供的一种延迟获取一系列数据中每一个元素的方式：
{% note 'fas fa-quote-left' %}
`yield` 用来在 Iterator 中返回数据的关键字，`yield return` 和直接使用 return 不同的点在于它可以在返回数据的同时保持当前迭代器的状态并在下次对 `Iterator` 调用 `MoveNext` 时继续迭代器的执行，`yield break` 则是用来结束迭代器。 
———— [C# Yield 关键字](/yield)
{% endnote %}
{% note 'fas fa-quote-left' %}
可以认为 `yield` 实现了 [迭代器模式](/ch_09_the_iterator_and_composite_pattern/#迭代器模式) ，它可以用来延迟数据的获取（例如针对一个集合，不需要一次性获得所有数据，而是在每一个数据真正使用时才获取）。 
———— [C# Yield 关键字](/yield)
{% endnote %}
{% endnote %}


一个协程的示例如下所示：

```csharp
using System.Collections;
using System.Threading;
using UnityEngine;
 
public class Coroutines : MonoBehaviour
{
    private void Start()
    {
        StartCoroutine(MySimpleCoroutine());
    }
 
    private IEnumerator MySimpleCoroutine()
    {
        Debug.Log("Hello from the coroutine!");
        Thread.Sleep(5000);
        
        yield break; // necessary for IEnumerator
    }
}
```

{% note info %}
当运行上述代码时，会发现 Unity 应用在 5 秒内无任何的相应，这是因为协程是运行在 Unity 的 UI 线程上（并非工作线程）的，而 `Thread.Sleep(5000)` 会阻塞 UI 线程，导致应用无响应。
{% endnote %}

## 协程的工作原理

可以看到上述的协程函数返回了一个 `IEnumerator` 对象，在 [Yield 是如何工作的](/yield/#yield_是如何工作的) 中我们知道 `yield` 会在每次调用 `IEnumerator` 的 `MoveNext` 时返回一个值或终止迭代，并且会保持当前迭代器的状态。

Unity 中协程的实现原理即是在每一次调用 `StartCoroutine` 时，会将协程函数的 `IEnumerator` 对象加入到一个队列中，然后在每一帧调用 `MoveNext` 来执行协程函数，直到协程函数执行完毕，或调用 `StopCoroutine` 后将其从队列中移除。

### 自定义协程函数

可以通过在 Unity 中自定义一个 `yield return` 返回的数据类型来实现自定义的协程，以便验证上述协程的工作原理。

```csharp
public class WaitForTime : IEnumerator
{
    private readonly DateTime m_EndTime;
    public WaitForTime(TimeSpan time) { m_EndTime = DateTime.Now + time; }

    public bool MoveNext() => DateTime.Now < m_EndTime;
    public void Reset() { }
    public object Current => null;
}

public class CoroutineSample : MonoBehaviour
{
    private void Start() { StartCoroutine(WaitForTimeSample()); }

    private IEnumerator WaitForTimeSample()
    {
        Debug.Log("Enter WaitForTimeSample");
        yield return new WaitForTime(TimeSpan.FromSeconds(5));
        Debug.Log("Exit WaitForTimeSample");
    }
}
```

运行后，可以看到在打印了 `Enter WaitForTimeSample` 后，等待 5 秒后才打印了 `Exit WaitForTimeSample`，且在此期间 Unity 仍然可以响应其他的操作。

![运行结果](/yield_and_coroutine/gif_1-19-2025_12-02-38_pm.gif)

之所以如此，是因为 `WaitForTime` 类实现了 `IEnumerator` 接口，且在 `MoveNext` 中判断了是否到达了指定的时间，每一帧 Unity 都会调用 `MoveNext` 来判断是否继续执行协程函数，在时间不到目标时间时会返回 `true` 表示 `MoveNext` 仍然可以继续执行，而在时间到达目标时间后会返回 `false` 表示协程函数执行完毕。

### 进一步验证

如果进一步的，在 `MoveNext` 和 `Current` 中添加一些调试信息，可以看到在调用 `StartCoroutine` 时会触发一次 `MoveNext`，后续 Unity 每帧都会通过 `SetupCoroutine` 函数再次触发 `MoveNext`，以 `MoveNext` 为例子，调用堆栈为：
```text

# 开启协程时调用 MoveNext

Called MoveNext
UnityEngine.Debug:Log (object)
WaitForTime:MoveNext () (at Assets/Scripts/WaitForTime.cs:12)
UnityEngine.MonoBehaviour:StartCoroutine (System.Collections.IEnumerator)
CoroutineSample:Start () (at Assets/Scripts/CoroutineSample.cs:8)

# 后续每帧都会d调用 MoveNext
Called MoveNext
UnityEngine.Debug:Log (object)
WaitForTime:MoveNext () (at Assets/Scripts/WaitForTime.cs:12)
UnityEngine.SetupCoroutine:InvokeMoveNext (System.Collections.IEnumerator,intptr)
```

![更详细的 Debug 信息](/yield_and_coroutine/gif_1-19-2025_7-25-50_pm.gif)

{% note info %}
示例代码见：https://github.com/xuejiaW/Unity-Samples/tree/main/YieldAndCoroutine
{% endnote %}

# 自定义协程机制

## 简易 Behaviour 实现

{% note info %}
本节的展示内容因为涉及到要修改 Terminal 的标题，所以需要 .Net Tool，关于创建 .Net Tool 可以参考 [创建 .Net Tools](/create_.net_tools)
{% endnote %}

本节会尝试编写一个纯粹的 Console 应用，实现类似 Unity 的协程机制，即通过 `yield return` 来实现异步编程。首先我们通过 C# 实现极简版的 `MonoBehaviour`，及将 Console 标题修改的派生类 `MySimpleBehaviour`：
```csharp
public abstract class Behaviour
{
    public virtual void Start() { }
    public virtual void Update() { }
}

public class MySimpleBehaviour : Behaviour
{
    public override void Update() { Console.Title = $"Running at {1 / Time.deltaTime:F0} FPS"; }
}
```

其中 `Time` 是自定义的表示时间的类，其实现如下：
```csharp
public static class Time
{
    public static float deltaTime { get; internal set; }
}
```

主入口 `Program` 类需要触发所有的 `MonoBehaviour` 类的 `Start` 和 `Update` 函数，且需要记录每一次循环的时间差作为每一帧的 `deltaTime`：
```csharp
internal static class Program
{
    private static readonly List<Behaviour> s_Behaviours = [];
    private static long s_LastFrameTime = DateTime.Now.Ticks;

    private static void Main()
    {
        s_Behaviours.Add(new MySimpleBehaviour());

        foreach (Behaviour behaviour in s_Behaviours)
        {
            behaviour.Start();
        }

        while (true)
        {
            long frameTime = DateTime.Now.Ticks;
            long deltaTime = frameTime - s_LastFrameTime;
            s_LastFrameTime = frameTime;
            Time.deltaTime = (float) TimeSpan.FromTicks(deltaTime).TotalSeconds;

            foreach (Behaviour behaviour in s_Behaviours)
            {
                behaviour.Update();
            }

            Thread.Sleep(10); // Make fps not too high
        }
    }
}
```

此时运行结果为：
![简易 Behavior 运行结果](/yield_and_coroutine/gif_1-19-2025_10-49-05_pm.gif)

## 增加 Coroutine 机制

在 `Behavior` 的基类中提供函数 `StartCoroutine`，其实现逻辑为将 `IEnumerator` 对象加入到一个队列中，然后在每一帧调用 `MoveNext` 来执行协程函数，直到协程函数执行完毕：

```csharp
public abstract class Behaviour
{
    private readonly List<IEnumerator> m_ActiveCoroutines = new();
    public virtual void Start() { }
    public virtual void Update() { }

    protected void StartCoroutine(IEnumerator coroutine) { m_ActiveCoroutines.Add(coroutine); }

    internal void UpdateCoroutines()
    {
        for (int i = m_ActiveCoroutines.Count - 1; i >= 0; i--)
        {
            IEnumerator coroutine = m_ActiveCoroutines[i];
            if (!coroutine.MoveNext())
            {
                m_ActiveCoroutines.RemoveAt(i);
            }
        }
    }
}
```

在 `Program` 中，在每一帧再额外调用 `UpdateCoroutines` ：
```csharp
internal static class Program
{
    // ....
        while (true)
        {
    // ....
            foreach (Behaviour behaviour in s_Behaviours)
            {
                behaviour.Update();
                behaviour.UpdateCoroutines();
            }

            Thread.Sleep(10); // Make fps not too high
        }
    // ....
}
```

此时再拓展 `MySimpleBehaviour` 类，在其中调用 `StartCoroutine` 来启动定义的协程 `Foo`，`Bar`，而 `Foo` 会再嵌入`Foo2`：
```csharp
public class MySimpleBehaviour : Behaviour
{
    public override void Start()
    {
        base.Start();
        
        StartCoroutine(Foo());
        StartCoroutine(Bar());
    }

    public override void Update() { Console.Title = $"Running at {1 / Time.deltaTime:F0} FPS"; }

    private IEnumerator Foo()
    {
        yield return Foo2();
        Console.WriteLine("Foo Finished!");
    }

    private IEnumerator Foo2()
    {
        for (int i = 0; i < 5; i++)
        {
            Console.WriteLine(i);
            yield return new WaitForSeconds(1);
        }

        Console.WriteLine("Foo2 Finished!");
    }

    private IEnumerator Bar()
    {
        yield return new WaitForSeconds(2);
        Console.WriteLine("Bar Finished!");
    }
}
```

此时运行程序会发现，立即就打印出了 `Foo Finished!`，和 `Bar Finished!`，并没有预期的等待时间，且没有预期的打印出 `Foo2 Finished!`。这是因为我们在 `StartCoroutine` 时只是将最根结点的 `IEnumerator` 添加进了队列，在 `UpdateCoroutine` 中也仅仅对这些根节点的 `IEnumerator` 调用了 `MoveNext`， 被 `yield return new` 所构建的 `IEnumerator` 则没有被处理。

针对这个问题，我们需要做的就是对调用 `StartCoroutine` 的 `IEnumerator` 管理其整个调用栈，而不是仅仅是根节点。修改 `Behavior` 函数如下所示：
```csharp
public abstract class Behaviour
{
    private readonly List<Stack<IEnumerator>> m_ActiveCoroutines = new();
    public virtual void Start() { }
    public virtual void Update() { }

    protected void StartCoroutine(IEnumerator coroutine)
    {
        m_ActiveCoroutines.Add(new Stack<IEnumerator>(new[] {coroutine}));
    }

    internal void UpdateCoroutines()
    {
        for (int index = 0; index != m_ActiveCoroutines.Count; ++index)
        {
            Stack<IEnumerator> instructions = m_ActiveCoroutines[index];
            if (instructions.Count == 0)
            {
                // Remove this coroutine
                m_ActiveCoroutines.RemoveAt(index);
                // To avoid skipping the next coroutine
                index--;
            }
            else
            {
                IEnumerator instruction = instructions.Peek();
                if (instruction.MoveNext())
                {
                    if (instruction.Current is IEnumerator nestedInstruction)
                    {
                        instructions.Push(nestedInstruction);
                    }
                }
                else
                {
                    instructions.Pop();
                }
            }
        }
    }
}
```

其中将对 `IEnumerator` 的管理变为了 `Stack<IEnumerator>`，在调用 `StartCoroutine` 时，将根节点的 `IEnumerator` 加入到 `Stack` 中作为第一个元素。

`UpdateCoroutines` 的函数改变较大，其核心语句为：
```csharp
if (instruction.MoveNext())
{
    if (instruction.Current is IEnumerator nestedInstruction)
    {
        instructions.Push(nestedInstruction);
    }
}
```

其中的关键是检查当前 `IEnumerator` 的 `Current` 是否为 `IEnumerator`，如果是则说明存在嵌套的 `IEnumerator`（由 `yield return new` 产生的），则将其加入到 `Stack` 中，以便在下一次调用 `MoveNext` 时处理。

如果 `instruction.MoveNext()` 返回 `false`，则说明当前 `IEnumerator` 执行完毕，通过 `instructions.Pop()` 将其从 `Stack` 中移除。
```csharp
if (instruction.MoveNext())
{
    // ...
}
else
{
    instructions.Pop();
}
```

当一个 `Stack` 中的所有 `IEnumerator` 执行完毕后，将其从 `List` 中移除，其中 `index--` 是为了避免在循环中移除元素导致遗漏下一个元素：
```csharp
if (instructions.Count == 0)
{
    // Remove this coroutine
    m_ActiveCoroutines.RemoveAt(index);
    // To avoid skipping the next coroutine
    index--;
}
```

![自定义 Coroutine 运行](/yield_and_coroutine/gif_1-24-2025_10-58-32_pm.gif)

{% note info %}
`MoveNext` 的执行频率是每一帧（ `Thread.Sleep(10)`） 控制的，因此这里的 `WaitForSeconds` 会有一定的误差，但是整体的执行逻辑是正确的。
{% endnote %}

{% note info %}
示例代码可见：[Custom Coroutine](https://github.com/xuejiaW/.Net-Samples/tree/main/CustomCoroutine)
{% endnote %}

# Reference

[How do Unity’s coroutines actually work? - Oliver Booth](https://oliverbooth.dev/blog/2021/04/27/how-do-unitys-coroutines-actually-work)

[Fetching Title#8pok](https://oliverbooth.dev/blog/2022/01/21/how-i-recreated-unitys-coroutine-system/)
