---
tags:
    - 设计模式
created: 2022-02-02
updated: 2023-05-23
title: Head First 设计模式 - 模板方法模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第八章，介绍了模板方法模式的定义及运用。
date: 2023-05-10
---

# 模版方法模式

模版方法模式（Template Method Pattern）定义了一个算法的操作步骤，但其中的某些步骤需要派生来对应实现。

* 工厂方法>模式就是模版方法模式的一种运用。

* 策略模式和模版方法模式都是将算法的实现抽象出来，不同的是策略模式的实现依靠组成，而模版方法模式依靠继承。

例如我们需要准备咖啡和茶，准备咖啡基本步骤为烧开水，加入咖啡粉，将咖啡倒入杯子，增加牛奶或糖（可选），准备茶的基本步骤为烧开水，加入茶粉，将茶倒入杯子，增加柠檬（可选）。我们发现在制作两个饮料的过程中，烧开水和倒入杯子这两个步骤是一样的，剩下的两个步骤，向烧开的水中增加相应的粉和增加配料，这两部分也是类似的，于是我们可以用模版方法模式，将这两步骤作为抽象方法。

## 代码示例

### 算法模版基类

```cs 咖啡因饮料模版
public abstract class CaffeineBeverage
{
    public void PrepareRecipe()
    {
        boilWater();
        brew();
        pourInCup();
        if (NeedCondiments())
            addCondiments();
    }

    protected abstract void brew();

    protected abstract void addCondiments();

    private void boilWater()
    {
        Console.WriteLine("Boiling Water");
    }

    private void pourInCup()
    {
        Console.WriteLine("Pouring Water");
    }

    public virtual bool NeedCondiments()
    {
        return true;
    }
}
```

{% note info %}
例子中`brew`和`addCondiments`即为模版函数，而`NeedCondiments`这种提供了基本实现，但派生类中仍然可以重写的函数被称为钩子（`Hook`）。
{% endnote%}

### 咖啡因饮料实现

```cs 咖啡
public class Coffee : CaffeineBeverage
{
    protected override void addCondiments()
    {
        Console.WriteLine("Add sugar and Milk");
    }

    protected override void brew()
    {
        Console.WriteLine("Dripping coffee through filter");
    }

    public override bool NeedCondiments()
    {
        return false;
    }
}
```

```cs 茶
class Tea : CaffeineBeverage
{
    protected override void addCondiments()
    {
        Console.WriteLine("Adding lemon");
    }

    protected override void brew()
    {
        Console.WriteLine("Steeping the tea");
    }
}
```

## 测试代码及结果

```cs 测试代码
Coffee coffee = new Coffee();
Tea tea = new Tea();
coffee.PrepareRecipe();
Console.WriteLine();
tea.PrepareRecipe();
```

运行结果:

![模版方法模式运行结果](/Ch%2008%20the%20Template%20Method%20Pattern/2019-02-03-15-59-58.png)