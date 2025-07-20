---
tags:
  - Vulkan
created: 2022-08-28
updated: 2025-05-05
date: 2025-04-13 20:38
published: true
title: 《Vulkan Tutorial》 笔记 13：Fixed Functions
description: 在这一节中，会设定创建 Pipeline 中除了 Shader Modules 剩下的固定函数的一些操作，如 Viewport Size / Color Blending 模式，这些在 Vulklan 中都需要在创建渲染管线时设定，而在如 OpenGL 这样较老的图形 API 中，则可以在运行时修改。
---

{% note info %}
本部分结果可参考 [13_Fixed_Functions](https://github.com/xuejiaW/LearnVulkan/tree/main/_13_Fixed_Functions)
{% endnote %}

{% note info %}
本章涉及到的关键对象和流程如下所示
![](/ch_13_fixed_functions/ch_13_fixed_functions.excalidraw.svg)
{% endnote %}

[Shader Modules](/ch_12_shader_modules) 指定了渲染管线中可编程的Vertex / Fragment 着色器。在这一节中，会设定剩下的固定函数的一些操作，如 Viewport Size / Color Blending 模式，这些在 Vulklan 中都需要在创建渲染管线时设定，而在如 OpenGL 这样较老的图形 API 中，则可以在运行时修改。

在 `GraphicsPipelineMgr` 中定义一系列的函数分别创建最终 Pipeline 创建时所需要的各数据：
```cpp
class GraphicsPipelineMgr
{
public:
    static void createGraphicsPipeline(const std::string& vertFileName, const std::string& fragFileName);
    static void destroyPipelineLayout();
    static VkPipelineLayout pipelineLayout;

private:
    static VkPipelineShaderStageCreateInfo getShaderStageCreateInfo(VkShaderModule shaderModule, VkShaderStageFlagBits stage);
    static VkPipelineVertexInputStateCreateInfo getVertexInputStateCreateInfo();
    static VkPipelineInputAssemblyStateCreateInfo getInputAssemblyStateCreateInfo();
    static VkPipelineViewportStateCreateInfo getViewportStateCreateInfo();
    static VkPipelineRasterizationStateCreateInfo getRasterizationStateCreateInfo();
    static VkPipelineMultisampleStateCreateInfo getMultisamplingStateCreateInfo();
    static VkPipelineColorBlendStateCreateInfo getColorBlendStateCreateInfo();
    static VkPipelineDynamicStateCreateInfo getVKDynamicStateCreateInfo();
    static VkPipelineLayoutCreateInfo getPipelineLayoutCreateInfo();
};
```

{% note primary %}
将原 [Ch 12 Shader Modules](/ch_12_shader_modules) 中创建 Shader Module 的内容也抽象至函数 `createShaderModule` 中。
{% endnote %}


此时 `createGraphicsPipeline` 函数的代码如下所示，后续的部分即将讲解函数实现中的各部分：
```cpp
void GraphicsPipelineMgr::createGraphicsPipeline(const std::string& vertFileName, const std::string& fragFileName)
{
    // Create shader modules
    VkShaderModule vertShaderModule = ShadersMgr::createShaderModule(vertFileName);
    VkShaderModule fragShaderModule = ShadersMgr::createShaderModule(fragFileName);

    // Create shader stages
    VkPipelineShaderStageCreateInfo shaderStages[] = {getShaderStageCreateInfo(vertShaderModule, VK_SHADER_STAGE_VERTEX_BIT),
                                                      getShaderStageCreateInfo(fragShaderModule, VK_SHADER_STAGE_FRAGMENT_BIT)};

    // Fixed functions
    VkPipelineVertexInputStateCreateInfo vertexInput = getVertexInputStateCreateInfo();
    VkPipelineInputAssemblyStateCreateInfo inputAssembly = getInputAssemblyStateCreateInfo();
    VkPipelineViewportStateCreateInfo viewportState = getViewportStateCreateInfo();
    VkPipelineRasterizationStateCreateInfo rasterizer = getRasterizationStateCreateInfo();
    VkPipelineMultisampleStateCreateInfo multisampling = getMultisamplingStateCreateInfo();
    VkPipelineColorBlendStateCreateInfo colorBlending = getColorBlendStateCreateInfo();
    VkPipelineDynamicStateCreateInfo dynamicState = getVKDynamicStateCreateInfo();

    // Pipeline layout
    VkPipelineLayoutCreateInfo pipelineLayoutInfo = getPipelineLayoutCreateInfo();
    if (vkCreatePipelineLayout(LogicDevicesMgr::device, &pipelineLayoutInfo, nullptr, &pipelineLayout) != VK_SUCCESS)
        throw std::runtime_error("Failed to create pipeline layout!");

    // Clean up shader modules
    ShadersMgr::destroyShaderModule(vertShaderModule);
    ShadersMgr::destroyShaderModule(fragShaderModule);
}
```

# Vertex Input State

可以通过 `VkPipelineVertexInputStateCreateInfo` 描述需要传递给顶点着色器的顶点数据的格式，其中主要需要描述两部分：
- `Bindings`: 描述顶点数据之前的间隔，以及顶点数据是逐顶点的还是逐 Instance 的。
- `Attribute Descriptions`：描述传递给顶点 Shader 的属性（如位置 / 颜色等等）该从哪个 binding 中读取，以及偏移量是多少。

`VkPipelineVertexInputStateCreateInfo` 的创建代码如下所示：

```cpp
VkPipelineVertexInputStateCreateInfo GraphicsPipelineMgr::getVertexInputStateCreateInfo()
{
    VkPipelineVertexInputStateCreateInfo vertexInputInfo{};
    vertexInputInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO;
    vertexInputInfo.vertexBindingDescriptionCount = 0;
    vertexInputInfo.pVertexBindingDescriptions = nullptr;
    vertexInputInfo.vertexAttributeDescriptionCount = 0;
    vertexInputInfo.pVertexAttributeDescriptions = nullptr;
    return vertexInputInfo;
}
```

因为在 [Ch 12 Shader Modules](/ch_12_shader_modules) 中顶点的数据是直接记录在顶点中的，所以这里实际上并没有顶点数据需要将 CPU 传递到顶点 Shader 中。因此上述代码中 `Descriptions` 都为 `nullptr`，`Count` 都为 0。

# Input Assembly State

 可以通过 `VkPipelineInputAssemblyStateCreateInfo` 描述从顶点信息中，需要构建出怎么样的几何，以及是否需要进行 图元重启。

一个常见的 `VkPipelineInputAssemblyStateCreateInfo` 构造函数如下所示：
```cpp
VkPipelineInputAssemblyStateCreateInfo GraphicsPipelineMgr::getInputAssemblyStateCreateInfo()
{
    VkPipelineInputAssemblyStateCreateInfo inputAssembly{};
    inputAssembly.sType = VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO;
    inputAssembly.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
    inputAssembly.primitiveRestartEnable = VK_FALSE;
    return inputAssembly;
}
```

其中 `topology` 与 OpenGL 中的 Layout 类似，在 Vulkan 中有以下选项：
- `VK_PRIMITIVE_TOPOLOGY_POINT_LIST`: 由顶点直接构成点
- `VK_PRIMITIVE_TOPOLOGY_LINE_LIST`:  每两个顶点构成一个直线，即 `ABCD`，会构成 `AB` 和 `CD` 两条线段。
- `VK_PRIMITIVE_TOPOLOGY_LINE_STRIP`: 每个顶点与前一个顶点构成一条直线，即 `ABC` 会构成 `AB` 和 `BC` 两条线段。
- `VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST`:  每三个顶点构成一个三角形，即 `ABCDEF`，会构成 `ABC` 和 `DEF` 两个三角形。
- `VK_PRIMITIVE_TOPOLOGY_TRIANGLE_STRIP`: 每个顶点与前两个顶点构成一个三角形，即 `ABCD` 会构成 `ABC` 和 `BCD` 两个三角形

`primitiveRestartEnable` 决定是否开启图元重启功能，当设为 `VK_TRUE` 后，当 indices 为 `0xFFFF` 和 `0xFFFFFFFF` 会开始重启。

# Viewports and Scissors

之后需要设定 Viewport Test 和 Scissor Test：

在 Vulkan 中，Viewport 和 Scissor 的信息都是通过 `VkPipelineViewportStateCreateInfo` 进行描述的。

Viewport 部分如下：
```cpp
VkPipelineViewportStateCreateInfo GraphicsPipelineMgr::getViewportStateCreateInfo()
{
    // ...
    // Use static to ensure it persists beyond the function call:
    static VkViewport viewport{};
    viewport.x = 0.0f;
    viewport.y = 0.0f;
    viewport.width = (float)swapChainExtent.width;
    viewport.height = (float)swapChainExtent.height;
    viewport.minDepth = 0.0f;
    viewport.maxDepth = 1.0f;
    // ...
}
```

其中
- `x, y, width, height` 设定 Viewport 的范围。这里设定为全屏，即与之前创建 SwapChain 的大小是一样的。
- `minDepth` 和 `maxDepth` 定义 Framebuffer 的深度值范围，这里将范围设定为最通常的 $[0,0, 1.0]$

Scissor 定义部分如下：
```cpp
VkPipelineViewportStateCreateInfo GraphicsPipelineMgr::getViewportStateCreateInfo()
{
    // ...
    // Use static to ensure it persists beyond the function call:
    static VkRect2D scissor{};
    scissor.offset = { 0,0 };
    scissor.extent = swapChainExtent;
    // ...
}
```

当 Viewport 和 Scissor 都设定完后，需要将它们通过 `VkPipelineViewportStateCreateInfo` 结合在一起：
```cpp
VkPipelineViewportStateCreateInfo GraphicsPipelineMgr::getViewportStateCreateInfo()
{
    // ...
    VkPipelineViewportStateCreateInfo viewportState{};
    viewportState.sType = VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO;
    viewportState.viewportCount = 1;
    viewportState.pViewports = &viewport;
    viewportState.scissorCount = 1;
    viewportState.pScissors = &scissor;
    // ...
}
```

# Rasterization State

在现代 GPU 中，会在光栅化阶段进行 Depth Testing / Face Culling 等操作：

Vulkan 中可以通过 `VkPipelineRasterizationStateCreateInfo` 对上述一系列测试及光栅化本身进行配置：
```cpp
VkPipelineRasterizationStateCreateInfo GraphicsPipelineMgr::getRasterizationStateCreateInfo()
{
    VkPipelineRasterizationStateCreateInfo rasterizer{};
    rasterizer.sType = VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO;
    rasterizer.depthClampEnable = VK_FALSE;
    rasterizer.rasterizerDiscardEnable = VK_FALSE;
    rasterizer.polygonMode = VK_POLYGON_MODE_FILL;
    rasterizer.lineWidth = 1.0f;
    rasterizer.cullMode = VK_CULL_MODE_BACK_BIT;
    rasterizer.frontFace = VK_FRONT_FACE_CLOCKWISE;
    rasterizer.depthBiasEnable = VK_FALSE;
    rasterizer.depthBiasConstantFactor = 0.0f;
    rasterizer.depthBiasClamp = 0.0f;
    rasterizer.depthBiasSlopeFactor = 0.0f;
    return rasterizer;
}
```

{% note info %}
`depthClampEnable` 控制是否将超出近平面和远平面的片元深度值 clamp 到合法范围。开启该功能需要物理设备支持。  
`polygonMode` 设为 `VK_POLYGON_MODE_LINE` 或 `VK_POLYGON_MODE_POINT` 可能需要启用 `fillModeNonSolid` 设备特性，部分硬件仅支持 `VK_POLYGON_MODE_FILL`。
{% endnote %}

`rasterizerDiscardEnable` 表示所有的几何是否都不需要通过光栅化阶段，如果设为 `VK_TRUE`，基本就不会有任何输出到 Framebuffer。

`polygonMode` 决定怎么根据 Geometry 生成 Fragment，这个数值有以下选项：
- `VK_POLYGON_MODE_FILL`：用 Fragment 填充整个 Polygon
- `VK_POLYGON_MODE_LINE`：用 Line 绘制 Polygon 的边缘（部分硬件需要扩展支持）
- `VK_POLYGON_MODE_POINT`：用点绘制 Polygon 的顶点（部分硬件需要扩展支持）

`cullMode` 用来指定剔除前向面还是背向面，`frontFace` 用来指定怎么样的顶点顺序会被认为是前向面。

`depthBiasEnable` 及后续参数是用来是否需要为 Fragment 的深度添加一个偏移值，整个参数也通常用来被用来绘制 Shadow Mapping。

# Multisampling State

可通过 `VkPipelineMultisampleStateCreateInfo` 配置 MSAA，目前设置为 MSAA 关闭，在后续章节中会进一步说明各配置项：
```cpp
VkPipelineMultisampleStateCreateInfo GraphicsPipelineMgr::getMultisamplingStateCreateInfo()
{
    VkPipelineMultisampleStateCreateInfo multisampling{};
    multisampling.sType = VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO;
    multisampling.sampleShadingEnable = VK_FALSE;
    multisampling.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;
    multisampling.minSampleShading = 1.0f;
    multisampling.pSampleMask = nullptr;
    multisampling.alphaToCoverageEnable = VK_FALSE;
    multisampling.alphaToOneEnable = VK_FALSE;
    return multisampling;
}
```

# Depth and Stencil Testing

如果需要使用 Depth 和 Stencil Buffer，则需要配置 `VkPipelineDepthStencilStateCreateInfo` 对象，目前章节中还不需要，因此不进行配置。

# Color Blending

在 Vulkan 中色彩混合需要通过两个结构体配置 `VkPipelineColorBlendAttachmentState`  和 `VkPipelineColorBlendStateCreateInfo` ：
```cpp
VkPipelineColorBlendStateCreateInfo GraphicsPipelineMgr::getColorBlendStateCreateInfo()
{
    VkPipelineColorBlendAttachmentState colorBlendAttachment{};
    colorBlendAttachment.colorWriteMask = VK_COLOR_COMPONENT_R_BIT |
                                          VK_COLOR_COMPONENT_G_BIT |
                                          VK_COLOR_COMPONENT_B_BIT |
                                          VK_COLOR_COMPONENT_A_BIT;
    colorBlendAttachment.blendEnable = VK_FALSE;
    colorBlendAttachment.srcColorBlendFactor = VK_BLEND_FACTOR_ONE;
    colorBlendAttachment.dstColorBlendFactor = VK_BLEND_FACTOR_ZERO;
    colorBlendAttachment.colorBlendOp = VK_BLEND_OP_ADD;
    colorBlendAttachment.srcAlphaBlendFactor = VK_BLEND_FACTOR_ONE;
    colorBlendAttachment.dstAlphaBlendFactor = VK_BLEND_FACTOR_ZERO;
    colorBlendAttachment.alphaBlendOp = VK_BLEND_OP_ADD;

    VkPipelineColorBlendStateCreateInfo colorBlending{};
    colorBlending.sType = VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO;
    colorBlending.logicOpEnable = VK_FALSE;
    colorBlending.logicOp = VK_LOGIC_OP_COPY;
    colorBlending.attachmentCount = 1;
    colorBlending.pAttachments = &colorBlendAttachment;
    colorBlending.blendConstants[0] = 0.0f;
    colorBlending.blendConstants[1] = 0.0f;
    colorBlending.blendConstants[2] = 0.0f;
    colorBlending.blendConstants[3] = 0.0f;

    return colorBlending;
}
```

{% note primary %}
如果 `blendEnable = VK_FALSE`，则所有混合相关参数会被忽略，颜色值会直接写入 framebuffer。
{% endnote %}

其中 `VkPipelineColorBlendAttachmentState` 配置每一个 Attachment 的混合方式，即针对一个 Attachment 中的每一个颜色通道，是否需要进行混合操作，以及混合的方式。

`VkPipelineColorBlendStateCreateInfo` 配置所有 Attachments 全局的混合配置，其中主要通过 `logicOp` 设置的位运算将各 Attachments 结果混合在一起。另外 `blendConstants` 用来配置混合操作的常量值，如果在配置 `VkPipelineColorBlendAttachmentState` 时设置的 Blend Factor 是和常数相关的，如 `VK_BLEND_FACTOR_CONSTANT_COLOR`，则需要在这里配置常量值。

# Dynamic State

部分之前部分创建的数据，可以在运行时被修改。`VkDynamicState` 用于标识那些可以在渲染过程中动态改变而无需重新创建管线对象的状态。这种设计提高了灵活性和性能，避免因为小的状态变更就必须生成新的固定管线对象，其定义方式如下：

```cpp
VkPipelineDynamicStateCreateInfo GraphicsPipelineMgr::getVKDynamicStateCreateInfo()
{
    // Use static to ensure it persists beyond the function call:
    static VkDynamicState dynamicStates[] = {VK_DYNAMIC_STATE_VIEWPORT, VK_DYNAMIC_STATE_LINE_WIDTH};

    VkPipelineDynamicStateCreateInfo dynamicState{};
    dynamicState.sType = VK_STRUCTURE_TYPE_PIPELINE_DYNAMIC_STATE_CREATE_INFO;
    dynamicState.dynamicStateCount = 2;
    dynamicState.pDynamicStates = dynamicStates;
    return dynamicState;
}
```

对于被定义在 `VkDynamicState` 中的变量，它们在创建 Pipeline 时定义的配置会被无视，且必须在绘制时被赋值。

# Pipeline layout

对于 Shader 中需要使用的 `uniform` 变量，需要在创建 Pipeline 时设定 `VkPipelineLayout` 对象。虽然目前并不需要对 Shader 中传递 `uniform` 对象，但仍然要提供空 `VkPipelineLayout`：
```cpp
VkPipelineLayoutCreateInfo GraphicsPipelineMgr::getPipelineLayoutCreateInfo()
{
    VkPipelineLayoutCreateInfo pipelineLayoutInfo{};
    pipelineLayoutInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO;
    pipelineLayoutInfo.setLayoutCount = 0;
    pipelineLayoutInfo.pSetLayouts = nullptr;
    pipelineLayoutInfo.pushConstantRangeCount = 0;
    pipelineLayoutInfo.pPushConstantRanges = nullptr;
    return pipelineLayoutInfo;
}
```

因为 Pipeline Viewport 可以直接创建，所以可以在创建 Pipeline 时直接创建 Viewport Layout

```cpp
void GraphicsPipelineMgr::createGraphicsPipeline(const std::string& vertFileName, const std::string& fragFileName)
{
    // ...

    // Pipeline layout
    VkPipelineLayoutCreateInfo pipelineLayoutInfo = getPipelineLayoutCreateInfo();
    if (vkCreatePipelineLayout(LogicDevicesMgr::device, &pipelineLayoutInfo, nullptr, &pipelineLayout) != VK_SUCCESS)
        throw std::runtime_error("Failed to create pipeline layout!");

    // ...
}
```

因为创建的 Pipeline Layout 对象会在程序的生命周期中一直存在，因此需要在 `cleanup` 中被删除
```cpp
void GraphicsPipelineMgr::destroyPipelineLayout()
{
    vkDestroyPipelineLayout(LogicDevicesMgr::device, pipelineLayout, nullptr);
}

void HelloTriangleApplication::cleanup()
{
    GraphicsPipelineMgr::destroyPipelineLayout();
    // ...
}
```

