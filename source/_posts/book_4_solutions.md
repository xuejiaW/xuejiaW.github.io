---
created: 2022-01-05
updated: 2023-05-30
tags:
    - GPU
title: 《Render Hell》 第四部分 解决方法
published: true
date: 2023-05-29 22:18 
description:  这一部分会阐述解决第三部分常见问题中描述的问题的方法
---

# Sorting

对于多个 Meshes，多个 Materials 的情况，可以通过排序将同一种 Material 的 Mesh 放在一起减少 Render State 的切换，如下所示：
![重新排序以减少 State 切换](/book_4_solutions/optimisation_sorting_01.gif)

# Batching

在排序完，仍然存在的问题是多个 Meshes 会造成多个 Commands 进而引起过多开销。因此应当将多个 Meshes 结合在一起，通过一次 Draw Call 进行渲染。在调用 API 前将多个 Meshes 合并在一起的过程称为 `Batch` 。

![Batching](/book_4_solutions/optimisation_batching_02.gif)

{% note info %}
在 RAM 中将多个 Mesh 结合在一起也是需要开销的（CPU 时间），因此通常选择将静态的 Mesh，如房子，石头等Batch 在一起。 而如果是一系列运动的子弹，因为它们的位置每帧都会移动，所以相当于每帧都需要重新 `Batch`，这会造成巨大的开销。
{% endnote %}

Batch 还会造成一个额外的问题。在未进行 Batch 时，如果一个 Mesh 在 Frustum 外，则它会被直接 Cull 掉。但如果将多个 Meshes Batch 成一个大 Mesh，则即使只有其中的一小部分处在 Frustum 中，整个 Mesh 仍然会被认为需要被绘制。

因此相对于 `Batching`，更好的解决方法是 `Instancing`

# Instancing

`Instancing` 是提交一次 Mesh，但会告知 GPU 绘制多次，并在 RAM 中指定每次绘制时需要用的状态。因此 `Instancing` 适合同一个 Mesh 要多次绘制的情况，如草，子弹。示意图如下所示：
![Instancing](/book_4_solutions/20200129181033200.gif)

# Multi-Material Shader

为了解决 Book3 中提到的 [Meshes and Multi-Materials](/book_3_problems/#Meshes_and_Multi-Materials) 导致多 Draw Call 的问题，一个解决思路是将多个材质需要用到的数据合并在一个 Shader 中，相当于将多个 Material 合并成了一个 Material。

如原来每个材质需要一个 Diffuse Texture，一个 Normal Texture，可以使用一个包含两个 Diffuse Texture， 两个 Normal Texture 的材质来取代原来的两个材质，并在 Shader 中通过 Blending 的方式达成之前的效果。

{% note warning %}
这种实现方式虽然减少了 DrawCall 的数量，但会造成 Blending 的大量额外开销，因此最终性能可能反而下降。
{% endnote %}

# Skinned Meshes

如之前的描述，如果需要通过 Batch 来解决多个子弹占用多个 Draw Call 的问题，则会因为子弹需要每帧移动而造成每帧重新 Batch，这会造成巨大的开销。

有一个解决思路是将所有这些子弹结合在一起作为 Skinned Mesh，其中每个子弹作为一个 Bone，在后续的帧中只需要更新这些 Bone 的位置，而不需要重新进行合并。

{% note warning %}
当出现了子弹增加或减少时，则需要重新合并 Mesh
{% endnote %}

# Reference

[Render Hell – Book IV | Simon schreibt.](http://simonschreibt.de/gat/renderhell-book4/)
