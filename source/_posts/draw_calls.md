---
cssclass:
  - table-border
tags:
  - Unity
  - SRP
created: 2022-01-24
updated: 2024-04-02
date: 2024-03-23 13:53
published: true
title: Custom SRP - Draw Calls
description: 渲染自定义的 `Unlit` 的材质渲染一系列小球，讨论了不同的节省 Draw Calls 的技术，以及讨论了不同的实现透明度的办法
---

{% note info %}
该教程部分完成的工程状态可见：[Draw Calls](https://github.com/xuejiaW/CustomSRP/releases/tag/DrawCalls)
{% endnote %}

# Shaders

为了让 GPU 绘制物体，CPU 必须告诉 GPU 绘制什么以及如何绘制，绘制的内容通常是一系列网格，绘制方式则由 Shaders 来定义。

## Unlit Shader

首先要定义的最简单的 Shader 类型就是 `Unlit Shader`，这是一系列不考虑任何光照影响的 Shader。

创建一个 Shader 并将其删减到最少的结构，如下所示，其中 `Properties` 为会在 Inspector 面板中显示的属性， `SubShader` 中定义的 `Pass` 表示一种渲染的方式，一个 `SubShader` 中可以有多个 `Pass` ：

```glsl
Shader "Custom RP/Unlit"
{
    Properties { }
    SubShader
    {
        Pass {}
    }
}
```

如果使用这个 Shader 创建一个材质，则该材质会默认的渲染白色，如下所示：

|                                       |                                         |                                         |
| ------------------------------------- | --------------------------------------- | --------------------------------------- |
| ![](/draw_calls/drawcall.png) | ![](/draw_calls/drawcall-1.png) | ![](/draw_calls/drawcall-2.png) |

## HLSL Programs

SRP 中通常用来书写 Shader 的语言是 `HLSL（High-Level Shading Language）` 。所有 HLSL 语言需要写在 `Pass` 中，且必须在 `HLSLPROGRAM` 和 `ENDHLSL` 中，如下所示：

```glsl
Pass
{
    HLSLPROGRAM
    ENDHLSL
}
```

{% note info %}
Unity 定义的 `.shader` 文件属于 `ShaderLab` 。`ShaderLab` 中可以使用不同的语言来写，如 `CG` 和 `HLSL` 。
`HLSL` 可以同时被用在 DRP，URP，HDRP 和自定义 SRP 中。 `CG` 仅可以被用在 DRP 和自定义 SRP 中。
因此为了保证与 Unity 的 RP 的统一性，在自定义 SRP 中建议使用 `HLSL` 。
{% endnote %}

在 Shader 中需要指定顶点着色器和片元着色器的函数名称，如下所示， `UnlitPassVertex` 和 `UnlitPassFragment` 分别为两者的名称：

```glsl
Pass
{
    HLSLPROGRAM
	#pragma vertex UnlitPassVertex
    #pragma fragment UnlitPassFragment
    ENDHLSL
}
```

但此时 Shader 中并没有 `UnlitPassVertex` 和 `UnlitPassFragment` 的具体实现，因此会产生编译错误。

可以直接在 `HLSLPROGRAM` 和 `ENDHLSL` 间定义上述函数的实现，也可以选择将函数的实现放在 `.hlsl` 文件中，并 `include` 到 `.shader` 文件中，如下所示：

```glsl
Pass
{
    HLSLPROGRAM
	#pragma vertex UnlitPassVertex
    #pragma fragment UnlitPassFragment
	#include "UnlitPass.hlsl"
    ENDHLSL
}
```

{% note info %}
HLSL 和 C++ 的 `include` 逻辑类似，即直接将被 include 的文件的所有内容拷贝到 `include` 语句所在地。
{% endnote %}

## Include Guard && Shader Functions

`.hlsl` 文件不能通过 Unity 直接创建，但在文件浏览器中创建后，可以在 Unity 中直接查看，如下所示：
![](/draw_calls/drawcall-3.png)

一个可通过编译的 `hlsl` 文件如下所示：

```glsl
#ifndef CUSTOM_UNLIT_PASS_INCLUDED

    #define CUSTOM_UNLIT_PASS_INCLUDED

    float4 UnlitPassVertex():SV_POSITION
    {
        return 0.0;
    }

    float4 UnlitPassFragment():SV_TARGET
    {
        return 0.0;
    }

#endif
```

其中 `#ifndef` 等宏编译是为了避免， `.hlsl` 文件被多次时 include 时产生重定义，并导致编译错误。

`UnlitPassVertex` 和 `UnlitPassFragment` 为需要的顶点着色器和片段着色器函数。

在函数声明后的 `SV_POSITION` 和 `SV_TARGET` 为 `semantics` ，它告诉了编译器函数的返回值的具体含义。

其中 `SV_TARGET` 表示渲染对象的颜色， `SV_POSITION` 表示在其次裁剪空间的位置。

{% note info %}
如果没有定义 `semantics` ，则会导致编译失败。
更多关于 HLSL 的内容，可见 [High-Level Shading Language](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl)
其中的 `semantics` 可见 [Semantics](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics?redirectedfrom=MSDN)
Unity 官方也有相关的教程 [Shader semantics](https://docs.unity3d.com/Manual/SL-ShaderSemantics.html)
{% endnote %}

此时通过该 Shader 并不能渲染出任何物体，因为在顶点着色器中直接返回了 `0.0` 表示，即所有物体渲染的结果都会集中在屏幕正中间的一个像素上，所以不可见。

## Space Transformation

为了让物体可以正常的被渲染，需要将传入的顶点数据通过顶点着色器进行 `MVP` 矩阵的转换，如下所示:

```glsl
#include "../Custom RP/ShaderLibrary/Common.hlsl"

float4 UnlitPassVertex(float3 positionOS: POSITION) : SV_POSITION
{
    float3 positionWS = TransformObjectToWorld(positionOS.xyz);
    return TransformWorldToHClip(positionWS);
}
```

{% note info %}
传入的 `positionOS` 参数后的 `POSITION` 也是 semantics，表示传入的数据是表示位置的。
{% endnote %}

{% note info %}
`POSITION` 和 `SV_POSITION` 的差异可见 Half-Pixel Offset
{% endnote %}

其中的 `TransformObjectToWorld` 和 `TransformWorldToHClip` 为自定义的坐标系转换的函数，如下所示：

```glsl
// In ShaderLibrary/Common.hlsl

#include "./UnityInput.hlsl"

float3 TransformObjectToWorld(float3 positionOS)
{
    return mul(unity_ObjectToWorld,float4(positionOS,1.0)).xyz;
}

float4 TransformWorldToHClip(float3 positionWS)
{
    return mul(unity_MatrixVP,float4(positionWS,1.0));
}
```

两个函数中用到了两个矩阵 `unity_ObjectToWorld` 和 `unity_MatrixVP` ，定义如下所示：

```glsl
// In ShaderLibrary/UnityInput.hlsl
float4x4 unity_ObjectToWorld;
float4x4 unity_MatrixVP;
```

{% note info %}
在 HLSL 中直接定义的变量即为 `Uniform` 变量，上述两个变量的命名与 Unity 内置着色器的变量名相同，因此 Unity 可以找到这两个 `Uniform` 变量并为其赋值。
{% endnote %}

`UnityInput.hlsl` 和 `Common.hlsl` 为新增的 `.hlsl` 文件，并放置在 `ShaderLibrary` 文件夹中，前者是为了封装 Unity 内置 Uniform 变量输入，后者是为了封装一些常用的函数。即此时文件结构为：
![Project Structure](/draw_calls/drawcall-4.png)

此时的结果如下所示，即可以看到一个正确的小球，因为我们已经完成了对于顶点着色器的设置的，但小球仍然是黑色的，因为我们尚未对片段着色器做设置：
![Black Sphere | 300](/draw_calls/image-20240302183509.png)

## Core RP Library

像上述的 `TransformObjectToWorld` 和 `TransformWorldToHClip` 是非常通用的函数，Unity 提供了 包 `Core RP Pipeline` 封装了这些函数的实现。可通过 Unity Package Manager 并选择 `Core RP Library` 进行安装：

{% note primary %}
当导入了 `Core RP Pipeline` 后，相关的源码可以在 `<ProjectPath>Library\\PackageCache\\com.unity.render-pipelines.core@<version>\\` 中查看
{% endnote %}

因此可以使用 `Core RP Pipeline` 的 `SpaceTransform.hlsl` 中 的内容替代自己实现的版本。

```glsl
// In Common.hlsl

#include "Packages/com.unity.render-pipelines.core/ShaderLibrary/SpaceTransforms.hlsl"

// float3 TransformObjectToWorld(float3 positionOS)
// {
//     return mul(unity_ObjectToWorld,float4(positionOS,1.0)).xyz;
// }

// float4 TransformWorldToHClip(float3 positionWS)
// {
//     return mul(unity_MatrixVP,float4(positionWS,1.0));
// }
```

因为 `Core RP Pipeline` 中使用的变量与 Unity 中使用的 Shader 参数命名不相同，因此需要通过 `define` 将两者进行转换。如 `unity_ObjectToWorld` 变量，在 `SpaceTransform.hlsl` 中对应使用的变量为 `Unity_MATRIX_M` ，因此需要将 `unity_ObjectToWorld` 转换为 `Unity_MATRIX_M`，以保证 `SpaceTransform.hlsl` 可以正常工作，转换语句为：

```csharp
#define UNITY_MATRIX_M unity_ObjectToWorld
```

与 `UNITY_MATRIX_M` 一样，`SpaceTransform.hlsl` 中还有许多变量需要相同的处理，如下的代码将所有这些代码与 Unity 内置的 Shader 参数命名对应在一起：

```glsl
#define UNITY_MATRIX_M unity_ObjectToWorld
#define UNITY_MATRIX_I_M unity_WorldToObject
#define UNITY_MATRIX_V unity_MatrixV
#define UNITY_MATRIX_I_V unity_MatrixInvV
#define UNITY_MATRIX_VP unity_MatrixVP
#define UNITY_PREV_MATRIX_M unity_prev_MatrixM
#define UNITY_PREV_MATRIX_I_M unity_prev_MatrixIM
#define UNITY_MATRIX_P glstate_matrix_projection
```

所有需要用到的参数，都需要在 `UnityInput.hlsl` 中定义，即最终的 `UnityInput.hlsl` 如下所示：

```glsl
float4x4 unity_ObjectToWorld;
float4x4 unity_WorldToObject;
real4 unity_WorldTransformParams;

float4x4 unity_MatrixVP;
float4x4 unity_MatrixV;
float4x4 unity_MatrixInvV;
float4x4 unity_prev_MatrixM;
float4x4 unity_prev_MatrixIM;
float4x4 glstate_matrix_projection;
```

其中的 `real4` 是一个根据平台定义的参数，根据不同的平台，它可能被定义为 `half4` 或 `float4` 。 `real4` 的定义在 `Core RP Pipeline` 的 `Common.hlsl` 中。

{% note primary %}
在 `UnityInput.hlsl` 中定义的变量相当于是声明，这些变量都是在 Unity Default Shader 中可以找寻到的，Unity 会负责将这些变量的值传递给 Shader。
`Common.hlsl` 中则是通过 define，将 Unity Default Shader 中的变量名与 `Core RP Pipeline` 中函数所依赖的变量名对应起来。
以定义在 `Core RP Pipeline` 中的 `SpaceTransforms.hlsl` 的函数 `GetObjectToWorldMatrix` 为例：
```hlsl
float4x4 GetObjectToWorldMatrix()
{
return UNITY_MATRIX_M;
}
```
它依赖变量 `UNITY_MATRIX_M` ，而 `UNITY_MATRIX_M` 正是通过我们在 `Common.hlsl` 中定义的 `#define UNITY_MATRIX_M unity_ObjectToWorld` 而得到的。
`unity_ObjectToWorld` 又进一步是因为我们在 `UnityInput.hlsl` 中声明了`float4x4 unity_ObjectToWorld`，才能正确获取到 `unity_ObjectToWorld` 的值。
{% endnote %}

因此，最终自定义的 `Common.hlsl` 如下所示：

```glsl
#include "Packages/com.unity.render-pipelines.core/ShaderLibrary/Common.hlsl"

#include "./UnityInput.hlsl"

#define UNITY_MATRIX_M unity_ObjectToWorld
#define UNITY_MATRIX_I_M unity_WorldToObject
#define UNITY_MATRIX_V unity_MatrixV
#define UNITY_MATRIX_I_V unity_MatrixInvV
#define UNITY_MATRIX_VP unity_MatrixVP
#define UNITY_PREV_MATRIX_M unity_prev_MatrixM
#define UNITY_PREV_MATRIX_I_M unity_prev_MatrixIM
#define UNITY_MATRIX_P glstate_matrix_projection

#include "Packages/com.unity.render-pipelines.core/ShaderLibrary/SpaceTransforms.hlsl"
```

上述引入的相互依赖关系如下：

1.  先引入 `Core RP Pipeline` 的 `Common.hlsl` 文件，保证 `real4` 变量被定义。
2.  引入自定义的 `UnityInput.hlsl` 文件，保证需要的变量被定义，且用 Unity 定义的着色器变量的名称。
3.  使用一系列 `define` 语句，将 Unity 引擎中定义的变量与 `Core RP Pipeline` 中需要用的变量联系在一起。
4.  引入 `Core RP Pipeline` 的 `SpaceTransforms.hlsl` ，其中的 `TransformObjectToWorld` 和 `TransformWorldToHClip` 即为需要的函数。

此时可以看到和之前一样被绘制出来的黑色小球：
![Black Sphere ](/draw_calls/image-20240302190739.png)

## Color

在 `UnlitPass.hlsl` 中新增变量 `_BaseColor` 并将该颜色作为像素输出的颜色，如下所示：

```glsl
float4 m_BaseColor;

// ...

float4 UnlitPassFragment():SV_TARGET {
    return m_BaseColor;
}
```

为了让该变量可以在 Unity 的 Material 面板中展现出来，需要在 `.shader` 文件的 `Properties` 中加入，如下所示：

```glsl
Properties
{
    m_BaseColor("Color", Color) = (1.0, 1.0, 1.0, 1.0)
}
```

其中的 `m_BaseColor` 对应在 `UnlitPass.hlsl` 中定义的变量， `"Color"` 为最终在 Inspector 面板中显示的名称， `Color` 为变量的类型，`(1.0, 1.0, 1.0, 1.0)` 为变量的初始值。

即在 `Properties` 中定义的变量，格式为：

```glsl
<Target Parameter>("<DisplayName>", <Type>) = <default Value>
```

# Batch

使用上述着色器，生成四个颜色不同的材质，如下所示：
![Blue](/draw_calls/drawcall-6.png)
![Red](/draw_calls/drawcall-7.png)
![Green](/draw_calls/drawcall-8.png)
![Yellow](/draw_calls/2024-03-02-21-28-55.png)

在场景内添加 76 个小球，并用上述的材质随机给小球添加，效果如下所示：

![76 Spheres with random material](/draw_calls/drawcall-9.png)

在 Frame Debugger 中可以看到此时一共需要用到 78 个 DrawCall ，其中 76 个绘制小球，一个绘制天空盒，一个用来 Clear。如下所示
![Frame Debugger](/draw_calls/drawcall-10.png)

但如果 Game 窗口的 Statistic 界面中，只能看到 77 个 `Batches` ，这是因为 `Batches` 的计算无视了 Clear 。
![Game Statistic](/draw_calls/drawcall-11.png)

## SRP Batcher

`Batching` 是将多个 Draw Call 结合在一起的过程。在 SRP 中最简单使用 `Batching` 的方法就是激活 `SRP Batcher` 功能，但这功能仅能在兼容的 Shader 中开启，上述自定义的 `Unlit` Shader 还不支持此功能，如下所示：
![](/draw_calls/drawcall-12.png)

`SRP Batcher` 本质上并没有减少 Draw Call 的数量，它只是将一些材质的 Uniform 数据缓存在 GPU 上，让 CPU 不需要每帧都去设置。这样同时减少了 CPU 处理数据的时间以及 CPU 向 GPU 传输的数据量。

所有可以被 `SRP Batcher` 缓存在 GPU 的 Uniform 数据都必须定义在一块地址不变的内存中，在 `SRP` 中可以通过将数据包裹在 `cbuffer`(Shader Constants Buffer) 定义的数据块中。

针对我们之前定义的 `UnlitPass.hlsl` Shader 就需要将 `m_BaseColor` 变量用 `cbuffer` 包裹，如下所示：

```glsl
// In UnlitPass.hlsl
cbuffer UnityPerMaterial
{
    float4 _BaseColor;
}
```

{% note warning %}
`SRP Batcher` 要求自定义的数据类型必须要放在名为 `UnityPerMaterial` 的数据块中，所有 Unity 内置的数据类型要放在名为 `UnityPerDraw` 的数据库中 [^2]。
{% endnote %}

但 `cbuffer` 并不是在所有的平台下都支持，如 OpenGL ES 2.0 就不支持，所以为了保证兼容性，可以可以使用如下的方式进行替代：

```glsl
// In UnlitPass.hlsl

CBUFFER_START(UnityPerMaterial)
    float4 m_BaseColor;
CBUFFER_END
```

同理，还需要将一些坐标转换的数据也放到 `cbuffer` 中，如下所示，其中的 `unity_LODFADE` 虽然没用到，但同样必须包裹在 `Cbuffer` 中：

```glsl
// In UnityInput.hlsl

CBUFFER_START(UnityPerDraw)
    float4x4 unity_ObjectToWorld;
    float4x4 unity_WorldToObject;
    float4 unity_LODFADE;
    real4 unity_WorldTransformParams;
CBUFFER_END
```

当定义完后，Shader 就变为兼容 `SRP Batcher` ，如下所示：
![|300 ](/draw_calls/drawcall-13.png)

此时在自定义的渲染管线中，开启 `SRP Batcher` 即可，可以在自定义渲染管线构造时直接启用，如下所示：

```glsl
// In CustomRendererPipeline.cs

public CustomRenderPipeline()
{
    GraphicsSettings.useScriptableRenderPipelineBatching = true;
}
```

此时在 Game 界面的 Statistic 窗口查看，可以看到仍然显示 77 个 Batches，而 `Saved by batching` 则变成了 $-76$ 个，如下所示：
![Frame Debugger](/draw_calls/drawcall-14.png)

之所以 `Saved by batching` 出现负数是因为 Unity 的 Statistic 窗口对于 SRP 存在 Bug，因此更好的选择是通过 Frame Debugger 查看，如下所示可以看到仅有一个 Batch：
![Only Batch In Frame Debugger](/draw_calls/drawcall-15.png)

{% note primary %}
上图中 Draw Calls 仍然是 76，因为 `SRP Batcher` 并未合并 DrawCall，只是在 GPU 缓存了数据，减少了数据的传输和准备时间。
{% endnote %}

SRP Batcher 的实现原理中，真正关心的是材质的 GPU 的内存的分布是否相同。因此不同的材质只要使用相同的着色器时，他们的 `UnityPerMaterial` 的内存分布都是相同的，因此可以被合并。

如在上述的例子中，虽然使用了四种不同的材质来绘制小球，但最终所有的都被合并到一个 Batch 中，这是因为这四个材质实际上都是使用同一个 Shader。

{% note warning %}
Unity 实际上判断的是着色器是否相同。因此如果两个不同的着色器定义了相同的 `UnityPerMaterial` 内存，仍然是没法被合并的。
{% endnote %}

## Many Colors

在开发过程中，如果有更多的小球需要有更多不同的颜色，为每种颜色都创建一个材质是不现实的。因此需要在运行时去修改已有的材质。

如下定义了脚本 `PerObjectMaterialProperties`，该脚本通过 `m_BaseColor` 去修改 `MaterialPropertyBlock`达到修改材质颜色的目标 ：

```csharp
using UnityEngine;

[DisallowMultipleComponent]
public class PerObjectMaterialProperties : MonoBehaviour
{
    private static int s_BaseColorId = Shader.PropertyToID("m_BaseColor");
    private static MaterialPropertyBlock s_Block;

    [SerializeField] private Color m_BaseColor = Color.white;

    private void Awake() { OnValidate(); }

    private void OnValidate()
    {
        s_Block ??= new MaterialPropertyBlock();
        s_Block.SetColor(s_BaseColorId, m_BaseColor);
        GetComponent<Renderer>().SetPropertyBlock(s_Block);
    }
}
```

{% note primary %}
关于 `MaterialPropertyBlock.SetXXX` 和 `Material.SetXXX` 的区别见 Material Property Blocks 。概括而言 `MaterialPropertyBlock` 保证了材质不会被拷贝，虽然每个物体都设置了自己的 Material Property，但它们仍然使用的是一个材质。
{% endnote %}

{% note primary %}
因为小球的颜色实际上上是由 `PerObjectMaterialProperties` 通过 Material Property 决定的，所有此时所有小球使用同一个材质仍然可以拥有不同的颜色。
{% endnote %}

此时的效果为：
![Many Colors](/draw_calls/2024-03-03-14-15-09.png)

`SRP Batch` 并无法处理运行时的 `Per-Object` 的 Material Property，因此此时查看 Frame Debugger，会发现所有的小球都是单独的 DrawCall 进行绘制的：

![DrawCall for every Sphere](/draw_calls/2024-03-03-11-19-33.png)

针对这种 `Per-Object` 的 Material Property 修改情况，可以使用 [GPU Instancing](/draw_calls/#gpu_instancing) 进行处理。

## GPU Instancing

对于同一个材质，但是因为使用了 Material Property Blocks 而打断 Batch 的情况，可以使用 `GPU Instancing` 将它们合并为一个 DrawCall 进行渲染。 CPU 会将这些物体各自对于材质的修改组合成一个数组（ `Instanced Data`）并一次性送给 GPU，GPU 在渲染它们时使用 index 进行区分。

OpenGL 中 GPU Instancing 的实现可见 Instancing

目前实现的 Shader 是不支持 GPU Instancing 的。为了让其支持 Instancing，首先需要加上 `multi_compile_instancing` 的关键字，如下所示：

```glsl
// Unlit.shader
Pass
{
    HLSLPROGRAM
    #pragma multi_compile_instancing
    #pragma vertex UnlitPassVertex
    #pragma fragment UnlitPassFragment
    #include "UnlitPass.hlsl"
    ENDHLSL
}
```

此时可以看到使用了该 Shader 的材质面板中出现了 `Enable GPU Instancing` 关键字，如下所示，带上该关键字后，Unity 在编译时会为 Shader 生成两份代码，一份支持 Instancing，一份不支持：
![](/draw_calls/drawcall-17.png)

但勾选了选项后会发现使用了同一材质的物体并没有被合并为一个 Shader 进行渲染，这是因为 Unity 在编译时需要知道哪些数据需要被组合为 `Instanced Data`的，因此 Shader 具体的实现也需要对应的更改。

为了构建 `Instanced Data`，首先需要引入 `Core RP Library` 中的 `UnityInstancing.hlsl` ，该 Shader 封装了一系列 Instancing 相关的函数，如通过 Instancing 的 Index 去访问 Instanced Data。

```hlsl
// Common.hlsl
#include "Packages/com.unity.render-pipelines.core/ShaderLibrary/UnityInstancing.hlsl"
#include "Packages/com.unity.render-pipelines.core/ShaderLibrary/SpaceTransforms.hlsl"
```

Unity 中整个支持 Instancing 的 Shader 的逻辑大致为，Instancing Index 在顶点着色器中被输入，经过转换传递给片段着色器，最终在片段着色器中根据 Index 获取到对应的数值。`UnlitPass.hlsl` 中的主体代码将修改为如下形式：

```hlsl
// In UnlitPass.hlsl
UNITY_INSTANCING_BUFFER_START(UnityPerMaterial)
    UNITY_DEFINE_INSTANCED_PROP(float4, m_BaseColor)
UNITY_INSTANCING_BUFFER_END(UnityPerMaterial)

struct Attributes {
    float3 positionOS: POSITION;
    UNITY_VERTEX_INPUT_INSTANCE_ID
};

struct Varyings {
    float4 positionCS : SV_POSITION;
    UNITY_VERTEX_INPUT_INSTANCE_ID
};

Varyings UnlitPassVertex(Attributes input) {
    Varyings output;
    UNITY_SETUP_INSTANCE_ID(input)
    UNITY_TRANSFER_INSTANCE_ID(input, output);
    float3 positionWS = TransformObjectToWorld(input.positionOS.xyz);
    output.positionCS = TransformWorldToHClip(positionWS);
    return output;
}

float4 UnlitPassFragment(Varyings input) : SV_TARGET {
    UNITY_SETUP_INSTANCE_ID(input)
    return UNITY_ACCESS_INSTANCED_PROP(UnityPerMaterial, m_BaseColor);
}
```

相较于之前 `UnlitPass.hlsl` 的代码，这里的改动主要在于：

1. 使用 `Attributes` 和 `Varying` 结构体封装顶点着色器和片段着色器的输入，且每个结构体中，都用 `UNITY_VERTEX_INPUT_INSTANCE_ID` 标记其中的相关数据是与 Instancing Index ID 绑定的。
2. 使用 `UNITY_INSTANCING_BUFFER_START` 和 `UNITY_INSTANCING_BUFFER_END` 包裹需要 Instanced 的数据
3. 使用 `UNITY_SETUP_INSTANCE_ID` 获取输入数据所对应的 instancing index id，使用 `UNITY_TRANSFER_INSTANCE_ID` 将输入的 instancing index id 拷贝给输出。
4. 使用 `UNITY_ACCESS_INSTANCED_PROP` 访问 Instanced Data

{% note primary %}
通常 `UnityPerMaterial` 的数据需要被标记为 Instanced Data 。 `UnityPerDraw` 的数据，如 `unity_ObjectToWorld` 是不需要被标记为 Instanced Data。
{% endnote %}

{% note primary %}
Instanced Data 同样兼容 SRP Batcher，两者并不是相互冲突的设置，即一个材质可以同时支持 SRP Batcher 和 GPU Instancing。
{% endnote %}

当 Shader 修改完成后，选择小球使用的 Material，并在其中选择 `Enable GPU Instancing`：
![Enable GPU Instancing](/draw_calls/2024-03-03-14-19-51.png)

此时通过 Frame Debugger 可以看到之前所有的 DrawCall 都被一个 Instanced Draw 合并：
![One Instanced Draw](/draw_calls/2024-03-03-14-20-54.png)

## Drawing Many Instanced Meshes

上一节中，已经可以让场景内多个使用相同材质，但被 `MaterialPropertyBlock` 修改的物体通过 GPU Instancing 一次性被渲染。

但如果要一次性生成大量的物体，如 1000 个小球，每个都需要有不同的颜色。此时继续通过 `PerObjectMaterialProperties` 进行修改的话，那就需要创建许多的 `MonoBehaviour` 实例，而这对于性能是不友善的。

针对这种需求，更普遍的做法是在代码中通过 `Graphics.DrawMeshInstanced` 进行绘制，如下所示：

```csharp
public class DrawMassiveMeshBall : MonoBehaviour
{
    private static int s_BaseColorId = Shader.PropertyToID("m_BaseColor");

    [SerializeField] private Mesh m_Mesh = default;

    [SerializeField] private Material m_Material = default;

    private Matrix4x4[] m_Matrices = new Matrix4x4[1023];
    private Vector4[] m_BaseColors = new Vector4[1023];
    private MaterialPropertyBlock m_Block;

    private void Awake()
    {
        for (int i = 0; i != m_Matrices.Length; ++i)
        {
            m_Matrices[i] = Matrix4x4.TRS(Random.insideUnitSphere * 10f, Quaternion.identity, Vector3.one);
            m_BaseColors[i] = new Vector4(Random.value, Random.value, Random.value, 1);
        }
    }

    private void Update()
    {
        if (m_Block == null)
        {
            m_Block = new MaterialPropertyBlock();
            m_Block.SetVectorArray(s_BaseColorId, m_BaseColors);
        }

        Graphics.DrawMeshInstanced(m_Mesh, 0, m_Material, m_Matrices, 1023, m_Block);
    }
}
```

`Graphics.DrawMeshInstanced` 所接纳的形参分别是绘制用的 Mesh，Mesh 中的 SubMeshIndex（这里为 0），绘制用的材质，表示绘制 Mesh 位姿的 Matrices 绘制的数量，以及所用的 Material Property Block。注意这里通过 `MaterialPropertyBlock.SetVectorArray` 将绘制小球所需要的 Colors 一次性设置给了 Material Property Block。

此时可以看到的效果为：
![Massive Spheres](/draw_calls/drawcall-19.png)

此时可以从 Frame Debugger 中看到绘制了 1023 个小球仅用了 3 个 DrawCall：

![Three Draw Call](/draw_calls/drawcall-20.png)

## Dynamic Batching

还有一种方法减少 DrawCall 的方法称为 `Dynamic Batching`，该方法将多个拥有相同材质小的 Mesh 动态结合为一个大的 Mesh，达到可以一次性渲染的目的。

`Dynamic Batching` 与 `GPU Instancing` 是互斥的，因此当需要用 `Dynamic Batching` 时，需要在 `DrawSetting` 中将 `GPU Instancing` 关闭，如下所示：

```csharp
// CameraRenderer.cs
DrawingSettings drawingSettings = new DrawingSettings(unlitShaderTagId, sortingSettings)
{
    enableDynamicBatching = true,
    enableInstancing = false
};
```

且 `SRP Batcher` 比 Dynamic Batching 也有更高的优先级，所以也需要将其关闭：

```csharp
// CustomRenderPipeline.cs
public CustomRenderPipeline()
{
    GraphicsSettings.useScriptableRenderPipelineBatching = false;
}
```

对于可以被`Dynamic Batching` 的小 Mesh，Unity 也有[一系列的限制](https://docs.unity3d.com/Manual/DrawCallBatching.html)，如：

1.  顶点数必须在 300 以下，顶点数据（一个顶点可能有多个顶点数据）的数量必须在 900 以下
2.  不能有镜像的大小，如一个物体的尺寸是 $1$，另一个物体的尺寸是 $-1$，这两物体不会被 Batch 在一起。
3.  不能拥有一样的材质
4.  带有不同烘焙贴图参数的物体不能被 Batch 在一起
5.  不能被 `Multi-Pass` 的 Shader 打断

{% note warning %}
`Dynamic Batching` 还可能造成的一些Bug，如当物体有不同的 Scale 时，较大物体的法线不能保证为 Unit Vector。
{% endnote %}

因为 Unity 中的默认的 Sphere 物体，顶点数是 $515$ 个，不满足上述条件 1，因此无法被 `Dynamic Batching` 在一起。而默认的 Cube 物体，顶点数为 $24$ 个，满足条件，因此可使用 Cube 作为测试 `Dynamic Batching` 的物体。

如下为 76 Cube，使用了四种不同的材质，渲染的效果如下所示：
![76 Cubes](/draw_calls/drawcall-21.png)

此时查看 Frame Debugger，可以看到 76 个 Cubes 使用了 7 个 DrawCall 完成了渲染：

![7 DrawCall](/draw_calls/drawcall-22.png)

{% note primary %}
通常情况下， `GPU Instancing` 是比 `Dynamic Batching` 更好的解决方法，因为少了很多限制，也不会产生 Bug。
{% endnote %}

{% note primary %}
当多个小 Mesh 使用了同一材质，但是用了 `MaterialPropertyBlock` 修改时， `Dynamic Batching` 也不生效。
{% endnote %}

## Configuring Batching

上述介绍了三种减少 DrawCall 的方法， `SRP Batcher` ， `GPU Instancing` ，`Dynamic Batching` 。而 `Dynamic Batching` 与前两者互斥，在之前的代码中，是直接通过 Hard Code 来切换不同的特性，而理想上需要动态的根据所选择的减少 DrawCall 的方式去调整代码。

解决思路为创建 `CustomRenderPipeline` 时指定需要使用的特性，然后将选择一路传递给具体的 Renderer，Renderer 以此去调整参数，如下所示：

```csharp
// CustomRenderPipelineAsset.cs
public class CustomRenderPipelineAsset : RenderPipelineAsset
{
    [SerializeField] private bool m_UseDynamicBatching = true;
    [SerializeField] private bool m_UseGPUInstancing = true;
    [SerializeField] private bool m_UseSRPBatcher = true;

    protected override RenderPipeline CreatePipeline()
    {
        return new CustomRenderPipeline(m_UseDynamicBatching, m_UseGPUInstancing, m_UseSRPBatcher);
    }
}

// CustomRendererPipeline.cs
// ...
private bool m_UseDynamicBatching;
private bool m_UseGPUInstancing;
// ...
public CustomRenderPipeline(bool useDynamicBatching, bool useGPUInstancing, bool useSRPBatcher)
{
    m_UseDynamicBatching = useDynamicBatching;
    m_UseGPUInstancing = useGPUInstancing;
    GraphicsSettings.useScriptableRenderPipelineBatching = useSRPBatcher;
}

protected override void Render(ScriptableRenderContext context, List<Camera> cameras)
{
    cameras.ForEach(camera => m_Renderer.Render(context, camera, m_UseDynamicBatching, m_UseGPUInstancing));
}

// CameraRenderer.cs
public void Render(ScriptableRenderContext renderContext, Camera camera,bool useDynamicBatching, bool useGPUInstancing)
{
    // ...
    DrawVisibleGeometry(useDynamicBatching, useGPUInstancing);
    // ...
}

private void DrawVisibleGeometry(bool useDynamicBatching, bool useGPUInstancing)
{
    // ...
    DrawingSettings drawingSettings = new DrawingSettings(unlitShaderTagId, sortingSettings)
    {
        enableDynamicBatching = useDynamicBatching,
        enableInstancing = useGPUInstancing
    }
    // ...
}
```

# Transparency

在材质中的 `Render Queue` 部分，可以看到有 `Transparent` 选项，如下所示，但这里的 `Transparent` 仅是修改物体的渲染顺序，而并不会改变物体的渲染特性。即此时将 `Base Color` 调整为半透明的，最终渲染的结果仍然是完全不透明的。
![Render Queue](/draw_calls/drawcall-23.png)

## Blend Modes

为了真正实现半透明效果，需要开启 `Alpha Blending` ，在 Unity 中通过 `Blend [<SrcBlend>] [<DstBlend>]` 语句切换 Alpha Blending。当 `<SrcBlend>` 为 1， `<DstBlend>` 为 0 时 Alpha Blending 关闭，其余情况为打开。

为了让 `Unlit` Shader 支持半透明，可将其修改为：

```glsl
// Unlit.shader
Properties
{
    m_BaseColor("Color", Color) = (1.0, 1.0, 1.0, 1.0)
    [Enum(UnityEngine.Rendering.BlendMode)] m_SrcBlend("Src Blend", Float) = 1
    [Enum(UnityEngine.Rendering.BlendMode)] m_DstBlend("Dst Blend", Float) = 0
}

SubShader
{
    Pass
    {
        Blend [m_SrcBlend] [m_DstBlend]
        // ...
    }
}
```

此时新建一个 `CustomUnlitTransparentYellow` 材质，并按如下设置：
![CustomUnlitTransparentYellow](/draw_calls/drawcall-24.png)

并用该材质替代原来使用 `CustomUnlitYellow` 材质的小球，此时的效果如下：

![Transparent Yellow Effect](/draw_calls/drawcall-25.png)

## Not Writing Depth

通常而言 `Transparent` 的物体渲染顺序为从远到近，也因此深度检测对 `Transparent` 在很多情况下是不产生效果的（从远到近渲染，新绘制的东西通常都会过深度测试）。因此可以选择在渲染 `Transparent` 时将深度缓冲的写入关闭，为了支持关闭深度检测，需要将 Shader 修改如下：

```glsl
// Unlit.shader
Properties
{
    // ...
    [Enum(Off,0,On,1)] m_ZWrite ("Z Write", Float) = 1
}

SubShader
{
    Pass
    {
        ZWrite [_ZWrite]
        // ...
    }
}
```

此时的材质应当修改如下：
![Turn off ZWrite](/draw_calls/2024-03-03-16-18-24.png)

## Texturing

为了让小球半透明，还可以使用带有半透明信息的贴图，在这里可以自定义一个 Shader `UnlitTransparentTexture.shader`，在 `Unlit.shader` 的基础上为了让材质支持纹理采样，首先需要在 Shader 的 `Properties` 中增加：

```glsl
// UnlitTransparentTexture.shader
Shader "Custom RP/UnlitTexture"
// ...
Properties
{
    m_BaseMap("Texture", 2D) = "white" {}
    // ...
}
```

其中 `2D` 表示为一张二维的纹理， `White` 表示默认值为 Unity 定义的白色纹理，最后的 `{}` 为早期 Unity 版本中对纹理的设置选项，目前已经废弃，但仍需要定义，避免一些奇怪的错误。

对纹理也需要定义特定的 Uniform 变量，变量的类型为 `TEXTURE2D` ，且需要额外增加一个 `SAMPLER` 类型的变量，作为控制纹理 Filter 和 Wrap 模式的采样器，我们将这些数据定义在新建的 `UnlitTransparentTexturePass.hlsl` 中，该文件以 `UnlitPass.hlsl` 作为基础，如下所示：

```glsl
// UnlitTransparentTexturePass.hlsl

// ...
TEXTURE2D(m_BaseMap);
SAMPLER(sampler_m_BaseMap);

// ...
```

确保要将 `UnlitTransparentTexture.shader` 中 include 的 `hlsl` 修改为 `UnlitTransparentTexturePass.hlsl`。

{% note warning %}
`SAMPLER` 变量的命名应该与 `TEXTURE2D` 相同，只不过前面添加 `sampler_` 字段。
{% endnote %}

此时创建的 Material，可以看到多了 `Texture` 的数据，除了纹理贴图的设置外，还有 `Tiling` 和 `Offset` 选项的设置，前者表示纹理 UV 的大小，后者表示 UV 的起始点。整体如下所示：
![Material With Texture ](/draw_calls/2024-03-03-16-38-30.png)

`Tiling` 和 `Offset` 为 Unity 为每个纹理定义的 `Special Texture properties`，需要在着色器中定义对应的 `float4` 变量才行。该变量的命名规则为 `<TextureName>_ST` ，如上述纹理命名为 `m_BaseMap` ，则需要定义 `m_BaseMap_ST` ，且该变量可以作为 instanced data。因此定义如下所示：

```glsl
// UnlitTransparentTexturePass.hlsl

TEXTURE2D(m_BaseMap);
SAMPLER(sampler_m_BaseMap);

UNITY_INSTANCING_BUFFER_START(UnityPerMaterial)
    UNITY_DEFINE_INSTANCED_PROP(float4, m_BaseColor)
    UNITY_DEFINE_INSTANCED_PROP(float4, m_BaseMap_ST)
UNITY_INSTANCING_BUFFER_END(UnityPerMaterial)
```

之后就是在顶点着色器的输入中加入 UV 信息，并在经过 `Tiling` 和 `Offset` 的调整后传入片段着色器中，片段着色器中根据调整后的 UV 通过 `SAMPLE_TEXTURE2D` 函数采样纹理。整个改动如下所示：

```hlsl
// UnlitTransparentTexturePass.hlsl
struct Attributes {
    float3 positionOS: POSITION;
    float2 baseUV : TEXCOORD0;
    UNITY_VERTEX_INPUT_INSTANCE_ID
};

struct Varyings {
    float4 positionCS : SV_POSITION;
    float2 baseUV : VAR_BASE_UV;
    UNITY_VERTEX_INPUT_INSTANCE_ID
};

Varyings UnlitPassVertex(Attributes input) {
    Varyings output;
    UNITY_SETUP_INSTANCE_ID(input)
    UNITY_TRANSFER_INSTANCE_ID(input, output);
    float3 positionWS = TransformObjectToWorld(input.positionOS.xyz);
    output.positionCS = TransformWorldToHClip(positionWS);

    float4 baseST = UNITY_ACCESS_INSTANCED_PROP(unityPerMaterial, m_BaseMap_ST);
    output.baseUV = input.baseUV * baseST.xy + baseST.zw;

    return output;
}

float4 UnlitPassFragment(Varyings input) : SV_TARGET {
    UNITY_SETUP_INSTANCE_ID(input)

    float4 baseMap = SAMPLE_TEXTURE2D(m_BaseMap, sampler_m_BaseMap, input.baseUV);
    float4 color = UNITY_ACCESS_INSTANCED_PROP(UnityPerMaterial, m_BaseColor);
    return baseMap * color;
}
```

此时将原先场景中使用 `CustomUnlitRed` 材质的小球修改为使用 `CustomUnlitTextureRed` 材质，材质如下所示：
![CustomUnlitTextureRed | 400](/draw_calls/2024-03-03-16-56-17.png)

此时的场景效果如下：
![Red Transparent Texture](/draw_calls/drawcall-27.png)

在这个场景下，如果需要将 Batch 数降低到最低，应该首先开启 `CustomRP` 的 `Use SRP Batcher`，并让半透明的黄色小球的材质，也换为使用 `UnlitTransparentTexture.shader` 只不过材质为空，如下所示：
![Yellow Texture](/draw_calls/2024-03-03-17-10-17.png)

此时查看 Frame Debugger，可以发现所有的小球，使用了两个 Batch 就绘制完成了：
![Two Batch](/draw_calls/2024-03-03-17-12-36.png)

因为所有不透明的小球都是使用的一个 Shader `Unlit.shader`，而所有半透明的小球（无论使用了贴图与否）都使用了 `UnlitTransparentTexture.shader`。

## Alpha Clipping

`Alpha Clipping` 是将一些不满足要求的像素直接丢弃掉避免渲染的方法，在 Unity 中也被称为 `Cutoff` 。

我们在 `UnlitTransparentTexture.shader` 和 `UnlitTransparentTexturePass.hlsl` 的基础上定义 `UnlitTransparentTextureCutoff.shader` 和 `UnlitTransparentTextureCutoffPass.hlsl` 以支持 `Cutoff` 特性。

为使用 `Alpha Clipping` ，首先需要定义它丢弃的阈值，即 `cutoff threshold` ，该变量也可以放在 `Unity Per Material` 中作为 Instanced Data。在片段着色器中通过 `clip` 函数剔除不需要的像素，该函数接受一个 float 类型的形参，当形参值小于 0 时，该像素会被丢弃。整个流程如下所示：

```glsl
// UnlitTransparentTextureCutoff.shader
Properties
{
    // ...
    m_Cutoff("Alpha Cutoff", Range(0.0, 1.0)) = 0.5
    // ...
}

// UnlitTransparentTextureCutoffPass.hlsl
// ...
UNITY_INSTANCING_BUFFER_START(UnityPerMaterial)
    UNITY_DEFINE_INSTANCED_PROP(float4, m_BaseColor)
    UNITY_DEFINE_INSTANCED_PROP(float4, m_BaseMap_ST)
    UNITY_DEFINE_INSTANCED_PROP(float, m_Cutoff)
UNITY_INSTANCING_BUFFER_END(UnityPerMaterial)

// ...
float4 UnlitPassFragment(Varyings input) : SV_TARGET {
    UNITY_SETUP_INSTANCE_ID(input)

    float4 baseMap = SAMPLE_TEXTURE2D(m_BaseMap, sampler_m_BaseMap, input.baseUV);
    float4 color = UNITY_ACCESS_INSTANCED_PROP(UnityPerMaterial, m_BaseColor);
    float4 base = baseMap * color;
    clip(base.a - UNITY_ACCESS_INSTANCED_PROP(UnityPerMaterial, m_Cutoff));
    return baseMap * color;
}

```

此时效果如下所示：
![Cutoff](/draw_calls/gif_2021-6-10_9-00-17.gif)

上示例子中，同时使用了 `Alpha Blending` 和 `Alpha Cutoff` 两个技术，但通常而言，这两个技术并不会一起使用。 `Alpha Blending` 使用时通常不会写入深度信息，而 `Alpha Cutoff` 使用时通常会写入深度信息。

当关闭了 `Alpha Blending` 并只使用 `Alpha Cutoff` 时，效果如下所示：
![Only Cutoff](/draw_calls/gif_2021-6-10_9-04-22.gif)

在现代 GPU 中， `Alpha Clipping` 可能会打断 `Early-Z` 造成性能的下降，因此最好仅在需要的时候开启 `Alpha Clipping` 功能。

## Shader Features

现在实现的 `UnlitTransparentTextureCutoff.shader` 中，无论何种情况都会启用 Cutoff，而在某些情况下，我们会希望 Cutoff 被关闭。

Unity 的 Shader Features 功能可以根据 Shader 中 `Toggle` 的值增加或移除特定的宏，并根据宏调整 Shader 的编译。整体流程如下所示：

```glsl
// UnlitTransparentTextureCutoff.shader
Properties
{
    // ...
    m_Cutoff("Alpha Cutoff", Range(0.0, 1.0)) = 0.5
    [Toggle(_CLIPPING)] m_Clipping("Alpha Clipping",float ) =0
    // ...
}
SubShader
{
    Pass
    {
        // ...
        HLSLPROGRAM
        #pragma shader_feature _CLIPPING
        // ...
        ENDHLSL
    }
}

// UnlitTransparentTextureCutoffPass.hlsl
float4 UnlitPassFragment(Varyings input):SV_TARGET
{
    // ...
    #if defined(_CLIPPING)
        clip(base.a - UNITY_ACCESS_INSTANCED_PROP(UnityPerMaterial, m_Cutoff));
    #endif
    return base;
}
```

其中 `#pragma shader_feature` 会让 Unity 根据在 `Toggle` 中定义的宏，即 `_CLIPPING` ，编译出两份不同的代码，一份是定义了 `_CLIPPING` ，一份是不定义的。

即对于使用了 `shader_feature` 且进行了不同配置的 Shader 而言，其在运行时实际上是不同的两份 Shader，也因此 [SRP Batcher](/draw_calls/#srp_batcher) 并不生效。

## Cutoff Per Object

在之前的 `PerObjectMaterialProperties` 脚本中可以加入 `Cutoff` 的设置，如下所示：

```csharp
// PerObjectMaterialProperties.cs

// ...
private static int s_CutoffId = Shader.PropertyToID("m_Cutoff");
// ...

[SerializeField] private float m_Cutoff = 0.5f;

// ...
private void OnValidate()
{
    s_Block.SetFloat(s_CutoffId, m_Cutoff);
}
```

结果如下：
![Different Cutoff](/draw_calls/2024-03-03-21-26-45.png)

## Ball of Alpha-Clipped Spheres

同理在使用 Instanced Drawing 时，也可以随机设置小球的透明度，并以此触发 `Alpha Clipping` 效果，如下所示：

```csharp
// InstancedDrawingMeshBall.cs

private void Awake()
{
    for (int i = 0; i != matrices.Length; ++i)
    {
        matrices[i] = Matrix4x4.TRS(Random.insideUnitSphere * 10f,
        Quaternion.Euler(Random.value * 360f, Random.value * 360f, Random.value * 360f),
        Vector3.one * Random.Range(0.5f, 0.1f));
        baseColors[i] = new Vector4(Random.value, Random.value, Random.value, Random.Range(0.5f, 1f));
    }
}
```

结果如下：
![](/draw_calls/drawcall-28.png)

# Reference

[Draw Calls (catlikecoding.com)](https://catlikecoding.com/unity/tutorials/custom-srp/draw-calls/)

[ShaderLab: adding shader programs](https://docs.unity3d.com/Manual/shader-shaderlab-code-blocks.html)

[Shader data types and precision](https://docs.unity3d.com/Manual/SL-DataTypesAndPrecision.html)

[Built-in shader variables](https://docs.unity3d.com/Manual/SL-UnityShaderVariables.html)

[^1]: [Unity - Manual: HLSL in Unity](https://docs.unity3d.com/Manual/SL-ShaderPrograms.html)
[^2]: [SRP Batcher: Speed up your rendering](https://blog.unity.com/engine-platform/srp-batcher-speed-up-your-rendering)

