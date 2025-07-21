---
tags:
  - XR
created: 2025-06-04
updated: 2025-06-27
published: true
title: Understanding XR Composition Layers - A Comprehensive Guide
date: 2025-06-26 22:10
description: XR Composition Layer architecture separates different content types into independent layers (Projection, Quad, Cylinder, etc.) that are merged by the Compositor before display. This design primarily addresses image quality degradation from dual non-point-to-point sampling in traditional XR rendering pipelines by allowing UI and flat content to be submitted directly as composition layers, eliminating one sampling stage. Real-world examples show YVR2's Home interface composed of a background Projection layer and two UI Quad layers. Composition layers also enable multi-application content integration, such as coordinated display of passthrough video, curved UI, and system dialogs in MR scenarios.
---

For an XR system, applications pass the content they want to display through `Composition Layers` to the system's `Compositor`, which then composites these layers into a final image that is rendered to the screen and ultimately presented to the user.

Under the OpenXR specification, common composition layer types include:

- Projection Layer: Images rendered using standard projection matrices from the perspective of left and right eye positions. This is the most conventional layer type—virtually all XR applications have one Projection Layer, and the vast majority only use a single Projection Layer.
  - In XR terminology, "Eye Buffer" essentially refers to the Projection Layer.
- Quad Layer: A planar image layer, typically used to display UI elements or other flat content, such as videos.
- Cylinder Layer: A cylindrical image layer, suitable for displaying wraparound content like curved UI or curved video playback.
- Cube Layer: A cubic image layer, suitable for displaying panoramic content.
- Equirect Layer: An equirectangular image layer, suitable for displaying panoramic content.

## Practical Example

The Home environment on the YVR2 device uses composition layers to submit different content types. For example, when you see the following scene in Home:

![Content](/composition_layer/2025-06-05-10-23-47.png)

It's actually composed of three composition layers submitted by Home:

1. A Projection Layer that renders the Home background image.

    ![Projection Layer](/composition_layer/2025-06-05-10-46-23.png)

2. A Quad Layer used to display the app library

    ![Quad Layer](/composition_layer/1_0.png)
   
3. Another Quad Layer representing the bottom status bar

    ![Another Quad Layer](/composition_layer/1_2.png)


## Why Do We Need Composition Layers?

Before exploring more about composition layers, we must first answer the fundamental question: *Why do we need composition layers?* After all, we shouldn't waste time on valueless concepts.

The concept of composition layers isn't unique to XR devices. In traditional hardware systems like smartphones and computers, applications also submit content to the system's compositor using similar mechanisms, which then composite this content into the final image that gets rendered to the screen and displayed to the user.
- **Windows**: Since Vista, Windows introduced the **Desktop Window Manager (DWM)**, which collects graphical content from application windows, applies visual effects, and composites them into the final display output. After Windows 10, the more modern **Windows Composition Engine** was introduced to work alongside DWM.
- **Android**: Uses **SurfaceFlinger**, an Android system service responsible for managing application graphics buffers (Surfaces), compositing them in Z-order, and finally outputting to display devices (this process is often referred to as *scanout*).

However, the ATW (Asynchronous Time Warp) and distortion correction work performed by XR system Compositors doesn't exist in traditional systems, and both of these introduce unavoidable **non-point-to-point** sampling during composition.

Therefore, in XR systems, content using traditional rendering paths must undergo at least **two non-point-to-point** sampling operations before being seen by the user, and each non-point-to-point sampling in rendering introduces quality degradation:
- First non-point-to-point sampling: Virtual content rendered onto the Eye Buffer
- Second non-point-to-point sampling: Compositor renders Eye Buffer content to the final display buffer for scanout

{% note primary %}
For discussion about how non-point-to-point rendering in XR introduces display quality degradation, see Resolution in XR
{% endnote %}

Since the compositor rendering the Eye Buffer to the final display buffer is unavoidable, the second non-point-to-point sampling mentioned above cannot be eliminated. Therefore, composition layers are designed to reduce the non-point-to-point sampling when rendering virtual content to the Eye Buffer—the first non-point-to-point sampling.

Using the YVR2 Home example shown above, its UI content is submitted directly to the system compositor through Quad Layers, which are processed by the compositor and finally sent for scanout, thus experiencing only one non-point-to-point sampling, thereby improving sharpness.

{% note info %}
Strictly speaking, in Unity applications, displaying UI content using Quad Layers still involves two sampling operations. This is because the content on the Quad Layer consists of UI assets rendered onto the Quad Layer's texture. However, this rendering process uses orthographic projection and can achieve true point-to-point sampling by matching the Quad Layer resolution with the UI element resolution, avoiding non-point-to-point sampling.
Therefore, using Quad Layers to display UI avoids one non-point-to-point sampling operation, rather than reducing the total number of sampling operations.
{% endnote %}

Separating content using composition layers has another potential benefit: content separation introduces finer control granularity. For example, you can provide higher render scale and enable MSAA for the Eye Buffer while using default render scale and no MSAA for UI Quad Layers, maintaining UI sharpness while reducing Eye Buffer rendering overhead.

## Composition Layer Submission

For the YVR Home scenario described above, the application is responsible for submitting *frames* to the Compositor. Each *frame* contains content from various composition layers, which the Compositor composites into the final image displayed on the screen, as shown in the following diagram:

![App Submit Frame](/composition_layer/singleapplication.excalidraw.svg)

You can see that a frame can carry multiple composition layers, and these layers have an ordering (shown as $0$, $-1$, $-2$ in the diagram above). The Compositor composites the layer content into the final image in order from low to high, rendering layer $-2$ first, then layer $-1$, and finally layer $0$ ([painter's algorithm](https://en.wikipedia.org/wiki/Painter%27s_algorithm)).

Typically, applications fix the Projection Layer (Eye Buffer layer) as layer $0$, and layers composited **before** the Eye Buffer layer (with negative composition order) are called `Underlay Layers`, while layers composited **after** the Eye Buffer layer (with positive composition order) are called `Overlay Layers`. Therefore, in the example above, layer $-1$ (red in the image below) is an Underlay Layer, while layers $1, 2, 3$ are Overlay Layers (translucent green, blue, and pink layers in the image below).

![Composition Diagram](/composition_layer/2025-06-06-15-34-36.png)

{% note info %}
This is precisely why in the example above, the regions in YVR Home's layer 0 where UI should be displayed are transparent. Without transparent regions, when layer 0 is rendered, it would cover the previously rendered layers $-2$ and $-1$, preventing the content of layers $-2$ and $-1$ from being visible in the final image.
Applications typically achieve this by rendering an object that writes an Alpha value of 0 to make portions of the image transparent. This operation is often called *punching a hole*.
{% endnote %}

### Multi-Application Composition

The concept of composition layers is not limited to single applications. From the Compositor's perspective, it simply receives *frames* from various applications and is responsible for compositing them into the final image. The number of applications submitting frames to the Compositor at any given time doesn't matter.

A typical example of multi-application composition is the [Focus Awareness](https://developers.meta.com/horizon/documentation/unity/unity-overlays/) (FA) functionality provided by various XR platforms. For instance, when an MR application on the Play For Dream MR device activates the FA functionality, you would see the following interface:

![PFDM](/composition_layer/2025-06-13-09-54-13.png)

This requires three components:
- The system's Pass-Through Service submits a VST layer, rendering the device's see-through view
- The VD application submits a Cylinder Layer, providing curved UI content
- Spatial Home submits a Projection Layer, rendering the exit confirmation dialog and controllers

The diagram below illustrates this:

![MultiApplication](/composition_layer/multiapplication.excalidraw.svg)

The system Compositor follows certain strategies to organize applications that submit frames at the same time, such as prioritizing the Pass-Through view submitted by the Pass-Through Service first, then compositing frames from regular applications, and finally compositing frames from system applications (SpatialHome).

{% note info %}
The ordering rules for frames submitted by multiple applications are not defined in the OpenXR standard. Therefore, different platforms may have significant variations.
However, these rules typically only concern XR vendors, since regular developers' XR applications don't actively couple with other XR applications, so they don't need to worry about multi-application composition rules.
{% endnote %}

## Drawbacks of Composition Layers

As mentioned earlier, composition layers are designed to reduce the non-point-to-point sampling when rendering virtual content to the Eye Buffer—specifically the first non-point-to-point sampling—to achieve improved clarity. However, composition layers are not a silver bullet. You need to understand the drawbacks they introduce to make better decisions about whether your XR application should use composition layers.

### Increased Development Complexity

For applications that only use the Eye Buffer (a single Projection Layer), all content rendering goes directly through the rendering engine to the Eye Buffer. The rendering engine handles all rendering details, and developers only need to focus on content design and implementation.

However, when additional composition layers are introduced, developers must also consider how to render content to these extra layers. Particularly when using Underlay composition layers, *punching holes* in the Eye Buffer content is required to ensure that Underlay layer content can properly show through.

Additionally, since compositing multiple layers is simply an application of the painter's algorithm, achieving more sophisticated blending and occlusion effects requires more complex processing during the *hole punching* stage, such as obtaining the composition layer's content and determining the transparency of the holes.

### Difficulty in Global Effect Control

When content is submitted to the system Compositor using additional composition layers, the application has no control over the composition layer content when rendering the Eye Buffer, because the final display of composition layers is determined by the system's Compositor.

For example, if you want to apply post-processing effects to the entire application's final image, such as Gaussian blur or global fog effects, since the Eye Buffer doesn't contain the content from additional composition layers, post-processing effects applied to the Eye Buffer cannot affect the content in the additional composition layers.

{% note info %}
Developers can choose to apply post-processing effects to additional composition layers when rendering content to them, but this exacerbates the increase in development complexity. Even so, there are some unavoidable issues:
- Effects like Gaussian blur that require sampling neighboring pixels will produce obvious artifacts at the boundaries between additional composition layers and the Eye Buffer.
- If additional composition layer content is submitted via Surface SwapChain, the application layer is not responsible for rendering content to the additional composition layers and therefore cannot apply any post-processing to that content.
{% endnote %}

Similarly, control over Eye Buffer rendering modes, such as foveated rendering, cannot affect additional composition layers.

### Additional Performance Overhead

Since composition layer content needs to be composited by the system Compositor, the more content that needs compositing, the greater the load on the system Compositor. The Compositor cannot afford to **drop frames**, as any dropped frames would cause frame freeze phenomena that severely impact user experience.

Furthermore, composition layers can increase performance overhead in certain situations. For example, when rendering UI through composition layers, the application must switch render targets when drawing UI versus other objects (UI needs to be drawn to additional composition layers, while other objects need to be drawn to the Eye Buffer). Render target switching undoubtedly introduces some performance overhead.

Additionally, because additional composition layers and Eye Buffer content are separate, some optimizations that rely on depth occlusion cannot be performed. For example, when a controller occludes UI:
- If both are drawn to the Eye Buffer, and the controller is drawn before the UI, then the occluded portions of the UI would not be rendered due to depth test failure.
- If the UI is drawn to additional composition layers, then the complete UI must be rendered regardless.

# Reference

[Composition layers \| XR Composition Layers \| 2.0.0](https://docs.unity3d.com/Packages/com.unity.xr.compositionlayers@2.0/manual/overview.html)

[Compositor layers \| Meta Horizon OS Developers](https://developers.meta.com/horizon/documentation/unity/os-compositor-layers)
