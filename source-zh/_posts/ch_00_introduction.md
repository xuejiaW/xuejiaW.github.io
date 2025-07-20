---
tags:
  - Vulkan
created: 2022-02-17
updated: 2025-03-29
date: 2025-03-29 13:41
published: true
title: 《Vulkan Tutorial》 笔记 00：简介
---

Vulkan 是由 Khronos 提供了一套新图形 API，旨在为现代显卡提供更优秀的抽象能力，进而可以让开发者可以更好的描述自己需要应用执行的操作。与传统的 OpenGL 和 Direct3D 相比，Vulkan更少的依赖于驱动行为。

{% note info %}
Vulkan 的设计想法与 Direct3D 12 及 Metal 类似，但 Vulkan 提供了跨平台的能力
{% endnote %}

但 Vulkan 为了满足上述的优点，提供了一些更为冗长的 API进而提供更多的控制能力，这就要求开发者关心更多的细节，如如何初始化 Framebuffer，如何为 buffer 或 texture 分配内存等。

