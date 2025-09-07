---
created: 2021-12-15
updated: 2025-09-01
tags:
  - OpenGL
publishStatus: published
date: 2024-05-03 10:31
title: 《Learn OpenGL》 Ch 04 Textures
description: 在本章中，将学习依赖库 `Stb_Image` 读取纹理并在 OpenGL 中加载使用纹理。还将介绍关于纹理的采样，映射，过滤和 MipMap 等相关内容。
---

{% note primary %}
本部分的实现代码，见 [04_Textures](https://github.com/xuejiaW/LearnOpenGL/tree/main/_04_Textures)
{% endnote %}


# 采样

为了把纹理映射到图形上，我们需要指定三角形的每个顶点对应纹理图片的哪个地方，所以每个顶点都会关联一个 `纹理坐标（Texture Coordinate）`。

如需要给一个三角形贴上砖块的纹理，可以如下设置，其中将三角形的左下角对应纹理的 $(0,0)$ 点。只需要为图形的各个顶点设置纹理坐标，其余部分会自动根据顶点的纹理坐标自动采样。

![](/ch_04_textures/untitled.png)

# 纹理映射

在采样部分中，对于每个顶点，赋值的纹理坐标都处于 $(0,0) \sim (1,1)$ 的范围内。当设置的坐标处于这个范围外时，就需要用到纹理映射。

纹理映射一共有以下几种选项：

-   `GL_REPEAT` ：重复纹理（OpenGL 默认）
-   `GL_MIRRORED_REPEAT` ：镜像重复
-   `GL_CLAMP_TO_EDGE`：边界拉伸
-   `GL_CLAMP_TO_BORDER` ：边界填充（需要设定填充颜色）

![](/ch_04_textures/untitled_1.png)

纹理映射可以分别对图片的三个轴进行设置，图片的三个轴称为 `S, T, R` ，并通过函数 `glTexParameter*` 设置，其中 `*` 表示要设置的参数的类型，如 `i` 表示 int。设置代码如下：

```cpp
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_MIRRORED_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_MIRRORED_REPEAT);
```

第一个参数是表示要设置的图片类型，第二个参数是图片设置的轴，第三个参数是映射的选项。

# 纹理过滤

纹理坐标只考虑了纹理如何与顶点数据结合，但并没有考虑纹理和实际渲染的分辨率。当两者分辨率不同时，就需要用到纹理过滤。

纹理会用实际渲染的分辨率进行渲染，因此纹理会进行相应的拉伸或缩小。因为纹理和实际的像素并没有一一对应，所以实际的像素颜色要经过纹理的插值计算。插值方式有 `线性插值（GL_NEAREST）`和 `邻近插值（GL_LINEAR）`，如下所示：

![临近插值](/ch_04_textures/untitled_2.png)

![线性插值](/ch_04_textures/untitled_3.png)

其中黑十字出现的地方是真实像素的位置，其他的大格表示纹理像素。临近插值的结果由距离最近的像素的颜色决定，线性插值的结果由附近多个像素的颜色平均值决定。

临近插值的画面会导致颗粒感，线性插值的画面虽然更加平滑，但会显得模糊。

![](/ch_04_textures/untitled_4_1.png)

纹理过滤同样使用 `glTexParameter*` 设置，如下所示：

```cpp
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

# MipMap

当一个物体离我们很远时，其在屏幕中显示的范围就会变得很小，而若他仍然使用很大分辨率的纹理，那么 OpenGL 从高分辨率纹理上采样出正确的颜色就很困难。所以理想的状态是，显示范围大的物体使用高分辨率纹理，范围小的物体则使用低分辨率纹理。

OpenGL 采用一个叫多级渐远纹理（Mipmap）的方法来解决这一问题，即有一系列纹理图像，后一个纹理图像的宽高是前一个纹理图像宽高的 1/2。如下所示：

![](/ch_04_textures/untitled_5.png)

可以通过调用函数 `glGenerateMipmaps` 生成 Mipmap。

当使用 Mipmap 时，当纹理在不同级别中切换时，会产生生硬的边界，所以同样需要过滤。当使用了 Mipmap 时有以下四种过滤方式：

-   `GL_NEAREST_MIPMAP_NEAREST`：使用最邻近的多级渐远纹理来匹配像素大小，并使用邻近插值进行纹理采样
-   `GL_LINEAR_MIPMAP_NEAREST`：使用最邻近的多级渐远纹理级别，并使用线性插值进行采样
-   `GL_NEAREST_MIPMAP_LINEAR`：在两个最匹配像素大小的多级渐远纹理之间进行线性插值，使用邻近插值进行采样
-   `GL_LINEAR_MIPMAP_LINEAR`：在两个邻近的多级渐远纹理之间使用线性插值，并使用线性插值进行采样

设置采样代码如下：

```cpp
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

注意，仅在实际渲染的分辨率小于图片分辨率时，mipmap 才有用，即关于 mipmap 的采样数值，只能在设置对象为 `GL_TEXTURE_MIN_FILTER` 时采用。

# 读取图片

读取图片依赖于 Sean Barrett 开发的 [stb_image](https://github.com/nothings/stb/blob/master/stb_image.h) 头文件，在下载头文件并放到 include 文件夹后，通过以下代码引入头文件：

```cpp
#define STB_IMAGE_IMPLEMENTATION
#include <stb_image.h>
```

下载 [container](https://learnopengl.com/img/textures/container.jpg) 图片，并放到 `resources` 文件夹下。

通过 `stbi_load`函数读取图片文件，如下所示：

```cpp
int width, height, nrChannels;
unsigned char *data = stbi_load("container.jpg", &width, &height, &nrChannels, 0);
```

其中获取到的 `data` 即为图片数据，供之后 OpenGL 加载使用。

{% note warning %}
用上述数据加载图片后，会发现图片上下颠倒，这是因为 OpenGL 认为$(0,0)$ 处于左下角，而图片定义的 $(0,0)$ 点处于左上角。
可以通过设置 `stbi_set_flip_vertically_on_load(true);` 直接让 stb 读取的图片进行反转。
{% endnote %}

# 加载纹理

OpenGL 加载纹理的流程如下

```cpp
unsigned int texture;
glGenTextures(1, &texture);

glBindTexture(GL_TEXTURE_2D, texture);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
glGenerateMipmap(GL_TEXTURE_2D);
```

如同生成和绑定 VBO，VAO 等，图片的加载也需要先创建图片 ID，再绑定图片 ID。

通过函数 `glTexImage2D` 加载图片数据

-   第一个参数为图片的类型
-   第二个参数为 Mipmap 的等级，即可以通过该函数单独的为某一 level 的 MipMap 设置
-   第三个参数为目标图片的纹理类型，这里读取的是 JPG，没有 alpha 通道，所以使用 `GL_RGB`，如果读取的是 PNG 等有 alpha 通道的图片，需要使用 `GL_RGBA`
-   第四，第五个参数为目标图片的宽高
-   第六个参数因为历史原因，始终为 0
-   第七个参数为源图片的纹理，即通过 `stbi_load` 加载的图片的纹理类型，这里是 `GL_RGB`
-   第八个参数为源图片的数据类型
-   第九个参数为源图片数据

在加载完成后，可通过 `glGenerateMipmap` 函数创建 MipMap。

然后可以通过 `glTexParameteri` 函数设置纹理的过滤和映射。
```cpp
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

# 应用纹理

## 设置 Texcoord

当使用纹理时，对于每一个顶点，都需要设置 Texcoord，所以每个顶点需要额外增加两个 float 来表示 Texcoord：

```cpp
constexpr float vertices[] = {
    -0.5f, -0.5f, 0.0f, 0.0f, 0.0f,
    0.5f, -0.5f, 0.0f, 1.0f, 0.0f,
    0.5f, 0.5f, 0.0f, 1.0f, 1.0f,
    -0.5f, 0.5f, 0.0f, 0.0f, 1.0f
};
```

相对应的，顶点着色器也要新增 Texcoord 的 layout 输入：

```glsl
layout (location=0) in vec3 pos;
layout (location=1) in vec2 tex;

out vec2 tex;

void main()
{
    // ...
    tex = atex;
}
```

传递 layout 数据的语句也需要相应的改变：

```cpp
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void *)0);
glEnableVertexAttribArray(0);
glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void *)(3 * sizeof(float)));
glEnableVertexAttribArray(1);
```

## 纹理单元

在加载纹理部分中已经 CPP 侧将纹理读取至了新生成的纹理 ID 中，之后需要将纹理传递给着色器。纹理在着色器部分的对应类型为 `sampler2D`。每一个 `sampler2D` 对象被称为纹理单元，通常来说 OpenGL 最少有 16 个纹理单元。如下代码，就定义了一个纹理单元

在 Fragment Shader 中，需要获取由 Vertex Shader 传递过来的 tex，

```glsl
in vec2 tex;
uniform sampler2D ourTexture;
```

在 CPP 部分中，通过函数 `glActiveTexture` ， `glBindTexture` 和 `glUniform1i`的组合，将纹理传递给着色器。

```cpp
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, texture);
glUniform1i(glGetUniformLocation(shader.Program, "outTexture"), 0);
```

其中的 `GL_TEXTURE0` 表示是第一个纹理单元，在激活了该单元后，通过 `glBindTexute` 将纹理 ID 与该纹理单元结合在一起。然后通过 `glUniform1i` 将纹理单元传递到着色器中，例子中 `glUniform1i` 的第二个形参，就是要传递的纹理单元，因为这里是第一个纹理单元，所以传递 0。如果有多个纹理单元，也是使用同样的传递方法，如下：

```cpp
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, texture1);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, texture2);
glUniform1i(glGetUniformLocation(ourShader.ID, "texture1"), 0);
glUniform1i(glGetUniformLocation(ourShader.ID, "texture2"), 1);
```

## 解析纹理

GLSL 有内置的函数 `texture` 来解析纹理，第一个参数为类型是 `sampler2D` 的纹理变量，第二个参数为类型是 `vec2` 的 Texcoord 变量。函数的返回值是像素的颜色，因此可以直接作为着色器的输出：

```glsl
FragColor = texture(ourTexture, TexCoord);
```

此时的效果为：

![](/ch_04_textures/untitled_6.png)


