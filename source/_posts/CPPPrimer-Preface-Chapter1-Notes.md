---
title: 《C++ Primer》 序言与第一章笔记
mathjax: false
date: 2020-01-31 00:02:02
categories:
  - 读书笔记
  - 计算机语言
tags:
  - 读书笔记
  - C++
---

{% cq %}

《C++ Primer》 序言与第一章笔记

因为之前已经对C++语言有一些了解，所以在笔记中不会事无巨细的罗列所有细节。

{% endcq %}

<!--more-->

# Preface

## Why Read This Book?

现代C++可以看作是由三个部分组成的：

1. 低Level的语言，大部分都是继承自C
2. 更高级的一些语言特性，让程序员可以定义自己的数据类型
3. 使用高级语言特性实现的提供一些算法和数据结构的标准库

许多C++书籍的教学方式是从低Level的C语言特性开始，纯粹用C的特性来实现一些功能。在后期再用高级特性来重新实现这些功能，或使用标准库中的方法来代替实现。

这样教学的方法问题在于，首先低Level的C特性较为复杂繁琐，很多初学者在第一阶段就放弃。第二，在后期学会了高级特性后，之前所学的使用低Level实现的方法就要被替代，这一定程度上是浪费时间。

所以本书直接在介绍每一部分时都会尽量直接使用高级特性，不需要拘泥于C特性的一些细节。

## Structure of This Book

本书的第一部分与第二部分是关于语言的基础。

第三部分与第四部分是关于如何让用户实现自己的数据类型，即C++语言的特性。第三部分较为基础，第四部分会深入一些特性。

# Chapter 1 Getting Started

## Writing a Simple C++ Program

每个C++程序都必须有一个main函数，操作系统通过调用main函数来执行C++程序。

对于大部分操作系统来说，main函数返回的是状态指示器。返回0表示操作成功，非0的含义由操作系统决定，通常而言非0表示某个错误的发生。

### Compiling And Executing Our Program

可使用Visual studio调试程序，或者使用命令行的g++来编译程序。g++编译下可使用 `-o`来指定编译后的文件名。

```command
g++ [-o <BuildFileName>] <sourceFileName>

g++ -o test test.cpp
```

## A First Look at Input/Output

C++中有提供IO功能的标准库，本书中大部分使用的是`iostream`库，其中`istream`类型表示输入，`ostream`类型表示输出。`stream`一词暗示了这些IO操作是可以连续的产生或消耗数据。

### Standard Input and Output Objects

`istream`类型对应的实例是`cin`，`ostream`对应的实例是`cout`，它们分别是标准输入和输出。`iostream`库也定义了一些`cerr`和`clog`输出实例，分别表示标准错误信息的输出和调试信息的输出

默认的，系统会将这些实例与正在执行程序的窗口联系在一起，即如果是输入，则从这个窗口中读取，如果是输出，则输出到这个窗口中。

### A Program that Uses the IO Library

`#include`与头文件必须在同一行中，`#include`必须在函数外定义，通常而言都是将它放在文件开头的地方。

### Writing to a Stream

`<<`是输出操作符，操作符的返回的结果是左参数，即语句`cout << "Hellow world"`返回的是`cout`对象。因此可以连续使用`<<`操作符，如`cout << "Hellow world"<<"!"`

`endl`是在`iostream`中定义的一个特殊的参数，它不仅可以表示一行的结束，也会刷新当前设备的缓冲（Buffer），即保证当前程序所有产生的数据都会被写入到输出流中，而不是仍然在内存中等待写入。

当程序员使用输出流进行调试时，建议每句后都加上`endl`。因为程序意外崩溃的话，如果没有刷新缓冲的操作将会导致调试器对于程序在何处崩溃产生错误的判断。

### Using Names from the Standard Library

所有标准库中的内容都在`std`命名空间下。

### Reading from a Stream

`>>`是输入操作符，如输出操作符一样，输出操作符的返回也是左参数，因此也可以连续使用`>>`操作符，如`cin >> v1 >> v2`。输入的数据会被依次读进输入操作符的右参数中。

数据可由空格或者换行来区分，如输入数据是`12 13`，则在上述代码中，V1的值为12，V2的值为13。

## A Word about Comments

编译器会无视注释。

错误的注释不如没有注释，所以在修改代码后要及时的修改注释。

### Kinds of Comments in C++

C++支持两种注释方式，单行注释（Single-line）和多行注释（Paired）。

单行注释以`//`开始，以换行结束

多行注释以`/*`开始，以`/*`结束。当使用多行注释时，建议每一行前都加上一个*号，这样可以快速的知道内容是在注释中，如下

```cpp
/*
 * This is a comment
 * This is also a comment
/*
```

### Comment Paris Do Not Nest

多行注释不支持嵌套，如下面这样写，最后一行的`*/`不会被认为是注释，因为在上一行的嵌套注释中，已经出现了`*/`,所以编辑器会认为注释在上一行已经结束。

```cpp
/*
 * This is a comment
 * This is also a comment
 * /* Want to nest */
/*
```

对于代码块，即使是需要注释多行，也建议通过多次使用单行注释来实现。因为很可能出现想要注释一大段代码时，其中的一部分已经被注释过了，那么如果都使用多行注释的话，就会出现嵌套。

## Flow of Control

### The while Statement

与C类似

### The for Statement

与C类似

### Reading an Unknown Number of Inputs

如有代码

```cpp
while(std::cin >> value)
    sum += value;
```

当使用istream作为循环的判断条件时，如果stream是合法的，则循环将继续，否则循环结束。在istream中，如果遇到了`end-of-file`（不同操作系统定义不同）或者非法输入（将字符串赋值给int变量）则认为stream是非法的。

在Windows系统下，通过ctrl+z键入`end-of-file`，在Unix系统中，通常是通过control+d。

在C++程序中通常会遇到以下的语法错误：

1. Syntax errors: 由操作符方面的错误造成，如少了操作符，没有写;符号等。

2. Type errors: 赋值过程不符合值的类型定义
   
3. Declaration errors: 使用变量前未定义该变量

最好是按报错误的顺序来修复错误，因为一个错误的发生可能会导致一系列错误的发生，在很多情况下修复了一个错误，后续的一系列错误将自动消失。

### The if Statement

与C类似。

在c++中，`=`和`==`操作符都可以作为判断条件，所以编程时需要注意，不要误输入错误的操作符。

c++基本上是`free-format`语言，即语言编译过程并不会在意大括号，缩进，注释，换行这些信息的位置。

## Introducing Classes

一个类定义一系列与这个类型相关的操作。

通常类的定义放在`.h`文件中，文件的名字与其中的类名字相同。也有程序员会使用`.H`，`.hpp`，`.hxx`来表示头文件，编译器通常不会在意文件后缀名，但是IDE有时会。

标准库的头文件，在调用时文件名放在`< >`中，不是库的头文件调用时文件名放在`" "`中

如果需要避免每次调试时都手动在窗口中输出信息，可以使用文件重定向（File Redirection）

如通过g++编译出的程序名为a.exe，可以在命令行中通过下列命令实现文件重定向

```command
/a.exe < input.txt > output.txt
```

该命令的意思是将Input.txt中的文件都作为`cin`的输入数据，`cout`的输出数据都写入到output.txt中，这里的`<`和`>`即为文件重定向符。如其他Unix命令一样，输出时的`>`表示会覆盖原文件的内容，如果想要追加内容，则通过`>>`操作符即可。


{% note primary %}

引用：

1. *Cpp Primer* 5th Aug.2012

{% endnote %}

***