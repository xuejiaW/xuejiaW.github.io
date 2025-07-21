---
tags:
  - Unity
  - XR
  - Rendering
created: 2025-03-31
updated: 2025-06-15
date: 2025-04-13 22:02
published: true
title: XR Stereo Rendering Modes
description: In XR, objects typically need to be rendered in stereo, meaning content must be drawn to both left and right eye textures. This rendering approach is called Stereo Rendering. This article covers various stereo rendering techniques, including the common Multi-Pass and Multi-View methods, as well as Quad-View specifically designed for eye-tracking devices. It primarily explains the differences in texture count and DrawCall count among these rendering approaches.
keywords:
  - multipasses
  - singlepass
  - multiview
  - quadview
---

In XR, objects typically need to be rendered in stereo, meaning content must be drawn to both left and right eye textures. This rendering approach is called `Stereo Rendering`. This article covers several stereo rendering techniques, including:

- `Multi-Pass`: Left and right eye frames use separate textures and are rendered individually. This is the most primitive, most compatible rendering method, but has poor performance.
- `Single-Pass`: Left and right eyes use a single texture, typically the preferred rendering method for current applications with better performance. This mode has several variants such as `Single-Pass Double Wide`, `Single-Pass Instanced`, `Single-Pass Multi-View`, etc.
- `Quad-View`: A newer rendering approach that further divides left and right eye frames into four views: `Inner-Left` and `Inner-Right`, `Outer-Left` and `Outer-Right`. It improves image clarity through different PPD (Pixels Per Degree) for `Inner` and `Outer` regions. This mode is typically used on devices with eye-tracking support.

# Multi-Pass

In Multi-Pass rendering mode, a separate render texture (Texture2D) is created for each eye, and left and right eye frames are drawn separately in each eye's rendering loop. The advantage of Multi-Pass rendering mode is good compatibility, supporting all XR devices. However, performance is poor because every object needs to be rendered twice, and render targets must be switched for each rendering pass (which is why it's called multi-pass).

The diagram below illustrates this approach:

<iframe
  style="border: 1px solid #ccc; border-radius: 0.5rem;"
  src="https://inscribed.app/embed?type=slider-template&gist_url=https://gist.githubusercontent.com/xuejiaW/ab120e5e01e009e7cbdaad58694d545d/raw/e96516222e4a02c44f3d1eb0cce09a1e4c8ca6e0/MultiPass.ins"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
></iframe>

# Single-Pass

As the name suggests, Single-Pass uses only one texture as the render target. Under this premise, Single-Pass has multiple variant modes, each with its own rendering approach:

{% note info %}
A common misconception is that Single-Pass means rendering both left and right eye frames in a single pass, while Multi-Pass requires two rendering passes for left and right eye frames.
In reality, the difference between Single-Pass and Multi-Pass lies in the number of render targets: Single-Pass uses one texture, while Multi-Pass uses multiple textures. In the case of Single-Pass Double Wide, Single-Pass still requires two rendering passes to complete left and right eye frame rendering.
{% endnote %}

## Single-Pass Double Wide

The Single-Pass Double Wide approach uses a texture with twice the width of a single eye frame to represent both left and right eye frames simultaneously, where the left half contains the left eye view and the right half contains the right eye view. The diagram below illustrates this approach:

<iframe
  style="border: 1px solid #ccc; border-radius: 0.5rem;"
  src="https://inscribed.app/embed?type=slider-template&gist_url=https://gist.githubusercontent.com/xuejiaW/7ab6ab47a1fd5b21b58ce9b7b0be7183/raw/a48932f4b40d8671472b34aaa8fff82f28c0939f/SinglePass-DoubleWide.ins"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
></iframe>

As shown, in the Single-Pass Double Wide approach:

- Each object still needs to be rendered **twice** to the left and right eye portions, except now both eye views are represented using a single texture.
- Rendering uses a ping-pong approach, where the render target switches between left and right eye portions in a `Left-Right-Right-Left-Left-....` pattern (as shown in the diagram above). The advantage is that only one pass through all required objects is needed to complete both left and right eye rendering, thus reducing rendering context switches and the number of commands that need to be executed.

The Single-Pass Double Wide approach has been largely deprecated because it still requires two rendering passes per object and its ping-pong method significantly increases pipeline complexity.

Current devices typically support Single-Pass Instanced or Single-Pass MultiView, both offering better performance.

## Single-Pass Instanced / Single-Pass MultiView

Both Single-Pass Instanced and Single-Pass MultiView use a texture array to represent left and right eye frames, where Index 0 is the left eye and Index 1 is the right eye. The advantage of both approaches is reduced texture switching overhead, and each object can be rendered to both left and right eye frames through a **single** rendering pass. The disadvantage is compatibility - both require devices to support specific GPU features and require shader adaptations.

These two approaches require specific features and shader modifications for two purposes:

1. To render to both left and right eye frames in a single pass while distinguishing between left and right eye View Matrices
   - Instanced: Uses GPU instancing features, using Instance ID to distinguish left and right eye View Matrices
   - MultiView: Relies on MultiView extensions[^1], using `gl_ViewID_OVR` to distinguish left and right eye View Matrices
2. To specify the render target texture Index during rendering
   - Instanced: Relies on platform-specific GPU features, such as DirectX 11's `VPAndRTArrayIndexFromAnyShaderFeedingRasterizer`, OpenGL's `GL_NV_viewport_array2`, `GL_AMD_vertex_shader_layer`, `GL_ARB_shader_viewport_layer_array`
   - MultiView: Relies on MultiView extensions[^1], using `FramebufferTextureMultiviewOV` to specify the render target texture Index

{% note info %}
Instanced extensions for specifying render target texture Index, such as `GL_NV_viewport_array2`, are not supported on mobile OpenGLES. Therefore, on mobile platforms, MultiView extensions are required to achieve rendering to different texture array indices.
{% endnote %}

{% note primary %}
Instanced and MultiView approaches are essentially two different ways to achieve the same implementation goals. Due to different feature support, Instanced works better on PC platforms while MultiView works better on mobile platforms.
For convenience, we'll refer to both as Multiview in the following sections.
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

Quad-View is a newer rendering approach that implements Foveated Rendering. It further divides left and right eye frames into four views: `Inner-Left` and `Inner-Right`, `Outer-Left` and `Outer-Right`. The `Outer` views are rendered using the original FOV, while the `Inner` views use a smaller FOV. This way, even if `Inner` and `Outer` have the same resolution, the `Inner` views will have higher PPD (Pixels Per Degree), resulting in higher clarity for the `Inner` regions.

The diagram below shows the Outer and Inner views of a single eye in the same scene, where Outer has approximately 90° horizontal FOV and Inner has approximately 40° horizontal FOV:
![Outer vs Inner](/stereo_rendering_mode/stereo_rendering_mode_2025-03-28-17-42-27.excalidraw.svg)

{% note primary %}
Quad-Views are typically used on devices with eye-tracking support, where the Inner view rendering region is determined by the eye gaze area.
{% endnote %}

For the rendering of Quad-View's four views, there are two variants:

- `Single-Pass`: Uses **one** texture array with Array Size of 4 to represent the four views, updating all four views simultaneously using Multiview.
- `Multi-Pass`: Uses **two** texture arrays with Array Size of 2 each to represent Inner left/right eye frames and Outer left/right eye frames, using two rendering passes to separately update Inner and Outer frames, where each rendering pass uses Multiview to simultaneously update left and right eye frames.

{% note info %}
Theoretically, QuadViews could have more combinations, such as:
- Using 4 Texture2D objects to represent the four views, using Multi-Pass approach with four DrawCalls to update the four view frames.
- Using 2 Texture2D objects for Outer left and right eyes, plus one Texture2DArray with Array Size of 2 for Inner left and right eyes. First updating left and right Outer with two DrawCalls, then updating left and right Inner with one DrawCall.
However, these combinations don't provide additional benefits, so they are not discussed here.
{% endnote %}

{% note info %}
Unity XR only supports `Texture2DArray` with maximum ArraySize of 2, so Quad-View in Unity can only be implemented using Multi-Pass approach.
{% endnote %}

Single-Pass and Multi-Pass each have their own advantages, making both suitable for different scenarios:

- Single-Pass offers better performance, but limits all views to the same resolution.
- Multi-Pass sacrifices some performance but allows Inner and Outer to have different resolutions.

{% note info %}
Regardless of whether QuadViews uses Single-Pass or Multi-Pass, both depend on MultiView rendering support.
{% endnote %}

## Quad-Views with Single-Pass

In Quad-Views with Single-Pass mode, each object simultaneously updates all four views (Inner/Outer) through a single DrawCall, as illustrated below:

<iframe
  src="https://inscribed.app/embed?type=slider-template&gist_url=https://gist.githubusercontent.com/xuejiaW/f3d8a451f1491170a37e39f912c18813/raw/12d16fbe47ac54fd1a3fe44fa49db8fe4e1e65ec/Quad-View-SinglePass.ins"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
></iframe>

## Quad-Views with Multi-Pass

In Quad-Views with Multi-Pass mode, each DrawCall draws content to either Outer (or Inner) left and right eye frames separately, as illustrated below:

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

