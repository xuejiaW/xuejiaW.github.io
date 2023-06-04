---
created: 2022-02-02
updated: 2023-06-04
tags:
    - 计算机网络
title: 《Computer Networks and Internets》 Ch 14 MAC 层
published: true
date: 2023-06-04 16:03 
description: 本篇为 《Computer Networks and Internets》 的第十四章笔记， 这一章将会深入讨论MAC层，包括多路访问协议（multi-access protocols）以及静态和动态信道分配。
---

* 这一章原书中的Statiion一词，在笔记中翻译为`终端`。

# Introduction

这一章将会深入讨论MAC层，包括多路访问协议（multi-access protocols）以及静态和动态信道分配。

# A Taxonomy Of Mechanisms For Shared Access

实现多个计算机通过一个共享媒介来访问数据主要有三种方法： （1）复用技术（Multiplexing Technique） （2）分布算法来控制访问（Distributed Algorithms For Controlled Access） （3）随机访问策略（Random Access Strategy）

* 这里的复用技术与在11章中讨论的复用核心思想是相同的，但仍然有略微区别。11章中提到的是物理上的复用，通过复用器将信号合并在一起。这里的复用则是对于共享信道的逻辑划分，使不同的终端占用共享信道的部分资源，所以这里的复用技术也称为`信道协议（Channelization Protocols）`。

下图展示了按照共享媒介所使用的方法的分类：

![共享媒介的分类方法](/ch_14_the_ieee_mac_sublayer/2019-12-27-22-55-32.png)

# Static And Dynamic Channel Allocation

信道分配是与第11章中提到的复用技术相关联的。以频分复用为例子，在第11章中是每个终端都有它的载波频率，终端与载波频率是一对一的关系，这就是`信道的静态分配（Static Channel Allocation）`。

信道可以静态分配的前提是预先知道终端的存在，而且终端在传输过程中不会发生变化。而在许多的场景下，终端是会变化的，例如一个路由器负责房间内手机的信号，但是手机可以关闭或者离开房间，这就是终端的变化。

在这种情况下就需要`信道的动态分配（Dynamic Channel Allocation）`，即当终端出现时才分配信道的资源给终端。

# Channelization Protocols

与第11章中的复用技术相似，信道分配也存在频分多路复用（Frequency Division Multi-Access），时分多路复用（Time Division Multi—Access），码分多路复用（Code Division Multi-Access）三种类型。

## FDMA

频分多路复用下每个终端都可以选择一个载波频率，这个频率并不会影响到其他的终端。在有些系统下存在一个中央控制器进而支持动态的频分多路复用：当一个新的终端出现，中央控制器用一个预留的信道与终端通信，然后分配一个未使用的载波频率给这个终端，之后终端都使用这个载波频率传输数据。

### TDMA

时分多路复用下，所有终端按顺序编号，如$1,2,3,...N$，并且会按这个顺序占据信道进行传输。如同频分多路复用，在某些系统下支持动态分配，即终端出现时再分配给他信道的占用时间段。

### CDMA

码分多路复用如同码分复用，通过数学方法将多个终端的数据合并在一起，再同时通过信道进行传输。

# Controlled Access Protocols

访问控制协议（Controlled Access Protocols）为统计复用提供了方法，主要分为三个类型：

1. 轮询（Polling）：控制中央持续的询问每一个终端是否要发送数据。
2. 预留（Reservation）：终端需要发送信息时，发出一个在下一次循环时发送数据的申请。
3. 令牌传递（Token Passing）：终端间循环传递一个令牌，当终端持有令牌时可以发送数据。

## Polling

`轮询（Polling）`系统是存在一个中央控制器，这个控制器会询问其下的每个终端是否需要传递数据。轮询可以再细分为两种，`轮询调度顺序（Round Robin Order）`和`优先顺序（Priority Order）`。在轮询调度顺序下，每个终端都有相同的机会传递数据，而在优先顺序下，一些终端会有更多的机会去传递数据。

轮询的算法实现伪代码如下：

```pseudocode
For Centralized Controller:
while(true)
{
  Select a station S, and send a polling message to S;
  Wait for S to respond by sending a packet or passing;
}
```

## Reservation

`预留（Reservation）`系统多用在航天系统中，系统分为两个步骤，在第一步中需要传输数据的终端申请，所有申请的终端构成一张表，在第二步中表中的终端开始传输数据。通常第一步与第二步使用的是不同的信道，即有一个信道专门用来接受申请信息，另一个信道作为主信道传递每个终端的数据。

预留的算法实现伪代码如下：

```pseudocode
For Centralized Controller:
While(true)
{
  Form a list of stations that have a packet to send;
  Allow stations on the list to tranmit;
}
```

## Token Passing

`令牌传递（Token Passing）`被用在多个局域网（LAN）技术中，被用的最多的就是环形拓步结构中。在一个网络中，某一台计算机持有着一个特殊的控制命令，这个命令被称作为令牌，持有令牌的计算机可以发送数据，在发送完毕后将令牌传递给下一个计算机。

令牌传递的算法实现伪代码如下：

```pseudocode
For each computer:
While(true)
{
  Wait for the token to arrive;
  Transmit a packet if one is waiting to be send;
  Send the token to he next station;
}
```

环形拓补结构中，存在物理的环形链接，所以令牌可以直接传递给相邻的下一个电脑。在其他的拓步结构中，所有的计算机都被赋予了一个逻辑顺序，因此可以获知下一个要收取令牌的电脑是哪个。

# Random Access Protocols

许多网络，特别是局域网络中，并不使用访问控制协议，而使用`随机访问协议（Random Access Protocols）`。随机访问协议下只有当终端存在数据要发送时，才会被给予权限（在访问控制协议中，每个终端都要被持续检查）。这里的*随机*是在所有终端都有数据要发送时的处理方式。随机访问协议也可以被分为三类：

1. ALOHA：早期夏威夷的无线电网络中被使用的协议。在教科书中比较流行，因为便于分析，但在实际网络中已不再使用。
2. CSMA/CD（Carrier Sense Multi-Access With Collision Detection）：原以太网的基础，现在也不再使用。
3. CSMA/CA（Carrier Sense Multi-Access With Collision Avoidance）：Wifi无线网络的基础。

## ALOHA

在早期夏威夷的网络中使用，在这个系统下有一个强大的发送器被部署中在物理上的中心位置，其他的终端（通常对应一台计算机）在这个发送器周围部署，这些终端都没有足够的能量将数据直接传输给其他终端，因此需要通过中央的发送器。

中央发送器用两个载波频率与每个终端通信，一个被称为入站频率（In Frequency，407.305MHZ），一个被称为出站频率（Outbound Frequency，413.475MHZ）。终端通过入站频率将数据传递给中央发送器，中央发送器通过出站频率将数据发送给每个终端。

ALOHA的实现逻辑很直接：当终端有数据要发送时，使用入站频率将数据传递给中央数据站，中央数据站通过出站频率将数据传给所有的终端，终端检查数据是否是自己需要的。为了保证数据被正常发送，发送终端也需要监听出站频率，当发送的数据拷贝被传输回发送终端，发送终端确认数据被正常传递了，就会传输下一个数据。反之，则会在一段时间后尝试重新发送。

当两个终端同时使用各自的入站频率传输数据时，两个数据会发送混淆，进而导致信息错误，将这种情况称为信道冲突（Collision）。协议通过等待一段时间后重新发送数据来解决冲突，重新发送数据前的等待时间的设定尤为关键，如果两个终端等待的时间相同，那么再次发送数据时仍然是同时发送则会继续导致冲突。因此等待时间是随机的，但是网络繁忙时，冲突的概率仍然会增加，因为即使是随机时间仍然可能会与其他的终端发生冲突。

ALOHA示意图如下：

![ALOHA示意图](/ch_14_the_ieee_mac_sublayer/2019-12-28-12-56-15.png)

## CSMA/CD

1978年，数字设备联盟（Digital Equipment Corporation），英特尔（Intel）和施乐（Xerox）共同指定了个标准（DIX标准），也就是后来的以太网。最早的以太网技术使用一根长电缆连接每个电脑，这根长电缆就是共享媒介，与ALOHA使用中央发送器来实现数据传输不同，在以太网中每个终端都可以通过这个共享的线缆传输数据。以太网同样需要解决冲突问题，以太网主要引入了三个解决冲突的方法，统称为`具有冲突检测功能的载波侦听多路访问（CSMA/CD，Carrier Sense Multi-Access With Collision Detection）`：

1.  载波侦听（Carrier Sense）：

在每个终端发送数据前，先监听线缆确定是否有其他的终端正在传输数据。

2.  冲突检测（Collision Detection）：

虽然有载波侦听，但如果在线缆空闲时，两个需要发送数据的终端同时监听，此时他们都发现线缆空闲，因此都开始传输数据，这时候仍然会造成冲突。因此在传输过程中，发送终端也会持续的监听线缆，如果发现线缆中的数据与发送的数据不同，说明已经发生了冲突，数据被干扰了，于是停止数据的发送。

以太网的数据传输还有一些细节问题，如在检测到冲突时，发送端并不会立刻停止数据的发送，他仍然会传输数据一段时间，保证所有的其他终端都可以收到冲突信号。另外，当一个包被发送完后，发送终端需要等待一段时间，称为`包间间隙（Interpacket gap）`（在早期10Mbps的以太网中，包间间隙为9.6微秒），保证其他的终端可以检测到线缆的空闲并传递数据。

3.  二进制指数补偿（Binary Exponential Backoff）

如ALOHA一样，在发现了冲突后，发送端需要等待一段时间重新发送数据，这个等待时间是随机的，通常会设置一个最大延迟时间$d$，然后在$0\sim d$。如之前所述，在网络繁忙时，可能存在随机后终端仍然冲突的情况。二进制指数补偿是指在新一次冲突发生后，随机的范围变成$0\sim 2d$，如果再有冲突则变成$0\sim 4d$，依次类推。


CSMA/CD算法实现伪代码如下：

```
For each Computer:

Wait for a packet to be ready;
Wait for the medium to be idle;
Delay for the interpacket gap;
Set x to be the standard backoff range d;
Attempt to transmit the packet;

While(Collision occured)
{
 random a delay time q from 0 to x;
 delay for q microseconds;
 double x to be 2x
 attempt to retransmit the packet
}
```

## CSMA/CA

CSMA/CD并不能被运用在无线网络中，因为无线网络中的设备存在一个最远距离$\delta$。即如果两个终端的距离大于$\delta$，则CSMA/DA中的载波监听就无法被应用，因为一个终端并不能知道另一个是否在发送信息。这种情况如下图所示，如果Computer1在发送信息，Computer3是无法得知的，因此冲突只有Computer2可以知晓，这种情况称为`隐藏终端问题(Hidden Station Problem)`。

![隐藏终端问题](/ch_14_the_ieee_mac_sublayer/2019-12-28-15-00-02.png)


所以无线网络中使用`具有冲突规避的载波侦听多路访问（CSMA/CA，Carrier Sense Multi-Access With Collision Avoidance）`。以上图的例子，Computer3在发送数据前会先向所有它的$\delta$范围内的设备发出一个短信息表明自己需要发送数据了，接受到Computer3发出的短信息的设备会检查自己是否正在接受其他的数据，如果不是则回复可以发送的信号。如下图所示：

![CSMA/CA图解](/ch_14_the_ieee_mac_sublayer/2019-12-28-15-08-19.png)

如果发送端没有收到接收方的回执，则会在随机时间后再次尝试发送。
