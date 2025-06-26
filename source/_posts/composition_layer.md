---
tags:
  - XR
created: 2025-06-04
updated: 2025-06-26
published: true
title: XR 合成层（Composition Layer）概念详解
date: 2025-06-26 22:10
description: XR系统中的合成层（Composition Layer）机制通过将不同类型的内容拆分为独立层（如Projection、Quad、Cylinder等层），由合成器（Compositor）合并后输出到屏幕。这种设计主要解决了传统XR渲染路径中两次非点对点采样导致的画质劣化问题，通过让UI等平面内容直接以合成层提交，减少了一次采样环节。典型案例显示，YVR2设备的Home界面由背景的Projection层和两个UI的Quad层共同构成。合成层还支持多应用内容整合，如MR场景中透视画面、曲面UI和系统弹框的协同显示
---

对于一个 XR 系统而言，各应用将它所要展示的内容通过 `合成层（Composition Layer）` 传递给系统的 `合成器（Compositor）`，合成器将这些内容合成为最终的图像渲染至屏幕上并最终展示的给用户。

在 OpenXR 规范下，常见的合成层包括：

- Projection Layer：从左右眼位置出发，使用标准的投影矩阵渲染的图像。这是最惯常的合成层类型，几乎所有的 XR 应用有一个 Projection Layer，绝大部分的 XR 也仅有一个 Projection Layer。
  - 在 XR 中，Eye Buffer 一词基本就是指 Projection Layer。
- Quad Layer：一个平面图像层，通常用于展示 UI 元素或其他平面内容，例如视频。
- Cylinder Layer：一个圆柱形图像层，适用于展示环绕式内容，例如曲面的 UI 或曲面播放视频。
- Cube Layer：一个立方体图像层，适用于展示全景内容。
- Equirect Layer：一个等距矩形图像层，适用于展示全景内容。

## 实践案例

对于在 YVR2 设备的 Home 中就使用了合成层来提交不同的内容，例如你在 Home 看到如下的画面：

![Content](/composition_layer/2025-06-05-10-23-47.png)

实际上是由 Home 提交的三个合成层共同构成：

1. 一个 Projection Layer，绘制了 Home 的背景图像。

    ![Projection Layer](/composition_layer/2025-06-05-10-46-23.png)

2. 一个 Quad Layer，用以表示应用库

    ![Quad Layer](/composition_layer/1_0.png)
   
3. 另一个 Quad Layer 表示底部状态栏

    ![Another Quad Layer](/composition_layer/1_2.png)


## 为何需要合成层

在描述更多关于合成层的内容前，首先要回答的问题是 *为何我们需要合成层？*，毕竟我们不需要浪费时间在一个没有价值的概念上。

合成层的概念并不是 XR 设备独有的，在传统的硬件设备中，例如手机和电脑，应用也会通过类似的方式将内容提交给系统的合成器，合成器将这些内容合成为最终的图像渲染至屏幕上并最终展示给用户。
- **Windows**: 自 Vista 系统开始引入了 **Desktop Window Manager (DWM)**，DWM负责收集各应用窗口的图形内容，应用视觉效果，并将它们合成为最终显示的画面。在Windows 10后，还引入了更现代的 **Windows Composition Engine** 与 DWM 协同工作。
- **Android**: 使用的是**SurfaceFlinger**，它是Android的系统服务，负责管理各应用的图形缓冲区(Surfaces)，将它们按Z轴顺序合成，并最终输出到显示设备（此过程后续简称为 *上屏*）。

但 XR 系统中的 Compositor 所要做的 ATW 工作（Asynchronous Time Warp）和畸变矫正在传统的系统中是不存在的，而这两者都会让合成时引入不可避免的 **非点对点** 采样。

因此在 XR 中，对于一个使用传统渲染路径的内容而言，其至少需要经过 **两次非点对点** 的采样两次才能最终被用户看到，而渲染中每一次非点对点的采样，都会引入效果的劣化。
- 第一次非点对点采样：虚拟内容绘制到 Eye Buffer 上
- 第二次非点对点采样：Compositor 将 Eye Buffer 中的内容绘制到最终的显示缓冲区进行上屏。

{% note primary %}
关于 XR 中非点对点渲染引入显示效果劣化的讨论，见 Resolution in XR
{% endnote %}

因为合成器将 Eye Buffer 绘制倒最终显示缓冲区上这个过程是不可避免的，其上述的第二次非点对点采样是不可避免的。因此合成层的设计目的是为了减少将虚拟内容绘制到 Eye Buffer 上时的非点对点采样，即第一次非点对点采样。

以上面展现的 YVR2 Home 的例子为例，他的 UI 内容是通过 Quad Layer 直接交给系统合成器的，其会被合成器处理并最终上屏，因此之只经过了一次非点对点采样，借此提升了清晰度。

{% note info %}
严格而言，在 Unity 应用中，使用 Quad Layer 展现 UI 内容时，仍然是经历了两次采样。因为 Quad Layer 上的内容，是 UI 素材被渲染至了 Quad Layer 的纹理上，只不过这个渲染过程是正交投影，且可以通过 Quad Layer 的分辨率与 UI 元素分辨率的匹配来避免非点对点采样，以达到真正的点对点采样。
因此使用了 Quad Layer 展现 UI 的过程，是避免了一次非点对点采样，而不是减少了一次采样。
{% endnote %}

使用合成层拆分内容还有一个潜在的好处在于，内容的拆分引入了更细的控制颗粒度，例如可以对 Eye Buffer 提供更高的渲染倍率和开启 MSAA，但对于 UI 的 Quad Layer 则采用默认的渲染倍率和不开启 MSAA，这样可以在保证 UI 清晰度的同时，减少 Eye Buffer 的渲染开销。

## 合成层的提交

对于上述 YVR Home 的场景，应用负责提交 *帧* 给 Compositor，*帧* 中会包含有各个合成层的内容，Compositor 会将这些合成层的内容合成为最终的图像会展现在屏幕上，如下示意图：

![App Submit Frame](/composition_layer/singleapplication.excalidraw.svg)

你可以看到一帧中可以携带多个合成层，且合成层是有顺序的（上示意图中的 $0$、$-1$、$-2$），Compositor 会按照从低到高的顺序将合成层内容合成为最终的图像，即先渲染 $-2$ 层，再渲染 $-1$ 层，最后渲染 $0$ 层（[画家算法](https://en.wikipedia.org/wiki/Painter%27s_algorithm))。

通常应用中会固定 Project Layer （Eye Buffer 层）是第 $0$ 层，并将在 Eye Buffer 层**前**合成的层（合成顺序为负数）称为 `Underlay Layer`，而在 Eye Buffer 层**后**合成的层（合成顺序为正数）称为 `Overlay Layer`。因此在上述的例子中，$-1$ 层(下图红色)是 Underlay Layer，而 $1,2,3$ 层是 Overlay Layer（下图半透明的绿，蓝，粉色层）。


![合成示意](/composition_layer/2025-06-06-15-34-36.png)

{% note info %}
也正因为如此，在上述的例子中，YVR Home 的第 0 层中应当显示 UI 的区域是透明的，如果没有透明区域，当第 0 层绘制时会将之前的 $-2$ 和 $-1$ 层内容覆盖掉，导致最终的图像中看不到 $-2$ 和 $-1$ 层的内容。
应用通常可以通过绘制绘制一个写入 Alpha 为 0 的物体来将画面中的部分区域变为透明区域，这个操作在很多时候被称为 *打洞（Punch a hole）*
{% endnote %}

### 多应用合成

合成层的概念并非局限在单个应用中。对于 Compositor 而言，它只是接纳来自于各个应用的*帧* 并负责将其合成为最终的图像，至于同一时间内有多少个应用提交帧给 Compositor 并不重要。

多应用合成的典型例子为各 XR 平台提供的 [Focus Awareness](https://developers.meta.com/horizon/documentation/unity/unity-overlays/) （后简称为 `FA`）功能，如在 Play For Dream MR 设备上一款 MR 应用唤醒了 FA 功能后，所看到的如下界面：

![PFDM](/composition_layer/2025-06-13-09-54-13.png)

它需要由三部分构成：
- 系统的 Pass-Through Service 提交 VST 层，绘制了设备透视的画面
- VD 应用提交的 Cylinder Layer 层，提供了曲面的 UI 内容时
- Spatial Home 提交的 Projection Layer 层，绘制了退出确认的弹框和手柄。

其示意图如下：

![MultiApplication](/composition_layer/multiapplication.excalidraw.svg)

系统 Compositor 会根据一定的策略将同一时间提交帧的应用进行划分，如优先合成 Pass-Through Service 提交的 Pass-Through 画面，再合成普通应用提交的画面，再最终合成系统应用（SpatialHome）提交的画面。

{% note info %}
对于多个应用提交的帧的排序的规则，在 OpenXR 标准中并没有定义。因此可平台可能存在较大的差异。
但该规则也通常只需要 XR 厂商关心，因为普通开发者的 XR 应用并不会主动与其他的 XR 应用耦合，因此也就不需要关心多应用合成的规则。
{% endnote %}

## 合成层的弊端

在前面已经提到了合成层的设计目的是为了减少将虚拟内容绘制到 Eye Buffer 上时的非点对点采样，即第一次非点对点采样，来达到清晰度的效果。但合成层并非银弹，你需要了解合成层所带来的弊端，才能更好的决策你的 XR 应用是否需要使用合成层。

### 增加的开发复杂性

对于仅使用 Eye Buffer（单一 Projection Layer）的应用而言，所有内容的渲染都直接通过渲染引擎绘制到 Eye Buffer 上，渲染引擎会处理好所有的渲染细节，开发者只需要关注内容的设计和实现即可。

而当引入了额外的合成层后，开发者还需要关心该如何将内容渲染到额外合成层上。特别是当使用了 Underlay 合成层时，还需要对 Eye Buffer 的内容进行 *打洞* 操作，以保证 Underlay 合成层的内容可以正常的透出。

同时由于多个合成层的合并管控只是画家算法的简单应用，如果要做到较为完美的混和和遮挡效果，需要在 *打洞* 时进行更为复杂的处理，例如获取合成层的内容画面，决定洞的透明度等。

### 难以进行全局效果的管控

当内容使用额外的合成层提交给系统 Compositor 时，应用在渲染 Eye Buffer 时，对于合成层中内容是无法管控的，因为合成层最终的显示是由系统的 Compositor 决定的。

例如希望对整个应用最终的画面进行后处理效果，如高斯模糊，全局雾化等，由于 Eye Buffer 中并不包含有额外合成层的内容，所以对 Eye Buffer 的后处理效果是无法影响到额外合成层的内容的。

{% note info %}
开发者可以选择在向额外合成层绘制内容时，通过增加对额外合成层的后处理效果来实现类似的效果，但这会加剧开发复杂性的增加。且即使如此，也有一些无法规避的问题：
- 诸如高斯模糊这样的需要对相邻像素进行采样的效果，额外合成层和 Eye Buffer 交界处会产生明显的错误效果。
- 如果额外合成层的内容是通过 Surface SwapChain 方式提交画面，那么应用层并不负责向额外合成层绘制内容，也就无法对额外合成层的内容进行任何的后处理。
{% endnote %}

又比如对 Eye Buffer 渲染模式的管控，诸如注视点渲染，也无法对额外的合成层带来变化。

### 额外的性能负载

由于合成层的内容需要由系统 Compositor 进行合成，因此需要合成的内容越多，系统 Compositor 的负载就越大。而 Compositor 是不允许 **掉帧** 出现的，其一旦发生掉帧就会产生定屏现象，严重影响用户体验。

另外合成层在某些情况下也会增加性能开销，例如通过合成层绘制 UI，它要求应用在绘制 UI 和绘制其他物体时进行渲染目标的切换（UI 需要绘制到额外合成层上，而其他物体需要绘制到 Eye Buffer 上），渲染目标的切换无疑会带来部分性能开销。

此外由于额外合成层与 Eye Buffer 的内容是分离的，一些依靠深度遮挡进行的效果优化也无法进行，例如手柄遮挡住 UI 时：
- 如果都绘制到 Eye Buffer 上，且先绘制手柄再绘制 UI，那么被遮挡的 UI 部分会因为深度测试失败而不被绘制。
- 如果 UI 绘制到额外合成层上，那么无论如何都需要绘制完整的 UI


# Reference

[Composition layers \| XR Composition Layers \| 2.0.0](https://docs.unity3d.com/Packages/com.unity.xr.compositionlayers@2.0/manual/overview.html)

[Compositor layers \| Meta Horizon OS Developers](https://developers.meta.com/horizon/documentation/unity/os-compositor-layers)
