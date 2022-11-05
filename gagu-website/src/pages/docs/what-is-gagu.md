---
title: "What is GAGU ?"
layout: ../../layouts/DocLayout.astro
---

## What is GAGU ?

GAGU 是一个发布在 NPM 上的软件包，在支持 Node.js 的设备上通过 NPM 全局安装并运行，即可在局域网内的浏览器中管理该设备上的文件。

GAGU 也将提供可直接双击运行的程序包，它使用 Vercel/pkg 打包而成，内置了 Node.js 环境和 GAGU 构建后的程序代码以及依赖包，但只支持 Windows、macOS 和 Linux 平台，而无法在 Android 上使用。

GAGU 选用了 NestJS 来将一些文件的 I/O 操作开放为可通过 HTTP 请求控制的 Web 接口，选用 React 开发了可在浏览器中操作的 Web 界面，并交由 NestJS 来承载。

### Origin

起因还要从我在 2021 年买了块便携屏说起，13.3 英寸却拥有 4K 分辨率，无论是外接 Switch 还是当作开发时的副屏，显示效果都非常的棒。

为了更好的利用这块屏幕，我折腾了很多方式。一次在外接 GoogleTV 给 RetroArch 导入 ROM 包时，由于要调整目录，我就随机下载了一些文件管理器。

其中一款名为 X-plore 的应用里，有一个“无线文件共享”的功能，只要开启这个服务，就可以在局域网内任意一台设备上（包括自身）的浏览器中管理文件。

这引起了我极大的兴趣，因为我平时更偏向于在使用 Mac 的同时使用安卓手机，而在这两者之间传输文件一直是件尴尬的事情。

先前我曾使用过老罗深受好评的 SmartFinder，但它不得不在电脑和手机两端各安装一个客户端，作为一名 Web 开发者，我对客户端的厌倦真是溢于言表。

后来，当我发现安卓官方也有适配 Mac 的驱动时，就立马卸载了 SmartFinder。虽然驱动难看又难用，但客户端装一个总好过装两个，也不用给每个安卓设备都装上。

但现在，事情开始变的有意思起来。

我随即在我所有的安卓设备上都装上了 X-plore，里面的“无线”是我唯一需要的功能，我只需在浏览器里输入链接，就能管理多台设备上的文件。

等等，这个操作界面看起来还是有点古老呢，这不巧了，改页面这活我熟啊。

只是当初没有想到，这一改，竟然完全停不下来，经历了如下几个阶段：

#### 1.CSS 注入阶段

直接通过现有的代码注入插件，对网页进行了样式覆盖，但是代码无法同步，切换电脑使用时就没有了。

#### 2.浏览器插件支持阶段

把代码迁移到自己的浏览器插件里，在有 Git 的电脑上可以同步，但还是没有遍及所有电脑。

#### 3.反编译调整阶段

粗略学习了下安卓的反编译，将样式代码直接写到 APP 里，并尝试优化内部 JS 代码，然后重新编译安装。

#### 4.反编译重写阶段

原有代码是用 jQuery 编写的，调整一番后发现优化难度较大，决定取其后端接口部分，然后前端全部用 React 重写。

命名为 WFMS(Web File Management System)，即 [x-plore-wfms](https://github.com/chisw-archived/x-plore-wfms) 仓库的由来。

#### 5.完全独立阶段

逐渐发现接口部分不太统一，还存在 bug，且尚有众多期望中的功能未能实现。

随意篡改他人 APP 似乎也不太礼貌。

决定完全脱离 Android APP，效仿 anywhere 的形式，用 NestJS 实现后端部分，发布在 NPM 上，跨平台使用。


### Name of GAGU

当项目完全独立出来后，得给它重新起个名字，因为 WFMS `/ˈdʌbəlju-ɛf-ɛm-ɛs/` 念起来还是太长了。

正当我为命名而烦恼时，我那一岁多的小女儿给了我灵感，她最近总是不停地嘟囔着一种类似 `/'gʌgu/` 的声音。

我立即在 NPM 包名和域名中检索 'GAGU'，都还没有被注册，太棒了！

这就是 GAGU 项目名称的由来 😜。