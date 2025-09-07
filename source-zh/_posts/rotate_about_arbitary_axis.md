---
tags:
  - 图形学
  - 数学
created: 2023-05-04
updated: 2025-09-01
publishStatus: published
aliases: 绕任意轴旋转的旋转矩阵推导
date: 2024-09-08 12:44
title: 绕任意轴旋转的旋转矩阵推导
description: 介绍了绕任意轴旋转任意角度的的旋转矩阵的推导过程。
---

{% note info %}
针对对于任意轴的旋转矩阵，思路同样是求基本向量在旋转后的结果。
{% endnote %}

向量$\mathbf{v}$在绕任意轴 $n$ 旋转$\theta$角度后变为 $\mathbf{v^{'}}$，表达式为：

$$ \mathbf{v^{'}}=\mathbf{v}\mathbf{R}(\hat{\mathbf{n}},\theta) $$

为了方便计算，将向量 $\mathbf{v}$ 拆成两部分 $\mathbf{v}_{\parallel}$ 和 $\mathbf{v}_{\perp}$，分别表示平行于和垂直于旋转轴 $\mathbf{n}$ 的分量。在旋转过程中，平行于旋转轴 $\mathbf{n}$ 的分量 $\mathbf{v}_{\parallel}$ 是不会发生变化的，因此要求的只是旋转后的 $\mathbf{v}^{'}_{\perp}$ 。示意图如下：
![拆分向量 V](/rotate_about_arbitary_axis/image-20220130144151778.png)

-   $\mathbf{v}_{\parallel}$可以通过点积求得，即$\mathbf{ v_{\parallel}=(\mathbf{v}\cdot \hat{\mathbf{n}})\hat{\mathbf{n}}}$
-   $\mathbf{v}_{\perp}$可以通过$\mathbf{v}$减去$\mathbf{v}_{\parallel}$得到，即 $\mathbf{v_{\perp}=\mathbf{v}-\mathbf{v}_{\parallel}}$
-   $\mathbf{w}$ 向量是为了与向量 $\mathbf{v}_{\perp}$ 构成一个平面，$\mathbf{w}$ 向量的长度与$\mathbf{v}_{\perp}$ 相同，且垂直于$\hat{\mathbf{n}}$和$\mathbf{v}_{\perp}$，所以可得$\mathbf{w}=\hat{\mathbf{n}}\times \mathbf{v}_{\perp}$
-   此时，$\mathbf{w}$ 和 $\mathbf{v}_{\perp}$ 构成了一个二维平面，根据二维平面的旋转可得，$\mathbf{v}_{\perp}^{'}=\cos \theta \mathbf{v}_{\perp} + \sin\theta \mathbf{w}$

{% note info %}
如果两个坐标轴是单位向量，则旋转 $\theta$ 角度的结果为 $(\cos \theta, \sin \theta)$。而这里两个坐标轴分别是 $\mathbf{v}_{\perp}$ 和 $\mathbf{w}$ ，因此结果为：$\cos \theta \mathbf{v}_{\perp} + \sin\theta \mathbf{w}$
{% endnote %}

-   结合上面所有的式子，可推导出$\mathbf{v}^{'}$的公式，即

$$
\begin{aligned}\mathbf{v}^{'} &= \mathbf{v}_{\perp}^{'}+\mathbf{v}_{\parallel}\\&=\mathbf{\cos \theta v_{\perp} + \sin\theta w+(v\cdot\hat{n})\hat{n}} \\&=\cos\theta(\mathbf{v}-(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}})+\sin\theta (\hat{\mathbf{n}}\times \mathbf{v}_{\perp})+(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}} \\&=\cos\theta(\mathbf{v}-(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}})+\sin\theta (\hat{\mathbf{n}}\times(\mathbf{v}-\mathbf{v}_{\parallel}))+(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}} \\&=\cos\theta(\mathbf{v}-(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}})+\sin\theta (\hat{\mathbf{n}}\times \mathbf{v}-\hat{\mathbf{n}} \times \mathbf{v}_{\parallel})+(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}} \\&=\cos\theta(\mathbf{v}-(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}})+\sin\theta (\hat{\mathbf{n}}\times \mathbf{v}-0)+(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}} \\&=\cos\theta(\mathbf{v}-(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}})+\sin\theta (\hat{\mathbf{n}}\times \mathbf{v})+(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}} \end{aligned}
$$

即最终用$\hat{\mathbf{n}}，\theta，\mathbf{v}$表达$\mathbf{v}^{'}$的式子为：

$$ v^{'}=\cos\theta(\mathbf{v}-(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}})+\sin\theta (\hat{\mathbf{n}}\times \mathbf{v})+(\mathbf{v}\cdot\hat{\mathbf{n}})\hat{\mathbf{n}} $$

首先将 $\mathbf{v}$ 以数值 $\begin{bmatrix} 1 & 0& 0\end{bmatrix}$ 代入，可得：

$$ \mathbf{v}^{'}=\cos\theta({\begin{bmatrix} 1\\\\0\\\\0 \end{bmatrix}}^T-\mathbf{n}^x{\begin{bmatrix} \mathbf{n}^x\\\\\mathbf{n}^y\\\\\mathbf{n}^z \end{bmatrix}}^T)+sin\theta {\begin{bmatrix} 0\\\\\mathbf{n}\_z\\\\-\mathbf{n}\_y \end{bmatrix}}^T+\mathbf{n}^x{\begin{bmatrix} \mathbf{n}^x\\\\\mathbf{n}^y\\\\\mathbf{n}^z \end{bmatrix}}^T $$

其中：$\hat{\mathbf{n}}={\begin{bmatrix} n^x\\\\n^y\\\\n^z \end{bmatrix}}^T$，且 $\hat{\mathbf{n}}\times \mathbf{v}={\begin{bmatrix} 0\\\\n^z\\\\-n^y \end{bmatrix}}^T$

原式可继续简化得：

$$ \begin{aligned}\mathbf{v}^{'} &=\cos\theta({\begin{bmatrix} 1\\\\0\\\\0 \end{bmatrix}}^T-n^x{\begin{bmatrix} n^x\\\\n^y\\\\n^z \end{bmatrix}}^T)+sin\theta {\begin{bmatrix} 0\\\\n_z\\\\-n_y \end{bmatrix}}^T+n^x{\begin{bmatrix} n^x\\\\n^y\\\\n^z \end{bmatrix}}^T \\&={\begin{bmatrix}\cos\theta(1-{n_x}^2)+0+{n_x}^2\\\\\cos\theta(0-n_xn_y)+\sin\theta n_z+n_xn_y\\\\\cos\theta(0-n_xn_z)-\sin\theta n_y +n_xn_z\end{bmatrix}}^T \\&={\begin{bmatrix}{n_x}^2(1-\cos \theta) + \cos\theta \\\\n_xn_y(1-\cos \theta)+n_z\sin\theta \\\\n_xn_z(1-\cos \theta) -n_y\sin\theta\end{bmatrix}}^T \end{aligned} $$

该结果即为最终求得矩阵的一行，使用相同的步骤可以求得剩下两行，即

当 $\mathbf{v}$ 以数值 $\begin{bmatrix} 0 & 1& 0\end{bmatrix}$ 代入，可得

$$ \mathbf{v}^{'}={\begin{bmatrix}n_xn_y(1-\cos \theta) -n_z\sin\theta \\\\{n_y}^2(1-\cos \theta)+\cos\theta \\\\n_yn_z(1-\cos \theta) +n_x\sin\theta\end{bmatrix}}^T $$

当 $\mathbf{v}$ 以数值 $\begin{bmatrix} 0 & 0& 1\end{bmatrix}$ 代入，可得

$$ \mathbf{v}^{'}={\begin{bmatrix}n_xn_z(1-\cos \theta) +n_y\sin\theta \\\\n_yn_z(1-\cos \theta)-n_x\sin\theta \\\\{n_z}^2(1-\cos \theta) +\cos \theta\end{bmatrix}}^T $$

至此，得到了绕任意轴 $n$ 旋转 $\theta$ 角度矩阵的三行数据，合并在一起可得：

$$ R({\hat{n},\theta})=\begin{bmatrix}{n_x}^2(1-\cos \theta) + \cos\theta &n_xn_y(1-\cos \theta)+n_z\sin\theta &n_xn_z(1-\cos \theta) -n_y\sin\theta\\\\n_xn_y(1-\cos \theta) -n_z\sin\theta  &{n_y}^2(1-\cos \theta)+\cos\theta &n_yn_z(1-\cos \theta) +n_x\sin\theta\\\\n_xn_z(1-\cos \theta) +n_y\sin\theta &n_yn_z(1-\cos \theta)-n_x\sin\theta &{n_z}^2(1-\cos \theta) +\cos \theta\end{bmatrix} $$

