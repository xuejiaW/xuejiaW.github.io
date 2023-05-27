---
tags:
- 设计模式
created: 2023-05-15
updated: 2023-05-27
title: 《Head First 设计模式》 Ch 05 单例模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第五章，介绍了单例模式的定义及运用。
date: 2023-05-07
---

单例模式(Singleton Pattern)可能是最简单，也是被应用最为广泛的设计模式。单例模式保证一个类只会存在一个实例，并且提供了一个公共的接口来访问该实例。

## 代码示例

```cs 单例模式
public class Singleton
{
    private static object lockObj = new object();
    private static Singleton instance = null;

    public static Singleton Instance
    {
        get
        {
            if (instance == null)
            {
                lock (lockObj)
                    if (instance == null)
                        instance = new Singleton();
            }
            return instance;
        }
    }

    private Singleton()
    {
        Console.WriteLine("Constructor the Singleton");
    }
}
```

这里使用一个`lockObj`是为了保证多线程安全，如果有多个线程在同一时间第一次调用`Instance`，则可能存在两个线程都进入了`instance == null`的分支，这就会造成两次实例化，所以我们需要通过加锁来保证线程安全。但如果我们将锁直接加在第一个`If`外，则每次调用`Instance`都有一个加锁的过程，所以这里选择在第一个 If 内加锁，锁内再次检查保证只会有一次实例化。