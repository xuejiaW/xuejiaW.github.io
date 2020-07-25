---
title: 《C++ Primer》 第九章笔记
mathjax: true 
categories:
- 读书笔记
- 计算机语言
tags:
- 读书笔记
- C++
---
{% cq %}

《C++ Primer》 第十章笔记。

{% endcq %}

<!--more-->

# Chapter 10 Generic Algorithms

从第九章的容器介绍中可以看出，容器本身支持的操作都关注于容器本身的变化，而一些通用的操作，如搜索容器中的元素，对元素进行排序等却没有出现在容器中，这是因为这些操作都呗抽象了出来，做成了统用的算法，而不是局限于某一个容器。

### Overview
大部分的算法都定义在了`algorithms`头文件中，一些关于数学的算法则定义在`numeric`头文件中。通常来说，这些算法并不局限于特定的容器，而是通过传递迭代器来让算法可以访问容器中的元素。

如下是关于`find`算法的例子，该算法接纳参数，前两个参数表示要搜索的范围都是迭代器，第三个参数为搜索的目标值，如下所示：

```cpp
int val = 42;
vector<int> iVac{1, 2, 3, 4, 52, 42, 47};
list<int> iList{1, 2, 3, 4, 52, 43, 47};

auto iVacResult = find(iVac.begin(), iVac.end(), val);
auto iListResult = find(iList.begin(), iList.end(), 42);

if (iVacResult != iVac.end())
cout << "Find result in ivac" << endl;
if (iListResult != iList.end()) 
cout << "Find result in iList" << endl;

/*
Find result in ivac
*/
```

`find`算法也同样可以用于`build-in`的数组中，如下所示：

```cpp
int ia[] = {27, 21, 12, 42, 109, 83};
int target = 109;
auto result = find(begin(ia), end(ia), target);
if (result != end(ia))
cout << "Find result in array" << endl;

/*
Find Result in array
*/
```

#### How the Algorithms Work

注意，`find`函数传入的两个迭代器，如果命名为$a,b$，则`find`的范围是$[a, b)$。它工作的原理就是从给定的$a$迭代器位置开始与期望值进行比较，如果相等则返回，如果不相等则判断下一个迭代器并继续比较，直到找到一个数值与期望值相同的迭代器，或到了$b$迭代器的位置（并不会与$b$迭代器所指的位置进行比较）。

#### Iterators Make the Algorithms Container Independent

可以看到在上述例子中，`find`算法传入的是迭代器而不是容器，所以同一个`find`函数可以对两种容器都生效。同时又因为`build-in`的数组和迭代器十分类似，所以该算法同样可以用在内置的数组中。

#### But Algorithms Do Depend on Element-Type Operations

虽然算法并不依赖于特定的容器，但算法与容器中的元素却有关。如`find`函数就依赖于容器内元素的`==`操作，很多排序算法依赖于容器中元素的`<`操作。如果容器内的元素没有定义算法要求的算法，则该容器也无法使用该算法。

## A First Look at the Algorithms

C++库中提供了超过100种算法，所以要记住所有的算法是不太可能的，书中将算法分为了三种进行分析，一类是只读，如`find`算法，一种是只写，如`copy`算法，另一种是重新排列，如`sort`算法。

库中的绝大部分算法都是通过迭代器来指定了算法需要对容器中的哪一部分进行计算。

### Read-Only Algorithms

只读算法有之前的`find`算法，还有计算容器中某元素出现次数的`count`算法，以及累加容器内元素的`accumulate`算法。

#### Algorithms and Element Types

算法虽然不关心容器的类型，但关心容器中的元素类型，因为算法的实际操作对象是容器中的元素。这里以`accumulate`算法为例子，

`accumlate`算法有三个参数，前两个都是迭代器，指明了目标容器中要计算的区域，第三个参数为累加的初始值，算法根据第三个参数来决定算法结果的返回类型，也因为容器中的元素要与初始值累加，所以容器中的元素必须能转换为第三个参数的类型。如下所示：

```cpp
vector<string> sVec = {"abc", "edf", "ghi"};
string sum = accumulate(sVec.begin(), sVec.end(), string(""));

//Error, "" is string literal which is actually is const char*
// sum = accumulate(sVec.begin(), sVec.end(), "");
cout << "result is :" << sum << endl;
```

在上述例子中，如果使用了`" "`作为第三个参数则无法通过编译，因为`string`字面值实际上是一个`const char`数组，因此无法作为初始值进行累加。

#### Algorithms That Operate on Two Sequences

有些算法会同时访问两个容器，这里以`equal`算法为例。

这一部分介绍另一个算法`equal`，该算法比较两个容器内中一部分元素是否相等，该算法并不要求两个比较的容器对象类型相同，甚至容器中的元素也不需要类型相同，只要两种容器中的元素可以使用`==`操作符进行比较即可。

算法接受三个形参，且三个形参都是迭代器，前两个形参表示`比较对象1`中需要比较的范围，记为$a和b$，范围为$[a, b)$，第三个形参表示`比较对象2`中开始比较的元素，记为$c$。假设`比较对象1`的范围限定要比较$n$个字符，则`比较对象2`中要比较的对象就是从迭代器$c$所表示的元素开始的$n$个元素（包括$c$），这也就要求了`比较对象2`中从指定迭代器到尾部剩余的元素数必须大于等于前两个迭代器所限制的`比较对象1`中的元素数。如下所示：

```cpp
vector<string> sVec = {"abc", "edf", "ghi"};
vector<string> sVec2 = {"abc", "edf", "ghi", "jkl"};

bool result = equal(sVec.begin(), sVec.end(), sVec2.begin());

if (result)
    cout << "Two vector string is equal" << endl;

/*
Two vector string is equal
*/ 
```

对于`equal`要求其中的元素支持`==`操作，对于元素是数组的情况要额外注意，因为数组并不支持`==`操作，而且在使用数组时会将数组自动转换为指向第一个元素的指针，而针对指针的`==`操作符，比较的是指针的所指向的地址。也因此如果将数组放在容器中，比较的实际上是元素的内存地址，如下所示：

```cpp
vector<const char *> ccVec = {"Abc", "Def", "Ghi"};
vector<const char *> ccVec2 = {"Abc", "Def", "Ghi"};

result = equal(ccVec.begin(), ccVec.end(), ccVec2.begin());

if (result)
    cout << "Two c style string  vector is equal" << endl;

cout << "ccVec address is: " << endl;
for (const char *c : ccVec)
    cout << static_cast<const void *>(c) << endl;

cout << endl;
cout << "ccVec2 address is: " << endl;
for (const char *c : ccVec2)
    cout << static_cast<const void *>(c) << endl;

/*
Two c style string  vector is equal
ccVec address is:
0x408077
0x40807b
0x40807f

ccVec2 address is:
0x408077
0x40807b
0x40807f
*/
```

在上述代码中，C风格的字符串实际上就是数组，而虽然比较的结果仍然为相等，但这是因为编译器的优化，将相同的字符串放在了同样的内存地址上，也因此比较的结果是相同的。如果编译器采取了不同的优化，即如果将相同的字符串放在不同的内存地址上，那么比较的结果就会是不同。因此要尽量避免对元素类型是数组的容器使用`equal`算法。

### Algorithms That Write Container Elements

这一部分是关于进行写入操作的算法。因为算法的参数是容器的迭代器而不是容器本身，所以算法并不能调整容器的大小，即无法调用类似于`push_back`之类的操作，也因此有写入操作的算法会默认容器本身的尺寸是大于等于要写入的元素数量的。

如`fill`算法，该算法容易是三个参数，前两个参数为迭代器，记为$a和b$，第三个参数为数值$c$，$c$的类型与迭代器$a和b$表示的元素类型应当可以相互转换。该算法将数值$c$填充至容器的$[a,b)$范围中

`fill`算法有一个类似的版本名为`fill_n`，该版本也是三个参数，但只有第一个参数是迭代器，第二个参数为unsigned int值表示要插入的元素数量，第三个参数表示插入的元素的数值。

`fill`和`fill_n`的示例如下：

```cpp
vector<int> ivec(10);
fill(ivec.begin(), ivec.end(), 1);
fill(ivec.begin(), ivec.begin() + ivec.size() / 2, 10);
for (int i : ivec)
    cout << "Value is " << i << endl;
/*
Value is 10
Value is 10
Value is 10
Value is 10
Value is 10
Value is 1
Value is 1
Value is 1
Value is 1
Value is 1
*/

cout << endl;
fill_n(ivec.begin(), 3, 5);
for (int i : ivec) 
    cout << "Value is " << i << endl;

/* 
Value is 5 
Value is 5 
Value is 5 
Value is 10
Value is 10
Value is 1 
Value is 1 
Value is 1 
Value is 1 
Value is 1 
*/

```

#### Algorithms Do Not Check Write Operations

上述的fill和fill_n操作都不会去检查容器的大小是否大于等于要填充的元素数量，如果要填充的元素数量大于容器的大小，编译器也不会提示错误，代码的执行结果是未定义的，如下所示：

```cpp
vector<int> ivec2;
fill(ivec2.begin(), ivec2.begin() + 10, 1);
for (int i : ivec)
    cout << "Value is " << i << endl;
/*
Segmentation fault
*/
```

在上述代码中，`ivec2`是一个空的`vector`，而`fill`操作尝试将它并不存在的前10个元素值填充为1，所以结果是错误。

#### Introducing back_inserter

如果要保证无论原容器的大小为多少，写入算法都不出错的话，可以使用`插入迭代器（insert iterator）`，当赋值给插入迭代器时，相当于将赋值操作右侧的数值通过迭代器插入进容器中。

* 插入迭代器定义在头文件`iterator`中

如`back_insert_iterator`就是一种插入迭代器，当赋值给`back_insert_iterator`时，它会调用`push_back`将元素插入至容器的尾部，而创建`back_insert_iterator`可以通过`back_inserter`函数，该函数接纳一个容器类型，并返回相应的`insert iterator`，如下所示：

```cpp
vector<int> vec;
back_insert_iterator<vector<int>> it = back_inserter(vec);
*it = 42;

for (int i : vec)
    cout << "value is " << i << endl;

/*
value is 42
*/
```

使用`back_insert_iterator`也可解决`fill_n`无法作用域大小不够的容器上的问题，如下所示：

```cpp
vector<int> ivec;
fill_n(back_inserter(ivec), 5, 2);
for (int i : ivec)
    cout << "value is " << i << endl;

/*
value is 2
value is 2
value is 2
value is 2
value is 2
*/
```

#### Copy Algorithms

`copy`算法也是写入算法中的一种，该算法接受三个迭代器参数，前两个迭代器$a和b$表示待拷贝的元素范围$[a,b)$，第三个参数$c$表示拷贝的目标地址。算法默认c表示的地址到该容器最后的大小足够将$[a,b)$范围内的元素都拷贝过来。如下所示：

```cpp
int a1[] = {0, 1, 2, 3, 4, 5};
int a2[sizeof(a1) / sizeof(*a1)];
auto ret = copy(begin(a1), end(a1), a2);
for (int i : a2)
    cout << "value is " << i << endl;

/*
value is 0
value is 1
value is 2
value is 3
value is 4
value is 5
*/
```

`bulid-in`的数组是无法进行默认的拷贝赋值操作的，所以上述例子中用`copy`算法来进行类似的拷贝赋值操作。

有许多算法还提供了额外的copying版本，如`replace`算法。`replace`算法的初始版本有四个参数，前两个参数为迭代器$a和b$，第三个参数为需要被替换的值，第四个参数为替换后的值，如下所示：

```cpp
vector<int> ivec = {1, 2, 3, 4, 5, 7, 8, 9, 9, 9, 0};
replace(ivec.begin(), ivec.end(), 9, 0);
for (int i : ivec)
    cout << "Value is " << i << endl;   

/*
Value is 1
Value is 2
Value is 3
Value is 4
Value is 5
Value is 7
Value is 8
Value is 0
Value is 0
Value is 0
Value is 0
*/
```

而`replace`的拷贝版本命名为`replace_copy`，其接纳5个参数，原`replace`的第三第四个参数变为第四第五个参数，而新增的第三个参数为拷贝目标地址的迭代器，如下所示：

```cpp
vector<int> ivec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 0};
list<int> iList;
replace_copy(ivec.begin(), ivec.end(), back_inserter(iList), 9, 0);
for (int i : iList)
    cout << "value is " << i << endl;

/*
value is 1
value is 2
value is 3
value is 4
value is 5
value is 6
value is 7
value is 8
value is 0
value is 0
value is 0
value is 0
*/
```

可以看到上述例子中，`ivec`被替换后的结果通过`replace_copy`算法放置到了`iList`中，且`iList`的初始大小为0，是通过`back_insert_iterator`来进行插入的。

### Algorithms That Reorder Container Elements

重新对容器内元素排序的算法，最普遍的就是`sort`算法，该算法要求容器内的元素需要实现`<`操作符。且该算法需要两个形参，两个形参都是迭代器$a和b$，算法对范围$[a,b]$中元素进行排序。如下所示：

```cpp
vector<int> iVec = {1, 2, 2, 3, 4, 5, 4, 4, 7, 6, 7, 7, 8};
sort(iVec.begin(), iVec.end());
for (int i : iVec)
    cout << "Value is " << i << endl;
/*
Value is 1
Value is 2
Value is 2
Value is 3
Value is 4
Value is 4
Value is 4
Value is 5
Value is 6
Value is 7
Value is 7
Value is 7
Value is 8
*/
```

#### Eliminating Duplicates

这一节是通过一系列算法的合作来去除容器内的重复元素，该操作需要用到`sort`，`unique`两个算法以及容器本身的`erase`函数。

`unique`算法同样有两个形参，且两个形参都是迭代器$a和b$，算法对范围$[a,b]$中元素进行重新排序，但排序的依据并不是字典排序，而是将**连续**的重复的元素放到容器的后半段。所以通常来说，在调用`unique`前，需要先调用`sort`函数来让重复的元素排列在一起，形成连续的重复元素再使用`unique`算法。该算法的返回值不是`void`，而是返回后半段重复的第一个元素的迭代器。如下所示：

```cpp
vector<int> iVec = {1, 2, 3, 4, 5, 4, 5};
vector<int>::iterator it = unique(iVec.begin(), iVec.end());

cout << "Whole Int Vac is: " << endl;
for (int i : iVec)
    cout << "Value is " << i << endl;

cout << endl;

int lastHalfElementsCount = iVec.end() - it;
cout << "Last Half elements counts are: " << lastHalfElementsCount << endl;

cout << "After Unique, result is " << endl;
for (int i : iVec)
    cout << "Value is " << i << endl;
/*
Whole Int Vac is: 
Value is 1
Value is 2
Value is 3
Value is 4
Value is 5
Value is 4
Value is 5

Last Half elements counts are: 0
After Unique, result is
Value is 1
Value is 2
Value is 3
Value is 4
Value is 5
Value is 4
Value is 5
*/
```

上述代码ivec中的重复元素并没有进行连续排列，所以进行了unique操作并没有造成任何的区别。而如果先进行sort再进行unique则结果如下：

```cpp
cout << endl;
sort(iVec.begin(), iVec.end());
it = unique(iVec.begin(), iVec.end());

lastHalfElementsCount = iVec.end() - it;
cout << "Last Half elements counts are: " << lastHalfElementsCount << endl;
cout << "After Unique and sort, result is " << endl;
for (int i : iVec)
    cout << "Value is " << i << endl;

/*
Last Half elements counts are: 2
After Unique and sort, result is
Value is 1
Value is 2
Value is 3
Value is 4
Value is 5
Value is 5
Value is 5
*/
```

可以看到使用`sort`后再使用`unique`操作，有两个重复的元素，即容器的最后两个元素是重复的元素，但可以看到最后输出的经过算法的`ivac`的结果与预想的并不一样(理想中，多余的重复元素应该是4和5)。这是因为`unique`操作，只能保证返回的迭代器前的元素不存在重复，而**返回的迭代器之后的元素的值则是未定义的**。

`sort`和`unique`的配合已经保证了`unique`返回的迭代器前的所有元素都是不重复的，而如果要将容器内重复的元素都删除，则还要使用`erase`操作，如下所示：

```cpp
vector<int> iVec = {1, 2, 3, 1, 2, 3, 4, 4, 5, 6, 5, 6, 7};
sort(iVec.begin(), iVec.end());
vector<int>::iterator it = unique(iVec.begin(), iVec.end());
iVec.erase(it, iVec.end());
for (int i : iVec)
    cout << "Result is " << i << endl;

/*
Result is 1
Result is 2
Result is 3
Result is 4
Result is 5
Result is 6
Result is 7
*/
```

在上述例中，因为`unique`返回的迭代器指向的是容器后半段第一个重复的元素，所以`erase`函数可以将其作为第一个参数，而第二个参数即是容器的尾部。

## Customizing Operations

许多算法是依赖于容器元素的操作的，如`find`操作符依赖于`==`操作符，`sort`依赖于`<`操作符。这一节介绍如何容自己的算法来取代这些默认依赖的操作符。如对于元素为`string`的容器，`sort`操作不再按照`string`的字典顺序进行排序，而是按照`string`的长度。

### Passing a Function to an Algorithm

如果要修改算法的默认依赖的操作符，就需要给算法一个额外的`谓词（Predicate）`参数表示替换的算法。

#### Predicates

谓词是C++中的一种参数类型，该类的参数可以被调用，且可以返回一直数值作为判断条件。被库中算法使用的谓词分为两种，只接收一个参数的`一元谓词（unary predicates）`和接受两个参数的`二元谓词（binary predicates）`。使用谓词的算法会把其输入范围的元素（通常是前两个迭代器参数框定的范围）传给谓词。

如下列代码将元素类型为`string`的容器排序要求改为按`string`的长度，其中使用的`sort`算法，需要接纳的参数为二元谓词。


```cpp
bool isShorter(string &s1, string &s2)
{
    return s1.size() < s2.size();
}

void TestSortByLength()
{
    vector<string> stringVec = {"aaa", "b", "cc"};
    sort(stringVec.begin(), stringVec.end(), isShorter);
    for (string s : stringVec)
        cout << "value is " << s << endl;

    /*
    value is b
    value is cc
    value is aaa
    */
}
```

#### Sorting Algorithms

这一节介绍了`sort`函数的一个相似版本，`stable_sort`算法，该算法保证相同的元素在变换后其前后顺序不会改变（如之前有两个相同的元素$a和b$，$a$出现在$b$前面，在变换后也保证$a$出现在$b$前面）。

如有一系列的单词，希望对其排序，且排序的规则为先按单词的长度排序，再按单词的字典顺序排序。

```cpp
bool isShorter(const string &s1, const string &s2)
{
    return s1.size() < s2.size();
}

void TestStable_Sort()
{
    vector<string> stringVec = {"fox", "the", "slow",
                                "jumps", "quick", "fox", "over", "red",
                                "turtle", "turtle", "fox"};

    //To delete duplicate elements
    sort(stringVec.begin(), stringVec.end());
    vector<string>::iterator it = unique(stringVec.begin(), stringVec.end());
    stringVec.erase(it, stringVec.end());

    stable_sort(stringVec.begin(), stringVec.end(), isShorter);
    for (string s : stringVec)
         cout << "value is " << s << endl;

    /*
    value is fox
    value is red
    value is the
    value is over
    value is slow
    value is jumps
    value is quick
    value is turtle
    */
}
```
注意这里的`isShorter`函数的形参是`const string`，如果谓词中并不需要修改传入的元素，那应该尽量使用`const`形参。

* 上述代码中，要先进行字典排序，然后再进行按长度排序。即靠前的判定原则在代码中需要靠后调用。

### Lambda Expressions

在上一节中的谓词都是使用一个函数，但很多情况下算法要用的谓词并不会被重复的使用，所以可以使用`Lambda表达式（Lambda Expressions）`来替代。Lambda表达式相当于一个匿名内联函数。

#### Introducing Lambdas

Lambda表达式的格式如下：

```cpp
[capture list] (parameter list) -> return type { function body}
```

`capture list`表示要捕捉的局部变量，局部变量只有被捕捉后才能在`function body`中才能使用。而全局变量等不需要捕捉也能在`function body`中使用，局部的静态变量也不需要捕捉。

`parameter list`为函数的形参，并不支持形参默认值。可以被省略，表示并没有形参。

`return type`为函数的返回类型，使用`trailing return`的形式，可以被省略。如果被省略了`return type`，而且函数主体中除了`return`语句还有其他语句，则返回类型都是`void`，无论`return`语句返回的是什么，当只有一个语句且语句是`return`语句时，才根据`return`后的类型来判断。

`function body`为函数的函数体。

如下所示：

```cpp
auto f = [] { return 42; };
cout << f() << endl;

/*
42
*/
```

#### Passing Arguments to a Lambda

Lambda表达式的形参并没有默认值。这里用Lambda表达式取代之前的isShorter函数来展示如何使用代形参的Lambda表达式：

```cpp
vector<string> stringVec = {"fox", "the", "slow",
                            "jumps", "quick", "fox", "over", "red",
                            "turtle", "turtle", "fox"};

//To delete duplicate elements
sort(stringVec.begin(), stringVec.end());
vector<string>::iterator it = unique(stringVec.begin(), stringVec.end());
stringVec.erase(it, stringVec.end());

stable_sort(stringVec.begin(), stringVec.end(),
            [](const string &a, const string &b) { return a.size() < b.size(); });
for (string s : stringVec)
    cout << "value is " << s << endl;

/*
value is fox
value is red
value is the
value is over
value is slow
value is jumps
value is quick
value is turtle
*/
```

这一段与上一节中对于`stable_sort`的例子几乎一样，只不过使用Lambda表达式取代了`isShorter`算法。

#### Using the Capture List

这里以`find_if`算法作为例子来说明`capture list`，该算法的第一与第二个参数为迭代器，记为$a和b$，表示计算范围为$[a,b)$该算法的第三个形参是一个一元的谓词，将范围内的每个元素传递给第三个形参表示的谓词。且返回第一个满足条件的元素的迭代器，如果整个范围内没有符合条件的元素，则返回迭代器$b$。

如下所示：

```cpp
vector<string> stringVec = {"fox", "the", "slow",
                            "jumps", "quick", "fox", "over", "red",
                            "turtle", "turtle", "fox"};
vector<string>::iterator it = find_if(stringVec.begin(), stringVec.end(),
                                      [](const string &std) { return std.size() >= 5; });
if (it != stringVec.end())
    cout << "Found value is " << *it << endl;
else
    cout << "There is no found value" << endl;
/*
Found value is jumps
*/
```

上述例子中，`find_if`的谓词是用Lambda表达式写成的，其判断条件是返回字符串长度大于等于5的字符串。但是这个长度限制是写死的，如果要改成长度限制为6，则需要重写。理想上来说，是将这个长度限制作为形参传递给Lambda表达式，但是因为find_if限制了其谓词必须是一元谓词，所以不能将长度限制作为Lambda的形参，如下所示：

```cpp
//error, predicate should be unary predicate
// it = find_if(stringVec.begin(), stringVec.end(),
//              [](const string &std, int length) { return std.size() >= length; });
```

一个解决方法是将长度限制作为全局变量，然后在Lambda表达式函数体中调用，如下所示：

```cpp
int length = 5;
void TestFind_if()
{
    it = find_if(stringVec.begin(), stringVec.end(),
                 [](const string &std) { return std.size() >= length; });
    if (it != stringVec.end())
        cout << "Found value is " << *it << endl;
    else
        cout << "There is no found value" << endl;
    /*
    Found value is jumps
    */
}
```

上述例子中，`length`是全局变量，因此可以直接在Lambda的表达式的函数体中使用。

但这种方法并不够优雅，因为一个程序如果有太多的全局变量，其可读性是很差的，理想情况下还是希望将length作为一个局部变量，这时候就需要用到`capture list`。如下所示：

```cpp
int toFindLength = 5;
it = find_if(stringVec.begin(), stringVec.end(),
             [toFindLength](const string &std) { return std.size() >= toFindLength; });
if (it != stringVec.end())
    cout << "Found value is " << *it << endl;
else
    cout << "There is no found value" << endl;
/*
Found value is jumps
*/
```

这里的`toFindLength`即是一个局部变量，且放在了`capture list`中，因此可以在`Lambda`的函数体中使用。

#### The for_each Algorithms

这一节还介绍了`for_each`函数，该函数的第一第二个参数同样是表示范围的迭代器，第三个参数是一元的谓词，如下所示：

```cpp
vector<string> stringVec = {"fox", "the", "slow",
                            "jumps", "quick", "fox", "over", "red",
                            "turtle", "turtle", "fox"};
for_each(stringVec.begin(), stringVec.end(),
         [](const string &std) { cout << "Value is " << std << endl; });

/*
Value is fox
Value is the
Value is slow
Value is jumps
Value is quick
Value is fox
Value is over
Value is red
Value is turtle
Value is turtle
Value is fox
*/
```

### Lambda Captures and Returns

当定义一个Lambda表达式时，实际上是默认创建了一个新的未命名的类，而将Lambda作为函数的形参时，实际同时构建了新的类和新的该类的对象。Lambda表达式中的`capture_list`中捕获的局部变量作为新的类中的成员变量。

#### Capture by Value

如之前例子中直接使用的`capture_list`使用的都是值传递，如下所示：

```cpp
int v1 = 42;
auto f = [v1] { return v1; }; //Value capture
v1 = 0;
int j = f();
cout << "result is " << j << endl;

// result is 42
```

当`v1`被捕捉后，进入Lambda的是值拷贝，因此之后重新设置`v1`并不会影响Lambda中的值。

* Lambda的值传递，捕捉变量的值拷贝发生在Lambda表达式定义的时候，而不是使用的时候

#### Capture by Reference

而如果要对`capture_list`使用引用捕捉，可以在`capture_list`中使用&操作符，如下所示：

```cpp
int v1 = 42;
auto f = [&v1] { return v1; }; 
v1 = 0;
int j = f();
cout << "result is " << j << endl;

// result is 0
```

当使用了引用捕捉后，进入Lambda的是引用，因此对原对象的修改会影响到Lambda的计算。

* 当使用引用捕捉时，要注意本地变量的释放问题
* 对于一些无法拷贝的对象，如`ostream`，只能使用引用捕捉

#### Implicit Captures

可以使用隐式的方法来自动捕捉Lambda表达式中使用到的所有变量。如果需要通过值拷贝的方法来隐式捕捉，则在`capture_list`中使用`=`操作符，如果需要通过引用拷贝的方法来隐式捕捉，则使用`&`操作符。且在`capture_list`中可以混合使用，如显示的通过引用捕捉来捕获一个参数，再通过值拷贝的方式来隐式捕捉其他的所有参数。但混合使用隐式和显示捕捉参数时，第一个参数必须是隐式捕捉的，如下所示：

```cpp
vector<string> words = {"abc", "def", "ghi"};

char c = '|';
ostream &os = cout;

for_each(words.begin(), words.end(), [&, c](const string &s) { os << s << c; });

cout << endl;

for_each(words.begin(), words.end(), [=, &os](const string &s) { os << s << c; });

// abc|def|ghi|
// abc|def|ghi|
```

上述两个Lambda表达式实际上是相同的，只不过第一个是隐式引用拷贝，第二个是隐式值拷贝。

#### Mutable Lambdas

`capture_list`中捕捉的值拷贝参数是无法修改的，因此如下代码是无法通过编译的：

```cpp
// auto f = [v1] { return ++v1; };
// auto f1 = [&v1] {return ++v1; }; 
```

如果要修改被捕捉的值拷贝参数，需要显示的使用关键字`mutable`，如下所示：

```cpp
int v1 = 42;
auto f = [v1]() mutable { return ++v1; };
v1 = 0;
int j = f();
cout <<"result is "<< j << endl;

// result is 43
```

* 当使用`mutable`参数时，参数列表无法省略

而`capture_list`中捕捉的引用拷贝参数本身就可以修改的，不需要使用`mutable`关键字。如下所示：

```cpp
int v2 = 42;
auto ff = [&v2] { return ++v2; };
v2 = 0;
int k = ff();
cout << "result is " << k << endl;
// result is 1 
```

#### Specifying the Lambda Return Type

这一节中介绍了`transform`算法，该算法需要四个参数，前三个参数都是迭代器，前两个迭代器表示输入的范围，第三个迭代器表示输出的地址，第四个参数为一元谓词。该谓词将输入范围中的元素进行修改，如下所示：

```cpp
list<int> ivec = {0, -1, -2, 3, 4, -5};
transform(ivec.begin(), ivec.end(), ivec.begin(), [](int i) { return i < 0 ? -i : i; });

for (int i : ivec)
    cout << "element is " << i << endl;

// element is 0
// element is 1
// element is 2
// element is 3
// element is 4
// element is 5
```

可以看到上述例子中，使用了`?:`操作符来返回数据，整个Lambda表达式的函数体只有一条语句，因此整个Lambda表达式并不需要指定返回类型。但如果使用`if`语句来返回数据，则函数体中有多条语句，按C++11标准则必须指定返回类型，但实际根据编译器的实现。Lambda表达式的返回类型，需要使用`->`操作符，如下所示：

```cpp
// Can pass compilation, however the C++ 11 standard not support
list<int> ivec = {0, -1, -2, 3, 4, -5};
transform(ivec.begin(), ivec.end(), ivec.begin(), [](int i) {
    if (i < 0)
        return -i;
    else
        return i;
});

// C++ 11 standard recommended
transform(ivec.begin(), ivec.end(), ivec.begin(), [](int i) -> int {
    if (i < 0)
        return -i;
    else
        return i;
});
```

### Binding Arguments

#### The Library bind Function

如之前所述，`find_if`算法只能接纳一个一元谓词，但是在判断过程中往往又需要用到额外的一个数值用来判断是否满足条件。在上面的例子中，需要用`find_if`算法找寻长度大于等于5的单词，例子中使用了带有`capture_list`的Lambda表达式解决了问题，如下所示：

```cpp
vector<string> stringVec = {"fox", "the", "slow",
                            "jumps", "quick", "fox", "over", "red",
                            "turtle", "turtle", "fox"};
int toFindLength = 5;
it = find_if(stringVec.begin(), stringVec.end(),
             [toFindLength](const string &std) { return std.size() >= toFindLength; });
```

其中的`toFindLength`为捕捉的参数。如果想将Lambda表达式抽象成函数则会遇到函数形参不匹配的问题，如下所示：

```cpp
bool check_size(const string &s, string::size_type sz)
{
    return s.size() >= sz;
}

// it = find_if(stringVec.begin(), stringVec.end(), check_size);//Error, should use unary predicate
```

对于这种情况，C++11标准下提供了`bind`算法来将函数的调用绑定至另一个调用对象上，该算法定义在头文件`functional`中，且格式为：

```cpp
auto newCallable = bind(callable, arg_list);
```

该方法会用`arg_list`参数列表调用函数指针`callable`。在参数列表中，可能会存在一些形为`std::placeholders::_n`的参数，这些参数是作为`占位符（placeholder）`的存在，如`std::placeholders::_1`，这些占位符根据其名字，表示调用`newCallable`的形参，如`std::placeholders::_1`记为调用`newCallable`的第一个形参。如下所示:

```cpp
void Debug5(int a, int b, int c, int d, int e)
{
    cout << "Debug5 result is " << a << "  " << b << "  " << c << "  " << d << "  " << e << endl;
}

using namespace std::placeholders;
auto debug2 = bind(Debug5, 5, 10, _2, _1, 15);
debug2(1, 2);
// Debug5 result is 5  10  2  1  15
```

上例中的`Debug5`函数，按顺序打印输入的形参，在`bind`函数调用中，将`_2`占位符作为第三个参数，将`_1`占位符作为第四个参数。因此作为新的调用器的`debug2`的第一个形参会传递给旧调用其`Debug5`的第三个参数，`debug2`的第二个形参会传递给旧调用其`Debug5`的第四个参数。

* 上例中使用了`using namespace std::placeholders`来一次性定义某个命名空间下的所有成员

对于之前例子中的`find_if`算法，使用`bind`算法的例子如下：

```cpp
it = find_if(stringVec.begin(), stringVec.end(), bind(&check_size, std::placeholders::_1, toFindLength));
```

#### Binding Reference Parameters

如果在`bind`算法中需要引用或指针，可以使用`ref`算法，而如果需要const引用或指针，则可以使用`cref`算法。

如以下例子中的两个`for_each`表达式的功能相同，都是将`string vector`中的元素传递给`ostream`打印出来，一个使用了Lambda表达式，一个使用了`bind`算法。

```cpp
vector<string> words = {"abc", "def", "ghi"};

char c = '|';
ostream &os = cout;

for_each(words.begin(), words.end(), [&os, c](const string &s) { os << s << c; });
cout << endl;
for_each(words.begin(), words.end(), bind(print, ref(os), _1, c));

// abc|def|ghi|
// abc|def|ghi|
```

## Revisiting Iterators

许多算法的参数是迭代器而不是容器或者流本身，因此这些算法的操作都依赖于迭代器，如果要对容器或流进行操作，也必须通过迭代器来实现。如之前就依赖`back_insert_iterator`来实现对容器的插入。在`iterator`头文件中，定义了四种特殊的迭代器类型:

1. `插入迭代器（Insert iterators）`：该迭代器绑定至一个容器，并用于给容器插入数据
2. `流迭代器（Stream iterators）`：该迭代器绑定至一个流，可以用它来进行流的输入或输出
3. `反向迭代器（Reverse iterators）`：如之前所述，除了`forward_list`，其他的容器都定义了反向迭代器，用于相反方向的访问迭代器（如++操作不再是前移一位，而是后移一位） 
4. `移动迭代器（Move iterators）`：在13.6.2节解释

### Insert Iterators

`iterator`头文件中定义了以下三个函数，来返回不同的插入迭代器：

1. `back_inserter`：形参为一个容器，返回`back_insert_iterator`迭代器，该迭代器调用容器的`push_back`操作，在容器尾部插入元素。
2. `front_inserter`：形参为一个容器，返回`front_insert_iterator`迭代器，该迭代器调用容器的`push_front`操作，在容器头部插入元素。
3. `inserter`：形参为一个容器和一个迭代器，返回`insert_iterator`迭代器，该迭代器调用容器的`insert`操作在形参迭代器位置前插入元素。

上述的三个迭代器，都定义了`it = t`操作符，将操作符右侧的参数在迭代器对应的位置插入进容器。三个迭代器还都定义了`*it , ++it, it++`操作符，但这些操作符都没有任何作用。

`front_insert_iterator`如下所示：

```cpp
list<int> lst = {1, 2, 3, 4};

std::front_insert_iterator<list<int>> frontIterator(lst);

*frontIterator = 5;
*frontIterator = 6;

for (int i : lst)
    cout << i << " ";

cout << endl;
// 6 5 1 2 3 4
```

`back_insert_iterator`如下所示：

```cpp
list<int> lst = {1, 2, 3, 4};

std::back_insert_iterator<list<int>> backIterator(lst);

*backIterator = 7;
*backIterator = 8;

for (int i : lst)
    cout << i << " ";

cout << endl;
// 1 2 3 4 7 8
```

`insert_iterator`如下所示：

```cpp
list<int> lst = {1, 2, 3, 4};

// insert_iterator<list<int>> beginInsertIterator(lst, lst.begin());
insert_iterator<list<int>> beginInsertIterator = inserter(lst, lst.begin());
*beginInsertIterator = 9;
*beginInsertIterator = 10;

for (int i : lst)
    cout << i << " ";

cout << endl;

insert_iterator<list<int>> endInsertIterator(lst, lst.end());
*endInsertIterator = 9;
*endInsertIterator = 10;

for (int i : lst)
    cout << i << " ";

// 9 10 1 2 3 4 
// 9 10 1 2 3 4 9 10 
```

注意对于`insert_iterator`而言，每次插入后，迭代器指向的位置是没有变化的，所以每次都是在同一个地方前插入新元素，在上例中即一直在`begin()`的位置或一直在`end()`的位置。对于`insert_iterator`而言`*it = it`与以下代码相同：

```cpp
it = c.insert(it, val);
++it;
```

### iostream Iterators

流迭代器包括`istream_iterator`和`ostream_iterator`，这些迭代器对IO流进行操作。

#### Operations on istream_iterators

`istream_iterator`的使用如下所示：

```cpp
istream_iterator<int> int_it(cin);
istream_iterator<int> int_eof;

list<int> iList;

while (int_it != int_eof)
{
    iList.push_back(*int_it++);
}

for (int i : iList)
    cout << i << " ";

/*
Input:
1
2
3
4
5
^Z

Output:
1 2 3 4 5
*/
```

上例中，`int_it`绑定了`cin`，所以`*int_it++`相当于对`cin`使用`>>`操作符，即读取当前数值并等待下一个数值。而`int_eof`绑定了空对象，它就相当于`eof`，所以上式中使用它作为终止符。

因为流迭代器本质还是迭代器，所以可以用它来初始化容器，如上例代可以简化为如下所示：

```cpp
istream_iterator<int> int_it(cin);
istream_iterator<int> int_eof;

list<int> iiList(int_it, int_eof);

/*
Input:
1
2
3
4
5
^Z

Output:
1 2 3 4 5
*/
```
#### Using Stream Iterators with the Algorithms

流迭代器也可以使用在算法的迭代器中，如可以用`accumulate`来累加所有的输入，如下所示：

```cpp
istream_iterator<int> in(cin), eof;
cout << accumulate(in, eof, 0) << endl;

/*
Input:
1
2
3
^Z

Output:
6
*/
```

#### Operations on ostream_iterators

`ostream_iterator`的构造函数采纳两个参数，第一个是`ostream`的实例，如`cout`，第二个参数为每个输出元素后要跟着的`string`。如下所示：

```cpp
ostream_iterator<int> out_iter(cout, "*");
vector<int> ivec{1, 2, 3};
for (int i : ivec)
    *out_iter++ = i;

cout << endl;

// 1*2*3*
```

对于`ostream_iterator`而言`，*`和`++`操作符实际上是没有任何操作的，因此可以被省略（`istream_iterator`不可省略）。但实际中为了代码的统一，通常还是加上`*`和`++`。
 
```cpp
for (int i : ivec)
    *out_iter++ = i;

// 等同于

for (int i : ivec)
    out_iter = i;
```

上述`for`循环也可以通过`copy`算法来实现，即将容器中的每个容器拷贝至`ostream_iterator`输出给`cout`，如下所示：

```cpp
copy(ivec.begin(), ivec.end(), out_iter);
// 1*2*3*
```

* `ostream_iterator`通常作为左参数，而`istream_iterator`通常作为右参数。

### Reverse Iterators






{% note primary %}

{% endnote %}

***