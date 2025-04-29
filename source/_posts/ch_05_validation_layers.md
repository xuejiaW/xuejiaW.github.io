---
tags:
  - Vulkan
created: 2022-03-06
updated: 2025-04-06
date: 2025-03-31 21:11
published: true
title: 《Vulkan Tutorial》 笔记 05： Validation Layers
---

{% note info %}
本部分重构前的代码可参考 [_05_Validation_Layer](https://github.com/xuejiaW/LearnVulkan/tree/main/_05_Validation_Layers)
重构后的代码可参考 [_05a_Refactor_Validation_Layer](https://github.com/xuejiaW/LearnVulkan/tree/main/_05a_Refactor_Validation_Layer)
{% endnote %}

{% note info %}
本章涉及到的关键对象如下所示：
![](/ch_05_validation_layers/validationlayer.excalidraw.svg)
{% endnote %}


在程序变得更加复杂之前，需要了解 Validation Layers 如何帮助调试。


# 什么是 Validation Layers

由于 Vulkan API 的设计理念是最小化驱动的负载，因此在 API 层只有非常少的错误检测。

为此 Vulkan 引入了 `Validation Layers` 系统进行错误检测，`Validation Layers` 会 Hook 进 Vulkan 的函数调用并进行一系列额外的操作。这些操作通常包括：
1. 检测函数的参数是否符合标准，是否有错误使用
2. 追踪资源的创建和销毁，检测是否有资源泄露
3. 检测线程的安全性
4. 输出每一个函数调用及其参数（只有开启特定调试选项时才会输出详细调用日志）
5. 追踪 Vulkan 的函数调用，进行 Profiling 和 replaying

{% note info %}
通常仅在 Debug builds 下启用 Validation Layers，在 Release builds 时关闭（推荐做法，但不是 Vulkan 的强制要求）。
{% endnote %}

{% note info %}
Vulkan 本身并没有提供任何 Validation Layers，但 LunarG Vulkan SDK 提供了一系列 Layers 用于常见的错误检查。
{% endnote %}

# Using validation layers

所有有用的标准化验证都被封装进 SDK 中一个名为 `VK_LAYER_KHRONOS_validation` 的 layer 里。定义变量 `validationLayers` 存储我们需要的 Layers，并增加变量 `enableValidationLayers` 表示是否启用 Layers，通过宏来选择仅在 debug 情况下打开检测：
```cpp
const uint32_t WIDTH = 800;
const uint32_t HEIGHT = 600;

const std::vector<const char*> validationLayers = { "VK_LAYER_KHRONOS_validation" };

#ifdef NDEBUG
const bool enableValidationLayers = false;
#else
const bool enableValidationLayers = true;
#endif
```

增加函数 `checkValidationLayerSupport`，通过 `vkEnumerateInstanceLayerProperties` 检测可用的 Validation Layers。该函数的用法与 `vkEnumerateInstanceExtensionProperties` 类似。

检测函数如下所示，首先通过 `vkEnumerateInstanceLayerProperties` 找到所有可用的 Layers，并检测 `availableLayers` 中是否有需要的  `VK_LAYER_KHRONOS_validation` ： 

```cpp
bool HelloTriangleApplication::checkValidationLayerSupport()
{
    uint32_t layerCount;
    vkEnumerateInstanceLayerProperties(&layerCount, nullptr);

    std::vector<VkLayerProperties> availableLayers(layerCount);
    vkEnumerateInstanceLayerProperties(&layerCount, availableLayers.data());

    bool layerFound = false;
    const char* layerName = validationLayers[0];

    for (const auto& layerProperties : availableLayers)
    {
        if (strcmp(layerName, layerProperties.layerName) == 0)
        {
            layerFound = true;
            break;
        }
    }

    if (!layerFound) return false;
    return true;
}
```

此时修改 `createInstance` 函数如下所示：
```cpp
void HelloTriangleApplication::createInstance()
{
    if (enableValidationLayers && !checkValidationLayerSupport())
    {
        throw std::runtime_error("Validation layers requested, but not available!");
    }
    // ...

    VkInstanceCreateInfo createInfo{};
    // ....

    if (enableValidationLayers)
    {
        createInfo.enabledLayerCount = static_cast<uint32_t>(validationLayers.size());
        createInfo.ppEnabledLayerNames = validationLayers.data();
    }
    else
    {
        createInfo.enabledLayerCount = 0;
    }
    // ...
}
```

# Message callback

Validation Layers 默认会将 debug 信息打印到标准输出，但开发者也可以使用显式的 Callback 来手动处理这些信息，在自定义 Callback 中可以选择对 Log 的等级/类型等进行过滤。

为了实现 Callback，首先需要创建一个 Debug Messenger 并使用扩展 `VK_EXT_debug_utils`。这里封装一个 `getRequiredExtensions()` 函数，该函数会通过 GLFW 获取 surface 相关的扩展以及额外需要的 `VK_EXT_debug_utils` 扩展：
```cpp
std::vector<const char*> HelloTriangleApplication::getRequiredExtensions()
{
    uint32_t glfwExtensionCount = 0;
    const char** glfwExtensions = glfwGetRequiredInstanceExtensions(&glfwExtensionCount);

    // Use glfwExtensions to initialize the vector
    std::vector<const char*> extensions{glfwExtensions, glfwExtensions + glfwExtensionCount};
    if (enableValidationLayers)
    {
        extensions.push_back(VK_EXT_DEBUG_UTILS_EXTENSION_NAME);
    }

    return extensions;
}
```

其中 `VK_EXT_DEBUG_UTILS_EXTENSION_NAME` 等同于 `VK_EXT_debug_utils`，只是前者的命名更加直接。

在 `createInstance` 中使用 `getRequiredExtensions` 取代之前获取扩展的方法，这样在创建 `instance` 时即可使能扩展，如下所示：
```cpp
void HelloTriangleApplication::createInstance()
{
    // ...
    const auto extensions = getRequiredExtensions();

    VkInstanceCreateInfo createInfo{};
    createInfo.enabledExtensionCount = static_cast<uint32_t>(extensions.size());
    createInfo.ppEnabledExtensionNames = extensions.data();
    // ...
}
```

一个 Callback 函数应当如下所示：
```cpp
static VKAPI_ATTR VkBool32 VKAPI_CALL debugCallback(VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
                                                    VkDebugUtilsMessageTypeFlagsEXT messageType,
                                                    const VkDebugUtilsMessengerCallbackDataEXT* pCallbackData, void* pUserData)
{
    std::cerr << "validation layer:" << pCallbackData->pMessage << std::endl;

    return VK_FALSE;
}
```

其中  `VKAPI_ATTR` 和 `VKAPI_CALL` 保证了函数有正确的签名，这样 Vulkan 才能调用它。

第一个参数 `VkDebugUtilsMessageSeverityFlagBitsEXT` 表示 Log 的严重程度，可能的值为：
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT`：琐碎信息
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_INFO_BIT_EXT`：一般信息
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT`：警告信息
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT`：错误信息

第二个参数 `VkDebugUtilsMessageTypeFlagsEXT` 表示 Log 的类型，可能的值为：
- `VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT`：与标准和性能无关的信息
- `VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT`：违背标准的使用信息
- `VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT`：可能导致性能下降的信息

第三个参数 `VkDebugUtilsMessengerCallbackDataEXT` 表示回调信息的具体内容，最重要的数据为：
- `pMessage`：debug 信息字符串
- `pObjects`：包含所有与 debug 信息有关的 Vulkan Object Handle 的数组
- `objectCount`：`pObjects` 数组内元素的数量

最后一个参数 `pUserData` 包含有用户自定义的数据指针，可以在回调触发时传递回来。

Callback 函数返回一个 bool 值，表示触发该 Debug 回调的 Vulkan API 是否应该被放弃。如果返回值为 true，则触发回调的 API 会被中止，且返回 `VK_ERROR_VALIDATION_FAILED_EXT`。因此，通常 Callback 函数会返回 `VK_FALSE`。

为了将该 Callback 赋值给 Vulkan，需要创建一个类型为 `VkDebugUtilsMessengerEXT` 的 `debugMessenger` 来封装该 Callback。Debug Messenger 的创建如下所示：
```cpp
void HelloTriangleApplication::setupDebugMessenger()
{
    if constexpr (!enableValidationLayers) return;

    VkDebugUtilsMessengerCreateInfoEXT createInfo{};
    populateDebugMessengerCreateInfo(createInfo);

    if (CreateDebugUtilsMessengerEXT(instance, &createInfo, nullptr, &debugMessenger) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to setup debug messenger!");
    }
}
```

其中需要首先构建 `VkDebugUtilsMessengerCreateInfoEXT` 结构体，该结构体中的 `messageSeverity` 和 `messageType` 分别指明了需要关心的信息严重程度和类型，`pfnUserCallback` 即为 Callback 函数的指针，`pUserData` 则是用户自定义数据，对应 `debugCallback` 中的 `pUserData`。

由于用于创建 debug messenger 的 `vkCreateDebugUtilsMessengerEXT` 是一个扩展函数，因此需要手动通过 `vkGetInstanceProcAddr` 获取函数地址。

上例中的 `CreateDebugUtilsMessengerEXT` 即封装了相关操作：
```cpp
VkResult CreateDebugUtilsMessengerEXT(VkInstance instance, const VkDebugUtilsMessengerCreateInfoEXT* pCreateInfo,
                                      const VkAllocationCallbacks* pAllocator, VkDebugUtilsMessengerEXT* pDebugMessenger)
{
    const auto func = reinterpret_cast<PFN_vkCreateDebugUtilsMessengerEXT>(vkGetInstanceProcAddr(instance, "vkCreateDebugUtilsMessengerEXT"));

    if (func != nullptr)
        return func(instance, pCreateInfo, pAllocator, pDebugMessenger);

    return VK_ERROR_EXTENSION_NOT_PRESENT;
}
```

同理销毁 debug messager 的函数也需要手动找寻到函数地址：
```cpp
void HelloTriangleApplication::initVulkan()
{
    createInstance();
    setupDebugMessenger();
}
```

```cpp
void HelloTriangleApplication::cleanup()
{
    if (enableValidationLayers)
        DestroyDebugUtilsMessengerEXT(instance, debugMessenger, nullptr);

    vkDestroyInstance(instance, nullptr);
    glfwDestroyWindow(window);
    glfwTerminate();
}
```

# Debugging instance creation and destruction

由于上述 debug messenger 的创建需要在 instance 创建后，而 debug messenger 的销毁需要在 instance 销毁前，所以 `vkCreateInstance` 和 `vkDestroyInstance` 两个 API 无法被上述的 debug messenger 监听。

为了解决这个问题，可以将 `VkDebugUtilsMessengerCreateInfoEXT` 传递给 `VkInstanceCreateInfo` 的 `pNext` 指针。首先将 `VkDebugUtilsMessengerCreateInfoEXT` 的创建封装为单独的函数：
```cpp
void populateDebugMessengerCreateInfo(VkDebugUtilsMessengerCreateInfoEXT& createInfo)
{
    createInfo = {};
    createInfo.sType = VK_STRUCTURE_TYPE_DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT;
    createInfo.messageSeverity = VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT |
                                 VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT;
    createInfo.messageType = VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT |
                             VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT;
    createInfo.pfnUserCallback = debugCallback;
    createInfo.pUserData = nullptr;
}
```

此时 `setupDebugMessenger` 可修改为：
```cpp
void HelloTriangleApplication::setupDebugMessenger()
{
    if constexpr (!enableValidationLayers) return;

    VkDebugUtilsMessengerCreateInfoEXT createInfo{};
    populateDebugMessengerCreateInfo(createInfo);

    if (CreateDebugUtilsMessengerEXT(instance, &createInfo, nullptr, &debugMessenger) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to setup debug messenger!");
    }
}
```

此时 `createInstance` 可**修改**为：
```cpp
void HelloTriangleApplication::createInstance()
{
    // ...

    VkInstanceCreateInfo createInfo{};
    // ...

    VkDebugUtilsMessengerCreateInfoEXT debugCreateInfo;
    if (enableValidationLayers)
    {
        populateDebugMessengerCreateInfo(debugCreateInfo);
        createInfo.enabledLayerCount = static_cast<uint32_t>(validationLayers.size());
        createInfo.ppEnabledLayerNames = validationLayers.data();
        createInfo.pNext = &debugCreateInfo;
    }
    else
    {
        createInfo.enabledLayerCount = 0;
        createInfo.pNext = nullptr;
    }

    // ...
}
```

当 `VkDebugUtilsMessengerCreateInfoEXT` 被传递给 `VkInstanceCreateInfo::pNext` 后，debug messenger 就会在 `vkCreateInstance` 时被使用，且在 `vkDestroyInstance` 后被自动销毁。

# 测试

此时如果将 `cleanup` 中调用 `DestroyDebugUtilsMessengerEXT` 的语句删除并执行程序，当程序销毁时就会产生如下错误，说明 `Validation Layers` 检测到了 `VkDebugUtilsMessengerEXT` 没有被销毁：

```text
Validation layer:Validation Error: [ VUID-vkDestroyInstance-instance-00629 ] Object 0: handle = 0x286ba43b540, type = VK_OBJECT_TYPE_INSTANCE; Object 1: handle = 0xfd5b260000000001, type = VK_OBJECT_TYPE_DEBUG_UTILS_MESSENGER_EXT; | MessageID = 0x8b3d8e18 | OBJ ERROR : For VkInstance 0x286ba43b540[], VkDebugUtilsMessengerEXT 0xfd5b260000000001[] has not been destroyed. The Vulkan spec states: All child objects created using instance must have been destroyed prior to destroying instance (https://vulkan.lunarg.com/doc/view/1.3.204.0/windows/1.3-extensions/vkspec.html#VUID-vkDestroyInstance-instance-00629)
Validation layer:Validation Error: [ VUID-vkDestroyInstance-instance-00629 ] Object 0: handle = 0x286ba43b540, type = VK_OBJECT_TYPE_INSTANCE; Object 1: handle = 0xfd5b260000000001, type = VK_OBJECT_TYPE_DEBUG_UTILS_MESSENGER_EXT; | MessageID = 0x8b3d8e18 | OBJ ERROR : For VkInstance 0x286ba43b540[], VkDebugUtilsMessengerEXT 0xfd5b260000000001[] has not been destroyed. The Vulkan spec states: All child objects created using instance must have been destroyed prior to destroying instance (https://vulkan.lunarg.com/doc/view/1.3.204.0/windows/1.3-extensions/vkspec.html#VUID-vkDestroyInstance-instance-00629)
```

此时的代码结果可见 [05_Validation_Layer](https://github.com/xuejiaW/LearnVulkan/tree/main/_05_Validation_Layers)

# 重构

目前 `HelloTriangleApplication` 类已经膨胀得较为严重，我们将关于 Extension 的部分挪至 `ExtensionsMgr`，将关于 Validation Layers 的部分挪至 `ValidationLayerMgr`，将关于 Debug Messenger 的部分挪至 `DebugMessengerMgr`。

```cpp
class ExtensionsMgr
{
public:
    static void checkAvailableExtensions(const VkInstanceCreateInfo& createInfo);
    static void checkRequiredGlfwExtensions();
    static std::vector<const char*> getRequiredExtensions();
};

class ValidationLayerMgr
{
public:
    static void initialize();
    static void populateInstanceCreateInfo(VkInstanceCreateInfo& createInfo, VkDebugUtilsMessengerCreateInfoEXT& debugCreateInfo);
    static bool checkValidationLayerSupport();
    static bool enableValidationLayers;
};

class DebugMessengerMgr
{
public:
    static void setupDebugMessenger(VkInstance instance);
    static void destroyDebugUtilsMessengerExt(VkInstance instance, const VkAllocationCallbacks* pAllocator);
    static VkResult createDebugUtilsMessengerExt(VkInstance instance, const VkDebugUtilsMessengerCreateInfoEXT* pCreateInfo,
                                                 const VkAllocationCallbacks* pAllocator, VkDebugUtilsMessengerEXT* pDebugMessenger);

    static void populateDebugMessengerCreateInfo(VkDebugUtilsMessengerCreateInfoEXT& createInfo);

private:
    static VkDebugUtilsMessengerEXT debugMessenger;
};
```

这些函数的实现基本与之前的实现相同，只是将函数实现进行了封装。具体实现可参考前文代码，只是将相关逻辑拆分到不同的管理类中，便于维护和扩展。


