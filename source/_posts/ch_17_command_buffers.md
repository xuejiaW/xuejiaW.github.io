---
tags:
  - Vulkan
created: 2025-04-18
updated: 2025-05-05
date: 2025-04-29 20:38
published: true
title: 《Vulkan Tutorial》 笔记 17：Command Buffers
description: Vulkan 中的命令（如绘制操作和内存传输）并不是通过函数调用直接执行的。开发者必须将所有想要执行的操作记录（Record）在 Command Buffer 对象中。在之前的章节中已经创建了绘制三角形所需要的绝大部分对象，本章定义 Command Buffer 来记录绘制三角形的命令了。
---

{% note info %}
本部分结果可参考 [17_CommandBuffers](https://github.com/xuejiaW/LearnVulkan/tree/main/_17_CommandBuffers)
{% endnote %}

{% note info %}
本章涉及到的关键对象和流程如下所示
![](/ch_17_command_buffers/ch_17_command_buffers.excalidraw.svg)
{% endnote %}


Vulkan 中的命令（如绘制操作和内存传输）并不是通过函数调用直接执行的。开发者必须将所有想要执行的操作记录（Record）在 Command Buffer 对象中。

这样做的好处是，当开发者准备好告诉 Vulkan 我们想要做什么时，所有的命令都可以一起提交，Vulkan 可以更有效地处理这些命令，因为 Vulkan 知道所有命令的上下文。Vulkan 允许在多个线程中记录命令，这样可以充分利用多核 CPU 的优势。

目前我们已经创建了绘制三角形所需要的绝大部分对象，因此可以开始通过 Command Buffer 来记录绘制三角形的命令了。

{% note info %}
记录命令（Record Commands）指的是将 Command Buffer 中的命令写入到 Command Buffer 对象中。提交命令（Submit Commands）指的是将 Command Buffer 中的命令提交给 GPU 执行。
{% endnote %}

## Command Pools

在创建 Command Buffers 之前，我们必须先创建一个 Command Pool。Command Pool 管理用于存储 Command Buffer 的内存，即 Command Buffer 是从 Command Pool 中分配的。

定义类 `CommandBuffersMgr`，并在其中定义成员变量 `VkCommandPool commandPool` 和两个函数 `createCommandPool` 和 `destroyCommandPool`，分别用于创建和销毁 Command Pool。

```cpp
class CommandBuffersMgr
{
public:
    static void createCommandPool();
    static void destroyCommandPool();
    static VkCommandPool commandPool;
};
```

`createCommandPool` 函数的实现如下：

```cpp
void CommandBuffersMgr::createCommandPool()
{
    auto indices = QueueFamilyMgr::findQueueFamilies(PhysicalDevicesMgr::physicalDevice);
    VkCommandPoolCreateInfo poolInfo{};
    poolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
    poolInfo.queueFamilyIndex = indices.graphicsFamily.value();
    poolInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;

    if (vkCreateCommandPool(LogicDevicesMgr::device, &poolInfo, nullptr, &commandPool) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to create command pool!");
    }
}
```

创建 Command Pool 时需要指定 `queueFamilyIndex`，即每个 Command Pool 只能分配提交到特定 Queue Family 的 Command Buffer，这样设计的原因是：

- 不同的 Queue Family 可能有不同的内存访问特性，而将 Command Pool 与 Queue Family 允许驱动程序做出更好的内存分配决策。
- 不同的 Queue Family 代表不同的硬件功能单元，Command Pool 与特定 Queue Family 关联确保命令使用正确的硬件单元

在这里我们需要绘制三角形，因此我们需要使用 `graphicsFamily`，即图形命令队列的 Queue Family。

创建 Command Pool 时指定的 `flags`（类型为 `VK_COMMAND_POOL_CREATE`），有两个可选项：

- `VK_COMMAND_POOL_CREATE_TRANSIENT_BIT`：**性能提示** 标志位，表示从 Pool 中分配的 Command Buffer 需要频繁的被变换。当这个标志被设置时，驱动对 Command Buffer 的的内存分配策略可能会：
    - 使用更快，但生命周期较短的的内存分配器来分配 Command Buffer 的内存
    - 可能会优先考虑写入速度而不是读取速度
    - 可能不会对 Command Buffer 做额外的优化（因为内容很快会被覆盖）
- `VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT`：**行为控制** 标志位，表示 Command Buffer 可以被重置（reset），即 Command Buffer 的内容可以被清除并重新使用。如果这个标志位未被置上，则必须要 Reset 整个 Command Pool 实现重置 Command Buffer 的效果。

{% note info %}
Command Pool 销毁时，会自动释放从该 Pool 分配的所有 Command Buffer，无需手动销毁 Command Buffer。
{% endnote %}

## 分配 Command buffer

在 `CommandBuffersMgr` 中增加成员变量 `VkCommandBuffer commandBuffer`，用于存储 Command Buffer 的句柄和函数 `createCommandBuffer`，用于创建 Command Buffer。

```cpp
class CommandBuffersMgr
{
public:

    // ...
    static void createCommandBuffer();
    static VkCommandBuffer commandBuffer;
};
```

{% note info %}
因为 Command Buffer 将在其 Command Pool 被销毁时自动释放，因此我们不需要定义显式的 `destroyCommandBuffer` 函数。
{% endnote %}

`createCommandBuffer` 函数的实现如下：

```cpp
void CommandBuffersMgr::createCommandBuffer()
{
    VkCommandBufferAllocateInfo allocInfo{};
    allocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    allocInfo.commandPool = commandPool;
    allocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    allocInfo.commandBufferCount = 1;

    if (vkAllocateCommandBuffers(LogicDevicesMgr::device, &allocInfo, &commandBuffer) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to allocate command buffer!");
    }
}
```

其中 `level` 变量指定 Command Buffer 的类型，分为两种：
- `VK_COMMAND_BUFFER_LEVEL_PRIMARY`：主 Command Buffer，可以被提交到 Queue 上执行
- `VK_COMMAND_BUFFER_LEVEL_SECONDARY`：次 Command Buffer，不能被提交到 Queue 上执行，只能被主 Command Buffer 调用

{% note info %}
主命令缓冲区和次命令缓冲区的区别在于主命令缓冲区可以直接提交到队列上执行，而次命令缓冲区不能直接提交到队列上执行，只能被主命令缓冲区调用。
之所以需要次级命令缓冲区，是因为它们可以被多个主命令缓冲区共享，从而减少内存使用和 CPU 开销。也可以让主命令缓冲区可以根据条件决定是否执行特定的次级命令缓冲区，实现复杂的条件渲染逻辑。
{% endnote %}

## 记录命令

最后在 `HelloTriangleApplication` 中增加函数 `recordCommandBuffer`，用于记录绘制指令至 Command Buffer 中。函数的整体实现如下：

```cpp
void HelloTriangleApplication::recordCommandBuffer(VkCommandBuffer commandBuffer, uint32_t imageIndex)
{
    VkCommandBufferBeginInfo beginInfo{};
    beginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
    beginInfo.flags = 0;
    beginInfo.pInheritanceInfo = nullptr;

    if (vkBeginCommandBuffer(commandBuffer, &beginInfo) != VK_SUCCESS)
    {
        throw std::runtime_error("Failed to begin recording command buffer!");
    }

    VkRenderPassBeginInfo renderPassInfo{};
    renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
    renderPassInfo.renderPass = GraphicsPipelineMgr::renderPass;
    renderPassInfo.framebuffer = FrameBuffersMgr::swapChainFramebuffers[imageIndex];
    renderPassInfo.renderArea.offset = {0, 0};
    renderPassInfo.renderArea.extent = SwapChainMgr::imageExtent;

    VkClearValue clearValue{{{0.0f, 0.0f, 0.0f, 1.0f}}};
    renderPassInfo.clearValueCount = 1;
    renderPassInfo.pClearValues = &clearValue;
    vkCmdBeginRenderPass(commandBuffer, &renderPassInfo, VK_SUBPASS_CONTENTS_INLINE);

    vkCmdBindPipeline(commandBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, GraphicsPipelineMgr::graphicsPipeline);
    VkViewport viewport{};
    viewport.x = 0.0f;
    viewport.y = 0.0f;
    viewport.width = static_cast<float>(SwapChainMgr::imageExtent.width);
    viewport.height = static_cast<float>(SwapChainMgr::imageExtent.height);
    viewport.minDepth = 0.0f;
    viewport.maxDepth = 1.0f;
    vkCmdSetViewport(commandBuffer, 0, 1, &viewport);

    VkRect2D scissor{};
    scissor.offset = {0, 0};
    scissor.extent = SwapChainMgr::imageExtent;
    vkCmdSetScissor(commandBuffer, 0, 1, &scissor);

    vkCmdDraw(commandBuffer, 3, 1, 0, 0);

    vkCmdEndRenderPass(commandBuffer);

    if (vkEndCommandBuffer(commandBuffer) != VK_SUCCESS)
    {
        throw std::runtime_error("Failed to record command buffer!");
    }
}
```

其中 `VkBeginCommandBuffer`，`vkCmdBeginRenderPass` 、`vkCmdBindPipeline`、 `vkCmdDraw`和 `vkCmdEndRenderPass` 和 `vkEndCommandBuffer` 是关键的周期函数，他们的作用分别是：
- `vkBeginCommandBuffer`：开始记录 Command Buffer
- `vkCmdBeginRenderPass`：开始渲染 Pass
- `vkCmdBindPipeline`：绑定图形管线
- `vkCmdDraw`：绘制命令 
- `vkCmdEndRenderPass`：结束渲染 Pass
- `vkEndCommandBuffer`：结束记录 Command Buffer

在 `vkBeginCommandBuffer` 和 `vkEndCommandBuffer` 中的所有需要被记录至 Command Buffer 中的命令都以 `vkCmd` 开头，且这些函数都返回 `void` 类型的值。


这里之所以需要调用 `vkCmdSetViewport` 和 `vkCmdSetScissor` 函数，是因为我们在 [Dynamic State](/ch_13_fixed_functions/#dynamic_state) 中指定了 `VK_DYNAMIC_STATE_VIEWPORT` 和 `VK_DYNAMIC_STATE_SCISSOR`，表示我们需要在每次绘制时都设置 Viewport 和 Scissor。

### 开始 Command Buffer

通过函数 `vkBeginCommandBuffer` 开始记录 Command Buffer。函数的参数 `VkCommandBufferBeginInfo` 结构体中有两个重要的成员变量：
- `flags`：指定 Command Buffer 的行为，分为以下几种：
    - `VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT`：表示 Command Buffer 只会被提交一次，并在提交后不会重复使用。
    - `VK_COMMAND_BUFFER_USAGE_RENDER_PASS_CONTINUE_BIT`：表示 Command Buffer 是仅在 Render Pass 中被使用的次级 Command Buffer。
    - `VK_COMMAND_BUFFER_USAGE_SIMULTANEOUS_USE_BIT`：表示 Command Buffer 可以在仍处于执行状态时，被再次提交
- `pInheritanceInfo`：指定 Command Buffer 的继承信息，只有在 `VK_COMMAND_BUFFER_LEVEL_SECONDARY` 时才需要使用。可以指定 Command Buffer 的父级 Command Buffer 和渲染 Pass 的信息。

当调用 `vkBeginCommandBuffer` 函数时，如果 Command Buffer 至今被 Record 过，即之前已经调用过vkBeginCommandBuffer和vkEndCommandBuffer），那么再次调用vkBeginCommandBuffer会自动重置这个命令缓冲区，清除其中所有之前记录的命令。

### 开始 Render Pass

`vkCmdBeginRenderPass` 函数用于开始一个 Render Pass。函数的参数 `VkRenderPassBeginInfo` 结构体中有几个重要的成员变量：
- `renderPass`：指定 Render Pass 的句柄
- `framebuffer`：指定 Framebuffer 的句柄
- `renderArea`：指定 Render Pass 的渲染区域
- `clearValueCount`：指定清除颜色的数量
- `pClearValues`：指定清除颜色的值

对于 `vkCmdBeginRenderPass` 的最后一个形参 `VkSubpassContents` 表示在 Render Pass 中，Drawing Command 将如何被记录：
- `VK_SUBPASS_CONTENTS_INLINE`：表示 Drawing Command 将被记录在 Primary Command Buffer 中
- `VK_SUBPASS_CONTENTS_SECONDARY_COMMAND_BUFFERS`：表示 Drawing Command 是记录在 Secondary Command Buffer 中

之所以需要有 `VkSubpassContents` 是因为这样声明 Command 的来源，驱动可以做出更好的优化决策：
- 当使用 `VK_SUBPASS_CONTENTS_INLINE` 时，驱动知道所有命令都在同一缓冲区中
- 当使用 `VK_SUBPASS_CONTENTS_SECONDARY_COMMAND_BUFFERS` 时，驱动知道需要处理命令缓冲区切换

### 基本渲染命令

在绘制前，首先需要通过 `vkCmdBindPipeline` 函数绑定图形管线，其中的参数 `VkPipelineBindPoint` 指定管线的类型，这里选为 `VK_PIPELINE_BIND_POINT_GRAPHICS`，表示绑定图形管线。

然后需要使用 `vkCmdSetViewport` 和 `vkCmdSetScissor` 函数设置视口和裁剪区域。视口和裁剪区域的设置是为了告诉 Vulkan 如何将渲染结果映射到屏幕上。

之所以这里需要设置 Viewport 和 Scissor，是因为我们在 [Dynamic State](/ch_13_fixed_functions/#dynamic_state) 中指定了 `VK_DYNAMIC_STATE_VIEWPORT` 和 `VK_DYNAMIC_STATE_SCISSOR`，表示我们需要在每次绘制时都设置 Viewport 和 Scissor。

然后我们调用 `vkCmdDraw` 函数绘制三角形，其中的参数 `3` 表示绘制 3 个顶点，`1` 表示绘制 1 个实例，`0` 表示从第 0 个顶点开始绘制，`0` 表示从第 0 个实例开始绘制。

### 结束设置

最后通过 `vkCmdEndRenderPass` 函数结束 Render Pass，并最后通过 `vkEndCommandBuffer` 函数结束 Command Buffer 的记录，即表示 Command Buffer 准备完成。


# Reference
