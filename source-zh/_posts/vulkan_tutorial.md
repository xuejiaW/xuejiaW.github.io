---
created: 2022-02-17
updated: 2025-09-01
tags:
  - Vulkan
Author:
  - Khronos Group
Cover: "[[Vulkan Tutorial.png]]"
ISBN:
date: 2025-03-29 13:40
publishStatus: published
title: 《Vulkan Tutorial》 学习笔记汇总
descriptrion: Vulkan 的学习指南，
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
[Ch 07 Logical device and queues](/ch_07_logical_device_and_queues)：创建 Logical Device（`VkDevice`）与 Physical Devices （`VkPhysicalDevice`）交互，创建出 Logical Device 后可以通过它来创建 Queue（`VkQueue`），Queue 是 Vulkan 中执行命令的基本单元。
## Presentation

[Ch 08 Window Surface](/ch_08_window_surface)：创建 Surface 用于建立 Vulkan 和 Window 系统之间的连接，Surface 是对于系统中的窗口或显示设备的抽象，应用通过与 Surface 的交互来实现与系统窗口的访问。通过创建好的 Surface 来查询可以正确处理 Presentation 的 Queue Family 和 并创建 Present Queue。
[Ch 09 Swap Chain](/ch_09_swap_chain)：在 Vulkan 中必须显式的创建 Swap Chain。SwapChain 是与 Surface 绑定的数据结构，其包含了多个 Image，应用渲染时会将渲染的结果放置到这些 Image 中，当调用 Present 时，SwapChain 会将这些 Image 通过其与 Surface 绑定，传递给 Surface，Surface 再将这些 Image 显示到平台的窗口或屏幕上。
[Ch 10 Image Views](/ch_10_image_views)：为了使用在 Swap Chain 最后获取的 VkImage，需要首先创建 VkImageView 对象。该对象作为外部对这个 Image 的 View，即该对象描述了该如何访问 Image，以及需要访问 Image 的哪一部分。

## Graphics pipeline basics

[Ch 11 Graphics Pipeline Introduction](/ch_11_graphics_pipeline_introduction)：Vulkan 中需要自己设定图形渲染管线，在一些旧的图形 API 如 OpenGL 中，时可以通过一些函数修改渲染管线的，如通过 `glBlendFunc` 修改管线中对于混合的操作。但在 Vulkan 中管线几乎是完全不变的，因此每当需要修改管线设置，就必须重新创建管线
[Ch 12 Shader Modules](/ch_12_shader_modules)：VkShaderModule 类用以封装和管理已编译好的着色器代码，本节将说明如何创建 Shader Module，以及如何将其传递给渲染管线的特定阶段。
[Ch 13 Fixed Functions](/ch_13_fixed_functions)：在这一节中，会设定创建 Pipeline 中除了 Shader Modules 剩下的固定函数的一些操作，如 Viewport Size / Color Blending 模式，这些在 Vulklan 中都需要在创建渲染管线时设定
[Ch 14 Render Passes](/ch_14_render_passes)：本章介绍了 Vulkan 中 Render Pass 的作用、关键结构体及其创建流程，讲解了如何描述和管理渲染过程中的附件与子通道，为后续渲染管线的搭建打下基础。
[Ch 15 Conclusion](/ch_15_conclusion)：本章将介绍如何将之前的章节中创建的对象组合在一起，创建出一个完整的渲染管线。

## Drawing

[Ch 16 Framebuffers](/ch_16_framebuffers):  创建 FrameBuffer 对象，FrameBuffer 在 Vulkan 中用于封装一组图像视图（如颜色、深度等附件），作为渲染目标，其需要与之前创建的 RenderPass 兼容。
[Ch 17 Command Buffers](/ch_17_command_buffers)：Vulkan 中的命令（如绘制操作和内存传输）并不是通过函数调用直接执行的。开发者必须将所有想要执行的操作记录（Record）在 Command Buffer 对象中。目前我们已经创建了绘制三角形所需要的绝大部分对象，因此可以开始通过 Command Buffer 来记录绘制三角形的命令了。
[Ch 18 Rendering And Presentation](/ch_18_rendering_and_presentation)：本章描述了最终渲染三角形和将其显示到屏幕上的过程，在其中需要创建信号量（Semaphore）和栅栏（Fence）实现 CPU 与 GPU 及队列间的同步，确保渲染流程各阶段正确有序地执行和呈现
[Ch 19 Frame in Flight](/ch_19_frame_in_flight): 对渲染循环进行改进，通过创建多个 Command Buffer 和信号量来实现多帧渲染，允许 CPU 和 GPU 同时工作，避免 CPU 在 GPU 渲染时处于空闲状态。
Ch 20 Swap chain recreation: 

# Vertex Buffers

Ch 21 Vertex Input Description And Buffer Creation

Ch 22 Staging Buffer

Ch 23 Index Buffer

# Uniform Buffers

Ch 24 Uniform Buffers

# Images

Ch 25 Images
Ch 26 Image View And Sampler


# Reference

1. https://vulkan-tutorial.com/

[Understanding Vulkan® Objects - AMD GPUOpen](https://gpuopen.com/learn/understanding-vulkan-objects/)：Vulkan 中各关系的示意图
[GitHub - David-DiGioia/vulkan-diagrams: Diagrams showing relationships between Vulkan objects and how they're used.](https://github.com/David-DiGioia/vulkan-diagrams?tab=readme-ov-file)：另一个看上去更详细的关于 Vulkan 中 Object 的关系示意图
