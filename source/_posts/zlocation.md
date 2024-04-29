---
tags:
  - 工具
  - CLI
  - 效率提升
  - PowerShell
created: 2023-11-26
updated: 2024-02-09
date: 2023-11-27 21:50
title: Powershell 模块：ZLocation
published: true
description: ZLocation 是 PowerShell 中的一个 Module，其可以追踪访问各个地址的历时，并通过 `z` 命令快速访问你最常使用的目录，有效的降低了每次通过反复 `cd` 来进入路径的操作数量。
---

ZLocation 是 PowerShell 中的一个 Module，其可以追踪你访问各个地址的历时，并通过 `z` 命令快速访问你最常使用的目录。

# 安装方式

可使用如下的命令安装 ZLocation：

```powershell
Install-Module ZLocation -Scope CurrentUser
```

并将如下代码添加到 PowerShell 配置文件的**最后**（原因可见 [实现原理](/zlocation/#数据记录)）：

```powershell
Import-Module ZLocation
```

# 使用方式

ZLocation 有以下的使用方式：

1. 使用 `z` 命令，获取当前 ZLocation 所有记录的地址，如下所示：

    ```powershell
    ❯ z
    Weight Path
    ------ ----
       14.00 C:\Users\wxjwa
        6.00 C:\Users\wxjwa\Desktop
       21.00 D:\
       32.00 D:\Project1\unity
        3.00 D:\Project2
        7.00 D:\Project2\unity
        3.00 D:\Project2\unity\SubProject1
    ```

    输出的左侧 `Weight` 为地址的权重，权重越高，表示该地址越常用。

2. 通过 `z -l <location>` 命令，输出所有匹配 `<location>` 的所有路径中。

    ```powershell
    ❯ z -l unity
    Weight Path
    ------ ----
     54.00 D:\Github\Unity
     34.00 D:\Project1\unity
      7.00 D:\Project2\unity
    ```

{% note primary %}
`<location>` 模糊匹配的是路径最后的节点，如有地址 `D:\Project2\unity\SubProject1`，其并不会出现在 `z -l unity` 的输出中，因为 i 根节点 `SubProject1` 中并不包含有 `unity`。
{% endnote %}

3. 通过 `z <location>` 命令，跳转到匹配 `<location>` 的所有路径中最常用（根据权重决定）的那个。
   ![z location](/zlocation/gif-2023-11-26-21-28-41.gif)

    可以看到跳转的路径，即为 `z -l <location>` 中权重最高的路径。

4. 通过 `z <location> [TAB]` 在匹配的路径中进行选择。
   ![使用 Tab 切换](/zlocation/gif-2023-11-26-21-30-06.gif)

5. 通过 `z -` 命令返回使用 `z <location>` 跳转前的路径。

6. 通过 `z <subLocation 1> <subLocation 2>` 进行跳转路径的选择控制。

    因为 `z <location>` 只会跳转到匹配的路径中权重最高的那个，如记录了以下地址：

    ```powershell
    35.00 D:\Project1\unity
    7.00 D:\Project2\unity
    ```

    如果使用 `z unity`，则会跳转到 `D:\Project1\unity`

    但有时，我们明确的知道是想要跳转到 `D:\Project2\unity`，此时就可以使用 `z 2 unity` 进行跳转。

{% note warning %}
子路径必须按照顺序，如上例子中，如果使用 `z unity 2` 则是无法跳转的。
{% endnote %}

# 工作原理

## 数据记录

ZLocation 的实现原理，是修改 Powershell 的 [Prompt](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_prompts) 函数以获取当前访问的目录地址。

并将访问的目录地址记录在一个文件（数据库）中，在后续使用 `z` 命令时，会从该文件中获取曾经访问的路径和次数，时间等信息，判断出匹配你当前输出的、常访问的目录，并进行跳转。

{% note primary %}
因为修改的是 Prompt，所以即使是使用 `cd` 进行路径跳转，也会记录在文件中。
{% endnote %}

## 实现函数

可通过 Get-Command 获取到所有 Z-Location 实现的函数，如下所示：

```powershell
❯ Get-Command -Module ZLocation

CommandType     Name                Version    Source
-----------     ----                -------    ------
Function        Get-ZLocation       1.4.3      ZLocation
Function        Invoke-ZLocation    1.4.3      ZLocation
Function        Pop-ZLocation       1.4.3      ZLocation
Function        prompt              1.4.3      ZLocation
Function        Remove-ZLocation    1.4.3      ZLocation
Function        Set-ZLocation       1.4.3      ZLocation
Function        Update-ZLocation    1.4.3      ZLocation
```

当调用 `z` 命令时，会调用 `Invoke-ZLocation` 函数，该函数内会进一步根据当前的输入参数或情况调用其他函数，如：

-   无任何参数时，调用 `Get-ZLocation` 函数，获取匹配的目录
-   调用`z -l <location>` 时调用 `Get-ZLocation` 函数，获取所有匹配的目录
-   使用 `z -` 时调用 `Pop-ZLocation` 函数，返回上一个路径

如在 [数据记录](/zlocation/#数据记录) 中所述，ZLocation 会修改 `prompt` 函数，在访问某一个文件夹后，会调用 `Set-ZLocation` 函数，将访问的路径记录在文件中，多次访问时会调用 `Update-ZLocation` 函数，更新访问的次数和时间。当存储的文件过大时，会调用 `Remove-ZLocation` 函数，删除一些不常用的路径。

# Reference

[ZLocation](https://github.com/vors/ZLocation)
[终端效率提升：自动路径切换](https://zhuanlan.zhihu.com/p/50548459)

