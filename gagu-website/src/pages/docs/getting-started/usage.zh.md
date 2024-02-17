---
title: "使用"
layout: ../../../layouts/DocLayout.astro
---

# 使用

<iframe
  src="//player.bilibili.com/player.html?bvid=BV1W84y1h71d"
  scrolling="no"
  border="0"
  frameborder="no"
  framespacing="0"
  allowfullscreen="true"
>
</iframe>

## 获取

### NPM 安装

通过 `npm` 全局安装：

```sh
$ npm i -g gagu
```

在 macOS 上你可能需要用到 `sudo` 命令:

```sh
$ sudo npm i -g gagu
```

### 下载

<div class="download-list"></div>

[所有发布](https://github.com/Chisw/gagu/releases)

## 可用参数

显示帮助信息：

```sh
$ gagu -h
$ gagu --help
```

启动服务：

```sh
$ gagu
```

启动并在浏览器中打开：

```sh
$ gagu -o
$ gagu --open
```

使用 HTTPS 打开：

```sh
$ gagu -s
$ gagu --security
```

使用指定 Host 启动：

```sh
$ gagu -H 0.0.0.0
$ gagu --Host 0.0.0.0
```

使用指定端口号启动：

```sh
$ gagu -p 80
$ gagu --port 80
```

显示当前版本号：

```sh
$ gagu -v
$ gagu --version
```

清除 `WORKSPACE/.io.gagu/data` 目录：

```sh
$ gagu --reset
```

清除 `WORKSPACE/.io.gagu` 目录：

```sh
$ gagu --reset-all
```

停止服务：

```sh
# `Ctrl + C` 或关闭终端
```

## 运行条件

### 工作空间

GAGU 的运行需要本地提供一个属于自己的根目录 `GAGU_PATH.ROOT` 来存储一些数据。

每次启动服务时，GAGU 会检测这个根目录是否存在，如不存在，则会自动在工作空间创建一个名为 `.io.gagu` 的根目录。

在不同的平台会选择不同的工作空间来创建，此处假设登录设备的用户名为 `jay`：

- Windows:

```
C:/Users/jay/.io.gagu
```

- macOS:

```
/Users/jay/.io.gagu
```

- Linux:

```
/home/jay/.io.gagu
```

- Android:

```
/data/data/com.termux/files/home/.io.gagu
```

`/data/data/com.termux/files/home/storage/shared` 指向的是安卓系统挂载的内部存储，在 Termux 中需要通过 `termux-setup-storage` 获取。

Termux 的使用可以参考 [Termux Wiki](https://wiki.termux.com/) 或者 [Termux 高级终端安装使用配置教程](https://www.sqlsec.com/2018/05/termux.html)。

### 根目录

GAGU 的根目录 `.io.gagu` 是一个以 `.` 开头命名的隐藏文件夹，在设备上可以通过具体的设置显示出来，但在 GAGU 的 API 中会被强制过滤，即使是拥有管理员权限的用户也无法在 GAGU 的 Web 页面中访问到它。

根目录创建成功后，会继续创建以下子目录：

```
.io.gagu
  |- data
  |- log
  |- public
  |  |- avatar
  |  |- image
  |  |- lib
  |- secrets
  |- thumbnail
  |- users
```

- `data` 用于持久化存储一些用户、登录、下载通道、设置等 JSON 格式的数据文件
- `log` 用于存放 API 日志
- `public/avatar` 用于存放用户头像，文件名即用户名
- `public/image` 用于存放一些配置图片
- `public/lib` 用于存放将来可能会用到的第三方 js 库
- `secrets` 用于存放 HTTPS PEM 文件
- `thumbnail` 用于存放使用中生成的缩略图
- `users` 用于存放用户个人文件

<div class="apply-tip">
本地开发时，根目录会被创建为 `WORKSPACE/.io.gagu.dev`。
</div>

### 缩略图

在 GAGU 的文件管理器中访问到可显示缩略图的文件时，GAGU 会以该文件的“全路径”加上“修改时间”进行 `md5` 运算得到一个 32 位长度的字符串，然后请求 `.io.gagu/thumbnail` 下与该字符串同名的缩略图文件，如不存在，则调用缩略图接口生成并返回。

```js
const { mtimeMs } = statSync(path)
const thumbnailId = md5(`${path}-${mtimeMs}`)
```

所以，在文件没有发生变化（移动位置、修改）时，第一次获取缩略图需要一定的时间，你可以在“设置”中对包含需要展示缩略图文件的目录使用“缩略图主动生成”的功能，以提高浏览体验。

GAGU 在生成缩略图时需要借助 [ffmpeg](https://ffmpeg.org/) 和 [GraphicsMagick](http://www.graphicsmagick.org/) 的接口，你可以选择性地安装它们，不安装并不会影响到 GAGU 主要功能的使用，所有的文件都有默认的类型图标展示。

<div class="apply-tip">
当你安装完 ffmpeg、GraphicsMagick 后，需要重启 GAGU 服务。
</div>

## 默认端口号

GAGU 服务的默认端口号为 `9293`，服务启动后，在本地可以通过 `http://127.0.0.1:9293` 访问，局域网内其它设备访问则将其中的 IP 替换为服务设备的内网 IP 即可。

> 我在家用的路由器中给 13 英寸的 Mac 分配了一个固定 IP `192.168.31.13`，并将路由器 hosts 中的 `mac.io` 域名指向 `192.168.31.13`，在 Mac 上以 `80` 端口启动 GAGU 服务，现在，局域网内的每一台设备都可以通过浏览器访问 `http://mac.io` 使用 Mac 上的 GAGU 服务。我还给手机分配指定了更短的 `i.io`。

端口号有两种修改方式：

- 通过“设置 / 高级 / 服务端口号”修改
- 通过启动命令参数 `gagu -p 80` 修改（二进制版不支持）

命令参数的修改优先级最高，其次为设置中的修改，最后是默认端口号。

<div class="apply-tip">
未获得 ROOT 权限的安卓设备无法设置小于 1024 的端口号，真是非常遗憾，因为设为 80 端口可以免去输入端口号的麻烦。
</div>

## 默认账号

第一次启动服务时，GAGU 会自动生成一个拥有全部权限的默认账号。

```
Username: gagu
Password: 9293
```

第一次登录时，只能使用该默认账号登录。

<div class="apply-tip">
建议登录后立即修改密码；或新建一个拥有全部权限的账号，并删除默认账号。
</div>
