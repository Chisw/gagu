---
title: "What is GAGU ?"
layout: ../../../layouts/DocLayout.astro
---

# What is GAGU ?

GAGU 是一个通过 NPM 平台发布的软件包，在支持 Node.js 的设备上使用 `npm` 全局安装，以命令行的形式运行，即可在局域网内的浏览器中管理该设备上的文件。

GAGU 也可以运行在公共网络中的设备上，但尚未对此进行过安全测试，请谨慎使用。

![gagu-diagram](/assets/diagram.svg)

GAGU 选用 NestJS 来将一些文件系统的 I/O 操作开放为可通过 HTTP 请求控制的 Web 接口，选用 React 开发了可在浏览器中操作的 Web 界面，并交由 NestJS 来承载。

GAGU 会在 v1.0.0 发布后提供可直接双击运行的桌面版程序，它借助 Vercel/pkg 打包而成，内含 Node.js 执行环境、依赖包以及构建后的 GAGU 程序代码。桌面版无法在 Android 上使用。

GAGU 的灵感来源于 Android/X-plore 中的“无线文件共享”功能，借鉴了 NPM/anywhere 随启随用的运行方式。
