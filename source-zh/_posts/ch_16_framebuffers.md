---
tags:
  - Vulkan
created: 2022-09-03
updated: 2025-05-05
date: 2025-04-25 20:38
published: true
title: 《Vulkan Tutorial》 笔记 16：FrameBuffers
description: 创建 用于封装一组图像视图（如颜色、深度等附件），作为渲染目标 的 FrameBuffer 对象，其需要与之前创建的 RenderPass 兼容。
---

{% note info %}
本部分结果可参考 [16_FrameBuffers](https://github.com/xuejiaW/LearnVulkan/tree/main/_16_FrameBuffers)
{% endnote %}

{% note info %}
本章涉及到的关键对象和流程如下所示
![](/ch_16_framebuffers/ch_16_framebuffers.excalidraw.svg)
{% endnote %}

在 [Ch 14 Render Passes](/ch_14_render_passes) 中我们已经创建了一个有着和 `swapChainImageFormat` 一样格式的 `colorAttachment` 的 `RenderPass`。

现在我们需要创建一个与和这个 `RenderPass` 所兼容的 `FrameBuffer`。Framebuffer 是一个包含了多个图像的集合，这些图像可以是颜色、深度或模板缓冲区。在我们的案例中，目前只有一个 Color Attachment。

{% note info %}
RenderPass 和 Framebuffer 是 **兼容** 的关系。在后续部分，你会看到在创建 `Framebuffer` 时需要传入 `RenderPass` 的句柄。这个 `RenderPass` 只是用来验证 `Framebuffer` 中的 Attachment 是否和 `RenderPass` 中的 Attachment 兼容，并不是绑定关系。实际上，只要 Framebuffer 的 attachment 配置（数量、格式、尺寸等）与其他 RenderPass 兼容，也可以与这些 RenderPass 一起使用。
{% endnote %}

Attachment 所使用的 Image，取决于 `swapChain` 的 Image。因此我们需要为 SwapChain 中的每一个 Image 都创建一个 Framebuffer。

创建类 `FrameBuffersMgr` 如下：

```cpp
class FrameBuffersMgr
{
public:
    static void createFramebuffers();
    static void destroyFramebuffers();
    static std::vector<VkFramebuffer> swapChainFramebuffers;
};
```

其中 `swapChainFramebuffers` 是一个 `std::vector<VkFramebuffer>`，用来存储每个 Framebuffer 的句柄，其中的每一个元素与 `swapChain` 中的 Image 一一对应。

`createFramebuffers` 函数的实现如下：

```cpp
void FrameBuffersMgr::createFramebuffers()
{
    swapChainFramebuffers.resize(SwapChainMgr::imageViews.size());

    for (size_t i = 0; i < SwapChainMgr::imageViews.size(); i++)
    {
        VkImageView attachments[] = {SwapChainMgr::imageViews[i]};
        VkFramebufferCreateInfo framebufferInfo = {};
        framebufferInfo.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
        framebufferInfo.renderPass = GraphicsPipelineMgr::renderPass;
        framebufferInfo.attachmentCount = 1;
        framebufferInfo.pAttachments = attachments;
        framebufferInfo.width = SwapChainMgr::imageExtent.width;
        framebufferInfo.height = SwapChainMgr::imageExtent.height;
        framebufferInfo.layers = 1;

        if (vkCreateFramebuffer(LogicDevicesMgr::device, &framebufferInfo, nullptr, &swapChainFramebuffers[i]) != VK_SUCCESS)
        {
            throw std::runtime_error("failed to create framebuffer");
        }
    }
}
```

`VkFramebufferCreateInfo` 的构造比较直观：
- `sType`：结构体类型
- `renderPass`：需要使用的 FrameBuffer 的 Render Pass
- `attachmentCount`：Attachment 的数量
- `pAttachments`：Attachment 的 Image View 数组
- `width`：Framebuffer 的宽度，即与绑定的 Image 的宽度相同
- `height`：Framebuffer 的高度，即绑定的 Image 的高度相同
- `layers`：Framebuffer 的层数，通常为 1，除非是 XR 应用

`destroyFramebuffers` 函数的实现如下：

```cpp
void FrameBuffersMgr::destroyFramebuffers()
{
    for (auto framebuffer : swapChainFramebuffers)
    {
        vkDestroyFramebuffer(LogicDevicesMgr::device, framebuffer, nullptr);
    }
}
```

在 `HelloTriangleApplication::initVulkan`  和 `HelloTriangleApplication::cleanupSwapChain` 中分别调用 `createFramebuffers` 和  `destroyFramebuffers`：

```cpp

void HelloTriangleApplication::initVulkan()
{
    // ...
    FrameBuffersMgr::createFramebuffers();
}


void HelloTriangleApplication::cleanupSwapChain()
{
    FrameBuffersMgr::destroyFramebuffers();
    // ...
}
```
