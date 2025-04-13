---
tags:
  - Unity
  - XR
  - Rendering
created: 2025-03-31
updated: 2025-04-13
date: 2025-04-13 22:02
published: true
title: XR 立体渲染模式
description: 在 XR 中物体通常需要以立体（in sterro）的方式被渲染，即一个内容需要被绘制到左眼和右眼的纹理中，这种渲染方式被称为 `立体渲染视图（Stereo-Rendering）`，本文将介绍几种立体渲染的方式，包括常见的 `Multi-Pass` 和 `Multi-View`，以及通常针对眼动设备的 `Quad-View` 方式。主要将说明这些方式在渲染时所用的纹理数量和 DrawCall 数量的差异。
keywords:
  - multipasses
  - singlepass
  - multiview
  - quadview
---

在 XR 中物体通常需要以立体（in sterro）的方式被渲染，即一个内容需要被绘制到左眼和右眼的纹理中，这种渲染方式被称为 `立体渲染（Stereo-Rendering）`，本文将介绍几种立体渲染的方式，包括：

- `Multi-Pass`：左眼和右眼画面由两张纹理构成，并分别绘制左眼和右眼画面。这是最原始，兼容性最好的渲染方式，但拥有较差的性能。
- `Single-Pass`：左眼和右眼由一个纹理构成，通常是目前常规应用首先的渲染方式，拥有较好的性能。该模式有较多的变种，如 `Single-Pass Double Wide`，`Single-Pass Instanced`，`Single-Pass Multi-View` 等。
- `Quad-View`：一种较新的渲染方式，将左右眼画面进一步拆分为 `Inner-Left`和 `Inner-Right`，`Outer-Left` 和 `Outer-Right` 四个视图，通过 `Inner` 和 `Outer` 不同的 PPD（Pixels Per Degree）来提升画面的清晰度。该模式通常在支持眼动追踪的设备上使用。

# Multi-Pass

在 Multi-Pass 渲染模式下，需要为每个眼睛创建一个单独的渲染纹理（Texture2D），并在每个眼睛的渲染循环中分别绘制左眼和右眼的画面。Multi-Pass 渲染模式的优点是兼容性好，支持所有 XR 设备，但性能较差，因为针对每一个物体都需要进行两次渲染，此外，每一次渲染时都需要切换渲染纹理（这就是被称为多 Pass 的原因）。

其示意图如下所示

<iframe
  style="border: 1px solid #ccc; border-radius: 0.5rem;"
  src="https://inscribed.app/embed?type=slider-template&gist_url=https://gist.githubusercontent.com/xuejiaW/ab120e5e01e009e7cbdaad58694d545d/raw/e96516222e4a02c44f3d1eb0cce09a1e4c8ca6e0/MultiPass.ins"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
></iframe>

# Single-Pass

顾名思义，Single-Pass 就是渲染目标只有一张纹理，在这个前提下，Single-Pass 有多种变种模式，每一个变种都有其自己的渲染方式：

{% note info %}
一个常见的误解是认为 Single-Pass 就是同一目标一次渲染完成左眼和右眼画面，Multi-Pass 是两次渲染完成左眼和右眼画面。
实际上，Single-Pass 和 Multi-Pass 的区别在于渲染目标的数量，Single-Pass 只有一张纹理，而 Multi-Pass 有多张纹理。在 single-Pass Double Wide 的情况下，Single Pass 同样需要两次渲染来完成左眼和右眼画面的渲染。
{% endnote %}

## Single-Pass Double Wide

Single-Pass Double Wide 方案用一张宽度是单个眼睛画面两倍的纹理来同时表示左眼和右眼画面，其中左半部分是左眼，右半部分是右眼。其示意图如下所示：

<iframe
  style="border: 1px solid #ccc; border-radius: 0.5rem;"
  src="https://inscribed.app/embed?type=slider-template&gist_url=https://gist.githubusercontent.com/xuejiaW/7ab6ab47a1fd5b21b58ce9b7b0be7183/raw/a48932f4b40d8671472b34aaa8fff82f28c0939f/SinglePass-DoubleWide.ins"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
></iframe>

可以看到在 Single-Pass Double Wide 方案下:

- 每个对象仍然需要被 **两次** 渲染至左眼和右眼部分，只不过现在是通过一个纹理来表示左眼和右眼画面。
- 渲染采用了 ping-pong 的方式，即渲染的目标会在左右眼部分以 `Left-Right-Right-Left-Left-....` 的方式切换（见上示意）。这样的好处只需要遍历一次所有需要的对象，即能完成左右眼的渲染，也因此减少了渲染时上下文的切换和需要执行的 Command 数量。

Single-Pass Double Wide 方案基本已经被淘汰，因为它仍然需要对每个对象做两次渲染，且其 ping-pong 的方式会极大的增加管线复杂度。

目前的设备通常都支持 Single-Pass Instanced 或 Single-Pass MultiView，这两种方案也有更高的性能。

## Single-Pass Instanced / Single-Pass MultiView

Single-Pass Instanced 和 Single-Pass MultiView 方案都是用一张纹理数组来表示表示左眼和右眼画面，其中 Index 0 是左眼，Index 1 是右眼。该两者的优点是都是节省了纹理切换的开销，且每个物体可以通过 **一次** 渲染同时被绘制到左眼和右眼画面上，其缺点都在于兼容性，这两种默认都要求设备需要支持特定的 GPU 特性，以及渲染时的 Shader 需要做一定的适配。

这两种方案所需要的特性和 Shader 的修改都是为了两个目的：

1. 可以通过一次渲染同时绘制到左眼和右眼画面上，但绘制时需要区分左右眼的 View Matrix
   - Instanced：使用 GPU 的 Instancing 特性来实现，使用 Instance ID 区分左右眼的 View Matrix
   - MultiView：依靠 MultiView 拓展[^1]，使用其中的 `gl_ViewID_OVR` 区分左右眼的 View Matrix
2. 在渲染时可以指定渲染目标纹理的 Index
   - Instanced：依赖各平台的 GPU 特性来实现，如 DirectX 11 的 `VPAndRTArrayIndexFromAnyShaderFeedingRasterizer`，OpenGL 的 `GL_NV_viewport_array2`, `GL_AMD_vertex_shader_layer`, `GL_ARB_shader_viewport_layer_array`
   - MultiView：依靠 MultiView 拓展[^1]，使用其中的 `FramebufferTextureMultiviewOV` 来指定渲染目标纹理的 Index

{% note info %}
指定渲染目标纹理的 Index 的 Instanced 拓展，如 `GL_NV_viewport_array2` 等在移动端 OpenGLES 下并不支持，所以在移动端为了实现渲染到目标纹理的不同 Index 的目的，必须依赖 MultiView 拓展。
{% endnote %}

{% note primary %}
Instanced 方案和 MultiView 方案几乎就是同样的实现目标的两种方式，因为特性支持的不同，Instanced 方案在 PC 端的支持更好，而 MultiView 方案在移动端的支持更好。
为方便描述，后续不再区分 Instanced / Multiview，直接称为 Multiview。
{% endnote %}

<iframe
  style="border: 1px solid #ccc; border-radius: 0.5rem;"
  src="https://inscribed.app/embed?type=slider-template&gist_url=https://gist.githubusercontent.com/xuejiaW/23b397698b0c69473b7a6664ed736018/raw/90eb5af9ccca84d291408495ba1222510b7d0203/SinglePass-Instanced-MultiView.ins"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
></iframe>

# Quad-View

Quad-View 是一种较新的渲染方式，它是 Foveation Rendering 的一种实现方式，它将左右眼画面进一步拆分为 `Inner-Left`和 `Inner-Right`，`Outer-Left` 和 `Outer-Right` 四个视图。`Outer` 画面使用原始的 Fov 进行渲染，`Inner` 画面则是较小的 FOV，这样即使 `Inner` 和 `Outer` 的分辨率相同，`Inner` 画面也会拥有较高的 PPD（Pixels Per Degree），也因此 `Inner` 画面会有更高的清晰度。

下图展现了同一个场景内中，单一眼的 Outer 和 Inner 画面，这里 Outer 的横向 FOV 约为 90°，Inner 的横向 FOV 约为 40°：
![Outer vs Inner](/stereo_rendering_mode/stereo_rendering_mode_2025-03-28-17-42-27.excalidraw.svg)

{% note primary %}
Quad-Views 通常在支持眼动追踪的设备上使用，Inner 画面的渲染区域由眼动注视的区域来决定。
{% endnote %}

针对 Quad-View 的四个视图的渲染方式又有两个变种：

- `Single-Pass`：通过 **一个** Array Size 为 4 的纹理数组来表示四个视图，使用 Multview 的方式一次性更新四个视图的画面。
- `Multi-Pass`：通过 **两个** Array Size 为 2 的纹理数组来表示 Inner 的左右眼画面和 Outer 的左右眼画面，使用两次绘制分别更新 Inner 和 Outer 的画面，每次绘制都使用 Multview 的方式来同时更新左右眼画面。

{% note info %}
理论上，QuadViews 还可以有更多的组合方式，如：
- 通过 4 个 Texture2D 来表示四个视图，使用 Multi-Pass 的方式通过四个 DrawCall 来更新四个视图的画面。
- 使用 2 个 Texture2D 表示 Outer 的左右眼，再使用一个 Array Size 为 2 的 Texture2DArray 表示 Inner 的左右眼。先通过两个 DrawCall 更新左右眼 Outer，再通过一个 DrawCall 更新左右眼 Inner。
但这些组合方式并没有带来额外的收益，因此这里不进行讨论
{% endnote %}

{% note info %}
在 Unity XR 中，最多支持 ArraySize 为 2 的 `Texture2DArray`，因此在 Unity 中 Quad-View 只能通过 Multi-Pass 的方式来实现。
{% endnote %}

Single-Pass 和 Multi-Pass 有各自的好处，也因此这两种方案都有各自适合的场景：

- Single-Pass 方案的性能更好，但它限制所有的视图必须是一样的分辨率。
- Multi-Pass 则是牺牲了一部分性能，却让 Inner 和 Outer 可以有各自的分辨率

{% note info %}
无论 QuadViews 使用 Single-Pass 还是 Multi-Pass，其都依赖 MultiView 渲染相应支持。
{% endnote %}

## Quad-Views with Single-Pass

在 Quad-Views with Single-Pass 模式下，Inner/Outer 针对每个物体通过一次 DrawCall 同时更新到四个 View 中，示意图如下所示：

<iframe
  src="https://inscribed.app/embed?type=slider-template&gist_url=https://gist.githubusercontent.com/xuejiaW/f3d8a451f1491170a37e39f912c18813/raw/12d16fbe47ac54fd1a3fe44fa49db8fe4e1e65ec/Quad-View-SinglePass.ins"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
></iframe>

## Quad-Views with Multi-Pass

在 Quad-Views with Multi-Pass 下，每一个 DrawCall 会分别将内容绘制到 Outer（或 Inner） 的左右眼画面上，示意图如下所示：

<iframe
  src="https://inscribed.app/embed?type=slider-template&gist_url=https://gist.githubusercontent.com/xuejiaW/ce7259a1aee59f021a0bc809cf69182c/raw/094e5e20d37e4a5f7e1064b1d6276778822b0e0c/QuadView-MultiPass.ins"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
></iframe>

# Reference

[Quad-Views Foveated](https://github.com/mbucchia/Quad-Views-Foveated)

[Single Pass Stereo rendering (Double-Wide rendering)](https://docs.unity3d.com/2019.4/Documentation/Manual/SinglePassStereoRendering.html)

[^1]: [OVR_multiview](https://registry.khronos.org/OpenGL/extensions/OVR/OVR_multiview.txt)

