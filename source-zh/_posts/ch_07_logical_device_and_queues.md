---
created: 2022-03-12
updated: 2025-04-12
tags:
  - Vulkan
date: 2025-04-07
published: true
title: 《Vulkan Tutorial》 笔记 07： 逻辑设备和队列
description: 在创建了 Physical Device（VkPhysicalDevice） 后需要建立一个 Logical Device （VkDevice）来与之交互。在创建 Logical Devices 时还需要指定需要从 Physical Devices 的 Queue Family 中创建多少 Queue。
---

{% note info %}
本部分结果可参考 [07_Logical_Device_Queue](https://github.com/xuejiaW/LearnVulkan/tree/main/_07_Logical_Device_Queue)
{% endnote %}


{% note info %}
本章涉及到的关键对象如下所示：
![](/ch_07_logical_device_and_queues/logical_device_and_queues.excalidraw.svg)
{% endnote %}


# 介绍

在创建了 Physical Device（`VkPhysicalDevice`） 后需要建立一个 Logical Device （`VkDevice`）来与之交互。创建 Logical Device 的过程与创建 Instance 类似，都需要描述需要的 Features。在创建 Logical Devices 时还需要指定需要从 Physical Devices 的 Queue Family 中创建多少 Queue。

增加成员变量 `VkDevice device` 表示 Logical Device，并封装函数 `createLogicalDevice` 创建 Logical Device。该函数需要在选择了合适的 Physical Device 和 Queue Family 后使用。我们定义类 `LogicalDeviceMgr` 来管理 Logical Device 的创建和销毁，其头文件如下所示：
```cpp
// LogicalDeviceMgr.h
class LogicalDeviceMgr
{
public:
    void static createLogicalDevice();
    void static destroyLogicalDevice();
    static VkDevice device;
    static VkQueue graphicsQueue;
};
```

在 `HelloTriangleApplication` 的 `initVulkan` 函数中调用 `createLogicalDevice` 函数创建 Logical Device：
```cpp
void HelloTriangleApplication::initVulkan()
{
    createInstance();
    DebugMessengerMgr::setupDebugMessenger(instance);
    PhysicalDevicesMgr::pickPhysicalDevice(instance);
    LogicalDeviceMgr::createLogicalDevice();
}
```

在 `cleanup` 函数中调用 `destroyLogicalDevice` 函数销毁 Logical Device：
```cpp
void HelloTriangleApplication::cleanup()
{
    LogicalDeviceMgr::destroyLogicalDevice();
    // ...
}
```

Queue（`VkQueue`）会在 Logical Device 被销毁时会隐式的被清理，因此不需要在 cleanup 中对其做任何处理。


# 指定创建 Queue 的信息

为创建 Logical Device 的 `vkDeviceCreateInfo` 需要一系列包含细节信息的其他 Struct 来填充，首先需要的就是描述需要创建的 `queue` 的 `VkDeviceQueueCreateInfo`，该结构体描述了从一个 Queue Family 中获取 Queue 需要的信息，如指定目标 Queue Family 的 Index，创建的 Queue 的数量，Queue 的优先级（范围为 $0 \sim 1$）等，优先级越高表示**提示**（并非绝对）驱动在资源经常时应该给这个 Queue 更多的时间片。代码如下所示：

```cpp
// inside function createLogicalDevice
constexpr float queuePriority = 1.0f;
const QueueFamilyIndices indices = QueueFamilyMgr::findQueueFamilies(PhysicalDevicesMgr::physicalDevice);
VkDeviceQueueCreateInfo queueCreateInfo{};
queueCreateInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
queueCreateInfo.queueFamilyIndex = indices.graphicsFamily.value();
queueCreateInfo.queueCount = 1;
queueCreateInfo.pQueuePriorities = &queuePriority;
```

{% note primary %}
如果需要从同一个 Queue Family 创建多个队列，则 `queueCreateInfo.pQueuePriorities` 应为长度为 `queueCount` 的数组，每个队列都需要指定优先级。
{% endnote %}

# 指定 Device Feature

之后需要创建需要的 Device Feature，如在 [Physical devices and queue families](/ch_06_physical_devices_and_queue_families) 中选择 Physical Device 时一样，可以通过 `vkGetPhysicalDeviceFeatures` 获取。但目前暂时将指明 Feature 的 `VkPhysicalDeviceFeatures` 设定为空，后续真正使用时再修改：
```cpp

// inside function createLogicalDevice
VkPhysicalDeviceFeatures deviceFeatures{};
```

# 创建 Logical Device

当创建了 `VkDeviceQueueCreateInfo` 和 `VkPhysicalDeviceFeatures` 后，就可以创建最终的 `vkDeviceCreateInfo` 结构体：
```cpp
VkDeviceCreateInfo createInfo{};
createInfo.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
createInfo.pQueueCreateInfos = &queueCreateInfo;
createInfo.queueCreateInfoCount = 1;
createInfo.pEnabledFeatures = &deviceFeatures;
createInfo.enabledExtensionCount = 0;
createInfo.ppEnabledExtensionNames = nullptr;
```

其中如同创建 Instance 时一样，需要指定 Extensions，但与创建 Instance 时不一样的是，这里的 Extensions 是针对设备而言的。如 `VK_KHR_swapchain` 就是一个设备相关的拓展，但在这一章中暂时不指定拓展，因此将 `enabledExtensionCount` 设为 0。


{% note info %}
Vulkan 1.0 及之后，创建 VkDevice 时不应再指定 Validation Layer。设备层的 Layer 参数已被废弃，所有 Layer 只在 Instance 层指定即可。因此 `createInfo.enabledLayerCount` 应为 0，`createInfo.ppEnabledLayerNames` 应为 nullptr。
{% endnote %}

此时可以通过 `vkCreateDevice` 函数创建 Logical Device:

```cpp
if (vkCreateDevice(PhysicalDevicesMgr::physicalDevice, &createInfo, nullptr, &device) != VK_SUCCESS)
{
    throw std::runtime_error("failed to create logical device!");
}
```

# 销毁 Logical Device

销毁 Logical Device 时，所有从该设备创建的对象（包括队列）都会被隐式销毁。销毁函数如下所示：

```cpp
void LogicalDeviceMgr::destroyLogicalDevice()
{
    vkDestroyDevice(device, nullptr);
}
```

# 获取 Queue Handle

Queue 在 Logical Device 创建时会被自动创建，但仍需要创建一个 Handle 作为与之交互的接口，即 `LogicalDeviceMgr` 中的 `VkQueue graphicsQueue`。获取 `VkQueue` 的函数如下所示：
```cpp
vkGetDeviceQueue(device, indices.graphicsFamily.value(), 0, &graphicsQueue);
```

其中：
- 第一个参数为 Logical Device
- 第二个参数为目标 Queue Family
- 第三个参数为需要获取的 Queue 的 Index，因为这里仅需要获取一个 Queue，因此为 0
- 第四个参数是存储获取到的 Queue 的地址。

