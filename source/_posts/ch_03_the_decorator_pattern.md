---
tags:
    - 设计模式
alias: 装饰模式
updated: 2023-05-28
created: 2023-05-13
title: 《Head First 设计模式》 Ch 03 装饰模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第三章，介绍了装饰模式的定义及运用。
date: 2023-05-05
---

装饰模式（Decorator Pattern） 提供了一个动态增加一个类功能的方法，主要实现思想是通过一个作为装饰者的类（`Decorators`）包裹被装饰类（`Component`）（装饰类以及被装饰类都有共同的基类），`Decorators` 会在 `Component` 类的某一个函数执行前或后进行一些操作，进而达到增加功能的作用。

装饰模式主要实现了“代码应该对扩展功能开放而对于修改关闭”的面向对象原则，它在增加新功能的前提下，不需要改动既有的代码，只需要增加新的 `Decorators` 并且包含既有的 `Component` 即可。

例如我们要计算一杯咖啡的价格，而这杯咖啡的价格还会受到额外的配料的影响，比如要加抹茶需要额外支付 0.2 元，加奶泡需要额外支付 0.3 元等。如果对各种配料都各自使用一个类来表示，则会存在较多的类需要维护，而且一旦配料发生变化等，还需要进行代码修改。而使用装饰模式则可以将原始的咖啡作为被装饰类，而所有的配料都是装饰类，则配料的更改仅需要增加或删除外部的装饰类即可。

# 代码示例

## 装饰类及被装饰类基类

```cs 被装饰类基类
public abstract class Beverage
{
    protected string description = "UnKnown Beverage";

    public virtual string getDescription()
    {
        return description;
    }

    public abstract double Cost();
}
```

```cs 装饰类基类
public abstract class CondimentDecorator : Beverage
{
    protected Beverage beverage;

    public CondimentDecorator(Beverage beverage)
    {
        this.beverage = beverage;
    }
}
```

{% note info %}
注意装饰类基类继承自被装饰类，并存有一个被装饰类的变量，因为装饰类需要在被装饰类操作的基础上进行一定额外的操作，所以它需要存有对被装饰类的引用，同时对外部而言调用者而言，它与被装饰类相同。
{% endnote %}

## 被装饰类实现

```cs 浓咖啡
public class Espresso : Beverage
{
    public Espresso()
    {
        description = "Espresson";
    }

    public override double Cost()
    {
        return 1.99;
    }
}
```

## 装饰类实现

```cs 酱油
public class Soy : CondimentDecorator
{
    public Soy(Beverage beverage) : base(beverage) { }

    public override string getDescription()
    {
        return beverage.getDescription() + ", Soy";
    }

    public override double Cost()
    {
        return 0.30 + beverage.Cost();
    }
}
```

```cs 奶泡
public class Whip : CondimentDecorator
{
    public Whip(Beverage beverage) : base(beverage) { }

    public override string getDescription()
    {
        return beverage.getDescription() + ", Whip";
    }

    public override double Cost()
    {
        return 0.30 + beverage.Cost();
    }
}
```

```cs 抹茶
public class Mocha : CondimentDecorator
{
    public Mocha(Beverage beverage) : base(beverage) { }

    public override string getDescription()
    {
        return beverage.getDescription() + ", Mocha";
    }

    public override double Cost()
    {
        return 0.20 + beverage.Cost();
    }
}
```

# 测试及结果

```cs 测试代码
Espresso espresso = new Espresso();
Console.WriteLine(espresso.getDescription() + " Cost: " + espresso.Cost());

Beverage doubleMochaWhipEspresso = new Mocha(new Mocha(new Whip(espresso)));
Console.WriteLine(doubleMochaWhipEspresso.getDescription() + " Cost: " + doubleMochaWhipEspresso.Cost());
```

运行结果：

![装饰模式运行结果](/ch_03_the_decorator_pattern/2019-01-15-23-43-20.png)
