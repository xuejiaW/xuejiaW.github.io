---
created: 2022-02-17
updated: 2025-04-06
tags:
  - Vulkan
Author:
  - Khronos Group
Cover: https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Vulkan_API_logo.svg/1200px-Vulkan_API_logo.svg.png
ISBN: 
date: 2025-03-29 13:40
published: true
title: 《Vulkan Tutorial》 学习笔记汇总
---

# 准备

[Ch 00 Introduction](/ch_00_introduction)：简单的介绍 Vulkan API 的背景和设计目标。

[Ch 01 Overview](/ch_01_overview)：介绍 Vulkan 和它的优点，以及绘制一个三角形所需要的步骤和其中设计的部分概念，同时也介绍了 Vulkan API 的约束。

[Ch 02 Development environment](/ch_02_development_environment)：介绍如何配置一个 Vulkan 的开发环境，在本章的结束可以运行一个空窗口的应用，其中查询并打印设备支持的拓展数量。

# Drawing a triangle

## Setup

[Ch 03 Base Code](/ch_03_base_code)：绘制一个三角形的基本代码结构，定义了 `HelloTriangleApplication` 类的基本结构，包含了 `initVulkan` / `mainLoop` / `cleanup` 等函数。
[Ch 04 Instance](/ch_04_instance)：创建一个 Vulkan 的 Instance，Instance 是应用与 Vulkan 库的连接，在创建过程中会有相应的操作告知 Driver 你的应用的一些细节。
[Ch 05 Validation Layers](/ch_05_validation_layers)：Validation Layer 是 Vulkan 的一个调试工具，它会在运行时检查 API 调用的正确性，帮助开发者发现潜在的错误。
[Ch 06 Physical devices and queue families](/ch_06_physical_devices_and_queue_families): 选择符合要求的物理设备和 Queue Family，物理设备是 Vulkan 的一个重要概念，它表示了一个支持 Vulkan 的 GPU 设备，Queue Family 则是物理设备的一个属性，表示了该设备支持的命令队列类型。
Ch 07 Logical device and queues

## Presentation

Ch 08 Window Surface
Ch 09 Swap Chain
Ch 10 Image views

## Graphics pipeline basics

Ch 11 Introduction
Ch 12 Shader Modules
Ch 13 Fixed Functions
Ch 14 Render Passes
Ch 15 Conclusion

## Drawing


# Reference

1. https://vulkan-tutorial.com/

[Understanding Vulkan® Objects - AMD GPUOpen](https://gpuopen.com/learn/understanding-vulkan-objects/)：Vulkan 中各关系的示意图
[GitHub - David-DiGioia/vulkan-diagrams: Diagrams showing relationships between Vulkan objects and how they're used.](https://github.com/David-DiGioia/vulkan-diagrams?tab=readme-ov-file)：另一个看上去更详细的关于 Vulkan 中 Object 的关系示意图
