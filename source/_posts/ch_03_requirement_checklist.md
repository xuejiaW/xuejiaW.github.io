---
tags:
  - 系统设计
  - 工程实践
created: 2023-09-17
updated: 2023-12-13
date: 2023-11-12 15:31
title: 《Code Complete》需求检查清单
published: true
---

需求清单包含一系列你可以用来询问自己的，有关项目需求的问题。

使用该列表作为施工时的健全性检查，以确定构建前的需求准备工作的坚固程度。

并非所有清单问题都适用于你的项目。
- 如果你正在从事非正式项目，你会发现一些你甚至不需要考虑的问题，也会发现其他一些你需要考虑但不需要正式回答的问题。
- 如果你正在从事一个大型的正式项目，你可能需要考虑每一个问题。

{% note info %}
这里的需求，并不仅仅是指用户的需求，也可能指一个软件库的需求
{% endnote %}

# 功能需求

-   [ ] 是否明确了系统的所有输入标准，包括其来源、精度、值范围和频率？
-   [ ] 是否明确了系统的所有输出标准，包括其目的地、精度、值范围、频率和格式？
-   [ ] 是否为网页、报告等指定了所有输出格式？
-   [ ] 所有对外的硬件/软件结构是否都有指定？
-   [ ] 所有与外部接口的通信标准是否有指定？包括握手、错误检查和通信协议
-   [ ] 是否说明了用户所有想要执行的任务？
-   [ ] 是否说明了每个任务使用的数据以及每个任务产生的数据？

# 非功能（质量）需求

-   [ ] 从用户的角度来看，是否为所有必要的操作指定了预期响应时间？
-   [ ] 其他的时间因素的考量是否有说明，例如处理时间、数据传输速率和系统吞吐量
-   [ ] 是否规定了安全级别？
-   [ ] 是否制定了可靠性标准，包括软件故障的后果、需要保护免受故障影响的重要信息是哪些，错误检测和恢复的策略是什么？
-   [ ] 最小支持的硬件内存和磁盘空间是否有说明？
-   [ ] 是否规定了系统的可维护性？包括适应特定功能变化、操作环境变化以及与其他软件接口变化的能力？
-   [ ] 是否描述了成功 / 失败的定义

# 需求质量

-   [ ] 需求是用用户（需求完成者）的语言描述的吗？用户也这么觉得吗？
-   [ ] 每个需求是否避免了与其他需求的冲突？
-   [ ] 是否指定了竞争属性之间可接受的权衡（例如，鲁棒性和正确性之间的权衡）
-   [ ] 需求是否避免指定设计？（必须通过某个方式来解决）
-   [ ] 需求的详细程度是否相当一致？是否存在需要更详细规定的任何需求？是否存在描述过于细致的任何需求？
-   [ ] 需求是否足够清晰，以至于可以移交给独立小组进行构建并且可以被正确的理解？开发团队也是这么认为吗？
-   [ ] 每个需求是否能与问题和解决方案相关联，每个需求是否能追溯到问题环境？
-   [ ] 每个需求都可以被测试吗？是否可以通过独立测试来确定是否满足每项要求？
-   [ ] 需求所有可能的变更是否都指明了？是否说明了每一个变更的可能性？

# 需求完整性

-   [ ] 如果在开发前，无法获取全部信息，缺失的区域是否有说明？
-   [ ] 需求范围是否足够完整，即如果每一项需求都被满足，是否可以推论产品可以被接受？
-   [ ] 你是否对所有的需求满意？你是否消除了所有仅是为了安抚客人或老板而不可能实现的需求？

