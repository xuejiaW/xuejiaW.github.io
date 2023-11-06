---
tags:
- Windows 
- CLI
alias:
- winget
created: 2023-10-30
updated: 2023-11-06
published: true
description: Windows Package Manager （winget） 是微软推出的基于命令行的包管理器，类似于 Chocolatey。在 winget 杠推出的时候，其功能非常的不健全，甚至于都没有 uninstall 支持，但在最新的 Win 11 中已经默认带上了 winget，且基本可以满足日常应用的安装。
title: Windows Package Manager（winget）使用指南
date: 2023-11-04 19:26 
---

# 介绍

Windows Package Manager （winget） 是微软推出的基于命令行的包管理器，类似于 Chocolatey。

{% note info %}
Package Manager 所管理的 Package，实际指应用（application / program）

{% endnote %}

理想情况下，开发人员使用 Package Manager 来指定开发所需的环境，Package 按照来说明安装和配置工具。Package Manager 可以减少准备环境所花费的时间，并且有助于确保在计算机上安装相同版本的包。

# 安装

可以通过在 Win Store 上安装 `App Installer` 来安装 winget。也可以通过命令行直接安装：

```pwsh
$progressPreference = 'Continue'
Write-Information "Downloading WinGet and its dependencies..."
Invoke-WebRequest -Uri https://aka.ms/getwinget -OutFile Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle
Invoke-WebRequest -Uri https://aka.ms/Microsoft.VCLibs.x64.14.00.Desktop.appx -OutFile Microsoft.VCLibs.x64.14.00.Desktop.appx
Invoke-WebRequest -Uri https://github.com/microsoft/microsoft-ui-xaml/releases/download/v2.7.3/Microsoft.UI.Xaml.2.7.x64.appx -OutFile Microsoft.UI.Xaml.2.7.x64.appx
Add-AppxPackage Microsoft.VCLibs.x64.14.00.Desktop.appx
Add-AppxPackage Microsoft.UI.Xaml.2.7.x64.appx
Add-AppxPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle
```

{% note info %}
在 Windows Sandbox 中不存在 Windows Store，因此只能使用命令行进行安装

{% endnote %}

# 命令

## Search

使用 `search` 命令进行搜索：

```pwsh
winget search <packageName>
winget search powershell
```

示例和结果如下：
![winget search powershell](/windows_package_manager/image-20231102213901.png)

{% note info %}
开源项目 [winget-run](https://github.com/winget-run/wingetdotrun) （非微软维护），提供了在网页中搜索 winget 支持的 Package 的功能：

{% endnote %}

## Install

可以使用 `install` 安装应用，推荐使用 Search 结果中的 ID 来进行安装以避免冲突：

```pwsh
winget install <Package ID>
// winget install Microsoft.PowerShell
```

可以通过 `;` 风格多个安装命令，如：

```pwsh
winget install Microsoft.AzureStorageExplorer; winget install Microsoft.VisualStudioCode;  winget install Microsoft.AzureCLI
```

可以使用 `-v` 约定安装的版本，未指定的情况下将安装最新版本。

可以使用 `-h` 或 `--slient` 保证以静默方式安装。

> [!Caution]
>
> 如果使用了静默安装，但安装要求管理员权限且当前命令行又不具有，则可能出现错误。
> 因此建议在使用静默安装时，使用管理员权限打开命令行

## Uninstall

使用 `uninstall` 卸载应用：

```pwsh
winget uninstall <Package ID>
// winget uninstall Microsoft.PowerShell
```

可以使用 `-h` 或 `--slient` 保证以静默方式安装。

## Upgrade

可以使用 `upgrade` 命令列出系统内所以可以通过 `winget` 进行升级的应用：
![winget upgrade](/windows_package_manager/image-20231102220234.png)

同样使用 `upgrade` 命令进行升级：

```pwsh
winget upgrade <Package ID>
// winget upgrade microsoft.powertoys

winget upgrade <Package ID> -v <version> // 升级到特定的版本
// winget upgrade microsoft.powertoys -v 0.41.3

winget upgrade --all // 升级所有应用
```

## Export

可以使用 `export` 命令将本机安装的 Package 导出成 `json` 文件，加上 `--include-versions` 表示导出时需要包括版本。：

```pwsh
winget export -o <OutputPath> --include-versions
```

输出的 Json 如下：

```json
{
    "$schema": "https://aka.ms/winget-packages.schema.2.0.json",
    "CreationDate": "2023-11-05T11:37:19.847-00:00",
    "Sources": [
        {
            "Packages": [
                {
                    "PackageIdentifier": "Notion.Notion",
                    "Version": "2.2.4"
                },
                {
                    "PackageIdentifier": "Anki.Anki",
                    "Version": "2.1.66"
                }
            // ...
            ],
            "SourceDetails": {
                "Argument": "https://cdn.winget.microsoft.com/cache",
                "Identifier": "Microsoft.Winget.Source_8wekyb3d8bbwe",
                "Name": "winget",
                "Type": "Microsoft.PreIndexed.Package"
            }
        }
    ],
    "WinGetVersion": "1.6.2771"
}
```

## Import

可以使用 `import` 命令将通过 [Export](/windows_package_manager/#Export) 导出的 Package 进行安装。

```pwsh
winget import -i <JsonPath> --ignore-versions --ignore-unavailable
```

在 [Export](/windows_package_manager/#Export) 导出的文件中，很可能会出现版本已经不匹配或者其他无法安装的情况，因此建议加上 `--ignore-unavailable` 跳过无法安装的部分，避免阻塞整个流程。

# winget Repository

winget 默认应用的安装来源是 [Windows Package Manager Community Repository](https://github.com/microsoft/winget-pkgs)。这是一个开源的项目，在项目的 `manifests` 文件夹下，按名称分类了每一个社区中提供的 Package。

以 PowerShell 为例子，在仓库中，`7.3.0` 版本对应的 Manifest 文件为 <https://github.com/microsoft/winget-pkgs/blob/master/manifests/m/Microsoft/PowerShell/7.3.2.0/Microsoft.PowerShell.installer.yaml>。

文件中最重要的就是 `Installer`，如其中这一段表示了 `x64` 结构的安装路径：

```yaml
Installers:
- Architecture: x64
  InstallerType: wix
  InstallerUrl: https://github.com/PowerShell/PowerShell/releases/download/v7.3.2/PowerShell-7.3.2-win-x64.msi
  InstallerSha256: A4F7D081C5F74BC8D6C75F1DFEE382B7FD9335361181748FEE590ECDBC96CB26
```

## 在社区中发布 Package

Microsoft Learn：[Contribute to the Windows Package Manager repository - Training | Microsoft Learn](https://learn.microsoft.com/en-us/training/modules/explore-windows-package-manager-tool/6-contribute-to-repository)

Documentation： [Submit your manifest to the repository | Microsoft Learn](https://learn.microsoft.com/en-us/windows/package-manager/package/repository)

# Reference

[Explore the Windows Package Manager tool - Training | Microsoft Learn](https://learn.microsoft.com/en-us/training/modules/explore-windows-package-manager-tool/)

[Windows Package Manager | Microsoft Learn](https://learn.microsoft.com/en-us/windows/package-manager/)
