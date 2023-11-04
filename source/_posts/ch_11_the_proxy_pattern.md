---
tags:
    - 设计模式
created: 2022-02-02
updated: 2023-10-26
title: 《Head First 设计模式》 Ch 11 代理模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第十一章，介绍了代理模式的定义及运用。
date: 2023-05-21
---

代理模式（Proxy Pattern）为对象提供一个代理进而控制对其的访问。

例如我们需要加载一张图片，但加载图片是个访问网络或 IO 的操作，我们不希望这个这个操作阻塞 UI 线程，于是我们可以定义一个代理来进行多线程的加载，并在加载完成后显示图片。

# 代码示例

## 抽象接口

```cs 图片接口
public interface Icon
{
    void PrintIconWidthAndHeight();
}
```

## 抽象接口实现

```cs 真实图片类
public class ImageIcon : Icon
{
    private int width, height;
    public ImageIcon()
    {
        Thread.Sleep(5000);//Pretend there is some hard work to load the image
        width = 800;
        height = 1000;
    }
    public void PrintIconWidthAndHeight()
    {
        Console.WriteLine(DateTime.Now.ToLongTimeString() + ": Width is " + width + ",height is " + height);
    }
}
```

```cs 代理图片类
public class ImageProxyIcon : Icon
{
    private ImageIcon icon = null;
    private bool isLoading = false;

    public ImageProxyIcon() { }

    public void PrintIconWidthAndHeight()
    {
        if (icon != null)
            icon.PrintIconWidthAndHeight();
        else if (!isLoading)
        {
            Console.WriteLine(DateTime.Now.ToLongTimeString() + ": Is Loading Image...");
            isLoading = true;
            new Thread(() =>
            {
                icon = new ImageIcon();
                icon.PrintIconWidthAndHeight();
            }).Start();
        }
    }
}
```

# 测试代码及结果

```cs 测试代码
ImageProxyIcon proxyIcon = new ImageProxyIcon();
proxyIcon.PrintIconWidthAndHeight();
```

运行结果：

![代理模式运行结果](/ch_11_the_proxy_pattern/2019-02-07-14-10-11.png)

{% note info %}
代理模式与装饰模式很像，不同的是装饰模式的目的是在原先的类外扩展某些功能，而代理模式只是控制原先类中某些接口的访问。例如上例子中，`ImageProxyIcon`并没有为`ImageIcon`拓展什么功能，只是用了多线程来访问访问其中的函数。
{% endnote %}
