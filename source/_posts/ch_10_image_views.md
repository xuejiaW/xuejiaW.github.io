---
tags:
  - Vulkan
created: 2022-08-23
updated: 2025-04-13
date: 2025-04-13 11:30
published: true
title: 《Vulkan Tutorial》 笔记 10： Image Views
description: 为了使用在 Swap Chain 最后获取的 VkImage，需要首先创建 VkImageView 对象。该对象作为外部对这个 Image 的 View，即该对象描述了该如何访问 Image，以及需要访问 Image 的哪一部分。如可以创建一个 Image View，描述该 Image 应该作为一个 2D 深度纹理，且不需要任何的 Mipmap Level。
---

{% note info %}
本部分结果可参考 [10_ImageView](https://github.com/xuejiaW/LearnVulkan/tree/main/_10_ImageView)
{% endnote %}

{% note info %}
本章涉及到的关键对象和流程如下所示
![](/ch_10_image_views/ch_10_image_views.excalidraw.svg)
{% endnote %}

为了使用在 [Swap Chain](/ch_09_swap_chain) 最后获取的 `VkImage`，需要首先创建 `VkImageView` 对象。该对象作为外部对这个 Image 的 View，即该对象描述了该如何访问 Image，以及需要访问 Image 的哪一部分。例如，可以创建一个 Image View，描述该 Image 应该作为一个 2D 深度纹理，且不需要任何的 Mipmap Level。

{% note primary %}
`VkImage` 是实际的图像数据存储对象，代表了 GPU 内存中的一块用于存储图像数据的区域。`VkImage` 不能直接被渲染管线访问，必须通过 `VkImageView` 进行描述和访问。
`VkImageView` 是对 `VkImage` 的一个视图，它定义了如何访问 `VkImage` 中的数据，包括格式、维度、层级等信息。渲染管线通过绑定 `VkImageView` 来访问和操作 `VkImage` 中的数据。
每个 `VkImageView` 只能关联一个 `VkImage`，但一个 `VkImage` 可以有多个 `VkImageView`，每个 `VkImageView` 可以定义不同的访问方式。
{% endnote %}

在 `SwapChainMgr.h` 类成员中增加一个 `std::vector<VkImageView>` 对象用于存储创建的 `VkImageView`：
```cpp
class SwapChainMgr
{
public:
    // ...
    static void createImageViews();
    static void destroyImageViews();
    // ...
    static std::vector<VkImageView> imageViews;
};
```

并定义函数 `createImageViews` 用以创建该对象，对函数在 `initVulkan` 中访问。
```cpp
void HelloTriangleApplication::initVulkan()
{
    // ...
    SwapChainMgr::createSwapChain();
    SwapChainMgr::createImageViews();
}
```

需要创建的 `VkImageView` 与创建的 `VkImage` 数量相同。如同创建其他的对象，创建 `VkImageView` 需要填充 `VkImageViewCreateInfo` 结构体：
```cpp
void SwapChainMgr::createImageViews()
{
    imageViews.resize(images.size());

    for (size_t i = 0; i < images.size(); i++)
    {
        VkImageViewCreateInfo createInfo{};
        createInfo.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
        createInfo.image = images[i];
        createInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
        createInfo.format = imageFormat;
        createInfo.components.r = VK_COMPONENT_SWIZZLE_IDENTITY;
        createInfo.components.g = VK_COMPONENT_SWIZZLE_IDENTITY;
        createInfo.components.b = VK_COMPONENT_SWIZZLE_IDENTITY;
        createInfo.components.a = VK_COMPONENT_SWIZZLE_IDENTITY;
        createInfo.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
        createInfo.subresourceRange.baseMipLevel = 0;
        createInfo.subresourceRange.levelCount = 1;
        createInfo.subresourceRange.baseArrayLayer = 0;
        createInfo.subresourceRange.layerCount = 1;

        if (vkCreateImageView(LogicDevicesMgr::device, &createInfo, nullptr, &imageViews[i]) != VK_SUCCESS)
        {
            throw std::runtime_error("failed to create texture image view!");
        }
    }
}
```

`VkImageViewCreateInfo` 结构体说明：
- `sType` 和 `image`：指定结构体类型和要创建视图的目标 `VkImage`。
- `viewType`：指定视图类型，如 1D、2D、3D 或 cube map。
- `format`：视图的像素格式，通常与 swapchain 图像格式一致。
- `components`：指定每个色彩通道的映射方式。例如，可以将所有通道都设为 `VK_COMPONENT_SWIZZLE_R` 创建一个灰度图。这里全部设为 `VK_COMPONENT_SWIZZLE_IDENTITY`，表示不做通道重映射。
- `subresourceRange`：指定视图覆盖的 `VkImage` 区域。
  - `aspectMask`：指定访问的图像部分，如 `VK_IMAGE_ASPECT_COLOR_BIT`（颜色）、`VK_IMAGE_ASPECT_DEPTH_BIT`（深度）、`VK_IMAGE_ASPECT_STENCIL_BIT`（模板）。
  - `baseMipLevel` 和 `levelCount`：指定 Mipmap 的起始层级和层级数量。
  - `baseArrayLayer` 和 `layerCount`：指定数组层的起始和数量（如立方体贴图或多视图渲染）。

当 `VkImageViewCreateInfo` 填充完毕后，就可以通过 `vkCreateImageView` 创建 `VkImageView`。

与 `VkImage` 不同，`VkImageView` 需要手动销毁。应在程序结束时调用销毁函数：
```cpp
void HelloTriangleApplication::cleanup()
{
    SwapChainMgr::destroyImageViews();
    SwapChainMgr::destroySwapChain();
    // ...
}
```
销毁函数实现示例：
```cpp
void SwapChainMgr::destroyImageViews()
{
    for (auto imageView : imageViews)
    {
        vkDestroyImageView(LogicDevicesMgr::device, imageView, nullptr);
    }
    imageViews.clear();
}
```

