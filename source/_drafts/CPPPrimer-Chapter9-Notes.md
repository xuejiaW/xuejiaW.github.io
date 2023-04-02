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


《C++ Primer》 第九章笔记。



<!--more-->

# Chapter 9  The Sequential Containers

对于`顺序容器(The Sequential Container)`而言，容器内的元素顺序与元素插入的顺序有关。

## Overview of the Sequential Containers

不同类型的顺序容器对于不同的操作有不同的性能权衡，有的类型在删除和插入元素时开销较少，有的类型在随机访问时开销较少。顺序容器的包含以下类型：

1. vector： 最普通的顺序容器，支持快速随机访问，在末尾增删元素的速度很快，在其他地方则速度较慢。内存分配连续，所以可以很快速的获取到其中的元素的地址，但也因为连续，在中间删除或增加一个元素后，之后的元素的位置都需要进行调整，来保证内存连续，所以vector在中间增删元素的效率较低。
2. deque：双向队列，支持快速随机访问，在开头以及模为增删元素速度很快，其他地方较慢。
3. list：双向链表，不支持随机访问，仅支持双向的顺序访问（从开头递增，从末尾递减），在容器中的任意地方增删元素都很快。相对来说内存占用较大。
4. forward-list：单向链表，只支持从头部递增的顺序访问，在容器中的任意地方增删元素都很快。相对来说内存占用较大。
5. array：固定大小的数组，支持快速的随机访问，不能删除和添加元素。这里的array是C++11中新增的container类型，与内建的`[]`数组类型并非同一个概念。现代的C++程序推荐使用array容器而非内建的数组。
6. string：一个特殊的容器，与`vector`类似，但其中的元素类型为`character`，支持快速访问，在末尾快速增删。

* 除了array是固定大小的，其他容器都提供高效的灵活的内存分配机制（即大小可以任意的改变）。

通常选择容器有以下的准则：
1. 除非明确有理由需要其他容器，否则使用`vector`
2. 如果需要随机访问元素，使用`vector`或者`deque`
3. 如果需要中间增删元素，使用`list`或`forward_list`
如果仅当容器初始化阶段（如读取外部数据时）需要在中间增删元素，也可以选择都装入`vector`中，再使用`sort`函数进行排序，或者先装进`list`中再使用`list`创建`vector`
4. 如果前后都需要增删元素，使用`deque`

## Container Library Overview

所有的容器操作可以看作有三个种类，一是所有的容器都含有的操作，二是特定类型的容器含有，容器类型包括`顺序容器（Sequential Container）`，`关联容器（Associative Container）`，和`无序容器（Unordered Container）`，三是只有特定类型的容器拥有的函数。

每个容器都定义在与自己名字相同的头文件中，如`vector`容器定义在`<vector>`中。

#### Constraints on Types That a Container Can Hold

几乎任意类型的变量都可以作为容器的元素，但是并不是装有任意类型变量的容器都可以被初始化，如有一个没有无参构造函数`noDefault`，则在构造其容器时，必须指定初始化变量，如下所示：

```cpp
void TestContainerInitialization()
{
vector<NoDefault> v1(10, 2);
// vector<NoDefault> v1(10);   //Error, NoDefault do not have default constructor
// vector<NoDefault> v2(10,2,3);    //Error, Can only pass one initialize parameter
}
```
### Iterators

`迭代器（Iterator）`是一个与容器绑定的类型，即每个不同类型的容器其迭代器是不一样的。

几乎所有的容器的迭代器（Iterator）都支持如下操作，除了`forward_list`不支持`--`操作

| 代码实例       | 说明                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| *iter          | 返回迭代器指向的元素的引用                                                  |
| iter->mem      | 访问迭代器指向元素中的成员mem，等同于(*item).mem                            |
| ++iter         | 迭代器指向下一个元素的位置                                                  |
| --iter         | 迭代器指向上一个元素的位置                                                  |
| iter1 == iter2 | 判断两个迭代器是否相同，两个迭代器都指向同一元素或都指向`off-the-end`时相同 |
| iter1 != iter2 | 判断两个迭代器是否不同                                                      |

而如下操作只有`string`,`vectgor`,`deque`和`array`支持以下的操作：

| 代码实例      | 含义                                           |
| ------------- | ---------------------------------------------- |
| iter + n      | 返回该迭代器后n个元素的位置                    |
| iter - n      | 返回该迭代器前n个元素的位置                    |
| iter += n     | 让迭代器指向后n个元素的位置                    |
| iter -= n     | 让迭代器指向前n个元素的位置                    |
| iter1 - iter2 | 获得两个迭代器之间的距离，即相距多少个元素     |
| <, <=, >, >=  | 关系比较，比较迭代器指向元素的前后，越靠前越小 |

#### Iterator Ranges

迭代器范围的概念是限定一个容器中元素的区域，通常使用`begin`和`end`两个迭代器来限定范围。

容器中可访问的元素范围是$[begin,end)$，这里的`end`指的是最后一个元素之后的位置，所以在范围中使用圆括号表示，而之所以取`end`是这么一个无法访问的地址，是因为它有以下的优点：

1. 当`begin`与`end`相等时，说明容器为空，不相等时说明至少有一个元素
2. 可以使用`begin==end`来表示一个容器遍历完成。

### Container Type Members

通常而言，容器包含有以下类型：

1. `iterator`：上一节中介绍
2. `const_iterator`：const的迭代器，不能通过该迭代器修改数值
3. `reverse_iterator`：相反的迭代器，reverse_iterator--相当于iterator++，forward_list中没有该类型
4. `const_reverse_iterator`：const的相反迭代器
5. `size_type`：表示容器大小的伴随类型，unsigned int类型，其数值范围保证可以容纳容器中元素的大小
6. `difference_type`：表示两个迭代器插值的伴随类型，int类型，其数值范围保证可以容纳两个迭代器位置的差值
7. `value_type`: 容器内元素的类型
8. `reference`: 容器内元素的引用
9. `const_reference`: 容器内元素的const引用

`value_type`,`reference`,`const_reference`主要是用来支持泛型编程，当需要获取到一个容器内的元素类型时很有用。

### begin and end Members

除了`begin`和`end`成员，还有一些类似的成员，如`rbegin`,`rend`，`cbegin`，`cend`。以r开头的版本说明返回的是`reverse_iterator`，以c开头的版本说明返回的是`const_iterator`。

`cbegin`，`cend`是C++11中才有的函数，在之前的标准中如果要返回`const_iterator`主要靠容器本身的类型，函数`begin`是有两个重载的版本，如果容器本身是普通类型，则返回`iterator`，如果容器是`const`的，则返回`conse_iterator`。在现有标准中，如果不需要修改迭代器指向的元素，建议使用`cbegin`和`cend`版本。

### Defining and Initializing a Container

除了array类型外，所有的容器默认构造器都创造了一个空容器。

#### Initializing a Container as a Copy of Another Container

对于容器而言，有两种拷贝初始化的方法，一是直接通过另一个容器，二是通过迭代器。

直接通过另一个容器来拷贝初始化的例子如下：

```cpp

list<string> authors_list = {"Ben", "Shake", "Austen"};
vector<string> authors_vector = {"Ben", "Shake", "Austen"};
list<const char *> articles_list = {"a", "aa", "the"};
vector<const char *> articles_vector = {"Ben", "Shake", "Austen"};

list<string> list2(authors_list);
// list<string> list3(authors_vector); //error, container type not match
// list<string> list4(articles_list);// error, elements type not match
```

直接通过另一个容器拷贝初始化的话，容器的类型和元素的类型都必须匹配

通过迭代器拷贝初始化容器的例子如下：

```cpp
list<string> list5(articles_list.begin(), articles_list.end()); //correct, although element type not match
list<string> list6(articles_vector.begin(), articles_vector.end()); // correct, although element and container type not match
```

使用迭代器初始化的话，容器和元素的类型都不需要匹配，只要可以相互转换即可。

#### List Initialization

列表初始化是C++11之后的特性，如之前例子中的初始化：

```cpp
list<string> authors_list = {"Ben", "Shake", "Austen"};
vector<string> authors_vector = {"Ben", "Shake", "Austen"};
list<const char *> articles_list = {"a", "aa", "the"};
vector<const char *> articles_vector = {"Ben", "Shake", "Austen"};
```

#### Sequential Container Size-Related Constructors

容器的初始化还有一个版本是通过设定容器的初始时的大小（除了array外，其他容器之后都可以动态的调整大小），这种版本的初始化还有一个可选的初始值参数，但如果元素并不包含默认的初始化，则必须设定初始值，如下所示：

```cpp
vector<int> ivec(10,-1); // ten int elements, each elements is -1
list<string> svec(10,"hi"); // ten int elements, each element is "hi"
forward_list<int> ivec_fList(10); // ten int elements, each element is default 0
deque<string> svec_deque(10); // ten string elements, each element is default ""
vector<NoDefault> v2(10, 2);
// vector<NoDefault> v1(10);   //Error, NoDefault do not have default constructor
// vector<NoDefault> v2(10,2,3);    //Error, Can only pass one initialize parameter
```

#### Library arrays Have Fixed Size

对于内建类型而言，数组的大小是其类型的一部分，对于容器的`array`也是如此。在初始化容器时，必须设定数组的大小，内置的容器类型也必须带上数组的大小，如下所示：

```cpp
array<int, 42> array42;
array<string,10> string10;

array<int,42>::size_type array42Type;
// array<int>::size_type arrayType; // error, array size is part of the array type
```

与其他容器的默认构造函数不同的是，数组的默认构造函数创建的不是一个空容器，而是一个大小与设定的大小相同的容器，并且其中的元素是默认初始化，而不是其他容器默认构造函数中的值初始化。但`array`的列表初始化时，如果列表中的元素数量不及类型设置的大小，剩下的元素是值初始化。

内建的数组类型无法进行拷贝和拷贝初始化，但是array容器类型可以，但必须保证array的类型是相同的，包括大小，如下所示：

```cpp
int digs[10] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
// int cpy[10] = digs; //error, build-in array not support copy initialization

array<int, 10> digs_array = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
array<int, 10> cpy_array = digs_array; // support copy initialization
cpy_array = digs_array;                // support copy assignment

// array<int, 8> cpy2_array = digs_array; //error, array container type(type) must match
```

### Assignment and swap

之前的章节是关于初始化，这一节是关于赋值，以及容器特有的方法`swap`。

大部分容器都支持直接赋值和列表赋值，但是array只支持直接赋值（在C++14中测试可以），如下所示：

```cpp
list<int> intList;
list<int> intList2 = {1, 2, 3};

intList = intList2;
intList = {4, 5, 6};

array<int, 3> intArray = {0};
array<int, 3> intArray2 = {1, 2, 3};
intArray = intArray2;
intArray = {4, 5, 6};
```

#### Using assign (Sequential Containers Only)

直接使用`=`符号进行赋值的话，容器的类型和元素的类型都必须匹配，而在不匹配的情况下，可以通过`assign`函数。`assign`函数有三个版本，一是通过另一个容器的两个迭代器来赋值，二是直接通过另一个容器赋值，三是通过两个分别表示数量和数值的int值来赋值。只有通过迭代器版本可以使用类型不一样的容器进行赋值，如下所示：

```cpp
// intList.assign(intArray);    //error, container type not match
intList.assign(intArray.begin(), intArray.end());
intList.assign(5,3); //container value is {3,3,3,3,3}
```

#### Using swap

容器还有一个操作`swap`，该操作是将两个容器的数值进行相互交换，这两个容器的类型必须相同，如下所示：

```cpp
list<int> intList3 = {4, 5, 6};
list<int> intList4 = {7, 8, 9, 10};
intList3.swap(intArray); // error, container type not match
intList3.swap(intList4);

cout << "Int list 3" << endl;
for (int i : intList3)
cout << "value is " << i << endl;

cout << endl;
cout << "Int list 4" << endl;
for (int i : intList4)
cout << "value is " << i << endl;

/*
Int list 3
value is 7
value is 8
value is 9
value is 10

Int list 4
value is 4
value is 5
value is 6
*/
```

除了`array`类型外，其他容器类型使用`swap`并不会真正的移动元素，所以无论容器的元素有多少，`swap`操作都能保证在固定时间内完成，也因此`swap`操作是一个很高效的操作。 也因此，如果一个迭代器是指向某个元素的，在swap后，该迭代器还是指向该元素，只不过该元素以及处在不同的容器之中了，如下所示：

```cpp
list<int>::iterator list3Begin = intList3.begin();
cout << "Value is " << *list3Begin << endl;
intList3.swap(intList4);
cout << "Value is " << *list3Begin << endl;
/*
value is 7
value is 7
*/
```

但对于`array`来说，`swap`操作还是通过拷贝元素来实现的，因此`array`的`swap`操作执行时间与`array`中的元素数量有关。并且迭代器在交换后的数值也会发生改变，如下所示：

```cpp
cout << endl;
array<int, 3> intArray3_1 = {1, 2, 3};
array<int, 3> intArray3_2 = {7, 8, 9};
array<int, 5> intArray5_1 = {2, 3, 4, 5};

// intArray3_1.swap(intArray5_1);//error, container type not match

array<int, 3>::iterator intArray3Begin = intArray3_1.begin();

cout << "Value is " << *intArray3Begin << endl;
intArray3_1.swap(intArray3_2);
cout << "Value is " << *intArray3Begin << endl;

/*
Value is 1
Value is 7
*/    
```

可以看到在`swap`后，迭代器的数值发生了变化，而且对于`array`来说，`swap`的两个对象大小也必须相同，因为大小也同样是`array`容器类型的一部分。

* 这一节中对于`swap`前后迭代器的变化，也同样是用于容器中元素的引用，指针。

### Container Size Operations

容器对于容器内元素的数量有三个相关的操作：

1. 除了`forward_list`类型外，所有容器都有`size`函数表示容器内元素的数量
2. 所有容器都有`empty`函数表示容器是否为空
3. 所有容器都有`max_size`函数表示该容器所能容纳的最大元数数量，对于`array`来说即是类型指定的数量。

### Relational Operators

所有的容器都支持`==`和`!=`操作符，除了无序关联容器（unordered associative containers），其他的容器都支持`<，<=，>，>=`操作符。

容器的大小比较是按照字典顺序，即从第一个元素开始逐个比较，如果某一个元素不同，则通过该元素决定两个容器的大小，如果所有的元素都相同，则两个容器相同。

#### Relational Operators Use Their Element's Relational Operator

容器的关系比较是依赖于容器内部的元素的关系比较，所以如果容器内部的元素并没有实现相关的操作，如`==`，那么容纳的它的容器也无法进行`==`比较。

## Sequential Container Operations

### Adding Elements to a Sequential Container

#### Using push_back

除了`array`和`forward_list`所有的顺序容器都有`push_back`操作，该操作将形参的拷贝压入容器的尾部

#### Using push_front

`list`,`forward_list`和`deque`容器有`push_front`操作，该操作将形参的拷贝压入容器的头部。

#### Adding Elements at a Specified Point in the Container

push_back和push_front操作都是在容器的固定位置（尾部和头部）插入元素，而要在容器的任意位置插入零个或多个元素则需要用insert操作，vector，deque，list和string容器都支持insert操作。forward_list支持特殊的insert_begin操作将在之后解释。

对于insert操作一共有四个版本，每个版本的第一个参数都是一个迭代器表示将在哪个位置**前**插入新的元素（如果一次性插入多个元素，则插入的最后一个元素会在这个位置前）

第一个版本，剩下的形参为一个元素的值，会将该元素值的拷贝插入到容器中。
第二个版本，剩下的形参为两个迭代器，这两个迭代器所述的容器类型并一定要与目标容器的类型一致，如果这两个迭代器为a和b，则插入的元素范围为$[a,b)$
第三个版本，剩下的形参为元素值列表
第四个版本，剩下的形参为一个表述要插入元素数目的int和一个表示新增元素值得形参

四个版本如下所示：

```cpp
vector<string> svec = {"a", "b", "c", "d"};
list<string> slist = {"e", "f", "g", "h"};

svec.insert(svec.begin(), "aaa"); // Version 1
svec.insert(svec.begin(), slist.begin(), slist.end()); //Version 2
svec.insert(svec.begin(), {"ee", "ff"}); //Version 3
svec.insert(svec.begin(), 3, "qq"); //Version 4
for (string s : svec)
cout << "value is " << s << endl;

/*
value is qq
value is qq
value is qq
value is ee
value is ff
value is e
value is f
value is g
value is h
value is aaa
value is a
value is b
value is c
value is d
*/
```

#### Using the Return from insert

在C++11标准下，所有的`insert`函数都返回一个迭代器，指向插入的新元素的们中的第一个元素。所以对`list`容器使用以下代码相当于使用`push_forward`

```cpp
list<string> lst;
auto iter = lst.begin();
while (cin >> word)
iter = lst.insert (iter, word);
```

#### Using the Emplace Operations

在C++11的标准下，还有一个与`insert`相对应的函数`emplace`，同样还有`emplace_front`，`emplace_back`版本。

`emplace_front`和`empalce_back`的形参为需要插入元素的构造函数的形参，所以形参的数目和类型是不固定的，与要插入元素类型有关。如下所示：

```cpp
vector<NoDefault> nDlist;
// nDlist.emplace_back();   //error, there is no non parameter constructor for NoDefault
nDlist.emplace_back(1);  // use NoDefault(int) constructor
nDlist.emplace_back(1, 2); // use NoDefault(int,int) constructor
```

`emplace`函数与`insert`函数一样，第一个参数是迭代器表示要在哪个元素前插入新元素。但`emplace`不同的是，它没有如`insert`函数那样一次性插入多个元素的重载函数。

`emplace`和`insert`的区别在于`insert`操作传递的必须是元素本身的类型，而`emplace`函数传递是构成元素的参数。`insert`函数传递的元素本身，所以插入容器中的是传递的元素的拷贝，而`emplace`函数则是通过传递的构成元素的参数直接在容器内部创造元素。如下所示：

```cpp
nDlist.emplace_back(1, 2); // use NoDefault(int,int) constructor
// nDlist.push_back(1, 2);    // error, push_back can not take arguments
nDlist.push_back(NoDefault(1, 2)); // create a NoDefault temporary instance, and the copy of instance will actually be inserted
```

### Accessing Elements

每个顺序容器，包括`array`，都有两个函数`front`和`back`，返回第一个元素和最后一个元素的**引用**。如下所示：

```cpp
vector<int> ivec = {4, 5, 6, 7};
int value1 = *ivec.cbegin(), value2 = ivec.front();  // these two operations are the same
int value3 = *(--ivec.cend()), value4 = ivec.back(); // these two operations are the same

cout << "Value 1 is " << value1 << ", Value 2 is " << value2 << endl;
cout << "Value 3 is " << value3 << ", Value 4 is " << value4 << endl;

ivec.front() = 8; //what front return is reference
value1 = *ivec.cbegin(), value2 = ivec.front();
cout << "Value 1 is " << value1 << ", Value 2 is " << value2 << endl;

/*
Value 1 is 4, Value 2 is 4
Value 3 is 7, Value 4 is 7
Value 1 is 8, Value 2 is 8
*/

```
* 对空容器调用`front`和`back`操作时未定义行为。

#### Subscripting and Safe Random Access

对于string，vector，deque，array都提供了两种随机访问元素的方法，`下标法（[]）`和使用`at`函数。

两个操作本质上是一样的，只不过使用下标法时，如果传递的`index`超出了容器的边界，会出现未定义的情况（通常是`crash`），而使用`at`函数时，如果传递的`index`超出边界，则会抛出`out_of_range`异常。如下所示：

```cpp
vector<string> svec;
cout << svec.at(0);
/*
terminate called after throwing an instance of 'std::out_of_range'
what():  vector::_M_range_check: __n (which is 0) >= this->size() (which is 0)
*/

cout << svec[0];
/*
Segmentation fault  (Crash)
*/
```

### Erasing Elements

#### The pop_front and pop_back Memebers

如果要从容器的开头或结尾处删去一个元素，应该使用`pop_front`或者`pop_back`，如同`vector`和`string`没有`push_front`操作一样，这两个类型也没有`pop_front`，`forward_list`容器也没有`pop_back`操作。注意`pop_front`操作和`pop_back`操作并不会返回弹出的值，它们返回值是空。

#### Removing an Element or Multiple Elements from within the Container

如果要在容器中的任意位置删除一个或多个元素，可使用`erase`函数，该函数会返回一个迭代器，指向容器内删除的最后一个元素之后的位置。如果需要删除多个元素，则依然传递的是两个迭代器表示要删除元素的范围，且如果两个迭代器是$a$和$b$，则删除的范围是$[a,b)$，且`erase`函数返回的迭代器是$b$。

示例如下：

```cpp
vector<int> ivec = {4, 5, 6, 7, 8, 9};
vector<int>::iterator ivecBegin = ivec.begin();

vector<int>::iterator result = ivec.erase(ivecBegin);
cout << *result << endl;

result = ivec.erase(ivecBegin, ivecBegin + 3);
cout << *result << endl;

/*
5
7
*/
```

#### Specialized forward_list Operations

对于一个链表而言，如果要删去一个元素，还需要访问这个元素的前一个元素，修改其中的`next`变量（通常是一个指针），将其指向删除元素的后一个元素。增加元素的操作也同样如此，需要访问前一个元素。但对于`forward_list`链表而言，因为只能顺序的从开头像尾部递增，所以对于一个元素而言没有高效的方法访问到它前面的元素，也因此之前的`insert`，`erase`等操作都不支持`forward_list`容器。该容器有一系列对应的操作：`insert_after`,`empalce_after`,`erase_after`。同时它还有个特殊的函数返回容器的第一个元素之前的位置：`before_begin`。

如果使用`insert`函数插入多个元素，那么返回的迭代器指向的是这多个元素中的**第一个**，而如果使用`insert_after`函数插入多个元素，返回的迭代器指向的是这多个元素中的**最后一个**。

如果使用`erase`函数删除多个元素，传入的迭代器是$a$和$b$，那么删除的元素范围是$[a,b)$，而如果使用的`erase_after`，则删除元素范围是$(a,b)$。但两个函数返回的迭代器都是指向删除的最后一个元素的后一个位置。

以下以两个例子说明`forward_list`的用法：

1. 删除`forward_list`中的所有奇数

```cpp
forward_list<int> ifList = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11, 12};

forward_list<int>::iterator prev = ifList.before_begin();
forward_list<int>::iterator curr = ifList.before_begin();

while (curr != ifList.end())
{
if (*curr % 2 == 1)
{
//No need to move prev, after delele_after, prev iterator still is the prev iterator
curr = ifList.erase_after(prev);
}
else
{
prev = curr;
++curr;
}
}

for (int i : ifList)
cout << "value is " << i << endl;

/*
value is 2
value is 4
value is 6
value is 8
value is 10
value is 12
*/
```

2. 创建一个函数，传递一个`forward_list<string>`和两个string，找出`forward_list`中的第一个`string`，并在其后插入第二个`string`。

```cpp
forward_list<string>::iterator prev = slist.before_begin();
forward_list<string>::iterator curr = slist.begin();

bool found = false;

while (curr != slist.end())
{
if (*curr == target)
{
prev = curr;
curr = slist.insert_after(curr, value);
found = true;
}
else
{
prev = curr;
++curr;
}
}

if (!found)
slist.insert_after(slist.end(), value);

for (string s : slist)
cout << "value is " << s << endl;
/*
value is abc
value is 123
value is def
value is ghi
value is abc
value is 123
*/
```

### Resizing a Container

`resize`函数用来调整容器内元素的数量，该函数有两个参数，第一个是int值表示调整后容器内元素的数量，第二个参数是元素类型，表示如果是扩张容器，用来装填的元素，如果是收缩容器，则第二个参数并没有意义。如果是扩张容器且没有指定第二个参数，则新增的元素会采取值初始化，这种情况下也就要求了扩张容器的话，其中的元素必须拥有无参构造函数。如下所示：

```cpp
vector<NoDefault> nDVector;
// nDVector.resize(10);//Runtime error, no default constructor

vector<int> iVector = {1, 2, 3, 4, 5, 6};
iVector.resize(8);  //Expand

cout << "After Resizing to 8: " << endl;

for (int i : iVector)
cout << "value is " << i << endl;

iVector.resize(3, 5); //Shink, The second parameter has no meaning

cout << "After Resizing to 3: " << endl;

for (int i : iVector)
cout << "value is " << i << endl;

/*
After Resizing to 8: 
value is 1
value is 2
value is 3
value is 4
value is 5
value is 6
value is 0
value is 0
After Resizing to 3: 
value is 1
value is 2
value is 3
*/
```

### Container Operations May Invalidata Iterators

对容器内删除或增加容器，可能会造成对于容器内元素的指针，引用和迭代器失效。失效的指针，引用或迭代器其行为是未定义的，即其不能保证指向容器内的哪个元素，或是否仍然指向容器的元素。

以下是会造成容器内元素失效的操作：

1. 如果`vector`或`string`进行了重新分配（`reallocated`），则其中的所有指针，引用和迭代器都失效。
2. 如果`vector`或`string`没有进行重新分配，但进行了插入，则插入点之前的指针，引用和迭代器仍然有效，但插入点之后的指针，引用和迭代器无效。同理，如果进行了删除，删除点之前的指针，引用和迭代器有效，之后的无效，也因此只要进行了删除操作，指向`vector`和`string`的原最后元素的指针，引用和迭代器必然无效。
3. 如果是`deque`，插入或删除位置是中间位置，则引用，指针，迭代器都无效。如果对于`deque`的头部或尾部进行操作，对于插入操作而言，迭代器失效，引用和指针仍然有效。对于删除操作而言，如果删除的是尾部，则除尾部迭代器外的其他迭代器，指针和引用都有效，如果删除的是头部，则所有迭代器，指针和引用都有效。
4. 对于`vector`，`string`和`deque`，如果进行了`resize`操作，所有的迭代器，指针和引用都无效。
5. 如果对`list`或`forward_list`进行了任意位置的插入和删除，引用，指针和迭代器都保持有效。

* 因为对容器进行删除和插入操作后，容器内的迭代器可能会失效且规则比较繁琐，所以建议每次进行删除和插入操作后，利用函数返回的迭代器刷新原迭代器。
* 也因为容器尾部的迭代器在很多情况下会失效，所以通常不建议使用变量将`end`的结果缓存起来，而是应该在每次都重新调用`end`操作。也因为`end`操作可能会被调用多次，所以`end`操作经过了优化，其执行效率很高。

## How a vector Grows

对于`vector`和`string`，因为其中元素的存储内存是连续的，所以如果在新增元素时发现已经没有连续的内存块给新内存，整个容器都会重新分配内存至一块大的，拥有连续内存的区域。而这个过程是很费时的，所以通常来说，在每次重新分配时，都会分配比需要用到的实际内存区域更大的区域，这样的话就不会出现每次新增内存都需要重新分配的情况。

#### Members to Manage Capacity

对于`vector`和`string`，有两个操作是与预先分配内存相关的，`capacity`和`reserve`，前一个操作返回在下次重新分配内存前，容器内最多有多少个元素，后一个操作则是让用户可以设定重新分配内存时，容器应该准备容纳多少的元素。只有当`reserve`操作设定的元素数大于当前的capacity时，操作才会生效，如果小于当前的`capacity`，`reserve`操作也不会让容器释放多分配的内存。

如果要释放多分配的内存，可以调用`shrink_to_fit`操作，该操作让`deque`,`vector`和`string`拥有正好可以容纳当前元素的内存，但是该操作只是一个申请，根据C++的协议，具体的实现可以无视这个申请。

* `resize`操作是针对容器内的元素数量，并不会对内存分配造成影响，即它并不会直接的分配和释放内存，只不过如果`resize`是扩张容器，可能会导致容器重新分配内存。

```cpp
c.shrink_to_fit();
c.capacaity();
c.reserce();
```

#### capacity and size

size返回的是容器内现有的元素数量，capacity返回的是容器内在下一次重新分配内存前，能容纳的元素数量：如下所示：

```cpp
vector<int> ivec;
cout << "Size is " << ivec.size() << " Capacity is " << ivec.capacity() << endl;

for (int i = 0; i != 24; ++i)
ivec.push_back(i);

cout << "Size is " << ivec.size() << " Capacity is " << ivec.capacity() << endl;

/*
Size is 0 Capacity is 0
Size is 24 Capacity is 32
*/
```

capacity返回的值至少比和size返回的值一样大， 也可能更大。但具体capacity返回的值是多大和编译器和系统的实现有关。reserve操作影响的也是容器的capacity，如下所示：

```cpp
ivec.reserve(50);
cout << "Size is " << ivec.size() << " Capacity is " << ivec.capacity() << endl;

/*
Size is 24 Capacity is 50
*/
```

当容器内的元素数量已经达到capacity数量时，容器会进行重新分配内存，而每次重新分配内存将具体分配多少内存则与编译器和系统的实现有关。

```cpp
while (ivec.size() != ivec.capacity())
ivec.push_back(0);
cout << "Size is " << ivec.size() << " Capacity is " << ivec.capacity() << endl;
ivec.push_back(0);
cout << "Size is " << ivec.size() << " Capacity is " << ivec.capacity() << endl;
ivec.reserve(50);
cout << "Size is " << ivec.size() << " Capacity is " << ivec.capacity() << endl;

/*
Size is 50 Capacity is 50
Size is 51 Capacity is 100
Size is 51 Capacity is 100
*/
```

shrink_to_fit操作只是一个申请，具体实现会不会释放内存并不确定。在本机测试中，内存是被释放了的，如下所示：

```cpp
ivec.shrink_to_fit();
cout << "Size is " << ivec.size() << " Capacity is " << ivec.capacity() << endl;

/*
Size is 51 Capacity is 51
*/
```

## Additional string Operations

`string`类型可以看作是一个特殊的`vector`类型，所以普通`vector`的操作，`string`都支持，如通过另一个`string`或者通过两个迭代器来构造一个新的string。或者通过`reverse`来减少重新分配内存的频率

### Other Ways to Construct strings

`string`类型还额外支持三种构造函数:

```cpp
// cp是const char*, n为unsigned int表示要拷贝的字符数（可选）
string s (cp, n);
//s2是另一个string，pos2为unsigned表示从s2的哪个位置开始拷贝
string s (s2, pos2);
//s2是另一个string，pos2为unsigned表示从s2的哪个位置开始拷贝，len2是需要复制多少个字符
//无论len2是多少，最多拷贝到s2字符串被完全拷贝完
string s (s2, pos2, len2)
```

#### The substr Opeartion

`substr`操作是截取字符串的某一部分，其接受两个`unsigned int`参数分别表示从哪截取与截取的字符数，无论截取字符数设为多少，最多截取到原字符串最后。

```cpp
//从pos开始截取，截取n个字符，无论n设为多少，最多截取到s的末尾
s.substr(pos,n)
```

#### Other Ways to Change a string

对于`vector`而言，`insert`和`erase`操作只能接受迭代器，但是`string`提供了可以接受index的版本，这里的index同样是表示开始在哪个位置**前**插入数据。同时`string`版本的`erase`，`insert`和`assign`还可以接受`C风格的字符串`或`string`，如下所示：

```cpp
const char *cp = "Stately, plump Buck";
string s = "abc";

s.insert(0, "def"); // "defabc"
cout << s << endl;

s.insert(0, 5, 'i'); //Like the vector insert version, "iiiiidefabc"
cout << s << endl;

s.assign(cp, 7); //Reassign s, "Stately"
cout << s << endl;

s.insert(s.size(), cp + 7); //"Stately, plump Buck"
cout << s << endl;

string anOther = "hhh";
s.insert(s.size(), anOther); //"Stately, plump Buckhhh"
cout << s << endl;

/*
defabc
iiiiidefabc
Stately
Stately, plump Buck
Stately, plump Buckhhh
*/
```
#### The append and replace Functions

`string`还支持`append`操作，该操作是在`string`的最后加入字符串，该功能也可以通过`insert`完成，只不过使用`append`更为简便，如下两个操作完全等效：

```cpp
s.insert(s.size(), "ggg"); //"Stately, plump Buckhhhggg"
cout << s << endl;

s.append("ggg");           //"Stately, plump Buckhhhgggggg"
cout << s << endl;

/*
Stately, plump Buckhhhggg
Stately, plump Buckhhhgggggg
*/
```

同理还有`replace`操作，该操作是替换`string`中一部分，该功能能可以通过`erase`和`insert`的结合完成，但是使用`replace`更为简单，如下所示：

```cpp
s.assign({"abcdef"});
s.erase(2, 3);        //"abf"
s.insert(2, "qqqqq"); //"abqqqqqf"
cout << s << endl;

s.assign({"abcdef"});//Equals to above
s.replace(2, 3, "qqqqq");
cout << s << endl;

/*
abqqqqqf
abqqqqqf
*/
```

`replace`操作接纳三个变量，第一个变量设定从哪个index开始替换，第二个变量设定要修改几个字符，第三个变量设定修改为什么字符串。

### string Search Operations

`string`提供了一系列搜寻相关的操作，每个操作都返回一个`string::size_type`类型的结果，该类型是一个`unsigned int`。如果没有搜索到结果，则返回`string :: npos`，该变量是一个静态变量，值为$-1$，且同样类型为`string::size_type`，这也就意味着值$-1$会被转换为`unsigned int`，变成该类型所能表达的最大数值。如果找到了目标，结果的值为该目标出现在原字符串中的第一个字符Index。

* 因为`string::sizetype`是`unsigend int`，所以建议不要用`int`类型来保存搜索操作返回的结果。

搜索操作中搜索的目标可以是一个完整字符串(`find`)，也可以搜寻一个字符串中出现的任意字符(`find_first_of/find_first_not_of`)如下所示：

```cpp
string numbers("0123456789"), pName("r2d2");
string::size_type index = pName.find_first_of(numbers); // find the first character index which belongs to numbers
cout << index << endl;
index = pName.find_first_not_of(numbers); //// find the first character index which not belongs to numbers
cout << index << endl;
/*
1
0
*/
```

#### Specifying Where to Start the Search

`find`，`find_first_of`，`find_first_not_of`操作也可以设置从某一个位置开始搜索，如下所示：

```cpp
pName.assign("123r456");
index = pName.find_first_of(numbers, 3);
cout << index << endl;
index = pName.find("123456", 0, 3);
cout << index << endl;
/*
4
0
*/
```

通常来说，是之后跟上一个`unsigned int`类型表示从哪个index开始搜索。当搜索目标是一个C风格的字符串时，还可以跟上一个`unsigned int`类型，表示取C风格字符串的前多少个字符作为搜索目标。

#### Searching Backward

对于`find`，`find_first_of`和`find_first_not_of`都是从字符串的左侧开始搜索，而如果要从字符串的右侧开始搜索，可以使用对应的操作`rfind`，`find_last_of`，`find_last_not_of`。

### The compare Functions

`string`类型支持`==`，`!=`，`<`，`<=`，`>`，`>=`等操作符来与另一个`string`或者C风格的字符串进行比较。但使用操作符的比较，比较的都是两个对象的全部，如果要取两个对象中间的一部分进行比较，则可以使用`compare`操作。

该操作可接受的参数如下：

```cpp
//s1,s2都是string
s1.compare (s2);//完整的s1与s2比较
s1.compare (pos1, n1, s2); // s1从pos1位置开始的n1个字符与s2进行比较
s1.compare (pos1, n1, s2, pos2, n2); // s1从pos1位置开始的n1个字符与s2从pos2开始的n2个字符进行比较

//s1是string,cp是c风格的字符串
s1.compare(cp);//完整的s1与cp进行比较，cp必须是以空字符结尾，不然结果未定义
s1.compare(pos1, n1, cp); //s1从pos1位置开始的n1个字符与cp比较，同样cp必须是以空字符结尾的
s1.compare(pos1, n1, cp, n2) //s1从pos1位置开始的n1个字符与cp的前n2个字符比较
```

### Numeric Conversions

string与数字相互转换也是一个很频繁的操作，在C++11标准下提供了以下相互转换的方法：

```cpp
//数字到string，统一使用to_string，该函数返回string，接纳的数字可以是整数，也可以是浮点数
to_string(val)。

//string到数字有不同的函数
stoi(s, p, b);       //string到int，p为string中开始的index，默认为0，b为进制，默认为10
stol(s, p, b);       //string到long，p为string中开始的index，默认为0，b为进制，默认为10
stoul(s, p, b);      //string到unsigned long，p为string中开始的index，默认为0，b为进制，默认为10
stoll(s, p, b);      //string到long long，p为string中开始的index，默认为0，b为进制，默认为10
stoull(s, p, b);     //string到unsigned long long，p为string中开始的index，默认为0，b为进制，默认为10

stof(s,p);          //string到float，p为string中开始的index，默认为0
stof(s,p);          //string到double，p为string中开始的index，默认为0
stold(s,p);         //string到long double，p为string中开始的index，默认为0 
```

对于string到数字的转换有以下规则：

1. 字符的开头必须是合法的，即如果转换为十进制，那么开头必须是数字。如果是十六进制，则可以出现`a-f`或`A-F`（不区分大小写）。
2. 字符会从开头一直读取到第一个不合法的字符，然后将合法的部分进行解析，即字符并一定要全是数字，如"123zzz"会被解析为$123$
3. 如果设置为16进制，则开头的`0x`或`0X`不会造成影响
4. 对于浮点数而言（无论是但精度还是双精度），可以出现一个`.`来表示小数（开始出现在开头表示`0.`），中间也可以出现`e`或`E`来表示科学计数法

如下所示：

```cpp
cout << endl;
cout << stoi("123abadcF") << endl;
cout << stoi("A123aba", 0, 16) << endl;
cout << stoi("a123abaz", 0, 16) << endl;
cout << stoi("a123", 0, 16) << endl;
cout << stoi("0xa123", 0, 16) << endl;
cout << stod(".123") << endl;
cout << stof(".123") << endl;
cout << stof("123E-3") << endl;
/*
123
168966842
168966842
41251
41251
0.123
0.123
0.123
*/
```

### Container Adaptors

C++标准中还提供了`适配器容器（Container adaptors）`，包括`stack`，`queue`，`priority_queue`，分别表示数据结构中的栈，队列，优先级队列。

#### Defining an Adaptor

因为是适配器容器，所以它们是基于其他容器来创建的，只不过修改了访问接口，默认来说`stack`和`queue`是基于`deque`，而`priority_queue`是基于`vector`。

创建适配器容器如下：

```cpp
//Construct a stack<int> based on empty deque
stack<int> istk;

//Construct a stack<int> based on existing deque
deque<int> ideq;
stack<int> istk_2(ideq);
```

但适配器基于的容器也能修改，只要满足适配器的条件即可。因为三个适配器容器都需要有扩张内存的能力，所以不能基于`array`，也因为适配器容器都需要从容器的尾部访问，所以`forward_list`也不行。

`stack`容器需要支持`push_back`，`pop_back`，`back`操作，除`array`,`forward_list`外的容器都能满足。
`queue`需要`back`，`push_back`，`front`，`push_front`操作，所以只能依靠`list`和`deque`创建（`vector`没有从容器头部访问的能力）
`priority_queue`需要随机访问，`push_back`，front，pop_back操作，所以只能依靠`vector`和`deque`创建（`list`没有随机访问能力）

当需要使用非默认的容器来创建适配器容器时，构造函数如下：

```cpp
//Construct a stack<int> based on empty vector<int>
stack<int, vector<int>> istk_vec;

//Construct a stack<int> based on existing vecot<int>
vector<int> ivec;
stack<int, vector<int>> istk_vec(ivec);
```

#### The Stack Adaptor

`stack`是一个先进后出的适配器容器，支持以下操作：

```cpp
s.pop(); //弹出最后一个元素，返回为空
s.push(item); //将一个元素的拷贝压入容器尾部
s.emplace(args); //用args创建一个元素压入容器尾部
s.top(); //返回最后一个容器的拷贝，但不弹出该容器
```

注意适配器容器的核心还是之前的那些容器（默认情况下，`stack`的核心是`deque`），所以对于适配器容器的操作最后还是会调用其核心容器的操作，如`stack.push`默认情况下最后调用的是`deque.push_back`。但无法从外部直接调用`stack.push_back`。

#### The Queue Adaptors

`queue`和`priority_queue`都是先进先出的适配器容器，支持以下操作：

```cpp
q.pop();    //对于queue弹出第一个元素，对于priority_queue，弹出优先级最高的元素，返回为空
q.front();  //返回第一个元素的值
q.back();   //返回最后一个元素的值
q.push(item); //将一个元素的拷贝压入容器尾部
q.emplace(args);//用args创建一个元素压入容器尾部
```

`priority_queue`是一个基于优先级的队列，虽然其核心还是`queue`，但每一个新增的元素都会以一个较低的优先级插入到容器的头部，支持以下操作：

```cpp
q.pop();    //对于queue弹出第一个元素，对于priority_queue，弹出优先级最高的元素，返回为空
q.front();  //返回第一个元素的值
q.top(); //返回优先级最高的元素的值，queue不支持该操作
q.push(item); //将一个元素的拷贝以较低优先级压入容器头部
q.emplace(args);//用args创建一个较低优先级的元素压入容器头部
```

引用：

1. *Cpp Primer* 5th Aug.2012