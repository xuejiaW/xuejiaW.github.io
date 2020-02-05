---
title: 《算法导论》 第五章笔记
mathjax: truehexo
date: 2020-02-05 13:03:30
categories:
  - 读书笔记
  - 数据结构与算法
tags:
  - 读书笔记
  - 数据结构与算法
---

{% cq %}
《算法导论》 第五章笔记。

5.1节介绍了整章中作为例子的雇佣问题，并简单介绍了两个分析随机问题的方法，概率分析和随机化算法。

5.2节介绍了分析随机问题中的重要工具，指标随机变量，并使用概率分析方法分析了雇佣问题的平均花费。

5.3节使用随机化算法分析雇佣问题的期望花费，并且介绍了两种实现随机值产生器的方法。

5.4节尚未整理。

{% endcq %}

<!--more-->

# Chapter 5 Probabilistic Analysis and Randomized Algorithms

## The hiring problem

雇佣问题（Hiring Problem）是假设一个雇佣公司与一家HR服务公司签订协议帮助它雇佣一位秘书。HR服务公司会每天向雇佣公司提供一个候选人，雇佣公司将面试该候选人，如果候选人比现在的秘书优秀，则解雇现在的秘书，雇佣候选人。这个操作是每天都在进行的，即如果每天来的候选人都比前一天的更优秀，则会每天解雇昨天雇佣的人，然后再雇佣新的候选人。整个过程的伪代码实现如下：

```pseudocode
HIRE-ASSISTANT(n)
best = 0;
for i = 1 to n
    interview candidate i
    if candidate i better than candidate best
        best = i
        hire candidate i
```

雇佣公司需要为每一个候选人向HR服务公司付一笔钱，记为$C_i$，在正式雇佣员工时需要再额外付给HR服务公司一笔钱，这笔钱款项较大，记为$C_h$。在这个算法中，关心的复杂度**不再是时间复杂度**而是最终需要付给HR服务公司的钱的多少，如果候选人一共有$n$人，一共雇佣过其中$m$人，则算法的复杂度为$O(C_in+C_hm)$，其中$C_in$是固定的，主要需要关心的就是$C_hm$。

可以明显看出，$m$越大，即雇佣过的人越多，复杂度越高。而$m$的大小是与候选人的情况相关的。

### Worst-case analysis
最坏情况下，即候选人是从最差到最好的顺序给的，那么$m=n$。在最好情况下，即候选人是从最好到最坏的顺序下给的，那么$m=1$。

但是最好和最差情况是很少出现的，所以需要真正关心的是通常情况下的花费，或者说各个情况下平均需要的花费。

这里先简单的阐述下概率分析方法和随机化算法方法，在6.2和6.3节会进行更详细的分析。

### Probabilistic analysis

概率分析（Probabilistic analysis）是通过概率来分析问题，通常使用概率分析来分析算法的运行时间，但这里用概率分析来分析雇佣的花费。

为了实施概率分析，需要知道所有输入情况的概率分布，或者猜测出一个所有输入情况的概率分布，然后根据这些输入情况的分布来计算出所有情况下的平均花费，将其称为`平均情况运行时间（Average-case running time）`。

对于雇佣问题而言，所有输入可能的概率是相同的，即这是个`均匀概率分布（Unifrom random permutation）`。对于一共有$n$个候选人，第一个候选人一共$n$种可能，第二个候选人有$n-1$种...依次类推，最后一个候选人就只有1种可能，综合起来看，$n$个候选人的排列组合有$n!$种可能，因此每个排列的可能性为$1/n!$

### Randomized algorithms

为了使用概率分析的方法，需要知道输入的分布可能或者对分布可能进行一个猜测，在`随机化算法（Randomized algorithms）`中则不需要。可以使用随机函数*主动*的让算法中的一部分成为随机。

在雇佣问题中，无论输入是什么情况，每天都是随机的从输入中抽取一个候选人，这样无论输入是什么情况，算法的结果都由算法中随机函数部分决定。

称一个算法被`随机化（Randomized）`了，如果算法的结果不仅由输入决定，还由一个被`随机数生成器（Random-Nunmber generator）`产生的数值决定。

对于随机化算法的复杂度分析，是根据随机数生成器生成的数值的概率分布来计算出运行时间，将其称为`期望运行时间（Expected running time）`。

## Indicator random variables

指标随机变量（Indicator random variables）提供一个在概率（probabilities）和期望（expectations）之间转换的方法。事件$A$的指标随机变量$I{A}$定义为：

$$
I\{A\}=\begin{cases}
    1 & \text{if A occurs,}\\\\
    0 & \text{if A does not occur.}
\end{cases}
$$

举一个简单的例子说明指标随机变量与期望值的关系。假设翻转一枚硬币，将结果是正面称为事件$H$，是反面称为事件$T$，即样本空间为$S={H,T}$，其中两个事件的概率都为0.5，即$Pr\{H\}=Pr\{T\}=1/2$。

将事件$H$的指标随机变量定义为$X_H$，即

$$
X_H=I\{H\}= \begin{cases}
    1 & \text{if H occurs,}\\\\
    0 & \text{if T occurs.}
\end{cases}
$$

事件$H$的期望值为$E[X_H]$：

$$
E[X_H]=E[I\{H\}]\\\\
= 1 \cdot Pr\{H\} + 0\cdot Pr\{T\} \\\\
= 1\cdot (1/2)+0\cdot(1/2)\\\\
=1/2
$$

定理5.1： 给定一个样本空间$S$和一个事件$A$在样本空间中，定义$X_A=I\{A\}$，则$E[X_A]=Pr\{A\}$

证明如下：

$$
E[X_A]=E[I\{A\}]\\\\
= 1 \cdot Pr\{A\} + 0\cdot Pr\{\bar{A}\} \\\\
= Pr\{A\}
$$

### Analysis of hiring problem using indicator random variables

为了使用概率分析，假设候选人都是以一个随机的顺序出现（在5.3节使用随机化算法的话将不再需要这个假设）。将X作为随机变量，其值表示为整个面试过程中总计录用的次数。

根据期望随机变量的定义，可X的期望值可表示为：

$$
E[X]=\sum_{x=1}^{n} x \cdot Pr\{\ X=x\}
$$

该式子需要计算，$x=1,x=2\dotsc x=n$情况下的概率。这个概率的计算较为复杂，可以使用指标随机变量来简化上式。

将第$i$位候选人被录用的随机变量定义为$X_i$，则

$$
X_i = I\{\text{candidate i is hired} \} =\\\\
=\begin{cases}
    1 & \text{if candidate i is hired} \\\\
    0 & \text{if candidate i is not hired}
\end{cases}
$$

可知所有候选人录取的总次数是各个候选人被录取随机变量的总和，即$X=X_1+X_2+\dotsc + X_n$。

由根据定理5.1可知，$E[X_i]=Pr\{\text{candidate i is hired} \}$

第$i$个候选人前已经出现了$i-1$个候选人，加上第$i$个自己，一共有$i$个候选人且每个候选人被录取的概率相同，因此第$i$个候选人被录取的概率为$1/i$。

综上，可得

$$
E[X] = E[\sum_{i=1}^{n}X_i] \\\\
= \sum_{i=1}^{n} E[X_i] \\\\
= \sum_{i=1}^{n} 1/i \\\\
= \ln n + O(1)
$$

因此，使用概率分析可得平均情况下录取候选人的成本为$O(C_h \ln n)$

## Randomized algorithms

随机化算法与概率分析两个方法的不同点在于，概率分析是假设一个输入的分布，而随机化算法是**引入**输入的分布。

概率分析下，对于一个算法，如果输入值是不变的，则结果也是不变的，不同的输入产生不同的值。

但是在随机化算法下，输入值不变也可能产生不同的结果，因为算法内部有随机生成器。也因此，没有特定的输入会产生最差情况。

随机化算法的伪代码如下：

```pseudocode
RANDOMIZED-HIRE-ASSISTANT(n)

randomly permute the list of candidates
best = 0
for i = 1 to n
    interview candidate i
    if candidate i is better than candidate best
        best = i
        hire candidate i

```

与之前算法的唯一不同就是引入了`randomly permute the list of candidates`。在执行了该语句，产生了随机输入后，剩余部分的分析如上节的概率分析一样。

* 上节的输入分布是猜测出来的，而这里的输入分布则是通过该语句生成出来的。

因此通过随机化算法也同样可以得到结论，录取候选人的成本为$O(C_h \ln n)$。但使用概率分析的时候，将结果称为`平均情况下的结果`，在使用随机化算法的时候，将结果称为`期望结果`。两者实际上非常相似，更多的是命名方面的区分。

### Randomly permuting arrays

许多随机化算法都是通过随机排列输入数组来引入随机化的。

一个通常的随机排列数组的方法是给数组中的每个元素$A[i]$一个随机的优先级值$P[i]$，然后根据优先级值排列元素次序。如原始数组为$\{1,2,3,4\}$，随即优先级值为$\{36,3,62,29\}$，则原始数组排列为$\{2,4,1,3\}$。

该方法伪代码如下：

```pseudocode
PERMUTE-BY_SORTING(A)
n = A.length
let P[1..n] be a new array
for i = 1 to n
    P[i] = RANDOM(1,n^3)
sort A using P as sort keys
```

* 在伪代码中，将$1\sim n^3$作为范围选取优先级值，是为了保证每个优先级值大概率是不一样的。在实际代码中，这样实现可能会产生问题。

上述算法中`sort A using P as sort keys`的复杂度由所使用的排列算法决定，通常时间复杂度为$O(n\lg n)$。

还需要证明该算法产生的是均匀随机排列(`unifrom random permutation`)。在雇佣问题下，即证明每个排列的可能性是$1/n!$。

假设需要求所有候选人水平是递增的排列，第一个候选人有$n$种可能，他水平最低的可能性为$1/n$，第二个候选人在剩下的人（$n-1$）中水平最低的概率为$1/(n-1)$，之后的候选人概率依次类推。

将$E_i$定义为事件，第$i$个候选人水平第$i$低，则所有候选人水平是递增的概率为：

$$
Pr\{E_1 \cap E_2 \cap E_3 \cap \dotsi \cap E_n\}\\\\
= Pr\{E_1\} \cdot Pr\{ E_2 | E_1\} \cdot Pr\{E3 | E_2 \cap E_1\} \cdot \dotsb Pr\{E_i | E_{i-1} \cap E_{i-1} \cap \dotsb \cap E_1 \}\\\\\dotsb Pr\{E_n | E_{n-1} \cap E_{i-1} \cap \dotsb \cap E_1 \} \\\\
= \frac{1}{n} \cdot \frac{1}{n-1} \cdot \dotsb \cdot \frac{1}{1}\\\\
= \frac{1}{n!} 
$$

这里是证明了所有候选人水平递增的排列出现概率为$1/n!$，用同样的方法可以证明其他的排列下概率也都为$1/n!$，因此得证。

还由一种随机排列的方法，是通过将$A[i]$与$A[i]\sim A[n]$间的一个元素互换生成随机数组排列，伪代码如下：

```pseudocode
RANDOMIZE-IN-PLACE(A)
n = A.length
for i = 1 to n
    swap A[i] with A[RaNDOM(i,n)]
```

该算法的时间复杂度为$O(n)$。

同样需要证明该算法的输出结果满足均匀随机排列。

在一个有$n$个值的均匀随机排列中取连续$k$个值，取第一个值有$n$种可能，第二个有$n-1$种可能，第$k$个有$n-k+1$种可能。因此连续k个值的排列一共有$n!/(n-k)!$种可能性。

需要检测该算法是否满足此特性。

根据上式，对于第$i$个候选人，前面$i-1$个候选人的排列有$n!/(n-i+1)!$种可能，将前$i-1$个候选人的排列称为事件$E_1$。将第$i$个候选人的选人概率定义为$E_2$，因为第$i$个候选人是从$A[i \dotsb n]$中选取的，所以概率为$1/(n-i+1)$。

前$i$的候选人的排列是在事件$E_1$和事件$E_2$同时发生的情况下产生的，即

$$
Pr\{E_2 \cap E_1 \} = Pr\{E_2 |E_1 \} \cdot Pr\{E_1 \} \\\\
= \frac{1}{n-i+1} \cdot \frac{n-i+1}{n!} \\\\
= \frac{(n-i)!}{n!}
$$

满足均匀随机排列特性，因此得证。

当取$i=n$时，即$n$个候选人时某个排列组合的概率，可得$(n-i)!/n!=1/n!$，与概率分析的结果相同。

## Probabilistic analysis and further uses of indicator random variables

//TODO 

{% note primary %}

引用：

1. *Introduction to Algorithms* 3rd Sep.2009

{% endnote %}

***