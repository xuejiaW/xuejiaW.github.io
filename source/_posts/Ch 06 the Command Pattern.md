---
tags:
    - 设计模式
created: 2023-05-16
updated: 2023-05-21
title: Head First 设计模式 - 命令模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第六章，介绍了命令模式的定义及运用。
date: 2023-05-17
---

命令模式（Command Pattern）将一个请求封装为一个对象，进而将拥有不同的请求的物体参数化，并且还可以请求排队，打印请求日志，支持可逆操作。

命令模式由抽象命令类、具体命令类、接受者、调用者、客户类，五部分组成。其中接受者为被命令封装的类，调用者存放需要执行的类。

我们以一个远程控制装置作为例子，远程控制装置有两个按钮和一个撤回按钮。我们通过命令模式来将远程控制类与具体需要做的操作（如开灯）解耦。在例子中程序入口即为客户端，远程装置为调用者，灯为接受者，有开灯与关灯两个命令

## 代码示例

### 抽象命令类及实现

```cs 抽象命令类
public interface Command
{
    void Execute();
    void Undo();
}
```

```cs 命令类实现
public class LightOffCommand : Command
{
    private Light light;
    public LightOffCommand(Light light)
    {
        this.light = light;
    }
    public void Execute()
    {
        light.Off();
    }

    public void Undo()
    {
        light.On();
    }
}

public class LightOnCommand : Command
{
    private Light light;
    public LightOnCommand(Light light)
    {
        this.light = light;
    }
    public void Execute()
    {
        light.On();
    }

    public void Undo()
    {
        light.Off();
    }
}

public class NoCommand : Command
{
    public void Execute()
    {
        Console.WriteLine("No command execute");
    }

    public void Undo()
    {
        Console.WriteLine("No command undo");
    }
}
```

### 接受者

```cs 灯
public class Light
{
    public void On()
    {
        Console.WriteLine("The light is on");
    }

    public void Off()
    {
        Console.WriteLine("The light is off");
    }
}
```

### 调用者

```cs 远程控制
class RemoteControl
{
    Command[] commands;
    Command lastCommond;

    public RemoteControl()
    {
        commands = new Command[2] { new NoCommand(), new NoCommand() };
        lastCommond = new NoCommand();
    }

    public void SetCommand(int index, Command command)
    {
        commands[index] = command;
    }

    public void OnButtonClick(int index)
    {
        commands[index].Execute();
        lastCommond = commands[index];
    }

    public void OnClickUndo()
    {
        lastCommond.Undo();
        lastCommond = new NoCommand();
    }
}
```

### 客户类

```cs 函数入口
static void Main(string[] args)
{
    Light light = new Light();
    RemoteControl remoteControl = new RemoteControl();
    remoteControl.SetCommand(0, new LightOnCommand(light));
    remoteControl.SetCommand(1, new LightOffCommand(light));
    remoteControl.OnButtonClick(0);
    remoteControl.OnButtonClick(1);
    remoteControl.OnClickUndo();
}
```

## 测试及结果

运行结果：

![命令模式测试结果](/Ch%2006%20the%20Command%20Pattern/2019-02-02-23-26-25.png)
