---
created: 2022-09-03
updated: 2025-09-01
tags:
  - Vulkan
publishStatus: published
date: 2025-04-23 20:38
title: 《Vulkan Tutorial》 笔记 15：Pipeline Conclusion
description: 本章将介绍如何将之前的章节中创建的对象组合在一起，创建出一个完整的渲染管线。
---

{% note info %}
本部分结果可参考 [15_Pipeline_Conclusion](https://github.com/xuejiaW/LearnVulkan/tree/main/_15_Pipeline_Conclusion)
{% endnote %}

{% note info %}
本章涉及到的关键对象和流程如下所示
![](/ch_15_conclusion/conclusion.excalidraw.svg)
{% endnote %}


当完成之前章节后，就可以创建 Graphics Pipeline 了，在上述章节中，已经创建了渲染管线依赖的数据：
- [Shader Stage](/ch_12_shader_modules/#Shader_Stage_Creation) ：用来表示渲染管线中可编程阶段的 Shader Module
- [Fixed functions](/ch_13_fixed_functions) ：定义渲染管线中的固定部分， [Input Assembly](/ch_13_fixed_functions/#Input_Assembly) ， [Rasterizer](/ch_13_fixed_functions/#Rasterizer) ， [Viewports and scissors](/ch_13_fixed_functions/#Viewports_and_scissors) ， [Color Blending](/ch_13_fixed_functions/#Color_Blending) 。
- [Pipeline layout](/ch_13_fixed_functions/#Pipeline_layout) ：渲染管线绘制时需要传递给 Shader 的 Uniform 对象
- [Render Passes](/ch_14_render_passes) ：渲染管线中需要使用的 Render Pass 对象，告知渲染时需要使用的 Framebuffer Attachments。

# 整理代码

在这里，我们首先整理 `GraphicsPipelineMgr` 中的成员变量，将 Pipeline Layout 的创建封装在新函数 `createPipelineLayout` 中，同时将 `createRenderPass` 和 `destroyRenderPass` 和 `destroyPipelineLayout` 等函数作为 `private` 函数。同时增加成员变量 `VkPipeline graphicsPipeline` 来保存创建的 Graphics Pipeline 对象，最终的 `GraphicsPipelineMgr` 类如下：

```cpp
class GraphicsPipelineMgr
{
public:
    static void createGraphicsPipeline(const std::string& vertFileName, const std::string& fragFileName);
    static void destroyGraphicsPipeline();

    static VkPipeline graphicsPipeline;
    static VkRenderPass renderPass;
    static VkPipelineLayout pipelineLayout;

private:
    static void destroyRenderPass();
    static void destroyPipelineLayout();
    static void createRenderPass();
    static void createPipelineLayout();
    // ......
}
```

修改 `createGraphicsPipeline` 函数，增加 `createPipelineLayout` 和 `createRenderPass` 的调用：
```cpp
void GraphicsPipelineMgr::createGraphicsPipeline(const std::string& vertFileName, const std::string& fragFileName)
{
    createRenderPass();
    createPipelineLayout();
    // ....
}
```

# 创建 Graphics Pipeline


创建 GraphicsPipeline 同样需要先创建对应的 Structure `VkGraphicsPipelineCreateInfo`，流程如下：
```cpp
void GraphicsPipelineMgr::createGraphicsPipeline(const std::string& vertFileName, const std::string& fragFileName)
{
    // ...
    VkGraphicsPipelineCreateInfo pipelineCreateInfo{};
    pipelineCreateInfo.sType = VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO;
    pipelineCreateInfo.stageCount = 2;
    pipelineCreateInfo.pStages = shaderStages;
    pipelineCreateInfo.pVertexInputState = &vertexInputInfo;
    pipelineCreateInfo.pInputAssemblyState = &inputAssembly;
    pipelineCreateInfo.pViewportState = &viewportState;
    pipelineCreateInfo.pRasterizationState = &rasterizer;
    pipelineCreateInfo.pMultisampleState = &multisampling;
    pipelineCreateInfo.pDepthStencilState = nullptr;
    pipelineCreateInfo.pColorBlendState = &colorBlending;
    pipelineCreateInfo.pDynamicState = nullptr;
    pipelineCreateInfo.layout = pipelineLayout;
    pipelineCreateInfo.renderPass = renderPass;
    pipelineCreateInfo.subpass = 0;
    pipelineCreateInfo.basePipelineHandle = VK_NULL_HANDLE;
    pipelineCreateInfo.basePipelineIndex = -1;

    // ...
}
```

其中绝大部分对象都是引用之前创建的对象，除了 `subpass` 指的是需要使用的 Subpass Index。`basePipelineHandle` 和 `basePipelineIndex` 用于指定创建 GraphicsPipeline 时的基类，Vulkan 考虑到可能大部分的渲染管线的设置是雷同的，所以提供了通过基类来创建管线的方式。

当填充完 `VkGraphicsPipelineCreateInfo` 后，即可通过 `vkCreateGraphicsPipelines` 真正执行创建的操作：
```cpp
void GraphicsPipelineMgr::createGraphicsPipeline(const std::string& vertFileName, const std::string& fragFileName)
{
    // ...

    if (vkCreateGraphicsPipelines(device, VK_NULL_HANDLE, 1, &pipelineCreateInfo, nullptr, &graphicsPipeline) != VK_SUCCESS)
        throw std::runtime_error("failed to create graphics pipeline");
    // ...
}
```

`vkCreateGraphicsPipelines` 比通常的创建函数多了一些参数，其中第二个参数表示 `VkPipelineCache`。这是 Vulkan 提供的另一个加速管线创建的机制。在创建过程中，可以将部分数据存储在 `VkPipelineCache` 中供之后复用。在这里，教程暂时没有使用这样的机制。

最后当程序结束的阶段，需要在 `cleanup` 中调用 `vkDestroyPipeline` 销毁创建的管线：
```cpp
void GraphicsPipelineMgr::destroyGraphicsPipeline()
{
    vkDestroyPipeline(LogicDevicesMgr::device, graphicsPipeline, nullptr);
    destroyPipelineLayout();
    destroyRenderPass();
}
```

