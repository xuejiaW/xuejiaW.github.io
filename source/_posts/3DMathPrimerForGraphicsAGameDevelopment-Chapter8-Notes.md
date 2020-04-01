---
title: 《3D数学基础：图形和游戏开发》第八章笔记
mathjax: false
date: 2020-04-07 14:55:42
categories:
  - 读书笔记
  - 图形学
tags:
  - 读书笔记
  - 3D数学
---

{% cq %}

《3D数学基础：图形和游戏开发》第八章笔记

8.1节 介绍了朝向（Orientation）的概念。

8.2节 介绍了如何用矩阵表示朝向。

8.3节 介绍如何使用欧拉角表示朝向。

8.4节 介绍如何使用轴角法和指数映射表示朝向。

8.5节 介绍如何使用四元数表示朝向

8.6节 比较了各个表示方法的利弊

8.7节 介绍了各个表示方法如何相互转换。

{% endcq %}

<!--more-->

# Chapter 8 Rotation in Three Dimensions

## What Exactly is "Orientation"

`方向（direction）`只需要两个参数表示，而`朝向（orientation）`需要三个参数表示。如下图中确认飞机的朝向需要两个参数，而朝向还需要图中的绿圈方向来决定其旋转角度。

![绿色的光圈](3DMathPrimerForGraphicsAGameDevelopment-Chapter8-Notes/2020-04-01-12-32-22.png)

`朝向（orientation）`，`旋转（rotation）`和`角位移（angular displacement）`三者的关系为，`旋转`将物体从一个`朝向`转换为另一个`朝向`，这个转换的数值为`角位移`。

角位移与朝向的关系与线段和点的关系有点类似，前者都是表示一个变换，后者都是表示一个状态。

## Matrix Form

这一节是描述用$3 \times 3$的矩阵来描述旋转。

### Which Matrix？

矩阵很常用的操作是坐标系的转换，其中两个用的比较多的是

1. 从物体坐标系转换为直立坐标系——乘以变换矩阵
2. 从直立坐标系转换为物体坐标系——乘以变换矩阵的逆矩阵

在这里，每个对象都含有一个$3 \times 3$的矩阵表示朝向，进行变换的矩阵只包含旋转信息，即它是一个正交矩阵（虽然反转矩阵也是正交矩阵，但这里只包含旋转信息）。

### Direction Consines Matrix

通过矩阵来进行旋转实际上是从方向余弦（Direction cosines）这个概念中得到的。一个方向预先矩阵就是一个旋转矩阵。

假设变换前的三个坐标轴分别为$\hat{\mathbf{x}}_{1}, \hat{\mathbf{x}}_{2}, \hat{\mathbf{x}}_{3}$，变换后的三个坐标轴分别为$\hat{\mathbf{e}}_{1}, \hat{\mathbf{e}}_{2}, \hat{\mathbf{e}}_{3}$。

那么$\hat{\mathbf{e}}_{i}$和$\hat{\mathbf{x}}_{j}$之间的方向余弦$a_{ij}$定义为：

$$a_{i j} \stackrel{\text {def}}{=} \cos \left(\theta_{i j}\right)=\frac{\hat{\mathbf{e}}_{i} \cdot \hat{\mathbf{x}}_{j}}{|\hat{\mathbf{e}}_{i}||\hat{\mathbf{x}}_{j}|}= \hat{\mathbf{e}}_{i} \cdot \hat{\mathbf{x}}_{j}$$

而且坐标轴$\hat{e_{i}}$可以通过其在$\hat{x_{i}}$上的分量累加进行表示。又$\hat{e_{i}}$在原坐标轴上的分量可以通过$cos$求得。于是可得：

$$\begin{aligned}
&\hat{\mathbf{e}}_{1}=\cos \left(\theta_{11}\right) \hat{\mathbf{x}}_{1}+\cos \left(\theta_{12}\right) \hat{\mathbf{x}}_{2}+\cos \left(\theta_{13}\right) \hat{\mathbf{x}}_{3}=a_{11} \hat{\mathbf{x}}_{1}+a_{12} \hat{\mathbf{x}}_{2}+a_{13} \hat{\mathbf{x}}_{3}\\
&\hat{\mathbf{e}}_{2}=\cos \left(\theta_{21}\right) \hat{\mathbf{x}}_{1}+\cos \left(\theta_{22}\right) \hat{\mathbf{x}}_{2}+\cos \left(\theta_{23}\right) \hat{\mathbf{x}}_{3}=a_{21} \hat{\mathbf{x}}_{1}+a_{22} \hat{\mathbf{x}}_{2}+a_{23} \hat{\mathbf{x}}_{3}\\
&\hat{\mathbf{e}}_{3}=\cos \left(\theta_{31}\right) \hat{\mathbf{x}}_{1}+\cos \left(\theta_{32}\right) \hat{\mathbf{x}}_{2}+\cos \left(\theta_{33}\right) \hat{\mathbf{x}}_{3}=a_{31} \hat{\mathbf{x}}_{1}+a_{32} \hat{\mathbf{x}}_{2}+a_{33} \hat{\mathbf{x}}_{3}
\end{aligned}$$

如果将这个变换用矩阵表示，即为：

$$
A=\left[\begin{array}{lll}
\cos \left(\theta_{11}\right)& \cos \left(\theta_{12}\right)& \cos \left(\theta_{13}\right) \\
\cos \left(\theta_{21}\right)& \cos \left(\theta_{22}\right)& \cos \left(\theta_{23}\right) \\
\cos \left(\theta_{31}\right)& \cos \left(\theta_{32}\right)& \cos \left(\theta_{33}\right)
\end{array}\right] \\
=\left[\begin{array}{lll}
\hat{\mathbf{e}}_{1} \cdot \hat{\mathbf{x}}_{1}& \hat{\mathbf{e}}_{1} \cdot \hat{\mathbf{x}}_{2}& \hat{\mathbf{e}}_{1} \cdot \hat{\mathbf{x}}_{3} \\
\hat{\mathbf{e}}_{2} \cdot \hat{\mathbf{x}}_{1}& \hat{\mathbf{e}}_{2} \cdot \hat{\mathbf{x}}_{2}& \hat{\mathbf{e}}_{2} \cdot \hat{\mathbf{x}}_{3}\\
\hat{\mathbf{e}}_{3} \cdot \hat{\mathbf{x}}_{1}& \hat{\mathbf{e}}_{3} \cdot \hat{\mathbf{x}}_{2}& \hat{\mathbf{e}}_{3} \cdot \hat{\mathbf{x}}_{3}
\end{array}\right]
$$

书中用$\mathbf{p}, \mathbf{q}$ 和 $\mathbf{r}$表示原先的坐标轴，用$\mathbf{p}^{\prime}, \mathbf{q}^{\prime}$ 和 $\mathbf{r}^{\prime}$表示变换后的坐标轴，将其带入上矩阵，可得

$$
A=\left[\begin{array}{lll}
\mathbf{p} \cdot \mathbf{p}^{\prime} & \mathbf{q} \cdot \mathbf{p}^{\prime} & \mathbf{r} \cdot \mathbf{p}^{\prime} \\
\mathbf{p} \cdot \mathbf{q}^{\prime} & \mathbf{q} \cdot \mathbf{q}^{\prime} & \mathbf{r} \cdot \mathbf{q}^{\prime} \\
\mathbf{p} \cdot \mathbf{r}^{\prime} & \mathbf{q} \cdot \mathbf{r}^{\prime} & \mathbf{r} \cdot \mathbf{r}^{\prime}
\end{array}\right]
$$

注意这个变换矩阵是用来将用$\mathbf{p}, \mathbf{q}, \mathbf{r}$表达的向量转换为用$\mathbf{p}^{\prime}, \mathbf{q}^{\prime}, \mathbf{r}^{\prime}$表达的向量，即

$$
\mathbf{v}A=\mathbf{v^{\prime}}
$$

如果用$[1,0,0], [0,1,0], [0,0,1]$来表示$\mathbf{p}, \mathbf{q}, \mathbf{r}$并带入上矩阵，可得

$$\left[\begin{array}{lll}
{[1,0,0] \cdot \mathbf{p}^{\prime}} & {[0,1,0] \cdot \mathbf{p}^{\prime}} & {[0,0,1] \cdot \mathbf{p}^{\prime}} \\
{[1,0,0] \cdot \mathbf{q}^{\prime}} & {[0,1,0] \cdot \mathbf{q}^{\prime}} & {[0,0,1] \cdot \mathbf{q}^{\prime}} \\
{[1,0,0] \cdot \mathbf{r}^{\prime}} & {[0,1,0] \cdot \mathbf{r}^{\prime}} & {[0,0,1] \cdot \mathbf{r}^{\prime}}
\end{array}\right]=\left[\begin{array}{lll}
p_{x}^{\prime} & p_{y}^{\prime} & p_{z}^{\prime} \\
q_{x}^{\prime} & q_{y}^{\prime} & q_{z}^{\prime} \\
r_{x}^{\prime} & r_{y}^{\prime} & r_{z}^{\prime}
\end{array}\right]=\left[\begin{array}{l}
-\mathbf{p}^{\prime}- \\
-\mathbf{q}^{\prime}- \\
-\mathbf{r}^{\prime}-
\end{array}\right]$$

即矩阵的每一行是用原坐标轴表示的变换后的坐标轴（这一点在前面的推导过程中也能看出$\hat{\mathbf{e}}_{i}$，是由$\hat{\mathbf{x}}_{i}$表示的）。

同理，如果用$[1,0,0], [0,1,0], [0,0,1]$表示$\mathbf{p}^{\prime}, \mathbf{q}^{\prime}, \mathbf{r}^{\prime}$带入上矩阵，可得：

$$\left[\begin{array}{ccc}
\mathbf{p} \cdot[1,0,0] & \mathbf{q} \cdot[1,0,0] & \mathbf{r} \cdot[1,0,0] \\
\mathbf{p} \cdot[0,1,0] & \mathbf{q} \cdot[0,1,0] & \mathbf{r} \cdot[0,1,0] \\
\mathbf{p} \cdot[0,0,1] & \mathbf{q} \cdot[0,0,1] & \mathbf{r} \cdot[0,0,1]
\end{array}\right]=\left[\begin{array}{ccc}
p_{x} & q_{x} & r_{x} \\
p_{y} & q_{y} & r_{y} \\
p_{z} & q_{z} & r_{z}
\end{array}\right]=\left[\begin{array}{ccc}
| & | & | \\
\mathbf{p}^{\mathrm{T}} & \mathbf{q}^{\mathrm{T}} & \mathbf{r}^{\mathrm{T}} \\
| & | & |
\end{array}\right]$$

即矩阵的每一列，是由变换后的坐标轴表示的原坐标轴。

### Advantages of Matrix Form

用矩阵表示旋转的优点如下：

1. 向量的旋转可以很快的实现，包括坐标系的变换等
2. 绝大部分图形API都是通过矩阵来进行变换的。
3. 多个变换矩阵可以级联，即矩阵相乘
4. 当要进行逆操作时，矩阵取反即可

### Disadvantages of Matrix Form

用矩阵表示旋转的缺点如下：

1. 矩阵花费更多的内存。用来表示三维空间旋转的矩阵为$3\times 3$的矩阵，要9个数字，而通过欧拉角只要三个数字。
2. 人无法直观理解。虽然可以通过每一行进行判断，但是矩阵用来表示旋转仍不够直观。而且所有的数字都会被归一到$-1\sim 1$的范围内（为了表示长度位为一的单位向量）。
3. 矩阵可能存在格式错误。
   a. 并不是随手写一个矩阵都能表示旋转的，旋转矩阵必须是正交矩阵，同时还不能是反转变换。所以矩阵中的数据必须要额外小心，必须满足旋转的表达格式。
   b. 可能由进度不够造成数据错误。因为旋转矩阵中的元素数值通常范围为$-1\sim 1$，当表示一些变换时，精度可能会不够。因此在变换过程中，当小数点后数据进行了舍弃，可能导致无法满足旋转矩阵的性质，这种现象称为矩阵蠕变（Matrix creep）。可以通过矩阵的正交化解决（在第六章有提到）。


## Eular Angles

欧拉角表示旋转的基本思路是通过连续的绕着三个相互垂直的轴的角位移来表示旋转。

理论上来说，这三个相互垂直的轴可以是任意的，但通常来说，都选择一个坐标系的三个基轴（cardinal axes）。在这本书中，称为`heading-pitch-bank`，绕着这三个轴的旋转如下图所示：

![heading-pitch-bank旋转](3DMathPrimerForGraphicsAGameDevelopment-Chapter8-Notes/2020-04-02-08-34-50.png)

第一张图显示的是原始状态，第二张图是绕着heading轴（直立坐标系下的y轴）旋转，第三张图是绕着pitch轴旋转（物体坐标系下的x轴），第四章图是绕着bank轴旋转（物体坐标系下的z轴）。

### Other Euler Angle Conventions

还存在很多其他的欧拉角旋转表达方式，如很常见的`yaw-pitch-roll`。这种表达方式下，通常`roll`与`bank`的含义一模一样，但`heading`和`yaw`有细微差别，`heading`是直立坐标系的y轴，`yaw`是物体坐标系的y轴。

如果所有的旋转轴都是直立坐标系的轴，则称为固定轴（Fixed-Axis）旋转。而传统的欧拉角旋转都是绕着物体自己的坐标系的轴。两种方式实际上是等效的，只要用相反的顺序执行旋转即可（传统欧拉：yaw-pitch-roll,固定轴：roll-pitch-yaw）。因为传统欧拉角旋转顺序中，前一个轴的旋转会影响后面的轴的位置，而固定轴欧拉角的旋转顺序则不会。

在最原始的欧拉角定义，实际上第一个轴和第三个轴是相同的，这种定义又被命名为`proper Euler angles`。而现在常用的欧拉角，实际上称为`Tait-Bryan angles`。

* 这一节中提到个各种命名，并不是绝对的，即可能现在命名名字相同但是含义却不同的情况。
* 在这里提及各种命名，实际上是为了让读者在接触其他的系统时，首先确认下其中的欧拉角定义方式是否不同，如旋转正方向，绕什么轴旋转，绕不同轴旋转的顺序等。
* 不同定义的欧拉角进行转换过程，通常是先原始欧拉角转换为矩阵，再从矩阵
转换为目标欧拉角

### Advantages of Euler Angles

欧拉角表达的优点在于：

1. 人可以直观理解。当需要人来输入旋转角度时，通常欧拉角表达是唯一的选择。
2. 欧拉角用了最少的数字来表达旋转。另外因为欧拉角中的数字是用来表达角度的，所以不会像在矩阵中的数字一样，局限在范围$-1\sim 1$之中，也因此浮点数的精度误差也不会像在矩阵中严重。
3. 任意三个数值的组合都是合法的。

### Disadvantages of Euler Angles

1. 对于一个旋转角度的表达不唯一，即存在别名。
2. 在不同角度之间的线性差值变换可能存在问题。
3. 万向锁

第一个别名问题，一是因为所有的角度都可以加上360°保持不变，第二个原因是因为绕着三个轴的旋转并非完全相互独立，如pitch向下135°，和先heading转180再pitch向下45°效果一样。

而这个问题可以通过标准坐标（canonical）解决。限制heading和bank的范围为$\left(-180^{\circ},+180^{\circ}\right]$，pitch的范围是$\left[-90^{\circ},+90^{\circ}\right]$。但这样还存在一个歧义性，当pitch角度是$\pm 90^{\circ}$时，heading和bank旋转是一样的效果，这个现象称为万向锁（Gimbal Lock）。在这种情况下，定义变换的轴是heading，bank轴始终为0。

因此欧拉角的标准坐标规则为：

$$\left\{\begin{aligned}
-180^{\circ}<& h \leq 180^{\circ} \\
-90^{\circ} \leq & p \leq 90^{\circ} \\
-180^{\circ}<b & \leq 180^{\circ} \\
p=\pm 90^{\circ} & \Rightarrow \quad b=0
\end{aligned}\right.$$

当通过代码实现欧拉角时，最好保证返回的数值时标准坐标。

第二个问题是关于角度变换插值的。
插值变换是指，有两个角度$\mathbf{R}_{0}$ 和 $\mathbf{R}_{1}$，希望通过参数$0 \leq t \leq 1$，实现$\mathbf{R}(t)$在$\mathbf{R}_{0}$ 和 $\mathbf{R}_{1}$间线性变化。类似于：

$$\begin{aligned}
\Delta \theta &=\theta_{1}-\theta_{0} \\
\theta_{t} &=\theta_{0}+t \Delta \theta
\end{aligned}$$

欧拉角的插值变换问题第一种可能是由别名造成的，如下所示：

![别名插值错误](3DMathPrimerForGraphicsAGameDevelopment-Chapter8-Notes/2020-04-02-09-13-03.png)

在其中两个角度实际上相差为$45^{\circ}$，但因为用了别名表示，路径多走了将近两圈。这种可能可以通过使用标准坐标表示解决。

第二个问题如下：

![非别名插值错误](3DMathPrimerForGraphicsAGameDevelopment-Chapter8-Notes/2020-04-02-09-19-43.png)

其中$-170^{\circ}和170^{\circ}$都是在范围$(-180^{\circ},+180^{\circ}]$内，因此满足标准规范。但实际上两者相差20°，却要插值340°。

解决方法是通过`wrapPi`进行计算，计算式子如下：

$$\operatorname{wrap} \operatorname{Pi}(x)=x-360^{\circ}\left\lfloor\left(x+180^{\circ}\right) / 360^{\circ}\right\rfloor$$

其中的x即为两个角度相减后的插值，在此例中为340。

因此线性插值表达式应该为：

$$\begin{aligned}
\Delta \theta &=\operatorname{wrap} \mathrm{Pi}\left(\theta_{1}-\theta_{0}\right) \\
\theta_{t} &=\theta_{0}+t \Delta \theta
\end{aligned}$$

第三个问题万向锁无法被解决。只要使用了三个数值来表达旋转，那么当第二个轴旋转至90°时，第一个轴与第三个轴的旋转效果都会变得相同。

## Axis-Angle and Exponential Map Representations

欧拉还提出了欧拉旋转理论（Euler‘s rotation theorem）：任何的3D旋转，都可以通过绕着某一个轴的单一旋转实现。如给定了两个旋转$\mathbf{R}_1和\mathbf{R}_2$，存在一个轴$\hat{\mathbf{n}}$，使得$\mathbf{R}_1和\mathbf{R}_2$两个旋转的结合可以通过绕着$\hat{\mathbf{n}}$轴的一次旋转搞定。

这种通过轴$\hat{\mathbf{n}}$和一个旋转角度$\theta$来表示的方法称为轴角法（Axis-Angle）。

而指数映射法(exponential map)是更进一步，通过$\mathbf{e}=\theta \hat{\mathbf{n}}$将轴和角结合在一起表示。如果想获取角度，可以通过$\theta=\|\mathbf{e}\|$。如果想获取旋转轴，可以对$\mathbf{e}$进行归一化，即$\hat{\mathbf{n}}=\bar{\mathbf{e}}$。

当$\theta=0$时，轴角法会出现歧义性，但是指数映射法不会（因为最终值已经变为了0）.同样，因为角度和轴的正负号造成的别名问题，指数映射法中也不会发生，因为正负号被相乘的操作抵消了。

但是因为加减$360^{\circ}$造成的别名问题，无论是轴角法还是指数映射法中都会出现。

同时，在使用指数映射法的时候，多个角度的旋转不能通过加法来获得。因为加法操作是支持交换律的，而旋转操作不支持。

如有两个旋转$\mathbf{e}_{1}=\left[90^{\circ}, 0,0\right]$ 和$\mathbf{e}_{2}=\left[0,90^{\circ}, 0\right]$，先执行$\mathbf{e}_{1}$和先执行$\mathbf{e}_{2}$的结果是不同的。因为旋转轴都是针对于物体坐标的，后者的旋转轴位置会受前一个旋转的影响。

但是这个结果的差距会随着角度的缩小而缩小，如旋转的角度是2°的话，那么结果的差异相对来说没有那么明显。因此一定意义上如果旋转的角度足够小，那么可以通过指数映射法的加法来结合角度的旋转。

轴角法更多的是一个概念上的方法，在实际上中运用的比较少。四元数实际上是通过轴角法演变来的。

指数映射法运用的相对较多。在计算角速度的时候，通常使用指数映射法。一是因为指数映射法受加减360°别名的影响，因此可以保留速度的变换。二是因为虽然指数映射法的加法无法完美结合多个变换，但是可以结合多个变换的变换角度的大小。

## Quaternions

从数学上可以证明为什么用欧拉角来表示三维空间旋转必然会引起万向锁，所用方法为“manifolds”，但这个论证超出了本书的范围。

### Quaternion Notation

四元数通常包含一个标量部分（$\mathbf{w}$），和一个三维向量部分（$\mathbf{v}$），即四元数标记为：

$$\left[\begin{array}{ll}
w & \mathbf{v}
\end{array}\right], \quad\left[\begin{array}{llll}
w & (x & y & z)
\end{array}\right]$$

四元数也可以通过纵向表示，如：

$$\left[\begin{array}{c}
w \\
\left(\begin{array}{l}
x \\
y \\
z
\end{array}\right)
\end{array}\right]$$

但不像向量中的横向量与纵向量会影响计算，四元数的横向与纵向表示没有任何区别，仅仅是写法的不同。

### What Do Those Four Numers Mean？

之前提到了轴角法表示旋转，即通过$(\theta, \hat{\mathbf{n}})$表达旋转。可以将其表示为四元数，将其中的旋转角度和旋转轴的信息进行编码放入四个数中，如下所示：

$$\begin{aligned}
&\left[\begin{array}{ll}
w & \mathbf{v}
\end{array}\right]=[\cos (\theta / 2) \quad \sin (\theta / 2) \hat{\mathbf{n}}]\\
&\left.\left[\begin{array}{llll}
w & (x & y & z
\end{array}\right)\right]=\left[\cos (\theta / 2) \quad\left(\sin (\theta / 2) n_{x} \quad \sin (\theta / 2) n_{y} \quad \sin (\theta / 2) n_{z}\right)\right]
\end{aligned}$$

这样的四元数是关于角度旋转的，其中的$\mathbf{v}$和旋转轴$\hat{\mathbf{n}}$相关，$\omega$和旋转角度$\theta$相关。

这样是几何意义上的四元数，但是从复数层面或者其他学科中，四元数还有其他用处，只不过超出了本书的范围。

### Quaternion Negation

> 从第三节到第11节都是关于四元数的操作

四元数的取反操作如下：

$$\begin{aligned}
-\mathbf{q} &\left.=-\left[w \quad\left(\begin{array}{lll}
w & y & z
\end{array}\right)\right]=\left[\begin{array}{llll}
-w & (-x & -y & -z
\end{array}\right)\right] \\
&=-[w \quad \mathbf{v}]=\left[\begin{array}{ll}
-w & -\mathbf{v}
\end{array}\right]
\end{aligned}$$

从几何意义上来说，$\mathbf{q}$和$\mathbf{-q}$没有任何区别。因为根据上一节中四元数数据的定义，因为每个操作符都是对于$\theta/2$，给$\theta$加上360°，其数值就会取反，但是旋转的角度仍然相同。

### Identity Quaternion(s)

从几何意义角度上说，存在两个单位四元数，表示没有任何的旋转，它们为：

$$\left[\begin{array}{ll}
1 & 0
\end{array}\right] \text { 和 }\left[\begin{array}{ll}
-1 & 0
\end{array}\right]$$

当$\theta$为偶数倍的360°时，$\cos(\theta /2) =1$，对应上式中第一个单位四元数。当$\theta$为奇数倍的360°时，$\cos(\theta /2) =-1$，对应上式中第二个单位四元数。在两种情况下，$\sin(\theta/2)$都为0，所以$\hat{\mathbf{n}}的取值也是没关系的$。

但从代数角度上说，实际上只有$\left[\begin{array}{ll}1 & 0\end{array}\right]$一个四元数。

### Quaternion Magnitude

对于任意的四元数，求模的公式如下：

$$\begin{aligned}
\|\mathbf{q}\| &=\left\|\left[w \quad\left(\begin{array}{ll}
x & y
\end{array} \quad z\right)\right]\right\|=\sqrt{w^{2}+x^{2}+y^{2}+z^{2}} \\
&=\|[w \quad \mathbf{v}]\|=\sqrt{w^{2}+\|\mathbf{v}\|^{2}}
\end{aligned}$$

对于表示旋转的几何意义上的四元数，其求模过程如下：

$$\begin{aligned}
\|\mathbf{q}\| &=\|[w \quad \mathbf{v}]\|=\sqrt{w^{2}+\|\mathbf{v}\|^{2}} \\
&=\sqrt{\cos ^{2}(\theta / 2)+(\sin (\theta / 2)\|\hat{\mathbf{n}}\|)^{2}} \\
&=\sqrt{\cos ^{2}(\theta / 2)+\sin ^{2}(\theta / 2)\|\hat{\mathbf{n}}\|^{2}} \\
&=\sqrt{\cos ^{2}(\theta / 2)+\sin ^{2}(\theta / 2)(1)} \\
&=\sqrt{1} \\
&=1
\end{aligned}$$

即用于表达旋转的四元数，其模为1。

在几何中，通常`unit quaternions`用来描述这些模为1的四元数，并且同样翻译为单位四元数。

### Quaternion Conjugate and Inverse

四元数有共轭操作，表示为$\mathbf{q}*$，计算过程如下：

$$\begin{aligned}
\mathbf{q}^{*} &=\left[\begin{array}{ll}
w & \mathbf{v}
\end{array}\right]^{*}=\left[\begin{array}{ll}
w & -\mathbf{v}
\end{array}\right] \\
&\left.\left.=\left[\begin{array}{lll}
w & (x & y & z
\end{array}\right)\right]^{*}=\left[\begin{array}{llll}
w & (-x & -y & -z
\end{array}\right)\right]
\end{aligned}$$

四元数也有取反操作，表示为$\mathbf{q}^{-1}$，计算过程如下：

$$\mathbf{q}^{-1}=\frac{\mathbf{q}^{*}}{\|\mathbf{q}\|}$$

且类似于矩阵，同样有性质：

$$
\mathbf{q}\mathbf{q}^{-1}=\left[\begin{array}{ll}
1 & \mathbf{0}
\end{array}\right]
$$

从几何意义上来说，用于旋转的四元数，因为模为1，所以$\mathbf{q}^{*}=\mathbf{q}^{-1}$。它们都表示为绕着相反的轴（因为$\mathbf{v}$取反了）进行旋转。

### Quaternion Multiplication

四元数的相乘和矩阵的叉乘类似，叉乘返回的是向量，四元数相乘返回的是四元数。如下所示：

$$\begin{aligned}
\mathbf{q}_{1} \mathbf{q}_{2} &\left.=\left[w_{1} \quad\left(\begin{array}{ccc}
x_{1} & y_{1} & z_{1}
\end{array}\right)\right]\left[\begin{array}{ccc}
w_{2} & \left(x_{2}\right. & y_{2} & z_{2}
\end{array}\right)\right] \\
&=\left[\begin{array}{c}
w_{1} w_{2}-x_{1} x_{2}-y_{1} y_{2}-z_{1} z_{2} \\
\left(\begin{array}{l}
w_{1} x_{2}+x_{1} w_{2}+y_{1} z_{2}-z_{1} y_{2} \\
w_{1} y_{2}+y_{1} w_{2}+z_{1} x_{2}-x_{1} z_{2} \\
w_{1} z_{2}+z_{1} w_{2}+x_{1} y_{2}-y_{1} x_{2}
\end{array}\right)
\end{array}\right] \\
&=\left[\begin{array}{lll}
w_{1} & \mathbf{v}_{1}
\end{array}\right]\left[\begin{array}{ll}
w_{2} & \mathbf{v}_{2}
\end{array}\right] \\
&=\left[w_{1} w_{2}-\mathbf{v}_{1} \cdot \mathbf{v}_{2} \quad w_{1} \mathbf{v}_{2}+w_{2} \mathbf{v}_{1}+\mathbf{v}_{1} \times \mathbf{v}_{2}\right]
\end{aligned}$$

四元数的乘法，满足结合律，不满足交换律

$$\begin{aligned}
(\mathbf{a b}) \mathbf{c} &=\mathbf{a}(\mathbf{b} \mathbf{c}) \\
\mathbf{a b} & \neq \mathbf{b a}
\end{aligned}$$

乘积的模等于模的乘积

$$\left\|\mathbf{q}_{1} \mathbf{q}_{2}\right\|=\left\|\mathbf{q}_{1}\right\|\left\|\mathbf{q}_{2}\right\|$$

乘积的逆，等于逆按相反顺序的乘积

$$\begin{aligned}
(\mathbf{a b})^{-1} &=\mathbf{b}^{-1} \mathbf{a}^{-1} \\
\left(\mathbf{q}_{1} \mathbf{q}_{2} \cdots \mathbf{q}_{n-1} \mathbf{q}_{n}\right)^{-1} &=\mathbf{q}_{n}^{-1} \mathbf{q}_{n-1}^{-1} \cdots \mathbf{q}_{2}^{-1} \mathbf{q}_{1}^{-1}
\end{aligned}$$


如果$\mathbf{q}$是一个表示旋转的四元数，那么下式可以表示旋转操作：

$$\mathbf{p}^{\prime}=\mathbf{q p q}^{-1}$$

式子中的$\mathbf{p}$是描述一个点的四元数，如果在三维空间中的点$(x,y,z)$，用四元数表示则为$[0 \quad(x \quad y \quad z)]$。

使用该式子的例子如下：

如果存在点$\mathbf{P}=(1,0,0)$，希望其绕着+z轴旋转90°，则旋转四元数为$\left[\frac{\sqrt{2}}{2} \quad ( 0 \quad 0 \quad  \frac{\sqrt{2}}{2} ) \right]$，需要求得旋转的点$\mathbf{P^{'}}$，计算过程如下：

$$
p^{\prime}=q p q^{-1}
$$

$$
\begin{array}{l}
q p =\left[\frac{\sqrt{2}}{2} \quad\left(0 \quad 0 \quad\frac{\sqrt{2}}{2} \right)\right] \quad \left[0 \quad\left(1 \quad 0 \quad 0\right)\right] \\
=\left[0-0 \quad\left(\frac{\sqrt{2}}{2} \quad 0 \quad 0\right)+(0 \quad 0 \quad 0)+\left(0 \quad \frac{\sqrt{2}}{2} \quad  0\right)\right] \\
=\left[0 \quad\left(\frac{\sqrt{2}}{2} \quad \frac{\sqrt{2}}{2} \quad 0\right)\right]
\end{array}
$$

$$
\begin{array}{l}
q p q^{-1} =\left[0 \quad\left(\frac{\sqrt{2}}{2}\quad  \frac{\sqrt{2}}{2}\quad  0\right)\right]\left[\frac{\sqrt{2}}{2} \quad \left(0\quad 0\quad -\frac{\sqrt{2}}{2}\right)\right] \\
=\left[0-0 \quad \left(0 \quad 0 \quad 0\right)+\left(\frac{1}{2} \quad  \frac{1}{2} \quad  0\right) +\left(-\frac{1}{2} \quad \frac{1}{2} \quad 0\right)\right] \\
=\left[0 \quad\left(0 \quad 1 \quad 0\right)\right]
\end{array}
$$

即求得变换后的四元数$\mathbf{p^{'}}$为$\left[0 \quad\left(0 \quad 1 \quad 0\right)\right]$，因此变换后的点为$(0,1,0)$。

但这个式子只是理论上使用，实际操作中并不会使用这个式子进行旋转操作。可以通过这个式子做理论上的分析，如下式:
$$\begin{aligned}
\mathbf{p}^{\prime} &=\mathbf{b}\left(\mathbf{a p a}^{-1}\right) \mathbf{b}^{-1} \\
&=(\mathbf{b} \mathbf{a}) \mathbf{p}\left(\mathbf{a}^{-1} \mathbf{b}^{-1}\right) \\
&=(\mathbf{b} \mathbf{a}) \mathbf{p}(\mathbf{b} \mathbf{a})^{-1}
\end{aligned}$$

该式子表示四元数的旋转可以级联，也表示了两个旋转操作（由$\mathbf{a}$和$\mathbf{b}$表示），可以结合为同一个旋转$\mathbf{ba}$

* 当多个四元数表示多次相连的旋转时，其计算顺序是由内向外的（上式中先计算$\mathbf{a}$再计算$\mathbf{b}$）

### Quaternion "Difference"

四元数的差值（Difference）是用来表示两个朝向的角度相互变换时差距。

注意这里的差值并不是几何意义上的两个角度大小之间的差，和上一节中用于变换的旋转四元数也不相同。这里的差值指的是从一个角度变换为另一个角度需要进行的操作，将这个操作用四元数表示出来。

如给定了两个朝向$\mathbf{a}和\mathbf{b}$，需要求得差值$\mathbf{d}$满足：

$$\mathbf{d a}=\mathbf{b}$$

可以根据下式求得$\mathbf{d}$,

$$\begin{aligned}
(\mathbf{d a}) \mathbf{a}^{-1} &=\mathbf{b a}^{-1} \\
\mathbf{d}\left(\mathbf{a a}^{-1}\right) &=\mathbf{b a}^{-1} \\
\mathbf{d}[1 \quad \mathbf{0}] &=\mathbf{b a}^{-1} \\
\mathbf{d} &=\mathbf{b a}^{-1}
\end{aligned}$$

例如有变换前的点$\mathbf{p}=\left[0 \quad\left(1 \quad 0 \quad 0\right)\right]$和变换后的点$\mathbf{p}^{\prime}=\left[0 \quad\left(0 \quad 1 \quad 0\right)\right]$，需要求得差值$d$

$$d=p^{\prime}p^{-1}$$

$$
\begin{array}{l}
d=\left[\begin{array}{cc}
0 & (0\quad 1\quad 0)
\end{array}\right]\left[\begin{array}{cc}
0 & (-1\quad 0\quad 0)
\end{array}\right] \\
=[0-0 \quad(0\quad 0\quad 0)+(0\quad 0\quad 0)+(0\quad 0\quad 1)] \\
= {[0 \quad(0\quad 0\quad 1)]}
\end{array}$$

如之前所述，这里求得的$\mathbf{d}$虽然形式上满足旋转四元数的定义，但是它并不是一个旋转四元数，而是表示两个点之间的差值。

这差值也同样不是几何意义上的两个点之间的角度差。如例子中的$\mathbf{p}=[0 (\quad 1 \quad 0 \quad 0)]$和$\mathbf{p^{\prime}}=[0 (\quad 0 \quad 1 \quad 0)]$，两者实际上的角度差值是90°（绕着+z）轴。但是这里求出的$\mathbf{d}=[0 \quad(0\quad 0\quad 1)]$，如果按旋转四元数来解释$\mathbf{d}$，那么$\cos(\theta/2)=0$，$\theta=180^{\circ}$，明显与实际情况不同。

### Quaternion Dot Product

四元数的点乘与矩阵的点乘类似，如下所示：

$$\begin{aligned}
\mathbf{q}_{1} \cdot \mathbf{q}_{2} &=\left[\begin{array}{ll}
w_{1} & \mathbf{v}_{1}
\end{array}\right] \cdot\left[\begin{array}{ll}
w_{2} & \mathbf{v}_{2}
\end{array}\right] \\
&=w_{1} w_{2}+\mathbf{v}_{1} \cdot \mathbf{v}_{2} \\
&\left.=\left[w_{1} \quad\left(\begin{array}{lll}
x_{1} & y_{1} & z_{1}
\end{array}\right)\right] \cdot\left[\begin{array}{llll}
w_{2} & \left(x_{2}\right. & y_{2} & z_{2}
\end{array}\right)\right] \\
&=w_{1} w_{2}+x_{1} x_{2}+y_{1} y_{2}+z_{1} z_{2}
\end{aligned}$$

在上一节求四元数差值的部分中，如果设$\mathbf{a}=[\omega_{1} \quad \mathbf{v_1}]$和$\mathbf{b}=[\omega_{2} \quad \mathbf{v_2} ]$，那么$\mathbf{d}$中的$\omega$部分即为$w_{1} w_{2}+\mathbf{v}_{1} \cdot \mathbf{v}_{2}$，即和$\mathbf{a} \cdot \mathbf{b}$的结果相同。

而$\mathbf{d}$的形式上满足旋转四元数的定义（虽然$\theta$和$\hat{\mathbf{n}}$和真实的旋转四元数并不相等），所以其中的$\omega$也能反应差值的角度大小，因此可以通过点乘来求得差值的角度大小。

### Quaternion log，exp, and Multiplication by a Scaler

为了书写方便，四元数可表示为，$\alpha=\theta / 2，\mathbf{q}=[\cos \alpha \quad \hat{\mathbf{n}} \sin \alpha]$

四元数的log（logarithm）定义为：

$$\log \mathbf{q}=\log ([\cos \alpha \quad \hat{\mathbf{n}} \sin \alpha]) \equiv\left[\begin{array}{ll}
0 & \alpha \hat{\mathbf{n}}
\end{array}\right]$$

四元数的自然指数函数（Exponential function）定义为：

$$\exp \mathbf{p}=\exp \left(\left[\begin{array}{ll}
0 & \alpha \hat{\mathbf{n}}
\end{array}\right]\right) \equiv[\cos \alpha \quad \hat{\mathbf{n}} \sin \alpha]$$

可以得出：

$$\exp (\log \mathbf{q})=\mathbf{q}$$

这与一般数学中的操作是对应的，即：

$$e^{\ln a}=a$$

四元数与标量相乘的定义如下：

$$k \mathbf{q}=k[w \quad \mathbf{v}]=\left[\begin{array}{ll}
k w & k \mathbf{v}
\end{array}\right]$$

### Quaternion Exponentiation

四元数的指数形式（Exponentiation），写为$\mathbf{q}^{t}$

在自然数中，$a^0=1,a^1=a$，即指数从$0\sim1$变化的过程中，结果从$1\sim a$逐渐变换。在四元数中类似，即指数从$0\sim 1$的过程中，结果从$[1 \quad \mathbf{0}]$逐渐变换为$\mathbf{q}$

四元数指数操作的几何意义在于，它可以截取或倍化差值，因为：

$$\mathbf{q}^{t}=\exp (t \log \mathbf{q})$$

上式中，先进行了log操作，由上节可知，log操作的结果是将角度抽离出来（从$\sin \alpha \hat{\mathbf{n}}$变为了$\alpha \hat{\mathbf{n}}$）。这时候乘以$t$就是直接对角度进行截取或倍化。然后进行的exp操作，则又是将角度变化回了四元数。

所以如果$\mathbf{q}$表示绕着x轴旋转30°，那么$\mathbf{q}^2$表示绕着x轴旋转60°，$\mathbf{q}^{-1/3}$表示绕着反方向旋转了10°。

但是指数操作的旋转的结果是最短路径，即$\mathbf{q}^8$的结果并不是旋转240°，而是120°。

另外四元数的几何操作不满足实数的指数操作的一些性质，如$\left(a^{s}\right)^{t}=a^{s t}$无法在四元数中实现。

//TODO:

书中给出了实现四元数指数操作的代码

### Quaternion Interpolation, a.k.a Slerp

球面线性插值（Slerp，Spherical Linera interpolation，下简称插值）是用来在两个角度间逐渐变换的方法。Slerp方法需要三个参数，$\mathbf{q}_0,\mathbf{q}_1和t$，分别表示插值的起始点，终点和目前的进度。

插值的基本步骤为：

1. 算出起始点和重点之间的差距
2. 使用t得出一部分差距
3. 将这一部分差距加到起始点上

这三个步骤可表示为：

$$\begin{aligned}
\Delta a &=a_{1}-a_{0} \\
\operatorname{lerp}\left(a_{0}, a_{1}, t\right) &=a_{0}+t \Delta a
\end{aligned}$$

而对于四元数的插值来说，步骤基本类似，具体为：
1. 算出两个朝向的差值
   $$\Delta \mathbf{q}=\mathbf{q}_{1} \mathbf{q}_{0}^{-1}$$
2. 使用指数操作，求出一部分差值
   $$(\Delta \mathbf{q})^{t}$$
3. 通过乘法，对起始位置加上差值
   $$(\Delta \mathbf{q})^{t} \mathbf{q}_{0}$$

结合起来，四元数的插值运算为：

$$\text { slerp }\left(\mathbf{q}_{0}, \mathbf{q}_{1}, t\right)=\left(\mathbf{q}_{1} \mathbf{q}_{0}^{-1}\right)^{t} \mathbf{q}_{0}$$

但在实际运用中，通常使用另一个方法进行四元数的插值运算。

因为所有形式为旋转四元数的四元数，其模都为1，所以可以看作是在长度为1的四维球体表面。那么插值运算可以看作是在这个四维的球体表面的弧线上运动（所以插值运算全程是球面线性插值）。

如下图所示：

![球体表面插值](3DMathPrimerForGraphicsAGameDevelopment-Chapter8-Notes/2020-04-03-12-08-20.png)

而可以进一步，将$v_t$看作是$v_0$和$v_1$的线性组合。

![线性组合求插值](3DMathPrimerForGraphicsAGameDevelopment-Chapter8-Notes/2020-04-03-12-16-01.png)

根据下图，可以求得$k_1$

$$\begin{aligned}
\sin \omega &=\frac{\sin t \omega}{k_{1}} \\
k_{1} &=\frac{\sin t \omega}{\sin \omega}
\end{aligned}$$

注意因为$v_1$的模为1，所以在分母中省略了。

![求k1](3DMathPrimerForGraphicsAGameDevelopment-Chapter8-Notes/2020-04-03-12-32-58.png)

同理，根据下图，可以求出$k_0$

![求k0](3DMathPrimerForGraphicsAGameDevelopment-Chapter8-Notes/2020-04-03-12-32-37.png)

因此可得：

$$\mathbf{v}_{t}=k_{0} \mathbf{v}_{0}+k_{1} \mathbf{v}_{1}=\frac{\sin (1-t) \omega}{\sin \omega} \mathbf{v}_{0}+\frac{\sin t \omega}{\sin \omega} \mathbf{v}_{1}$$

即

$$\operatorname{slerp}\left(\mathbf{q}_{0}, \mathbf{q}_{1}, t\right)=\frac{\sin (1-t) \omega}{\sin \omega} \mathbf{q}_{0}+\frac{\sin t \omega}{\sin \omega} \mathbf{q}_{1}$$

现在还遗留的问题是如何求出插值的角度$\omega$。根据之前对于四元数点乘的定义，可以使用点积求得四元数中得标量部分$\omega$(这里的$\omega$不是指角度)，即可通过$\mathbf{q}_0 \cdot \mathbf{q}_1$得到$\cos\omega$ （这里的$\omega$是指要求得角度差值，不是标量）。

//TODO

书中有给出关于差值的算法

### Advantages and Disadvantage of Quaternions

优点：

1. 可以实现平滑的插值运算
2. 可以级联和使用四元数的逆进行逆转换
3. 可以快速的转换至矩阵形式，和从矩阵形式转换回来
4. 只需要四个数字

缺点：
1. 需要的数字仍然比欧拉角多（欧拉角只需要3个数字）
2. 并不是所有的四元数都能表示旋转
   旋转四元数的模是1
3. 人无法直观理解

### Quaternions as Complex Number

这一节是用从复数的角度来描述四元数，从这个角度可以解释两个问题，一是为什么从旋转角度来看，四元数代表的是$\theta/2$而不是$\theta$，二是为什么用于旋转的表达式是$\mathbf{qvq_{-1}}$

首先实数可以通过矩阵形式进行表达，如实数$a$，可按如下方式表示：

$$a \equiv\left[\begin{array}{ll}
a & 0 \\
0 & a
\end{array}\right]$$

复数同样可以通过矩阵形式表达，如复数$a+bi$，可以表达为：

$$a+b i \equiv\left[\begin{array}{cc}
a & -b \\
b & a
\end{array}\right]$$

而且这样表达复数，仍然可以满足$i^2=-1$的性质，如下

$$i^{2} \equiv\left[\begin{array}{cc}
0 & -1 \\
1 & 0
\end{array}\right]^{2}=\left[\begin{array}{cc}
0 & -1 \\
1 & 0
\end{array}\right]\left[\begin{array}{cc}
0 & -1 \\
1 & 0
\end{array}\right]=\left[\begin{array}{cc}
-1 & 0 \\
0 & -1
\end{array}\right] \equiv-1$$

因为四元数的乘法是从右向左的，相当于是矩阵中的右手坐标系，所以矩阵中的每一列代表坐标轴，从上式可以看到，在$i$乘以$i$后，列从$[0,1]$变为了$[-1,0]$，从$[-1,0]$变为了$[0,-1]$，即旋转了90°。

即可以将复数看作是一种旋转的表达，如果旋转$\theta^{\circ}$，即表达为：

$$\cos \theta+i \sin \theta \equiv\left[\begin{array}{cc}
\cos \theta & -\sin \theta \\
\sin \theta & \cos \theta
\end{array}\right]$$

这个矩阵即为之前在二维旋转中推导出的，旋转$\theta^{\delta}$的矩阵，只不过之前推导的是左手坐标系中的，这里是右手坐标系中的（两个坐标系的结果互为转置）。

如果将复数$x+yi$用矩阵表示为矩阵$[x,y]$，可以看到实数的乘法与矩阵的乘法同样可以对应起来。进一步证明可以通过实数来进行旋转操作。

同时复数的共轭，也可以与矩阵的求逆对应起来，两者都是进行逆变换。

$$\begin{aligned}
(\cos \theta+i \sin \theta)(x+i y) &=x \cos \theta+i y \cos \theta+i x \sin \theta+i^{2} y \sin \theta \\
&=(x \cos \theta-y \sin \theta)+i(x \sin \theta+y \cos \theta)
\end{aligned}$$

$$\left[\begin{array}{cc}
\cos \theta & -\sin \theta \\
\sin \theta & \cos \theta
\end{array}\right]\left[\begin{array}{l}
x \\
y
\end{array}\right]=\left[\begin{array}{l}
x \cos \theta-y \sin \theta \\
x \sin \theta+y \cos \theta
\end{array}\right]$$

当这个结论无法推导至三维空间中。在二维空间中，用实数和虚数$i$对应两个维度，但是在三维空间中无法用实数和两个虚数$i,j$来对应三个维度（无法用$3\times3$的矩阵表示）。

如果可以对应，那么三维的单位矩阵$I_3$，应该对应数字1，三维的负单位矩阵$I_3$，应该对应-1。因为$i^2=-1$，所以表示虚数$i$的矩阵的平方应该等于$-I_3$。

但是$-I_3$的行列式值为-1，根据行列式性质“乘积的行列式等于行列式的乘积”，那么表示虚数$i$的矩阵的行列式的平方，应该等于-1，即该矩阵的行列式值为i，这显然无法满足。

因此无法通过$3\times 3$的矩阵来表示三维三维的虚数。

数学家$William Hamilton$提出，可以通过四维的虚数来表示四维空间，即通过实数，和三个虚数$i,j,k$来表示。其中三个虚数满足：

$$\begin{aligned}
&i^{2}=j^{2}=k^{2}=-1\\
&i j=k, \quad j i=-k\\
&j k=i, \quad k j=-i\\
&k i=j, \quad i k=-j
\end{aligned}$$

而四元数就是一种形式的四维矩阵，即$[w,(x, y, z)]$可用来对应$w+x i+y j+z k$。

将四维的虚数用$4\times4$的矩阵表示有多个方法，以下为其中一种：

$$a \equiv\left[\begin{array}{llll}
a & 0 & 0 & 0 \\
0 & a & 0 & 0 \\
0 & 0 & a & 0 \\
0 & 0 & 0 & a
\end{array}\right]$$

$$i \equiv\left[\begin{array}{cccc}
0 & 0 & 0 & 1 \\
0 & 0 & -1 & 0 \\
0 & 1 & 0 & 0 \\
-1 & 0 & 0 & 0
\end{array}\right], \quad j \equiv\left[\begin{array}{cccc}
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1 \\
-1 & 0 & 0 & 0 \\
0 & -1 & 0 & 0
\end{array}\right], \quad k \equiv\left[\begin{array}{cccc}
0 & -1 & 0 & 0 \\
1 & 0 & 0 & 0 \\
0 & 0 & 0 & 1 \\
0 & 0 & -1 & 0
\end{array}\right]$$

结合可得：

$$w+x i+y j+z k \equiv\left[\begin{array}{cccc}
w & -z & y & x \\
z & w & -x & y \\
-y & x & w & z \\
-x & -y & -z & w
\end{array}\right]$$

可以发现，$k$矩阵的左上部分与二维空间中$i$的表达一模一样，于是猜测$k$矩阵也可以用来表达旋转，且是绕着$z$的旋转。使用三维向量$[1,0,1]$来测试。该向量如果用四元数表达，则为$[0 \quad (1,0,1)]$，即用实数表达为$i+k$。因为是绕着$z$轴旋转，所以$z$的变量不会变，$xy$变量的结果与二维空间旋转结果相同，即最后的正确结果应该是$(\cos \theta,\sin\theta,1)$，即$\cos\theta i +\sin\theta j+k$
那么相乘过程可以表示为：

$$\begin{aligned}
(\cos \theta+k \sin \theta)(i+k) &=i \cos \theta+k \cos \theta+k i \sin \theta+k^{2} \sin \theta \\
&=i \cos \theta+j \sin \theta+k \cos \theta-\sin \theta
\end{aligned}$$

可以看到结果根本就不是一个三维空间中的向量，因为$w$参数并不为0。这个结果中，$x,y$平面的答案是我们想要的，而$z,w$平面则不是。

如果对实数取共轭，即表达为$\cos\theta - k\sin \theta$，并且进行右乘，那么结果为：

$$(i+k)(\cos \theta-k \sin \theta)=i \cos \theta+j \sin \theta-k \cos \theta+\sin \theta$$

结果仍然不是一个三维空间中你的向量，$x,y$平面的结果不变，$z,w$平面的结果虽然不同，但是与之前的结果正好相反，所以尝试将两个表达式结合在一起，即

$$\begin{aligned}
&(\cos \theta+k \sin \theta)(i+k)(\cos \theta-k \sin \theta) \\
=&(i \cos \theta+j \sin \theta+k \cos \theta-\sin \theta)(\cos \theta-k \sin \theta) \\
=& i \cos ^{2} \theta-i k \cos \theta \sin \theta+j \sin \theta \cos \theta-j k \sin ^{2} \theta+k \cos ^{2} \theta-k^{2} \cos \theta \sin \theta-\sin \theta \cos \theta+k \sin ^{2} \theta \\
=& i \cos ^{2} \theta+j \cos \theta \sin \theta+j \sin \theta \cos \theta-i \sin ^{2} \theta+k \cos ^{2} \theta+\cos \theta \sin \theta-\sin \theta \cos \theta+k \sin ^{2} \theta \\
=& i \cos ^{2} \theta-i \sin ^{2} \theta+2 j \sin \theta \cos \theta+k \\
=& i \cos 2 \theta+j \sin 2 \theta+k
\end{aligned}$$

与正确结果$\cos\theta i +\sin\theta j+k$相比，$\theta$变为了$2\theta$。因此如果要用复数来表达旋转的话，式子应该改为$(\cos \theta /2+k \sin \theta /2)(i+k)(\cos \theta /2-k \sin \theta /2)$，即四元数应该表达为$\mathbf{q}=[\cos \theta /2 \quad \mathbf{\sin \theta/2k}]$，且上述式子对应的乘法表达式为$\mathbf{qpq^-1}$。

而这就是前几节中定义的用四元数来表示乘法的方法。

### Summary of Quaternions

这一节是总结上述描述中比较重要的概念。

1. 概念上来说，四元数可以用来表达绕着一个轴的旋转一定角度。
   其中四元数中的标量部分$w=\cos (\theta / 2)$，向量部分$\mathbf{v}=\hat{\mathbf{n}} \sin (\theta / 2)$。
   这种四元数称为旋转四元数，其模为1
2. 从几何角度来说，每个三维点的旋转，都有两种表达方式，且这两个表达方式互为对方的相反（不是逆），即$\mathbf{q}=\mathbf{-q}$
3. 单位四元数$[1 \quad \mathbf{0}]$和$[-1 \quad \mathbf{0}]$都表达没有旋转
4. 旋转四元数可以级联表示多个旋转（从右向做级联），表达式为$\mathbf{qpq^-1}$且可以通过求旋转四元数的逆来表示逆变换，且因为旋转四元数的模为1，所以旋转四元数的逆等于旋转四元数的共轭。
   
   但实际运用中，很少通过$\mathbf{qpq^-1}$计算旋转，更多的是使用矩阵。
5. 四元数的指数运算可以用来截取或者倍化四元数表示的旋转，但只能表示最短路径。
   旋转四元数常用来计算插值。


## Comparision of Methods

1. 欧拉角是最适合人直接理解的方法
2. 当需要进行空间转换时，必须是使用矩阵
3. 如果要大量的存储旋转信息，欧拉角，指数映射和四元数是比较理想的存储方式
4. 要实现可靠的插值运算，只能通过四元数
5. 只有四元数和矩阵运算可以实现旋转级联
6. 矩阵，指数映射，四元数都可以快速的求出逆运算
7. 如果要求角速度，或者其他要保留额外的旋转（有几次360°的旋转），只有轴角法或者指数映射表达可以实现。

## Converting between Representations

### Converting Euler Angles to Matrix

从欧拉角表达转到矩阵表达，存在不同情况下的不同矩阵。如一个场景中有普通物体和摄像机，用于表达普通物体旋转的矩阵与摄像机是不同的，普通物体是用`物体-直立坐标系的`矩阵表达，而摄像机为`直立到物体坐标系`的矩阵。

两个矩阵互为逆矩阵，所以在这里重点说明物体-直立坐标系的矩阵表达，直立到物体坐标系的矩阵可以通过取反快速得到。

欧拉角转换成矩阵表达的基本思想就是，将绕着三个轴的旋转拆分，各自表达为一个旋转矩阵，然后再级联，即得到了结果。

这里还存在的问题是，级联的顺序该如何定。如之前所述，关于欧拉角的表达分为传统欧拉旋转顺序（heading-pitch-row）和固定轴旋转顺序（row-pitch-heading）。这里用固定轴的旋转顺序进行旋转，否则的话在之前的轴旋转后，后续的轴就发生了变换。

又因为在左手坐标系下，乘法顺序是从左至右的，所以欧拉角在物体-直立坐标系矩阵中的表达式为：  

$$\mathbf{M}_{\text {object} \rightarrow \text {upright}}=\mathbf{B P H}$$

根据第五章中的内容，可以很容易的得到绕着每个轴旋转的矩阵

$$\begin{aligned}
&\mathbf{B}=\mathbf{R}_{z}(b)=\left[\begin{array}{ccc}
\cos b & \sin b & 0 \\
-\sin b & \cos b & 0 \\
0 & 0 & 1
\end{array}\right]\\
&\begin{array}{l}
\mathbf{P}=\mathbf{R}_{x}(p)=\left[\begin{array}{ccc}
1 & 0 & 0 \\
0 & \cos p & \sin p \\
0 & -\sin p & \cos p
\end{array}\right] \\
\mathbf{H}=\mathbf{R}_{y}(h)=\left[\begin{array}{ccc}
\cos h & 0 & -\sin h \\
0 & 1 & 0 \\
\sin h & 0 & \cos h
\end{array}\right]
\end{array}
\end{aligned}$$

结合得：

$$\begin{aligned}
\mathbf{M}_{o b j e c t \rightarrow u p r i g h t} &=\mathbf{B P H} \\
&=\left[\begin{array}{ccc}
\cos h \cos b+\sin h \sin p \sin b & \sin b \cos p & -\sin h \cos b+\cos h \sin p \sin b \\
-\cos h \sin b+\sin h \sin p \cos b & \cos b \cos p & \sin b \sin h+\cos h \sin p \cos b \\
\sin h \cos p & -\sin p & \cos h \cos p
\end{array}\right]
\end{aligned}$$

直立-物体坐标系的表达取逆即可：

$$\begin{aligned}
\mathbf{M}_{u p r i g h t \rightarrow o b j e c t} &=\mathbf{H}^{-1} \mathbf{P}^{-1} \mathbf{B}^{-1}=\mathbf{R}_{y}(-h) \mathbf{R}_{x}(-p) \mathbf{R}_{z}(-b) \\
&=\left[\begin{array}{ccc}
\cos h \cos b+\sin h \sin p \sin b & -\cos h \sin b+\sin h \sin p \cos b &\sin h \cos p \\
\sin b \cos p & \cos b \cos p &-\sin p\\
 -\sin h \cos b+\cos h \sin p \sin b &  \sin b \sin h+\cos h \sin p \cos b  &\cos h \cos p
\end{array}\right]
\end{aligned}$$

### Converting a Matrix to Euler angles

1. 从矩阵转换到欧拉角，首先要确认矩阵表达的是什么形式的旋转，物体-直立坐标系，还是直立-物体坐标系。
2. 矩阵转换到到欧拉角后返回的结果是标准坐标，即heading和bank的范围为$\left(-180^{\circ},+180^{\circ}\right]$，pitch的范围是$\left[-90^{\circ},+90^{\circ}\right]$
3. 这节中方法默认给的矩阵是合法的旋转矩阵。

首先是将物体-直立坐标系的矩阵转换为欧拉角，矩阵如下所示：

$$\left[\begin{array}{ccc}
\cos h \cos b+\sin h \sin p \sin b & \sin b \cos p & -\sin h \cos b+\cos h \sin p \sin b \\
-\cos h \sin b+\sin h \sin p \cos b & \cos b \cos p & \sin b \sin h+\cos h \sin p \cos b \\
\sin h \cos p & -\sin p & \cos h \cos p
\end{array}\right]$$

从元素$m_{32}=-\sin p$中可以直接求出pitch角度,$\arcsin \left(-m_{32}\right)=p$。
C标准库中的$asin()$函数返回的数值范围为$[-\pi / 2,+\pi / 2]$，正好符合标准坐标对于pitch角度的范围要求。所以为：

$$
p=\operatorname{asin}(-m_{32})
$$

求heading和roll角度时，要考虑万向锁的问题，即当pitch角度为正负90°的情况。

首先如果不是万向锁的情况，那么可以根据元素$m_{31}=\sin h \cos p$和元素$m_{33}=\cos h \cos p$求出，

即

$$h=\operatorname{atan2} (\sin h, \cos h)=\operatorname{atan2} \left(m_{31} / \cos p, m_{33} / \cos p\right)$$

因为pitch角度不为$\pm 90 ^{\circ}$，所以$\cos p$不为0，且可以约分，即

$$h=\operatorname{atan2} \left(m_{31}, m_{33}\right)$$

C标准库中的$atan2()$函数表示进行$\arctan$c操作（2为函数名的一部分，并不是乘2），范围是$$[-\pi,+\pi]$$，同样符合标准坐标的范围。

类似的在非万向锁情况下，可以通过元素$m_{12}=\sin b \cos p$和元素$m_{22}=\cos b \cos p$求出roll角度，即

$$\begin{aligned}
b &=\operatorname{atan2} (\sin b, \cos b)=\operatorname{atan2} \left(m_{12} / \cos p, m_{22} / \cos p\right) \\
&=\operatorname{atan2} \left(m_{12}, m_{22}\right)
\end{aligned}$$

而在万向锁的情况下，因为$p=\pm 90^{\circ}，即$$\cos p=0$，所以无法将$\cos p$作为分母。而且此时，heading角度和roll角度的旋转是相同效果的。

在万向锁情况下，限定roll角度为0，即$b=0, \sin b =0 \cos b=1$，此时通过元素$m_{11}=\cos h \cos b+\sin h \sin p \sin b$和元素$m_{13}=-\sin h \cos b+\cos h \sin p \sin b$来求得heading角度。

将$\cos b=1, \sin p=1, \sin b=0$，带入得

$$
m_{11}=\cos h \quad m_{13}=-\sin h
$$

即

$$h=\operatorname{atan2} \left(-m_{13}, m_{11}\right)$$


直立-物体坐标系的矩阵到欧拉角的转换雷同，矩阵为：

$$
\left[\begin{array}{ccc}
\cos h \cos b+\sin h \sin p \sin b & -\cos h \sin b+\sin h \sin p \cos b &\sin h \cos p \\
\sin b \cos p & \cos b \cos p &-\sin p\\
 -\sin h \cos b+\cos h \sin p \sin b &  \sin b \sin h+\cos h \sin p \cos b  &\cos h \cos p
\end{array}\right]
$$

欧拉角计算方法为

$$
p=\operatorname{asin}(-m_{23})
$$

当非万向锁时，即$p\neq \pm 90^{\circ}$时，有：

$$
h=\operatorname{atan2} \left(m_{13}, m_{33}\right) \\
b=\operatorname{atan2} \left(m_{21}, m_{22}\right)
$$

当万向锁时，即$p= \pm 90^{\circ}$时，有：

$$
b=0 \\
h=\operatorname{atan2} \left(m_{31}, m_{11}\right)
$$

//TODO

书中给出从欧拉角转换为物体-直立坐标系矩阵的代码

### Converting a Quaternion to a Matrix

因为旋转四元数表达的是绕着任意轴$\hat{n}$旋转$\theta$，而这个同样可以通过矩阵表达，即第五章中得出的：

$$\left[\begin{array}{ccc}
n_{x}^{2}(1-\cos \theta)+\cos \theta & n_{x} n_{y}(1-\cos \theta)+n_{z} \sin \theta & n_{x} n_{z}(1-\cos \theta)-n_{y} \sin \theta \\
n_{x} n_{y}(1-\cos \theta)-n_{z} \sin \theta & n_{y}^{2}(1-\cos \theta)+\cos \theta & n_{y} n_{z}(1-\cos \theta)+n_{x} \sin \theta \\
n_{x} n_{z}(1-\cos \theta)+n_{y} \sin \theta & n_{y} n_{z}(1-\cos \theta)-n_{x} \sin \theta & n_{z}^{2}(1-\cos \theta)+\cos \theta
\end{array}\right]$$

而转换四元数到矩阵的思路，就是用四元数的四个元素来取代上面矩阵中的元素，四元数的四个元素分别表示为：

$$\begin{array}{l}
w=\cos (\theta / 2) \\
x=n_{x} \sin (\theta / 2) \\
y=n_{y} \sin (\theta / 2) \\
z=n_{z} \sin (\theta / 2)
\end{array}$$

通过观察绕任意轴旋转的矩阵可以发现，对角线元素的表达方式是一种类型，非对角线元素的表达方式是另一种类型。因此，只要分别求出一个对角线元素的转换和一个非对角线元素的转换，其他的元素都可以类比得到。

首先求对角线元素$m_{11}$，通过等式代换可以转换为四元数中的元素，如下：

$$\begin{aligned}
m_{11} &=n_{x}^{2}(1-\cos \theta)+\cos \theta \\
&=n_{x}^{2}-n_{x}^{2} \cos \theta+\cos \theta \\
&=1-1+n_{x}^{2}-n_{x}^{2} \cos \theta+\cos \theta \\
&=1-\left(1-n_{x}^{2}+n_{x}^{2} \cos \theta-\cos \theta\right) \\
&=1-\left(1-\cos \theta-n_{x}^{2}+n_{x}^{2} \cos \theta\right) \\
&=1-\left(1-n_{x}^{2}\right)(1-\cos \theta)
\end{aligned}$$

根据倍角公式，可以进一步拆分$\cos \theta$：

$$\begin{aligned}
\cos 2 \alpha &=1-2 \sin ^{2} \alpha \\
\cos \theta &=1-2 \sin ^{2}(\theta / 2)
\end{aligned}$$

带入上述得：

$$\begin{aligned}
m_{11} &=1-\left(1-n_{x}^{2}\right)(1-\cos \theta) \\
&=1-\left(1-n_{x}^{2}\right)\left(1-\left(1-2 \sin ^{2}(\theta / 2)\right)\right) \\
&=1-\left(1-n_{x}^{2}\right)\left(2 \sin ^{2}(\theta / 2)\right)
\end{aligned}$$

因为$\hat{\mathbf{n}}$是一个单位向量，所以有$n_{x}^{2}+n_{y}^{2}+n_{z}^{2}=1$，带入上式可继续代换得：

$$\begin{aligned}
m_{11} &=1-\left(1-n_{x}^{2}\right)\left(2 \sin ^{2}(\theta / 2)\right) \\
&=1-\left(n_{y}^{2}+n_{z}^{2}\right)\left(2 \sin ^{2}(\theta / 2)\right) \\
&=1-2 n_{y}^{2} \sin ^{2}(\theta / 2)-2 n_{z}^{2} \sin ^{2}(\theta / 2) \\
&=1-2 y^{2}-2 z^{2}
\end{aligned}$$

可类比得到其他得对角线元素
$$
m_{22}=1-2x^2-2z^2 \\
m_{33}=1-2x^2-2y^2
$$

在求非对角线元素$m_{12}$，同样是通过等式代换，首先根据倍角公式可得：

$$\begin{aligned}
&\sin 2 \alpha=2 \sin \alpha \cos \alpha\\
&\sin \theta=2 \sin (\theta / 2) \cos (\theta / 2)
\end{aligned}$$

与之前的$\cos$的倍角公式结果一起带入$m_{12}$，得

$$\begin{aligned}
m_{12} &=n_{x} n_{y}(1-\cos \theta)+n_{z} \sin \theta \\
&=n_{x} n_{y}\left(1-\left(1-2 \sin ^{2}(\theta / 2)\right)\right)+n_{z}(2 \sin (\theta / 2) \cos (\theta / 2)) \\
&=n_{x} n_{y}\left(2 \sin ^{2}(\theta / 2)\right)+2 n_{z} \sin (\theta / 2) \cos (\theta / 2) \\
&=2\left(n_{x} \sin (\theta / 2)\right)\left(n_{y} \sin (\theta / 2)\right)+2 \cos (\theta / 2)\left(n_{z} \sin (\theta / 2)\right) \\
&=2 x y+2 w z
\end{aligned}$$

类比可得其他的非对角元素，如：

$m_{13}=2xz-2wy$

最终转换为的矩阵为:

$$\left[\begin{array}{ccc}
1-2 y^{2}-2 z^{2} & 2 x y+2 w z & 2 x z-2 w y \\
2 x y-2 w z & 1-2 x^{2}-2 z^{2} & 2 y z+2 w x \\
2 x z+2 w y & 2 y z-2 w x & 1-2 x^{2}-2 y^{2}
\end{array}\right]$$

### Converting a Matrix to a Quaternion

矩阵转换为四元数的主要思路是通过组合矩阵中的元素来获得四元数四个元素的表达。而矩阵中的对角线元素，不包含两个不同四元数元素的乘积，所以通过矩阵的对角线元素来计算：

如累加三个对角元素，得：

$$\begin{aligned}
m_{11}+m_{22}+m_{33}
&=\left(1-2 y^{2}-2 z^{2}\right)+\left(1-2 x^{2}-2 z^{2}\right)+\left(1-2 x^{2}-2 y^{2}\right) \\
&=3-4\left(x^{2}+y^{2}+z^{2}\right) \\
&=3-4\left(1-w^{2}\right) \\
&=4 w^{2}-1
\end{aligned}$$

同样可得：

$$\begin{aligned}
m_{11}-m_{22}-m_{33} &=\left(1-2 y^{2}-2 z^{2}\right)-\left(1-2 x^{2}-2 z^{2}\right)-\left(1-2 x^{2}-2 y^{2}\right) \\
&=4 x^{2}-1 \\
-m_{11}+m_{22}-m_{33} &=-\left(1-2 y^{2}-2 z^{2}\right)+\left(1-2 x^{2}-2 z^{2}\right)-\left(1-2 x^{2}-2 y^{2}\right) \\
&=4 y^{2}-1 \\
-m_{11}-m_{22}+m_{33} &=-\left(1-2 y^{2}-2 z^{2}\right)-\left(1-2 x^{2}-2 z^{2}\right)+\left(1-2 x^{2}-2 y^{2}\right) \\
&=4 z^{2}-1
\end{aligned}$$

因此：

$$\begin{aligned}
&w=\frac{\sqrt{m_{11}+m_{22}+m_{33}+1}}{2}\\
&x=\frac{\sqrt{m_{11}-m_{22}-m_{33}+1}}{2}\\
&y=\frac{\sqrt{-m_{11}+m_{22}-m_{33}+1}}{2}\\
&z=\frac{\sqrt{-m_{11}-m_{22}+m_{33}+1}}{2}
\end{aligned}$$

但这个计算方式的问题在于，因为是通过根号求得结果，所以四个元素的结果都是正数。在四元数中，$\mathbf{q}$和$\mathbf{-q}$表达的是相同的元素，所以单一的元素到底是正数还是负数没有关系，只要其他的元素相应变化就可以，但是所有的元素都一定是正数会造成问题。

根据非对角元素的组合可得：

$$\begin{aligned}
&m_{12}+m_{21}=(2 x y+2 w z)+(2 x y-2 w z)=4 x y\\
&\begin{array}{l}
m_{12}-m_{21}=(2 x y+2 w z)-(2 x y-2 w z)=4 w z \\
m_{31}+m_{13}=(2 x z+2 w y)+(2 x z-2 w y)=4 x z \\
m_{31}-m_{13}=(2 x z+2 w y)-(2 x z-2 w y)=4 w y \\
m_{23}+m_{32}=(2 y z+2 w x)+(2 y z-2 w x)=4 y z \\
m_{23}-m_{32}=(2 y z+2 w x)-(2 y z-2 w x)=4 w x
\end{array}
\end{aligned}$$

用之前的根号求解出一个元素数值，然后通过这些表达式，就可以求出正确的答案，即如下表达式的四选一：

$$\begin{aligned}
&w=\frac{\sqrt{m_{11}+m_{22}+m_{33}+1}}{2} \Longrightarrow x=\frac{m_{23}-m_{32}}{4 w} \quad y=\frac{m_{31}-m_{13}}{4 w} \quad z=\frac{m_{12}-m_{21}}{4 w}\\
&x=\frac{\sqrt{m_{11}-m_{22}-m_{33}+1}}{2} \Longrightarrow w=\frac{m_{23}-m_{32}}{4 x} \quad y=\frac{m_{12}+m_{21}}{4 x} \quad z=\frac{m_{31}+m_{13}}{4 x}\\
&y=\frac{\sqrt{-m_{11}+m_{22}-m_{33}+1}}{2} \Longrightarrow w=\frac{m_{31}-m_{13}}{4 y} \quad x=\frac{m_{12}+m_{21}}{4 y} \quad z=\frac{m_{23}+m_{32}}{4 y}\\
&z=\frac{\sqrt{-m_{11}-m_{22}+m_{33}+1}}{2} \Longrightarrow w=\frac{m_{12}-m_{21}}{4 z} \quad x=\frac{m_{31}+m_{13}}{4 z} \quad y=\frac{m_{23}+m_{32}}{4 z}
\end{aligned}$$

新问题是，如何决定取哪一个元素用根号求解？

通常的做法是先计算出每个元素的平方值，然后用平方值最大的元素开根，再通过结果求解其他值。

//TODO

书中给出从矩阵转换到欧拉角的代码

### Converting Euler Angles to a Quaternion

如同欧拉角转换为矩阵一样，欧拉角转换到四元数也一样要考虑两种情况，`物体-直立四元数`和`直立-物体四元数`。因为两者相互取共轭就能转换，所以这里主要讨论`物体-直立四元数`。

四元数的转换，如矩阵的转换类似，同样是通过求每个轴的四元数表达，然后级联得到。其中每个每个轴的旋转四元数为：

$$\mathbf{h}=\left[\begin{array}{c}\cos (h / 2) \\
\left(\begin{array}{c}
0 \\
\sin (h / 2) \\
0 \end{array}\right) \end{array}\right],  \quad \mathbf{p}= \left[\begin{array}{c} \cos (p / 2) \\
\left(\begin{array}{c} \sin (p / 2) \\
0 \\ 0 \end{array}\right) \end{array}\right], 
\quad \mathbf{b}= \left[\begin{array}{c} \cos (b / 2) \\
\left(\begin{array}{c} 0 \\
0 \\ \sin (p / 2)  \end{array}\right) \end{array}\right]$$

而且同样是通过固定轴，即计算顺序为$roll-pitch-heading$。但不同的是四元数的乘法结合顺序是从右到左的。因此结合的结果如下：

$$\begin{array}{l} \mathbf{q}_{object \rightarrow upright}(h, p, b)=\mathbf{hpb} \\ 
=\left[\begin{array}{c} \cos (h / 2) \\
\left(\begin{array}{c}0 \\ \sin (h / 2) \\
0 \end{array}\right) \end{array}\right]
\left[\begin{array}{c} \cos (p / 2) \\
\left(\begin{array}{c}\sin (p / 2) \\0 \\ 0
\end{array}\right) \end{array}\right]
\left[\begin{array}{c} \cos (b / 2) \\
\left(\begin{array}{c}0 \\0 \\ \sin (b / 2)
\end{array}\right) \end{array}\right] \\
=\left[\begin{array}{c} \cos (h / 2) \cos (p / 2) \\
\left(\begin{array}{c} \cos (h / 2) \sin (p / 2) \\
\sin (h / 2) \cos (p / 2) \\
-\sin (h / 2) \sin (p / 2) \end{array}\right) \end{array}\right]
\left[\begin{array}{c} \cos (b / 2) \\
\left(\begin{array}{c} 0 \\
0 \\
\sin (b / 2) \end{array}\right) \end{array}\right] \\
=\left[\begin{array}{c} \cos (h / 2) \cos (p / 2) \cos (b / 2)+\sin (h / 2) \sin (p / 2) \sin (b / 2) \\
\left(\begin{array}{c} \cos (h / 2) \sin (p / 2) \cos (b / 2)+\sin (h / 2) \cos (p / 2) \sin (b / 2) \\
\sin (h / 2) \cos (p / 2) \cos (b / 2)-\cos (h / 2) \sin (p / 2) \sin (b / 2) \\
\cos (h / 2) \cos (p / 2) \sin (b / 2)-\sin (h / 2) \sin (p / 2) \cos (b / 2) \end{array}\right) \end{array}\right]
\end{array}
$$

直立坐标系到空间坐标系的四元数为：

$$\begin{array}{l}
\mathbf{q}_{upright \rightarrow object}(h, p, b)
= \mathbf{q}_{object \rightarrow upright }(h, p, b)^{*} \\
=\left[\begin{array}{c}
\cos (h / 2) \cos (p / 2) \cos (b / 2)+\sin (h / 2) \sin (p / 2) \sin (b / 2) \\
\left(\begin{array}{c} -\cos (h / 2) \sin (p / 2) \cos (b / 2)-\sin (h / 2) \cos (p / 2) \sin (b / 2) \\
\cos (h / 2) \sin (p / 2) \sin (b / 2)-\sin (h / 2) \cos (p / 2) \cos (b / 2) \\
\sin (h / 2) \sin (p / 2) \cos (b / 2)-\cos (h / 2) \cos (p / 2) \sin (b / 2)
\end{array}\right) 
\end{array}\right]
\end{array}$$

### Converting a Quaternion to Euler Angles

首先讨论从物体-直立四元数转换为欧拉角的方法。

之前已经求出了如何从矩阵转换为欧拉角，如下所示：

$$\begin{array}{lll}
p & =\arcsin \left(-m_{32}\right) \\
h & =\left\{\begin{array}{ll}
\operatorname{atan2}\left(m_{31}, m_{33}\right) & \text { if } \cos p \neq 0 \\
\operatorname{atan2}\left(-m_{13}, m_{11}\right) & \text { otherwise }
\end{array}\right. \\
b & =\left\{\begin{array}{ll}
\operatorname{atan2}\left(m_{12}, m_{22}\right) & \text { if } \cos p \neq 0 \\
0 & \text { otherwise }
\end{array}\right.
\end{array}$$

同样求出了矩阵中的元素，如何用四元数中的元素表达，如下：

$$\begin{aligned}
m_{11}=1-2 y^{2}-2 z^{2}, \quad & m_{12}=2 x y+2 w z, \quad m_{13}=2 x z-2 w y, \\
& m_{22}=1-2 x^{2}-2 z^{2} \\
m_{31}=2 x z+2 w y, \quad & m_{32}=2 y z-2 w x, \quad m_{33}=1-2 x^{2}-2 y^{2}
\end{aligned}$$

将两者结合就能得到四元数转换为欧拉角的方法：

$$\begin{aligned}
p &=\arcsin \left(-m_{32}\right) \\
&=\arcsin (-2(y z-w x))
\end{aligned}$$

$$h=\left\{\begin{array}{ll}
\operatorname{atan2} \left(m_{31}, m_{33}\right) \\
=\operatorname{atan2} \left(2 x z+2 w y, 1-2 x^{2}-2 y^{2}\right) & \text { if } \cos p \neq 0 \\
=\operatorname{atan2} \left(x z+w y, 1 / 2-x^{2}-y^{2}\right) \\
\operatorname{atan2}\left(-m_{13}, m_{11}\right) \\
=\operatorname{atan2}\left(-2 x z+2 w y, 1-2 y^{2}-2 z^{2}\right) & \text { otherwise } \\
=\operatorname{atan2}\left(-x z+w y, 1 / 2-y^{2}-z^{2}\right)
\end{array}\right.$$

$$b=\left\{\begin{array}{ll}
\operatorname{atan} 2\left(m_{12}, m_{22}\right) & \text { if } \cos p \neq 0 \\
=\operatorname{atan} 2\left(2 x y+2 w z, 1-2 x^{2}-2 z^{2}\right) & \\
=\operatorname{atan} 2\left(x y+w z, 1 / 2-x^{2}-z^{2}\right)
\\
0 & otherwise
\end{array}\right.$$

从直立-物体四元数转换为欧拉角，只需要将$x,y,z$三个元素取反即可，因为直立-物体四元数是物体-直立四元数的共轭，即

$$\begin{aligned}
p &=\arcsin \left(-m_{32}\right) \\
&=\arcsin (-2(y z+w x))
\end{aligned}$$

$$h=\left\{\begin{array}{ll}
\operatorname{atan2} \left(m_{31}, m_{33}\right) \\
=\operatorname{atan2} \left(2 x z-2 w y, 1-2 x^{2}-2 y^{2}\right) & \text { if } \cos p \neq 0 \\
=\operatorname{atan2} \left(x z-w y, 1 / 2-x^{2}-y^{2}\right) \\
\operatorname{atan2}\left(-m_{13}, m_{11}\right) \\
=\operatorname{atan2}\left(-2 x z-2 w y, 1-2 y^{2}-2 z^{2}\right) & \text { otherwise } \\
=\operatorname{atan2}\left(-x z-w y, 1 / 2-y^{2}-z^{2}\right)
\end{array}\right.$$

$$b=\left\{\begin{array}{ll}
\operatorname{atan} 2\left(m_{12}, m_{22}\right) & \text { if } \cos p \neq 0 \\
=\operatorname{atan} 2\left(2 x y-2 w z, 1-2 x^{2}-2 z^{2}\right) & \\
=\operatorname{atan} 2\left(x y-w z, 1 / 2-x^{2}-z^{2}\right)
\\
0 & otherwise
\end{array}\right.$$

//TODO

书中给出了四元数到欧拉角的转换的代码

{% note primary %}

引用：

1. *3D Math Primer for Graphics and Game Development* 2nd 2011 

{% endnote %}

***