---
tags:
  - Vulkan
created: 2022-03-06
updated: 2025-04-06
date: 2025-03-31 16:42
published: true
title: 《Vulkan Tutorial》 笔记 04：Instance
description: 对于一个 Vulkan 应用而言，你首先需要通过创建一个 `instance` 来初始化 Vulkan 库， `instance` 是应用与 Vulkan 库的连接，在创建过程中会有相应的操作告知 Driver 你的应用的一些细节
---

{% note info %}
本部分结果可参考 [04_Instance](https://github.com/xuejiaW/LearnVulkan/tree/main/_04_Instance)
{% endnote %}


{% note info %}
本章涉及到的关键对象如下所示：
![](/ch_04_instance/vulkaninstance.excalidraw.svg)
{% endnote %}

对于一个 Vulkan 应用而言，你首先需要通过创建一个 `instance` 来初始化 Vulkan 库， `instance` 是应用与 Vulkan 库的连接，在创建过程中会有相应的操作告知 Driver 你的应用的一些细节。为创建 Instance，首先在头文件中需要在本节中定义的函数和变量，`createInstance` 用来创建实例并放在 `instance` 中，`checkAvailableExtensions` 用来检查当前系统支持的 Extensions，`checkRequiredGlfwExtensions` 用来检查 GLFW 需要的 Extensions，这两个函数在 `createInstance` 中被调用：

 ```cpp
 class HelloTriangleApplication
{
public:
    void run();

private:

    // ...
    void createInstance();
    void checkAvailableExtensions(const VkInstanceCreateInfo& createInfo);
    void checkRequiredGlfwExtensions();

    GLFWwindow* window = nullptr;
    VkInstance instance = nullptr;
};
 ```

在 `initVulkan` 函数中调用 `createInstance` 函数创建实例：

 ```cpp
void HelloTriangleApplication::initVulkan()
{
    createInstance();
    // ...
}
 ```

# 创建一个 Instance

对一个 Vulkan 程序而言，首先需要创建一个 `instance`，它用来连接应用与 Vulkan 库，同时也会将程序的一些细节指示给驱动。

创建 Instance 的完整实现如下所示：

```cpp
void HelloTriangleApplication::createInstance()
{
    VkApplicationInfo appInfo{};
    appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    appInfo.pApplicationName = "Hello_Triangle";
    appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
    appInfo.pEngineName = "No Engine";
    appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
    appInfo.apiVersion = VK_API_VERSION_1_0;

    uint32_t glfwExtensionCount = 0;
    const char** glfwExtension = glfwGetRequiredInstanceExtensions(&glfwExtensionCount);

    VkInstanceCreateInfo createInfo{};
    createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
    createInfo.pApplicationInfo = &appInfo;
    createInfo.enabledExtensionCount = glfwExtensionCount;
    createInfo.ppEnabledExtensionNames = glfwExtension;
    createInfo.enabledLayerCount = 0;

    if (vkCreateInstance(&createInfo, nullptr, &instance) != VK_SUCCESS)
    {
        throw std::runtime_error("Failed to create instance!");
    }

    checkAvailableExtensions(createInfo);
    checkRequiredGlfwExtensions();
}
```

其中首先需要创建两个结构体 [VkApplicationInfo](https://registry.khronos.org/vulkan/specs/latest/man/html/VkApplicationInfo.html) 和 [VkInstanceCreateInfo](https://registry.khronos.org/vulkan/specs/latest/man/html/VkInstanceCreateInfo.html)：
- `VkApplicationInfo`透露了关于应用的一些信息，驱动可以根据这些信息对程序做一些优化，例如其中的 `engine` 告诉驱动该 Vulkan 应用是否有使用游戏引擎，如这里没有使用，因此将其设为 `No Engine`，反之可能是 `Unreal Engine` 或 `Unity` 等。
- `VkInstanceCreateInfo` 描述了创建 Instance 所需要的信息。
    - 因为 Vulkan 本身是一个与平台不相关的接口，因此在 Create Info 中需要描述它所依赖的平台的相关的 Extension（如 Surface），这些 Extension 可以从 GLFW 的接口 `glfwGetRequiredInstanceExtensions` 中获取。
    - CreateInfo 中的 `enabledLayerCount` 和 `ppEnabledLayerNames` 用来指定启用的 [Validation Layers](/ch_05_validation_layers)，这里暂时不启用，因此将 `enabledLayerCount` 设为 0，并将 ppEnabledLayerNames 设为 nullptr。

{% note info %}
Vulkan 设计中，许多函数需要的信息都是通过结构体，而不是一系列函数形参。
{% endnote %}

之后通过 `vkCreateInstance` 函数实际创建 Instance：
```cpp
if (vkCreateInstance(&createInfo, nullptr, &instance) != VK_SUCCESS)
{
	throw std::runtime_error("failed to create instance!");
}
```

这类 Create 函数通常有以下的形参：
1. 一个指针指向创建需要的信息结构体
2. 一个指针指向创建后的回调函数，在本教程中一直是 `nullptr`
3. 一个指针指向存储创建物体内存的对象。

同时几乎所有的 Vulkan 函数都会返回一个 `VkResult` 值表示接口运行是否成功，`VkResult` 的值是 `VK_SUCCESS` 或其他错误值。

之后函数通过 `checkAvailableExtensions` 和 `checkRequiredGlfwExtensions` 函数检查了当前系统支持的 Extensions 和 GLFW 需要的 Extensions。


# 检查可用的 Extensions

可以通过 `vkEnumerateInstanceExtensionProperties` 函数获取所有支持的 extensions，其中第一个参数为用来过滤 extensions 的 [Validation Layers](/ch_05_validation_layers) 的名称，这里暂不使用，第二个参数为 extensions 的数目，第三个参数为所有 extension 的数据。

使用示例如下所示：
```cpp
void HelloTriangleApplication::checkAvailableExtensions(const VkInstanceCreateInfo& createInfo)
{
    uint32_t extensionCount = 0;
    vkEnumerateInstanceExtensionProperties(nullptr, &extensionCount, nullptr);
    std::vector<VkExtensionProperties> extensions(extensionCount);

    vkEnumerateInstanceExtensionProperties(nullptr, &extensionCount, extensions.data());

    std::cout << "available extensions:\n";
    for (const auto& extension : extensions)
    {
        std::cout << '\t' << extension.extensionName << '\n';
    }
}
```

上例中调用了两次 `vkEnumerateInstanceExtensionProperties` 函数，第一次是为了获取数量，第二次则是完整的获取所有的 Extensions。

此时的输出结果如下所示
```text
available extensions:
	VK_KHR_device_group_creation
	VK_KHR_display
	VK_KHR_external_fence_capabilities
	VK_KHR_external_memory_capabilities
	VK_KHR_external_semaphore_capabilities
	VK_KHR_get_display_properties2
	VK_KHR_get_physical_device_properties2
	VK_KHR_get_surface_capabilities2
	VK_KHR_surface
	VK_KHR_surface_protected_capabilities
	VK_KHR_win32_surface
	VK_EXT_debug_report
	VK_EXT_debug_utils
	VK_EXT_direct_mode_display
	VK_EXT_surface_maintenance1
	VK_EXT_swapchain_colorspace
	VK_NV_display_stereo
	VK_NV_external_memory_capabilities
	VK_KHR_portability_enumeration
	VK_LUNARG_direct_driver_loading
```

# 检查需要使用的 GLFW Extensions

如前所述，创建 Vulkan Instance 有平台相关的拓展，这些需要通过 `glfwGetRequiredInstanceExtensions` 获取到，可以通过以下的方式将依赖的 Extensions 打出：

```cpp
void HelloTriangleApplication::checkRequiredGlfwExtensions()
{
    uint32_t glfwExtensionCount = 0;
    const char** glfwExtension = glfwGetRequiredInstanceExtensions(&glfwExtensionCount);

    std::cout << "required extensions: \n";
    for (uint32_t i = 0; i != glfwExtensionCount; ++i)
    {
        std::cout << "\t" << glfwExtension[i] << std::endl;
    }
}
```

此时结果如下所示：

```text
required extensions: 
	VK_KHR_surface
	VK_KHR_win32_surface
```
 
 # Cleaning up

 最后需要处理在应用退出时，销毁创建好 Instance， 该步骤可以通过 `vkDestroyInstance` 函数实现：

 ```cpp
void HelloTriangleApplication::cleanup()
{
    vkDestroyInstance(instance, nullptr);
    glfwDestroyWindow(window);
    glfwTerminate();
}
 ```

 之后所有创建的 Vulkan 资源都需要在销毁 Instance 前被销毁。
