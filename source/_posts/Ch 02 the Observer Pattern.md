---
tags:
- 设计模式
updated: 2023-05-23
created: 2023-05-12
title: Head First 设计模式 - 观察者模式
published: true
description: 本篇来自于 《Head First Design Pattern》 第二章，介绍了观察者模式的定义及运用。
date: 2023-05-04
---

# 观察者模式

观察者模式（Observer Pattern）定义了一种一对多的依赖关系，当被观察者（`Subject`）的状态发生变化时，它将会通知观察者们（`Observers`）进行某种操作。

例如我们希望定义温度计和压力计，在天气信息发生变化时自动更新，而非自己反复的查询是否天气信息有发生变化。这里天气信息就是被观察者，而温度计和压力计就是观察者。

## 代码示例

### 观察者及被观察者接口

```cs 被观察者
public interface ISubject
{
    void RegisterObserver(IObserver observer);
    void UnregisterObserver(IObserver observer);
    void NotifyObservers();
}
```

```cs 观察者
public interface IObserver
{
    void Update(ISubject subject);
}
```

### 观察者实现

```cs 温度计
public class TemperatureObserver : IObserver
{
    private ISubject subject;
    public TemperatureObserver(ISubject subject)
    {
        this.subject = subject;
        this.subject.RegisterObserver(this);
    }

    public void Update(ISubject subject)
    {
        WeatherData weatherData = subject as WeatherData;

        //注意这里我们是从主动从被观察者那里去获取数据
        if (weatherData != null)
            Console.WriteLine("Temperature is " + weatherData.Temperature);
    }
}
```

```cs 压力计
public class PressureObserver : IObserver
{
    private ISubject subject;
    public PressureObserver(ISubject subject)
    {
        this.subject = subject;
        this.subject.RegisterObserver(this);
    }

    public void Update(ISubject subject)
    {
        WeatherData weatherData = subject as WeatherData;
        if (weatherData != null)
            Console.WriteLine("Pressure is " + weatherData.Pressure);
    }
}
```

### 被观察者实现

```cs 天气数据
public class WeatherData : ISubject
{
    private List<IObserver> observersList;

    public float Temperature { get; private set; }
    public float Humidity { get; private set; }
    public float Pressure { get; private set; }

    public WeatherData()
    {
        observersList = new List<IObserver>();
    }

    public void NotifyObservers()
    {
        observersList.ForEach(o => o.Update(this));
    }

    public void RegisterObserver(IObserver o)
    {
        observersList.Add(o);
    }

    public void UnregisterObserver(IObserver o)
    {
        observersList.Remove(o);
    }

    private void measurementsChanged()
    {
        NotifyObservers();
    }

    public void SetMeasurements(float temperature, float humidity, float pressure)
    {
        this.Temperature = temperature;
        this.Humidity = humidity;
        this.Pressure = pressure;
        measurementsChanged();
    }
}
```

### 测试及结果

```cs 测试代码
WeatherData weatherData = new WeatherData();
TemperatureObserver temperatureObserver = new TemperatureObserver(weatherData);
PressureObserver pressureObserver = new PressureObserver(weatherData);

weatherData.SetMeasurements(30, 20, 10);
weatherData.SetMeasurements(20, 40, 5);
weatherData.UnregisterObserver(temperatureObserver);
weatherData.SetMeasurements(10, 50, 15);
```

运行结果：

![观察者模式运行结果](/Ch%2002%20the%20Observer%20Pattern/2019-01-15-23-20-09.png)