---
tags:
    - 系统设计
    - 工程实践
created: 2023-09-12
updated: 2023-11-18
date: 2023-11-12 14:29
published: true
title: 《Code Complete》第一章：欢迎来到软件构建
description: 这一节主要介绍了软件构建的概念，以及为什么软件构建很重要，本书的其余部分将会围绕软件构建展开。
---

这本书是关于软件**构建**的，构建是建造的过程。在一些语境下，构建过程可能包括规划、设计、检查等部分，但大多情况下“构建”是指创建某些东西时真正动手的那部分。

# 什么是软件构建？

软件开发是一个复杂的过程，在过去 25 年中，研究人员已经确定了软件开发中的许多不同活动，包括：

-   问题定义
-   需求开发（创建出需求的过程）
-   构建规划
-   软件架构设计
-   详细设计
-   编码和调试
-   单元测试
-   集成测试
-   一体化
-   系统测试
-   问题修复

如果你之前经历的项目流程不太正式，你可能会*觉得*上述这些活动是繁文缛节。而如果你之前经历的项目流程很正规，你就会*知道*上述的这些活动确实是繁文缛节。上述这些活动，完全不遵守或完全遵守都是不合适的，你需要找到其中的平衡点。无疑，这很难。

上述流程中，只有一部分属于**构建**，管理、需求开发、软件架构、UI 设计，系统测试和维护这些都不属于构建。构建设计范围如下所示，其中被黄色覆盖的部分才是与构建相关的工作：
![构建](/ch_01_welcome_to_software_construction/image-20230916104532.png)

以下是构建时涉及的具体任务：

-   验证前序任务（如需求开发，架构设计等）是否已经完成，以便后续能够顺利执行
-   确定如何测试代码
-   设计和编写类与调用时序
-   创建和命名变量/常量
-   选择控制结构并组织代码语句
-   单元测试，集成测试和调试自己的代码
-   审阅其他成员的设计和代码，并让他们审阅你的设计的和代码
-   通过格式化和注释来完善代码
-   将创建出来的代码组件集成到系统中
-   优化代码，让其更快和使用更少的资源

# 为什么软件构建很重要

构建是软件开发的重要组成部分。根据项目的规模，构建通常占项目总时间的 30% 到 80%。任何占用如此多项目时间的事情必然会影响项目的成功。

构建是软件开发的核心活动。需求和架构在构建前完成，以便你可以有效地进行构建。系统测试（严格意义上的独立测试）是在构建后进行的，以验证构建是否正确完成。

构建的产品，即源代码，通常是对软件的唯一准确描述。在许多项目中，程序员唯一可用的文档就是代码本身。需求规范和设计文档可能会过时，但源代码始终是最新的。因此，源代码必须具有尽可能高的质量。

构建是唯一可以保证软件开发完成的活动。

-   理想的软件项目在施工开始之前会经过仔细的需求开发和架构设计。
-   理想的项目在施工后经过全面的、统计控制的系统测试。
-   不完美的现实项目常常会跳过需求和设计而直接进入施工阶段。但无论一个项目多么仓促或计划多么糟糕，你都不能放弃建设；

归根结底，程序员对如何进行构造的理解决定了它是否一名优秀的程序员，这就是本书其余部分的主题。

