---
tags:
  - Vulkan
created: 2022-02-24
updated: 2025-09-01
date: 2025-03-29 13:45
publishStatus: published
title: 《Vulkan Tutorial》 笔记 02：开发环境
---

{% note info %}
本部分结果可参考 [02_Development_Environment](https://github.com/xuejiaW/LearnVulkan/tree/main/_02_Development_Environment)
{% endnote %}

{% note info %}
本教程使用 VS 2022 进行开发，并使用 C++ 17 标准进行编译。
{% endnote %}

# Vulkan SDK

从 [Vulkan 网站](https://vulkan.lunarg.com/) 下载并安装 Vulkan SDK：
![](/ch_02_development_environment/image-20220224092313285.png)

或通过 [winget](/windows_package_manager) 进行安装：

```shell
winget install KhronosGroup.VulkanSDK
```

通常而言，安装后的路径为 `C:\VulkanSDK\<version>`，从中找到 `Bin/vkcube.exe` 程序并运行，如果运行成功，则说明该设备显卡的驱动支持 Vulkan，运行结果如下：
![vkcube](/ch_02_development_environment/gif_2-24-2022_9-39-31_am.gif)

# GLFW

通过 GLFW 创建系统窗口，可以从其官网直接获取编译好的二进制文件，其解压缩后的目录结构如下：

```text
.
├── LICENSE.md
├── README.md
├── include
│   └── GLFW
│       ├── glfw3.h
│       └── glfw3native.h
├── ....
└── lib─vc2022
    ├── glfw3.dll
    ├── glfw3.lib
    ├── glfw3_mt.lib
    └── glfw3dll.lib
```

我们需要其中的 `include/GLFW` 文件夹和 `lib-vc2022/glfw3.lib` 文件。

# GLM

如 DirectX 12 不同，Vulkan 并没有提供线性代数的库，可以选择使用 GLM 进行相应的运算。将解压缩后的 `glm` 文件夹在之后的项目中需要被使用。

# Settingup Visual Studio

创建 Visual Studio 新工程，并选择 `Windows 桌面向导（Windows Desktop Wizard）` 作为模板，并在创建时选择 `控制台应用程序（Console Application)`，并勾选 `空项目（Empty Project）`。

![](/ch_02_development_environment/image-20220224231002367.png)

将上述的 [GLFW](/ch_02_development_environment/#glfw) 和 [GLM](/ch_02_development_environment/#glm) 添加至解决方案的根目录，并添加至 `Include` 和 `Lib` 文件夹，结构如下：
```text
├───Include
│   ├───GLFW
│   └───glm
│       ├───detail
│       ├───gtc
│       ├───gtx
│       └───simd
└───Lib
        glfw3.lib
```


在 `Project/Vulkan Property Pages` 窗口中添加 Include Directories：
![](/ch_02_development_environment/image-20220224232224877.png)

将 `Additional Include Directories` 设置为 `$(VULKAN_SDK)\Include;$(SolutionDir)include;`

{% note primary %}
这里的 `$(VULKAN_SDK)` 是通过 [winget](/windows_package_manager) 安装 Vulkan SDK 时自动添加的环境变量，通常为 `C:\VulkanSDK\<version>`。
如果你是通过安装包安装的 Vulkan SDK，则需要手动添加该环境变量。
{% endnote %}

然后再 `Linker/General` 中选择 `Additional Library Directories`：
![](/ch_02_development_environment/image-20220224232653361.png)

将 `Additional Library Directories` 设置为 `$(SolutionDir)Lib;$(VULKAN_SDK)\Lib;`

然后在 `Linker/Input` 中选择 `Additional Dependencies`：

![](/ch_02_development_environment/image-20220224233046607.png)

![](/ch_02_development_environment/image-20220224233631948.png)

最后选择支持 `C++ 17` 的编译器：
![](/ch_02_development_environment/image-20220224233429504.png)

此时在 `main.cpp` 中添加如下内容：

```cpp
#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

#include <iostream>

int main() {
    glfwInit();

    glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);
    GLFWwindow* window = glfwCreateWindow(800, 600, "Vulkan window", nullptr, nullptr);

    uint32_t extensionCount = 0;
    vkEnumerateInstanceExtensionProperties(nullptr, &extensionCount, nullptr);

    std::cout << extensionCount << " extensions supported\n";

    while (!glfwWindowShouldClose(window)) {
        glfwPollEvents();
    }

    glfwDestroyWindow(window);

    glfwTerminate();

    return 0;
}
```

并运行程序，命令行中应当显示支持的拓展数目以及一个空白的窗口：
![Running Result](/ch_02_development_environment/2025-03-29-13-09-10.png)


