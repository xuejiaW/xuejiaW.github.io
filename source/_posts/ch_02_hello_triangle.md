---
created: 2021-12-14
updated: 2024-05-01
tags:
  - OpenGL
published: true
date: 2024-05-01 08:15
title: 《Learn OpenGL》 Ch 02 Hello Triangle
description: 本章将介绍如何通过 OpenGL 绘制由两个三角形构成的四边形，包括顶点数据的设置，顶点缓冲对象的创建，着色器的编译和链接，以及最后的绘制。
---

{% note primary %}
本部分的实现代码，见 [02_HelloTriangle](https://github.com/xuejiaW/LearnOpenGL/tree/main/_02_HelloTriangle)
{% endnote %}

# 渲染管线

将三维坐标系的内容转换为二维像素的过程是通过 OpenGL 的 渲染管线 控制的，渲染管线可以被进一步拆分为两个部分：第一个是将三维坐标系内容转换为二维坐标系内容，第二个是将二维坐标系内容转换为二维像素。

# 顶点数据

```cpp
constexpr float vertices[] = {
    -0.5f, -0.5f, 0.0f,
    0.5f, -0.5f, 0.0f,
    0.0f, 0.5f, 0.0f
};
```

顶点的位置定义是放在 `标准化设备坐标系（Normalized Device Coordinates, NDC）` 下的，该坐标系是一个从$-1.0\sim 1.0$的坐标系，其中$(0,0)$点处于屏幕的中心。而屏幕坐标系下，坐标系的数值是 $0\sim 1$，其中$(0,0)$出现在屏幕的左上角。标准化设备坐标系如下图所示：

![](/ch_02_hello_triangle/image-20211214233002415.png)

从标准化设备坐标系转换到屏幕坐标系是依赖 `glViewport` 函数。

{% note warning %}
在OpenGL的NDC坐标系下，$(-1,-1)$点处在屏幕的左下角。而在 DX 和VulKan中$(-1,-1)$在左上角
{% endnote %}

# 顶点缓冲对象

为了存储顶点数据，需要再 GPU 上开辟出一块内存，在 OpenGL 中通过 `顶点缓冲对象（vertex buffer objects， VBO）`管理这块内存。通过 VBO，可以一次性的发送多个顶点数据，避免重复运行从 CPU 发送顶点数据到 GPU 这一复杂的操作。

生成顶点缓冲对象的步骤如下所示

```cpp
GLuint vbo;
glGenBuffers(1, &vbo);
glBindBuffer(GL_ARRAY_BUFFER, vbo);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
```

-   `glGenBuffers` 函数为新对象生成了一个 ID，并将新 ID 值赋值给传入的引用。
-   `glBindBuffer` 函数将新缓冲绑定至目标类型，VBO 的类型为 `GL_ARRAY_BUFFER`。
-   `glBufferData` 函数将数据填充到缓冲中，前三个参数都好理解，最后一个参数会决定 GPU 将如何管理这块内存，因为这里装填了顶点信息后，后期并不会有关于顶点的修改，所以这里设为了 `GL_STATIC_DRAW`。如果有大量修改，可以设为 `GL_DYNAMIC_DRAW` ，这样 GPU 就会将信息放到高速访问的内存中，保证之后修改时的效率。

vertices 数据是定义在内存中的， glBufferData 操作是将内存中的 vertices 数据拷贝到显存中由 VBO 表示的地址中去。

虽然是拷贝，但在调用 glBufferData 后仍然不建议修改 vertices ，因为可能会造成 管线堵塞 （Pipeline stall）的问题

# 索引缓冲对象

{% note primary %}
索引缓冲对象并不是必须的
{% endnote %}

通常来说，图形都是由三角形构成，如一个四边形就是由两个三角形构成的。这两个三角形可以通过设置六个点来进行绘制，但这样实际上浪费了内存，一个四边形最少需要四个点就可以确定。而当设置四个点时，需要告诉 OpenGL，这些点该如何组合构成两个三角形。这个步骤需要通过 `索引缓冲对象（Element Buffer Objects，EBO）`来完成。

索引缓冲对象的类型为 `GL_ELEMENT_ARRAY_BUFFER`，其余的绑定流程与 VBO 即为类似，如下所示：

```cpp
GLuint ebo;
glGenBuffers(1, &ebo);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
```

其中的 `indices` 为索引值，顶点数据和索引值可以如下设置：

```cpp
constexpr float vertices[] = {
    -0.5f, -0.5f, 0.0f,
    0.5f, -0.5f, 0.0f,
    0.5f, 0.5f, 0.0f,
    -0.5f, 0.5f, 0.0f};

const unsigned int indices[] = {  // note that we start from 0!
    0, 1, 3,   // first triangle
    1, 2, 3    // second triangle
};
```

表示第 0，1，3 个顶点构成一个三角形，第 1，2，3 个顶点构成另一个三角形。

# 链接顶点数据

如之前所述，顶点数据中可能会包含多种信息，如位置，颜色，法线。因此在通过 VBO 传递了顶点数据后，OpenGL 仍然不知道该如何正确的解析顶点数据，这里就需要用到函数 `glVertexAttribPointer` 。

```cpp
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
```

`glVertexAtrribPointer` 函数中：

-   第一个参数为需要配置的顶点数据，0 即表示顶点着色器中的 `Position 0`，1 则表示顶点着色器中的 `Position 1`。
-   第二个参数是顶点数据的大小，如果传递的是 `vec3` ，则参数应该为 3。
-   第三个是参数类型，这里是 GL_FLOAT
-   第四个是是否 需要标准化，即换到 0~1 的区间内
-   第五个是步长，即一组数据的总大小，比如有一组顶点数据同时存有位置和颜色，各 3 个数值，则这里应该是 6_sizeof(GLfloat)，我们这里仅有位置，所以是 3_sizeof(GLfloat)
-   最后一个是偏移量，如果同时需要设置位置和颜色，则前 3 为位置，后 3 为颜色，当设定颜色时偏移量应该是 `(GLvoid*)3*sizeof(GLfloat)`

`glEnableVertexAttribArray` 则是应用之前的操作，其参数与 `glVertexAttribPointer` 的第一个参数相同。

{% note primary %}
链接顶点数据是针对于当前绑定的 vbo 而言的
{% endnote %}

# 顶点数组对象

`顶点数组对象（vertex array object，VAO）` 如同 VBO 类似，也是个物体，因此同样需要经过生成数组 ID，绑定数组等操作。VAO 的存在是为了管理顶点数据的链接操作，当绑定了一个 VAO 后，各种关于顶点属性的解释都会被存储在这个 VAO 中。

因此关于顶点数据的整个流程如下图所示，VAO 管理了一系列顶点数据的链接过程，而每个数据的链接又与当前绑定的 VBO 相关。同时，VAO 也可以管理 EBO （索引缓冲对象）。

![](/ch_02_hello_triangle/image-20211214233259386.png)

VAO 创建代码如下：

```cpp
unsigned int vao = 0;
glGenVertexArrays(1, &vao);
```

完整流程代码如下：

```cpp
// 绑定VAO
glBindVertexArray(vao);

// 生成并绑定 VBO
GLuint vbo;
glGenBuffers(1, &vbo);
glBindBuffer(GL_ARRAY_BUFFER, vbo);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

// 生成并绑定 EBO
GLuint ebo;
glGenBuffers(1, &ebo);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

// 设置顶点属性指针
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), static_cast<void*>(0));
glEnableVertexAttribArray(0);

// 此时 VAO 已经设置完成，解绑 VBO，EBO，VAO
glBindBuffer(GL_ARRAY_BUFFER, 0);
glBindVertexArray(0);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0); // 必须在解绑VAO后才能解绑EBO
```

{% note warning %}
在解绑 VAO 前不可解绑 EBO，因为 VAO 中包含了 EBO 的设置，如果在 VAO 解绑前解绑 EBO，相当于在 VAO 中删除了相关的设置。

但在解绑 VAO 前可以解绑 VBO，这是因为 VAO 中包含的并不是 VBO 本身，而是关于VBO中数据该如何解析的设置
{% endnote %}

# 着色器

在之前的部分中，已经完成了将顶点数据传递给 GPU 的操作，但 GPU 并不知道如何处理这些数据，这就需要着色器来完成。着色器是运行在 GPU 上的小程序，用来处理图形的各个部分。

着色器最少需要两个，一个是顶点着色器，一个是片段着色器。

## 顶点着色器

顶点着色器是处理顶点数据的着色器，最简单的顶点着色器如下所示：

```glsl
#version 330 core
layout (location = 0) in vec3 aPos;

void main()
{
    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
}
```

其中 `gl_Position` 为 OpenGL 预定义的变量，表示顶点在 `裁剪空间(Clipping Space)` 下的位置。

## 片段着色器

最简单的片段着色器如下：

```glsl
#version 330 core
out vec4 FragColor;

void main()
{
    FragColor = vec4(1.0f, 0.5f, 0.2f, 1.0f);
}
```

片段着色器必须返回一个 `vec4` 变量表示像素最终的颜色。

当定义好了着色器后，需要将其编译，并链接给程序，这样 GPU 才能正确的处理数据。

## 着色器编译

编译着色器的流程如下，它还是传统的生成 ID，绑定 ID 的流程，数据操作的流程：

下面以生成 fragment shader 为例：

```cpp
unsigned int fragmentShader;
fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
glShaderSource(fragmentShader, 1, &shaderSource, NULL);
glCompileShader(fragmentShader);
```

其中函数 `glShaderSource` 用来绑定 shader 的源码，第一个形参为 ID，第二个形参为源码的数量，第三个参数类型必须是 `const GLchar*`，即需要将着色器文件读取成 C 风格字符串后传递给形参 `shaderSource`，第四个参数设为 NULL 表示源码长度不限定长度。

顶点着色器和片段着色器都应该用类似的流程进行编译。

编译结果可以通过以下代码进行检查：

```cpp
GLint success;
GLchar infoLog[512];
glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success);
if(!success)
	glGetShaderInfoLog(id, 512, nullptr, infoLog);
std::cout << "Error in shader"<< infoLog << std::endl;
```

## 着色器链接

当着色器都编译后，需要链接给程序，流程如下：

```cpp
unsigned int shaderProgram;
shaderProgram = glCreateProgram();
glAttachShader(shaderProgram, vertexShader);
glAttachShader(shaderProgram, fragmentShader);
glLinkProgram(shaderProgram);
```

在将着色器链接给程序后，就可以将两个着色器程序删除

```cpp
glDeleteShader(vertexShader);
glDeleteShader(fragmentShader);
```

链接的结果可以通过以下代码进行检查：

```cpp
GLint success;
GLchar infoLog[512];
glGetProgramiv(id, GL_LINK_STATUS, &success);
if(!success)
	glGetProgramInfoLog(id, 512, nullptr, infoLog);
std::cout << "Error in shader" << infoLog << std::endl;
```

## 封装 Shader

关于 Shader 的读取，编译，链接等过程都可以封装进一个头文件[Shader.h](https://github.com/xuejiaW/LearnOpenGL/blob/main/utilities/Shader.h)。当外部使用者使用头文件时，仅需要如下代码即可：

```cpp
Shader shader("./vertex.vert", "./fragment.frag");
shader.use();
```

# 绘制

之前已经准备好了所有绘制需要的内容，即 VAO 的创建和绑定（VAO 中又管理了 VBO 和 EBO）和着色器的编译与链接。之后直接进行绘制即可，绘制前需要绑定 VAO，确认当前绘制的顶点对象，还需要使用着色器程序，确认当前要使用的着色器

```cpp
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
```

之后在渲染循环中，调用绘制命令即可。注意使用了 EBO 和不适用 EBO 时绘制的命令是不同的。

```cpp
// With EBO
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0)

// Without EBO
glDrawArrays(GL_TRIANGLES, 0, 3);
```

`glDrawElements` 函数中，第一个参数为绘制的图元类型，可选的还有 `GL_POINT`， `GL_LINE_STRIP` 等。第二个参数为需要绘制的顶点数量，第三参数为 EBO 的数据 `indices` 设置的类型，第四个参数是需要从 `indices` 的哪个索引开始读取。

`glDrawArrays` 函数中，第一个参数同样为绘制的图元类型，第二个参数为 VBO 中的数据， `vertices` 中开始的索引值，第三个参数为需要绘制的顶点数量

当一切完成后，运行代码的结果为：

![](/ch_02_hello_triangle/image-20211214233511740.png)

