---
created: 2022-02-02
updated: 2023-06-04
tags:
    - 计算机网络
title: 《Computer Networks and Internets》 Ch 16 无线网络技术
published: true
date: 2023-06-04 16:05 
description: 本篇为 《Computer Networks and Internets》 的第十六章笔记，介绍了个人局域网， ISM 评语，Wifi 对象，WiMax 等技术。
---

# Introduction

这一章主要介绍计算机网络无线部分的技术。

$16.2$节对无线技术依据网络的覆盖范围做了分类。
$16.3$节介绍了个人局域网。
$16.4$节介绍了ISM频域。
$16.5\sim16.11$都是介绍局域网相关技术，主要关注对象是Wifi技术。
$16.12$介绍了城域网中使用的WiMax技术。
$16.13$给出了个人局域网的标准分类列表。
$16.14$介绍了两个没有被包含在个人局域网中的短距离通信，红外线和射频识别通信。
$16.15\sim16.18$介绍了广域网技术，主要关注蜂窝式网络。
$16.19和16.20$介绍了卫星通信。
$16.20$介绍了软件无线电系统。

# A Taxonomy Of Wireless Networks

计算机网络无线技术的变种非常多的原因之一在于因为政府的管理，电磁信号的频谱被切分为了许多不同的部分以供不同的目的使用，而这些不同频域的技术通常都不同。

无线技术通常通过其使用的范围来分类，主要可分为：`局域网（Local Area Networks,LANs）`，`城域网（Metropolitan Area Networks,MANs）`，`广域网（Wide Area Networks，WANs`）以及`个人局域网（ Personal Area Networks，PANs）`。如下图所示：

![无线网络分类](/ch_16_wireless_networking_technologies/2019-12-30-15-51-47.png)

# Personal Area Networks（PANs）

上节中对于无线网络的分类与在第十三章中对于网络的分类十分类似，不同的是这里还引入了个人局域网（Personal Area Networks，PANs）的概念。个人局域网是提供非常短距离下的通信，通常是只供一个用户使用，如蓝牙耳机就属于个人局域网的应用。

个人局域网络可以再细分为以下几种：

1. 蓝牙（Bluetooth）：距离较短
2. 红外线（Infrared）：视距通信（Line-Of-Sight Communication）即发射端和接收端之间需要无遮挡
3. 紫峰（ZigBee）：距离可以支撑一个住宅的范围，在智能家居中被运用。
4. 其他ISM无线技术：为工业，科学以及医药（Industrial，Scientific，Medical，ISM）预留的频率发展的技术。

# ISM Wireless Bands Used By LANs And PANs

振幅为了工业，科学以及医药领域专门预留了一部分频域，被称为ISM无线。这部分的频域并没有再进一步细分，如科学只能用哪一段频域之类。这三个领域的产品都可以使用这部分频域，具体频域如下图所示：

![ISM频域](/ch_16_wireless_networking_technologies/2019-12-30-16-04-51.png)

# Wireless LAN Technologies And Wi-Fi

IEEE将局域网下的无线网络协议分类在$802.11$下。1999年一些销售商建立了Wifi联盟，一个生产和验证使用802.11协议的无线设备的非盈利组织。因为这个联盟的产品在商业市场上反应很好，消费者将Wifi一词与无线局域网联系在了一起，Wifi原先是产品广告词中`Wireless Fidelity`的缩写。

下表为Wifi联盟所指定的协议：

![Wifi联盟协议](/ch_16_wireless_networking_technologies/2019-12-30-16-21-32.png)

# Spread Spectrum Technology

在第十一章中提到的展频技术（Spread Spectrum Technology）在wifi技术中也有应用。

展频技术的原理是发送端将原先的信道频域再细分为多个部分，将数据通过不同的频率发送出去，接收端接受多个频率的数据，再还原出原信号。使用展频技术主要目的有两个，一是增加传输速率，另外是增加对噪声的抗干扰能力。

Wifi技术主要用了以下扩频技术，其主要目的还是帮助Wifi在有噪声环境下能更好的工作：

1. 直接扩频（Direct Sequence Spread Spectrum，DSSS）：
   
   发送端使用一个序列码得到不同的频率，用这些频率来发送数据。

2. 跳频扩频（Frequency Hopping Spread Spectrum，FHSS）：
   
   载波的频率一直在设定的几个频率间切换。

3. 正交频率复用（Orthogonal Frequency Division Multiplexing，OFDM）：
   
   将原信道分为多个小信道，每个小信道传输一部分的数据。

* 书中并未对三个技术做详细的解释，上面的概括解释也可能存在错误。

三个技术都有各自的优点，OFDM有最高的适用性，DSSS性能好，FHSS对于噪声的抗干扰能力强。

# Other Wireless LAN Standards

除了上述Wifi联盟所指定的协议，无线局域网还有其他许多的协议，都属于$802.11$协议分类下如下图所示：

![其他802.11协议](/ch_16_wireless_networking_technologies/2019-12-30-16-48-56.png)

# Wireless LAN Architecture

局域网无线网络结构主要有三个因素：（1）`接入点（Access Point）`，有时也被称为`基站（Base Station）`。（2） `互联机制（Interconnection mechanism）`，例如路由器或者交换机，用来将接入点连接在一起。（3）一系列`终端（Hosts）`，如个人手机就是一个终端。

存在两种无线局域网，一是`自主网（Ad hoc）`，其中所有的终端都可以在没有接入点的情况下相互通信。另外一个是`基础设施结构（Infrastructure）`。

在实际运用中，自主网很少存在，基础设施结构如下图所示，图中的$AP$即为接入点（Access Point），一个接入点和连接它的一系列终端称为`基本服务集（Basic Service Set，BSS）`。

![基础设施结构](/ch_16_wireless_networking_technologies/2019-12-30-16-59-39.png)

# Overlap，Association，And 802.11 Frame Format

在实际运用中，基础设施结构中的接入点如果距离太远，会出现`无服务区（Dead Zone）`，距离太仅的话，他们的覆盖的范围会出现重叠（Overlap），因此终端可能会同时存在于两个接入点的范围内。在这种情况下，终端需要指定他与哪个接入点进行通信，因此在$802.11$协议定义的网络帧格式下，帧数据必须包含其连接的接入点的MAC地址。

另外如果基础设施结构是要连接外网的，那么接入点的互联机制还需要另外一个有线连接至与外网连接的路由器，如下图所示，下图也同时展示了上述的接入点重叠情况

![外网连接以及接入点重叠](/ch_16_wireless_networking_technologies/2019-12-30-17-06-11.png)

$802.11$的定义的数据帧，还需要指定连接外网的路由器的MAC地址，综上数据帧的结构如下：

![802.11数据帧](/ch_16_wireless_networking_technologies/2019-12-30-17-07-42.png)

# Coordination Among Access Points

如上节所述，在接入点重叠的情况下，终端需要决定与哪个接入点进行通信。

主要有两种方法来实现接入点的切换，第一个是靠接入点本身，接入点能相互通信，当接入点发现有终端同时收到多个接入点信号时，接入点会判断信号强度然后帮助终端无缝切换，这种方法实现较为复杂且成本较高。第二种方法下，所有接入点都是独立的，切换是靠终端本身实现，这种方法的成本较低。

# Contention And Contention-Free Access

$802.11$定义了两种信道访问的方式：无竞争（Contention-Free）的点协调方式（Point Coordinated Function，PCF）和存在竞争的分布协调方式（Distributed Coordinated Function，DCF）。

PCF方式保证在一个基本服务集中的接入点保证下面的终端不会发生任何干扰，例如通过给每一个终端一个特定的频率来实现。但在实际中PCF从来都没有被使用过。

DCF则是让一个基本服务集中的终端都使用`随机访问协议（Random Access Protocols）`。并如同在十四章中的介绍，因为$802.11$是无线网络，所以通常使用的是CSMA/CA，终端需要发送准备完毕（Ready to Send，RTS）和信道空闲（Clear To Send，CTS）两种控制命令。

$802.11$中使用的CSMA/CA还包含一些在十四章未提及的细节，如定义了以下三个时间参数：

1. 短帧时间间隔（Short Inter-Frame Space,SIFS）为10微秒。
   
   接收端在发送确认信息（Acknowledge，ACK）或其他控制命令前的等待时间。

2. 帧间间隔（Distributed Inter-Frame Space）为50微秒。
   
   在发送端发送数据前必须等待的时间，以保证其他的终端可以监听到信道的空闲。

3. 时隙（Slot Time）为20微秒

Wifi网络中所使用的CSMA/CA如下图所示：

![Wifi网络中所使用的CSMA/CA](/ch_16_wireless_networking_technologies/2019-12-30-21-20-32.png)

因为各终端间的物理间隔以及环境噪声，微弱信号的检测是很困难的，因此Wifi网络并没有引入CSMA/CA中的冲突检测（Collision Detection）部分，即发送端并不会在数据发送过程中监听信道来判断是否有冲突。在Wifi网络中，发送端会等待ACK信号，如果没有收到ACK信号，发送端则认为数据发送失败。

# Wireless MAN Technology And WiMax

城域网技术的协议被反类在$802.16$中。如同在局域网中主要使用的是Wifi，在城域网中主要使用的事WiMax（World-wide Interoperability For Microwave Access）技术。

WiMax可以再被细分为固定WiMax和移动WiMax，前者是指服务提供方与连接者的位置是固定的，如大楼间的通信，后者则指接收方是可以移动的，如用户的手机和电脑等。

WiMax在城域网中的使用，如果是用在回传网络（服务提供方之间的连接，通常需要较高的数据速率）中则需要无阻碍（Line-Of-Sight，LOS）的连接，如果是在服务提供方与接入点直接的连接则也可以使用有阻碍的连接（Non-Line-Of-Sight，NLOS），如下图所示：

![WiMax的使用](/ch_16_wireless_networking_technologies/2019-12-30-22-02-35.png)

# PAN Technologies And Standards

PAN技术被分类在$802.15$分类下，如下图所示：

![PAN技术](/ch_16_wireless_networking_technologies/2019-12-30-22-04-05.png)

# Other Short-Distantce Communication Technologies

还有两种技术短距离的通信方式并没有被分类在PANs下，红外通信（Infrared Data Association，IrDA）以及射频识别（Radio Frequency Identification，RFID）通信。

红外通信是方向性的，大约有30°的范围，而且信号可以在障碍物表面反射，但是并不能传统障碍物。电视遥控器即是使用了红外通信。

射频识别通信，是一个芯片中包含有验证信息的Tag，接收方可以将信息从芯片中读取出来。酒店的门禁卡，大学食堂的饭卡等都是使用了这个技术。

# Wireless WAN Technologies

广域网通信有两大类，蜂窝式通信系统（Cellular communication systems）和卫星通信系统（Satellite communication system）。

蜂窝式通信系统最早是为了满足手机的电话服务设计的。在这个系统下，地区被风格为一个个小块称为`巣室（Cell）`，每个巣室都包含一个基站塔，一系列基站塔由一个移动交换中心控制。这个中心会追踪用户，并在用户从一个巣室进入另一个巣室时，提供巣室的切换服务。蜂窝式系统的结构如下图：

![蜂窝式系统结构](/ch_16_wireless_networking_technologies/2019-12-30-22-18-47.png)

理论上每个巣室都是六边形的，那么就能无缝的分割区域，但在实际运用中，每个基站塔的覆盖范围大致是圆形的，因此就会出现重叠或者无服务区。且基站塔的覆盖范围由所处区域的用户数量决定，如果用户数量很多，则每个基站塔的覆盖范围会较小，且有更多的基站塔，反之每个基站塔覆盖很大一块区域。理论和实际的巣室图如下，（a）图为理想情况，（b）图为实际情况：

![巣室情况](/ch_16_wireless_networking_technologies/2019-12-30-22-21-33.png)

# Micro Cells

如上节所述，用户密度越大，则设计时每个巣室的面积越小。在城市中，有时会出现一个巣室仅覆盖大楼的一层这种情况，这是称其为微巣室（Micro Cells）。因为巣室很小且很小块区域内有多个巣室，为了避免干扰，微巣室的功率都比较小。

# Cell Clusters And Frequency Reuse

蜂窝式通信有一个重要原则：相邻的巣室在不使用相同频率的载波情况下，干扰最小。

蜂窝式系统使用称为巣室簇的结构构成，每个巣室簇都由特定数目的巣室构成，其中的每个巣室频率都不同。通常而言，巣室簇由3，4，7或12个巣室构成，如下图所示：

![巣室簇](/ch_16_wireless_networking_technologies/2019-12-30-23-19-08.png)

巣室簇中的每个巣室频率不同，将巣室簇拼接后就不会有相邻巣室频率相同的情况出现，如下图为7巣室簇拼接：

![巣室簇拼接](/ch_16_wireless_networking_technologies/2019-12-30-23-20-04.png)

# Generations Of Cellular Technologies

目前通信技术的发展有四代，称为1G,2G,3G和4G：

1. 1G：出现在1970年代后期，通过模拟信号传递语音信息。
2. 2G和2.5G：从1990年代早期开始发展，至今仍然在使用。与1G的主要区别在于，2G使用了数字信号传递语音信息。2.5G是2G的扩展，实现了部分3G的特性。
3. 3G和2.5G：从2000年开始发展，主要关注高速数据服务。3G系统提供400Kbps到2Mbps的数据速度。
4. 4G：从大约2008年开始使用，主要关注实时媒体的使用，如电视直播，高速视频下载等。4G手机通常包含多种数据连接方式，如Wifi和卫星通信。

在2G技术发展过程中，许多组织都尝试定义标准，欧洲主要使用TDMA技术并制订了GSM标准（Global System For Mobile Communication），该标准逐渐称为了全球标准。在美国，摩托罗拉使用TDMA技术定义了iDEM标准。同时大部分其他的美国运营商和亚洲运营商都使用了CDMA技术来指定标准。

在3G时代，EVDO（Evolution Data Optimized/Evolution Data Only）和EVDV标准几乎同时出现，两者都是CDMA和FDM技术的混合。EVDO技术被运用的较为广泛。

在设计4G标准时，国际通信协会（ITU）指定了4G蜂窝式系统的标准，称为`IMT-Advanced（International Mobile Telecommunication Advaced）`。其指定终端在高速移动时（如在火车上）应该有100Mbps的数据速率，而在静止时应该有100Mbps的速率。

在早期，运营商指定的4G标准，如`HSPA+`，`HTC Evo 4G`，`WiMax`和`LTE（Long Term Evolution）`都未满足要求。但是ITU还是允许了他们使用4G作为自己的广告语，在后期，`LTE-Advanced`和`WiMax Advanced`满足了ITU的标准，被称为真4G。

3G和4G的主要区别在于，3G系统设计时仍然是基于语音通话系统考虑的，还是继承自原先的模拟电话系统，其他的数据是作为额外的要求。而在4G标准设计时主要考虑因特网协议，因此4G系统使用了帧交换而语音只是作为一个特殊应用。在实际应用中，许多蜂窝系统仍然通过3G来传输通话信息，而在其他数据时使用4G。

# VSAT Satellite Technology

卫星通信的关键是用一个曲面天线（Parabolic antenna/Dish）保证电磁信号被反射到一个单一点上，如下图所示：

![曲面天线](/ch_16_wireless_networking_technologies/2019-12-30-23-39-52.png)

为了最大化收集到的信号，早期的卫星通信系统使用直径大于3米的曲面天线，但这种尺寸的天线并不适用于个人或小商家。于是称为`甚小口径天线终端（Very Small Aperture Terminal，VSAT）`的技术出现，它指代直径小于3米的曲面天线，通常直径在1米以下。

VSAT卫星通信选择的频率不同会影响信号强度，天气环境变化的敏感程度，和信号的覆盖范围（Satellite's footprint）。如下表所示：

![VSAT卫星频率](/ch_16_wireless_networking_technologies/2019-12-30-23-45-24.png)

# GPS Satellites

GPS（Global Positioning System）卫星提供实时的准确位置信息。GPS通信并非是计算机通信的一部分，但是越来越多的移动网络使用了位置信息。

GPS系统通过三颗卫星计算出终端的位置。首先要计算终端距离三颗卫星的距离，距离可以通过卫星与终端的传输时间乘上光速来确定。如果一个终端与卫星的距离为$d$，则终端出现在以卫星为球星，半径为$d$的球上任意位置。通过三个卫星，可以计算出三个球，三个球的交点为两个点（两个球的交点为一个圆形）。这两个交点，一个在太空中，一个在地球上，地球上的点即为终端的位置。

# Software Defined Radio And The Future Of Wireless

通常一个蜂窝网络手机需要指定天线，发射器和接收器的规格，这些数据都是需要预先指定的。如果同时支持GSM，Wifi和CDMA，则需要三套独立的无线电系统，使用时在其中切换。

现在传统的无线电系统被软件无线电取代，可以通过软件来指定的特性如下表所示：

![软件无线电可以设定的特性](/ch_16_wireless_networking_technologies/2019-12-30-23-53-54.png)

软件无线电的一大特性是可以同时使用多个天线，称实现了多天线同时传输和接受的系统为`MIMO（Multiple-Input Multiple-Output）`系统。

通过软件来设定通信特性也有一定的危险性，如用户可以选择被政府限制的频率来发送数据或者占据为紧急服务预留的频道。因此这个技术也需要严格规范。
