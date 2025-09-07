---
tags:
  - 设计模式
updated: 2025-09-01
created: 2023-05-14
title: 《Head First 设计模式》 Ch 04 工厂模式
publishStatus: published
description: 本篇来自于 《Head First Design Pattern》 第四章，介绍了装饰模式的定义及运用。
date: 2023-05-06
---

工厂模式是为了将对象的实例化与对对象的操作解耦。因为有时我们会根据情况的不同，实例化出对象的不同版本，而我们不希望这种对于情况的判断与逻辑代码耦合在一起。

工厂模式有三个较为常见的变种，简单工厂模式，工厂方法模式，抽象工厂模式，下面会以创建披萨为例子来具体说明。

# 简单工厂模式

简单工厂模式严格意义上并不是一个设计模式，只是它被太多人的使用，所以需要单独进行说明。

简单工厂模式会定义一个工厂类来进行对象的实例化。

我们定义一个披萨商店，他将会管理披萨产出的整个流程。我们为了将披萨的生产与之后的操作（如切披萨）拆分开，需要定义一个简单披萨工厂。

## 代码示例

### 披萨类及其实例化

```cs 披萨基类
public abstract class Pizza
{
    protected Cheese cheese = null;
    protected Sauce sauce = null;
    protected Onion onion = null;

    public string name { get; set; }

    public abstract void prepare();

    public void bake()
    {
        Console.WriteLine("Bake for 25 minutes at 350");
    }

    public void cut()
    {
        Console.WriteLine("Cutting the pizza into diagonal slices");
    }

    public void box()
    {
        Console.WriteLine("Place pizza in official PizzaStore box");
    }

    public void Debug()
    {
        Console.WriteLine("--------------");
        Console.WriteLine(name);
        Console.WriteLine("Cheese is " + (cheese != null ? cheese.ToString() : "Null"));
        Console.WriteLine("Sauce is " + (sauce != null ? sauce.ToString() : "Null"));
        Console.WriteLine("Onion is " + (onion != null ? onion.ToString() : "Null"));
        Console.WriteLine("--------------");
    }
}
```

```cs 披萨实现
public class CheesePizza : Pizza
{
    public override void prepare()
    {
        cheese = new Cheese();
    }
}

public class SaucePizza : Pizza
{
    public override void prepare()
    {
        sauce = new Sauce();
    }
}
```

### 披萨商店与简单披萨工厂

```cs 披萨商店
public class PizzaStore
{
    SimplePizzaFactory simpleFactory;
    public PizzaStore(SimplePizzaFactory factory)
    {
        this.simpleFactory = factory;
    }

    public Pizza orderPizza(string type)
    {
        Pizza pizza = simpleFactory.createPizza(type);
        pizza.prepare();
        pizza.bake();
        pizza.cut();
        pizza.box();
        return pizza;
    }
}
```

```cs 简单披萨工厂
public class SimplePizzaFactory
{
    public Pizza createPizza(string type)
    {
        Pizza pizza = null;
        if (type.Equals("cheese"))
            pizza = new CheesePizza();
        else if (type.Equals("sauce"))
            pizza = new SaucePizza();
        return pizza;
    }
}
```

## 测试及结果

```cs 测试代码
PizzaStore store = new PizzaStore(new SimplePizzaFactory());
Pizza pizza = store.orderPizza("cheese");
pizza.Debug();
```

运行结果:
![简单工厂运行结果](/ch_04_the_factory_pattern/2019-01-20-21-24-34.png)

# 工厂方法模式

简单工厂提供了一个类来作为对象实例化的工厂，它解决了对象实例化与逻辑代码耦合的问题，但没有提供扩写这个工厂的方法。例如上例中，我们需要在工厂中增加新的产品只能扩写原先的工厂类，但这可能会造成单个工厂类的逻辑过于复杂。
而工厂方法模式则是通过一个抽象函数来作为工厂，在各派生类中重写该函数，达到工厂的扩写。

我们定义一个抽象的披萨商店，并在其中定义一个抽象函数 `createPizza`，并在披萨商店的继承类中重写这个方法来演示工厂方法模式。

{% note warning %}
注意这个例子完全可以通过建立多个简单工厂来实现，这里只是为了说明工厂方法模式的结构。
{% endnote %}

## 代码示例

### 抽象披萨商店及实例化

```cs 抽象披萨商店
public abstract class PizzaStore
{
    public Pizza orderPizza(string type)
    {
        Pizza pizza = createPizza(type);
        pizza.prepare();
        pizza.bake();
        pizza.cut();
        pizza.box();
        return pizza;
    }

    protected abstract Pizza createPizza(string type);
}
```

```cs 纽约披萨商店
public class NYPizzaStore : PizzaStore
{
    protected override Pizza createPizza(string type)
    {
        Pizza pizza = null;
        if (type.Equals("cheese"))
            pizza = new NYStyleCheesePizza();
        else if (type.Equals("sauce"))
            pizza = new NYStyleSausePizza();
        return pizza;
    }
}
```

```cs 芝加哥披萨商店
public class ChicagoPizzaStore : PizzaStore
{
    protected override Pizza createPizza(string type)
    {
        Pizza pizza = null;
        if (type.Equals("cheese"))
            pizza = new ChicagoStyleCheesePizza();
        else if (type.Equals("sauce"))
            pizza = new ChicagoStyleSaucePizza();
        return pizza;
    }
}
```

### 不同风格的披萨实现

```cs 纽约风格的披萨
public class NYStyleCheesePizza : Pizza
{
    public override void prepare()
    {
        cheese = new NYCheese();
    }
}

public class NYStyleSausePizza : Pizza
{
    public override void prepare()
    {
        sauce = new NYSauce();
    }
}
```

```cs 芝加哥风格的披萨
public class ChicagoStyleCheesePizza : Pizza
{
    public override void prepare()
    {
        cheese = new ChicagoCheese();
    }
}

public class ChicagoStyleSaucePizza : Pizza
{
    public override void prepare()
    {
        sauce = new ChicagoSauce();
    }
}
```

## 测试及结果

```cs 测试代码
PizzaStore store = new ChicagoPizzaStore();
Pizza pizza = store.orderPizza("cheese");
pizza.Debug();
store = new NYPizzaStore();
pizza=store.orderPizza("cheese");
pizza.Debug();
```

运行结果：

![工厂方法模式运行结果](/ch_04_the_factory_pattern/2019-01-23-00-29-35.png)

# 抽象工厂模式

工厂方法模式中的工厂的多态性依赖于继承，比如我们定义的`PizzaStore`中有个抽象函数`createPizza`，这个抽象函数即为一个工厂，在各个派生类中我们去重写这个抽象函数，通过继承来实现不同的工厂。而在抽象工厂模式中，我们将定义一个工厂接口，在需要工厂的接口中类中存储这个接口，并在不同的情况下用这个接口不同的实现，来达到工厂的多态性。

另外在工厂方法模式中，因为是通过重写函数的方法来实现，所以一个工厂只能产出一个产品。而在抽象工厂模式中，在一个抽象工厂中却能定义多个制造产品的函数，进而一个抽象工厂可以提供多个产品。

{% note info %}
生产出一个产品还是多个产品并不是抽象工厂模式和工厂方法模式的主要区别，他们的主要区别在于工厂方法模式是通过继承来实现工厂的多态，而抽象工厂模式是通过组合。
{% endnote %}

我们定义一个披萨原料工厂，来体现抽象工厂模式。

## 代码示例

### 披萨原料工厂接口及实现

```cs 披萨原料工厂接口
public interface PizzaIngredientFactory
{
    Onion createOnion();
    Sauce createSauce();
    Cheese createCheese();
}
```

```cs 纽约披萨原料商店
public class NYPizzaIngredientFactory : PizzaIngredientFactory
{
    public Cheese createCheese()
    {
        return new NYCheese();
    }

    public Onion createOnion()
    {
        return new NYOnion();
    }

    public Sauce createSauce()
    {
        return new NYSauce();
    }
}
```

```cs 芝加哥披萨原料商店
public class ChicagoPizzaIngredientFactory : PizzaIngredientFactory
{
    public Cheese createCheese()
    {
        return new ChicagoCheese();
    }

    public Onion createOnion()
    {
        return new ChicagoOnion();
    }

    public Sauce createSauce()
    {
        return new ChicagoSauce();
    }
}
```

{% note info %}
可以看到在抽象工厂的实现时，用到了工厂方法模式。抽象工厂模式与工厂方法模式并非互斥的两种模式，工厂方法模式实际上内嵌与抽象工厂模式中
{% endnote %}

### 抽象披萨商店及实例化

```cs 抽象披萨商店
public abstract class PizzaStore
{
    public Pizza orderPizza(string type)
    {
        Pizza pizza = createPizza(type);
        pizza.prepare();
        pizza.bake();
        pizza.cut();
        pizza.box();
        return pizza;
    }

    protected abstract Pizza createPizza(string type);
}
```

```cs 纽约披萨商店
protected override Pizza createPizza(string item)
{
    Pizza pizza = null;
    PizzaIngredientFactory ingredientFactory = new NYPizzaIngredientFactory();
    if (item == "cheese")
        pizza = new CheesePizza(ingredientFactory);
    else if (item == "sauce")
        pizza = new SaucePizza(ingredientFactory);
    return pizza;
}
```

```cs 芝加哥披萨商店
public class ChicagoPizzaStore : PizzaStore
{
    protected override Pizza createPizza(string item)
    {
        Pizza pizza = null;
        PizzaIngredientFactory ingredientFactory = new ChicagoPizzaIngredientFactory();
        if (item == "cheese")
            pizza = new CheesePizza(ingredientFactory);
        else if (item == "sauce")
            pizza = new SaucePizza(ingredientFactory);
        return pizza;
    }
}
```

{% note info %}
注意，这里披萨商店的实现，仍然是通过工厂方法模式。只是在`createPizza`函数中会实例化一个抽象工厂，并将其传递给对应的`Pizza`对象
{% endnote %}

### 披萨类及其实例化

在披萨类的实例化中，我们使用了抽象工厂模式，披萨的实例化会包含一个披萨原料的抽象工厂，通过不同的披萨原料工厂来取得不同风味的披萨

```cs 披萨基类
public abstract class Pizza
{
    protected Cheese cheese = null;
    protected Sauce sauce = null;
    protected Onion onion = null;

    public string name { get; set; }

    public abstract void prepare();

    public void bake()
    {
        Console.WriteLine("Bake for 25 minutes at 350");
    }

    public void cut()
    {
        Console.WriteLine("Cutting the pizza into diagonal slices");
    }

    public void box()
    {
        Console.WriteLine("Place pizza in official PizzaStore box");
    }

    public void Debug()
    {
        Console.WriteLine("--------------");
        Console.WriteLine(name);
        Console.WriteLine("Cheese is " + (cheese != null ? cheese.ToString() : "Null"));
        Console.WriteLine("Sauce is " + (sauce != null ? sauce.ToString() : "Null"));
        Console.WriteLine("Onion is " + (onion != null ? onion.ToString() : "Null"));
        Console.WriteLine("--------------");
    }
}
```

```cs 披萨实现
public class CheesePizza : Pizza
{
    private PizzaIngredientFactory ingredientFactory = null;

    public CheesePizza(PizzaIngredientFactory ingredientFactory)
    {
        this.ingredientFactory = ingredientFactory;
    }

    public override void prepare()
    {
        cheese = ingredientFactory.createCheese();
        onion = ingredientFactory.createOnion();
    }
}

public class SaucePizza : Pizza
{
    private PizzaIngredientFactory ingredientFactory = null;

    public SaucePizza(PizzaIngredientFactory ingredientFactory)
    {
        this.ingredientFactory = ingredientFactory;
    }

    public override void prepare()
    {
        sauce = ingredientFactory.createSauce();
        onion = ingredientFactory.createOnion();
    }
}
```

## 测试及结果

```cs 测试代码
PizzaStore pizzaStore = new NYPizzaStore();
Pizza pizza = pizzaStore.OrderPizza("cheese");
pizza.Debug();
Console.WriteLine("--------");
pizzaStore = new ChicagoPizzaStore();
pizza = pizzaStore.OrderPizza("cheese");
pizza.Debug();
```

运行结果：
![抽象工厂模式运行结果](/ch_04_the_factory_pattern/2019-01-24-01-01-50.png)

# Reference

https://dzone.com/articles/factory-method-vs-abstract
https://stackoverflow.com/questions/5739611/differences-between-abstract-factory-pattern-and-factory-method

