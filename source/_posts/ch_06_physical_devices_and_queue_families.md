---
tags:
  - Vulkan
created: 2022-03-10
updated: 2025-04-07
date: 2025-04-06 10:31
published: true
title: 《Vulkan Tutorial》 笔记 06：物理设备和 Queue Family
description: 选择符合要求的物理设备和 Queue Family，物理设备是 Vulkan 的一个重要概念，它表示了一个支持 Vulkan 的 GPU 设备，Queue Family 则是物理设备的一个属性，表示了该设备支持的命令队列类型。
---

{% note info %}
本部分结果可参考 [06_Physical_Devices_Queue_Families](https://github.com/xuejiaW/LearnVulkan/tree/main/_06_Physical_Devices_Queue_Families)
{% endnote %}


# 选择物理设备和 Queue Family

在创建了 `VkInstance` 后，需要选择满足需求的显卡，这里定义类 `PhysicalDevicesMgr` 来管理显卡的选择，其头文件如下所示：
```cpp
class PhysicalDevicesMgr
{
public:
    void static pickPhysicalDevice(VkInstance instance);
    static VkPhysicalDevice physicalDevice;

private:
    static bool isDeviceSuitable(VkPhysicalDevice device);
};
```

在 `HelloTriangleApplication::initVulkan` 函数中调用 `pickPhysicalDevice` 函数来选择合适的显卡：
```cpp
void HelloTriangleApplication::initVulkan()
{
    createInstance();
    DebugMessengerMgr::setupDebugMessenger(instance);
    PhysicalDevicesMgr::pickPhysicalDevice(instance);
}
```

{% note info %}
对于 Vulkan 而言，可以选择多张适合的显卡并同时使用，但在教程中仅会使用一张。
{% endnote %}

显卡设备以 `VkPhysicalDevice` 表示，该物体会在 `VkInstance` 销毁时被隐式的卸载，因此不需要在 `cleanup` 中进行额外的删除操作。

找寻适合的显卡的过程与找寻 Extensions 的过程很接近，通过 `vkEnumeratePhysicalDevices` 函数找寻支持 Vulkan 的显卡列表和数目：
```cpp
void PhysicalDevicesMgr::pickPhysicalDevice(VkInstance instance)
{
    uint32_t deviceCount = 0;

    vkEnumeratePhysicalDevices(instance, &deviceCount, nullptr);
    if (deviceCount == 0)
        throw std::runtime_error("failed to find GPUs with Vulkan support!");

    std::vector<VkPhysicalDevice> devices(deviceCount);
    vkEnumeratePhysicalDevices(instance, &deviceCount, devices.data());

    for (const auto& device : devices)
    {
        if (isDeviceSuitable(device))
        {
            physicalDevice = device;
            break;
        }
    }

    if (physicalDevice == VK_NULL_HANDLE)
        throw std::runtime_error("failed to find a suitable GPU!");
}
```

其中 `isDeviceSuitable(device)` 函数用来确认一个显卡是否合适。

# 检查设备是否合适

对于设备的基础属性，如 `name`，`type` 和支持的 Vulkan 类型都可以通过 `vkGetPhysicalDeviceProperties` 查询。对于设备的可选特性，如纹理压缩，64 bit floats 等则可以通过 `vkGetPhysicalDeviceFeatures` 查询。

如下，查询设备的基础属性和可选特性后，将独显且支持几何 Shader 的显卡视作为合适显卡：
```cpp
bool PhysicalDevicesMgr::isDeviceSuitable(VkPhysicalDevice device)
{
    VkPhysicalDeviceProperties deviceProperties;
    VkPhysicalDeviceFeatures deviceFeatures;

    vkGetPhysicalDeviceProperties(device, &deviceProperties);
    vkGetPhysicalDeviceFeatures(device, &deviceFeatures);

    return deviceProperties.deviceType == VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU && deviceFeatures.geometryShader;
}
```

除此之外，我们还需要判断一张显卡是否支持我们需要的 Queue Family。

# Queue families

Vulkan 中的几乎所有操作，都需要提交指令给 Queue。Vulkan 中存在各种不同类型的队列，如会存在一个 Queue 只允许处理计算的命令，而存在另一个 Queue 只允许内存的传输，再另一个 Queue 可以处理计算和内存传输的命令等。同一种类型的 Queue 会被封装在一个Queue Family 中。

首先需要从 Physical Devices 中查询设备支持的 Queue Families 列表，并找出支持想要执行的命令的特定 Queue Family。因为需要寻找的 Queue Family 可能不止一个，因此封装一个结构体表示所有需要的 Queue Family 的 indices，在这一章暂时只有一个表示 graphics 的 queue family 的 index，同时增加函数 `isComplete` 表示是否正确找到了 graphics queue family：
```cpp
struct QueueFamilyIndices
{
    std::optional<uint32_t> graphicsFamily;
    bool isComplete()
    {
        return graphicsFamily.has_value();
    }
};
```

函数 `findQueueFamilies` 的作用仅是找寻 Queue，因此即使一个 queue 未找到也不一定是错误发生。这里用 Optional 来表示 Queue Index，因为任何的 Int 值都可能是 Queue Index，用一个 Magic Number 表示未找到的情形并不安全。

如下可定义类 `QueueFamilyMgr` 并封装函数 `findQueueFamilies` 函数获取需要的 Queue Families 的 indices：

```cpp

class QueueFamilyMgr
{
public:
    static QueueFamilyIndices findQueueFamilies(VkPhysicalDevice device);
};

QueueFamilyIndices QueueFamilyMgr::findQueueFamilies(VkPhysicalDevice device)
{
    QueueFamilyIndices indices;

    uint32_t queueFamilyCount = 0;
    vkGetPhysicalDeviceQueueFamilyProperties(device, &queueFamilyCount, nullptr);
    std::vector<VkQueueFamilyProperties> queueFamilies(queueFamilyCount);
    vkGetPhysicalDeviceQueueFamilyProperties(device, &queueFamilyCount, queueFamilies.data());

    int i = 0;
    for (const auto& queueFamily : queueFamilies)
    {
        if (queueFamily.queueFlags & VK_QUEUE_GRAPHICS_BIT)
        {
            indices.graphicsFamily = i;
        }

        if (indices.isComplete())
            break;

        ++i;
    }

    return indices;
}
```

其中的 `VkQueueFamilyProperties` 结构体中包含一些关于 Queue Family 的细节，包括支持的 Operations 类型（`queueFlags`）以及可以从这个 Family 中创建出多少个 queue（`queueCount`）。

此时需要修改 `PhysicalDevicesMgr::isDeviceSuitable` 函数中需要检测找寻到的 QueueFamilyIndices 是否满足需求：

```cpp
bool PhysicalDevicesMgr::isDeviceSuitable(VkPhysicalDevice device)
{
    VkPhysicalDeviceProperties deviceProperties;
    VkPhysicalDeviceFeatures deviceFeatures;

    vkGetPhysicalDeviceProperties(device, &deviceProperties);
    vkGetPhysicalDeviceFeatures(device, &deviceFeatures);

    QueueFamilyIndices indices = QueueFamilyMgr::findQueueFamilies(device);
    const bool deviceSuitable = deviceProperties.deviceType == VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU &&
                                deviceFeatures.geometryShader;
    const bool queueFamilySuitable = indices.isComplete();

    return deviceSuitable && queueFamilySuitable;
}
```

至此，已经完整的找寻了正确的物理显卡，下一步就是创建合适的逻辑设备与之交互。
