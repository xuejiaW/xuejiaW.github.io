---
created: 2022-02-02
updated: 2023-06-04
tags:
    - 计算机网络
title: 《Computer Networks and Internets》 Ch 13 局域网：数据包，帧 和拓扑结构
published: true
date: 2023-06-04 15:40
description: 本篇为 《Computer Networks and Internets》 的第十三章笔记， 这一部分将介绍分组交换技术，拓扑结构，硬件地址寻址，帧的概念。
---

# Introduction

这一部分将介绍分组交换技术，拓扑结构，硬件地址寻址，帧的概念。

# Circuit Switching And Analog Communication

`电路交换（Circuit Switching）`概念是指使用时在发送端和接收端之间建立不受干扰的通路的通信方法。电路交换通常与模拟电话技术相关。下图是电路交换的示意图：

![电路交换](/ch_13_local_area_networks_packets,_frames,_and_topologies/2019-12-09-08-28-27.png)

电路交换的主要特点是：

1. 是点对点的通信
2. 有单独的步骤建立电路连接，使用电路，终止电路连接
   例如在电话通信中，实际上有三步。第一步在电话发起人和接受者之间建立电路，第二步双方使用电路进行通信，第三步在通话结束后，终止通路。
   这也是称为交换（Switched）电路的原因
3. 与固定的物理通路有相同的性能。

电路交换建立的电路最终使用频分复用或者时分复用使用同一个媒介进行传输。电路建立的过程包括在频分复用或时分复用中分配频率或时间段。

# Packet Switching

分组交换（Packet Switching）使用一种统计意义上的复用，即多个信源之间竞争共享媒介的使用。电路交换通常在传统的电话通信中使用，而分组交换构成了因特网的基础。分组交换示意图如下：

![分组交换](/ch_13_local_area_networks_packets,_frames,_and_topologies/2019-12-09-08-37-20.png)

注意，在11章中提到的复用技术，如频分复用和时分复用是对于物理存在的信道或者像电路交换这样生成的信道使用的，与分组交换并没有关系。分组交换本身就有统计复用（Statistic Multiplexing）的概念。多个信源在媒介空闲时竞争使用，当媒介为空，且只有一个信源需要传输数据时，该信源就会独占媒介。如果同时有多个信源要传输数据，则基本每个信源占据媒介的时间是平均的，轮流使用。

分组交换的核心是将原数据切分成一个个小块方便传输，这些小块称作包（Packets），包中需要包括传送的目的地信息（在之后节会更详细说明）。分组交换传输的单位不是bit或者byte,而是包。不同的分组交换技术对于包的尺寸有不同的定义。

分组交换的主要特点是：

1. 任意大小的异步传输
2. 在通信前没有建立通路的步骤
3. 性能取决于各信源的包的统计复用

分组交换的主要优点在于成本的控制。对于电路交换来说，如果有$N$个电脑，则需要$N/2$个独立的路径（虽然在连接时才创建）。但对于分组交换只要一个共享的电路就行。

# Local And Wide Area Packet Networks

分组交换技术通常根据传输距离的距离进行分类。通常分为三类：

1. 局域网（Local Area Network,LAN）：最便宜，通常范围在房间级或者一个大楼。
2. 城域网（Metropolitan Area Network,MAN）中等开销，范围涵盖城市或者大都会。
3. 广域网（Wide Area Network,WAN）：最贵。范围通常包含城市与城市之间。

在实际使用中，虽然城域网的概念被提出，但在商业上并不成功。基本广泛使用的只有局域网和广域网，城域网的概念在逐步被纳入广域网中。

还有一些机构或者商家定义的类似的分类方式，如：

1. `个人局域网络（Personal Area Network，PAN）`，通常范围在几米内，如蓝牙通信等。
2. `芯片局域网络（Chip Area Network）`，芯片厂商提出的概念，通常是超大型电路（Very-Large-Scale-Integration,VLSI）中多个核之间的通信。

# Standards For Packet Format And Identification

每个在网络中传输的包都必须包含其目标收信人的标识。需要有规范来制定标识的格式以及添加的位置，在LAN领域最常用的标准是由IEEE（Institute Electrical And Electronics Engineers）创建的。

IEEE是由一群关注于协议栈最下两层（物理层（Physical）和数据链接层（Data Link））的工程师构成的。协议栈的不同层由不同的机构负责，如IEFT关注传输层和因特网协议，WWW组织关注应用层。机构与其关注的协议如下图所示：

在1980年，IEEE组织了`802项目局域网/城域网标准委员（Project 802 LAN/MAN Standards Commitee）`会为网络设定标准。

![组织和协议](/ch_13_local_area_networks_packets,_frames,_and_topologies/2019-12-09-09-12-05.png)

# IEEE 802 Model And Standards

IEEE将数据链接层又在细分为了两层，`逻辑链接控制层（Logical Link Control,LLC）`(第15章中描述)和`媒介访问控制层（Media Access Control,MAC）`。

逻辑链接控制层设备的地址和在解复用中地址的使用。媒介访问控制层关注于多个计算机如何共享底层的媒介。

IEEE对于协议的命名是采用多部分标识符，如$XXX.YYY.ZZZ$，$XXX$表示协议的分类，$YYY$表示协议的子分类，$ZZZ$是当子分类也非常大是，额外添加的标识。

如局域网的规范在分类802中，这里的802并不是什么缩写或有实际的技术含义，仅仅是一个分类标识。IEEE不同的工作小组针对其细分的协议进行定义，如针对$802.1$或$802.2$。

IEEE中有许多不同的工作小组。当有新技术需要协议时，由工业代表和学术协会共同形成工作小组，他们会定期开会商定协议的细节等，当协议的所有细节都确定后，IEEE会发表协议的标准文件。

当协议最终发布后，工作小组可以选择解散或者如果协议非常重要或者仍需要后续工作，小组也可以继续活动。如果小组负责的部分协议不再有意义，如商业上不被接受，或者有更新更好的技术出现，小组也可以选择直接解散而不发表任何的规范。下图是802分类下的协议，有一些规范就已经被放弃（Disbanded）了。

![802协议](/ch_13_local_area_networks_packets,_frames,_and_topologies/2019-12-09-09-25-59.png)

## LAN Topologies

因为有许多不同的LAN技术，通常使用拓扑型或者网络的基本形状来进行分类。LAN有四个基本的拓扑型，`总线型结构（Bus）`，`环状结构（Ring）`，`星状结构（Star）`，`网状结构（Mesh）`。

## Bus Topology

`总线型结构（Bus Topology）`是如同以太网一样，用一根电缆连接所有电脑，任何电脑都可以将数据传输到电缆上，然后所有的计算机都可以接受到数据。

## Ring Topology

`环状结构（Ring Topology）`是多个电脑首尾相接的连接，直至成为环形。环形结构的优点是对于相连的两台设备来说连接是安全的，即使别的设备出现问题仍然可以连接。

## Mesh Topology

`网状结构（Mesh Topology）`为任意两两配对的电脑都提供了连接线路，这意味着如果有$N$台电脑，就需要$\frac{n^2-n}{2}$个连接。当增加电脑时，连接电缆的增加是平方级的，因此开销巨大，也因此网状结构在局域网中不常被使用

## Star Topology

`星状结构（Star Topology）`是所有的电脑都连接在一个中心设备（Hub）上。注意星状结构并不严格要求中心设备真的在所有电脑的中心，与所有电脑的距离相同。

## The Reason For Multiple Topologies

每个结构都有各自的优点，如环状结构很适合各电脑间协调访问，但当其中一个设备出现问题时，通路就会出现问题。星状结构下单一设备出现了问题，其他设备都可以正常访问。总线结构有最少的连接需求，但与环状结构与相同的缺点。网状结构因为连接数量过多，通常不在局域网中使用。

# Packet Identification，Demultiplexing，Mac Addresses

IEEE为寻址（Addressing）创建了标准。在分组交换中，解复用是依赖于一个称为`地址（Address）`的标识。每个电脑都分配了一个独特的地址，每个传输的包中都包含其目标收件人（Intended Recipent）的地址。

在IEEE的寻址规范中，每个地址是由48-bit二进制数据组成的，IEEE将其称为媒介访问控制地址（Media Access Control address,MAC address）。因为48位地址来源于以太网技术，所以也有人将其称为以太网地址（Ethernet Address）。

IEEE为每块网卡（Network Interface Card，NIC）都分配了地址，因此当消费者购买了一张网卡时，其中就包含一个独一无二的地址。

但IEEE并不是单独的为每个网卡分配地址，它是将前24位（3 Bytes）分配给设备供应商，然后设备供应商再决定后24位的数据。因此前24位称为组织唯一标识符（Organizationally Unique Identifier，OUI），后24位称为网络接口控制标识符（Network Interface Controller Specific）。

组织唯一标识符的最高有效字节（Most Significant Byte，即大端模式下即最左端）的倒数两位有特殊含义。其最低位表示是单播（0）还是双播（1）。倒数第二位决定该设备是全球唯一（0）（Globally Unique）还是是本地分配（1）（Locally Assigned），全球唯一表明地址是IEEE分配，即世界上的每块网卡都有不同的表示，而本地分配是实验性网卡或者某组织自己地址空间等，即这张卡是在一个小范围内内部使用。

# Unicast，Broadcast，And Multicast Addresses

IEEE定义了三种对应包传递的方法：

1. 单播（Unicast）：目标地址是设定一个电脑，也仅这个电脑可收到包
2. 广播（broadcast）：网络中的所有电脑都可收到包
3. 多播（multicast）：目标地址是一系列的电脑，这些电脑都可以收到包。

对于广播来说，因为是所有电脑都收到包，所以目标地址实际是没有意义的。将地址的48位全部设为1，则表示是广播模式。广播模式也可看作是多播模式的一个特殊情况。

# Broadcast,Multicast,And Efficient Multi-Point Delivery

广播和多播模式在局域网中特别有用，对于要传递给多台电脑的数据来说，用这两种方法进行传递特别的高效。

对于大多数的LAN技术，都是通过一个共享的媒介进行传输。当有数据在媒介中传输时，每台电脑都将从媒介中获取包的拷贝，然后再判断包中的地址情况是否与自己复合，来决定是处理包的内容还是丢弃包的内容。

因此局域网中的计算机在处理媒介中的包流程如下：

1. 从包中抽取出地址信息
2. 判断地址是否满足自己的单播地址，如果是则接受并处理包
3. 如果2失败，判断地址是否是广播模式，如果是则接受并处理包
4. 如果3失败，判断地址是否是多播模式，且电脑是多播模式指定的电脑组的一员，如果是则接受并处理包
5. 如果4失败，则丢弃包

如在局域网情况下，如果多台电脑使用同一个媒介，且包需要传递给多态电脑，那么使用多播和广播模式，数据仅需要发送一次即可。

# Frames And Framing

在同步通信系统中，帧的概念是让接收者知道数据的开始和结束。但在更宽泛的概念下，帧是表示一系列bit或byte的特定结构，让接收方和发送方都能一致同意的特定格式。

在分组交换中，帧的概念就对应包。在分组交换中，每个包都需要一个数据头，数据头（header）中包含目标地址。数据头后是有效负载（payload），即真正需要传输的原数据。在大部分的网络技术中，有效负载是不透明的即网络设备只能检查数据头。

在整个包的前后还能加入可选的前置数据（Prelude）或后置数据（Postlude）。因此整个包的结构如下所示：

![包的结构](/ch_13_local_area_networks_packets,_frames,_and_topologies/2019-12-09-10-47-15.png)

举一个例子，如果一个包有6个byte的数据头，然后任意长度的有效负载，在包的前后各有1byte表示包的开始和结束。且开始和结束标识用ASCII码中的SOH（Start Of Header）和EOT（End Of Transmission）表示，则整个包如下所示：

![包的例子](/ch_13_local_area_networks_packets,_frames,_and_topologies/2019-12-09-10-49-20.png)

上述例子有一点点数据的浪费，因为如果包是一个接一个发的，那么后一个包的SOH会紧跟着前一个包的EOT。在实际中，只需要一个来区分两个包即可。

虽然包的前置数据和后置数据是可选的，但在实际使用中，他们可以一定程度上提升异步传输数据的处理速度和对错误的检测。在异步传输中，如果接收方收到了EOT，它就知道数据包传输完成了，可以直接开始处理数据而不需要等到下一个包的到来再根据新包确定上个包是否完成。当发送端发送数据到一般崩溃时，因为接收端始终收不到EOT，也就能知道错误的发生。

# Byte And Bit Stuffing

在ASCII码中，SOH用十六进制0x01表示，EOT用0x04表示。如果有效负载中也出现了0x01和0x04，接收端就无法判定到底是真实数据还是前置或后置标识。

一种称为字节填充（byte Stuffing）就是为了解决有效负载和特殊标记位有相同表示导致无法识别的问题。
该技术有时也称为数据填充（Data Stuffing）或字符填充（Character Stuffing）。该技术主要是

字节装填是用另一个字符来替代特殊标识的出现。

如我们选择用ASCII码中的ESC字符（Ox1B）来作为替换字符。在发送端当有效负载中出现SOH，那么就替换为"ESC A"，如果出现EOT,就替换为"ESC B"，如果出现了ESC就替换为"ESC C"。注意这个计算是针对有效负载的，当整个发送的有效负载中就不会与EOT和SOH相同的数据。对接收端而言，去找寻背后跟着"A,B,C"的ESC字符，然后将其替换回SOH和EOT的数据。发送端的替换过程如下所示：

![字节装填](/ch_13_local_area_networks_packets,_frames,_and_topologies/2019-12-09-11-22-32.png)

# Reference
[Switching technology](https://web.archive.org/web/20171217042848/http://www.cs.virginia.edu/~mngroup/projects/mpls/documents/thesis/node8.html)
[【计算机网络】数据交换技术和多路复用技术的正（nao）确(can)打开方式](https://www.cnblogs.com/penghuwan/p/7686059.html#_label3_1)
