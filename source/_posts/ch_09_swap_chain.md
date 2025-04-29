---
created: 2022-03-12
updated: 2025-04-14
tags:
  - Vulkan
date: 2025-04-12
published: true
title: 《Vulkan Tutorial》 笔记 09： Swap Chain
description: 在 Vulkan 中必须显式的创建 Swap Chain。SwapChain 是与 Surface 绑定的数据结构，其包含了多个 Image，应用渲染时会将渲染的结果放置到这些 Image 中，当调用 Present 时，SwapChain 会将这些 Image 通过其与 Surface 绑定，传递给 Surface，Surface 再将这些 Image 显示到平台的窗口或屏幕上。
---

{% note info %}
本部分结果可参考 [09_SwapChain](https://github.com/xuejiaW/LearnVulkan/tree/main/_09_SwapChain)
{% endnote %}

{% note info %}
本章涉及到的关键对象和流程如下所示
![](/ch_09_swap_chain/ch_09_swap_chain.excalidraw.svg)
{% endnote %}


在 Vulkan 中必须显式地创建 Swap Chain。SwapChain 是与 Surface 绑定的数据结构，其包含了多个 Image，应用渲染时会将渲染的结果放置到这些 Image 中，当调用 Present 时，SwapChain 会将这些 Image 通过其与 Surface 绑定，传递给 Surface，Surface 再将这些 Image 显示到平台的窗口或屏幕上。

关于 Swap Chain 中的 queue 如何工作，以及何时将 queue 中的 Image present 到屏幕上，都可以在创建 Swap Chain 时配置。

创建类 `SwapChainMgr` 来管理 Swap Chain 的创建、销毁和关键数据，其定义如下，在本节的后续部分将逐步实现这些函数：

```cpp
class SwapChainMgr
{
public:
    static SwapChainSupportDetails querySwapChainSupport(VkPhysicalDevice device);
    static void createSwapChain();
    static void destroySwapChain();
    static VkSwapchainKHR swapChain;
    static std::vector<VkImage> images;
    static VkFormat imageFormat;
    static VkExtent2D imageExtent;

private:
    static VkSurfaceFormatKHR chooseSwapSurfaceFormat(const std::vector<VkSurfaceFormatKHR>& availableFormats);
    static VkPresentModeKHR chooseSwapPresentMode(const std::vector<VkPresentModeKHR>& availablePresentModes);
    static VkExtent2D chooseSwapExtent(const VkSurfaceCapabilitiesKHR& capabilities);
};
```

## 检查 Physical Device 是否支持 Swap Chain

并不是所有的显卡都支持将 Image 呈现到屏幕上，例如一些服务器的显卡，并不包含有任何的 Display 输出功能。同时因为 Image 的 Presentation 与操作系统的 Window System 强相关，所以 Swap Chain 并非 Vulkan Core 的一部分，而是通过 device extension `VK_KHR_swapchain` 提供的标准扩展。要使用 SwapChain，必须启用该扩展。

在 `PhysicalDevicesMgr` 新增函数 `checkDeviceExtensionsSupport` 来检查设备是否支持 `VK_KHR_swapchain`：

```cpp
bool PhysicalDevicesMgr::checkDeviceExtensionsSupport(VkPhysicalDevice device)
{
    uint32_t extensionCount;
    vkEnumerateDeviceExtensionProperties(device, nullptr, &extensionCount, nullptr);

    std::vector<VkExtensionProperties> availableExtensions(extensionCount);
    vkEnumerateDeviceExtensionProperties(device, nullptr, &extensionCount, availableExtensions.data());

    std::set<std::string> requiredExtensions(deviceExtensions.begin(), deviceExtensions.end());

    for (const auto& extension : availableExtensions)
        requiredExtensions.erase(extension.extensionName);

    return requiredExtensions.empty();
}
```

其中 `deviceExtensions` 定义如下，其中的 `VK_KHR_SWAPCHAIN_EXTENSION_NAME` 为 Vulkan 头文件中用来表示 `VK_KHR_swapchain` 的宏：

```cpp
const std::vector<const char*> deviceExtensions = { VK_KHR_SWAPCHAIN_EXTENSION_NAME };
```

在 `PhysicalDevicesMgr::isDeviceSuitable` 函数中需要添加对 `checkDeviceExtensionsSupport` 的调用：

```cpp
bool PhysicalDevicesMgr::isDeviceSuitable(VkPhysicalDevice device)
{
    // ...
    bool extensionsSupported = checkDeviceExtensionsSupport(device);

    return deviceSuitable && queueFamilySuitable && extensionsSupported;
}
```

## 启用 Device Extension

一旦 Physical Device 支持 SwapChain 扩展，我们在创建 Logical Device 时需要指明 Extensions 的数量和类型：

```cpflowchart TD
    VkInstance
    VkPhysicalDevice
    VkSurfaceKHR
    VkSwapchainCreateInfoKHR
    VkSwapchainKHR
    VkImage

    VkInstance -->|vkEnumeratePhysicalDevices| VkPhysicalDevice
    VkPhysicalDevice -->|vkGetPhysicalDeviceSurfaceSupportKHR| VkSurfaceKHR
    VkSurfaceKHR -->|vkGetPhysicalDeviceSurfaceCapabilitiesKHR| VkSwapchainCreateInfoKHR
    VkSurfaceKHR -->|vkGetPhysicalDeviceSurfaceFormatsKHR| VkSwapchainCreateInfoKHR
    VkSurfaceKHR -->|vkGetPhysicalDeviceSurfacePresentModesKHR| VkSwapchainCreateInfoKHR
    VkSwapchainCreateInfoKHR -->|vkCreateSwapchainKHR| VkSwapchainKHR
    VkSwapchainKHR -->|vkGetSwapchainImagesKHR| VkImagep
void LogicDevicesMgr::createLogicalDevice()
{
    // ...
    createInfo.enabledExtensionCount = static_cast<uint32_t>(PhysicalDevicesMgr::deviceExtensions.size());
    createInfo.ppEnabledExtensionNames = PhysicalDevicesMgr::deviceExtensions.data();
    // ...
}
```

## 查询更多关于 SwapChain 的细节

在确保 Physical Device 支持 Swap Chain 后，还需要查询更多关于 Swap Chain 的信息。因为不同的设备可能支持不同的 Surface 格式、Presentation 模式等。这些信息在后续创建 Swap Chain 时会用到。

需要查询的 Swap Chain 相关信息主要有三类：

- 与 Surface 的兼容性：如 image 的最小/最大数量，image 的最小/最大宽度和高度
- Surface 的格式：如颜色格式和色彩空间
- 可选的 Presentation 模式

首先定义一个结构体存储上述需要的所有信息：

```cpp
struct SwapChainSupportDetails
{
    VkSurfaceCapabilitiesKHR capabilities;
    std::vector<VkSurfaceFormatKHR> formats;
    std::vector<VkPresentModeKHR> presentModes;
};
```

实现函数 `querySwapChainSupport` 生成上述结构体，其中调用了一系列的 `vkGetPhysicalDeviceSurfaceXXX` 函数来获取 Surface 的信息：

```cpp
SwapChainSupportDetails SwapChainMgr::querySwapChainSupport(VkPhysicalDevice device)
{
    SwapChainSupportDetails details;

    vkGetPhysicalDeviceSurfaceCapabilitiesKHR(device, SurfaceMgr::surface, &details.capabilities);

    uint32_t formatCount;
    vkGetPhysicalDeviceSurfaceFormatsKHR(device, SurfaceMgr::surface, &formatCount, nullptr);
    if (formatCount != 0)
    {
        details.formats.resize(formatCount);
        vkGetPhysicalDeviceSurfaceFormatsKHR(device, SurfaceMgr::surface, &formatCount, details.formats.data());
    }

    uint32_t presentModeCount;
    vkGetPhysicalDeviceSurfacePresentModesKHR(device, SurfaceMgr::surface, &presentModeCount, nullptr);
    if (presentModeCount != 0)
    {
        details.presentModes.resize(presentModeCount);
        vkGetPhysicalDeviceSurfacePresentModesKHR(device, SurfaceMgr::surface, &presentModeCount, details.presentModes.data());
    }

    return details;
}
```

再次修改函数 `PhysicalDevicesMgr::isDeviceSuitable`，只有在支持的 Image Format 和 Presentation Mode 都不为空时才认为设备合适：

```cpp
bool PhysicalDevicesMgr::isDeviceSuitable(VkPhysicalDevice device)
{
    // ...

    bool swapChainAdequate = false;
    if (extensionsSupported)
    {
        SwapChainSupportDetails swapChainSupport = SwapChainMgr::querySwapChainSupport(device);
        swapChainAdequate = !swapChainSupport.formats.empty() && !swapChainSupport.presentModes.empty();
    }

    return deviceSuitable && queueFamilySuitable && extensionsSupported && swapChainAdequate;
}
```

## 为 SwapChain 选择正确的设置

在确认 Swap Chain 可用后，还需要为 SwapChain 选择最合适的设置，不同的设置适合不同的场景，也可能带来不同的性能表现。Swap chain 主要有三种类型数据需要设置：

- Surface Format：如颜色格式和色彩空间
- Presentation Mode：如交换 Image 到屏幕上的条件
- Swap Extent：Swap Chain 图片的分辨率

对于上述每一种数据类型，都会尝试找寻最合适的值，如果该值无法获取即寻找次优的值，这三种数据类型分别在 `SwapChainMgr` 的三个 `chooseSwapSurfaceFormat`，`chooseSwapPresentMode` 和 `chooseSwapExtent` 函数中实现。

### Surface format

定义函数 `chooseSwapSurfaceFormat` 找寻最合适的 Surface format：

```cpp
VkSurfaceFormatKHR SwapChainMgr::chooseSwapSurfaceFormat(const std::vector<VkSurfaceFormatKHR>& availableFormats)
{
    for (const auto& availableFormat : availableFormats)
    {
        if (availableFormat.format == VK_FORMAT_B8G8R8A8_SRGB && availableFormat.colorSpace == VK_COLOR_SPACE_SRGB_NONLINEAR_KHR)
            return availableFormat;
    }

    return availableFormats[0];
}
```

### Presentation mode

在 Vulkan 中一共有如下四种可能的 Present 模式：

- `VK_PRESENT_MODE_IMMEDIATE_KHR`：当应用提交了一个画面后，马上将画面显示到屏幕上。该模式可能造成画面撕裂。
- `VK_PRESENT_MODE_FIFO_KHR`：当设备的 VSync 到来后，从 queue 中获取一个画面显示到屏幕上。当应用提交画面时，放置到 queue 的末尾。如果应用提交画面时，发现 queue 已满，则会阻塞应用。如果 VSync 到来但是 Queue 为空时，则会等待下一个 VSync 重新尝试获取。**这是 Vulkan 标准要求所有实现必须支持的 present mode。**
- `VK_PRESENT_MODE_FIFO_RELAXED_KHR`：与 `VK_PRESENT_MODE_FIFO_KHR` 类似，只不过在 VSync 到来但 Queue 为空后，不会再次等到设备 VSync 时做第二次查询，而是当新的图像一到来就刷新到屏幕上。
- `VK_PRESENT_MODE_MAILBOX_KHR`：与 `VK_PRESENT_MODE_FIFO_KHR` 类似，只不过当应用提交画面且 Queue 已满时，不再阻塞应用提交画面，而是会用新画面取代 Queue 中最老的画面。**适合低延迟和无撕裂的场景。**

在设备支持 Swap Chain 后，`VK_PRESENT_MODE_FIFO_KHR` 模式必然支持。但这里选择使用 `VK_PRESENT_MODE_MAILBOX_KHR` 模式，避免应用意外的阻塞，仅当 `VK_PRESENT_MODE_MAILBOX_KHR` 不存在时再使用 `VK_PRESENT_MODE_FIFO_KHR`。

封装函数 `chooseSwapPresentMode` 选择最合适的 Present Mode：

```cpp
VkPresentModeKHR SwapChainMgr::chooseSwapPresentMode(const std::vector<VkPresentModeKHR>& availablePresentModes)
{
    for (const auto& availablePresentMode : availablePresentModes)
    {
        if (availablePresentMode == VK_PRESENT_MODE_MAILBOX_KHR)
            return availablePresentMode;
    }

    return VK_PRESENT_MODE_FIFO_KHR;
}
```

### Swap extent

最后一个需要设置的属性是 Swap Extent，该属性表示 Swap Chain Image 的分辨率，Swap Extent 的上下限在 `VkSurfaceCapabilitiesKHR` 结构体中定义。

Swap Extent 分辨率几乎总是和窗口的分辨率相同，如果平台的 Window Manager 允许开发者定义与屏幕不相同的分辨率，那么会将 `VkSurfaceCapabilitiesKHR.currentExtent` 的宽高都设定为 `UINT32_MAX`，反之 `currentExtent` 即为屏幕分辨率。

定义函数 `chooseSwapExtent` 在允许的情况下，将 Swap Extent 设定为窗口的宽高：

```cpp
VkExtent2D SwapChainMgr::chooseSwapExtent(const VkSurfaceCapabilitiesKHR& capabilities)
{
    if (capabilities.currentExtent.width != std::numeric_limits<uint32_t>::max())
        return capabilities.currentExtent;

    int width, height;
    glfwGetFramebufferSize(HelloTriangleApplication::window, &width, &height);

    VkExtent2D actualExtent = {static_cast<uint32_t>(width), static_cast<uint32_t>(height)};

    actualExtent.width = std::max(capabilities.minImageExtent.width, std::min(capabilities.maxImageExtent.width, actualExtent.width));
    actualExtent.height = std::max(capabilities.minImageExtent.height, std::min(capabilities.maxImageExtent.height, actualExtent.height));

    return actualExtent;
}
```

## 创建 SwapChain

在 `initVulkan` 函数中，添加对 `createSwapChain` 的调用：

```cpp
void HelloTriangleApplication::initVulkan()
{
    // ...
    SwapChainMgr::createSwapChain();
}
```

完整的 `SwapChainMgr::createSwapChain` 函数为：

```cpp
void SwapChainMgr::createSwapChain()
{
    SwapChainSupportDetails swapChainSupport = querySwapChainSupport(PhysicalDevicesMgr::physicalDevice);
    VkSurfaceFormatKHR surfaceFormat = chooseSwapSurfaceFormat(swapChainSupport.formats);
    VkPresentModeKHR presentMode = chooseSwapPresentMode(swapChainSupport.presentModes);
    VkExtent2D extent = chooseSwapExtent(swapChainSupport.capabilities);

    uint32_t imageCount = swapChainSupport.capabilities.minImageCount + 1;

    if (swapChainSupport.capabilities.maxImageCount > 0 && imageCount > swapChainSupport.capabilities.maxImageCount)
        imageCount = swapChainSupport.capabilities.maxImageCount;

    VkSwapchainCreateInfoKHR createInfo{};
    createInfo.sType = VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR;
    createInfo.surface = SurfaceMgr::surface;
    createInfo.minImageCount = imageCount;
    createInfo.imageFormat = surfaceFormat.format;
    createInfo.imageColorSpace = surfaceFormat.colorSpace;
    createInfo.imageExtent = extent;
    createInfo.imageArrayLayers = 1; // 通常为 1，除非 stereoscopic rendering
    createInfo.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;

    QueueFamilyIndices indices = QueueFamilyMgr::findQueueFamilies(PhysicalDevicesMgr::physicalDevice);
    uint32_t queueFamilyIndices[] = {indices.graphicsFamily.value(), indices.presentFamily.value()};
    if (indices.graphicsFamily == indices.presentFamily)
    {
        createInfo.imageSharingMode = VK_SHARING_MODE_EXCLUSIVE;

    }
    else
    {
        createInfo.imageSharingMode = VK_SHARING_MODE_CONCURRENT;
        createInfo.queueFamilyIndexCount = 2;
        createInfo.pQueueFamilyIndices = queueFamilyIndices;
    }

    createInfo.preTransform = swapChainSupport.capabilities.currentTransform;
    createInfo.compositeAlpha = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
    createInfo.presentMode = presentMode;
    createInfo.clipped = VK_TRUE;
    createInfo.oldSwapchain = VK_NULL_HANDLE;

    if (vkCreateSwapchainKHR(LogicDevicesMgr::device, &createInfo, nullptr, &swapChain) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to create swap chain!");
    }

    vkGetSwapchainImagesKHR(LogicDevicesMgr::device, swapChain, &imageCount, nullptr);
    images.resize(imageCount);
    vkGetSwapchainImagesKHR(LogicDevicesMgr::device, swapChain, &imageCount, images.data());
    imageFormat = surfaceFormat.format;
    imageExtent = extent;
}
```

上述函数主要的工作是填充 `VkSwapchainCreateInfoKHR` 结构体，并最终调用 `vkCreateSwapchainKHR` 创建出需要的 `swapChain` 对象。

在 SwapChain 创建完成后，调用 `vkGetSwapchainImagesKHR` 获取 SwapChain 中的 Image 数量和数据，并将 Image 的 Extent 和 Format 存储下来，即完整函数实现中的如下部分：
```cpp
vkGetSwapchainImagesKHR(device, swapchain, &imageCount, nullptr);
swapChainImages.resize(imageCount);
vkGetSwapchainImagesKHR(device, swapchain, &imageCount, swapChainImages.data());
```

当程序结束时，也应当清理 SwapChain，因为创建 SwapChain 时依赖 device，因此销毁时 SwapChain 也必须在 Device 被销毁前销毁：

```cpp
void HelloTriangleApplication::cleanup()
{
    SwapChainMgr::destroySwapChain();
    // ...
}

void SwapChainMgr::destroySwapChain()
{
    vkDestroySwapchainKHR(LogicDevicesMgr::device, swapChain, nullptr);
}
```

`createInfo` 中 `surfaceFormat`、`presentMode` 和 `extent` 都是在 [为 SwapChain 选择正确的设置](/ch_09_swap_chain/#Choosing_the_right_settings_for_the_swap_chain) 中获取的数据。

`createInfo` 中剩下还有的比较重要的参数：

### minImageCount

`minImageCount` 是 swapChain 中最小需要使用到的 image 数量，该数量可以通过 `swapChainSupport.capabilities.minImageCount` 获得。通常会取 `swapChainSupport.capabilities.minImageCount + 1`，这样可以实现 triple buffering，减少等待，提升性能。需要确认 +1 后不会超过 `swapChainSupport.capabilities.maxImageCount`。

### imageArrayLayers

`createInfo.imageArrayLayers` 指定了每个 SwapChain image 由几层 layer 构成。对于普通 2D 渲染应为 1，只有在立体显示或多视图（如 VR/AR）应用中才会大于 1。

### imageUsage

`createInfo.imageUsage` 指定 SwapChain 中 Image 的用途。这里仅需要将 swapChain 作为 Color Attachment，因此设定为 `VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT`。如需支持后处理或读取 swapchain image，可添加 `VK_IMAGE_USAGE_TRANSFER_SRC_BIT` 等标志。

### imageSharingMode

`createInfo.imageSharingMode` 指定了 SwapChain 中的 image 如何在多个 Queue families 中处理。

- `VK_SHARING_MODE_EXCLUSIVE` ：Image 在同一时刻只会被一个 Queue Family 拥有，另一个 Queue Family 需要处理该 Image 时，需要显式转移拥有权。**该模式下拥有最好的性能**。
- `VK_SHARING_MODE_CONCURRENT`：当不同的 Queue Families 使用同一个 Image 时，不需要显式转移拥有权。**仅当 graphics 和 present queue 不同且需要并发访问时使用**。

通常推荐使用 EXCLUSIVE，除非确实需要 CONCURRENT。

{% note info %}
之所以 `VK_SHARING_MODE_EXCLUSIVE` 性能更好，是因为当资源处于独占模式时，GPU 驱动可以优化访问，而如果是 `VK_SHARING_MODE_CONCURRENT` 共享模式，GPU 必须有同步机制确保多个 Queue Family 访问同一个 Image 时不会发生冲突。
{% endnote %}

### preTransform

`preTransform` 可以指定设置在 SwapChain Image 的 Transform 变化，如顺时针旋转 90°。如果不需要这种变化，设置为 `swapChainSupport.capabilities.currentTransform` 即可。

### compositeAlpha

`compositeAlpha` 指定了有多个 Window 叠加时，该如何处理混合模式。通常当前的 Window 并不需要与背后的 Window 进行混合，因此可以设为 `VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR`。部分平台支持透明窗口，可根据需求选择。

### clipped

`clipped` 表示当一部分像素无法显示时（如被其他窗口遮挡），是否需要舍弃这些像素。通常应设置为 `VK_TRUE`，以提升性能，不会影响最终可见区域的渲染结果。

### oldSwapchain

在 Vulkan 程序的整个生命周期内，SwapChain 可能会因窗口大小变化等原因需要重建。此时创建新的 SwapChain 时，通过 `oldSwapchain` 指定上一个 SwapChain，可以优化资源重用。首次创建时应为 `VK_NULL_HANDLE`。
