---
created: 2021-12-14
updated: 2024-04-28
tags:
  - OpenGL
title: 《Learn OpenGL》 Ch 00 创建 Window
description: 本章将描述如何配置 GLAD 和 GLFW 库，后续 OpenGL 的学习工程都将依赖这两个库。在本章的末尾，将给出绘制窗口的代码，以检查 GLAD 和 GLFW 库是否配置准确。
published: true
date: 2024-04-27 09:20
---

{% note primary %}
本部分的实现代码，见 [00_CreateWindow](https://github.com/xuejiaW/LearnOpenGL/tree/main/_00_CreateWindow)
{% endnote %}

在使用 OpenGL 前，首先需要创建 OpenGL 的上下文和用于绘制的窗口等，这些内容是与操作系统相关的。OpenGL 希望成为一个跨平台的工具，因此 OpenGL 本身并不复杂这些内容的处理，需要用户自己来进行相关的环境配置。

好在一些现有的库已经帮助完成了工作，在学习 OpenGL 前首先需要进行的就是相关库的配置。

-   在 [创建工程](/ch_00_creating_a_window/#创建工程) 中，创建后续所有的 OpenGL 教材存储的解决方案文件夹，每一个 OpenGL 教材都会是其中的一个项目。
-   在 [配置 includes 和 libs 文件夹](/ch_00_creating_a_window/#配置_includes_和_libs_文件夹) 中，配置后续所有的项目需要用到的 [GLFW](/ch_00_creating_a_window/#GLFW) 和 [GLAD](/ch_00_creating_a_window/#GLAD)，他们会存储在 `includes` 和 `libs` 文件夹内。
-   在 [配置项目](/ch_00_creating_a_window/#配置项目) 中将 `includes` 和 `libs` 引用给项目。

# 创建工程

首先在 Visual Studio 或 Rider 中创建 C++ 空白解决方案，并创建 `00_HelloWindow` 项目。另外创建空白的 `includes` 和 `libs` 文件夹。

此时的工程结构为：

```text
.
├── 00_HelloWindow
│   ├── 00_HelloWindow.vcxproj
│   ├── 00_HelloWindow.vcxproj.filters
│   └── main.cpp
├── LearnOpenGL.sln
```

{% note primary %}
后续说明以 Rider 作为 IDE 为例。
{% endnote %}

# 配置 includes 和 libs 文件夹

我们将项目所依赖的头文件放置在 `includes` 文件夹内，将依赖的静态库放置在 `libs` 文件夹内，目前主要需要包含 [GLFW](/ch_00_creating_a_window/#GLFW) 和 [GLAD](/ch_00_creating_a_window/#GLAD) 两个库。

## GLFW

GLFW 用来进行创建系统窗口 / 渲染上下文，处理用户输入等操作。

对于 Windows 平台，可以直接从 [GLFW 官网](https://www.glfw.org/download.html) 上下载 `Windows pre-compiled binaries` 版本的文件，解压后的内容应当如下所示：

```text
.
└── glfw─3.4.bin.WIN64
    ├── LICENSE.md
    ├── README.md
    ├── docs
    │   └── html
    ├── include
    │   └── GLFW
    ├── lib─mingw─w64
    │   ├── glfw3.dll
    │   ├── libglfw3.a
    │   └── libglfw3dll.a
    ├── lib─static─ucrt
    │   ├── glfw3.dll
    │   └── glfw3dll.lib
    ├── lib─vc2013
    │   ├── glfw3.dll
    │   ├── glfw3.lib
    │   ├── glfw3_mt.lib
    │   └── glfw3dll.lib
    ├── lib─vc2015
    │   ├── glfw3.dll
    │   ├── glfw3.lib
    │   ├── glfw3_mt.lib
    │   └── glfw3dll.lib
    ├── lib─vc2017
    │   ├── glfw3.dll
    │   ├── glfw3.lib
    │   ├── glfw3_mt.lib
    │   └── glfw3dll.lib
    ├── lib─vc2019
    │   ├── glfw3.dll
    │   ├── glfw3.lib
    │   ├── glfw3_mt.lib
    │   └── glfw3dll.lib
    └── lib─vc2022
        ├── glfw3.dll
        ├── glfw3.lib
        ├── glfw3_mt.lib
        └── glfw3dll.lib
```

我们只关心其中的 `lib-vc2022` 和 `GLFW` 文件夹，将 `GLFW` 拷贝至 `includes` 目录下，将 `lib-vs2022` 中的内容拷贝至 `libs` 目录中。

## GLAD

`GLAD` 库用来简化找寻 OpenGL 实现地址的过程。

因为 OpenGL 实质上是一个标准，并不包含各函数接口的实现。所以不同的显卡厂商而言，会有不同的 OpenGL 函数的实现，这些实现都定义在显卡的驱动中。因此 OpenGL 函数的地址并不能在编译时刻确定，只能在 Runtime 时找到相关的函数指针地址再使用该指针进行操作，这无疑这是一个很繁琐的功能。因此我们需要 `GLAD` 库来简化操作。

`GLAD`库使用了网络服务来简化了编译过程，只要在其[网站](https://glad.dav1d.de/)上选择目标语言和相关 OpenGL 类型之后，就可以直接生成出想要的内容并直接下载，网站上的相关设置如下：

![](/ch_00_creating_a_window/image-20211214094537336.png)

当进行完配置后，下载 `glad.zip` 压缩包：
![glad.zip](/ch_00_creating_a_window/image-20240424224815.png)

解压缩下载到的 `glad.zip` 文件夹，应该得到如下的内容：

```text
.
├── include
│   ├── KHR
│   │   └── khrplatform.h
│   └── glad
│       └── glad.h
└── src
    └── glad.c
```

在进入文件夹，运行如下两个命令来生成需要的静态链接文件。

```
gcc ./src/glad.c -c -I ./include/
ar -rc glad.lib glad.o
```

{% note primary %}
gcc 可以通过 Chocolatey 安装：
```shell
choco install mingw
```
{% endnote %}

然后将 `include` 目录下的内容拷贝至项目的 `includes` 目录下，将 `glab.lib` 拷贝至 `libs` 目录下。

# 配置项目

当完成了 [配置 includes 和 libs 文件夹](/ch_00_creating_a_window/#配置_includes_和_libs_文件夹) 后，整个项目的目录结构为：

```text

├── 00_HelloWindow
│   ├── 00_HelloWindow.vcxproj
│   ├── 00_HelloWindow.vcxproj.filters
│   └── main.cpp
├── LearnOpenGL.sln
├── includes
│   ├── GLFW
│   │   ├── glfw3.h
│   │   └── glfw3native.h
│   ├── KHR
│   │   └── khrplatform.h
│   └── glad
│       └── glad.h
└── libs
    ├── glad.lib
    ├── glfw3.dll
    ├── glfw3.lib
    ├── glfw3_mt.lib
    └── glfw3dll.lib
```

此时需要配置项目，以保证项目正确的使用配置的 `includes` 和 `libs`，首先进入 `Solution Configuration` 选择目标的平台：

![Solution Configuration](/ch_00_creating_a_window/2024-04-24-22-02-40.png)

这里选择为 `Debug|x64`：

![Debug|x64](/ch_00_creating_a_window/image-20240424223630.png)

在 `Project Properties` 的 `Debug|x64` 中的 `VC++ Directories` 中添加 `includes` 和 `libs` 文件夹：

![Include && Library Directories](/ch_00_creating_a_window/2024-04-24-22-38-48.png)

在 `Linker -> Input` 中添加 `glfw3dll.lib` 和 `glad.lib` 和 `opengl32.lib` 的链接：
![Linker](/ch_00_creating_a_window/2024-04-24-22-41-43.png)

至此，`includes` 和 `libs` 都已经配置完成了，将 `main.cpp` 改为以下内容：

```cpp
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <iostream>
const unsigned int SCR_WIDTH = 800;
const unsigned int SCR_HEIGHT = 600;

int main()
{
	glfwInit();
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
	GLFWwindow *window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "LearnOpenGL", NULL, NULL);
	if (window == NULL)
	{
		std::cout << "Failed to create GLFW window" << std::endl;
		glfwTerminate();
		return -1;
	}
	glfwMakeContextCurrent(window);
	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
	{
		std::cout << "Failed to initialize GLAD" << std::endl;
		return -1;
	}
	while (!glfwWindowShouldClose(window))
	{
		glClearColor(0.2f, 0.3f, 0.0f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT);
		glfwSwapBuffers(window);
		glfwPollEvents();
	}
	glfwTerminate();
	return 0;
}
```

此时运行程序，结果应当为一个绿色的窗口，如下所示：

![](/ch_00_creating_a_window/image-20211214094734876.png)

至此整个学习 OpenGL 的环境设置完成。

# Reference

[LearnOpenGL - Creating a window](https://learnopengl.com/Getting-started/Creating-a-window)

