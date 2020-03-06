---
title: 《3D数学基础：图形和游戏开发》第六章笔记
mathjax: true
categories:
  - 读书笔记
  - 图形学
tags:
  - 读书笔记
  - 3D数学
---

{% cq %}

《3D数学基础：图形和游戏开发》第六章笔记

{% endcq %}

<!--more-->

# Chapter 6 More on Matrices

在第四章中介绍了矩阵的基本数学性质和几何意义。

在第五章中着重介绍了矩阵的几何意义，列举了一系列矩阵能表示的各种图形变换。

在这一章中将扩展前两章的知识，介绍矩阵的另一些数学特性和深入讨论图形变换。

## Determinant of a Matrix

对于方阵而言，有一个重要的标量成为矩阵的行列式（Determinant of the matrix）。

### Determinants of  $2\times 2$ and $3\times 3$  matrices

方阵$\mathbf{M}$的行列式写为$|\mathbf{M}|$或者写为"$def \mathbf{M}$"，非方阵的矩阵并没有行列式。

二维行列式的计算过程如下：

$$|\mathbf{M}|=\left|\begin{array}{ll}
m_{11} & m_{12} \\\\
m_{21} & m_{22}
\end{array}\right|=m_{11} m_{22}-m_{12} m_{21}$$

三维行列式的计算过程如下：

$$
|\mathbf{M}|=\left|\begin{array}{ll}
m_{11} & m_{12} & m_{13} \\\\
m_{21} & m_{22} & m_{23} \\\\
m_{31} & m_{32} & m_{33}
\end{array} \right| \\\\
=
\begin{array}{c}
m_{11} m_{22} m_{33}+m_{12} m_{23} m_{31}+m_{13} m_{21} m_{32}\\\\
-m_{13} m_{22} m_{31}-m_{12} m_{21} m_{33}-m_{11} m_{23} m_{32}
\end{array}

=\begin{array}{l}
&m_{11}\left(m_{22} m_{33}-m_{23} m_{32}\right) \\\\
&+m_{12}\left(m_{23} m_{31}-m_{21} m_{33}\right) \\\\
&+m_{13}\left(m_{21} m_{32}-m_{22} m_{31}\right)   
\end{array}
$$

对于任何的三维方阵，其行列式的值与三重积的值相同，即

$$\left|\begin{array}{ccc}
a_{x} & a_{y} & a_{z} \\\\
b_{x} & b_{y} & b_{z} \\\\
c_{x} & c_{y} & c_{z}
\end{array}\right|=\begin{array}{c}
\left(a_{y} b_{z}-a_{z} b_{y}\right) c_{x} \\\\
+\left(a_{z} b_{x}-a_{x} b_{z}\right) c_{y}\\\\
+\left(a_{x} b_{y}-a_{y} b_{x}\right) c_{z}\end{array}
=(\mathbf{a} \times \mathbf{b}) \cdot \mathbf{c} \\\\
$$

### Minros and Cofactors

余子式（Minors）和代数余子式（Cofactors）之后求任意维度的行列式时会用到。

对于矩阵$\mathbf{M}$来，$\mathbf{M}^{\{ij\}}$表示删除了第$i$行和第$j$的子矩阵，而子矩阵的行列式称为余子式。如下所示：

$$\mathbf{M}=\left[\begin{array}{ccc}
-4 & -3 & 3 \\\\
0 & 2 & -2 \\\\
1 & 4 & -1
\end{array}\right] \quad \Longrightarrow \quad M^{\{12\}}=\left|\begin{array}{cc}
0 & -2 \\\\
1 & -1
\end{array}\right|=2$$

而代数余子式，是为余子式再加上一个系数，该系数由子矩阵所删除的行列决定，即

$$C^{\{i j\}}=(-1)^{i+j} M^{\{i j\}}$$

### Determinants of Arbitary $n\times n$ Matrices

任意$n\times n$矩阵的行列式计算过程如下：

1. 任意选取一行或一列
2. 对这行或这列中的每一个元素，将它和它所在行列的代数余子式相乘。
3. 将第二步中的所有结果累加

即：

$$|\mathbf{M}|=\sum_{j=1}^{n} m_{i j} C^{\{i j\}}=\sum_{j=1}^{n} m_{i j}(-1)^{i+j} M^{\{i j\}}$$

如果一个三维矩阵通过上述方法计算：





{% note primary %}

引用：

1. *3D Math Primer for Graphics and Game Development* 2nd 2011 

{% endnote %}

***