---
title: MathJax 教程
mathjax: true
categories:
tags:
---

{% cq %}
MathJax是一个让前端支持数学公式显示的JavaScript库。这里介绍常用的数学公式用Mathjax表达方式。
{% endcq %}

<!--more-->

如果需要行内显示数学公式，格式为`$<MathJax>$`。如果是单独显示，格式为

```MathJax
$$
<MathJax>
$$
```

两者在大多数情况下不会有很大差异，但某些符号因为大小的关系在行内与行外显示效果不同，如累加符号

行内显示效果：$\sum_{n}^m$

行外显示效果：

$$
\sum_{n}^m
$$

下面的大部分实例都以行内显示格式。

## 关系符号

| 关系符号  | 表达式  |
| --------- | ------- |
| =         | =       |
| $\neq$    | \neq    |
| <         | <       |
| $\leq$    | \leq    |
| >         | >       |
| $\geq$    | \geq    |
| $\approx$ | \approx |


## 集合符号

| 集合符号 | 表达式 |
| -------- | ------ |
| $\in$    | \in    |
| $\ni$    | \ni    |

## 罗马字符

| 罗马字符      | 表达式      |
| ------------- | ----------- |
| $\Theta$      | \Theta      |
| $\theta$      | \theta      |
| $\Omega$      | \Omega      |
| $\omega$      | \omega      |
| $\varepsilon$ | \varepsilon |
| $\epsilon$    | \epsilon    |
| $\phi$        | \phi        |
| $\Phi$        | \Phi        |

## 运算符号

| 运算符号     | 表达式     | 运算符号 | 表达式 |
| ------------ | ---------- | -------- | ------ |
| $\times$     | \times     | $\cap$   | \cap   |
| $\cdot$      | \cdot      | $\cup$   | \cup   |
| $\sqrt{abc}$ | \sqrt{abc} |

## 特殊符号 

| 特殊符号     | 表达式     | 特殊符号      | 表达式                                 |
| ------------ | ---------- | ------------- | -------------------------------------- |
| $\leftarrow$ | \leftarrow | $\rightarrow$ | \rightarrow                            |
| $\infty$     | \infty     | $\infin$      | \infin（Hexo不识别该写法，但官方支持） |
| $\lfloor$    | \lfloor    | $\rfloor$     | \rfloor                                |
| $\lceil$     | \lceil     | $\rceil$      | \rceil                                 |
| $\equiv$     | \equiv     | $\infty$      | \infty                                 |
| $\dotsc$     | \dotsc     | $\Vert$       | \Vert                                  |
| $\parallel$  | \parallel  | $\perp$       | \perp                                  |

## 上标符号

| 上标符号    | 表达式    | 上标符号  | 表达式  |
| ----------- | --------- | --------- | ------- |
| $\hat{a}$   | \hat{a}   | $\bar{a}$ | \bat{a} |
| $360^\circ$ | 360^\circ |

#### 数学模式

## 分数

```MathJax
$\frac{分子}{分母}$

$\frac{ab}{bc}$
```

$\frac{ab}{bc}$

## 角标

```MathJax
$<表达式>_<表达式>$

$n_1$
```

$n_1$

## 上标

```MathJax
$<表达式>^<上标>$

$n^2$
```

$n^2$

## 累加表达式

```
$\sum_{<角标>}^{<上标>}<表达式>$

$\sum_{n=1}^{n=10}n$
```

$\sum_{n=1}^{n=10}n$

* 在大多数情况下，sum的上标与下标谁先定义没有区别，但仍然建议先写下标。
* 如在Hexo的Mathjax中先定义上标会导致无法渲染。

## 累乘表达式

```text
$$
\prod_{i=1}^{n}a_i
$$
```

$$
\prod_{i=1}^{n}a_i
$$

## 极限表达式

```
$ \lim_{<极限数值>}<表达式> $

$$ \lim_{n\rightarrow\infty}\frac{f(n)}{g(n)} $$

//这里为了显示美观，用了行外表达，实际上极限也可以用在行内
```

$$
\lim_{n\rightarrow\infty}\frac{f(n)}{g(n)}
$$

## 条件判断

条件判断不能在行内显示

```
$$
\begin{cases}
    <表达式> & <条件> \\\\
    <表达式2> & <条件2>
\end{cases}
$$ 
```

$$
\begin{cases}
    <表达式> & <条件> \\\\
    <表达式2> & <条件2>
\end{cases}
$$

## Tips

1. MathJax换行可以使用四个转义符`\\\\`
   
2. 在公式中的空格是不显示的，如果想要显示空格，可以使用`\text{ }`，大括号内的内容当文字处理，所以会计算空格。

{% note primary %}

{% endnote %}

***