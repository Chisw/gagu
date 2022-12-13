---
title: "使用方法"
layout: ../../../layouts/DocLayout.astro
---

# 使用方法

GAGU is published on NPM, so install [Node.js](https://nodejs.org/) on your device first.

You need to install [ffmpeg](https://ffmpeg.org/) and [GraphicsMagick](http://www.graphicsmagick.org/) to support thumbnail api.

## 安装

### NPM 安装

```sh
$ npm i -g gagu
```

In macOS, you may need command `sudo`:

```sh
$ sudo npm i -g gagu
```

### 下载

Stable package built via Vercel/pkg will be available after v0.1.0 released.

## 命令

Start service:

```sh
$ gagu
```

Show help info:

```sh
$ gagu -h
```

Start and open in browser:

```sh
$ gagu -o
```

Start with customized port:

```sh
$ gagu -p 8888
```

Show version:

```sh
$ gagu -v
```

Remove GAGU data directory:

```sh
$ gagu --reset
```

Remove GAGU root directory:

```sh
$ gagu --reset-all
```

Stop service:

```sh
# Ctrl + C or close terminal
```

