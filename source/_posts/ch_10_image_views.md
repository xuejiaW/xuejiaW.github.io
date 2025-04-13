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

为了使用在 [Swap Chain](/ch_09_swap_chain) 最后获取的 `VkImage`，需要首先创建 `VkImageView` 对象。该对象作为外部对这个 Image 的 View，即该对象描述了该如何访问 Image，以及需要访问 Image 的哪一部分。如可以创建一个 Image View，描述该 Image 应该作为一个 2D 深度纹理，且不需要任何的 Mipmap Level。

{% note primary %}
`VKImage` 是实际的图像数据存储对象，代表了 GPU 内存中的一块用于存储图像数据的区域，它无法被渲染管线直接访问。
`VKImageView` 是对 `VKImage` 的一个视图，它定义了如何访问 `VKImage` 中的数据，包括格式、维度、层级等信息。渲染管线可以通过 `VKImageView` 来访问和操作 `VKImage` 中的数据。
每个 `VkImageView` 只能访问一个 `VkImage`，但一个 `VkImage` 可以有多个 `VkImageView`，每个 `VkImageView` 可以定义不同的访问方式。
{% endnote %}


在 `SwapChainMgr.h` 类成员中增加 一个 `std::vector<VkImageView>` 对象用于存储创建的 `VkImageView`：
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

需要创建的 `VkImageView` 与创建的 `VkImage` 数量相同。如同创建其他的对象，创建 `VkImageView` 需要填充 `VkImageViewCreateInfo` 对象：
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

`VkImageViewCreateInfo` 中 `sType` 和 `image` 很符合直觉，其他对象：
- `viewType`：指定纹理该如何对待，如 1D textures，2D textures 或 cube maps。
- `format`：SwapChain 中 Image 的格式
- `component`：指定每个色彩通道该如何处理，如可以将所有的通道都设为 `VK_COMPONENT_SWIZZLE_R` 创建一个黑白图。这里不做额外处理，即将每个通道类型填为 `VK_COMPONENT_SWIZZLE_IDENTITY`。
- `subresourceRange`：指定 Image 的使用目的和 Image 的哪一部分需要被访问。
  - `aspectMask`：指定访问的 Image 的哪一部分，如 `VK_IMAGE_ASPECT_COLOR_BIT` 表示访问颜色数据，`VK_IMAGE_ASPECT_DEPTH_BIT` 表示访问深度数据。
  - `baseMipLevel`：指定访问的 Mipmap 的起始层级，`levelCount` 表示访问的层级数量。
  - `baseArrayLayer`：指定访问的层级的起始位置，`layerCount` 表示访问的层级数量。

当 `VkImageViewCreateInfo` 装填完后，就可以通过 `vkCreateImageView` 创建 `VkImageView`。


与 `vkImage` 不同的是，因为 `vkImageView` 是手动创建的，所以需要程序结束时手动销毁：
```cpp
void HelloTriangleApplication::cleanup()
{
    SwapChainMgr::destroySwapChain();
    // ...
}
```

