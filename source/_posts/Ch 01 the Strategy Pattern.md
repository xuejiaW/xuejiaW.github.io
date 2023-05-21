---
updated: 2023-05-21
tags:
    - 设计模式
created: 2023-05-04
title: Head First 设计模式 - 策略模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第一章，介绍了策略模式的定义及运用。
date: 2023-05-04
---

策略模式（Strategy Pattern）是使用一些独立的类来各自封装一些通用的算法，这些封装类都继承自同一个接口，该接口定义了算法。对于调用类来说，它只保存一个算法接口的对象，而这个对象所指代的特定算法则可以在运行时动态更改。

例如有我们有一个项目需要描述鸭子，可能有 50 种不同的鸭子都派生自基类`Duck`，鸭子一共有三种飞行方式。这时候我们如果将某一种特定的飞行方式写在基类中，则不是使用这个飞行方式的所有派生鸭子都需要对该方法重写。如果我们不在基类中定义，而在各个派生类中实现，则可能多个有相同飞行方式的鸭子派生类都有相同的代码定义飞行方式，这造成了代码冗余。

所以我们可以使用策略模式，将三种飞行方式都派生自接口`FlyBehavior`，并在鸭子基类中定义变量`FlyBehavior`，然后在派生类中选择各自需要的飞行方式即可。

## 代码示例

### 算法接口及实现类

```cs 飞行方法接口
public interface IFlyBehavior
{
    void Fly();
}
```

```cs 飞行方法实现

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

```cs 鸭子基类
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

```cs 鸭子派生类
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

```cs 测试代码
RubberDuck rubberDuck = new RubberDuck();
rubberDuck.disPlay();
rubberDuck.PerformFly();

BlackDuck blackDuck = new BlackDuck();
blackDuck.disPlay();
blackDuck.PerformFly();
blackDuck.setFlyBehavior(new FlyWithRocket());
blackDuck.PerformFly();
```

运行结果

![策略模式运行结果](/Ch%2001%20the%20Strategy%20Pattern/2019-01-15-00-12-45.png)
