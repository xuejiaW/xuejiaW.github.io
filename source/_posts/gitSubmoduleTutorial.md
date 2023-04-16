---
title: Git 子模块 Submodule 教程
mathjax: false
date: 2019-09-11 21:40:41
tags:
categories: 
- 教程
- Git
---



介绍git submodule的使用与可能遇到的问题。



<!--more-->

很久没有更新博客，打开一看发现awesome的图标都无法显示了，版本回滚后仍然无法显示，估计是nexT更新导致的，查看后发现的确nexT更新了大版本。

但是原始工程在家里的台式机上，发现笔记本从github上拉下的工程并没有将nexT作为一个git仓库，于是只能将整个文件夹删除后进行覆盖更新。

但这样的方式肯定是不能长久维护的，于是想将nexT作为项目的子模块进行管理。在这里我整理了使用git submodule对项目进行子模块管理的方法和常见问题。

## git命令

### 添加子模块

如需要将远程项目`xuejiaW/hexo-theme-next`作为子模块，并且下载到目录themes/next下，则运行命令

``` text
git submodule add git@github.com:xuejiaW/hexo-theme-next.git themes/next
```

然后可以看到目录下出现了`.gitmodules`文件，其中记录了子模块保持地址及Url

```text
[submodule "themes/next"]
	path = themes/next
	url = git@github.com:xuejiaW/hexo-theme-next.git
```

### 查看子模块

```text
git submodule

//可以看到类似结果
//733d8e492aafe21abc971f853aa9e7b8b6196425 themes/next (v7.4.0-13-g733d8e4)
//表示子模块最新的patch及子模块保存地址
```

### 初始化及更新子模块

```text
git submodule init
//初始化本地的子模块配置文件，在拉取了一个带有子模块的工程后，需要先执行init

git submodule update
//更新子模块（如子模块文件夹为空，则会下载子模块）
```

### 提交子模块修改

当子模块有修改时，在主项目上`git status`并不会完全显示修改的文件，只会显示被修改的子文件夹，如

```text
modified:   themes/next (modified content)
```

然后需要进入子模块进行常规的`add`，`commit`等操作，将子模块的改动提交

```text
cd themes/next
git add --a
git commit -s -m"Modify submodule"
```

{% note danger simple %}
在子模块提交时，请确认分支是否正确，否则可能会造成提交到远程仓库的commit ID不符，导致其他工程开发者在运行`git submodule update`时出错
{% endnote %}

此时回到主工程，再次status查看

```text
cd ../../
git status

...
modified:   themes/next (new commits)
```

用`diff`语句查看改动，可以看到改动的是子模块最新的`commit ID`，这可以理解为主工程保留了每个子模块最新的`commit ID`指针，当运行`git submodule update`时，就是将每个子模块更新至各自最新的`commit ID`

```text
git diff themes/next

...
-Subproject commit 733d8e492aafe21abc971f853aa9e7b8b6196425
+Subproject commit 1da46ea43f2084eb2be519162b8d9ccb8d45e660
```

将这个改动提交，那么远程仓库也就更新了子模块的最新指针。

### 删除子模块

删除子模块相比于之前的操作要复杂些

1. 删除`.gitmodules`中的子模块内容
2. 删除`.git/config`中的子模块内容
3. 删除`.git/modules`中的子模块对应文件夹
4. 运行`git rm --cached -r themes/next`删除对应子模块文件夹的索引
5. 删除子模块文件夹

## 常见问题

### xxx already exists in the index 

出现在`git submodule add`时，说明同一文件夹路径下有其他子模块。如果已经手动删除，错误仍然存在，可能是路径索引导致，需要完整执行删除子模块操作。

### server does not allow request for unadvertised object

出现在`git submodule update`时，说明主工程中保持的最新的子模块`commit id`，无法在服务器子模块工程中找到，可能是因为子模块改动未提交，或者提交分支错误导致`commit id`改变。



{% note info simple %}
引用：
1. Git 工具 - 子模块 https://git-scm.com/book/zh/v1/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97 
2. Git submodule 子模块的管理和使用 https://www.jianshu.com/p/9000cd49822c
{% endnote %}

***