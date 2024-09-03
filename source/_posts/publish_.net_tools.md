---
tags:
  - 工具
  - 教程
alias:
  - 发布 .Net Tools
created: 2024-09-02
updated: 2024-09-03
published: true
title: .Net Tools 发布指南
date: 2024-09-02 21:44
description: .Net Tools 发布教程，包含手动发布和命令行发布两种方式
---

在 [创建 .Net Tools ](/create_.net_tools) 中讲解了如何从零创建一个 .Net Tool，本文将讲解如何将 .Net Tool 发布到 [NuGet](https://www.nuget.org/) 上。

{% note info %}
[NuGet](https://www.nuget.org/) 是最大的 .Net 包管理组织，你可以在上面找到大量的 .Net 包，也可以将自己的包发布到上面。
本文假设你已经创建了一个 .Net Tool（.nuget 文件），并且已经有了一个 NuGet 账号。
{% endnote %}

{% note info %}
NuGet 中管理的包，不仅仅是 .Net Tool，还有 .Net 库等等。
{% endnote %}

# 手动发布

登录 [NuGet](https://www.nuget.org/)，选择进入页面最上方的 `Upload` 入口，即可进入[上传页面](https://www.nuget.org/packages/manage/upload)，在其中选择 `Browse...` 并选择在 [打包 Tool](/create_.net_tools/#打包_tool) 时生成的 `.nupkg` 文件，点击 `Upload` 即可上传。

![浏览并上传 .nupkg](/publish_.net_tools/2024-09-02-23-04-36.png)

# 命令行发布

为了在命令行中发布包，必须获取一个 [NuGet API Key](https://www.nuget.org/account/apikeys)，该 Key 用于验证发布者的身份。

在 [NuGet API Key](https://www.nuget.org/account/apikeys) 页面中，点击 `Create`，并按提示输入信息后，点击 `Create` 即可生成一个 API Key，切记当创建好后，需要立刻复制并保存 API Key，因为之后将无法再看到该 Key。
![Copy Key](/publish_.net_tools/2024-09-02-23-03-15.png)

当获取到 Key 后，即可通过 `dotnet nuget push` 命令进行发布：

```shell
dotnet nuget push <.nupkg Path> --source https://api.nuget.org/v3/index.json --api-key <ApiKeys>
```

但这样要求每一次发布都要输入 Key，为了避免这种情况，可以通过 `nuget setapikey` 命令设置 API Key：

```shell
nuget setapikey <ApiKeys>
```

{% note primary %}
`nuget` 可通过 [Windows Package Manager](/windows_package_manager) 进行安装
```shell
winget install Microsoft.NuGet
```
{% endnote %}

对于发布的源，可以通过 `dotnet nuget config` 进行设置：

```shell
dotnet nuget config set defaultPushSource nuget.org
```

当配置了 Api Key 和 Source 后，在每次发布时就不再需要输入 Key 和 Source 了，只需要运行：

```shell
dotnet nuget push <.nupkg Path>
```

{% note info %}
`setapikey` 和 `config` 本质上都是修改了 `NuGet.config` 文件，该文件位于 `C:\Users\$env:username\AppData\Roaming\NuGet` 下。
{% endnote %}

{% note info %}
ApiKeys 只能通过 `nuget setapikey` 进行设置，不支持通过 `dotnet nuget config` 进行设置。 `dotnet nuget config` 只能设置配置文件中 `config` 字段下的数据。
所有可配置的内容见 [NuGet.Config Schema Reference](https://docs.microsoft.com/en-us/nuget/reference/nuget-config-file)。
{% endnote %}

# Reference

[dotnet nuget push command - .NET CLI | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-nuget-push)

