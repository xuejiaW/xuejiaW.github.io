---
created: 2022-08-30
updated: 2025-09-01
tags:
  - Vulkan
date: 2025-04-20 20:38
publishStatus: published
title: 《Vulkan Tutorial》 笔记 14：Render Passes
description: 本章介绍了 Vulkan 中 Render Pass 的作用、关键结构体及其创建流程，讲解了如何描述和管理渲染过程中的附件与子通道，为后续渲染管线的搭建打下基础。
---

{% note info %}
本部分结果可参考 [14_Render_Passes](https://github.com/xuejiaW/LearnVulkan/tree/main/_14_Render_passes)
{% endnote %}

{% note info %}
本章涉及到的关键对象和流程如下所示
![](/ch_14_render_passes/renderpasses.excalidraw.svg)
{% endnote %}


在设置完 [Fixed functions](/ch_13_fixed_functions) 后，在完成创建 Pipeline 时最后依赖的就是 Render Pass。开发者需要告诉 Vulkan 在渲染时需要使用的 Framebuffer Attachments，以及每个 Framebuffer 有多少个 Color / Depth Buffer，需要有多少次采样点（MSAA）等等信息，这些信息都会封装在 `Render Pass` 中。

为创建 Render Pass，在 `GraphicsPipelineMgr` 中增加函数 `createRenderPass` 和 `destroyRenderPass`，在 `HelloTriangleApplication` 的 `initVulkan` 和 `cleanup` 中分别调用这两个函数：

```cpp

class GraphicsPipelineMgr
{
public:
    // ...

    static void createRenderPass();
    static void destroyRenderPass();

    static VkRenderPass renderPass;

    // ...
};


void HelloTriangleApplication::initVulkan()
{
    // ...

    GraphicsPipelineMgr::createRenderPass();
    GraphicsPipelineMgr::createGraphicsPipeline("Shaders/TriangleVert.spv",
                                                "Shaders/TriangleFrag.spv");
}

void HelloTriangleApplication::cleanup()
{
    GraphicsPipelineMgr::destroyPipelineLayout();
    GraphicsPipelineMgr::destroyRenderPass();
    // ...
}
```

# Attachment Description

在 `createRenderPass` 中首先需要创建 `VkAttachmentDescription` 对象，表示 Framebuffer 中的 Attachment。Framebuffer 中的 Attachment 可以是 Color Buffer / Depth Buffer / Stencil Buffer 等等。目前仅需创建一个 Color Attachment，用于输出到 Swap Chain：
```cpp
void GraphicsPipelineMgr::createRenderPass()
{
    VkAttachmentDescription colorAttachment{};
    colorAttachment.format = SwapChainMgr::imageFormat;
    colorAttachment.samples = VK_SAMPLE_COUNT_1_BIT;
    colorAttachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
    colorAttachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
    colorAttachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
    colorAttachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
    colorAttachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
    colorAttachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

    // ...
}
```

- Color Attachment 的格式与创建的 SwapChain 中的 Image 格式相同
- 目前因为未开启 MSAA，因此 `samples` 的类型为 `VK_SAMPLE_COUNT_1_BIT`。
- `loadOp` 设定在渲染前，该如何对待 Framebuffer 中已有的数据：
    - `VK_ATTACHMENT_LOAD_OP_CLEAR`：清空已有的数据
    - `VK_ATTACHMENT_LOAD_OP_DONT_CARE`：对如何处理已有数据的行为是未定义的，因为并不关心这些数据
    - `VK_ATTACHMENT_LOAD_OP_LOAD`：保留并加载已有的数据（如需要保留上一次渲染结果时使用）
- `storeOp` 设定渲染后，该如何对待渲染的结果数据，可能的选项为：
    - `VK_ATTACHMENT_STORE_OP_STORE`：渲染的结果数据会存储在内存中，并在后续读取
    - `VK_ATTACHMENT_STORE_OP_DONT_CARE`：对如何处理渲染结果数据的行为是未定义的
- 因为`loadOp` 及 `storeOp` 只设定 Color 和 Depth 的数据，因此还需要 `stencilLoadOp` 和 `stencilStoreOp` 设定 Stencil 数据。
- `initialLayout` 和 `finalLayout` 用于设定 Image 的 Layout
    - Vulkan 中都通过 `VkImage` 表示 Textures 和 Framebuffers，可以根据使用 VkImage 的目的来修改内存中像素的 Layout，比较常用的可选参数为：
        - `VK_IMAGE_LAYOUT_UNDEFINED`：Image 的初始内容不重要，可能会被丢弃
        - `VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL`：Image 会用于 Color Attachment
        - `VK_IMAGE_LAYOUT_PRESENT_SRC_KHR`：Image 会用于作为 Swap Chain 的 Presentation Source
        - `VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL`：Image 会作为内存拷贝的目的地
    - `initialLayout` 表示渲染前 Image 的 Layout，因为这里将 `loadOp` 设定为 `VK_ATTACHMENT_LOAD_OP_CLEAR`，即每次渲染前都会清空 Image 数据，所以这里并不关心 Layout，设定为 `VK_IMAGE_LAYOUT_UNDEFINED`
    - `finalLayout` 表示渲染后 Image 的 Layout，这里因为最终图像用于 Swap Chain 的 Present，所以选为 `VK_IMAGE_LAYOUT_PRESENT_SRC_KHR`。

{% note info %}
关于 Layout 的配置项，会在后续的 Texture 章节中进一步介绍。
{% endnote %}

# Subpasses and attachment references

一个 RenderPass 可以包含多个 Subpasses，Subpass 是一系列依赖于之前 pass 执行后 Framebuffer 内容的渲染操作。如有一系列的后处理，每一个后处理都依赖于前一个处理的结果。

当把一系列的 Subpasses 封装在一个 Renderpass 中后，Vulkan 可以重新排列这些 Subpasses 或节省带宽以获得最好的性能。

对于每一个 Subpass，它都可以引用一个或多个 Attachment。通过结构体 `VkAttachmentReference` 表示 Attachment Reference，如下：
```cpp
void GraphicsPipelineMgr::createRenderPass()
{
    ///
    VkAttachmentReference colorAttachmentRef{};
    colorAttachmentRef.attachment = 0;
    colorAttachmentRef.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;
}
```

其中：
- `attachment` 表示定义的一系列 Attachments 中需要引用的 Attachment 的 Index 值，因为之前只定义了一个 `VkAttachmentDescription`，因此这里引用第一个，设为 0。
- `layout` 设定 Attachment 在被 Subpass 使用时希望的 Layout。Vulkan 会在 Subpass 启动时自动的将 Attachment 转换到设定的 Layout。这里希望在 Subpass
运行时将 Attachment 作为 Color Buffer，因此设定为 `VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL`。

创建完 Attachment Reference 后，即可创建 Subpass：
```cpp
void GraphicsPipelineMgr::createRenderPass()
{
    // ...
    VkSubpassDescription subpass{};
    subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
    subpass.colorAttachmentCount = 1;
    subpass.pColorAttachments = &colorAttachmentRef;
}
```

其中：
- `pipelineBindPoint` 表示 Subpass 在管线中的绑定点，这里是用于渲染的，所以作为 GRAPHICS，在 Vulkan 的规划中还会支持 Compute Subpass。
- `pColorAttachments` 表示 Subpass 引用的 Color Attachment，除了 Color Attachment，还可以依赖：
    - `pInputAttachments`：从 Shader 中读取的 Attachment
    - `pResolveAttachments`：用于 MSAA 的 Color Attachment
    - `pDepthStencilAttachment`：表示 Depth 和 Stencil 的 Attachment
    - `pPreserveAttachments`：这些 attachment 在本 subpass 不被访问，但其内容需要在后续 subpass 保持不变

# Render Pass

最后装填结构体 `VkRenderPassCreateInfo` 创建 RenderPass：
```cpp
void GraphicsPipelineMgr::createRenderPass()
{
    // ...

    VkRenderPassCreateInfo renderPassInfo{};
    renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
    renderPassInfo.attachmentCount = 1;
    renderPassInfo.pAttachments = &colorAttachment;
    renderPassInfo.subpassCount = 1;
    renderPassInfo.pSubpasses = &subpass;

    if (vkCreateRenderPass(LogicDevicesMgr::device, &renderPassInfo, nullptr, &renderPass) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to create render pass!");
    }
}
```

`destroyRenderPass` 函数中即调用 `vkDestroyRenderPass` 销毁 Render Pass。
```cpp
void GraphicsPipelineMgr::destroyRenderPass()
{
    vkDestroyRenderPass(LogicDevicesMgr::device, renderPass, nullptr);
}
```
