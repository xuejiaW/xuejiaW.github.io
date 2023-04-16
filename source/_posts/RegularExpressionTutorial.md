---
title: 正则表达式教程
mathjax: false
date: 2019-10-14 21:06:22
categories:
- 教程
- 标记语言
tags:
- 标记语言
- 效率提升
---



介绍了正则表达式的元字符、缩写、前后预查、标记位、贪婪与惰性匹配和捕捉模式一系列概念。

主要是[Github](https://github.com/ziishaned/learn-regex#learn-regex)上教程的学习笔记。



<!--more-->

## 正则表达式简介

正则表达式（Regular Expression）是一种用来搜索特定字符的表达式。在一些语言的字符串的模式匹配中可以使用正则表达式来找寻子字符串，在Unix系统中也可以用正则表达式来搜索文件。熟练运用正则表达式可以减少寻找子字符串的逻辑判断。

例如 `^[a-z0-9_-]{3-15}$ ` 表示可以用来判断一个字符串是否满足以下条件

1. 由小写字母、数字、或者_-组成

2. 位数在3-15位

所以字符串 `john_doe` 满足搜索条件而字符串 `Jo` 不满足。

## 元字符

| 元字符 | 介绍 | 实例 |
| --------- | ----- |---- |
|.| 匹配除了换行符外的所有符号 | ".ar" => The <label style="color:red">car</label> <label style="color:red">par</label>ked in the <label style="color:red">gar</label>age.|
|[] | 匹配在该方括号内的所有字符 |"[Tt]he"=><label style="color:red">The</label> car parked in <label style="color:red">the</label> garage.|
| [^ ] |匹配除了在该方括号内的所有字符 |"[^c]ar"=>The car <label style="color:red">par</label>ked in the <label style="color:red">gar</label>age.|
|* | 匹配大于等于0个\*号前的字符 | "[a-z]\*"=>T<label style="color:red">he car parked in the garage</label>.<br>"\s\*car\s\*"=>The<label style="color:red"> car </label>parked in the garage.|
| + | 匹配大于等于1个+号前的字符 | "c.+t"=>The <label style="color:red">car parked in t</label>he garage.|
| ? | 标记? 之前的字符为可选 | "[T]?he"=><label style="color:red">The</label> car parked in t<label style="color:red">he</label> garage.|
| {n, m} | num个字符，n<=num<=m。<br>可以不指定n或者m，则只约束一边的大小 | "[0-9]{2, 3}"=>The number was 9.<label style="color:red">999</label>7 but we rounded it off to <label style="color:red">10</label>.0<br>"[0-9]{2, }"=>The number was 9.<label style="color:red">9997</label> but we rounded it off to <label style="color:red">10</label>.0<br>"[0-9]{3}"=>The number was 9.<label style="color:red">999</label>7 but we rounded it off to 10.0 |
| (xyz) | 严格匹配字符xyz | (was)=>The number <label style="color:red">was</label> 9.9997 but we rounded it off to 10.0 |
| \| | 或运算符，匹配 \| 前或后的字符| "(c\|g)ar"=>The <label style="color:red">car</label> parked in the <label style="color:red">gar</label>age.<br>"(T\|t)he\|car"=><label style="color:red">The</label> <label style="color:red">car</label> parked in <label style="color:red">the</label> garage.|
| \\ | 转义符，用来匹配 [ ] *这样的元字符 | "(f\|m)at\.?"=>The <label style="color:red">fat</label> cat sat on the <label style="color:red">mat.</label>|
| ^ | 匹配输入的开头 | "(T\|t)he"=><label style="color:red">The</label> car parked in <label style="color:red">the</label> garage.<br>"^(T\|t)he"=><label style="color:red">The</label> car parked in the garage.|
| $ | 匹配输入的结尾 | "(at\.)"=>The fat c<label style="color:red">at.</label>s<label style="color:red">at.</label>on the m<label style="color:red">at.</label><br>"(at\.)$"=>The fat cat.sat.on the m<label style="color:red">at.</label>|

## 缩写

正则表达式也提供了一些常见的匹配模式的缩写

| 缩写 | 含义|
| --- | ---| 
| \w | [a-zA-Z0-9_] | 
| \W | [^\w_] |
| \d | [0-9] |
| \D | [^\d] |
| \s | 空白字符[\t\n\f\r\p] |
| \S | [^\s] |
| \t | 制表符 | 
| \n | 换行符 |
| \f | 换页符 |
| \r | 回车符 |
| \p | \r\n |

## 前后预查

前后预查是用来选择匹配出来的字符中的某一部分，例如有字符串 `$ 3.22 $4.44 $10.88` ，只想获取跟在$后的数字和小数点，所以应该只匹配4.44和10.88。我们将$称为预查表达式，我们将通过$来定位我们想要的特定数字。

| 预查字符 | 介绍 | 实例 |
| --- | --- | --- |
| ?= | 正前向预查，?=前是需要匹配的内容，?=后跟着预查表达式，匹配之后必须跟着预查表达式 | \$(?=[0-9\.]+) => $ 3.22 <label style="color:red">$</label>4.44 and <label style="color:red">$</label>10.88 <br>匹配的内容是\$，预查表达式是[0-9\.]+ |
| ?! | 负前向预查，?! 前是需要匹配的内容，?! 后跟着预查表达式，匹配之后必须不跟着预查表达式 | \$(?![0-9\.]+) => <label style="color:red">$</label> 3.22 $4.44 and $10.88 |
| ?<= | 正后向预查，?<=后跟着预查表达式，再之后是需要匹配的内容，匹配内容之前必须跟着预查表达式 | (?<=\$)[0-9\.]+ => $ 3.22 $<label style="color:red">4.44</label> and $<label style="color:red">10.88</label><br>匹配的内容是[0-9\.]+，预查表达式是\$ |
| ?<! | 负后向预查，?<! 后跟着预查表达式，再之后是需要匹配的内容，匹配内容之前必须不跟着预查表达式 | (?<!\$)[0-9\.]+ => $ <label style="color:red">3.22</label> $4<label style="color:red">.44</label> and $10<label style="color:red">.88</label> |

## 标记位

| 标记位 | 介绍 | 实例 |
| --- | --- | --- |
| i | 无视大小写 | /The/ => <label style="color:red">The</label> fat cat sat on the mat.<br>/The/gi =><label style="color:red">The</label> fat cat sat on <label style="color:red">the</label> mat. |
| g | 全局搜索（如果这个flag没有开启，则只匹配第一个搜索到的结果） | /.(at)/ => The <label style="color:red">fat</label> cat sat on the mat.<br>/.(at)/g/ => The <label style="color:red">fat</label> <label style="color:red">cat</label> <label style="color:red">sat</label> on the <label style="color:red">mat</label>. |
| m | 多行匹配锚点，将^,&的工作范围从全文变成每行 | /.at(.)?$/ => The fat<br>cat sat<br>on the <label style="color:red">mat.</label><br><br>/.at(.)?$/gm => The <label style="color:red">fat</label><br>cat <label style="color:red">sat</label><br>on the <label style="color:red">mat.</label>|

## 贪婪匹配和惰性匹配

像\*和+默认都是贪婪模式，这意味着模式会尽可能的匹配更长的字符。可以在\*和+后跟上?字符转换为惰性匹配模式。

/(.*at)/ => <label style="color:red">The fat cat sat on the mat.</label>

/(.*?at)/ => <label style="color:red">The fat</label> cat sat on the mat.

## 捕捉模式

捕捉模式相当于将模式匹配的字符组保存到内存中，方便之后引用。这个严格意义上超脱了正则表达式本身的功能，是在其他语言使用正则表达式时的一个功能。默认的`(<Pattern>)`操作符就是开启了捕捉模式，如要关闭的话，在括号后跟上?:即可，如`(?:<Pattern>)`

{% note info simple %}

1. Github正则表达式教程 ： https://github.com/ziishaned/learn-regex#learn-regex

2. 在线模式匹配测试 : https://regex101.com/r/ahfiuh/1

3. 模式匹配图解 :  https://regexper.com/

{% endnote %}

***

