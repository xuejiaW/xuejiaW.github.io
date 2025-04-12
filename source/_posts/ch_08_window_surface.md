---
created: 2022-03-12
updated: 2025-04-12
tags:
  - Vulkan
date: 2025-04-08
published: true
title: 《Vulkan Tutorial》 笔记 08： 窗口 Surface
description: 因为 Vulkan 是一个平台不相关的 API，所以它无法直接与 Window 操作系统交互。为了建立 Vulkan 和 Window 操作系统之间的连接，就需要使用 `WSI（Window System Integration）` 拓展，其中最关键的就是 Surface。
---

{% note info %}
本部分结果可参考 [08_Window_Surface](https://github.com/xuejiaW/LearnVulkan/tree/main/_08_Window_Surface)
{% endnote %}

因为 Vulkan 是一个平台不相关的 API，所以它无法直接与 Window 操作系统交互。为了建立 Vulkan 和 Window 操作系统之间的连接，就需要使用 `WSI（Window System Integration）` 拓展，其中最关键的就是 Surface。

{% note info %}
Surface 是对于系统中的窗口或显示设备的抽象，应用通过与 Surface 的交互来实现与系统窗口的访问。
{% endnote %}


在这一章会首先讨论 `WSI` 中的 `VK_KHR_surafce`，它定义了 `VkSurfaceKHR` 对象标识用于作为画面的 Surface  的抽象。Window Surface 可以通过 GLFW 获取，它需要在创建了 Instance 后马上被创建，因为它会影响 Physical device 的选择。本章会介绍如何创建 Window Surface，并且修改 Physical device 选择的代码以检查物理设备是否有支持 Presentation 的 Queue family，并在创建 Logical device 时创建 Presentation Queue。

{% note info %}
Presentation 是指将已渲染的图形图像提交给窗口系统进行显示。这通常包括将图像从 Vulkan 的 GPU 内存转移到可以被显示器读取显示的格式和位置。Presentation 必须与底层的窗口系统集成（WSI），这就需要使用特定的 Vulkan 扩展，比如 VK_KHR_surface 和 VK_KHR_swapchain。这些扩展使 Vulkan 能够与不同的操作系统窗口系统（如 Windows、Linux、Android 等）兼容。
{% endnote %}


{% note info %}
`VK_KHR_surface`是一个 instance 层面的拓展，在创建 Instance 前就已经通过函数 `glfwGetRequiredInstanceExtensions` 获取到
{% endnote %}

{% note primary %}
Window surface 在 Vulkan 中实际上是可选的，如果应用纯粹是作为离屏渲染使用，就不再需要创建 Window surface。 在 OpenGL 中 surface 必须被创建，因此纯粹离屏的应用还需要进行创建不可见的 window 这样的 Hack。
{% endnote %}

# 创建 Window surface

首先定义类 `SurfaceMgr` 用以管理 Surface 的创建和销毁，其中使用类成员 `surface` 来存储创建的 Surface。该类的定义如下：

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
VkSurfaceKHR SurfaceMgr::surface = nullptr;

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
`glfwCreateWindowSurface` 函数封装了在个平台创建 Surface 的过程。在 Windows 平台下该函数即封装了为 Windows 提供的 `vkCreateWin32SurfaceKHR`。
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

