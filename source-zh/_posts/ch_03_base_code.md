---
created: 2022-02-28
updated: 2025-09-01
tags:
  - Vulkan
date: 2025-03-30 16:42
publishStatus: published
title: 《Vulkan Tutorial》 笔记 03：基本代码结构
---

{% note info %}
本部分结果可参考 [03_Base_Code](https://github.com/xuejiaW/LearnVulkan/tree/main/_03_Base_Code)
{% endnote %}

# 基本结构

三角形应用的基本代码结构如下所示：
```cpp
// HelloTriangleApplication.h
class HelloTriangleApplication {
public:
    void run();

private:
    void initVulkan();
    void mainLoop();
    void cleanup();
};
```

```cpp
// HelloTriangleApplication.cpp
void HelloTriangleApplication::initVulkan() {}

void HelloTriangleApplication::mainLoop() {}

void HelloTriangleApplication::cleanup() {}

void HelloTriangleApplication::run() {
    initVulkan();
    mainLoop();
    cleanup();
}
```

```cpp
// _03_Base_Code.cpp
int main() {
    try {
        HelloTriangleApplication app;
        app.run();
    } catch (const std::exception& e) {
        std::cerr << e.what() << '\n';
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}
```

其中所有初始化操作会放到 `initVulkan` 中，渲染的操作会被放置到 `mainLoop` 中，当窗口关闭时 `cleanup` 会保证相应资源的释放。

在后续的步骤中，还会添加更多的函数和变量到 `HelloTriangleApplication` 中，这里的函数只是表示 `HelloTriangleApplication` 的基本结构函数。

# Resource management

Vulkan 对象会从类似于 `vkCreateXXX` 或者 `vkAllocateXXX` 的函数中创建，对应的当这些物体不再需要时，需要调用 `vkDestoryxxx` 或 `vkFreeXXX` 进行释放。

这些函数的形参会根据具体需要的类型而不同，但所有函数都有一个 `pAllocator` 的形参，这个形参用来指定内存操作后的回调，在本教程中，这个形参始终会被设为 `nullptr`。

# 集成 GLFW

首先需要额外定义 private 函数 `initWindow`，其中使用 GLFW 初始化窗口。我们需要在调用 `initVulkan` 前先调用该 `initWindow` 函数，即 `run` 函数需要修改为：
```cpp
void HelloTriangleApplication::run()
{
    initWindow();
    initVulkan();
    mainLoop();
    cleanup();
}
```

`initWindow` 函数实现如下：

```cpp
constexpr uint32_t WIDTH = 800;
constexpr uint32_t HEIGHT = 600;

void HelloTriangleApplication::initWindow()
{
    glfwInit();
    glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);
    glfwWindowHint(GLFW_RESIZABLE, GLFW_FALSE);
    window = glfwCreateWindow(WIDTH, HEIGHT, "03_Vulkan_Window", nullptr, nullptr);
}
```

因为 GLFW 起初是为 OpenGL 设计的，因此这里需要显式的使用 `GLFW_NO_API` 告知 GLFW 不需要创建 OpenGL 的上下文。

另外当窗口大小变化时，需要额外处理，因此这里显式的设定窗口不可改变`glfwWindowHint(GLFW_RESIZABLE, GLFW_FALSE)`。

`window` 为 `HelloTriangleApplication` 的头文件中定义的私有变量，定义如下：
```csharp
GLFWwindow* window = nullptr;
```

在主循环中，需要判断窗口是否应当关闭，且运行时检测是否有按键时间发生：
```csharp
void HelloTriangleApplication::mainLoop()
{
    while (!glfwWindowShouldClose(window))
    {
        glfwPollEvents();
    }
}
```

在退出时需要清理 GLFW 窗口：
```csharp
void HelloTriangleApplication::cleanup()
{
    glfwDestroyWindow(window);
    glfwTerminate();
}
```
