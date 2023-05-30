---
tags:
    - 设计模式
created: 2022-02-02
updated: 2023-05-28
title: 《Head First 设计模式》 Ch 09 模板方法模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第九章，介绍了迭代器模式和组合模式的定义及运用。
date: 2023-05-11
---

# 迭代器模式

迭代器模式(Iterator Pattern)提供了一种访问聚合对象但不需要关心其内部实现方法的方式。

例如我们存在两个菜单，第一个菜单表示早餐，第二个表示晚餐，第一个菜单其中的菜品用`List`来存储，第二个菜单其中的菜品用`Array`来存储。在这种情况下就需要使用迭代器模式，为两个菜单提供一个供外部调用的访问菜品的接口。

## 代码示例

我们在两个菜单类中添加`createIterator`函数来返回迭代器，对于外部调用者，如测试代码中的`PrintMenu`,它只需要调用`hasNext`及`next`即可而不需要关心菜单中的具体实现。

### 菜单

```cs Pancake菜单
public class PancakeHouseMenu
{
    private List<MenuItem> menuItemsList = null;

    public PancakeHouseMenu()
    {
        menuItemsList = new List<MenuItem>();
        addItem("K&B's Pancake Breakfast", "Pancake with eggs and toast", true, 2.99f);
        addItem("Regular's Pancake Breakfast", "Pancake with eggs and sausags", true, 2.99f);
        addItem("Blueberry's Pancake Breakfast", "Pancake with eggs and fresh blueberries", true, 2.99f);
    }

    public Iterator createIterator()
    {
        return new PancakeIterator(menuItemsList);
    }

    public void addItem(string name, string description, bool vegetarian, float price)
    {
        MenuItem menuItem = new MenuItem(name, description, vegetarian, price);
        menuItemsList.Add(menuItem);
    }
}
```

```cs Diner菜单
public class DinerMenu
{
    private readonly int MaxItemsCount = 6;
    private MenuItem[] menuItemsArray = null;
    private int numberOfItems = 0;

    public DinerMenu()
    {
        menuItemsArray = new MenuItem[MaxItemsCount];
        addItem("Vegetarian BLT", "Fakin Bacon with tomato", true, 2.99f);
        addItem("BLT", "Bacon with tomato", true, 3.99f);
        addItem("Soup of the day", "Soup of the day and salad", false, 3.29f);
    }

    public void addItem(string name, string description, bool vegetarian, float price)
    {
        if (numberOfItems >= MaxItemsCount)
            return;
        MenuItem menuItem = new MenuItem(name, description, vegetarian, price);
        menuItemsArray[numberOfItems++] = menuItem;
    }

    public Iterator createIterator()
    {
        return new DinerMenuIterator(menuItemsArray);
    }
}
```

### 迭代器接口及实现

```cs 迭代器接口
public interface Iterator
{
    bool hasNext();
    object next();
}
```

```cs 迭代器实现
public class PancakeIterator : Iterator
{
    private List<MenuItem> itemsList = null;
    private int currentPosition = 0;

    public PancakeIterator(List<MenuItem> itemsList)
    {
        this.itemsList = itemsList;
    }
    public bool hasNext()
    {
        return currentPosition < itemsList.Count && itemsList[currentPosition] != null;
    }

    public object next()
    {
        return itemsList[currentPosition++];
    }
}

public class DinerMenuIterator : Iterator
{
    private MenuItem[] itemsArray = null;
    private int currentPosition = 0;

    public DinerMenuIterator(MenuItem[] items)
    {
        this.itemsArray = items;
    }
    public bool hasNext()
    {
        return currentPosition < itemsArray.Length && itemsArray[currentPosition] != null;
    }

    public object next()
    {
        return itemsArray[currentPosition++];
    }
}
```

## 测试代码及结果

```cs 测试代码
static void Main(string[] args)
{
    DinerMenu dinerMenu = new DinerMenu();
    PancakeHouseMenu pancakeHouseMenu = new PancakeHouseMenu();

    PrintMenu(dinerMenu.createIterator());
    Console.WriteLine();
    PrintMenu(pancakeHouseMenu.createIterator());
}

private static void PrintMenu(Iterator iterator)
{
    while (iterator.hasNext())
    {
        ((MenuItem)iterator.next()).Debug();
    }
}
```

运行结果：

![迭代器模式运行结果](/ch_09_the_iterator_and_composite_pattern/2019-02-03-23-36-01.png)

# 组合模式

组合模式（Composite Pattern）是用树形结构来组合对象进而体现一种局部-整体的层次结构。组合模式可以让调用者以统一的方式对待单个物体和多个物体的组合。

例如我们需要打印一个菜单上的所有菜品，但菜单中可能还包含子菜单，子菜单中又可能包含子菜单等等，但对于外部调用者而言则不希望关注这些细节。我们可以通过定义一个基类，无论是菜品还是菜单都继承自这个基类，这样对于菜单而言，无论是子菜单还是菜品都是同一个基类，可一起管理。对于外部调者而言只 x 需要关心这个基类即可。

## 代码示例

### 共同抽象类基类

```cs 菜单元素
public abstract class MenuComponent
{
    public virtual void Add(MenuComponent menuComponent) { throw new NotImplementedException(); }
    public virtual void Remove(MenuComponent menuComponent) { throw new NotImplementedException(); }
    public virtual MenuComponent GetChild(int i) { throw new NotImplementedException(); }
    public virtual string Name { get; protected set; }
    public virtual string Description { get; protected set; }
    public virtual float Price { get; protected set; }
    public virtual bool Vegetarian { get; protected set; }
    public virtual void Debug()
    {
        Console.WriteLine(Name + " , " + Description + " , " + Vegetarian + " , " + Price);
    }
}
```

### 菜单及菜品实现

```cs 菜单
public class Menu : MenuComponent
{
    private List<MenuComponent> menuComponetsList = null;

    public Menu(string name, string description)
    {
        menuComponetsList = new List<MenuComponent>();
        Name = name;
        Description = description;
    }

    public override void Add(MenuComponent menuComponent)
    {
        menuComponetsList.Add(menuComponent);
    }

    public override void Remove(MenuComponent menuComponent)
    {
        menuComponent.Remove(menuComponent);
    }

    public override MenuComponent GetChild(int i)
    {
        return menuComponetsList[i];
    }

    public override void Debug()
    {
        Console.WriteLine(Name + " , " + Description);
        menuComponetsList.ForEach(menuComponent => menuComponent.Debug());
    }
}
```

```cs 菜品
public class MenuItem : MenuComponent
{
    public MenuItem(string name, string description, bool vegetarian, float price)
    {
        Name = name;
        Description = description;
        Vegetarian = vegetarian;
        Price = price;
    }
}
```

## 测试代码及结果

```cs 测试代码
Menu menu = new Menu("General Menu", "Holds all menus and menu items");
Menu dinnerMenu = new Menu("Dinner Menu", "Holds dinner menu items");
Menu breakfastMenu = new Menu("Breakfast Menu", "Holds Breakfast menu items");
menu.Add(dinnerMenu);
menu.Add(breakfastMenu);


breakfastMenu.Add(new MenuItem("K&B's Pancake Breakfast", "Pancake with eggs and toast", true, 2.99f));
breakfastMenu.Add(new MenuItem("Regular's Pancake Breakfast", "Pancake with eggs and sausags", true, 2.99f));
breakfastMenu.Add(new MenuItem("Blueberry's Pancake Breakfast", "Pancake with eggs and fresh blueberries", true, 2.99f));

dinnerMenu.Add(new MenuItem("Vegetarian BLT", "Fakin Bacon with tomato", true, 2.99f));
dinnerMenu.Add(new MenuItem("BLT", "Bacon with tomato", true, 3.99f));
dinnerMenu.Add(new MenuItem("Soup of the day", "Soup of the day and salad", false, 3.29f));

menu.Debug();
```

运行结果：

![组合模式运行结果](/ch_09_the_iterator_and_composite_pattern/2019-02-06-16-23-58.png)
