---
title: HeadFirst-设计模式 笔记（一）
categories:
tags:
---

{% cq %}
读书笔记1
{% endcq %}

<!--more-->

## 策略模式

策略模式（Strategy Pattern）是使用一些独立的类来各自封装一些通用的算法，这些被封装类都继承自同一个接口，该接口定义了算法。对于环境类来说，它只保存一个算法接口，而具体实现了这个算法的类，则可以在运行时动态更改。

例如有我们需要定义鸭子，可能有50种不同的鸭子都派生自基类`Duck`，然后有3种飞行方式。这时候我们如果将某一种特定的飞行方式写在基类中，则不是使用这个飞行方式的所有派生鸭子，都需要对该方法重写。而如果我们不在基类中定义，而在各个派生类中实现，则会造成代码冗余。

所以我们将三种飞行方式都派生自接口`FlyBehavior`，然后在鸭子基类中定义变量`FlyBehavior`，而在派生类中选择各自需要的飞行方式即可。

### 算法接口及实现类

```c# 飞行方法接口
public interface IFlyBehavior
{
    void Fly();
}
```

```c# 飞行方法实现

public class FlyNoWay : IFlyBehavior
{
    public void Fly()
    {
        Console.WriteLine("Can not fly");
    }
}

public class FlyWithRocket : IFlyBehavior
{
    public void Fly()
    {
        Console.WriteLine("Fly with rocket");
    }
}
public class FlyWithWings : IFlyBehavior
{
    public void Fly()
    {
        Console.WriteLine("Fly with wings");
    }
}
```

### 环境类

```c# 鸭子基类 
public abstract class Duck
{
    private IFlyBehavior flyBehavior;

    public Duck() { }

    public abstract void disPlay();

    public void PerformFly()
    {
        flyBehavior.Fly();
    }

    public void setFlyBehavior(IFlyBehavior fb)
    {
        flyBehavior = fb;
    }
}
```

```c# 鸭子派生类 
public class BlackDuck : Duck
{
    public BlackDuck() : base()
    {
        setFlyBehavior(new FlyWithWings());
    }

    public override void disPlay()
    {
        Console.WriteLine("I am a black duck");
    }
}
public class RubberDuck : Duck
{
    public RubberDuck() : base()
    {
        setFlyBehavior(new FlyNoWay());
    }

    public override void disPlay()
    {
        Console.WriteLine("I am a rubber duck");
    }
}
```

### 测试及结果

```c# 测试代码
RubberDuck rubberDuck = new RubberDuck();
rubberDuck.disPlay();
rubberDuck.PerformFly();

BlackDuck blackDuck = new BlackDuck();
blackDuck.disPlay();
blackDuck.PerformFly();
blackDuck.setFlyBehavior(new FlyWithRocket());
blackDuck.PerformFly();
```

> 运行结果
> 
> ![策略模式运行结果](HeadFirstDesignPatternNotes_1/2019-01-15-00-12-45.png)
<!-- endtab -->


```c# ab
Debug.Log("sss")
```

{% note primary %}
引用引用
{% endnote %}

***