---
tags:
  - Vulkan
created: 2025-05-05
updated: 2025-05-08
date: 2025-04-25 20:38
published: true
title: 《Vulkan Tutorial》 笔记 19：Frame in Flight
description: 对渲染循环进行改进，通过创建多个 Command Buffer 和信号量来实现多帧渲染，允许 CPU 和 GPU 同时工作，避免 CPU 在 GPU 渲染时处于空闲状态。
---

{% note info %}
本部分结果可参考 [19_FramesInFlight](https://github.com/xuejiaW/LearnVulkan/tree/main/_19_FramesInFlight)
{% endnote %}


在之前的章节中，已经可以正确的绘制出一个三角形了，但目前 渲染循环中有一个明显的缺陷，即我们必须等待上一个帧完成才能开始渲染下一个帧，这导致 CPU 侧不必要的闲置，因为当 GPU 正在绘制时，CPU 可以开始准备下一个帧的渲染。

为了解决这个问题，我们需要保证在渲染过程中访问和修改的任何资源都存在多份，在[Ch 09 Swap Chain](/ch_09_swap_chain) 和 [Ch 16 Framebuffers](/ch_16_framebuffers) 中，我们已经创建了多个 `VkImage` 和 `VkFramebuffer` 对象。现在我们需要为每个帧创建一个 Command Buffer，这样 CPU 就可以在 GPU 渲染当前帧时准备下一个帧的渲染命令。以及需要创建多个信号量和 Fence 来确保 每帧中都可以正确处理 CPU 和 GPU 之间的同步。

首先我们需要在 `GraphicsPipelineMgr` 中定义并行的帧数，这里我们选择 `2` 以确保 CPU 和 GPU 可以同步工作，且不会有额外的延迟：
```cpp
class GraphicsPipelineMgr
{
public:
    static constexpr int MAX_FRAMES_IN_FLIGHT = 2;
    // ...
}
```

## 创建多个 Command Buffers

在 `CommandBuffersMgr` 中将原先定义的 `commandBuffer` 改为由 `std::vector<VkCommandBuffer>` 表示的 `commandBuffers`，并将创建 Command Buffer 的函数 `createCommandBuffer` 改为 `createCommandBuffers`，并在其中创建 `MAX_FRAMES_IN_FLIGHT` 个 Command Buffer：

```cpp
// CommandBuffersMgr.h
class CommandBuffersMgr
{
public:
    // ...
    static void createCommandBuffers();
    static std::vector<VkCommandBuffer> commandBuffers;
};
```

```cpp
// CommandBuffersMgr.cpp
void CommandBuffersMgr::createCommandBuffers()
{
    commandBuffers.resize(GraphicsPipelineMgr::MAX_FRAMES_IN_FLIGHT);
    // ...
    allocInfo.commandBufferCount = static_cast<uint32_t>(commandBuffers.size());

    if (vkAllocateCommandBuffers(LogicalDevicesMgr::device, &allocInfo, commandBuffers.data()) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to allocate command buffer!");
    }
}
```

## 创建多个信号量和 Fence

将 `SyncObjectsMgr` 中也要进行类似的处理：
- 将 `imageAvailableSemaphores` 和 `renderFinishedSemaphores` 改为 `std::vector<VkSemaphore>`，并在 `createSyncObjects` 函数中创建 `MAX_FRAMES_IN_FLIGHT` 个信号量
- 将 `inFlightFences` 改为 `std::vector<VkFence>`，并在 `createSyncObjects` 函数中创建 `MAX_FRAMES_IN_FLIGHT` 个 Fence：
- 在 `destroySyncObjects` 函数中销毁所有的信号量和 Fence

```cpp
// SyncObjectsMgr.h
class SyncObjectsMgr
{
public:
    static void createSyncObjects();
    static void destroySyncObjects(); 
    static std::vector<VkSemaphore> imageAvailableSemaphores;
    static std::vector<VkSemaphore> renderFinishedSemaphores;
    static std::vector<VkFence> inFlightFences;
};

// SyncObjectsMgr.cpp
void SyncObjectsMgr::createSyncObjects()
{
    imageAvailableSemaphores.resize(GraphicsPipelineMgr::MAX_FRAMES_IN_FLIGHT);
    renderFinishedSemaphores.resize(GraphicsPipelineMgr::MAX_FRAMES_IN_FLIGHT);
    inFlightFences.resize(GraphicsPipelineMgr::MAX_FRAMES_IN_FLIGHT);

    // ....

    for (size_t i = 0; i < imageAvailableSemaphores.size(); i++)
    {
        if (vkCreateSemaphore(LogicalDevicesMgr::device, &semaphoreCreateInfo, nullptr, &imageAvailableSemaphores[i]) != VK_SUCCESS ||
            vkCreateSemaphore(LogicalDevicesMgr::device, &semaphoreCreateInfo, nullptr, &renderFinishedSemaphores[i]) != VK_SUCCESS ||
            vkCreateFence(LogicalDevicesMgr::device, &fenceCreateInfo, nullptr, &inFlightFences[i]) != VK_SUCCESS)
        {
            throw std::runtime_error("failed to create sync objects for a frame");
        }
    }
}

void SyncObjectsMgr::destroySyncObjects()
{
    for (size_t i = 0; i < imageAvailableSemaphores.size(); i++)
    {
        vkDestroySemaphore(LogicalDevicesMgr::device, imageAvailableSemaphores[i], nullptr);
        vkDestroySemaphore(LogicalDevicesMgr::device, renderFinishedSemaphores[i], nullptr);
        vkDestroyFence(LogicalDevicesMgr::device, inFlightFences[i], nullptr);
    }
}
```

## DrawFrame 处理

目前已经有了多个 Command Buffer 和信号量，接下来我们需要在 `HelloTriangleApplication` 中修改 `drawFrame` 函数，确保每帧使用正确的 Command Buffer 和信号量。我们定义一个 `currentFrame` 变量，用于表示当前帧的索引。在每帧渲染的最后，我们将 `currentFrame` 加 1，并对 `MAX_FRAMES_IN_FLIGHT` 取模，这样就可以在每帧渲染时通过 `currentFrame` 使用不同的 Command Buffer 和信号量。

```cpp
uint32_t HelloTriangleApplication::currentFrame = 0;

void HelloTriangleApplication::drawFrame()
{
    vkWaitForFences(LogicalDevicesMgr::device, 1, &SyncObjectsMgr::inFlightFences[currentFrame], VK_TRUE, UINT64_MAX);
    vkResetFences(LogicalDevicesMgr::device, 1, &SyncObjectsMgr::inFlightFences[currentFrame]);

    uint32_t imageIndex = 0;
    vkAcquireNextImageKHR(LogicalDevicesMgr::device, SwapChainMgr::swapChain, UINT64_MAX, SyncObjectsMgr::imageAvailableSemaphores[currentFrame], VK_NULL_HANDLE,
                          &imageIndex);

    vkResetCommandBuffer(CommandBuffersMgr::commandBuffers[currentFrame], /*VkCommandBufferResetFlagBits*/ 0);
    recordCommandBuffer(CommandBuffersMgr::commandBuffers[currentFrame], imageIndex);

    // ...

    VkSemaphore waitSemaphores[] = {SyncObjectsMgr::imageAvailableSemaphores[currentFrame]};

    // ..
    submitInfo.pCommandBuffers = &CommandBuffersMgr::commandBuffers[currentFrame];

    // ...

    VkSemaphore signalSemaphores[] = {SyncObjectsMgr::renderFinishedSemaphores[currentFrame]};

    // ...

    if (vkQueueSubmit(LogicalDevicesMgr::graphicsQueue, 1, &submitInfo, SyncObjectsMgr::inFlightFences[currentFrame]) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to submit draw command buffer!");
    }

    // ....


    currentFrame = (currentFrame + 1) % GraphicsPipelineMgr::MAX_FRAMES_IN_FLIGHT;
}
```

至此，已经完成了对 Vulkan 渲染循环的改造，确保 CPU 和 GPU 可以并行工作。
