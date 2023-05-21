---
tags:
- 设计模式
created: 2023-05-16
updated: 2023-05-21
title: Head First 设计模式 - 适配器模式和外观模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第七章，介绍了适配器模式及外观模式的定义及运用。
date: 2023-05-08
---

# 适配器模式

适配器模式（Adapter Pattern）将一个类的接口转换为用户想要的另一个接口。适配器模式将原先因为接口不兼容的一些类可以一起工作。

例如我们有已经实现的火鸡类和鸭子类，其中鸭子的鸣叫我们使用`Quack`，火鸡的鸣叫我们用`Goggle`，两个接口不相同，但在某些情况下，我们不希望具体区分是火鸡还是鸭子，只希望他们都能叫，这时候就需要用适配器模式，将火鸡或鸭子伪装成同一个类。

## 代码示例

### 鸭子及火鸡抽象接口及实现

```cs 鸭子接口
public interface Duck
{
    void Quack();
    void Fly();
}
```

```cs 鸭子实现
public class MallardDuck : Duck
{
    public void Fly()
    {
        Console.WriteLine("MallardDuck Fly");
    }

    public void Quack()
    {
        Console.WriteLine("MallardDuck Quack");
    }
}
```

```cs 火鸡接口
public interface Turkey
{
    void Gobble();
    void Fly();
}
```

```cs 火鸡实现
public class WildTurkey : Turkey
{
    public void Fly()
    {
        Console.WriteLine("WildTurkey Fly");
    }

    public void Gobble()
    {
        Console.WriteLine("WildTurkey Gobble");
    }
}
```

### 适配器类

```cs 火鸡适配器
public class TurkeyAdapter : Duck
{
    Turkey turkey;
    public TurkeyAdapter(Turkey turkey)
    {
        this.turkey = turkey;
    }
    
    public void Fly()
    {
        for (int i = 0; i != 5; ++i)
            turkey.Fly();
    }

    public void Quack()
    {
        turkey.Gobble();
    }
}
```

## 测试代码及结果

```cs 测试代码
static void Main(string[] args)
{
    MallardDuck duck = new MallardDuck();
    WildTurkey turkey = new WildTurkey();
    TestDuck(duck);
    TestDuck(new TurkeyAdapter(turkey));
}

static void TestDuck(Duck duck)
{
    duck.Fly();
    duck.Quack();
}
```

运行结果：

![适配器模式运行结果](/Ch%2007%20the%20Adapter%20and%20Facade%20Patterns/2019-02-03-00-10-27.png)

# 外观模式

外观模式(Facade Pattern)为子系统的一系列接口提供了一个统一的，更高级别的接口以简化外部的调用。

外观模式实际上是遵从于`最小知识原则`，对一些上层的类来说，它不需要了解下面子系统的具体构成，那么我们就用一个中间层（Facade）来将封装这些子系统，形成一个软解耦。

例如我们有一个家庭影院，在播放电影时我们需要打开 DVD 机，打开投影仪，打开放大器，打开音频协调器等，我们可以用一个`Facade`来将这些操作都封装起来，对于外部调用者来说仅有开始播放电影及关闭播放电影两步。

## 代码示例

### 子系统

```cs DVD机器
public class DvdPlayer
{
    public void On()
    {
        Console.WriteLine(this.GetType().ToString() + " On");
    }

    public void Off()
    {
        Console.WriteLine(this.GetType().ToString() + " Off");
    }
}
```

```cs 投影仪
public class Projector
{
    public void On()
    {
        Console.WriteLine(this.GetType().ToString() + " On");
    }

    public void Off()
    {
        Console.WriteLine(this.GetType().ToString() + " Off");
    }
}
```

```cs 放大器
public class Amplifier
{
    public void On()
    {
        Console.WriteLine(this.GetType().ToString() + " On");
    }

    public void Off()
    {
        Console.WriteLine(this.GetType().ToString() + " Off");
    }
}
```

```cs 音频协调器
public class Tuner
{
    public void On()
    {
        Console.WriteLine(this.GetType().ToString() + " On");
    }

    public void Off()
    {
        Console.WriteLine(this.GetType().ToString() + " Off");
    }
}
```

### Facade

```cs 家庭影院外观者
class HomeTheaderFacade
{
    private Amplifier amplifier = null;
    private Tuner tuner = null;
    private DvdPlayer dvdPlayer = null;
    private Projector projector = null;

    public HomeTheaderFacade(Amplifier amplifier, Tuner tuner, DvdPlayer dvdPlayer, Projector projector)
    {
        this.amplifier = amplifier;
        this.tuner = tuner;
        this.dvdPlayer = dvdPlayer;
        this.projector = projector;
    }

    public void WatchMovie()
    {
        amplifier.On();
        tuner.On();
        dvdPlayer.On();
        projector.On();
    }

    public void endMovie()
    {
        amplifier.Off();
        tuner.Off();
        dvdPlayer.Off();
        projector.Off();
    }
}
```

## 测试代码及结果

```cs 测试代码
HomeTheaderFacade facade = new HomeTheaderFacade(new Amplifier(), new Tuner(), new DvdPlayer(), new Projector());
facade.WatchMovie();
Console.WriteLine();
facade.endMovie();
```

运行结果：

![外观模式运行结果](/Ch%2007%20the%20Adapter%20and%20Facade%20Patterns/2019-02-03-13-53-18.png)