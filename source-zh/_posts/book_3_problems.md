---
created: 2022-01-05
updated: 2025-09-01
tags:
  - GPU
title: 《Render Hell》 第三部分 常见问题
publishStatus: published
date: 2023-05-29 22:04
description: 本部分中介绍了渲染过程中常见的问题，这些问题的解决方式会在第四部分解决方案中阐述
---


# Many Draw Calls / Many Commands

对于一个 API 而言，它不仅仅是将命令发送给 GPU，它还会有额外的如驱动翻译等的开销，因此应当尽可能的使用更少的命令。

{% note info %}
对于新的图形 API，如 DirectX12， Vulkan 等，命令的开销会相对较少，但仍然应当尽可能的减少命令的数量。
{% endnote %}

如果有一系列很小的 Mesh，相较于每个 Mesh 都使用一个 Drawcall，更理想的做法是将这些 Meshes 组合成一个更大的 Mesh，并通过一个 Drawcall 传送。

因为对于 GPU 而言，绘制一个小 Mesh 的时间是非常快的，而 CPU 将数据发送给 GPU 的时间是相对较长的。

如果是每一个 Mesh 一个 Draw Call 的处理方式，往往瓶颈会出现在 CPU 侧。

# Many Meshes and Materials

如果要渲染许多 Mesh 并使用不同的 Materials，除了需要用许多的命令外，还会额外带来 `Flush Pipeline` 的问题。

如果多个 Meshes 是用同一种渲染状态，则在一个 Mesh 完成后，另一个 Mesh 可以被很快的装填。而如果更改了材质状态，则管线中的一部分数据需要被刷新，才能进行下一个 Mesh 的绘制，这会造成额外的开销。

# Meshes and Multi-Materials

如果一个 Mesh 被赋予了多个材质，则该 Mesh 会被切分成多份再被送入 Command Buffer 中，这无疑也会造成多个 Draw Call 的产生。如下示意图所示，球的左半部分和右半部分各需要一个 Draw Call：
![Multi-Materials](/book_3_problems/copy_data_from_hdd_to_ram_vram_01_multimaterial.gif)

# Thin Triangles

如在 Book 2 的 [Rasterizing](/book_2_pipeline/#Rasterizing) 中所属，光栅化后的单位是 `pre-pixles` ，Warp 中的四个线程会被分给一个 `pre-pixels` 。对于一些没有真正覆盖三角形的 Pixels 而言，它们的颜色并无意义，因此虽然它们在 pre-pixels 中但并不会有线程去计算它们的颜色，这也就造成了 Warp 中线程的浪费。这种性能浪费会比较常见的出现在狭长的三角形中，如下示意图所示：
![Thin Triangles 造成的性能浪费](/book_3_problems/pipeline_rasterizing03_.gif)

# Reference

[Render Hell – Book III | Simon schreibt.](http://simonschreibt.de/gat/renderhell-book3/)
