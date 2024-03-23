---
tags:
  - 工具
created: 2024-01-12
updated: 2024-03-23
published: true
date: 2024-02-10 12:48
title: 《Terminal, Console, Shell, Command Line 之间的关系》
description: Terminal，Console，Shell 和 Command Line 这几个词汇经常同时被使用，也因此他们的含义很容易被混淆。本文将尝试解释这几个词汇的含义。
---

`Terminal`，`Console`，`Shell` 和 `Command Line` 这几个词汇经常同时被使用，也因此他们的含义很容易被混淆。本文将尝试解释这几个词汇的含义。

{% note 'fas fa-clipboard-list' %}
用户输入的文本命令是 `Command Line`，`Shell` 负责将其转译成操作系统能够理解的指令，并获取操作系统的执行结果。
`Terminal` 和 `Console` 负责提供用户可以输入 `Command Line` 的界面和展示命令的执行结果。
{% endnote %}

# Command Line

`Command Line` 是用户通过文本与操作系统交互的方式，与之相对即是基于 `GUI` 的交互方式。

{% note 'fas fa-list' %}
`cd`，`ls`，`Get-Command` 这些文本都是 `Command Line`。
{% endnote %}

用户输入的 `Command Line` 将通过 [Shell](/difference_between_terminal,_console,_shell,_and_command_line/#shell) 传递给操作系统，操作系统执行指令并返回结果。

# Shell

`Shell` 是 [Command Line](/difference_between_terminal,_console,_shell,_and_command_line/#command_line) 的转译软件，它负责将 [Command Line](/difference_between_terminal,_console,_shell,_and_command_line/#command_line) 转译成操作系统能够理解的指令，并获取操作系统的执行结果。`Shell` 并无 GUI 界面，它只是一个接受文本数据（[Command Line](/difference_between_terminal,_console,_shell,_and_command_line/#command_line)）并返回执行结果的软件。

- 每一个 `Shell` 都有自己的语法，也因此，每一个 `Shell` 所能转译的 [Command Line](/difference_between_terminal,_console,_shell,_and_command_line/#command_line) 是不同的。

{% note 'fas fa-list' %}
[Bash](<https://en.wikipedia.org/wiki/bash_(unix_shell)>)，[FISH](https://github.com/fish-shell/fish-shell) 和 [PowerShell](https://learn.microsoft.com/en-us/powershell/) 都是 Shell。
{% endnote %}

{% note primary %}
因为 [PowerShell](https://learn.microsoft.com/en-us/powershell/) 软件本身也提供了 GUI 界面，因此 [PowerShell](https://learn.microsoft.com/en-us/powershell/) 严格意义上是 `Shell` 和 `Console` 的结合体
{% endnote %}

`Shell` 通过 [Terminal 或 Console](/difference_between_terminal,_console,_shell,_and_command_line/#terminal_and_console) 展现其执行结果。

# Terminal and Console

`Terminal` 和 `Console` 两个词汇含义非常相同：用户在键盘上输入 [Command Line](/difference_between_terminal,_console,_shell,_and_command_line/#command_line)，`Terminal` 和 `Console` 都负责将执行结果展现给用户。在很多情况下，这两个词汇可以互换使用。

在早期，`Terminal` 和 `Console` 都表示的与计算机连接的物理设备，如键盘和显示器。

- `Terminal`：连接到主机的物理设备，连接的目标类型并不做要求，可以是本地的主机，也可以是远端的主机。一个 `Terminal` 可以连接至多个不同的主机。
- `Console`：是 `Terminal` 的一种形式，特指连接到本地主机的物理设备。一个 `Console` 在同一时间，只能连接到一个主机。

{% note info %}
`Terminal` 的抽象等级相对于 `Console` 更高。`Console` 是 `Terminal` 的一种特例。
{% endnote %}

在现代，`Terminal` 和 `Console` 两个词汇更多的是指软件，而非物理设备，他们都是指用来与操作系统进行交互的，拥有 GUI 界面的软件，[Shell](/difference_between_terminal,_console,_shell,_and_command_line/#shell) 需要运行在其中。 `Console` 仍然是 `Terminal` 的一种特例。

- `Terminal`：接受用户的指令，并将指令的结果展现在 GUI 界面上。一个 `Terminal` 可以同时运行多个不同的 [Shell](/difference_between_terminal,_console,_shell,_and_command_line/#shell)。
- `Console`：是 `Terminal` 的一种特例，接受的指令和显示的结果，通常都是纯文本的。一个 `Console` 同时只能运行一个 [Shell](/difference_between_terminal,_console,_shell,_and_command_line/#shell)。

{% note primary %}
许多 [Shell](/difference_between_terminal,_console,_shell,_and_command_line/#Shell) 程序，如 PowerShell，都配有内置的`Console`。尽管这些 `Console` 主要设计用于各自的 Shell，但通常它们也允许运行其他的 [Shell](/difference_between_terminal,_console,_shell,_and_command_line/#Shell)。例如，在 PowerShell 的 Console 中，用户可以启动 `cmd`，即 Windows Command Prompt。
{% endnote %}

{% note primary %}
在 IDE 中，`Console` 也会被用来描述程序输出信息的展示窗口，此时它就不再局限于为 [Shell](/difference_between_terminal,_console,_shell,_and_command_line/#Shell) 服务。
{% endnote %}

{% note 'fas fa-list' %}
[Iterm2](https://iterm2.com/) 和 Windows Terminal 都是 `Terminal`。
{% endnote %}

# Reference

[Difference Between Terminal, Console, Shell, and Command Line (tutorialspoint.com)](https://www.tutorialspoint.com/difference-between-terminal-console-shell-and-command-line)

[Terminal vs Console: Choosing the Right Interface for OS Tasks (linkedin.com)](https://www.linkedin.com/advice/0/how-do-you-choose-between-terminal-console-your)

