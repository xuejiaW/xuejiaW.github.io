---
tags:
    - 设计模式
created: 2022-02-02
updated: 2023-05-27
title: 《Head First 设计模式》 Ch 10 状态模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第十章，介绍了状态模式的定义及运用。
date: 2023-05-20
---

状态模式(State Pattern)允许一个对象根据其内部状态的变化来选择需要执行的操作。这个对象会看起来像是改变了它的类。

状态模式定义听起来有些奇怪，实际上就是将不同状态的行为定义在不同的状态类中，然后根据状态的不同切换这些状态类，进而达到不同的行为。

例如我们需要做一个口香糖贩卖机需要处理，投钱、退钱、旋转出货按钮这三个操作，然后机器有未投钱、投钱、货物卖出、货物卖完四个状态。我们可以将不同状态下对三个操作的处理定义在各自的状态类中。

# 代码示例

## 状态类接口

```cs 状态类接口
public interface State
{
    void InsertQuarter();
    void EjectQuarter();
    void TurnCrank();
    void Dispense();
}
```

## 状态类实现

```cs 未投钱状态
public class NoQuarterState : State
{
    private GumballMachine gumballMachine = null;

    public NoQuarterState(GumballMachine gumballMachine)
    {
        this.gumballMachine = gumballMachine;
    }

    public void Dispense() { Console.WriteLine("You need to pay first"); }

    public void EjectQuarter() { Console.WriteLine("You haven't inserted a quarter"); }

    public void InsertQuarter()
    {
        gumballMachine.SetState(gumballMachine.HasQuarterState);
        Console.WriteLine("You inserted a quarter");
    }

    public void TurnCrank() { Console.WriteLine("You turned,but there's no quarter"); }
}
```

```cs 投钱状态
public class HasQuarterState : State
{
    private GumballMachine gumballMachine = null;

    public HasQuarterState(GumballMachine gumballMachine)
    {
        this.gumballMachine = gumballMachine;
    }
    public void Dispense()
    {
        Console.WriteLine("No gumball dispensed");
    }

    public void EjectQuarter()
    {
        Console.WriteLine("Quarter returned");
        gumballMachine.SetState(gumballMachine.NoQuarterState);
    }

    public void InsertQuarter()
    {
        Console.WriteLine("You can't insert another quater");
    }

    public void TurnCrank()
    {
        Console.WriteLine("You turned");
        gumballMachine.SetState(gumballMachine.SoldState);
    }
}
```

```cs 货物卖出状态
public class SoldState : State
{
    private GumballMachine gumballMachine = null;

    public SoldState(GumballMachine gumballMachine)
    {
        this.gumballMachine = gumballMachine;
    }

    public void Dispense()
    {
        gumballMachine.ReleaseBall();
        if (gumballMachine.remainGumballsNum > 0)
            gumballMachine.SetState(gumballMachine.NoQuarterState);
        else
        {
            Console.WriteLine("Opps,out of gumballs");
            gumballMachine.SetState(gumballMachine.SoldOutState);
        }
    }

    public void EjectQuarter()
    {
        Console.WriteLine("Sorry,you already turned the crank");
    }

    public void InsertQuarter()
    {
        Console.WriteLine("Please wait,we are already giving you a gumball");
    }

    public void TurnCrank()
    {
        Console.WriteLine("Turning twice dones't get you another gumball");
    }
}
```

```cs 货物售完状态
public class SoldOutState : State
{
    private GumballMachine gumballMachine = null;
    public SoldOutState(GumballMachine gumballMachine)
    {
        this.gumballMachine = gumballMachine;
    }
    public void Dispense()
    {
        Console.WriteLine("No gumball dispensed");
    }

    public void EjectQuarter()
    {
        Console.WriteLine("You can't eject,you haven't inserted a quarter yet");
    }

    public void InsertQuarter()
    {
        Console.WriteLine("You can't insert a quarter,the machine is sold out");
    }

    public void TurnCrank()
    {
        Console.WriteLine("You turned,but there are no gumballs");
    }
}
```

# 测试代码及结果

```cs 测试代码
GumballMachine gumballMachine = new GumballMachine(5);
gumballMachine.TurnCrank();
gumballMachine.InsertQuarter();
gumballMachine.EjectQuarter();
gumballMachine.TurnCrank();
gumballMachine.InsertQuarter();
gumballMachine.TurnCrank();
gumballMachine.TurnCrank();
gumballMachine.EjectQuarter();
```

运行结果：

![状态模式运行结果](/Ch_10_the_State_Pattern/2019-02-06-20-10-15.png)
