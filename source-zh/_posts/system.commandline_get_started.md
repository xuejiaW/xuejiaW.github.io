---
tags:
  - DotNet
created: 2024-04-07
updated: 2025-09-01
publishStatus: published
title: 使用 System.CommandLine 为 .Net Tools 添加命令行参数支持
description: 本篇教程通过创建一个名为 scl (Sample Command Line) 的 .Net Tools 来说明如何使用 System.CommandLine 库为 .Net Tool 增加命令行参数解析支持。
date: 2024-04-13 10:43
---

本篇教程通过创建一个名为 `scl` _(Sample Command Line)_ 的 .Net Tools 来说明如何使用 System.CommandLine 库为 .Net Tool 增加命令行参数解析支持。

{% note primary %}
完整的示例代码，可见 [SampleCommandLine](https://github.com/xuejiaW/.Net-Samples/tree/main/SampleCommandLine)
{% endnote %}

# 创建 .Net Tool

{% note primary %}
创建 .Net Tool 的完整说明可见 [.Net Tools 创建指南](/create_.net_tools)
{% endnote %}

通过以下命令创建一个 .Net Tool，并将其命令行指令定义为 `scl`：

```powershell
dotnet new console -n SampleCommandLine -f net8.0 # Create SampleCommandLine tool
```

修改 `SampleCommandLine.csproj` 文件，将命令行修改为 `scl`，并设定版本为 `0.0.1`，完整文件如下所示：

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <PackAsTool>true</PackAsTool>
    <ToolCommandName>scl</ToolCommandName>
    <PackageOutputPath>./nupkg</PackageOutputPath>
    <Version> 0.0.1 </Version>
  </PropertyGroup>

</Project>
```

使用 `dotnet pack` 打包后，再使用如下命令将 `scl` 安装为全局的命令：

```powershell
dotnet tool install --global --add-source .\nupkg SampleCommandLine --version 0.0.1
```

运行效果如下：

```powershell
❯ scl
Hello, World!
```

# 安装并使用 System.CommandLine Package

使用 add package 命令为项目增加 `System.CommandLine` 包：

```powershell
dotnet add package System.CommandLine --prerelease
```

修改 `Program.cs` 为如下内容：

```csharp
using System.CommandLine;

namespace SampleCommandLine;

public static class Program
{
    public static async Task<int> Main(string[] args)
    {
        var fileOption = new Option<FileInfo?>(name: "--file",
                                               description: "The file to read and display on the console");
        var rootCommand = new RootCommand("Sample app for System.CommandLine");
        rootCommand.AddOption(fileOption);
        rootCommand.SetHandler(file =>
        {
            if (file != null) ReadFile(file);
        }, fileOption);

        return await rootCommand.InvokeAsync(args);
    }

    private static void ReadFile(FileInfo file)
    {
        File.ReadLines(file.FullName).ToList().ForEach(Console.WriteLine);
    }
}
```

上述代码做了以下的行为：

-   创建了一个名为 `--file` 的 Option，该 Option 接受一个 [FileInfo](https://docs.microsoft.com/en-us/dotnet/api/system.io.fileinfo) 类型的参数，用于指定一个文件。
-   创建了一个 Root Command，并将 `--file` Option 添加到 Root Command 中。
-   为 Root Command 设置了一个 Handler，当 Root Command 被触发时调用 `ReadFile` 方法。

即此时我们定义 `scl` 命令，其接受一个 `--file` 参数，用于指定一个文件，当 `scl` 命令被触发时，将读取该文件的内容并输出到控制台。

# 测试 .Net Tool

当上述代码完成后，可以重新打包并安装 `scl` 进行测试：

```powershell
dotnet pack
dotnet tool update --global --add-source .\nupkg SampleCommandLine
scl --file .\SampleCommandLine.csproj
```

此时可以看到 `scl` 命令如预期的输出了目标文件的内容：

```text
❯ scl --file .\SampleCommandLine.csproj
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <PackAsTool>true</PackAsTool>
    <ToolCommandName>scl</ToolCommandName>
    <PackageOutputPath>./nupkg</PackageOutputPath>
    <Version> 0.0.1 </Version>
    <AssemblyName>scl</AssemblyName>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="System.CommandLine" Version="2.0.0-beta4.22272.1" />
  </ItemGroup>

</Project>
```

另外此时运行 `System.CommandLine` 也会自动为生成的 .Net Tools 增加 `--version` 和 `--help` 支持：

```powershell
❯ scl --help
Description:
  Sample app for System.CommandLine

Usage:
  SampleCommandLine [options]

Options:
  --file <file>   The file to read and display on the console
  --version       Show version information
  -?, -h, --help  Show help and usage information

❯ scl --version
 0.0.1 +8780883dafd03b279361438c8d2ae824e319fd48
```

{% note primary %}
更多的测试方法，可见 测试 .Net Tools
教程的后续部分，为了方便测试，会直接使用 `dotnet run` 进行测试。
{% endnote %}

# 增加 Sub Commands 和更多 Options

我们将 `Program.cs` 的代码修改为内容：

```csharp
public static class Program
{
    public static async Task<int> Main(string[] args)
    {
        var fileOption = new Option<FileInfo?>(name: "--file",
                                               description: "The file to read and display on the console");
        var delayOption = new Option<int>(name: "--delay",
                                          description:
                                          "Delay between lines, specified as milliseconds per character in a line.",
                                          getDefaultValue: () => 42);

        var fgColorOption = new Option<ConsoleColor>(name: "--fgcolor",
                                                     description: "Foreground color of text displayed on the console.",
                                                     getDefaultValue: () => ConsoleColor.White);

        var lightModeOption = new Option<bool>(name: "--light-mode",
                                               description:
                                               "Background color of text displayed on the console: default is black, light mode is white.");

        var rootCommand = new RootCommand("Sample app for System.CommandLine");
        var readCommand = new Command("read", "Reads a file and displays it on the console")
        {
            fileOption,
            delayOption,
            fgColorOption,
            lightModeOption
        };
        rootCommand.AddCommand(readCommand);

        readCommand.SetHandler(async (file, delay, fgColor, lightMode) =>
        {
            await ReadFile(file!, delay, fgColor, lightMode);
        }, fileOption, delayOption, fgColorOption, lightModeOption);

        return await rootCommand.InvokeAsync(args);
    }

    private static async Task ReadFile(FileInfo file, int delay, ConsoleColor fgColor, bool lightMode)
    {
        Console.BackgroundColor = lightMode ? ConsoleColor.White : ConsoleColor.Black;
        Console.ForegroundColor = fgColor;
        List<string> lines = File.ReadLines(file.FullName).ToList();
        foreach (string line in lines)
        {
            Console.WriteLine(line);
            await Task.Delay(delay * line.Length);
        }
    }
}
```

上述的代码，主要进行了以下的修改：

-   新定义了 `delayOption`、`fgColorOption` 和 `lightModeOption` 三个 Options，分别用于指定延迟、前景色和背景色。
-   将 `delayOption`、`fgColorOption` 和 `lightModeOption` 以及之前定义的 `fileOption` 一起用来定义传递给新创建的 `readCommand`。
-   将 `readCommand` 通过 `AddCommand` 将其作为 Root Command 的 Sub Command
-   修改函数 `ReadFile`，使其接受 `file`、`delay`、`fgColor` 和 `lightMode` 四个参数，并根据这四个参数的值来设置读取的文件、控制台的前景色、背景色和延迟。
    -   将 `ReadFile` 方法改为异步方法，以便在读取文件时可以进行延迟。
-   将 `ReadFile` 通过 `SetHandler` 方法与 `readCommand` 绑定，使得当 `readCommand` 被触发时调用 `ReadFile` 方法。

此时的实现效果如下：
![Read Command](/system.commandline_get_started/gif-4-9-2024-10-31-27-pm.gif)

此时的工程状态可见 [Patch](https://github.com/xuejiaW/.Net-Samples/commit/2ef65d6e7dfba041cd9e9dc7e4b811d931f3ca4b)。

# 增加更多的 Sub Commands 及自定义验证

为了后续的测试方便，我们可以将文件 [sampleQuotes.txt](https://github.com/dotnet/samples/raw/main/csharp/getting-started/console-teleprompter/sampleQuotes.txt) 放置在工程中。

在这一节中，我们增加以下的功能：

-   为 `fileOption` 增加一个验证，使得当传入的文件不存在时，输出自定义的错误信息。当该 Option 未调用时，以默认值 `sampleQuotes.txt` 作为文件。
    -   设为 Global Option，使得其可以在所有的 Sub Commands 中使用。
-   增加一个新的 Sub Command `quote`，并为该 Sub Command 设定两个 Sub Commands `add` 和 `remove`，分别用于添加和删除名言：
    -   `delete` 命令，命令定义一个 `searchTermsOption` ，该 Option 接受多个参数，当一行的内容包含任意参数时，删除该行。
    -   `add` 命令，为该命令定义两个 Arguments，分别作为名言的作者和内容。
        -   为 `add` 命令设置一个 Alias `insert` -> 学习如何设置 Alias
    -   同时将原先的 `read` Command 也作为 `quote` 的 Sub Command。

最终的 Command 关系如下：

```text
scl
└── quote
    ├── read
    ├── add
    ├── remove
```

基于上述的功能，我们在这一节将学会：

-   如何定义 Global Option
-   如何自定义验证
-   如何设定接纳多个 Arguments 的 Option
-   如何定义 Arguments
-   如何设置 Alias

## 验证 Option

可通过如下的代码，为 `fileOption` 增加验证，：

```csharp

// ...
var fileOption = new Option<FileInfo?>(description: "The file to read and display on the console",
                                       name: "--file",
                                       isDefault: true,
                                       parseArgument: GetFileInfo);

// ....
FileInfo? GetFileInfo(ArgumentResult result)
{
    if (result.Tokens.Count == 0)
    {
        return new FileInfo("sampleQuotes.txt");
    }

    string filePath = result.Tokens.Single().Value;

    if (File.Exists(filePath)) return new FileInfo(filePath);
    result.ErrorMessage = "File does not exist.";
    return null;
}
```

其中设定 `isDefault` 为 `true`，使得即使没有调用 `--file` 时，设定的 `parseArgument` 也会被调用。将函数 `GetFileInfo` 作为 `parseArgument`，`fileOption` 的参数会被传递给该函数进行解析

-   在函数中，我们检查了当文件路径不存在时返回错误信息 `File does not exist.`
-   当 `Tokens` 的数量为 0 时，即没有设定 `--file` 时，返回默认的文件路径 `sampleQuotes.txt`
-   否则正常返回文件路径

## 设置 Global Option

将 `fileOption` 作为 Global Option 赋值给 Root Command，此时原先的 `readCommand` 就可以将 `fileOption` 的添加删除：

```csharp
rootCommand.AddGlobalOption(fileOption);
var readCommand = new Command("read", "Reads a file and displays it on the console")
{
    delayOption,
    fgColorOption,
    lightModeOption
};
```

定义 `quote` Command，并将 `readCommand` 作为其 Sub Command：

```csharp
var quotesCommand = new Command("quotes", "Work with a file that contains quotes.");
quotesCommand.AddCommand(readCommand);
rootCommand.AddCommand(quotesCommand);
```

## 设定支持多个 Arguments 的 Option

增加一个 `searchTermsOption` 用于 `delete` 命令，该命令使用 `IsRequired` 表示该选项是必须的，可以使用 `AllowMultipleArgumentsPerToken` 表示该选项可以接受多个参数，为 `delete` 命令设定处理函数 `DeleteFromFile`，当一行的内容包含所有的参数时，删除该行：

```csharp
var searchTermsOption = new Option<string[]>(name: "--search-terms",
                                             description: "Strings to search for when deleting entries.")
    {IsRequired = true, AllowMultipleArgumentsPerToken = true};

var deleteCommand = new Command("delete", "Deletes lines from a file.");
deleteCommand.AddOption(searchTermsOption);
deleteCommand.SetHandler((file, searchTerms) => DeleteFromFile(file!, searchTerms), fileOption, searchTermsOption);

void DeleteFromFile(FileInfo file, string[] searchTerms)
{
    Console.WriteLine("Deleting from file");
    File.WriteAllLines(file.FullName, File.ReadLines(file.FullName)
                                          .Where(line => searchTerms.All(s => !line.Contains(s))).ToList());
}

// ...

quotesCommand.AddCommand(deleteCommand);
```

调用示例如下，如果行中同时包含有 `David` 或 `You can do`，则删除该行：

```powershell
scl quotes delete --search-terms David "You can do"
```

此时通过 Git 查看文件内容，会发现该行已经被删除。

```powershell
-1. You can do anything, but not everything.

--David Allen
```

## 设定 Arguments

定义两个 Arguments 作为 `add` 命令的参数，分别用于指定名言的内容和作者：

```csharp
var addCommand = new Command("add", "Add an entry to the file.");
var quoteArgument = new Argument<string>(name: "quote", description: "Text of quote.");
var bylineArgument = new Argument<string>(name: "byline", description: "Byline of quote.");

addCommand.AddArgument(quoteArgument);
addCommand.AddArgument(bylineArgument);
addCommand.SetHandler(AddToFile, fileOption, quoteArgument, bylineArgument);

static void AddToFile(FileInfo file, string quote, string byline)
{
    Console.WriteLine("Adding to file");
    using StreamWriter writer = file.AppendText();
    writer.WriteLine($"{Environment.NewLine}{Environment.NewLine}{quote}");
    writer.WriteLine($"{Environment.NewLine}-{byline}");
    writer.Flush();
}

// ...

quotesCommand.AddCommand(addCommand);
```

此时可以通过如下命令将一条名言添加到文件中：

```powershell
scl quotes add "Hello world!" "Nancy Davolio"
```

此时使用 Git 查看文件内容，会发现 `Hello world!` 已经被添加到文件中。

```powershell
+Hello world!
+
+-Nancy Davolio
```

## 设置 Alias

为 `add` 命令设置一个 Alias `insert`：

```csharp
addCommand.AddAlias("insert");
```

此时可以通过如下命令调用 `add` 命令：

```powershell
scl quotes insert "Hello world!" "Nancy Davolio"
```

# Reference

[Tutorial: Get started with System.CommandLine - .NET | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/standard/commandline/get-started-tutorial)：本篇教程绝大部分内容出自于此

