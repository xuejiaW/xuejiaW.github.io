---
title: V2Ray  翻墙教程
mathjax: false
date: 2019-06-14 00:00:50
categories:
- 教程
- 翻墙梯子
tags:
- 翻墙梯子
- 软件推荐
---



简单介绍V2Ray以及如何通过V2Ray搭建梯子。



<!--more-->

SS及SSR因为其易用性和使用人数的广泛，已经逐渐被GFW识别。但最近我和我的朋友搭建的SSR都相继因为IP被禁而无法使用。我可以理解而且在一定程度上也是支持GFW的存在，但在一些情况下也不得不需要绕过GFW来找寻一些工作中需要的资料。这篇教程也是为那些同样有迫切需要的人而写，技术无罪，但切不可利用技术行恶。

## V2Ray概述

`V2Ray`是`ProjectV`下的一个工具。`ProjectV`是一个帮助打造专属基础网络通信的工具集合，`V2Ray`是其中最核心的一个工具，主要负责网络协议和功能的实现，目前最多的使用场景就是使用特殊的网络协议来绕开GFW的深度包检测进而实现翻墙的目的。

## V2Ray搭建

### V2Ray服务端安装

使用`V2Ray`搭梯子同样需要购买VPS及使用`SSH`登录VPS进行配置，这一部分在之前的`ShadowsocksR 翻墙教程`已经做了说明，这里就不重复介绍了。需要注意的一点是，为了避免安装过程中出现`command not found`等问题，建议使用`Debian 8.x`以上或`Ubantu 16.04`以上的版本操作系统，我个人使用的是`Ubuntu 18.04 x86_64`操作系统。

> 如果出现`SSH`无法登录购买的VPS服务器，可能是VPS的IP被封，可以通过网址`ping.pe`进行检测，在输入要检测的VPSIP地址后，该网站可以从全球不同的节点去访问该地址，如果国内的节点丢包率都在100%，则说明该IP已经被封。如果是在搬瓦工上购买的VPS，可以在`https://bwh88.net/ipchange.php`网站上进行付费的更换IP服务，目前价格是8美元左右。

> 在windows环境下因为WSL的加入，可以不下载XShell直接进行连接，使用命令 `ssh root@<ip> -p <port>`即可

因为`V2Ray`的验证方式包含时间，客户端及服务端的时间误差必须在90秒内，这个时间误差是考虑了时区问题的，比如客户端位于东八区，时间为23点20分，服务端位于西四区，时间为11点20分，虽然绝对时间不同，但是这是因为时区造成的，实际两者不存在误差，即可以正常运行。

在成功通过SSH连接到VPS后可以通过`date -R`命令检查服务端（VPS）的时间及时区，如果结果存在问题，可以使用`date --set`命令来修改时间，如`sudo date --set="2017-01-22 16:16:23"`。

客户端的时间即为终端电脑或手机的时间，这里就不说明修改时间的方式了。

检查完时间后，通过运行`wget https://install.direct/go.sh`命令下载`V2Ray`安装脚本。

![下载脚本](/V2RayTutorial/2019-06-13-22-53-21.png)

下载完成后，通过命令`sudo bash go.sh`运行脚本

![安装结果](/V2RayTutorial/2019-06-13-23-08-07.png)

安装后会有如上图的结果，其中`PORT`和`UUID`两项（即图中马赛克部分）需要记录下来，在之后客户端的配置中需要用到。

在安装后,`V2Ray`并不会自动启动，我们还需要通过命令`sudo systemctl start v2ray`手动启动`V2Ray`。如果运行语句后无任何信息输出及表面`v2ray`启动成功。

如果以后需要更新`V2Ray`，再次运行安装命令`sudo bash go.sh`即可，这样会在保留配置文件的情况下更新`V2Ray`并重新启动。

可以使用命令`cat /etc/v2ray/config.json`来查看服务器端`V2Ray`的配置，后续章节会说明`V2Ray`的配置文件。

### V2Ray服务器加速

安装了服务器后可安装锐速加速算法：

```text
wget –N —no–check–certificate https://raw.githubusercontent.com/91yun/serverspeeder/master/serverspeeder-all.sh && bash serverspeeder-all.sh
```

### V2Ray客户端安装

#### 安卓版本

下载`V2RayNG`软件,Google商店可以搜索到，或者在[工程发布地址](https://github.com/2dust/v2rayNG/releases)下载`app-universal-release.apk`并进行安装。

软件安装成功后，点击右上角加号并选择`手动输入Vmess`，然后将服务器的地址，以及之前服务器安装成后，显示的`PORT`和`UUID`分别填入`端口`和`用户ID`两个选项中，加密方式选择为`Auto`即可。

#### Windows版本

在[V2RayN工程发布地址](https://github.com/2dust/v2rayN/releases)分别下载`v2rayN-Core`和`v2rayN`压缩包，并将其解压到一个目录下。

> v2rayN-Core官方发布地址为https://github.com/v2ray/v2ray-core/releases

之后在解压目录中找到`v2rayN`文件，并双击运行，在界面左上角选择`服务器-添加VMess服务器`并如上述安卓版本一样，将对应信息填入。服务器添加完成后，双击运行。为方便运行可以在系统右下角的折叠栏中找到`V2Ray`图标，右键并选择`启用HTTP代理`，并将HTTP代理模式选择为全局代理。

> 之后的教程中将会说明全局代理与PAC区别，以及介绍Chrome插件`SwitchyOmega`的使用。

#### MAC及IOS版本

因为我并没有苹果设备，所以这两个版本未进行过验证。但搜寻下来，普遍推荐MAC上使用V2RayX软件，IOS上使用Shadowrocket软件。两者都要注意在添加服务器时需要选择VMess类型，剩下的就是服务器地址，端口，ID的填写，这个与安卓与Windows版本并无差异，这里就不详细说明了。

{% note info simple %}
V2Ray官方版本并没有一个可视化的UI界面，以上推荐的软件都是针对V2Ray官方提供的`v2ray-core`项目的外部封装。我们可以在[v2ray-core项目地址](https://github.com/v2ray/v2ray-core/releases)上下载该版本，下载对应的压缩包并解压后，在目录下的`config.json`填写入相应的参数，并运行`v2ray.exe`即完成了客户端的运行。但对于绝大部分用户来说仍然更熟悉可视化界面，所以我在这里还是推荐了不同平台上对应的第三方软件。
{% endnote %}

## V2Ray基本原理

至此，V2Ray的配置已经结束，之后的内容是对于V2Ray工作原理的一个基本说明。因为我也是这几天在`SSR`被封禁后才查询了一些`V2Ray`相关的资料，所以这里也只是将我自己对`V2Ray`原理的一些理解写出，如果要探究细节问题话，建议查看文末引用部分的官方文档。

### V2Ray连接通路

在前面V2Ray搭建章节，我们将V2Ray分为两个部分——客户端及服务端，其实严格意义上，V2Ray并没有服务端与客户端的概念。每个V2Ray进程可以看作一个盒子，每个盒子存在至少一个入口(`Inbounds`)以及最少一个出口(`Outbounds`)，整个V2Ray的工作原理实际上就是多个盒子串联起来形成一个连接通路。如果我们用服务端及客户端的概念来看我们分别运行在VPS上的V2Ray以及运行在电脑上的V2Ray（或安卓等终端），那么连接通路就是：

> 游览器<--->客户端inbound<--->客户端outbound<--->服务端inbound<--->服务端outbound<--->目标网站

所以我们并不需要为每一个终端设置一个对应的VPS上的`V2Ray`，因为这些终端设备的切换只是更改了客户端这一个盒子，而服务端并不关心客户端是什么，只需要客户端能有正确的`inbounds`和`outbounds`即可。

每一个V2Ray进程都需要一个配置文件来指定需要的参数，其中最重要的参数便是`Inbounds`和`Outbounds`。下面会针对这个配置文件进行一些说明，为了简化阐述，我们将运行在PC上的V2Ray看作是客户端，运行在VPS上的V2Ray看作是服务端。

#### 客户端配置文件

在客户端的配置文件为安装目录下的文件`config.json`，文件是以json格式进行编写。这里不会详细的去分析客户端配置文件的每一行，我们目前只关注于`inbounds`和`outbounds`，我也不会对每个字段都进行分析。如果需要了解每一部分的每一个字段，可以查询[v2ray的官方文档](https://v2ray.com/)中配置文件这一章节。

首先看`inbounds`，以下是我自己的客户端的配置文件中的`inbounds`部分。

```json
"inbounds": [
    {
      "port": 10808,
      "listen": "127.0.0.1",
      "protocol": "socks",
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      },
      "settings": {
        "auth": "noauth",
        "udp": true,
        "ip": null,
        "clients": null
      },
      "streamSettings": null
    }
  ]
```

可以看到`inbounds`字段包含一个数组，在当前的配置文件中，数组中只有一个元素(仅有一个大括号)，官网中将`inbounds`中的每一个元素定义为`InboundObject`。这里也对应了之前所说的，一个v2Ray进程可以有多个inbound，同理也可以有多个outbound。在有多个bound的情况下，可以使用`routing`字段来设定选择的规则，在未设定该字段时，默认以第一个bound进行运作，之后的章节会简单说明下`routing`字段。

这里的配置文件所想表达的就是：从127.0.0.1（`listen`）地址的10808端口(`port`字段)以socks协议(`protocol`字段)从上一级（在本例中为游览器）接受数据。（如果在V2RayN等软件中设置为全局模式，则实际上是监听所有端口）

关于不同协议的设置都放在`settings`字段中,根据协议的不同`settings`中的字段格式也会不同，这里就不对每个协议进行说明了。

`sniffing`和`streanSetting`分别代表探测流量类型的设置和底层传输配置,因为这两个部分修改的比较少，我也没做研究。还是那句话，有需要看官方文档。

然后是`outbounds`部分，`outbounds`也同样是数组结构，其中每一个元素称为`OutboundObject`，这里因为篇幅关系，我仅黏贴了第一个`OutboundObject`

```json
  "outbounds": [
    {
      "tag": "proxy",
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "67.216.197.176",
            "port": 27533,
            "users": [
              {
                "id": "25585281-69bd-4b72-9239-303bee11f555",
                "alterId": 64,
                "email": "t@t.tt",
                "security": "auto"
              }
            ]
          }
        ],
        "servers": null,
        "response": null
      },
      "streamSettings": {
          //因为篇幅省略了该部分
      },
      "mux": {
        "enabled": true
      }
    },
    {
        //另一个outboundObject
    }
```

可以看到这里用的协议就是`vmess`协议，这就是V2Ray与SSR最大的区别，SSR用的协议是`Shodowsocks`。这里`settings`字段中的设置就是针对于`vmess`协议的了，我们可以看到需要填写服务端的地址，端口及id，这里就是之前我们在配置客户端中需要填写的数据，我们在UI中添加服务器时，软件实际上就是修改了安装目录下的这个文件。

这个OutboundObject实际表达的意思为：将从Inbound中获取到的数据，以`vmess`协议发送给`67.216.97.176`地址的27533端口，在`vmess`中以25585281-69bd-4b72-9239-303bee11f555作为ID进行加密。

其他的字段含义同样可以在官方文档中找寻到，这里就不详细说明了。

#### 服务端配置文件

服务器的上配置文件地址为/etc/v2ray/config.json，我们可以在Xshell中通过`cat`命令进行查看，如果需要则可以使用`vi`命令进行修改，在修改完成后可以使用v2ray提供的test命令来检查配置文件的语法和格式是否正常（不包含连接性问题的检查）。

```text
cat /etc/v2ray/config.json
vi /etc/v2ray/config.json
/usr/bin/v2ray/v2ray -test -config /etc/v2ray/config.json
```

还是以我自己的服务端(地址为67.216.197.176)配置文件为例，首先我们看`inbounds`部分

```json
  "inbounds": [{
    "port": 27533,
    "protocol": "vmess",
    "settings": {
      "clients": [
        {
          "id": "25585281-69bd-4b72-9239-303bee11f555",
          "level": 1,
          "alterId": 64
        }
      ]
    }
  }],
```

如上所述，`Inbounds`是从上一级接受数据，这里的上一级就是我们的客户端V2Ray。客户端V2Ray的outbounds协议为`vmess`，所以这里对应的inbounds协议为`vmess`，同理id，端口也要一一对应。

然后再看`outbounds`部分

```json
  "outbounds": [{
    "protocol": "freedom",
    "settings": {}
  }
```

这里的协议为`freedom`，即直接发送给下一级，在本例子中为目标网址。

综上整个连接通路的详细流程为：游览器通过`socks`协议将数据发送给客户端，客户端用`Vmess`协议将数据加密并传出，服务端用`Vmess`协议接受数据并解密，服务端直接用解密后的数据访问目标网站。正是因为客户端在传出数据时进行了加密，所以可以躲避`GFW`的深度包检测，当数据成功传递给服务端时，只要将数据进行解密，就可以正常的浏览目标网站。

### V2Ray路由选择

前面可以注意到在一些`OutboundObject`中有字段`tag`，这个字段就是供选择时区分不同的Object。选择的规则是在`routing`字段中进行设定，这里我们还是通过一个例子进行说明

```json
"routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": ["geosite:cn"] // 中国大陆主流网站的域名
      },
    ]}
```

`domainStrategy`字段表示选择时的策略，当前的`IPOnDemand`表示如果有任何基于IP的规则，则立即以这些规则进行匹配。`rules`字段则是匹配的具体规则，注意这个字段也是个数组，我们可以指定多个规则。
规则中的`type`变量目前只有`field`这一个参数，所以也就不需要纠结。`domain`字段表示以域名进行匹配，例子中满足匹配的条件是中国大陆主流网站的域名。`outboundTag`则表示如果匹配成功，则选择`tag`为`direct`的`OutboundObject`。

关于匹配的其他规则如何写，如按IP进行匹配等，可以看官网上`路由配置`这一章节。


{% note info simple %}
1. V2Ray官网 https://v2ray.com/
2. V2Ray白话教程 https://toutyrater.github.io/
{% endnote %}

***