---
tags:
  - 工程实践
  - 代码质量
created: 2023-11-14
updated: 2023-12-27
date: 2023-12-27 21:50
published: true
title: 《Code Complete》 第六章：类的实践
description: 本节主要关注于类的实践，包括一个好的类的特征（良好的抽象，良好的封装），在实现类的过程中，需要关注的问题，如应当使用组合和继承的时机，应当如何处理成员函数和成员变量等。
---

# 6.1 类基础：抽象数据类型

抽象数据类型（Abstract data type, ADT）是一系列 _数据_ 和操作这些数据的函数集合。 

{% note info %}
可以将 ADT 看作为对 **一个** 事物的合理封装
{% endnote %}

ADT 中 _数据_ 概念很宽松，它可以是存储在磁盘中的数据，也可以是内存中的数据，甚至可以是一系列 UI 中按钮的，因此一个包含有操作的 UI 界面，可以被定义为 ADT，一个文件也可以被定义为 ADT，一个数据库也可以被定义为 ADT 等等。

在处理 _类_ 前，开发者首先要明确 ADT 的概念，因为类就是 ADT 的一种实现方式。如果开发者不了解 _ADT_，那么创建出来的类，很可能就是一系列松散相关，甚至不相关的数据和函数的集合，而考虑了 _ADT_ 后创建出来的

## 使用 ADT 的示例

假设有一个应用，且需要提供设置该应用中字体显示的功能。如果不使用 ADT，你可能会实现如下的代码：

```cpp
currentFont.sizeInPixels = PointsToPixels( 12 )
currentFont.attribute = currentFont.attribute or BOLD
```

这样的代码问题是，你直接访问了数据对象（`sizeInPixels` 和 `attribute` ），当这个数据对象的了类发生了变化，则你需要在程序的各个地方都进行修改。

如果使用 ADT，你可能会实现如下的代码：

```cpp
currentFont.SetSizeInPoints( sizeInPoints )
currentFont.SetSizeInPixels( sizeInPixels )
currentFont.SetBoldOn()
currentFont.SetBoldOff()
currentFont.SetItalicOn()
currentFont.SetItalicOff()
currentFont.SetTypeFace( faceName )
```

虽然看上去和之前的代码很类似，但是你已经将对字体的操作封装在了函数中，让调用者和数据进行了隔离。这样程序的其他部分就不必担心数据结构的实现、限制和变更。

## 更多 ADT 的示例

ADT 的使用随处可见：

-   各种数据结构，如堆栈，列表，队列都属于 ADT，因为它将真正的数据（内存对象）进行了隔离。
-   文件也是 ADT。文件的本质是磁盘中的物理地址，`File` 封装了系统调用和操作磁盘等各种混乱的细节。

## ADTs and 类

ADT 构成了就是类概念的基础。

# 6.2 好的类接口

创建高质量的类的第一步，也可能是最重要的一步，就是创建一系列良好的接口。

## 好的抽象

### 仅实现一个 ADT

类的接口应该提供一系列明显相关的函数。

如下类暴露的一系列接口就是 **不好** 的典范，你可以看到其中包含有各种的操作，而你很难直接看出这些操作之间的关系：

```cpp
class Program {
public:
   ...
   // public routines
   void InitializeCommandStack();
   void PushCommand( Command command );
   Command PopCommand();
   void ShutdownCommandStack();
   void InitializeReportFormatting();
   void FormatReport( Report report );
   void PrintReport( Report report );
   void InitializeGlobalData();
   void ShutdownGlobalData();
   ...
private:
   ...
};
```

### 提供相同的抽象等级

对于一个类而言，它应该实现一个且仅实现一个 [ADT](/ch_06_working_classes/#6_1_类基础：抽象数据类型)。

如果你发现一个类实现了多个 ADT，或者你无法确认这个类实现的 ADT 是什么，则你应该将该类重新组织为一个 ADT，或定义多个类来分别表示其中的 ADT。

如下就是一个提供了**不同**抽象等级的 **坏** 代码：

```cpp
class EmployeeCenus: public ListContainer {
public:
   ...
   // public routines
   void AddEmployee( Employee employee );
   void RemoveEmployee( Employee employee );

   Employee NextItemInList();
   Employee FirstItem();
   Employee LastItem();
   ...
private:
   ...
};
```

这个类表示了两个 ADTs：`Employee` 和 `ListContainer`：

-   从命名以及 `AddEmployee` 和 `RemoveEmployee` 函数出发，这个类表示 `Employee`
-   从 `NextItemInList`，`FirstItem` 和 `LastItem` 函数出发，这个类表示的是 `ListContainer`

而一个提供 **相同** 抽象等级的 **好** 代码，应当是：

```cpp
class EmployeeCenus: public ListContainer {
public:
   ...
   // public routines

   void AddEmployee( Employee employee );
   void RemoveEmployee( Employee employee );
   Employee NextEmployee();
   Employee FirstEmployee();
   Employee LastEmployee();
   ...
private:
   ListContainer m_EmployeeList;
   ...
};
```

这个实现，虽然同样继承了 `ListContainer`，但它将 List 作为被封装的数据，因此它隔离了数据。且只表示 `Employee` 这个 ADT：

-   这个类的暴露所有函数，都是 `Employee` 等级的

{% note primary %}
上面两个例子，看上去差别很小。**坏** 代码，只不过是暴露的函数命名 XXXItem，让其表现的像是 `ListContainer` 的抽象而已。
但如果将一个类暴露的接口视作防止进入潜水艇的气闸，不一致的接口就如同一个漏水的挡板，虽然它不会立刻让大量的水进来，但给它足够长的时间，它仍然会让船沉没。
因此，当你定义接口时，如果有多个抽象等级，表示了多个 ADTs，随着程序的修改，这些混合的等级就会让程序变得越来越难理解，直到不可维护。
{% endnote %}

### 想清楚类是对什么 ADT 的抽象

你应该仅提供你想要的 ADT 抽象的接口。

假设 UI 中存在两个组件，一个是网格控件，一个是电子表格控件。电子表格控件比网格空间复杂的多，前者有 150 个函数，后者有 15 个函数，且前者能覆盖后者的所有功能。

如果要开发的项目，想要展现的是普通的网格控件，加上能为为每一个单元格设置不同的颜色功能。且默认的 UI 库中的网格控件不支持该功能，而电子表格控件支持。

此时开发者可以通过定义一个包装类，来封装电子表格控件以实现该功能。开发者的包装类应该只提供 16 个接口（网格控件等效的 15 个接口 + 单元格设置颜色的函数接口），而不是暴露电子表格控件的所有 150 个接口。

如果开发者暴露的是电子表格控件的 150 个接口，那就是没有想明白需要封装的 ADT 是什么。这将导致，未来当包装类内部被包装的对象更改时（如更改为新版本已经支持设置单元格颜色的网格控件）需要调整 150 个接口，而不是实际上真正需要的 16 个接口。

### 提供成对的接口

许多接口都应当是成对的，比如你提供了一个打开灯的操作，那么你就应该提供一个关闭灯的操作。

在设计一个类时，请检查每一个接口是否需要提供一个成对的接口。你不应该没理由的创建一个对立接口，但你也不应该无理由的不提供一个对立接口。

{% note info %}
如果一个类只提供了开灯接口，但没有关灯接口。
类的使用者就会感到困惑，即使现阶段他不需要关灯，也会担心未来的需求。
{% endnote %}

### 将不相关的信息挪到另一个类中

如果你发现一个类中一半的函数都在处理某一半数据，而另一半的函数处理另外一半的数据，那么你就应该将这两部分数据分别放到两个类中。

### 让接口定义编程化而不是语义化

每个接口都由编程部分和语义部分两部分构成。编程部分是编译器可以检查的部分，语义部分是编译器无法检查，需要靠人为约定的部分。 

如有一个接口 `int GetString()`，其中返回值 `int` 就是编程部分，编译器会保证返回值必然是 `int` 类型，而 `GetString` 就是语义部分，虽然函数名中有 `String`，但编译器无法保证返回值是 `String` 类型，如在这个例子中，它实际上返回的是 `int` 类型。

语义部分需要通过注释和文档来进行约定，但这并不安全，所以应当尽可能的将语义部分转化为编程部分。

{% note info %}
即使你无法做到完全的编程化，即让编译器帮你检查，最起码你应该在运行时当事情未按约定执行时，给出足够的错误信息，即：
{% note 'fas fa-quote-left' %}
软件要尽可能从容地应付各种错误输入和自身的运行错误。但是，如果做不到这一点，就让程序尽可能以一种容易诊断错误的方式终止。  
———— [《Unix 编程艺术》 第一章 哲学](/di_1_zhang_zhe_xue)
{% endnote %}
{% endnote %}

### 小心接口的逐渐腐蚀

当类被修改和拓展时，你很可能发现需要增加的功能和类原始的接口不太符合，而这些接口放到其他实现由显得不太合适或比较麻烦，此时就很可能出现接口腐蚀，最终会产生如下的一个 `Employee` 类：

```cpp
class Employee {
public:
   ...
   // public routines
   FullName GetName() const;
   Address GetAddress() const;
   PhoneNumber GetWorkPhone() const;
   ...
   bool IsJobClassificationValid( JobClassification jobClass );
   bool IsZipCodeValid( Address address );
   bool IsPhoneNumberValid( PhoneNumber phoneNumber );

   SqlQuery GetQueryToCreateNewEmployee() const;
   SqlQuery GetQueryToModifyEmployee() const;
   SqlQuery GetQueryToRetrieveEmployee() const;
   ...
private:
   ...
};
```

可以看出早期干净的对于 `Employee` 的抽象已经变成了一系列松散相关的函数的大杂烩。检查邮政编码，手机号等工作和 `Employee` 本身并不相关，这破坏了 [仅实现一个 ADT](/ch_06_working_classes/#仅实现一个_adt) 原则。而且也出现了一系列 SQL 的低层次函数的，导致破坏了 [提供相同的抽象等级](/ch_06_working_classes/#提供相同的抽象等级) 的原则。

## 良好的封装

封装和抽象强相关，而且封装是比抽象更强的概念：
{% note 'fas fa-quote-left' %}
封装是抽象的延续： **抽象** 说，“你可以以高维度的方式（忽略细节）观察一个物体。 **封装** 说：“此外，您不允许以任何其他维度观察对象。你现在看到的一切就是你被允许看到的一切” 
———— [《Code Complete》 第五章：构建中的设计](/ch_05_design_in_construction)
{% endnote %}

根据经验之谈，如果没有封装，那么抽象终将崩溃。所以要么你同时拥有抽象和封装，要么两者都没有。

为了达到良好的封装，你应该：

### 尽量减少类和成员的可访问性

最小化可访问性是旨在鼓励封装的几条规则之一。

如果你在犹豫某个特定的函数应该是 `public`，`private` 还是 `protected`，一个良好的解决方案是，你应该采取最严格的 `private` 等级。

另一种解决方案是，你应该问自己，这个函数如果暴露出去的话，它与现在已经暴露的函数是否提供了一样的抽象等级。

### 不要暴露成员变量

如下的 `Point` 类实现违反了封装性：

```cpp
class Point {
public:
    ...
    float x;
    float y;
    float z;
    ...
}
```

而一个良好的封装是：

```cpp
class Point {
public:
    ...
    float GetX() const;
    float GetY() const;
    float GetZ() const;
    void SetX( float x );
    void SetY( float y );
    void SetZ( float z );
    ...
}
```

这样封装的好处是，它约定了返回的数据是 `float`，但真实的数据是什么并没有约束，如真实的数据可能是 `double` 的，也可能是 `string`。另外当你调用 `Set` 时，调用者也与真实的实现解耦了，真实的实现可能是将其转换为 `double` 或 `string` 等。

### 不要对类的使用者做出假设

类的设计和实现应遵守类接口本身所表达的契约。除了接口本身表达的信息之外，它不应该对如何使用或不使用该接口做出任何假设。

比如一个函数，如果由如下的注释，就说明这个类假设了使用者会按 _它的意愿，先对 x,y,z 进行初始化_，而这个假设很可能会破灭：

```text
// 你应该将初始化 x, y, z 设定为正数
// 因为派生类在接收到 0 时会 Crash
```

### 优先考虑读取时的便利性而不是写入时的便利性

即使在开发过程中，你读代码的次数也远远多于写代码的次数。牺牲读代码时的便利性，以换取写代码时的便利，以期望能更快的写出代码，是不理智的。

这在为类增加接口时尤其容易发生，如果你发现一个要新增的接口，与当前的类有点格格不入，但你很可能为了快速的写出代码而选择先把这个接口塞进去。但之后，这个*塞进去* 的接口就会成为走向滑坡的第一步，见 [小心接口的逐渐腐蚀](/ch_06_working_classes/#小心接口的逐渐腐蚀)

### 警惕，警惕再警惕违反封装的语义

就如同接口定义时区分编程化和语义化一样，在接口封装时也分为编程性和语义性。
{% note 'fas fa-quote-left' %}
每个接口都由编程部分和语义部分两部分构成。编程部分是编译器可以检查的部分，语义部分是编译器无法检查，需要靠人为约定的部分。 
———— [《Code Complete》 第六章：类的实践](/ch_06_working_classes)
{% endnote %}

从编程性而言，只要将一个类的函数和数据定义为 `private` 即完成了封装，但语义上则完全不是，以下就是类的使用者在语义上打破封装的示例：

-   不要调用 A 类的 `Initialize` 函数，因为 A 的函数 `PerformFirstOperation` 会自动调用
-   不要调用 A 类的 `Terminal` 函数，因为 A 的函数 `PerformFinalOperation` 会自动调用
-   你可以随意使用 `ClassB.MAXIMUM` 和 `ClassA.MAXIMUM`，因为他们的值相同。

上述例子的问题都在于，这些依赖并不是根据公共接口的信息，而是依赖其中的私有实现。

每当你发现你在查看一个类中函数的具体实现，以帮助你使用该类时，就说明这个类的封装已经被破坏了，之后这个类的抽象也必然会被破坏。

{% note primary %}
如果你无法仅仅根据类的接口文档来弄清楚该如何使用这个类，那你的第一反应不应当是拉下源码并查看实现。
你真正的做法应当是联系该类的作者，并说 “我不知道这个类该如何用”
而类的作者，在此时应该要做的，也不是直接回答你的问题，而应该是找出该类的文档，补全信息，再提交文档。并问你，现在你可以基于文档理解它是如何工作的了吗？
只有这样，你才能保证你的困惑能帮助到未来的人。
{% endnote %}

### 耦合与抽象和封装密切相关

当一个类的封装或抽象被破坏后，很快这个类就会与其他类发生紧耦合。

如果一个类提供了不完整的功能，其他函数可能会发现它必须直接读取或写入这个类的内部数据。这就破坏了类的封装。

# 6.3 设计和实现的问题

在之前两节，已经说了定义一个好的类接口，对于构建一个高质量的程序有帮助。

而类内部的设计和实现也同样很重要，本节将讨论组合，继承，成员函数，成员变量，类耦合，构造函数，值类型与应用类型等问题。

## 组合

组合（Containment）通常表示类之间 _Has a_ 的关系，如 `Employee` _Has a_ `Name`，`Employee` _Has a_ `Phone`。所以 `Name` 和 `Phone` 是 `Employee` 的成员变量。

{% note warning %}
在 C++ 中，你可以使用 `private inheritance` 来表示组合关系。这样做的主要目的，是可以访问到一个类中的 `protected`` 对象，但这种方法违反了封装性，应当通过其他的方法来实现。
{% endnote %}

如果一个类有超过 7 个数据成员，那你要警惕了。研究表示， 7 个左右（上下浮动 2 个）是一个人在执行其他任务时可以记住的数据的数量。如果一个类包含有超过 7 个成员数据，你可以考虑将其拆分为多个较小的类。

## 继承

继承（Inheritance）表示一个类是另一个类的特化。继承的目的主要是将公用的代码和数据集中在基类中，避免多个位置重复定义编写类似的代码和数据，以降低维护的复杂性。

当你决定使用继承时，你应该要考虑：

-   对于成员函数，他们是否应当对派生类可见，他们有默认实现吗，默认实现可以被重写吗？
-   对于成员变量，他们是否应该对派生类可见？

### 遵守里氏替换原则

基类设定了派生类应当如何 _继承_ 的期望，并对派生类如何操作做出了约束。如果派生类没有完全遵守基类定义的相同接口协定，那么继承就不是合理的技术。

[里氏替换原则](/solid/#L_-_Liskov_Substitution_Principle_里氏替换原则) 表达的即是这个概念。概括而言，[里氏替换原则](/solid/#L_-_Liskov_Substitution_Principle_里氏替换原则) 表示基类中的所有函数在派生类中都应该有相同的含义。

-   如有 `Account` 的基类，并定义了 `GetInterestRate` 函数，`CheckingAccount` 和 `SavingAccount` 两个派生类分别表示支票账户和储蓄账户，这时候的 `GetInterestRate` 返回的数据就是 “储蓄利率”。而如果此时又有一个 `LoanAccount` 表示贷款账号，那么 `GetInterestRate` 返回的数据就是 “贷款利率”。
-   对于使用者而言，`LoanAccount.GetInterestRate` 和 `SavingAccount.GetInterestRate` 就存在语义不同，两个类返回的数据并不是一种数据。

{% note primary %}
如果你使用继承的方式符合 [L - Liskov Substitution Principle 里氏替换原则](/solid/#L_-_Liskov_Substitution_Principle_里氏替换原则) 那么继承就是降低复杂度的强大工具，因为程序员可以专注于对象的通用属性，不需要关注细节。反之程序员必须不断考虑子类实现的语义差异，此时继承只会增加复杂度。
{% endnote %}

### 关注你想要继承的内容

对于一个继承的类而言，它有三种可能的继承的内容：

1. 抽象接口：如 `protected abstract GetValue()` ，这种情况下派生类获取到了基类的接口，但没有获取到实现，因此派生类必须重写基类的基类。
2. 不可重写接口：如 `protected GetValue()` ，这种情况下派生类获取到了基类函数的接口和实现信息，但不允许重写基类的实现。
3. 可重写接口：如 `protected virtual GetValue()`，这种情况下派生类获取到了基类函数的接口和实现信息，且允许重写基类的实现。

当你使用派生类时，你应当自己考虑，派生类想要从基类中获取到什么信息。如果派生类仅仅是想要获取到基类中的某个函数的实现，或许你应该考虑使用 [策略模式](/ch_01_the_strategy_pattern)。

概括而言，如果：

-   你发现多个类依赖相同的数据而不依赖相同的行为，你应该创建出一个包含有这些数据的类，并用 [组合](/ch_06_working_classes/#组合) 而不是 [继承](/ch_06_working_classes/#继承)
-   你发现多个类依赖相同的行为而不依赖相同的数据，你创建出一个包含有这些行为的基类，使用 [策略模式](/ch_01_the_strategy_pattern) 和 [组合](/ch_06_working_classes/#组合)
-   你发现多个类依赖相同的行为和数据，此时才考虑使用 [继承](/ch_06_working_classes/#继承)

### 将公共接口，数据和行为尽可能的往基类移动

接口，数据和行为越往基类（高层）移动，派生类就越容易使用它们。

如果你发现将数据或函数往基类移动的过程中，让某些派生类会破坏 [里氏替换原则](/solid/#L_-_Liskov_Substitution_Principle_里氏替换原则)，那么就说明你移动的太高了。

### 对只有一个实例的派生类保持怀疑

如果一个派生类只有一个实例，可能说明类和实例的概念出现了混淆。

问问你自己，是否可以通过只创建一个基类的实例，但传入不同的数据来实现一样的效果，而不是非要定义一个类。

{% note primary %}
单例模式是例外
{% endnote %}

{% note info %}
这只是参考，并不是说只有一个实例的派生类一定有问题
{% endnote %}

### 对只有一个派生类的基类保持怀疑

如果一个基类只有一个派生类，说明很可能发生了 _提前设计_：开发者试图预测未来的需求，但没有完全理解这些未来的需求是什么。

为未来的工作做准备的最好方式，不是提前抽象出基类。然后告诉自己“可能这层未来会有不同的实现，所以让现在的工作应该尽可能的简单”。

### 对派生类中存在空实现的重写函数保持怀疑

如果一个派生类中的重写函数是空函数，这通常说明基类的设计存在问题。

假设你有一个 `Cat` 类和一个函数 `Scratch()`，但你发现有的猫失去了爪子所以无法抓挠，你可能会想派生出一个 `ScratchlessCat` 类，并将 `Scratch` 函数重写为空函数。

但这样做的问题是：

-   你违反了 [里氏替换原则](/solid/#L_-_Liskov_Substitution_Principle_里氏替换原则)，对于基类而言，所有猫都应该有抓挠的能力，只不过抓挠的方式不同而已，但你却实现了一个无法抓挠的猫。这造成了语义上的不统一。
-   随着时间的推移，会产生难以维护的代码。
    -   如果你发现一只没有尾巴的猫怎么办，一只不会抓老鼠的猫怎么办，一只不会喵喵叫的猫怎么办，最初你会出现一个 `ScratchlessTaillessMouselessMewlessCat` 的怪物类。
    -   当类似上述的怪物类出现后，你会发现基类对派生类没有起到任何的约束，你无法相信基类中定义的任何东西。

正确的做法，是定义一个 `Claws` 类封装抓挠，并将对象定义在 `Cat` 中。这样对于没有爪子的猫，你可以将 `Claws` 对象定义为空，这是正常的数据表达。原先 `Cat` 基类的根本问题是，它假设所有的猫都会抓挠，你应该解决根本问题（通过定义 `Claws` 对象，让 `Cat` 的抓挠能力是通过组合，而不是必须项），而不是简单的在派生类中打补丁弥补基类的问题。

### 避免深继承树

在 [组合](/ch_06_working_classes/#组合) 中说一个类最多有 $7 \pm 2$ 个数据成员。但对于继承而言，最多有 $2-3$ 个继承深度。

继承的深度增加了复杂性，这与继承的目的相反。牢记，继承是为了避免重复代码以降低复杂性。

### 使用多态性而不是类型检查

如果你发现代码中有大量的根据类型进行选择代码，可能此时使用多态性进行抽象是更好的选择。

如下的代码，是典型的可以通过多态性进行抽象的代码：

```cpp
switch ( shape.type ) {
   case Shape_Circle:
      shape.DrawCircle();
      break;
   case Shape_Square:
      shape.DrawSquare();
      break;
   ...
}
```

代码中，根据类型去选择调用 `DrawCircle` 和 `DrawSquare` 的选择。在这种情况下可以通过抽象出 `shape.Draw()` 函数来解决，因为调用者通常关心的只是调用 `shape` 的绘制，而不会耦合到具体的实现。

但也有一些代码，使用类型检查后，执行的操作是明显不同的，此时使用多态性进行抽象是不合适的，如下的代码:

```cpp
switch ( ui.Command() ) {
   case Command_OpenFile:
      OpenFile();
      break;
   case Command_Print:
      Print();
      break;
   case Command_Save:
      Save();
      break;
   case Command_Exit:
      ShutDown();
      break;
   ...
}
```

如果将上述的一系列操作，抽象为 `DoCommand`，则这个类的含义会被过度的淡化，进而无法提供任何的信息，以至于调用者需要关心每个 `Command` 究竟是什么，这就引入了额外的复杂度。

### 将所有的成员变量设为 private

继承在一定程度上也打破了封装。

所以当你继承一个对象时，最好让基类中的所有成员数据都是私有的，以避免派生类破坏基类的封装。如果派生类确实需要访问数据，请提供 `protected accessor`。

### 多继承

{% note 'fas fa-quote-left' %}
The one indisputable fact about multiple inheritance in C++ is that it opens up a Pandora's box of complexities that simply do not exist under single inheritance.
—— Scott Meyers
{% endnote %}

多重继承应该只用于定义 `mixin`，即类似于 `Displayable`，`Sortable` ,`Disposable` 之类抽象的类。

对于其他的情况，多重继承很容易引发极大的复杂度。

## 成员函数和数据

这一节将讨论实现成员函数和数据的一些准则。

### 保持类中的函数数量尽可能的少

如同之前在 [组合](/ch_06_working_classes/#组合) 和 [避免深继承树](/ch_06_working_classes/#避免深继承树) 中提及的，你应当尽可能的避免一个类中的函数数量太多，人脑不足以处理数量过多的数据。

### 尽可能避免调用其他类的数量

一个类使用的其他类数量越多，错误率就越高，这时就是高扇出。

{% note 'fas fa-quote-left' %}
-   中低扇出（Low-to-medium fan-out）：中低扇出意味着每一个类都使用中低数量的其他类。如果一个类使用 7 个以上的其他类，则说明该类存在高扇出，即该类过于复杂。 
———— [《Code Complete》 第五章：构建中的设计](/ch_05_design_in_construction)
{% endnote %}

### 尽可能减少对其他类的间接调用

Law of Demeter 规定：A 类可以随意调用自己的函数，如果 A 类中实例化了 B，那么 A 可以调用 B 中的任意函数，但 A 要避免调用 B 函数返回的数据中的函数。

如 `Account.ContactPerson()` 没问题，但 `Account.ContactPerson().DaytimeContactInfo()` 不行，因为这样 `Account` 间接耦合了 `ContactPerson` 所返回的数据。

{% note primary %}
对其他类的直接连接已经足够危险了，因为你要 [尽可能避免调用其他类的数量](/ch_06_working_classes/#尽可能避免调用其他类的数量)。
间接连接无疑更危险。
{% endnote %}

## 构造函数

### 如果可能的话，构造函数中初始化所有成员数据

在构造函数中初始化所有成员数据，是一种廉价的防御性编程的实践。

### 优先实现深拷贝而非浅拷贝

当实现对象的拷贝函数时，优先实现深拷贝而非浅拷贝。

创建浅拷贝通常是为了提高性能。尽管深拷贝了多个复杂对象的内存在本能上会引发反感，觉得这浪费了性能。但实际上，它很少会造成可以被测量出的性能影响。

深拷贝可以避免开发者意外的修改了对象的数据，也避免了意外引用导致的内存不释放，进而避免复杂度。

{% note warning %}
优先实现浅拷贝，就是通过增加复杂性以获得存疑的性能提升，这是一个糟糕的决策。
{% endnote %}

# 6.4 创建类的理由

在这一节中会列出创建类的一系列理由以及需要避免创建类的情况。

## 对现实世界的物体建模

创建一个类最通常的理由就是对现实中存在的物体进行一个抽象建模，这种抽象正是 [抽象数据类型](/ch_06_working_classes/#6_1_类基础：抽象数据类型) 的直接体现：
{% note 'fas fa-quote-left' %}
抽象数据类型（Abstract data type, ADT）是一系列 _数据_ 和操作这些数据的函数集合。 
———— [《Code Complete》 第六章：类的实践](/ch_06_working_classes)
{% endnote %}

## 对抽象的物体建模

创建类还可以对现实中并不物理存在的对象进行抽象建模，如经典的 `Shape` 对象：

-   _圆_ 和 _方_ 是现实中确实存在的概念，你可以准确的描述这两者的概念，如 _圆_ 是一系列到一个点距离相同的点的集合。
-   _形状_ 是一种抽象概念，你很难描述什么是 _形状_。

{% note primary %}
对于抽象概念的建模是困难的，它要求建模者需要知道一系列具体事物的抽象概念：
-   如一个人，他不知道 _形状_ 这个概念，那么他大概率无法定义出 `Shape` 这个类。他只能给出 “类似鸡蛋的”，“类似桌子的”，这样的抽象等级。
{% endnote %}

## 降低复杂度

创建类的另一个重要理由就是 [管理复杂性](/ch_05_design_in_construction/#软件的主要技术要求：管理复杂性)。

-   类可以 [隐藏信息](/ch_05_design_in_construction/#隐藏信息)，这样当一个类开发完成后，外部的使用者就可以忘记其中的细节，并使用该类。

-   类可以隔离复杂性：

    -   如果你已经 [确认了可能发生变化的领域](/ch_05_design_in_construction/#确认可能发生变化的领域) 。你就可以通过类，将容易变化的部分隔离到一个类中。
    -   对于外部的数据的方案，也可以通过类来隔离。如建立一个类来统一的控制外部设备。

-   类可以简化参数的传递。如果在几个函数中，你需要频繁的传递数据，则可能表示这几个函数或许需要封装在一个类中，然后共同访问一个成员数据。

-   类的存在也可以促进可重用代码。与一个庞大的类相比，分解并有效管理的各较小的类，可以显著的提升代码重用的可能性。

{% note primary %}
在项目开发中，不要将 “重用” 作为目的来设计类。
你应该在一个项目结束，或进行到某一个阶段后，找出各重用的部分，然后进行拆分，重构，以供其他项目使用。
这样可以避免过度设计，即为了让一个类可以重用，而增加了不必要的复杂性。
{% endnote %}

## 需要创建万能类

避免创建一个无所不知，无所不能的万能类。如果 A 类频繁的调用 B 类的 `Get`，`Set` 接口，即 A 类从 B 类获取数据，处理数据，再将处理后的结果告知 B 类。

你就应该询问下自己，这个处理数据的操作是不是可以封装到 B 类中，而不是让 A 类称为 B 类万能的上帝，为其处理一切事物。

# 6.5 特定于语言的问题

以下问题是一个编程语言与类相关的区域，它们在不同的语言中可能有巨大的差异：

-   继承中 Override 构造函数和析构函数的行为
-   异常处理条件下构造函数和析构函数的行为
-   默认构造函数的重要性
-   调用析构函数或 `Finalizer` 的时间
-   重写语言的内置运算符（如赋值，相等）的策略
-   创建和销毁对象（通过声明或超过代码域）时内存的处理方式

# 6.6 超越类：包

类的作用是将程序模块化，模块化本身是个比类更大的话题。在程序的初期，语句就是相较于机器指令的模块化，然后函数是相较于语句的模块化，类是相较于函数的模块化，包则是类更进一步的模块化。

可以在 [设计的层次](/ch_05_design_in_construction/#设计的层次) 中查看各层次的封装。

Ch 06 Class Quality Checklist

