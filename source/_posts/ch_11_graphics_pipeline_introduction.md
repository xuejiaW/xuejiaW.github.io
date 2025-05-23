---
created: 2022-08-23
updated: 2025-04-13
tags:
  - Vulkan
date: 2025-04-13 11:44
published: true
title: 《Vulkan Tutorial》 笔记 11：图形管线介绍
description: Vulkan 中需要自己设定图形渲染管线，在一些旧的图形 API 如 OpenGL 中，时可以通过一些函数修改渲染管线的，如通过 `glBlendFunc` 修改管线中对于混合的操作。但在 Vulkan 中管线几乎是完全不变的，因此每当需要修改管线设置，就必须重新创建管线。
---

{% note info %}
本部分结果可参考 [11_Graphics_Pipeline_Introduction](https://github.com/xuejiaW/LearnVulkan/tree/main/_11_Graphics_Pipeline_Introduction)
{% endnote %}

Vulkan 中需要自己设定 渲染管线，在一些旧的图形 API 如 OpenGL 中，时可以通过一些函数修改渲染管线的，如通过 `glBlendFunc` 修改管线中对于混合的操作。但在 Vulkan 中管线几乎是完全不变的，因此每当需要修改管线设置，就必须重新创建管线。

这样的坏处在于，开发者必须创建一系列的管线来处理各种想要的渲染操作，好处在于因为管线固定的，驱动做优化的空间也就更大。例如如果只是绘制简单的几何图形，就可以关闭 `Tessellation/Geometry stage`。

在程序中，可以定义类 `GraphicsPipelineMgr` 和函数 `createGraphicsPipeline`：
```cpp
class GraphicsPipelineMgr
{
public:
    static void createGraphicsPipeline();
};
```

在 `HelloTriangleApplication::initVulkan` 中调用 `createGraphicsPipeline`：

```cpp
void HelloTriangleApplication::initVulkan()
{
    // ...

    GraphicsPipelineMgr::createGraphicsPipeline();
}
```

在后续的章节中，我们将逐步完善 `createGraphicsPipeline` 函数，最终实现一个完整的渲染管线。
- [Ch 12 Shader Modules](/ch_12_shader_modules)：介绍了如何创建和管理 VkShaderModule，即如何将编译好的 SPIR-V 着色器字节码加载到 Vulkan，并封装为 Shader Module。还讲解了如何将 Shader Module 绑定到渲染管线的各个可编程阶段（如顶点和片元着色器）。
- [Ch 13 Fixed Functions](/ch_13_fixed_functions)：讲解了渲染管线中各类固定功能阶段（Fixed Functions）的配置，包括顶点输入（Vertex Input）、输入装配（Input Assembly）、视口与裁剪（Viewport & Scissor）、光栅化（Rasterization）、多重采样（Multisampling）、颜色混合（Color Blending）、动态状态（Dynamic State）等，以及如何创建和管理 VkPipelineLayout。
- [Ch 14 Render Passes](/ch_14_render_passes)：介绍了如何创建和配置 VkRenderPass，包括 Attachment、Subpass、Attachment Reference 的设置。Render Pass 用于描述渲染时 Framebuffer 的结构和渲染流程，是管线创建的重要依赖对象。
- [Ch 15 Conclusion](/ch_15_conclusion)：对前面各章节内容进行了整合，梳理了完整的渲染管线创建流程。总结了 Shader Stage、Fixed Functions、Pipeline Layout、Render Pass 等对象如何协同，最终通过 VkGraphicsPipelineCreateInfo 和 vkCreateGraphicsPipelines 创建出完整的 Graphics Pipeline，并说明了销毁流程。
