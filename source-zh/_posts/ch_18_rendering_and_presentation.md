---
tags:
  - Vulkan
created: 2025-04-22
updated: 2025-09-01
publishStatus: published
title: 《Vulkan Tutorial》 笔记 18：Rendering And Presentation
description: 本章描述了最终渲染三角形和将其显示到屏幕上的过程，在其中需要创建信号量（Semaphore）和栅栏（Fence）实现 CPU 与 GPU 及队列间的同步，确保渲染流程各阶段正确有序地执行和呈现
date: 2025-05-08 21:00
---

{% note info %}
本部分结果可参考 [18_RenderingAndPresentation](https://github.com/xuejiaW/LearnVulkan/tree/main/_18_RenderingAndPresentation)
{% endnote %}

{% note info %}
本章涉及到的关键对象和流程如下所示
![](/ch_18_rendering_and_presentation/ch_18_rendering_and_presentation.excalidraw.svg)
{% endnote %}

在本章，将结合之前所有章节中创建的 Vulkan Object，并绘制出一个三角形（终于！）。

在本章节中我们首先会为绘制三角形做最后的准备，创建绘制时需要的同步对象，我们定义类 `SyncObjectMgr` 并在其中定义 `createSyncObjects` 函数来创建同步对象，和 `destroySyncObjects` 函数来销毁同步对象，我们在 `HelloTriangleApplication::initVulkan` 中调用 `createSyncObjects` 函数来创建同步对象，并在 `cleanup` 中调用 `destroySyncObjects` 函数来销毁同步对象。

```cpp
void HelloTriangleApplication::initVulkan()
{
    // ....
    SyncObjectsMgr::createSyncObjects();
}

void HelloTriangleApplication::cleanup()
{
    SyncObjectsMgr::destroySyncObjects();
    // ...
}
```

在 `HelloTriangleApplication` 中增加 `drawFrame` 函数进行绘制，并在 `mainLoop` 函数中调用它：

```cpp
void HelloTriangleApplication::mainLoop()
{
    while (!glfwWindowShouldClose(window))
    {
        glfwPollEvents();
        drawFrame();
    }
}
```

## 同步

Vulkan 的一个核心设计理念是CPU 与 GPU 上执行操作的同步是显式的。CPU 的各种操作的顺序，是依靠各种 Synchronization Primitives 来控制的。

在本章节中，许多操作需要我们显式的控制，因为他们本质上是在 GPU 上执行的操作。我们需要在 CPU 上等待 GPU 完成操作，这些操作包括：
- 从 Swap Chain 中获取 Image
- 执行绘制到获取到的 Image 上的 Commands
- 将绘制好的纹理 Present 到屏幕上，并将其返回给 SwapChain

上述的每一个操作都是通过 CPU 侧单个函数的调用实现的，但这些操作实际上都需要 GPU 侧执行，即函数调用将在实际操作完成前就返回，而且这些异步操作的执行顺序也是未定义的，当某些操作有相互的依赖关系时就需要我们显式的控制它们的执行顺序，这时就是 Synchronization Primitives 发挥作用的时候。

### Semaphore

Semaphore 是 Vulkan 中的 Synchronization Primitives 的一种，它是一个信号量，表示 GPU 侧的操作是否完成。Semaphore 可用于同步同一队列或不同队列上的操作，确保某些 GPU 操作在其他操作完成后再执行。

Vulkan 中有两种信号量类型：binary semaphore 和 timeline semaphore。timeline semaphore 仅在 Vulkan 1.2 及以上版本可用，支持更灵活的同步方式。本教程仅使用 binary semaphore。

一个 binary 信号量要么是 signaled，要么是 unsignaled。signaled 的信号量表示 GPU 侧的操作已经完成，unsignaled 的信号量表示 GPU 侧的操作还没有完成。使用信号量来控制队列操作顺序的方式是：当某个操作完成后，将信号量变为 signaled，另一个操作在执行时需要等待这个信号量变为 signaled 才能执行。

例如，假设我们有信号量 S 和我们想要按顺序执行的队列操作 A 和 B。我们告诉 Vulkan 操作 A 在完成执行时将信号量 S 置为 signaled，而操作 B 在开始执行之前将“等待”信号量 S 为 signaled。当操作 A 完成时，信号量 S 将被置为 signaled，而操作 B 在 S 被置为 signaled 之前不会开始。操作 B 开始执行后，binary semaphore 会自动变为 unsignaled 状态，从而允许它再次使用。

伪代码如下：

```cpp
VkCommandBuffer A, B = ... // record command buffers
VkSemaphore S = ... // create a semaphore

// enqueue A, signal S when done - starts executing immediately
vkQueueSubmit(work: A, signal: S, wait: None)

// enqueue B, wait on S to start
vkQueueSubmit(work: B, signal: None, wait: S)
```

注意在上述代码片段中，`vkQueueSubmit` 函数和 `vkQueueSubmit` 函数的调用都将立即完成，B 操作的等待是发生在 GPU 上。在 CPU 侧是继续允许而不阻塞的。

如果要实现 CPU 阻塞的目的，需要另一种 Synchronization Primitives，Fence。

### Fence

Fence 的作用类似于信号量，也是用于同步执行，但它用于决定 CPU 上的操作执行顺序。简单来说，如果 CPU 侧需要知道 GPU 侧的何时完成某些操作，则使用 Fence。

与信号量类似，fences 处于 Signed 或 unsigned 状态。每当我们提交要执行的操作时，都可以将一个 fence 附加到该操作上。当操作完成时，fence 将被发出信号。然后，我们可以让 CPU 等待该 fence 被发出信号，以确保在 CPU 继续执行之前，GPU 已经完成了所有依赖操作。

 一个实际的例子是截图。假设我们已经在 GPU 上完成了所有的绘制操作。现在需要将图图片从 GPU 转移到 CPU，然后 CPU 将数据从内存保存到文件中。我们有 Command Buffer A 来执行数据传输（Transfer）和 fence F。我们提交 Command Buffer A 和 fence F，然后立即告诉 CPU 等待 F 变为 signed。这里的等待会导致 CPU 的阻塞，直到 Command Buffer A 完成执行。也因为有这个阻塞，当 CPU 进行执行时，说明 GPU 已经完成了绘制和数据传输操作，即 CPU 可以安全的将数据从内存保存至本地文件。

 伪代码如下：

```cpp
VkCommandBuffer A = ... // record command buffer
VkFence F = ... // create a fence

// enqueue A, signal F when done - starts executing immediately
vkQueueSubmit(work: A, signal: F, wait: None)

// wait for F to be signaled
vkWaitForFences(F) // blocks CPU until F is signaled

save_screenshot_to_disk() // won't run until the transfer is done
```

Fences 必须手动重置为 unsigned 的状态。这是因为 fences 用于控制 CPU 的执行，因此 CPU 可以决定何时重置 fence。而信号量是在 GPU 上执行的，因此没法由 CPU介入来决定何时重置，因此信号量会在 GPU 上自动重置为 unsigned 的状态。

{% note info %}
总之，semaphore 用于指定 GPU 上操作的执行顺序，而 fence 用于使 CPU 和 GPU 相互同步。binary semaphore 在被等待后自动变为 unsignaled 状态，fence 需要手动重置。
{% endnote %}

### 创建同步对象

在我们的案例中，由三个地方需要使用同步对象：
- 操作 SwapChain 时：这种情况下需要使用 Semaphore，因为 SwapChain 的处理都在 GPU 中，我们并不想阻塞 CPU。在 SwapChain 的操作时，需要两个 Semaphore
  - 一个用于等待 SwapChain 中有可用的 Image
  - 另一个用于等待 GPU 完成绘制操作，告知系统可以将绘制好的 Image Present 到屏幕上。
- 等待 GPU 完成上一帧的绘制：在这种情况下需要使用 Fence。因为我们想要阻塞 >CPU，避免它在上一帧尚未完成时就提交下一帧的数据。

因此我们在 `SyncObjectMgr` 中定义了两个 Semaphore 和一个 Fence。

```cpp
class SyncObjectsMgr
{
public:
    // ...
    static VkSemaphore imageAvailableSemaphore;
    static VkSemaphore renderFinishedSemaphore;
    static VkFence inFlightFence;
};
```

使用 `createSyncObjects` 函数来创建同步对象，其实现如下，代码逻辑比较直观，分别使用 `VkSemaphoreCreateInfo` 和 `VkFenceCreateInfo` 来创建 Semaphore 和 Fence 对象，并检查创建是否成功：

```cpp
void SyncObjectsMgr::createSyncObjects()
{
    VkSemaphoreCreateInfo semaphoreCreateInfo{};
    semaphoreCreateInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;

    VkFenceCreateInfo fenceCreateInfo{};
    fenceCreateInfo.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;
    fenceCreateInfo.flags = VK_FENCE_CREATE_SIGNALED_BIT;

    if (vkCreateSemaphore(LogicDevicesMgr::device, &semaphoreCreateInfo, nullptr, &imageAvailableSemaphore) != VK_SUCCESS ||
        vkCreateSemaphore(LogicDevicesMgr::device, &semaphoreCreateInfo, nullptr, &renderFinishedSemaphore) != VK_SUCCESS ||
        vkCreateFence(LogicDevicesMgr::device, &fenceCreateInfo, nullptr, &inFlightFence) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to create sync objects for a frame");
    }
}
```

上述调用中使用 `VK_FENCE_CREATE_SIGNALED_BIT` 表示创建的 Fence 对象默认就处于 signaled 的状态，这样在创建后就可以直接使用它，而不需要在使用前重置它。

在 `destroySyncObjects` 函数中销毁 Semaphore 和 Fence 对象：

```cpp
void SyncObjectsMgr::destroySyncObjects()
{
    vkDestroySemaphore(LogicDevicesMgr::device, imageAvailableSemaphore, nullptr);
    vkDestroySemaphore(LogicDevicesMgr::device, renderFinishedSemaphore, nullptr);
    vkDestroyFence(LogicDevicesMgr::device, inFlightFence, nullptr);
}
```

## 绘制

### 等待上一帧画面绘制完成
 
当我们创建了同步对象后，就可以开始绘制了。在 `drawFrame` 函数中，首先需要需要等待 GPU 完成上一帧的绘制操作，这时需要使用 Fence 来阻塞 CPU，直到 GPU 完成操作。我们使用 `vkWaitForFences` 函数来等待 Fence 被 signaled。

```cpp
void HelloTriangleApplication::drawFrame()
{
    vkWaitForFences(LogicDevicesMgr::device, 1, &SyncObjectsMgr::inFlightFence, VK_TRUE, UINT64_MAX);
    // ....
}
```

`vkWaitForFences` 函数可以传递一系列 Fence 对象用于等待，在这里我们仅等待一个 `VkFence` 对象。形参中的布尔值表示是否需要等待传入的所有的 `VkFence` 都被 signaled，`UINT64_MAX` 表示等待的超时时间，这里我们设置为最大值，表示一直等待。

当等待所有的 Fence 都 signaled 后，我们需要重置 Fence 的状态为 unsigned，这样才能在下一帧中使用它。我们使用 `vkResetFences` 函数来重置 Fence 的状态：

```cpp
void HelloTriangleApplication::drawFrame()
{
    // ...
    vkWaitForFences(LogicDevicesMgr::device, 1, &SyncObjectsMgr::inFlightFence, VK_TRUE, UINT64_MAX);
    vkResetFences(LogicDevicesMgr::device, 1, &SyncObjectsMgr::inFlightFence);
    // ...
}
```

### 从 Swap Chain 中获取 Image

通过函数 `vkAcquireNextImageKHR` 来获取 Swap Chain 中的 Image：

```cpp
void HelloTriangleApplication::drawFrame()
{
    // ...
    uint32_t imageIndex = 0;
    vkAcquireNextImageKHR(LogicDevicesMgr::device, SwapChainMgr::swapChain, UINT64_MAX, SyncObjectsMgr::imageAvailableSemaphore, VK_NULL_HANDLE,
                          &imageIndex);
    // ...
}
```

其中：
- `LogicDevicesMgr::device` 是逻辑设备的句柄
- `SwapChainMgr::swapChain` 是 Swap Chain 的句柄
- - `UINT64_MAX` 表示等待的超时时间，这里我们设置为最大值，表示一直等待。
- `SyncObjectsMgr::imageAvailableSemaphore` 是用于等待 GPU 完成绘制操作的 Semaphore 对象
- `VK_NULL_HANDLE` 表示不需要使用 Fence 来等待 GPU 完成操作
- `imageIndex` 是一个输出参数，表示当前可用的 Image 的索引值。

#### 记录 Comamnd Buffer

当获取到可以绘制的 Image 后，就可以开始准备绘制的 Command Buffer。首先需要调用 `vkResetCommandBuffer` 函数来重置 Command Buffer 的状态，然后通过我们在 [Ch 17 Command Buffers](/ch_17_command_buffers) 中定义的函数 `recordCommandBuffer` 来记录绘制的命令。

```cpp
void HelloTriangleApplication::drawFrame()
{
    // ...
    vkResetCommandBuffer(CommandBuffersMgr::commandBuffer, /*VkCommandBufferResetFlagBits*/ 0);
    recordCommandBuffer(CommandBuffersMgr::commandBuffer, imageIndex);
    // ...
}
```

### 提交 CommandBuffer

提交 Command Buffer 的操作是通过 `vkQueueSubmit` 函数，其完整的相关调用如下：

```cpp
void HelloTriangleApplication::drawFrame()
{
    // ...

    VkSubmitInfo submitInfo{};
    submitInfo.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;

    VkSemaphore waitSemaphores[] = {SyncObjectsMgr::imageAvailableSemaphore};
    VkPipelineStageFlags waitStages[] = {VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT};
    submitInfo.waitSemaphoreCount = 1;
    submitInfo.pWaitSemaphores = waitSemaphores;
    submitInfo.pWaitDstStageMask = waitStages;
    submitInfo.commandBufferCount = 1;
    submitInfo.pCommandBuffers = &CommandBuffersMgr::commandBuffer;

    VkSemaphore signalSemaphores[] = {SyncObjectsMgr::renderFinishedSemaphore};
    submitInfo.signalSemaphoreCount = 1;
    submitInfo.pSignalSemaphores = signalSemaphores;

    if (vkQueueSubmit(LogicDevicesMgr::graphicsQueue, 1, &submitInfo, SyncObjectsMgr::inFlightFence) != VK_SUCCESS)
    {
        throw std::runtime_error("failed to submit draw command buffer!");
    }

    // ...
}
```

其中 `pWaitSemaphores` 和 `pWaitDstStageMask` 分别表示 Semaphore 和 Pipeline Stage 的数组，他们之间存在相互绑定的关系，即 Stage 中 Index 为 n 的元素要执行，必须等待 Semaphores 中 Index 为 n 的信号量被 signaled。

如在本例中，要执行 `VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT` 阶段的操作，必须等待 `SyncObjectsMgr::imageAvailableSemaphore` 信号量被 signaled。

{% note info %}
这里等待 `SyncObjectsMgr::imageAvailableSemaphore` 的阶段是 `VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT`，表示在 Color Attachment 输出阶段等待信号量被 signaled。
这也意味着，即使 Image 尚未获取到，诸如 Vertex Shader 这样与 Color Attachment 输出无关的阶段也会被执行。
{% endnote %}

然后的 `pCommandBuffers` 表示需要被提交的 Command Buffer 数组。

最后的 `pSignalSemaphores` 表示在提交的 Command Buffer 被执行完成后，需要被 signaled 的 Semaphore 数组。

### Subpass 依赖

在 [Ch 14 Render Passes](/ch_14_render_passes) 中我们有定义 过 Render Pass 的 Subpass，但当时我们并没有指定 Subpass 之间的依赖关系。

目前我们需要开始绘制了，因此需要定义绘制管线中，每个阶段的依赖关系。

Subpass 之间的依赖关系是通过 `VkSubpassDependency` 来定义的。

目前我们只有一个 SubPass，即用于绘制的 SubPass。但整个 Render Pass 在绘制前和绘制后，还有隐式依赖的 SubPass。

我们在 `GraphicsPepelineMgr::createRenderPass` 中需补充的关于 Subpass 依赖的代码如下：

```cpp
void GraphicsPipelineMgr::createRenderPass()
{
    // ...

    VkSubpassDependency dependency{};
    dependency.srcSubpass = VK_SUBPASS_EXTERNAL;
    dependency.dstSubpass = 0;
    dependency.srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependency.srcAccessMask = 0;
    dependency.dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependency.dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;

    // ...

    renderPassInfo.dependencyCount = 1;
    renderPassInfo.pDependencies = &dependency;

    // ...

}
```

其中关键的就是定义 `VkSubpassDependency` 结构体，其中：
- `srcSubpass` 和 `dstSubpass` 分别表示依赖的 Subpass 的索引值，其中 `dstSubpass` 依赖于 `srcSubpass`。在这里 `VK_SUBPASS_EXTERNAL` 表示依赖的是 Render Pass 外隐式的 Subpass，$0$ 表示当前的 Subpass。
- `srcStageMask` / `dstStageMask`：指定依赖的起点和终点的管线阶段（可能是多个）。
- `srcAccessMask` / `dstAccessMask`：指定需要同步的访问类型（读、写等）

依赖的关系为：只有在 `srcSubpass` 的 `srcStageMask` 管线阶段中所有指定的 `srcAccessMask` 类型访问 **全部** 完成后，`dstSubpass` 的 `dstStageMask` 阶段才能开始对资源进行 `dstAccessMask` 类型的访问


{% note info %}
何为“内存访问同步”？
内存访问同步指的是：为了保证后一个操作能安全地访问某块内存，需要等待前一个操作对这块内存的访问完成。
在前面的案例中，`srcAccessMask` 设置为 0，表示 `srcSubpass` 阶段没有需要同步的内存访问，也就是说 `dstSubpass` 阶段不关心 `srcSubpass` 是否读完或写完内存。
- **有需要同步的内存访问**：前面有人在写/读内存，后面的操作必须等他们写/读完才能继续。
- **没有需要同步的内存访问**：前面没人动这块内存，后面的操作可以直接用，不用等。
{% endnote %}

### Presnetation

当定义好了 Subpass 之间的依赖关系后，就可以设定绘制完成后如何将 Image Present 到屏幕上了并将绘制完的 Image 返回给 SwapChain。通过 `vkQueuePresentKHR` 函数来实现 Presentation：


其完整代码如下：

```cpp
void HelloTriangleApplication::drawFrame()
{
    // ...

    VkPresentInfoKHR presentInfo{};
    presentInfo.sType = VK_STRUCTURE_TYPE_PRESENT_INFO_KHR;

    presentInfo.waitSemaphoreCount = 1;
    presentInfo.pWaitSemaphores = signalSemaphores;

    VkSwapchainKHR swapChains[] = {SwapChainMgr::swapChain};
    presentInfo.swapchainCount = 1;
    presentInfo.pSwapchains = swapChains;
    presentInfo.pImageIndices = &imageIndex;

    vkQueuePresentKHR(LogicDevicesMgr::graphicsQueue, &presentInfo);

    // ...
}
```

这里的实现还是相对直观的，我们需要等待 `signalSemaphores` (即定义的 `SyncObjectsMgr::renderFinishedSemaphore` )被 signaled，然后将 `imageIndex` 中的 Image Present 到 `SwapChainMgr::swapChain` 中。

至此，当运行代码后，应当可以看到绘制出了一个三角形：

![](/ch_18_rendering_and_presentation/2025-04-23-23-10-13.png)

只不过在退出应用后， Validation Layer 会提示我们 `vkDestroySemaphore` 的调用失败了：

```shell
validation layer:Validation Error: [ VUID-vkDestroySemaphore-semaphore-05149 ] | MessageID = 0x93e24db1 | vkDestroySemaphore(): can't be called on VkSemaphore 0xd175b40000000013[] that is currently in use by VkQueue 0x21a1dd8e680[].
```

这是因为 `drawFrame` 的操作是异步的，当程序退出并尝试 Clear 时，一些信号量仍然在 GPU 中处于等待状态，因此是不能被销毁的。

为了解决这个问题，我们可以在 `mainLoop` 正式退出前，通过函数 `vkDeviceWaitIdle` 等待 Logic Device 完成了所有操作：
```cpp
void HelloTriangleApplication::mainLoop()
{
    while (!glfwWindowShouldClose(window))
    {
        glfwPollEvents();
        drawFrame();
    }

    vkDeviceWaitIdle(LogicDevicesMgr::device);
}
```

# Reference
