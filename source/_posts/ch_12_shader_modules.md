---
tags:
  - Vulkan
created: 2022-08-26
updated: 2025-04-13
date: 2025-04-13 15:18
published: true
title: 《Vulkan Tutorial》 笔记 12：Shader Module
description: VkShaderModule 类用以封装和管理已编译好的着色器代码，本节将说明如何创建 Shader Module，以及如何将其传递给渲染管线的特定阶段。
---

{% note info %}
本部分结果可参考 [12_Shader_Modules](https://github.com/xuejiaW/LearnVulkan/tree/main/_12_Shader_Modules)
{% endnote %}

{% note info %}
本章涉及到的关键对象和流程如下所示
![](/ch_12_shader_modules/ch_12_shader_modules.excalidraw.svg)
{% endnote %}


与早期图形 API 不同的是，Vulkan 的 Shader 必须是一个`中间字节码格式（intermediate bytecode format）`，而非像 GLSL 或 HLSL 这样可读性高的文本。Vulkan 需要的字节文件类型被称为 `SPIR-V`。

{% note info %}
使用字节文件的好处在于，GPU 厂商所制作的将 Shader 转换为 native code 的编译器会简单很多。原先对于 GLSL 这样的文本，每一家 GPU 厂商对于标准的理解可能存在偏差，因此如果在某家 GPU 上能成功运行的某些冷门的 Syntex，很可能在另一家上就无法运行或存在错误效果。
{% endnote %}

{% note info %}
虽然 Vulkan 要求 `SPIR-V` ，但这不意味着开发者需要手写这些字节文件。Khronos 提供了与厂商无关的编译器的标准，可以将 GLSL 编译为 SPIR-V。
这里会使用谷歌推出的 `glslc.exe` 进行翻译
{% endnote %}

# Vertex Shader

如在 OpenGL 中定义的 [顶点数据](/ch_02_hello_triangle/#顶点数据) 一样，Vulkan 的顶点数据同样在 NDC 空间中，如下所示。只不过 Vulkan 和 OpenGL 对于 NDC 空间 Y 轴定义是相反的（OpenGL 将底部 Y 值定义为 $-1$，而 Vulkan 定义为 $1$）：

![Vulkan NDC Space](/ch_12_shader_modules/image-20220826091812725.png)

为了绘制一个三角形，定义如下的 Vertex Shader：

```glsl
#version 450

#extension GL_ARB_separate_shader_objects: enable
#extension GL_KHR_vulkan_glsl: enable

layout (location = 0) out vec3 fragColor;

vec2 positions[3] = vec2[](
vec2(0.0, -0.5),
vec2(0.5, 0.5),
vec2(-0.5, 0.5)
);

vec3 colors[3] = vec3[](
vec3(1.0, 0.0, 0.0),
vec3(0.0, 1.0, 0.0),
vec3(0.0, 0.0, 1.0)
);

void main()
{
    gl_Position = vec4(positions[gl_VertexIndex], 0.0, 1.0);
    fragColor = colors[gl_VertexIndex];
}
```

{% note info %}
为了暂时保持教程的简洁性，这里直接将顶点数据写在 Vertex Shader 中，避免了传输顶点数据这些 CPU-> GPU 操作的定义。
{% endnote %}

# Fragment Shader

定义的 Fragment Shader 如下：

```glsl
#version 450

#extension GL_ARB_separate_shader_objects: enable

layout (location = 0) in vec3 fragColor;
layout (location = 0) out vec4 outColor;

void main()
{
    outColor = vec4(fragColor, 1.0);
}
```

# 编译 Shaders

因为 `glslc` 已经包含在了 Vulkan 的 SDK 中，因此可以通过类似如下的语句，直接将 shader 编译为 `SPIR-V`：

```shell
C:\VulkanSDK\1.3.204.1\Bin\glslc.exe shader.vert -o vert.spv
C:\VulkanSDK\1.3.204.1\Bin\glslc.exe shader.frag -o frag.spv
```

这样就能将之前章节中的 glsl shader 文件编译为 `.spv` 后缀的 `SPIR-V` 字节码。

{% note primary %}
本教程中可以使用脚本 [CompileShaders](https://github.com/xuejiaW/LearnVulkan/blob/main/CompileShader.ps1) 将一个目录下的所有 shader 文件编译为 `SPIR-V` 字节码。使用方法如下：
```shell
. .\CompileShader.ps1
Compile-Shaders <FolderPath>
```
对于文件夹内的文件，名字将保留并且后缀改为 `.spv`，且加上 Vert/Frag。例如 `shader.vert` 将被编译为 `shaderVert.spv`。
{% endnote %}

# 读取 Shaders

定义类 `ShadersMgr` 管理 Shader 的创建和销毁。为了方便起见，Shader 的创建和销毁都在 `createGraphicsPipeline` 中进行。

```cpp
class ShadersMgr
{
public:
    static VkShaderModule createShaderModule(const std::string& fileName);
    static void destroyShaderModule(VkShaderModule shaderModule);

private:
    static std::vector<char> readFile(const std::string& fileName);
};
```

为了读取之前编译好的 SPIR-V 字节码，首先定义帮助函数 `ShadersMgr::readFile`：
```cpp
std::vector<char> ShadersMgr::readFile(const std::string& fileName)
{
    std::ifstream file(fileName, std::ios::ate | std::ios::binary);
    if (!file.is_open())
        throw std::runtime_error("Failed to open file " + fileName);

    const size_t fileSize = file.tellg();
    std::vector<char> buffer(fileSize);
    file.seekg(0);
    file.read(buffer.data(), fileSize);
    file.close();
    return buffer;
}
```

{% note info %}
在 `readFile` 中，打开文件时使用了 flag `ate` 和 `binary`，后者是因为读取的 SPIR-V Shader 是二进制文件，因此设定为 `binary` 可以减少文本转换。
前者是表明从文件的最后打开，这样的话，在文件一打开时就能知道文件的总长度。因此可以直接通过 `tellg` 获取长度。
{% endnote %}


# 创建 VK Shader Modules

在将获取到的 Shader 传递给渲染管线之前，比如要将它封装在 `VkShaderModule` 中，该类用以封装和管理已编译好的着色器代码，为此创造函数 `ShadersMgr::createShaderModule`：

```cpp
VkShaderModule ShadersMgr::createShaderModule(const std::string& fileName)
{
    auto code = readFile(fileName);

    VkShaderModuleCreateInfo createInfo{};
    createInfo.sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO;
    createInfo.codeSize = code.size();
    createInfo.pCode = reinterpret_cast<const uint32_t*>(code.data());

    VkShaderModule shaderModule;
    if (vkCreateShaderModule(LogicDevicesMgr::device, &createInfo, nullptr, &shaderModule) != VK_SUCCESS)
        throw std::runtime_error("Failed to create shader module!");

    return shaderModule;
}
```

类似的，需要创建 `destroyShaderModule` 函数来销毁 Shader Module：

```cpp
void ShadersMgr::destroyShaderModule(VkShaderModule shaderModule)
{
    vkDestroyShaderModule(LogicDevicesMgr::device, shaderModule, nullptr);
}
```

# Shader Stage 创建

为了真正的使用创建出来的 Shader Module，需要将其指定给管线的特定阶段（如顶点阶段/着色阶段）。指定的过程，可以通过 `VkPipelineShaderStageCreateInfo` 实现：
```cpp
void GraphicsPipelineMgr::createGraphicsPipeline(const std::string& vertFileName, const std::string& fragFileName)
{
    VkShaderModule vertShaderModule = ShadersMgr::createShaderModule(vertFileName);
    VkShaderModule fragShaderModule = ShadersMgr::createShaderModule(fragFileName);

    VkPipelineShaderStageCreateInfo vertShaderStageCreateInfo = {};
    vertShaderStageCreateInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
    vertShaderStageCreateInfo.stage = VK_SHADER_STAGE_VERTEX_BIT;
    vertShaderStageCreateInfo.module = vertShaderModule;
    vertShaderStageCreateInfo.pName = "main";

    VkPipelineShaderStageCreateInfo fragShaderStageCreateInfo = {};
    fragShaderStageCreateInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
    fragShaderStageCreateInfo.stage = VK_SHADER_STAGE_FRAGMENT_BIT;
    fragShaderStageCreateInfo.module = fragShaderModule;
    fragShaderStageCreateInfo.pName = "main";

    VkPipelineShaderStageCreateInfo shaderStages[] = {vertShaderStageCreateInfo, fragShaderStageCreateInfo};

    ShadersMgr::destroyShaderModule(vertShaderModule);
    ShadersMgr::destroyShaderModule(fragShaderModule);
}
```

这里修改了 `createGraphicsPipeline` 函数的签名，增加了两个参数 `vertFileName` 和 `fragFileName`，用来传递编译好的 `.spv` 文件路径。

此时在 `initVulkan` 中调用 `createGraphicsPipeline` 时，传入编译好的 Shader 文件路径用以创建 Graphics Pipeline：

```cpp
void HelloTriangleApplication::initVulkan()
{
    // ...

    GraphicsPipelineMgr::createGraphicsPipeline("Shaders/TriangleVert.spv",
                                                "Shaders/TriangleFrag.spv");
}
```

其中 `stage` 用来指定这个 StageCreateInfo 属于那个阶段。`pName` 用来指定 Shader 的入口，即 Shader 函数中的入口函数，如上面代码中的 `main`。

{% note info %}
`pName` 的存在意味着可以在一个 Shader 中定义不同的入口还是表示不同的 Shader。比如可以在一个 Shader 中定义 `main` 和 `main2`，然后在不同的 Stage 中使用不同的入口函数。
{% endnote %}


在上述代码的最后，将两个创建出来的 Stage 存在在一起构成 `shaderStages`，该变量在进一步创建 GraphicsPipeline 时会需要用到。
