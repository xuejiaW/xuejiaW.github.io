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
本部分结果重构前的可参考 [_05_Validation_Layer](https://github.com/xuejiaW/LearnVulkan/tree/main/_05_Validation_Layers)
重构后的可参考 [_05a_Refactor_Validation_Layer](https://github.com/xuejiaW/LearnVulkan/tree/main/_05a_Refactor_Validation_Layer)
{% endnote %}

在程序变得更加复杂之前，需要了解 Validation layers 帮助调试。

# 什么是 Validation Layers

因为 Vulkan API 的设计理念是最小化驱动的负载，因此在 API 层只有非常少的错误检测。

为此 Vulkan 引入了 `Validation Layers` 系统进行错误检测，`Validation Layers` 会 Hook 进 Vulkan 的函数调用并进行系一系列额外的操作。这些操作通常有：
1. 检测函数的形参是否符合标准，是否有错误使用
2. 追踪资源的创建和销毁，检测是否有资源的泄露
3. 检测线程的安全性
4. 输出每一个函数调用和它的形参
5. 追踪 Vulkan 的函数调用，进行 Profiling 和 replaying。

{% note info %}
可以仅在 Debug builds 情况下打开 Validation Layers，并在 Release builds 时关闭
{% endnote %}

{% note info %}
Vulkan 本身并没有提供任何的 Validation Layers，但 LumarG Vulkan SDK 则提供了一系列 Layers 用来进行常见的错误检查。
{% endnote %}

# Using validation layers

所有有用的标准化验证都被封装进 SDK 中一个名为 `VK_LAYER_KHRONOS_validation` 的 layer 里，定义变量 `validationLayers` 存储我们需要的 Layers，并增加变量 `enableValidationLayers` 表示是否启用 Layers，通过宏来选择仅在 debug 情况下打开检测：
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

增加函数 `checkValidationLayerSupport`，其中通过函数 `vkEnumerateInstanceLayerProperties` 检测可用的 Validation Layers，该函数的用法与 `vkEnumerateInstanceExtensionProperties` 类似。

整个检测函数如下所示，其首先通过 `vkEnumerateInstanceLayerProperties` 找到所有可用的 Layers，并检测 `availableLayers` 中是否有需要的  `VK_LAYER_KHRONOS_validation` ： 

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

Validation Layers 默认会将 debug 信息打印到标准输出中，但是开发者也可以使用一个显式的 Callback 来手动处理这些信息，在自己实现的 Callback 中，可以选择对 Log 的等级/类型等进行过滤。

为了实现 Callback，首先需要创建一个 Debug Messager 并使用拓展 `VK_EXT_debug_utils`，这里封装一个 `getRequiredExtensions()` 函数，该函数会通过 GLFW 获取 surface 相关的拓展以及额外需要的 `VK_EXT_debug_utils` 拓展：
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

其中 `VK_EXT_DEBUG_UTILS_EXTENSION_NAME` 等同于 `VK_EXT_debug_utils`，只不过前者的命名更加直接。

在 `createInstance` 中使用 `getRequiredExtensions` 取代之前获取需要拓展的方法，这样在创建 `instance` 时即可使能拓展，如下所示：
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

第一个参数 `VkDebugUtilsMessageSeverityFlagBitsEXT` 表示 Log 的严重程度，它可能的值为：
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT`：表示琐碎信息的 Log
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_INFO_BIT_EXT`：表示关心信息的 Log
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT`：表示警告信息的 Log
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT`：表示错误信息的 Log

第二个参数 `VkDebugUtilsMessageTypeFlagsEXT` 表示 Log 的类型，它可能的值为：
- `VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT`：与标准和性能无关的 Log 信息
- `VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT`：违背标准的使用 Log 信息
- `VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT`：可能会导致性能下降的 Log 信息

第三个参数 `VkDebugUtilsMessengerCallbackDataEXT` 表示回调信息的具体内容，内容中最重要的数据为：
- `pMessage`：一个用于表示 debug 信息的 string
- `pObject`：包含所有与 debug 信息有关的 Vulkan Object Handle 的数组
- `objectCount`：`pObject` 数组内元素的数量

最后一个参数 `pUserData` 包含有用户自定义的数据的指针，可以在回调触发时再传递回来。

Callback 函数会返回一个 bool 值，该值表示触发该 Debug 回调的 Vulkan API 是否应该被放弃。如果返回值为 Ture，则触发回调的 API 会被 Abort，且返回 `VK_ERROR_VALIDATION_FAILED_EXT` 的错误。因此，通常而言 Callback 函数会返回 `VK_FALSE`。

为了将该 Callback 赋值给 Vulkan，需要创建一个类型为 `VkDebugUtilsMessagerEXT` 的 `debugMessager`  来封装该 Callback。Deug Messager 的创建如下所示：
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

其中需要首先构建 `VkDebugUtilsMessengerCreateInfoEXT` 结构体，该结构体中的 `messageSeverity` 和 `messageType` 分别指明了需要关心的信息严重程度和类型，`pfnUserCallback` 即为 Callback 函数的指针，`pUserData` 则是用户自己需要传递的数据，对应 `debugCallback` 中的 `pUserData`。

因为用来创建 debug messager 的 `vkCreateDebugUtilsMessengerEXT` 函数是一个拓展函数，因此需要手动的依赖 `vkGetInstanceProcAddr` 函数找寻到函数的地址。

上例中的`CreateDebugUtilsMessengerEXT`  即封装了相关操作：
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

因为上述 debug messager 的创建需要在 instance 创建后，而 debug messager 的销毁需要在 instance 销毁前，所以 `vkCreateInstance` 和 `vkDestroyInstance` 两个 API 无法被上述的 debug messager 监听。

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

此时 `createInstance` 可==修改==为：
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
    }

    // ...
}
```

当 `VkDebugUtilsMessengerCreateInfoEXT` 被传递给 `VkInstanceCreateInfo::pNext` 后， debug messager 就会在 `vkCreateInstance` 时被使用，且在 `vkDestryInstance` 后被自动销毁。

# 测试

此时如果将 `cleanup` 中调用 `DestroyDebugUtilsMessengerEXT` 的语句删除并执行程序，当程序销毁时就会产生如下错误，说明 `Validation Layers` 检测到了 `VkDebugUtilsMessengerEXT` 没有被销毁：

```text
Validation layer:Validation Error: [ VUID-vkDestroyInstance-instance-00629 ] Object 0: handle = 0x286ba43b540, type = VK_OBJECT_TYPE_INSTANCE; Object 1: handle = 0xfd5b260000000001, type = VK_OBJECT_TYPE_DEBUG_UTILS_MESSENGER_EXT; | MessageID = 0x8b3d8e18 | OBJ ERROR : For VkInstance 0x286ba43b540[], VkDebugUtilsMessengerEXT 0xfd5b260000000001[] has not been destroyed. The Vulkan spec states: All child objects created using instance must have been destroyed prior to destroying instance (https://vulkan.lunarg.com/doc/view/1.3.204.0/windows/1.3-extensions/vkspec.html#VUID-vkDestroyInstance-instance-00629)
Validation layer:Validation Error: [ VUID-vkDestroyInstance-instance-00629 ] Object 0: handle = 0x286ba43b540, type = VK_OBJECT_TYPE_INSTANCE; Object 1: handle = 0xfd5b260000000001, type = VK_OBJECT_TYPE_DEBUG_UTILS_MESSENGER_EXT; | MessageID = 0x8b3d8e18 | OBJ ERROR : For VkInstance 0x286ba43b540[], VkDebugUtilsMessengerEXT 0xfd5b260000000001[] has not been destroyed. The Vulkan spec states: All child objects created using instance must have been destroyed prior to destroying instance (https://vulkan.lunarg.com/doc/view/1.3.204.0/windows/1.3-extensions/vkspec.html#VUID-vkDestroyInstance-instance-00629)
```

此时的代码结果可见 [05_Validation_Layer](https://github.com/xuejiaW/LearnVulkan/tree/main/_05_Validation_Layers)


# 重构

目前 `HelloTriangleApplication` 类已经膨胀的较为严重，我们将关于 Extension 的部分挪至 `ExtensionsMgr`，将关于 Validation Layers 的部分挪至 `ValidationLayersMgr`，将关于 Debug Messager 的部分挪至 `DebugMessengerMgr`。

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

这些函数的实现基本上与之前的实现相同，只是将函数的实现进行了封装。


