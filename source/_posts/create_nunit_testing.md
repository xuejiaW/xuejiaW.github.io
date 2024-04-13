---
created: 2024-03-07
updated: 2024-04-07
tags:
  - DotNet
  - UnitTesting/NUnit
published: true
date: 2024-04-07 20:56
description: 为 .Net 工程创建 NUnit 单元测试的最简教程，包含创建被测试工程、创建 NUnit 测试工程、编写单元测试等内容。
title: .Net 工程创建 NUnit 单元测试指南
---

{% note primary %}
完整工程见 [UnitTestingUsingNUnit](https://github.com/xuejiaw/.net-samples/tree/main/unittestingusingnunit)
{% endnote %}

# 创建被测试工程

为了创建单元测试工程，首先需要有一个需要被测试的工程。创建一个名为 `UnitTestingUsingNUnit` 的文件夹，进入文件夹后运行 new sln 创建一个解决方案：

```powershell
❯ dotnet new sln
The template "Solution File" was created successfully.
```

然后创建一个 `PrimeService` 文件夹，进入其中并运行 new classlib 创建一个类库：

```powershell
❯ dotnet new classlib -n PrimeService
The template "Class Library" was created successfully.

Processing post-creation actions...
Restoring D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService\PrimeService.csproj:
  Determining projects to restore...
  Restored D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService\PrimeService.csproj (in 44 ms).
Restore succeeded.
```

默认创建的类库，会包含 _Class1.cs_ 文件，我们可以将其重命名为 `PrimeService.cs` 的文件，此时的工程结构如下：

```text
├── PrimeService
│   ├── PrimeService.cs
│   ├── PrimeService.csproj
└── UnitTestingUsingNUnit.sln
```

使用 sln add 命令将类库加入解决方案中：

```powershell
dotnet sln add PrimeService/PrimeService.csproj
```

在 `PrimeService.cs` 中增加一个 `IsPrime` 方法，用于判断一个数是否为质数，但此时我们不实现这个函数，并抛出一个 `NotImplementedException` 异常，保证后续的测试肯定失败：

```csharp
namespace PrimeService;

public class PrimeService
{
    public bool IsPrime(int candidate)
    {
        throw new NotImplementedException("Please create a test first.");
    }
}
```

至此，我们已经创建了一个需要被测试的工程。后续，我们将创建一个测试工程，用于测试这个工程中的 `IsPrime` 方法。

# 创建 NUnit Testing

为了给这个工程增加 NUnit 测试，我们可以在该目录下运行 `dotnet new nunit` 命令新建一个 NUnit 测试工程：

```powershell
dotnet new nunit -n PrimeService.Tests
```

运行该命令后，会在命令运行目录下生成测试工程的文件夹，如本例中为 `PrimeService.Tests` 文件夹，文件夹包含有对应的 `.csproj` 文件和一个 `UnitTest1.cs` 文件，我们将其重命名为 `PrimeServiceIsPrimeShould.cs`，此时的工程结构为：

```powershell
.
├── PrimeService
│   ├── PrimeService.cs
│   ├── PrimeService.csproj
├── PrimeService.Tests
│   ├── PrimeService.Tests.csproj
│   ├── PrimeServiceIsPrimeShould.cs
└── UnitTestingUsingNUnit.sln
```

此时再运行 `dotnet sln add` 命令，将新生成的测试工程的 `.csproj` 文件添加到主工程的解决方案中：

```powershell
❯ dotnet sln add .\PrimeService.Tests\PrimeService.Tests.csproj
Project `PrimeService.Tests\PrimeService.Tests.csproj` added to the solution.
```

因为 _测试工程_ 需要引用 _被测试工程_ 的代码，因此我们需要使用 add reference 命令为 _测试工程_ 添加 _被测试工程_ 的引用：

```powershell
dotnet add .\PrimeService.Tests\PrimeService.Tests.csproj reference .\PrimeService\PrimeService.csproj
```

测试可以使用 `dotnet test` 命令运行测试，效果如下：

```powershell
❯ dotnet test
  Determining projects to restore...
  Restored D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService\PrimeService.csproj (in 41 ms).
  Restored D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService.Tests\PrimeService.Tests.csproj (in 140 ms).
  PrimeService -> D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService\bin\Debug\net8.0\PrimeService.dll
  PrimeService.Tests -> D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService.Tests\bin\Debug\net8.0\PrimeService.Tests.dll
Test run for D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService.Tests\bin\Debug\net8.0\PrimeService.Tests.dll (.NETCoreApp,Version=v8.0)
Microsoft (R) Test Execution Command Line Tool Version 17.9.0 (x64)
Copyright (c) Microsoft Corporation.  All rights reserved.

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 39 ms - PrimeService.Tests.dll (net8.0)
```

# 编写单元测试

在 `PrimeServiceIsPrimeShould.cs` 文件中，我们可以编写测试代码，测试 `PrimeService` 中的 `IsPrime` 方法：

```csharp
namespace PrimeService.Tests;

[TestFixture]
public class PrimeServiceIsPrimeShould
{
    private PrimeService? m_PrimService = null;

    [SetUp]
    public void SetUp() { m_PrimService = new PrimeService(); }

    [Test]
    public void IsPrime_InputIs1_ReturnFalse()
    {
        var result = m_PrimService!.IsPrime(1);
        Assert.That(result, Is.False, "1 should not be prime");
    }
}
```

此时运行 `dotnet test` 命令，会发现测试失败，输出如下：

```powershell
❯ dotnet test
  Determining projects to restore...
  All projects are up-to-date for restore.
  PrimeService -> D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService\bin\Debug\net8.0\PrimeService.dll
  PrimeService.Tests -> D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService.Tests\bin\Debug\net8.0\PrimeService.Tests.dll
Test run for D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService.Tests\bin\Debug\net8.0\PrimeService.Tests.dll (.NETCoreApp,Version=v8.0)
Microsoft (R) Test Execution Command Line Tool Version 17.9.0 (x64)
Copyright (c) Microsoft Corporation.  All rights reserved.

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.
  Failed IsPrime_InputIs1_ReturnFalse [12 ms]
  Error Message:
   System.NotImplementedException : Please create a test first.
  Stack Trace:
     at PrimeService.PrimeService.IsPrime(Int32 candidate) in D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService\PrimeService.cs:line 5
   at PrimeService.Tests.PrimeServiceIsPrimeShould.IsPrime_InputIs1_ReturnFalse() in D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService.Tests\PrimeServiceIsPrimeShould.cs:line 14
   at System.RuntimeMethodHandle.InvokeMethod(Object target, Void** arguments, Signature sig, Boolean isConstructor)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)


Failed!  - Failed:     1, Passed:     0, Skipped:     0, Total:     1, Duration: 12 ms - PrimeService.Tests.dll (net8.0)
```

此时如果修改 `PrimeService` 中的 `IsPrime` 方法，使在 `indicate` 小于 2 时直接返回 `false`：

```csharp
public bool IsPrime(int candidate)
{
    if (candidate < 2)
    {
        return false;
    }

    throw new NotImplementedException("Please create a test first.");
}
```

此时再次运行 `dotnet test` 命令，会发现测试通过：

```powershell
❯ dotnet test
  Determining projects to restore...
  All projects are up-to-date for restore.
  PrimeService -> D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService\bin\Debug\net8.0\PrimeService.dll
  PrimeService.Tests -> D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService.Tests\bin\Debug\net8.0\PrimeService.Tests.dll
Test run for D:\Github\.Net-Samples\UnitTestingUsingNUnit\PrimeService.Tests\bin\Debug\net8.0\PrimeService.Tests.dll (.NETCoreApp,Version=v8.0)
Microsoft (R) Test Execution Command Line Tool Version 17.9.0 (x64)
Copyright (c) Microsoft Corporation.  All rights reserved.

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 3 ms - PrimeService.Tests.dll (net8.0)
```

## 针对 internal 对象的测试

在对主工程进行测试时，常会遇到的问题时，需要对主工程中 `internal` 的对象进行测试，而测试工程默认无法访问主工程的 `internal` 对象。

为了解决这个问题，可以在主工程中创建出一个 `AssemblyInfo.cs` 文件，并在其中添加如下内容，即通过 `InternalsVisibleTo` 让主工程的 `internal` 对象可以对特定的 Assembly 暴露：

```csharp
using System.Runtime.CompilerServices;

[assembly: InternalsVisibleTo("PrimeService.Tests")]
```

{% note primary %}
上述代码并不要求必须定义在 `AssemblyInfo.cs` 文件中，在任意的 `.cs` 脚本中都可以。
{% endnote %}

假设 `PrimeService` 类中有一个 `IsPrimeImplementation` 函数，其定义如下：

```csharp
internal bool IsPrimeImpl(int candidate)
{
    for (int i = 2; i < candidate; i++)
    {
        if (candidate % i == 0)
            return false;
    }

    return true;
}
```

在加入了 `AssemblyInfo` 后，就可以在测试工程中对 `IsPrimeImpl` 进行测试：

```csharp
[Test]
public void IsPrimeImpl_Is4_ReturnFalse()
{
    var result = m_PrimService!.IsPrimeImpl(4);
    Assert.That(result, Is.False, "4 should not be prime");
}
```

# Reference

[Unit testing C# with NUnit and .NET Core - .NET | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-nunit)

[InternalsVisibleToAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.internalsvisibletoattribute?view=net-8.0)

