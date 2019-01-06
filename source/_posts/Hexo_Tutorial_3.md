---
title: Hexo教程（三）
date: 2019-01-06 13:31:43
tags: Hexo
categories:
- 教程
- Hexo
---

这一篇主要是说明标签页面和分类页面如何创建以及一些针对主题的细枝末节的修改，关于主题的修改大多大同小异，所以这里只选了几个[官网教程](http://theme-next.iissnan.com/theme-settings.html)中的例子。

## 创建标签页面

先运行`hexo new post tags`创建tag页面资源，再在主题配置文件中找到`menu`字段，并启用tags

```yml
menu:
  tags: /tags/ || tags
```

之后在刚新生成在source文件夹的tags文件夹中找到`index.md`，在其中增加`type: "tags"`，并修改`Title`为自己想要的文字

```yml
---
title: 标签
date: 2019-01-06 00:21:31
type: "tags"
---
```

在下图的红框及黄框处都会自动链接到Tags页面，Tags页面也将自动统计目前所使用的标签数
![标签显示效果](Hexo_Tutorial_3/2019-01-06-13-43-18.png)

## 创建分类页面

运行`hexo new page categories`创建分类页面，之后的操作与创建标签页面类似，这里不做赘述。

## 设置代码风格

在主题配置文件中修改`highlight_theme`字段，目前共有`normal`,`night`,`night eighties`,`night blue`,`night bright`，五种选项

```yml
highlight_theme: night
```

## 社交链接

在主题配置文件中修改`social`字段，其格式与`menu`字段相同，|| 前为链接，后为`Font Awesome`图标

```yml
social:
  GitHub: https://github.com/xuejiaW || github
```

## 打赏功能/订阅微信公众号

分别在主题配置文件中修改`reward`及`wechat_subscriber`字段

```yml
reward:
  enable: true
  comment: Donate comment here
  wechatpay: /images/wechatpay.jpg

wechat_subscriber:
  enabled: true
  qcode: /path/to/your/wechatqcode e.g. /uploads/wechat-qcode.jpg
  description: e.g. subscribe to my blog by scanning my public wechat account
```

## 动画效果修改

在配置文件中修改`motion`字段下的相应设置即可。

```yml
motion:
  enable: true
```

## 修改文末#符号

每一篇文章如果打上了Tag，则会在文末显示`#<tag>`这样的标记，但#显得不太美观，而且无法直接的表现出其标签的含义，所以这里想将其替换为图标

找到`themes/next/layout/_macro/post.swig`文件，并在其中搜索`rel="tag"`字段，并将其后的`#`修改为`<i class="fa fa-<FontAwesome icon>"> </i>`即可

```swig
<a href="{{ url_for(tag.path) }}" rel="tag"><i class="fa fa-tags"> </i> {{ tag.name }}</a>
```

上例中的tags即为[FontAwesome图标](https://fontawesome.com/icons?d=gallery)
