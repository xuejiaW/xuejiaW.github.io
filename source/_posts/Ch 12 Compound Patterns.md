---
tags:
    - 设计模式
created: 2022-02-02
updated: 2023-05-22
title: Head First 设计模式 - 复合模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第十二章，介绍了复合模式的定义及运用。
date: 2023-05-22
---

复合模式（Compound Pattern）是通过两个或以上的设计模式形成一个可以解决一般性问题的通用框架。

MVC 框架就是一种组合模式，`Controller`和`View`之间使用了策略模式， `View`中只存`Controller`的接口，进而达到可以随时切换不同`Controller`的目的。`Model`和`View`之间使用了观察者模式，`View`作为观察者，`Model`作为被观察者，当`Model`的数据发生变化时，`View`相应改变。而`View`本身使用了组合模式，比如按钮中可能存在子按钮，窗口中存在子窗口等等。

我们以音量调节作为一个最简的 MVC 框架示例。

## 代码示例

### 框架接口

```cs 观察者接口
public interface IVolumeObserver
{
    void VolumeUpdated();
}
```

```cs Model接口
public interface IVolumeModel
{
    int Volume { get; set; }
    void RegisterObserver(IVolumeObserver observer);
    void UnRegisterObserver(IVolumeObserver observer);
}
```

```cs Controller接口
public interface IViewController
{
    void VolumeUp();
    void VolumeDown();
    void SetVolume(int volume);
}
```

### 接口实现

```cs Model
public class VolumeModel : IVolumeModel
{
    private int volume = 0;
    public int Volume
    {
        get { return volume; }
        set
        {
            volume = value;
            observersList.ForEach(observer => observer.VolumeUpdated());
        }
    }
    private List<IVolumeObserver> observersList = null;

    public VolumeModel()
    {
        observersList = new List<IVolumeObserver>();
    }

    public void RegisterObserver(IVolumeObserver observer)
    {
        observersList.Add(observer);
    }

    public void UnRegisterObserver(IVolumeObserver observer)
    {
        observersList.Remove(observer);
    }
}
```

```cs View
public class VolumeView : IVolumeObserver
{
    private IViewController controller = null;
    private IVolumeModel model = null;

    public VolumeView(IViewController controller, IVolumeModel model)
    {
        this.controller = controller;
        this.model = model;
        this.model.RegisterObserver(this);
        Console.WriteLine("View: volume init is " + model.Volume);
    }

    public void OnVolumeUpButtonClick()
    {
        controller.VolumeUp();
    }

    public void OnVolumeDownButtonClick()
    {
        controller.VolumeDown();
    }

    public void VolumeUpdated()
    {
        Console.WriteLine("View: volume updated " + model.Volume);
    }

    ~VolumeView()
    {
        model.UnRegisterObserver(this);
    }
}
```

```cs Controller
public class VolumeController : IViewController
    {
        private VolumeModel model = null;
        public VolumeController(VolumeModel model)
        {
            this.model = model;
        }

        public void SetVolume(int volume)
        {
            model.Volume = volume;
        }

        public void VolumeDown()
        {
            --model.Volume;
        }

        public void VolumeUp()
        {
            ++model.Volume;
        }
    }
```

## 测试代码及结果

```cs 测试代码
VolumeModel model = new VolumeModel();
VolumeView view = new VolumeView(new VolumeController(model), model);
view.OnVolumeUpButtonClick();
view.OnVolumeUpButtonClick();
view.OnVolumeDownButtonClick();
```

运行结果：

![复合模式运行结果](/Ch%2012%20Compound%20Patterns/2019-02-07-15-53-23.png)
