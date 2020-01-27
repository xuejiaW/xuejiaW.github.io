---
title: 《算法导论》 第十五章笔记
mathjax: true
categories:
  - 读书笔记
  - 数据结构与算法
tags:
  - 读书笔记
  - 数据结构与算法
date: 2019-11-26 13:51:03
---

{% cq %}

《算法导论》 第十五章笔记，介绍动态规划的概念及一些运用了动态规划的算法。

15.4及15.5节尚未整理

{% endcq %}

<!--more-->

# Chapter 15. Dynamic Programming

动态规划(Dynamic Programming)如分治法(divide-and-conquer method)一样都是通过组合子问题的解答来解决问题。两者的区别在于：

1. 分治法的子问题是互相独立的，不存在重叠
2. 动态规划的子问题是相互重叠的，不同的子问题可能存在重叠子问题。若对于每个子问题都求解一次，则会出现重复计算

动态规划常被用来解决最优问题（optimization problems），这种问题通常有许多可能的解答，动态规划的目标是求得一个最优解（通常是众多解答中的最大值或最小值）。

动态规划的步骤如下：

1. 找到最优解的结构
2. 递归定义最优解的值
3. 计算出最优解的值，通常是通过一个自下而上的递归方式解决
4. 使用计算得出的数据构建出最优解

步骤1-3是动态规划解决问题的基础，如果只需要求得最优解的值而非最优解本身，可以忽略步骤4。

## Rod cutting

钢条切割问题(Rod cutting)是假设存在一个钢条，切割成不同长度可以卖不同的钱，设切割出的长度为$i$，对应这一段长度的卖价为$P_i$。假设钢条长度从1-10的卖价如下

| 长度 | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ---- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 价格 | 1   | 5   | 8   | 9   | 10  | 17  | 17  | 20  | 24  | 30  |


一段长度为$i$的钢条，一共有$2^{n-1}$个切割方法。因为将长度为$i$的钢条看作是有$i$个长度为1的结点进行分类，一共有$n-1$个连接点，每个连接点都可以选择切或者不切，所以有$2^{n-1}$个可能。

* 如有3个结点，1-2的切分和2-1的切分看作是两种可能。

设一段钢条在卖价最大化的情况下要切分成$k$块，则总长度为$n$的钢条可以表示为 $n=i_1+i_2+...+i_k$，最大化的总价为为$r_n$，可表示为$r_n=p_{i_1}+p_{i_2}+...+p_{i_k}$

对于上面假设的卖价，对应钢条的长度从1-10，各自的最佳卖价和切割方法如下

* 如切割方式$2+2$表示写成两半，一块为长度为2，另一块也为2.如果切割方式与总长度相同，如都为3,则表示不切割即为最佳切割方式。

| 钢条总长度 | 最大化卖价 | 最佳切割方式 |
| ---------- | ---------- | ------------ |
| 1          | 1          | 1            |
| 2          | 5          | 2            |
| 3          | 8          | 3            |
| 4          | 10         | 2+2          |
| 5          | 13         | 2+3          | p |
| 6          | 17         | 6            |
| 7          | 18         | 1+6 / 2+2+3  |
| 8          | 22         | 2+6          |
| 9          | 25         | 3+6          |
| 10         | 30         | 10           |

* 表格中的最佳切割方式是钢条切割问题的最佳解，而最大化卖价是最佳切割方式的数值。

可以把求得$r_n$，即整个钢条的最大化过程看作先切割一刀，这时候钢条变成了两部分，左部分就不再动了，对右部分继续切割，找到右部分的最佳切割方式，即对右部分求最佳解。数学可表示为

$$
r_n= \max_{1\leq i \leq n}(p_i + r_{n-i})
$$

这就是钢条切割问题的最佳解结构：整个问题的最佳解是与子问题的最佳解相关的。如上式中，最佳解的值是依赖于子问题的最佳解的值得到的。

### 递归解法

递归解法的伪代码如下，这个方法就是对式子$r_n=\max_{1\leq i \leq n}(p_i + r_{n-i})$的实现

```pseudocode
CUT-ROD(p,n)
if n == 0
    return 0

q = -MAX
for i = 1 to n
    q = max (q, p[i] + CUT-ROD(p,n-i))
return q
```
但这个运算是非常低效的，因为它存在许多的重复计算，如对于$n=4$，算法会在循环中分别以$n=0,n=1,n=2,n=3$调用CUT-ROD算法，而在以$n=3$调用时又会在循环中以$n=0,n=1,n=2$调用，这就造成了重复运算。调用时的计算如下图

![递归解法图解](IA-Chapter15-Notes/2020-01-20-02-17-36.png)

图中的每个结点表示一次调用，结点中的数值表示$n$的取值，可以看到有非常多重复的结点。

设$T(n)$为该算法的执行时间，可以表示为

$$
T(n)= 1 + \sum _{i=1}^{n} T(n-i)
$$

可取$j=n-1$，将式子转换为

$$
T(n)= 1 + \sum _{j=0}^{n-1} T(j)
$$

可通过数学归纳法证明该式子的时间复杂度为$T(n)=2^n$，是一个指数型增长的式子，所以该算法的效率十分低下。

$T(n)=1 + \sum _{j=0}^{n-1} T(j)=2^n$的证明如下：

1. 当n=0时$T(0)=2^0=1$，满足式子，得证
2. 当n>0时
   $$
   T(n)=1+\sum _{j=0}^{n-1} 2^{j} \\\\
   =1 + 2^0 \cdot \frac{1-2^{n}}{1-2} \\\\
   = 1 + (2^n -1) \\\\
   = 2^n
   $$

    满足原式子，得证。

递归解法的c++实现如下:

```c++
int CutRod(int* priceTable, int rodLength)
{
	if (rodLength == 0)
		return 0;

	int price = INT_MIN;
	for (int i = 1; i <= rodLength; i++) //cut from 1 to length(equals to no cuts)
	{
		int tempPrice = priceTable[i] + CutRod(priceTable, rodLength - i);
		if (tempPrice > price)
			price = tempPrice;
	}
	return price;
}
```

### using dynamic programming for optimal rod cutting

在上一节的递归算法中，因为大量重复的计算导致了算法的低效。在动态规划的解法中，实际上是通过将计算过的子问题的解存储下来，之后再次遇到直接返回结果即可，所以动态规划本质上是一个空间与时间的权衡(time-memory trade-off)。

通过动态规划，基本可以将一个时间复杂度为指数型的算法（如$2^n$）转换为一个多项式型的算法（如$n^2$）

动态规划一般有两种解法，一种是`自顶向下备忘录法（top-down with memoization）`，一种是`自底而上法(bottom-up method)`。下面会以钢铁切割问题分别说明两种方法：

1. 自顶向下备忘录法

    这种方法与之前的递归法结构几乎相同，也是严格按照动态规划解法的定义，即将运算过的子问题答案记录下来。切割钢条问题使用自顶向下的备忘录法伪代码如下：

    ```pseudocode
    MEMOIZED-CUT-ROD(p,n):

    r = new array[n+1]
    for i =0 to n
        r[i] = -MAX
    return MEMOIZED-CUT-ROD-AUX(p,r,n)

    MEMOIZED-CUT-ROD-AUX(p,r,n):

    if r[n] > 0 //means there are record for this subproblem
        return r[n]
    if n == 0
        q = 0
    else
        q = -MAX
        for i = 1 to n
        q = max (q, p[i] + MEMOIZED-CUT-ROD-AUX(p,r,n-i))
    r[n] = q
    return q
    ```

    `MEMOIZED-CUT-ROD`主要功能是初始化一个数组$r$，这个数组存储了所有计算过的子问题的答案，`MEMOIZED-CUT-ROD-AUX`实际对应之前的递归算法`CUTROD`，不同点只是当发现答案记录过就直接返回。

    c++ 代码如下:
    
    ```c++
    int MemoizedCutRod(int* priceTable, int rodLength)
    {
        //create an array from 0 to rodLength, array length is (rodLength+1)
        //array[0] = 0, array[rodLength] means the max PriceMemo for rod of rodLength
        int* maxPriceMemo = new int[rodLength + 1];
        for (int i = 0; i < rodLength + 1; i++)
        {
            maxPriceMemo[i] = INT_MIN;
        }

        int maxPrice = MemoizedCutRodAux(priceTable, maxPriceMemo, rodLength);

        //for (int i = 1; i < rodLength + 1; i++)
        //{
        //    cout << "Max price for " << i << " is " << maxPriceMemo[i] << endl;
        //}
        return maxPrice;
    }

    int MemoizedCutRodAux(int* priceTable, int* maxPriceMemo, int rodLength)
    {
        if (maxPriceMemo[rodLength] > 0)//has record
            return maxPriceMemo[rodLength];

        int price = INT_MIN;
        if (rodLength == 0)
            price = 0;
        else
            for (int i = 1; i <= rodLength; i++)
            {
                int tempPrice = priceTable[i] + MemoizedCutRodAux(priceTable, maxPriceMemo, rodLength - i);
                if (tempPrice > price)
                    price = tempPrice;
            }

        maxPriceMemo[rodLength] = price;
        return price;
    }
    ```

    `priceTable`表示不同长度的钢条的价格数组，初始化定义为：

    ```c++
    int priceTable[] = { 0,1,5,8,9,10,17,17,20,24,30 };
    ```

    注意这里的数组长度都为$rodLength+1$，这是为了将长度与Index对齐，如长度为1的钢板的最大售价，则使用$maxPriceMemo[1]$即可。

2. 自底而上法

    自底而上法形式上更为简单，但它利用了动态规划的一个特性：较大的子问题包含较小的子问题。

    因此如果从最小的子问题开始解决，那么在解决后面更大的子问题时，它所依赖的所有小子问题都已经有了解答，也就不需要像自顶向下备忘法那样去检查是否子问题已经有了答案。

    所以如果要求长度为$n$的钢条的最大售价，只要从长度为1开始求起，依次求到长度为$n$

    伪代码如下：

    ```pseucode
    BOTTOM-UP-CUT-ROD(p,n)

    r = new array[n+1]
    for i =0 to n
        r[i] = -MAX
    r[0] = 0

    for i = 1 to n
        q = -MAX
        for j = 1 to i
            q = MAX(q , p[j] + r[i-j])
        r[i]=q

    return r[n]
    ```
    c++代码如下：

    ```c++
    int BottomUpCutRod(int* priceTable, int rodLength)
    {
        //Init for maxPriceMemo
        int* maxPriceMemo = new int[rodLength + 1];
        for (int i = 0; i < rodLength + 1; i++)
        {
            maxPriceMemo[i] = INT_MIN;
        }

        maxPriceMemo[0] = 0;

        //Calculate the MaxPriceMemo for length from 1 to length
        for (int i = 1; i <= rodLength; i++)
        {
            //Calculate cutRod for length = i
            int price = INT_MIN;

            for (int j = 1; j <= i; j++)
            {
                int tempPrice = priceTable[j] + maxPriceMemo[i - j];
                if (tempPrice > price)
                    price = tempPrice;
            }

            maxPriceMemo[i] = price;
        }

        for (int i = 1; i < rodLength + 1; i++)
        {
            cout << "Max price for " << i << " is " << maxPriceMemo[i] << endl;
        }

        return maxPriceMemo[rodLength];
    }
    ```

两个方法的时间复杂度实际上都是$\Theta(n^2)$。`BOTTOM-UP-CUT-ROD`中因为有个双重循环，所以时间复杂度为$\Theta(n^2)$，`MemoizedCutRod`中虽然只有一个循环，但在每次的循环中，可能会递归调用并需要解决子问题，子问题并不会重复调用，因此一共解决$n$个子问题，循环加上解决子问题的时间可得到时间复杂度同样为$\Theta(n^2)$。

虽然两个方法的时间复杂度都是$\Theta(n^2)$，但是`BOTTOM-UP-CUT-ROD`在实际使用中因为减少了函数的递归调用时间，所以更为高效。

### Subproblem graphs

子问题图（subproblem graphs）是一个有向图，每一个顶点都对应一个子问题。如果代表子问题$x$的结点指向代表子结点$y$的结点，则说明$x$问题的解依赖于$y$。

子问题图如下,它可以看作是表示递归解法的图的精简版，删除了所有重复的点，也表示子问题并不会被重复的计算：

![子问题图](IA-Chapter15-Notes/2019-11-19-19-33-22.png)

子问题图可以用来获知动态规划问题的时间复杂度，因为图中的一个结点表示一个子问题，图中连接结点的边表示用来组合两个子问题答案的时间，因此用来解决整个动态规划问题的时间基本上与子问题图的顶点数+边数是呈线性关系的。

### Reconstructing a solution

上面的所有关于钢条切割问题的算法都只计算了钢条的最大售价（最佳解的值），而对于这个问题真正的解，如何切割钢条（最后钢条要切成几块，每块多长），并没有得出。所以上面的所有步骤都只完成了解动态规划问题四步骤的前三步。

为了得到最佳解需要对上面的步骤进行调整，调整有非常简单，在计算中再多保留一些数据即可。

以自底向上的`BOTTOM-UP-CUT-ROD`为例，在算法中，在算法中用了`p[j] + r[i-j]`来表示第一刀砍的长度$j$与剩下部分$i-j$。在售价最大的情况下，记录下第一刀砍的长度$j$即能获得动态规划的最佳解，因为在每一次的循环中，都将当前长度下第一刀砍的长度保存了下来，那么在剩下的长度越来越小的过程中，整个切割过程的每一刀长度都被记录了下来。

伪代码如下，这里的数组$s$即为记录第一刀长度的数组：

```pseudocde
EXTENDED-BOTTOM-UP-CUT-ROD(p,n)

r = new array[n+1]
s = new array[n+1]

for i =0 to n
    r[i] = -MAX
r[0] = 0

for i = 1 to n
    q = -MAX
    for j = 1 to i
        q = MAX(q , p[j] + r[i-j])
    r[i]=q
    s[i]=j

return s and s
```

c++代码如下，形参中的`cutLength`即表示不同长度下第一刀要砍的距离：

```c++
void ExtendedBottomUpCutRod(int* priceTable, int rodLength, int* maxPriceMemo, int* cutLength)
{
	for (int i = 0; i < rodLength + 1; i++)
	{
		maxPriceMemo[i] = INT_MIN;
	}

	maxPriceMemo[0] = 0;

	//Calculate the MaxPriceMemo for length from 1 to length
	for (int i = 1; i <= rodLength; i++)
	{
		//Calculate cutRod for length = i
		int price = INT_MIN;

		for (int j = 1; j <= i; j++)
		{
			int tempPrice = priceTable[j] + maxPriceMemo[i - j];
			if (tempPrice > price)
			{
				price = tempPrice;
				cutLength[i] = j;
			}
		}

		maxPriceMemo[i] = price;
	}

	//for (int i = 1; i < rodLength + 1; i++)
	//{
	//	//cout << "Max price for " << i << " is " << maxPriceMemo[i] << endl;
	//	cout << "First cut length for " << i << " is " << cutLength[i] << endl;
	//}
}
```

获得了最佳解后就可打印出对于长度为$n$的钢条，每一刀需要砍的长度，伪代码算法如下

```psudocode
PRINT-CUT-ROD-SOLUTION(p,n)

(r,s) = EXTENDED-EXTENDED-BOTTOM-UP-CUT-ROD(p,n)
while n > 0
    print s[n]
    n = s - n
```

c++实现如下：

```c++
int CutRodSolution(int* priceTable, int rodLength)
{
	int* maxPriceMemo = new int[rodLength + 1];
	int* cutLength = new int[rodLength + 1];
	ExtendedBottomUpCutRod(priceTable, rodLength, maxPriceMemo, cutLength);


	int remainLength = rodLength;
	while (remainLength > 0)
	{
		int length = cutLength[remainLength];
		cout << "to Cut " << length << endl;
		remainLength = remainLength - length;
	}

	return maxPriceMemo[rodLength];
}
```

## Matrix-chain multiplication

定义有一系列的矩阵$<A_1,A_2,...,A_n>$，要计算这一些矩阵的乘积即$A_1A_2...A_n$。因为矩阵满足乘法合并律，所以可以决定哪一部分先相乘。

如一共有三个矩阵$<A_1,A_2,A_3>$，则$((A_1A_2)A_3)$与$(A_1(A_2A_3))$两种计算顺序最后得到的结果是相同的，但是这两种顺序花费的时间是不同的。

这里先给出矩阵相乘的算法：

```pseudocode
MATRIX-MULTIPLY(A,B)

if A.columns != B.rows
    error "incompatible dimensions"
else
    let C be a new A.rows X B.columns matrix
    for i = 1 to A.rows
        for j = 1 to B.columns
            c[i][j] = 0 
            for k = 1 to A.columns
                c[i][j] = c[i][j] + a[i][k] * b[k][j]
    return C
```

c++实现如下：

```c++
Matrix* Matrix::multiply(Matrix* mat)
{
	int matColumn = mat->column;
	Matrix* result = new Matrix(row, matColumn);
	for (int i = 0; i < row; i++)
	{
		for (int j = 0; j < matColumn; j++)
		{
			result->data[i][j] = 0;
			for (int k = 0; k < column; k++)
			{
				result->data[i][j] = result->data[i][j] + data[i][k] * mat->data[k][j];
			}
		}
	}
	return result;
}
```

设两个相乘的矩阵分别为$A$和$B$，从上面的算法实现中可以看出，矩阵相乘的时间复杂度为$O(A.row\times B.column\times A.column)$。

在三个矩阵$<A_1,A_2,A_3>$的例子中,假设$A_1$的大小为$10\times100$，$100\times 5$，$5\times50$。

1. 如果计算顺序为$((A_1A_2)A_3)$，则整个计算需要进行的操作数为$10\times5\times100 +10\times50\times5=7500$。
   
2. 如果计算顺序为$(A_1(A_2A_3))$，则整个计算需要进行的操作数为$100\times50\times5+10\times50\times100=75000$

两种计算顺序的计算量差距在10倍。

`将矩阵乘法问题（matrix-chain multiplication problem）`定义为：对于数目为$n$的一些列矩阵$<A_1,A_2,...,A_n>$，为了满足矩阵相乘的要求，矩阵$A_i$的大小都为$p_{i-1}\times p_i$，要求的使相乘计算量最小的矩阵相乘顺序。

### Counting the number of parenthesizations

首先确认暴力枚举所有可能的顺序这个方法是很低效的，用$P(n)$来表示所有可能的计算顺序。设有$n$个矩阵，当$n=1$的情况下，只有一种可能，当$n\geq 2$的情况下，可以将$n$拆成两部分，$k$和$n-k$，所有的可能为这两部分可能的乘积，即$P(k)P(n-k)$。所以,

$$
P(n)=
\begin{cases}
    1 & \text{ if } n=1 \\\\
    \sum_{k=1}^{n-1} P(k)P(n-k) &\text{ if } n \geq 2
\end{cases}
$$

可以用数学归纳法证明$P(n)$的时间复杂度为$\Omega(2^n)$：

1. 在$n=1$的情况下，$P(n)=1$，得证

2. 在$n\geq2$的情况下，假设$p(n)=c2^n$代入式子得

    $$
    P(n)=\sum_{k=1}^{n-1} c2^k\cdot c2^{n-k} \\\\
    =\sum_{k=1}^{n-1} c^2 2^n\\\\
    =c^2(n-1)2^n\\\\
    \geq c_1 2^n
    $$

    即$P(n)\geq c_1 2^n$，也得证。

因此暴力枚举所有可能的顺序时间复杂度是一个指数型的函数， 效率是十分低下的。

### Applying dynamic programming

可以用动态规划来解决这个问题，这里根据之前定义的动态规划四步骤来解决答案：

1. 找到最优解的结构
2. 递归定义最优解的值
3. 计算出最优解的值，通常是通过一个自下而上的递归方式解决
4. 使用计算得出的数据构建出最优解

#### Step 1:The structure of an optimal parethesization

用符号$A_{i...j}$表示矩阵序列$A_i,A_{i+1},...,A_{j}$的乘积，在$i\neq j$的情况下，可以将矩阵序列拆成两部分，$A_i,A_{i+1},...,A_{k}$和$A_{k+1},A_{k+2},...,A_{j}$，其中$i\leq k < j$。

整个$A_{i...j}$的花费变成了$A_{i...k}$的花费加上$A_{k+1...j}$的花费再加上将两部分结果相乘的时间。

在按两部分分割下，如果$A_{i...j}$是最佳解，那么分出的$A_{i...k}$和$A_{k+1...j}$两部分也必然是各自的最佳解，因为如果其中一个可以更优的话，那么$A_{i...j}$则也可以变得更优。

因此矩阵相乘问题的最优解也变为了先求得两个子问题的最优解，再将两个最优解合并起来。

#### Step2: A recursive solution

用$m[i,j]$来表示$A_{i...j}$的操作量，根据Step1中的解释，$A_{i...j}$的花费变成了$A_{i...k}$的花费加上$A_{k+1...j}$的花费再加上将两部分结果相乘的时间。

因为矩阵$A_i$的尺寸为$p_{i-1}\times p_i$，所以矩阵$A_{i...k}$为$p_{i-1}\times p_k$，矩阵$A_{k+1...j}$的尺寸为$p_{k}\times p_j$。因此将两部分合并的操作数为$p_{i-1}p_kp_j$。

当$i=j$时，只有一个矩阵即不需要相乘，这种情况下$m[i,j]$为0，综上

$$
m[i,j] = \begin{cases}
    0 & \text{ if } i=j \\\\
    \min_{i\leq k <j} {m[i,k]+m[k+1,j]+p_{i-1}p_kp_j} & \text { if } i <j
\end{cases}
$$

但$m[i,j]$表示的只是最佳解的值，为了获得最佳解，需要定义一个$s[i,j]$，它记录每个子问题的最佳解时$k$的值。

#### Step 3: Computing the optimal costs

$m[i,j]$的计算依赖于矩阵的尺寸$p_{i-1} \times p_i$，如果存在$n$个矩阵，则表示数据尺寸的数组有$n+1$个元素，因为对于$A_1$而言，尺寸为$p_0 \times p_1$，所以$p$的数组是从0到$n$。

使用数组$m[i,j]$来表示$A_i...A_j$的最少操作数。其中$i$的取值范围是$1\sim n$，$j$的取值范围是$1\sim n$。当$i=j$时，$m[i,j]=0$

使用数组$s[i,j]$表示$A_i...A_j$有最少操作数时，$k$的取值。其中$i$的取值范围是$1\sim {n-1}$，$j$的取值范围是$2\sim n$。这是因为如果$i$必须小于$j$，如果$i=j$，那么根本就没有$k$的存在。

对于矩阵序列$A_i...A_j$，一共有$l$个元素，$l=i-j+1$

计算矩阵序列最佳解的算法伪代码如下：

```pseudocode
MATRIX-CHAIN-ORDER(p)

n = p.length -1
m = new matrix[1~n][1~n]
s = new matrix[1~n-1][2~n]
for i = 1 to n //matrix chain only has one matrix
    m[i,i] = 0
for l = 2 to n
    for i = 1 to n-l+1 // set i's arrange according to the length
         j = i + l -1 //we can calculated the j according to the i and l
         m[i,j]= MAX
        for k = i to j-1
            q = m[j,k] + m[k+1,j] + p[i-1]p[k]p[j]
            if q < m[j,k]
                m[i,j] = q
                s[i,j] = k 
return m and s
```

上述伪代码的第6-7行，即对于`m[i,i] = 0`的处理，实际上就是表示整个矩阵序列只有一个矩阵的情况。

算法的核心是从第八行开始的三重循环，最外层循环`l = 2 to n`，表示矩阵序列中的矩阵数量从$2\sim n$的情况。因为算法使用了自底向上的方法，所以从矩阵数量为$2$开始计算直到矩阵数量为$n$。

第二层循环`i =1 to n-l+1`，是对于$i$数值的循环，因为矩阵序列的长度为$l$，所以$i$最大为$n-l+1$，否则$j=i+l-1$会大于$n$。

因为$l$和$i$都已经确认，所以在第二层循环中，可以算出$j=i+l-1$，至此$m[i,j]$中的$i$和$j$都已经确认，剩下要求的就是分割点$k$。

第三层循环`k=i to j-1`是循环$k$取值的每一个可能，并检查其是否是最佳值，如果是则填入$m[i,j]$和$s[i,j]$

c++实现如下：

```c++
void MatrixChainOrder(int* matrixSizeArray, Matrix* minMultiplications, Matrix* minMultiplicationCut)
{

		int totalMatrixLength = minMultiplications->row;

		for (int i = 0; i < totalMatrixLength; i++)
			minMultiplications->data[i][i] = 0;

		for (int matrixLength = 2; matrixLength <= totalMatrixLength; matrixLength++)
		{
			for (int i = 0; i < totalMatrixLength - matrixLength + 1; i++)
			{
				int j = matrixLength + i - 1;
				minMultiplications->data[i][j] = INT_MAX;
				for (int k = i; k <= j - 1; k++)
				{
					int tempMin = minMultiplications->data[i][k] + minMultiplications->data[k + 1][j] +
						matrixSizeArray[i] * matrixSizeArray[k + 1] * matrixSizeArray[j + 1];
					if (tempMin < minMultiplications->data[i][j])
					{
						minMultiplications->data[i][j] = tempMin;
						minMultiplicationCut->data[i][j] = k;
					}
				}
			}
		}

		minMultiplications->PrintMatrix(15);
		cout << endl;
		minMultiplicationCut->PrintMatrix(15);
}
```

c++实现中，`matrixSizeArray`表示存有矩阵尺寸的数组，如有$n$个矩阵，则该数组大小为$n+1$。`minMultiplications`等同于伪代码中的$m[i,j]$，`minMultiplicationCut`等同于伪代码中的$s[i,j]$。这两个都用了`Matrix`进行表示，两个`Matrix`尺寸都为$n$。虽然在伪代码中，$s[i,j]$的尺寸只要是$n-1$即可，但这里为了实现方便，还是用了$n$。

如果输入的`matrixSizeArray`数据有7个数据，即表示有6个矩阵，且初始化为:

```c++
int matrixSizeArray[] = { 30,35,15,5,10,20,25 };
```

则C++运算结果如下：

![MatrixChainMultiplicationResult](IA-Chapter15-Notes/2019-11-22-11-25-54.png)

结果中的`-842150451`是`Int`数值的默认值，在不同电脑上可能不一样。

`minMultiplications`的对角线表示长度为1的情况，这时候不需要操作了，即为0。从对角线向右上角，每一条都长度+1的情况。右上角顶点$15125$即表示长度为6时的结果。

同理，`minMultiplicationCut`的对角线有表示长度为`1`的情况，但因为长度只有1，所以没法分割，也就是没法定义`k`，因此这个矩阵的对角线值是未定义的即`-842450451`。同样的从对角线向右上角，每一条都长度+1的情况。

将两个矩阵结果的未定义部分删去，并进行一个旋转，让对角线变成水平，则结果如下图所示，左边是$m[i,j]$，右边是$s[i,j]$：

![旋转后的运行结果](IA-Chapter15-Notes/2019-11-22-11-32-00.png)

算法是从最底部逐渐向上运行。

* 图中的$s[i,j]$与代码运行的结果不同，每一个数值都大了1，这是因为代码中矩阵位置是从0开始，而图解中是从1开始。

因为算法有三种循环，所以时间复杂度为$O(n^3)$，且算法需要$\Theta(n^2)$的空间复杂度。

#### Step 4: Constructing an optimal solution

在步骤三中求得的$m[i,j]$只是最佳解的值。如例子中如果要求6个矩阵的最小工作量，可以从$m[i,j]$的最顶部获得，为$15125$。但如果要求6个矩阵最佳情况下该以怎样的顺序进行计算，步骤三并没有直接给出。这里可以通过步骤三中获得的$s[i,j]$矩阵获取矩阵相乘最佳情况下的顺序。

伪代码如下：

```pseudocode
PRINT-OPTIMAL-PARENS(s,i,j)

if i == j
    print "A_"i
else
    print "("
    PRINT-OPTIMAL-PARENS(s,i,s[i,j])
    PRINT-OPTIMAL-PARENS(s,s[i,j]+1,j)
    print ")"
```

这里利用了步骤三中求得的$s[i,j]$，如果输入值为$0 \sim 5$（以C++实现的数据为准，所以不是$1\sim6$），则算法的图解如下：

![打印矩阵最佳解图解](IA-Chapter15-Notes/2019-11-22-12-00-59.png)

黑色表示$(i,j)$，蓝色表示$s[i,j]$的取值，红色表示算法中的输出。

最后树以中序打印则为结果(因为算法中都是在递归左树和右树前先打印了数据，所以是中序)

c++实现如下：

```c++
void PrintOptimalParens(Matrix* minMultiplicationsCut, int i, int j)
{
	if (i == j)
		cout << "A_" << i;
	else
	{
		cout << "(";
		int k = minMultiplicationsCut->data[i][j];
		PrintOptimalParens(minMultiplicationsCut, i, k);
		PrintOptimalParens(minMultiplicationsCut, k + 1, j);
		cout << ")";
	}
}
```

输入值为$0\sim5$的话，最终结果为$((A_0(A_1A_2))((A_3A_4)A_5))$。

## Elements of dynamic programming

一个优化问题可以用动态规划解决必须有两个关键因素：`最优子结构（Optimal substructure）`和`重叠的子问题（overlapping subproblems）`。

### Optimal substructure

如果一个问题具有最优子结构，那么这个问题的最优解一定是伴随着他的子问题的最优解。

可以从以下步骤找寻问题的最优结构：

1. 问题的第一部分首先可以通过一个选择进行切分。切分后会产生一个或多个子问题。

   这一步相当于先确定最内层的循环表达形式，如在切割钢条问题中是选择第一刀切割的长度$l$，矩阵乘法问题中是分割矩阵的位置(求$k$)。

2. 在步骤一的选择中，假设已经知道最优解的选择是什么。

   步骤一中的值是需要一个循环来遍历每个可能的值并找到最佳值的，步骤二即假设已经找到了最佳解。

3. 限定子问题空间，即运用最优解的子问题（在步骤二中假设已经知道了解决每个问题的最优解）。限定子问题空间时尽可能简单。

   例如对于钢条切割问题，子问题空间包含的问题是长度为$i$的钢条的最优切割问题，$i$取值从$1\sim n$。因此钢条切割问题外部只有一层循环。

   但对于矩阵乘法问题，求$A_1A_2...A_n$的最佳分割方式，分割并不一定是从$A_1$开始的，所以需要子问题的两端都需要变化，即$A_i...A_j$，其中$i$的取值是$1\sim n$，$j$的取值是$i$到$n$。（$i$和$j$决定了矩阵序列的长度，在实际算法中，取$i$和长度$l$变量，$j$根据$i$和$l$算出）。因此矩阵乘法问题的子问题空间包含两个变量，外部有双层循环。

4. 证明用来构成问题最优解的子问题本身必须是最优解。可以通过反证法，如果子问题不是最优解，那么将问题中的这一部分子问题替换为最优解，原问题能获取到更优的解。这个证明方法称为`“剪切-黏贴”（Cut-and-Paste）`方法

对于不同的问题，最优子结构的不同体现在两个方面（这里关注的是循环最内层的表达式）

1. 原问题的最优解包含多少个子问题

2. 在确定最优解使用哪些子问题时，要考察多少种可能。

对于钢条切割问题，最优解只需要包含一个子问题，求钢条切割一刀后，剩下部分的最佳切割方式。对于长度为$n$的钢条，第一刀长度一共有$n$种可能性。

对于矩阵乘法问题，最优解需要包含两个子问题，切割后的$A_i..A_k$与$A_k..A_j$各自的最佳切分方式。对于$A_i...A_j$，$k$的取值一共有$j-i$种可能性。

可以从一个问题一共可能的子问题个数和每个子问题需要考察的可能性数量两方面来确定一个问题的时间复杂度。

例如钢条切割问题，长度为$n$的钢条，一共有$\Theta(n)$个子问题，每个子问题最多有$n$个可能性，所以时间复杂度为$O(n^2)$。对于矩阵乘法问题，因为$i$和$j$的变化，一共有$\Theta(n^2)$个子问题，每个子问题最多有$n-1$个可能性，所以时间复杂度为$O(n^3)$。

#### Subtitles

需要注意不要在不是最优子结构的时候使用动态规划。

如求有向图的最短路径可以使用动态规划，但求最长路径就无法使用动态规划。这里的最长路径限定没有闭环，不然可以通过无限次闭环来增加路径。

以结点$u$到结点$v$为例子，在最短路径问题下是**存在**最佳子结构的。假设在$u$到$v$的最短路径上存在结点$w$，$u$到$w$和$w$到$v$都必然是最短路径。否则应用剪切黏贴法，如果有$u$到$w$的更短路径，那么用更短的路径替换则能得到$u$到$v$的更优解。

但在最长路径问题下是**不存在**最佳子结构的，即$u$到$v$的最长路径上存在结点$w$，$u$到$w$和$w$到$v$不一定是各自的最长路径。以下图为例

![最长路径反例](IA-Chapter15-Notes/2019-11-26-10-35-55.png)。

如果求$q$到$t$的的最长路径，那么应该是$q\rightarrow r \rightarrow t$。但是$q\rightarrow r$并不是$q$到$r$的最长路径，其最长路径为$q \rightarrow s \rightarrow t \rightarrow r$，$r$到$t$的最长路径为$r \rightarrow q \rightarrow s \rightarrow t$。而$q$到$r$和$r$到$t$不能取各自最长路径的原因是，如果这么做了就会形成闭环回路。

虽然最长路径和最短路径都是将原问题拆分为了两个子问题，但是因为最长路径的两个子问题是**相关**的，所以不能用动态规划。例如在求$q$到$r$的最长路径的子问题时，因为用了$q \rightarrow s \rightarrow t$,在求$r$到$t$的时候就不能使用$q \rightarrow s \rightarrow t$，否则就存在了闭。即一个子问题的解会干扰到另一个子问题的求解，这就是`子问题相关`。

在最短路径问题下，不存在子问题相关，在两个子问题中也不会出现相同的结点。证明如下：

如果从$u$到$w$和从$w$到$v$两个子问题中都需要经过结点$x$，即路径时$u\rightarrow x\rightarrow w$和$w \rightarrow x \rightarrow v$，那么$x \rightarrow w$和$w \rightarrow x$可以相互抵消，最终路径为$u \rightarrow x \rightarrow v$。这又与经过$w$的假设不匹配，所以两端路径不可能都经过$x$。

### Overlapping subproblems

另一个动态规划需要满足的要求是重叠子问题，即在递归子问题空间中的问题时，子问题是需要是重复出现的，而不是一直出现新的子问题。与动态规划相对的是分治法，在分治法中，解决的每个的子问题都是全新的子问题，其中也不包含已经解决的小子问题。

如矩阵乘法问题中，$m[3,4]$这个子问题的求解，在求$m[2,4]$,$m[1,4]$,$m[3,5]$等中都会出现。下图展示了在求解$m[1,4]$的过程中，出现的子问题，其中深色部分为已经出现过的子问题。

![重叠子问题](IA-Chapter15-Notes/2019-11-26-11-28-09.png)

因为使用了自底向上法或者备忘录法来规避了子问题的重复计算时间，动态规划的时间复杂度才能是多项式级别的，否则是指数形式。

在切割钢条问题的一节中，已经从数学上证明了迭代求解切割钢条问题复杂度为$O(2^n)$，也可证明矩阵乘法问题，迭代求解的复杂度也为$O(2^n)$。迭代法的伪代码为：

```pseudocode
RECURSIVE-MATRIX-CHAIN(p,i,j)
if i == j
    return 0

m[i,j] = MAX

for k = i to j-1
    q = RECURSIVE-MATRIX-CHAIN(p,i,k) + RECURSIVE-MATRIX-CHAIN(p,k+1,j) +
        p[i-1]p[k]p[j]
    if q < m[i,j]
        m[i,j] = q

return m[i,j]
```

c++代码如下：

```c++
int RecursiveMatrixChain(int* matrixSizeArray, Matrix* minMultiplications, int i, int j)
{
	if (i == j)
		return 0;
	minMultiplications->data[i][j] = INT_MAX;
	for (int k = i; k < j; k++)
	{
		int tempMin = RecursiveMatrixChain(matrixSizeArray, minMultiplications, i, k) +
			RecursiveMatrixChain(matrixSizeArray, minMultiplications, k + 1, j) + matrixSizeArray[i] * matrixSizeArray[k + 1] * matrixSizeArray[j + 1];
		if (tempMin < minMultiplications->data[i][j])
			minMultiplications->data[i][j] = tempMin;
	}

	return minMultiplications->data[i][j];
}
```

时间复杂为

$$
T(n)\geq
\begin{cases}
    1 & n=1 \\\\
    1 + \sum_{k=1}^{n-1}(T(k)+T(n-k)+1) & n > 1
\end{cases}
$$

可以用数学归纳法证明$T(n)=O(2^n)$

假设$T(n)=\Omega(2^n)$，可取$T(n)\geq 2^{n-1}，$当$n=1$时，$T(n)\geq 1 = 2^0$，得证。

当$n\geq 2$时，

$$
T(n) \geq 1 + \sum_{k=1}^{n-1}(T(k)+T(n-k)+1) \\\\ 
= 1 +  \sum_{k=1}^{n-1} T(k) +\sum_{k=1}^{n-1}T(n-k) +\sum_{k=1}^{n-1} 1 \\\\
= 1 +  \sum_{k=1}^{n-1} T(k) + \sum_{i = n-1}^{1} T(i) +(n-1) \\\\
= 2\sum_{i=1}^{n-1}2^{i-1}+n \\\\
= 2(2^{n-1}-1)+n \\\\
= 2^n -2 +n \\\\
\geq 2^{n-1}
$$

得证。而使用动态递归的方法，将时间复杂度变味了$n^3$，大幅提升了算法的效率。

### Reconstructing an optimal solution

为了重构出最佳解（在写算法时，关注的是最佳解的值），需要在计算过程中保留一些关键数据，如在矩阵乘法问题中保存每一步的$k$值，即矩阵$s[i,j]$

### Memoization

如在求解钢条切割问题一样，矩阵乘法问题也可以通过自顶向下的备忘录法解决，伪代码如下：

```pseucode
MEMOIZED-MATRIX-CHAIN(p)
n = p.length - 1
m = new matrix[1~n][1~n]
for i = 1 to n
    for j = i to n
        m[i,j] = MAX
return LOOKUP-CHAIN(m,p,1,n)

LOOKUP-CHAIN(m,p,i,j)

if m[i,j] < MAX
    return m[i,j]
else
    for k = i to j-1
        q = LOOKUP-CHAIN(m,p,i,k) + LOOKUP-CHAIN(m,p,k+1,j)
        + p[i-1]p[k]p[j]
    if q < m[i,j]
        m[i,j] = q
return m[i,j]
```

c++代码如下：

```c++
void MemoizedMatrixChain(int* matrixSizeArray, Matrix* minMultiplications)
{
	for (int i = 0; i < minMultiplications->row; i++)
	{
		for (int j = 0; j < minMultiplications->column; j++)
			minMultiplications->data[i][j] = INT_MAX;
	}
	LookupChain(matrixSizeArray, minMultiplications, 0, 5);
}

int LookupChain(int* matrixSizeArray, Matrix* minMultiplications, int i, int j)
{
	if (minMultiplications->data[i][j] < INT_MAX)
		return minMultiplications->data[i][j];
	if (i == j)
		minMultiplications->data[i][j] = 0;
	else
	{
		minMultiplications->data[i][j] = INT_MAX;
		for (int k = i; k < j; k++)
		{
			int tempMin = RecursiveMatrixChain(matrixSizeArray, minMultiplications, i, k) +
				RecursiveMatrixChain(matrixSizeArray, minMultiplications, k + 1, j) + matrixSizeArray[i] * matrixSizeArray[k + 1] * matrixSizeArray[j + 1];
			if (tempMin < minMultiplications->data[i][j])
				minMultiplications->data[i][j] = tempMin;
		}
	}
	return minMultiplications->data[i][j];
}
```

该算法的时间复杂度同样为$O(n^3)$

如果一个问题的子问题空间中的所有问题都必须被解决，那么自底向上法的效率更高，因为它减少了函数调用堆栈的花销。但如果子问题空间的问题并一定需要全部被解决，那么自顶向下备忘法可能效率更高，因为他只会计算需要用到的子问题。

## Longest common subsequence

//TODO

## Optimal binary search trees

//TODO

{% note primary %}

引用：

1. *Introduction to Algorithms* 3rd Sep.2009

{% endnote %}

***