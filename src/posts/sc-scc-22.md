---
title: SC22 流水账：超算是啥？
published: 2022-11-18 15:17:07
tags:
  - sc22
  - scc
  - student-cluster-competition
  - hpc
---

事实上，在此之前（甚至现在）我都对超算 / HPC / 并行计算等概念完全不了解。不过机缘巧合之下，我参加了今年 SC22 的 Student Cluster Competition。尽管并没有取得什么成绩，但还称得上是段有趣的经历。

<!--more-->

## 「校内选拔赛」

大概是在今年四月，某个群聊里看到了这么一个「选拔赛」。我之前其实有看过「[我与超算的 2021——一位退役队员的回忆](https://harrychen.xyz/2021/12/25/scc-memory/)」和相关的一些文章，虽然不太明白这些比赛具体是做些什么的，但能接触到最新的高性能硬件本身就是一件让我非常感兴趣的事。

[「选拔赛」的题目](https://r2.idawnlight.com/sc22/SC22-Intramural-Competition-of-Southeast-University.pdf)基本就是三个非常简单的 Benchmark，要求是跑出结果就能交。我是在 macOS (arm64) 上跑的，没遇到很多问题，顺利地全部跑出来交了个[简陋的 Proposal](https://r2.idawnlight.com/sc22/SC22-Intramural-Competition-of-Southeast-University-Proposal.pdf)[^1]。

不过从赛题最后的那句话就能看出来车带在这方面完全是起步阶段了：

> It’s okay if you submit a proposal with none of the benchmark being done. Life is full of surprise, isn’t it? :)

后来其实也有说预期是收到一份 Proposal，实际数量多达六份 XD

## 赛前

### 报名

「选拔赛」过了才发现这其实是我校第一次参加 SCC，大家都没经验（

SCC 的报名需要写一个包括多个方面的 Proposal，经 Committee 审核打分后可以参加 SCC 或者分流到 [IndySCC](https://sc22.supercomputing.org/program/studentssc/indyscc/)。SC21 ~~大清~~ [THU 就因为 Proposal 中 diversity 分数过低而未能以正常途径参赛](https://harrychen.xyz/2021/12/25/scc-memory/#sc21-proposal)[^2][^6]。感觉这次能顺利参赛全靠 Proposal 疯狂吹，毕竟刚结束的 ASC22 甚至连决赛都没有进（

今年的 SCC 分为 In-person 和 Virtual 两部分，然而 Virtual 的部分其实有且仅有中国大陆的三支队伍... 另外两支是 ZJU 和~~双鸭山~~ SYSU。看邮箱里收到的 Pre-arrival info、Twitter 上 SC22 投的广告、展示现场的 Zoom Meeting，唯一的感受是好想 Travel😭

### 准备

今年的[赛题](https://sc22.supercomputing.org/program/studentssc/student-cluster-competition/)分为 Benchmark 和 Application 两部分。Benchmark 包括常见的 Linpack、HPCG 与 IO500，此外今年还新增了 MLPerf。Application 包括用于解决流体动力学问题的 PHASTA[^3]、分子动力学模拟工具 LAMMPS、神秘应用地震波模拟 SeisSol 与论文复现 [Productivity, Portability, Performance: Data-Centric Python](https://dl.acm.org/doi/10.1145/3458817.3476176)。

然而事实上车带在超算方面基本没有积累，也并没有得到 Proposal 中吹出来的「大力支持」，甚至手上没有一台能完全控制物理服务器。能做的准备基本就各自在自己的设备上把应用顺利跑起来，而并没能有多少机会在统一的情况下配置环境。赛前提供测试环境的时间不长，大家也都有其他事要忙，结果最后差不多是在一个毫无准备的情况下参赛的。

此外，原先有借到学院的一个会议室作为固定参赛场地，结果赛前临时因为有其他安排换到了对面的一个报告厅，大归大，就感觉很不合适。外援也是几乎没有，Team Advisor 目前并不在校内，显然也没其他人可能来帮忙了。

## 正式比赛

正式比赛基本是分成两个部分的，即 Benchmark 和 Application。对于 Virtual 的队伍，本次比赛和往年稍有不同，提供：

- OCI (Oracle Cloud Infrastructure) 的 4 节点 [BM.Optimized3.36](https://docs.oracle.com/en-us/iaas/Content/Compute/References/computeshapes.htm#bm-hpc-optimized) 作为 CPU 集群，一台 [BM.GPU4.8](https://docs.oracle.com/en-us/iaas/Content/Compute/References/computeshapes.htm#bm-gpu) 作为 GPU 节点，用于 Benchmark、PHASTA 与 LAMMPS。
- Azure 的 $1600 额度[^4]，可以使用有限数量的 D16 v4、HB120rs v3、ND96amsr A100 v4、HC44、ND40rs v2、Fs72 v2 机型，用于 Reproducibility 和 SeisSol。

### Benchmark

Benchmark 的持续时间只有八个小时，并且因为时区差异，在东八区是 23:30 - 7:30，然而我第二天上午是概率论与大物，大物甚至还有个课堂练习，我在开始后就先滚去睡了（

本来这部分主要是对 In-person 的队伍比较重要，因为 Benchmark 认证成绩后就不允许更改集群的配置了。Virtual 的队伍理论上如果准备好了，直接跑就可以，结果：

- 收到用于提交成绩的 Azure Blob Storage 的 SAS Token 的 Primary Advisor 睡了
- 配环境配了超久，然后 Benchmark 没跑完

总之是寄了，早上醒来一看消息心脏骤停（

### Application

第一天白天依然是配环境，基本什么都没跑出来，大家刚跑完 Benchmark 也不是很有精力去打（

我最开始按计划负责 LAMMPS，决定直接走 Spack 去编译还是挺明智的。对于 CPU 版本，用的是 `lammps %gcc@11.3.1 +intel +openmp arch=linux-oracle7-cascadelake`，也很顺利地通过 Slurm 调度在四个 CPU 节点上并行跑。第一题有提示可以考虑 balance，然而测试了几种 balance 的方式跑的更慢了，浪费了不少时间。

考虑到时间充足，先尝试了 GPU，使用 `lammps %gcc@11.3.1 +kokkos +manybody ^kokkos +cuda +wrapper +cuda_lambda cuda_arch=80 ^openmpi +cuda cuda_arch=80` 可以编译出使用 Kokkos + CUDA + CUDA-Aware MPI 的版本，比直接从源码手动配置编译高效很多（虽然没什么在编译过程优化的空间了）。在完全没动输入文件的情况下跑完了 LAMMPS 的两个问题，之后单独 dump_image 做了 visualization，成为整场比赛第一个跑完的应用，甚至在交完 log autograde 后第一个出现在了比赛的 Grafana Dashboard 上（虽然几个小时后被 SYSU 做了一点微小的优化直接秒掉（不过最后还是第二，感觉是其他队的提交不规范 autograde 寄了，但是很好看 XD

然而，其他方向就大寄了，出现了包括但不限于以下情况的意外：

- PHASTA 没有给可以直接使用的输入文件，按照 Kenneth E. Jansen 给的演示视频运行出来一个 `signal 6 caught by pcu`，完全处理不出可用的输入文件，换各种环境尝试也没成功，并且看起来其他队伍没遇到这个问题
- Azure 的 Regional Quota 错误设置成了一个比较低的值，导致我们尝试开 VM 去跑 Reproducibility 的时候直接报资源不足，除了最开始开的那台 Scheduler 只有几十个核心的配额可用，甚至修改配置后的一段时间 Scheduler 的配额都没了，Discourse 上有人提没人会，之后找 Team Liaison 联系到 Committee 那边才发现配置问题
- SeisSol 尽管提供了基于 Spack 的一个虚拟包用于管理依赖，但有个独立的依赖 CMake 始终找不到，很长时间才把 CPU 的编译完，GPU 版本遇到了更多依赖问题

<p style="text-align: center"><img src="https://i.dawnlab.me/e11eb154a846dcc3c64637abf8abf78d.png" alt="Query the mental health" style="width: 400px; height: auto; "></p>

比赛的东八区最后一个晚上，Azure Quota 修好后才意识到 Scheduler 是 D16 v4（Intel Xeon Platinum 8370C），而允许的 CPU 机型和 GPU 机型全都是 AMD EPYC 7002 Series，Spack 编译又默认会对当前架构进行优化，导致编译出来的 binary 放到节点上跑直接就是 `Illegal Instruction` 。时间所剩无几，不得已直接放弃原来配了一部分的集群，开了几台 HB120rs v3 和 ND96amsr A100 v4 的 Single VM 去跑。

我最后帮另一位队友跑了 Reproducibility，因为我没准备也没看过论文，没有意识到完全可以开两台 VM 同时去跑 `dace_cpu` 和 `dace_gpu` 甚至是 distributed memory 的结果，导致大部分时间都浪费在等它跑完了。最后勉强跑完了 CPU 的部分，GPU 只跑了前面的几个测试。

SeisSol 比较惨，本身环境配置就挺复杂，然后又要重新配。本来想着先出点结果，所以直接先跑 CPU 的第一个问题，最后也没跑完。Interview 的时候被告知赛题给的输入单用 CPU 跑可能要跑到明年... 就，寄。

Interview 大概是：

- Reproducibility 很好，除了没跑完其他基本都做好了，队友回答也不错
- PHASTA 能明显感受到 Kenneth E. Jansen 对于我们还没做出输入文件感到无语，「I'll find someone to help you」不过并没有人 help，比赛也就剩几个小时了
- LAMMPS 主要是问我们有没有尝试各种优化方法，答曰除了 balance 这个负优化外啥都没试，之后一些题目模拟了什么、你理解的 LAMMPS 是什么之类的问题也答的很尬，充分认识到了我的口语有多么糟糕

最后抢着时间把 Reproducibility 跑出来的一部分数据交了上去，本想着结束了，然后结束提交 7 分钟后突然想到 LAMMPS 只交了 log 没交要求的完整 dump，甚至 visualization 的图都没交... 只能安慰自己说这比赛除了第一都没什么用了。

## 碎碎念

- 以打比赛为理由把非常讨厌的体育课请了假，翘了一节数据结构课，在形策和计组课上远程跑赛题，体验了一下在通宵之后赶去上早八和做物理实验
- 最开始是有另一位负责 Cloud Management 的，结果正好比赛开始当天在日本感染了 COVID-19... 然后我就负责了一部分的基本环境配置、Azure 的管理之类，如果是按原来的计划应该不会等到最后才发现 Azure 的资源问题（
- 感觉这种线上的比赛就很没意思，你没法自己去配硬件、调系统，没法和其他队伍 connect，没法参加其他的活动[^5]，你只有几道题和一个基本也没什么人的 Zoom Meeting
  - 希望某国能赶紧改掉这弱智的防疫政策，我只希望明年能有机会 Travel to Denver :(
  - 比赛时候刷推看到某企业投的 stop by (sc22) booth #xxx 的广告，凌晨看的更悲伤了
  - 线上直接用云服务给我的感觉就是变成了配环境大赛，基本很少涉及底层的优化之类
- *疑似*学校之后可能会多给一些支持，不过负责人的口头承诺还是先当不存在好了（
- 如果有机会，大概还会参加一些类似的比赛（ASC、ISC、PAC、IPCC 等），不过倒是完全不关心奖项，毕竟（

<p style="text-align: center"><img src="https://i.dawnlab.me/c9c37e5357e106fdd32cc73f2b2146f2.png" alt="SEU doesn't care about competition" style="width: 400px; height: auto"></p>

[^1]: 写这个 Proposal 的时候我甚至还不会用 LaTeX，突然发现已经过了好久了...
[^2]: 不过他们作为 ISC21 冠军被邀请参加了，详见原文
[^6]: 但是他们今年没参加，原因未知，导致今年成绩整体下滑（
[^3]: 这东西非常古董，2017 年后基本处于没有维护的状态，不知道为什么被拿来作为赛题
[^4]: 可以超过，但是会扣分（penalty），以及超出额度可能需要自己付钱（不确定
[^5]: 虽然 SCC22 报名会送 SC22 的 Digital Experience，但显然比现场差远了