---
created: 2022-03-12
updated: 2025-04-12
tags:
  - Vulkan
date: 2025-04-08
published: true
title: 《Vulkan Tutorial》 笔记 08： 窗口 Surface
description: 因为 Vulkan 是一个平台不相关的 API，所以它无法直接与 Window 操作系统交互。为了建立 Vulkan 和 Window 操作系统之间的连接，就需要使用 `WSI（Window System Integration）` 拓展，其中最关键的就是 Surface。在本节中，会首先创建 Surface，并通过该 Surface 查询可以正确处理 Presentation 的队列族和队列。
---

{% note info %}
本部分结果可参考 [08_Window_Surface](https://github.com/xuejiaW/LearnVulkan/tree/main/_08_Window_Surface)
{% endnote %}

{% note info %}
本章涉及到的关键对象和流程如下所示
![](/ch_08_window_surface/windowsurface.excalidraw.svg)
{% endnote %}

Vulkan 是一个平台无关的 API，无法直接与操作系统的窗口系统交互。为了实现 Vulkan 与操作系统窗口系统的集成，需要使用 WSI（Window System Integration）相关扩展，其中最核心的是 `VK_KHR_surface`。Surface 是对操作系统窗口系统表面的抽象，允许 Vulkan 呈现图像到屏幕上。

{% note info %}
Surface 表示一个可以作为渲染目标的窗口系统，应用通过与 Surface 的交互来访问系统窗口。
{% endnote %}

在本章中，将介绍如何通过 GLFW 创建 window surface，并修改之前章节中物理设备选择（[物理设备和 Queue Family](/ch_06_physical_devices_and_queue_families/#选择物理设备和_queue_family)）和 [创建 Logical Device](/ch_07_logical_device_and_queues/#创建_logical_device)的过程，通过创建的 Surface 来找寻可以正确处理 presentation 支持的队列族。

{% note info %}
在图形 API（如 Vulkan、DirectX、OpenGL）中，Presentation 指的是“将渲染结果显示到屏幕上的过程”。
- 渲染（Rendering）：GPU 负责把你的 3D 场景、模型、纹理等数据，经过一系列计算，最终生成一张图像（通常是帧缓冲区中的一帧）。
- 呈现（Presentation）：把这张已经渲染好的图像，从 GPU 的帧缓冲区（或交换链中的图像）提交给操作系统的窗口系统，最终显示在用户屏幕上。
{% endnote %}


{% note info %}
`VK_KHR_surface` 是 instance 级扩展。需要在创建 instance 时启用。可以通过 `glfwGetRequiredInstanceExtensions` 获取需要启用的扩展名称列表。
{% endnote %}

{% note primary %}
在 Vulkan 中，window surface 是可选的。如果应用仅用于离屏渲染，则无需创建 surface。
{% endnote %}

# 创建 Window surface

首先定义类 `SurfaceMgr` 用于管理 surface 的创建和销毁，surface 句柄类型为 `VkSurfaceKHR`，初始值应为 `VK_NULL_HANDLE`。

```cpp
class SurfaceMgr
{
public:
    static void createSurface(VkInstance instance, GLFWwindow* window);
    static void destroySurface(VkInstance instance);
    static VkSurfaceKHR surface;
};
```

函数实现如下：

```cpp
VkSurfaceKHR SurfaceMgr::surface = VK_NULL_HANDLE;

void SurfaceMgr::createSurface(VkInstance instance, GLFWwindow* window)
{
    if (glfwCreateWindowSurface(instance, window, nullptr, &surface) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to create window surface!");
    }
}

void SurfaceMgr::destroySurface( VkInstance instance)
{
    vkDestroySurfaceKHR(instance, surface, nullptr);
}
```

在 `HelloTriangleApplication` 的 `initVulkan` 函数中调用 `SurfaceMgr::createSurface` 来创建 Surface，并在 `cleanup` 函数中调用 `SurfaceMgr::destroySurface` 来销毁 Surface。修改后的 `initVulkan` 和 `cleanup` 如下，注意创建 `surface` 需要在创建 `instance` 之后，Physical device 选择之前。

```cpp
void HelloTriangleApplication::initVulkan()
{
    createInstance();
    DebugMessengerMgr::setupDebugMessenger(instance);
    SurfaceMgr::createSurface(instance, window);
    PhysicalDevicesMgr::pickPhysicalDevice(instance);
    LogicDevicesMgr::createLogicalDevice();
}

void HelloTriangleApplication::cleanup()
{
    LogicDevicesMgr::destroyLogicalDevice();
    if (ValidationLayerMgr::enableValidationLayers)
        DebugMessengerMgr::destroyDebugUtilsMessengerExt(instance, nullptr);

    SurfaceMgr::destroySurface(instance);
    vkDestroyInstance(instance, nullptr);
    glfwDestroyWindow(window);
    glfwTerminate();
}
```

{% note info %}
`glfwCreateWindowSurface` 函数封装了在各个平台创建 Surface 的过程。在 Windows 平台下该函数即封装了为 Windows 提供的 `vkCreateWin32SurfaceKHR`。
{% endnote %}

# 找寻支持 Presentation 的物理设备

并非所有的硬件设备都支持将 Image 表现到创建的上述 Surface 上，因此在这里还需要检测设备的 Presentation 支持。因为 Presentation 是一个需要放置在 Queue 中的指令，因此我们需要查询是否有支持 Presenting 的 Queue family。如下在 `QueueFamilyIndices` 结构体中新增 `presentFamily`：
```cpp
struct QueueFamilyIndices
{
    std::optional<uint32_t> graphicsFamily;
    std::optional<uint32_t> presentFamily;
    bool isComplete();
};

bool QueueFamilyIndices::isComplete()
{
    return graphicsFamily.has_value() && presentFamily.has_value();
}
```

之后需要修改 `QueueFamilyMgr::findQueueFamilies` 函数，因为 Surface 是拓展，所以无法直接从 `VkQueueFamilyProperties` 的 `queueFlags` 判断。这里需要使用函数 `vkGetPhysicalDeviceSurfaceSupportKHR` 查询：
```cpp
QueueFamilyIndices QueueFamilyMgr::findQueueFamilies(VkPhysicalDevice device)
{
    // ...
    for (const auto& queueFamily : queueFamilies)
    {
        if (queueFamily.queueFlags & VK_QUEUE_GRAPHICS_BIT)
        {
            indices.graphicsFamily = i;
        }

        VkBool32 presentSupport = false;
        vkGetPhysicalDeviceSurfaceSupportKHR(device, i, SurfaceMgr::surface, &presentSupport);

        if (presentSupport)
            indices.presentFamily = i;

        if (indices.isComplete())
            break;

        ++i;
    }
    // ... 
}
```

{% note info %}
这里虽然用了两个变量分别标识 graphics 和 present 的 Queue Family，但很可能这两个变量是一样的值。
{% endnote %}

# 创建 Presentation Queue

在 `LogicDeviceMgr` 中增加类成员对象 `presentQueue` 表示 present 的 Queue，同时修改 `createLogicalDevice` 函数，此时该函数中需要同时创建 graphics 和 present 两个 queue，因此原先的 `VkDeviceQueueCreateInfo` 需要被修改为 `std::vector<VkDeviceQueueCreateInfo>`，并且需要在 `VkDeviceCreateInfo` 中设置 `queueCreateInfoCount` 为需要与 `vector` 的数量相匹配。

使用数据结构 `std::set<uint32_t>` 来存储两个 queue 对应的 queue families，即使两个 queue families 相同，则该数据结构中实际上只有一个元素。修改后的 `LogicDeviceMgr::createLogicalDevice` 如下：


```cpp
void HelloTriangleApplication::createLogicalDevice()
{
    // ...
    const QueueFamilyIndices indices = QueueFamilyMgr::findQueueFamilies(PhysicalDevicesMgr::physicalDevice);

    std::vector<VkDeviceQueueCreateInfo> queueCreateInfos{};
    std::set uniqueQueueFamilies = {indices.graphicsFamily.value(), indices.presentFamily.value()};
    for (uint32_t queueFamily : uniqueQueueFamilies)
    {

        VkDeviceQueueCreateInfo queueCreateInfo{};
        queueCreateInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        queueCreateInfo.queueFamilyIndex = queueFamily;
        queueCreateInfo.queueCount = 1;
        queueCreateInfo.pQueuePriorities = &queuePriority;
        queueCreateInfos.push_back(queueCreateInfo);
    }

    // ...

    VkDeviceCreateInfo createInfo{};
    createInfo.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
    createInfo.pQueueCreateInfos = queueCreateInfos.data();
    createInfo.queueCreateInfoCount = static_cast<uint32_t>(queueCreateInfos.size());
    // ...

    vkGetDeviceQueue(device, indices.graphicsFamily.value(), 0, &graphicsQueue);
    vkGetDeviceQueue(device, indices.presentFamily.value(), 0, &presentQueue);
}
```

