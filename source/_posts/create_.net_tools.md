---
tags:
  - Dotnet
created: 2023-10-21
updated: 2024-04-07
aliases:
  - .net Tools
published: true
title: .Net Tools 创建指南
date: 2023-11-05 22:25
description: .Net Tools 创建教程，包含一个最简例子（一个在命令行输出字符的小牛）演示如何将编写的命令行程序生成为可全局运行的工具
---

# 创建一个 .Net Tool

{% note primary %}
示例可见 [CowSay](https://github.com/xuejiaw/.net-samples/tree/main/cowsay)
{% endnote %}

{% note info %}
.Net Tool 需要使用 .net 6.0 及以上的版本
{% endnote %}

## 创建 .Net Tool 项目

使用 `dotnet new` 命令创建一个新的 .Net Tool：

```powershell
dotnet new console -n <ToolName> -f <Framework>
```

如下例创建了一个名为 `Cowsay` 的 .Net Tool，使用的是 .Net 8.0 的版本：

```powershell
dotnet new console -n CowSay -f net8.0
```

当执行上述命令后，会在当前目录下创建一个名为 `CowSay` 的文件夹，其中包含了一个名为 `Program.cs` 的文件，该文件中包含了一个 `Main` 方法，该方法是 .Net Tool 的入口方法。

以及包含有一个 `CowSay.csproj` 的文件，该文件是 .Net Tool 的项目文件。

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

</Project>
```

可以看到其中约定的 `TargetFramework` 是 `8.0`。

## 修改代码

将 `Program.cs` 中的代码修改为如下内容：

```csharp
using System.Reflection;

namespace CowSay;

internal static class Program
{
    private static void Main(string[] args)
    {
        if (args.Length == 0)
        {
            string? versionString = Assembly.GetEntryAssembly()?
               .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
               .InformationalVersion;

            Console.WriteLine($"Cow Say v{versionString}");
            Console.WriteLine("-------------");
            Console.WriteLine("\nUsage:");
            Console.WriteLine("  Cow Say <message>");
            return;
        }

        ShowCow(string.Join(' ', args));
    }

    private static void ShowCow(string message)
    {
        string bot = $"\n        {message}";
        bot += @"
    __________________
                         \
                          \
                             (oo)\_______
                             (__)        )\/\
                                 ||------||
                                 ||      ||
                            ";
        Console.WriteLine(bot);
    }
}
```

其中 `Main` 方法中的代码是用来处理命令行参数的，如果没有参数，会打印一系列提示信息。如果有参数，则会将参数组合成一个 `string` 并作为输出的小牛的 ASCII 图案中的一部分内容。

## 运行 Tool

此时在 `CowSay` 文件夹下执行 `dotnet run` 命令，会输出如下内容，因为此时并没有带上任何参数，所以会输出一系列提示信息：

```powershell
❯ dotnet run
Cow Say v1.0.0+d0f6e0d23ad19769312547a08ad5db8cf35fa97d
-------------

Usage:
  Cow Say <message>
```

如果运行 `dotnet run Hello World` 命令，则会输出如下内容。因为此时带上了参数，所以程序会将参数赋予给小牛并输出：

```powershell
❯ dotnet run Hello World

        Hello World
    __________________
                         \
                          \
                             (oo)\_______
                             (__)        )\/\
                                 ||------||
                                 ||      ||
```

## 打包 Tool

在运行打包前，先修改 `Cowsay.csproj` 文件，在 `<PropertyGroup>` 标签中添加如下内容：

```xml
<PackAsTool>true</PackAsTool>
<ToolCommandName>cowsay</ToolCommandName>
<PackageOutputPath>./nupkg</PackageOutputPath>
<Version> 1.0.1 </Version>
```

其中：

-   `<PackAsTool>` 标签是用来指定是否将项目打包为一个 .Net Tool
-   `<ToolCommandName>` 标签是用来指定打包后的 .Net Tool 的名称，该名称会用于后续在 CLI 中调用
-   `<PackageOutputPath>` 标签是用来指定打包后的 .Net Tool 的输出路径。
-   `<Version>` 标签标识打包后的 .Net Tool 的版本

此时在 `CowSay` 文件夹下执行 `pack` 命令进行打包：

```powershell
dotnet pack
```

此时在 `CowSay` 文件夹下创建一个名为 `nupkg` 的文件夹，其中包含的就是可安装的 tool 文件：

```powershell
├───nupkg
│       CowSay.1.0.1.nupkg
```

## 安装 Global Tool

当 [打包 Tool](/create_.net_tools/#打包-tool) 生成了一个可安装的 .Net Tool 后，就可以使用 `dotnet tool install` 命令来安装该 Tool：

```powershell
dotnet tool install --global --add-source <sourcePath> <toolName> --version <version>
```

{% note primary %}
理论上 `--version` 不是必须的，但是在某些 .net 版本下，如 `.net 8.0.203` 中，不加上这个参数会出现错误，详见：[Issue](https://github.com/dotnet/sdk/issues/40039)
{% endnote %}

如下在安装后，即可直接运行 `coway` 命令：

```powershell
❯ dotnet tool install --global --add-source .\nupkg CowSay --version 1.0.1
You can invoke the tool using the following command: cowsay
Tool 'cowsay' (version '1.0.1') was successfully installed.
❯ cowsay hello world

        hello world
    __________________
                         \
                          \
                             (oo)\_______
                             (__)        )\/\
                                 ||------||
                                 ||      ||
```

后续如果想要删除该 tool，则可以运行 `uninstall` 命令：

```powershell
dotnet tool uninstall -g <toolName>
```

### 安装路径控制

在 Windows 下默认 Tool 安装的路径是：

```powershell
C:\users\$env:username\.dotnet\tools
// C:\Users\$env:username\.dotnet\tools\cowsay.exe
```

在安装时，可以加上 `--tool-path` 参数来指定安装路径：

```powershell
dotnet tool install --tool-path <path> --add-source <sourcePath> <toolName> --version <version>
```

对于指定路径的 tool，当卸载时也需要加上 `--tool-path` 参数来指定卸载路径：

```powershell
dotnet tool uninstall --tool-path <path> <toolName>
```

## 更新 Tool

如果修改了 Tool 并重新进行了 [打包 Tool](/create_.net_tools/#打包_Tool) 操作，可以使用 `update` 进行 tool 的更新：

```powershell
dotnet tool update --global --add-source <sourcePath> <toolName>
```

如我们将 `CowSay` 的版本更新为 `1.0.2` 后，并再次允许 `dotnet pack`，此时在 `.nuget` 目录下会生成一个新的 `nupkg` 文件夹，其中包含了新的 `CowSay` 的版本：
```text
├── nupkg
│   ├── CowSay.1.0.1.nupkg
│   └── CowSay.1.0.2.nupkg
```

此时可允许 `dotnet tool update` 进行更新：
```powershell
dotnet tool update --global --add-source .\nupkg CowSay --version 1.0.2
```

# Reference

[Tutorial: Create a .NET tool - .NET CLI | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/tools/global-tools-how-to-create)

[(4) How to create your own .NET CLI tools to make your life easier - YouTube](https://www.youtube.com/watch?v=jndgcbdzpku&ab_channel=nickchapsas)

