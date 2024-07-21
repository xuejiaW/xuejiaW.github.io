---
created: 2021-12-15
updated: 2024-07-21
tags:
  - OpenGL
published: true
date: 2024-05-07 10:11
title: 《Learn OpenGL》 Ch 05 Transformations
description: 本章将介绍如何通过库 GLM 实现位移/旋转/缩放等操作，在本章的最后，会绘制一个在屏幕左下角不断旋转的缩小后的 Quad。
---

{% note primary %}
本部分的实现代码，见 [05_Transformations](https://github.com/xuejiaW/LearnOpenGL/tree/main/_05_Transformations)
{% endnote %}

# GLM

因为 OpenGL 没有自带的矩阵和向量，所以相关的变换操作需要自定义，可以选择依赖 [GLM](https://github.com/g-truc/glm)。[GLM](https://github.com/g-truc/glm) 库封装了一系列三位数学相关的运算，如矩阵相乘，透视矩阵生成等。GLM 是一个纯头文件的库，因此不需要额外的链接和编译，将下载的头文件放到 `include` 下即可。通过以下代码引入：

```cpp
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
```

# 变换

使用 GLM 表示变换时，通常先定义一个四维的矩阵，并依靠 GLM 中提供的函数，对矩阵进行相应操作：

```cpp
glm::mat4 trans = glm::mat4(1.0f);
trans = translate(trans, glm::vec3(-0.5f, -0.5f, 0.0f));
trans = rotate(trans, (GLfloat)glfwGetTime() * glm::radians(90.0f), glm::vec3(0, 0, 1));
trans = scale(trans, glm::vec3(0.5f, 0.5f, 0.5f));
```

{% note warning %}
在 OpenGL 中，vec4 是列矩阵，所以所有的乘法都是左乘。因此虽然通常变换的顺序是缩放，旋转，位移。但代码中表现为位移，旋转，缩放。
{% endnote %}

在 Shader 中对应的矩阵类型 `mat4`，可通过 Uniform 进行赋值

```glsl
uniform mat4 transform;
void main()
{
    gl_Position = transform * vec4(position, 1.0f);
    ...
}
```

在 C++ 侧向 `uniform` 对象传值方式如下：

```cpp
const GLuint transformLoc = glGetUniformLocation(shader.program, "transform");
glUniformMatrix4fv(transformLoc, 1, GL_FALSE, glm::value_ptr(trans));
```

`glUniformMatrix4fv` 的第一个参数为 Uniform 参数的地址，第二个参数为需要传递的矩阵数量，第三个参数指定矩阵是否要进行转置操作，第四个参数传递的是指针，因为 glm 定义的数据并不是 OpenGL 原生支持的数据，所以要用 GLM 的库进行转换。

此时的运行效果如下：

![Result](/ch_05_transformations/gif.gif)

