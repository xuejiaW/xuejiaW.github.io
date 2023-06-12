---
tags:
    - 设计模式
    - 编码规范 
created: 2023-06-07
updated: 2023-06-12
title: SOLID 原则
published: true
date: 2023-06-12 21:37 
description: 本篇主要内容来自于 Unity 电子书 《Level Up Your Code With Game Programming Patterns》，讲解如何遵循 SOLID 原则让 Unity 中常见的实现变得更容易维护。</br> `SOLID` 原则是面向对象编程中的五个重要设计原则，有助于增强软件的可维护性、可扩展性和可读性。
---

`SOLID` 原则是面向对象编程中的五个重要设计原则，有助于增强软件的可维护性、可扩展性和可读性。

# S- Single Responsibility Principle 单一职责

单一原则要求一个类只能承担一个职责，并且只能有一个潜在的原因去更改这个类。

![单一职责](/solid/image-20220703135544298.png)

{% note warning %}
不要刻意的追求单一原则，甚至于到了一个类只包含一个函数的程度。
{% endnote %}

## Example

如下是一个常见的 Unity `Monobehavior`：

```csharp
public class UnrefactoredPlayer : MonoBehaviour
{
    [SerializeField] private string inputAxisName;
    [SerializeField] private float positionMultiplier;
    private float m_YPosition;
    private AudioSource m_BounceSfx;
    private void Start() { m_BounceSfx = GetComponent<AudioSource>(); }

    private void Update()
    {
        float delta = Input.GetAxis(inputAxisName) * Time.deltaTime;
        m_YPosition = Mathf.Clamp(m_YPosition + delta, -1, 1);
        transform.position = new Vector3(transform.position.x, m_YPosition * positionMultiplier, transform.position.z);
    }

    private void OnTriggerEnter(Collider other) { m_BounceSfx.Play(); }
}
```

这个脚本中实际上耦合了音频，按键输入和对于玩家移动的控制，即：
![不符合单一原则的 Player](/solid/image-20230610105358001.png)

为了符合单一职责的原则，可以将对于音频，按键输入和玩家控制的逻辑，分别拆分至 `PlayerAudio`，`PlayerInput` 和 `PlayerMovement` 三个类中， `Player` 去引用者三个类，如下：

```csharp
[RequireComponent(typeof(PlayerAudio), typeof(PlayerInput), typeof(PlayerMovement))]
public class Player : MonoBehaviour
{
    [SerializeField] private PlayerAudio playerAudio;
    [SerializeField] private PlayerInput playerInput;
    [SerializeField] private PlayerMovement playerMovement;

    private void Start()
    {
        playerAudio = GetComponent<PlayerAudio>();
        playerInput = GetComponent<PlayerInput>();
        playerMovement = GetComponent<PlayerMovement>();
    }
}

public class PlayerAudio : MonoBehaviour
{
    …
}

public class PlayerInput : MonoBehaviour
{
    …
}

public class PlayerMovement : MonoBehaviour
{
    …
}

```

关系图如下，此时如果要修改音频相关的逻辑，只需要修改 `PlayerAudio` 脚本，不会有影响到 Input 和 Movement 的风险：
![符合单一原则的 Player](/solid/image-20230610134447341.png)

# O-Open/Closed Principle 开闭原则

实体应该对  **扩展**  开放，对  **修改**  关闭。允许扩展行为而无需修改源代码。

![开闭原则](/solid/image-20220703135627060.png)

## Example

如存在 `AreaCalculator` 类，用以计算不同形状的面积：

```csharp
public class AreaCalculator
{
    public float GetRectangleArea(Rectangle rectangle) { return rectangle.width * rectangle.height; }
    public float GetCircleArea(Circle circle) { return circle.radius * circle.radius * Mathf.PI; }
}

public class Rectangle
{
    public float width;
    public float height;
}

public class Circle
{
    public float radius;
}
```

![不符合开闭原则的 Area Calculator](/solid/image-20230610135408696.png)

目前这个类的实现没有什么问题，但每增加一个形状，`AreaCalculator` 就需要修改一次。随着形状的种类的扩张， `AreaCaulculator` 会变得逐渐不可维护。

为了符合开闭原则，可以将所有形状抽象为 `Shape` 类，在派生类中定义每个形状计算面积的方式：

```csharp
public abstract class Shape
{
    public abstract float CalculateArea();
}

public class Rectangle : Shape
{
    public float width;
    public float height;
    public override float CalculateArea() { return width * height; }
}

public class Circle : Shape
{
    public float radius;
    public override float CalculateArea() { return radius * radius * Mathf.PI; }
}

public class AreaCalculator
{
    public float GetArea(Shape shape) { return shape.CalculateArea(); }
}
```

此时 `AreaCalculator` 只需要关心调用 Shape 中的 `CalculateArea` 函数，而不需要关心具体的 Shape 类型。因此即使有了新的 Shape，也不会需要修改 `AreaCalculator` 类。此时类与类间的关系为：
![符合开闭原则的 AreaCalculator](/solid/image-20230610161252390.png)

# L - Liskov Substitution Principle 里氏替换原则

程序中的对象应该可以被其子类实例替换掉，而不会影响程序的正确性。里氏替换原则指明了类的派生关系，要求派生类必须完全能承担基类的所有功能。

![里氏替换原则](/solid/image-20220703135721761.png)

一些遵守里氏替换原则的技巧：

- 如果在派生类中移除了某个函数的实现，则可能会破坏里氏替换原则。`NotImplementedException` 是一个绝对的信号，告知开发者里氏替换原则被破坏。如果子类中有空函数实现，则也标明了里氏替换原则的破坏。
- 保持基类尽可能的简单：在基类中的逻辑越多，则越可能破坏里氏替换原则。
- 更多的使用组合而非派生
- 在构造类的继承关系前，先思考类的 API。实现中的抽象关系，并不一定要来自于现实的抽象关系。并不是现实中所有的 _是_ 关系，都需要设计为派生关系。如下例子中，`Train` 和 `Car` 可以派生自不同的基类，而非派生自 `Vehicle`。

## Example

有一个 `Vehicle` 基类标识交通工具，并有 `Car` 和 `Trunk` 两个派生类：
![Vehicle 和派生类 ](/solid/image-20230610162905254.png)

`Vehicle` 类如下

```csharp
public class Vehicle
{
    public float speed = 100;
    public Vector3 direction;
    public void GoForward() { ... }
    public void Reverse() { ... }
    public void TurnRight() { ... }
    public void TurnLeft() { ... }
}
```

交通工具，可能在马路上，也可能在铁路上行驶，如下图所示：
![铁路和马路](/solid/image-20230610163001603.png)

可以通过类 `Navigator` 来控制交通工具的行驶：

```csharp
public class Navigator
{
    public void Move(Vehicle vehicle)
    {
        vehicle.GoForward();
        vehicle.TurnLeft();
        vehicle.GoForward();
        vehicle.TurnRight();
        vehicle.GoForward();
    }
}
```

此时如果将 `Train` 传递给 `Navigator` 就会发现，`Train` 在铁轨上是不能进行左右转弯的：
![Train 无法进行左右转弯](/solid/image-20230610163250520.png)

此时即破坏了里氏替换原则，因为基类 `Vehicle` 要求交通工具要实现左右转弯，而 `Train` 并无法实现，即基类无法被派生类的替换。

为了修复这个问题，可以使用组合，将转向和移动拆分成两个接口，而不是集中在 `Vehicle` 基类中：

```csharp
public interface ITurnable
{
    public void TurnRight();
    public void TurnLeft();
}

public interface IMovable
{
    public void GoForward();
    public void Reverse();
}
```

创建两个基类 `RoadVehicle` 和 `RailVehicle` 使用这两个接口，如下所示。此时每一个派生类都完美的实现了基类（`ITurnable` 和 `IMovable`）的功能，即满足了里氏替换原则：
![符合里氏替换原则的 Car / Train](/solid/image-20230610165245750.png)

实现如下：

```csharp
public class RoadVehicle : IMovable, ITurnable
{
    public float speed = 100f;
    public float turnSpeed = 5f;
    public virtual void GoForward() { ... }
    public virtual void Reverse() { ... }
    public virtual void TurnLeft() { ... }
    public virtual void TurnRight() { ... }
}

public class RailVehicle : IMovable
{
    public float speed = 100;
    public virtual void GoForward() { ... }
    public virtual void Reverse() { ... }
}

public class Car : RoadVehicle { ... }

public class Train : RailVehicle { ... }
```

# I - Interface Segregation Principle 接口隔离原则

使用多个特定细分的接口比单一的总接口要好，不能强迫用户去依赖他们用不到的接口。

![|400](/solid/image-20220703135800770.png)

## Example

如在一个策略游戏中，有很多的单位。开发者可能会定义一个如下接口保证所有的对象都实现相似的功能：

```csharp
public interface IUnitStats
{
    public float Health { get; set; }
    public int Defense { get; set; }
    public void Die();
    public void TakeDamage();
    public void RestoreHealth();
    public float MoveSpeed { get; set; }
    public float Acceleration { get; set; }
    public void GoForward();
    public void Reverse();
    public void TurnLeft();
    public void TurnRight();
    public int Strength { get; set; }
    public int Dexterity { get; set; }
    public int Endurance { get; set; }
}
```

这个接口太过于复杂了，比如一个爆炸桶单位并不会移动，因此如果爆炸桶继承了该类，它必须要实现无意义的 `GoForward`，`TurnLeft` 等接口。

符合接口合理原则的方式，是将上述的接口进行拆分，如下所示。此时每一个派生类都能实现它真正需要的接口：
![符合接口隔离的接口定义](/solid/image-20230610172229144.png)

定义的接口为：

```csharp
public interface IMovable
{
    public float MoveSpeed { get; set; }
    public float Acceleration { get; set; }
    public void GoForward();
    public void Reverse();
    public void TurnLeft();
    public void TurnRight();
}

public interface IDamageable
{
    public float Health { get; set; }
    public int Defense { get; set; }
    public void Die();
    public void TakeDamage();
    public void RestoreHealth();
}

public interface IUnitStats
{
    public int Strength { get; set; }
    public int Dexterity { get; set; }
    public int Endurance { get; set; }
}

public interface IExplodable
{
    public float Mass { get; set; }
    public float ExplosiveForce { get; set; }
    public float FuseDelay { get; set; }
    public void Explode();
}

public class ExplodingBarrel : MonoBehaviour, IDamageable, IExplodable { ... }

public class EnemyUnit : MonoBehaviour, IDamageable, IMovable, IUnitStats { ... }
```

# D - Dependency Inversion Principle 依赖倒置原则

程序要依赖于抽象接口，而不是具体实现。

- 高层模块不应该依赖底层模块，二者都应该依赖于抽象
- 抽象不应该依赖具体实现，具体实现应该依赖抽象

![依赖倒置原则](/solid/image-20220703135905806.png)

{% note info %}
关于内聚耦合的定义和解释，见 [高内聚低耦合](/coupling/#高内聚低耦合)
{% endnote %}

在编码时，自然的会产生 `High-Level` 的模块和 `Low-Level` 的模块。很自然的情况下，`High-Level` 模块会依赖 `Low-Level` 模块实现某些功能，但依赖导致原则则需要将整个依赖关系转为依赖抽象。

## Example

如需要实现*打开门* 这一功能，常见的会定义一个 `Switch` 类管理门的开启或关闭，并定义 `Door` 表示门。 `Switch` 是 `High-Level` 模块，`Door` 是 `Low-Level` 模块。

最常见的实现情况如下：

```csharp
public class Switch : MonoBehaviour
{
    public Door door;
    public bool isActivated;

    public void Toggle()
    {
        if (isActivated)
        {
            isActivated = false;
            door.Close();
        }
        else
        {
            isActivated = true;
            door.Open();
        }
    }
}

public class Door : MonoBehaviour
{
    public void Open() { Debug.Log("The door is open."); }
    public void Close() { Debug.Log("The door is closed."); }
}
```

此时依赖关系为：
![高等级的 Switch 依赖低等级的 Door ](/solid/image-20230611125426387.png)

这种实现可以正常运作，但 `Switch` 直接依赖了 `Door`，如果 `Switch` 要控制更多的物体，如灯泡，电风扇则需要再次修改。

解决方法是增加 `ISwitchable` 接口，`Switch` 依赖 `ISwitchable` 而不依赖 `Door`，如下：
![使用 ISwitchable 作为两个类的桥梁](/solid/image-20230611144515909.png)

实现代码如下：

```csharp
public interface ISwitchable
{
    public bool isActive { get; }
    public void Activate();
    public void Deactivate();
}

public class Switch : MonoBehaviour
{
    public ISwitchable client;

    public void Toggle()
    {
        if (client.isActive)
            client.Deactivate();
        else
            client.Activate();
    }
}

public class Door : MonoBehaviour, ISwitchable
{
    public bool isActive { get; private set; }

    public void Activate()
    {
        isActive = true;
        Debug.Log("The door is open.");
    }

    public void Deactivate()
    {
        isActive = false;
        Debug.Log("The door is closed.");
    }
}
```

此时再需要定义新的可开关变量，只需要新增类而无需修改 `Switch` 脚本。这就是依赖倒置原则带来的好处：
![](/solid/image-20230611151422409.png)

# Reference

[Level up your code with game programming patterns | Unity Blog](https://blog.unity.com/games/level-up-your-code-with-game-programming-patterns)

[图解你身边的 SOLID 原则 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/130954951)