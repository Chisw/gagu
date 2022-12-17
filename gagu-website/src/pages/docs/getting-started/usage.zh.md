---
title: "使用"
layout: ../../../layouts/DocLayout.astro
---

# 使用

<iframe
  src="//player.bilibili.com/player.html"
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

<div class="apply-tip">
使用 Vercel/pkg 打包的稳定版桌面程序会在 v0.1.0 发布后提供。
</div>

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

使用指定端口号启动：

```sh
$ gagu -p 8888
$ gagu --port 8888
```

显示当前版本号：

```sh
$ gagu -v
$ gagu --version
```

清除 `WORK_SPACE/.io.gagu/data` 目录：

```sh
$ gagu --reset
```

清除 `WORK_SPACE/.io.gagu` 目录：

```sh
$ gagu --reset-all
```

停止服务：

```sh
# `Ctrl + C` 或关闭终端
```

## 运行条件

### 工作空间

GAGU 的运行需要本地提供一个根目录 `GAGU_PATH.ROOT` 来存储一些数据。

每次启动服务时，GAGU 会检测这个根目录是否存在，如不存在，则会自动在工作空间创建一个名为 `.io.gagu` 的根目录。

在不同的平台会选择不同的工作空间来创建，此处假设登录设备的用户名为 `mia`：

- Windows:

```
C:/Users/mia/.io.gagu
```

- macOS:

```
/Users/mia/.io.gagu
```

- Linux:

```

```

- Android:

```
/data/data/com.termux/files/home/storage/shared/Android/.io.gagu
```

`/data/data/com.termux/files/home/storage/shared` 指向的是安卓系统挂载的内部存储，在 Termux 中需要通过 `termux-setup-storage` 获取。

Termux 的使用可以参考 [Termux Wiki](https://wiki.termux.com/) 或者 [国光 Termux 高级终端安装使用配置教程](https://www.sqlsec.com/2018/05/termux.html)。

### 根目录

属于 GAGU 自己的根目录 `.io.gagu` 是一个以 `.` 开头命名的隐藏文件夹，在设备上可以通过具体的设置显示出来，但在 GAGU 的 API 中会被强制过滤，即使是管理员用户也无法在 GAGU 的 Web 页面中访问到它。

根目录创建成功后，会同时创建以下子目录：

```
./.io.gagu/data
./.io.gagu/public/avatar
./.io.gagu/public/lib
./.io.gagu/thumbnail
```

- `data` 用于持久化存储一些用户、登录、下载通道、设置、日志等 JSON 格式的数据文件。
- `public/avatar` 存放用户的头像，文件名即用户名。
- `public/lib` 存放将来可能会用到的第三方 js 库。
- `thumbnail` 存放使用中生成的缩略图。

<div class="apply-tip">
如果是在本地开发环境，根目录会被创建为 `WORK_SPACE/.io.gagu.dev`。
</div>

### 缩略图

在 GAGU 的文件管理器中访问到可显示缩略图的文件时，GAGU 会以该文件的“全路径”加上“修改时间”进行 `md5` 运算得到一个 32 位长度的字符串，请求 `./.io.gagu/thumbnail` 下与该字符串同名的缩略图文件，如不存在，则调用缩略图接口生成并返回。

```js
const { mtimeMs } = statSync(path)
const thumbnailId = md5(`${path}-${mtimeMs}`)
```

所以，在文件没有发生变化（移动位置、修改）时，第一次获取缩略图需要一定的时间，你可以在“设置”中对包含需要展示缩略图文件的目录使用“缩略图主动生成”的功能，以提高浏览体验。

GAGU 在生成缩略图时会借助 [ffmpeg](https://ffmpeg.org/) 和 [GraphicsMagick](http://www.graphicsmagick.org/) 的接口，你可以选择性地安装它们，不安装并不会影响到 GAGU 主要功能的使用，所有的文件都有默认的类型图标展示。


## 默认端口号

GAGU 的默认端口号为 `9293`，服务启动后，在本地可以通过 `http://127.0.0.1:9293` 访问服务，局域网内其它设备访问则将其中的 IP 替换为设备的内网 IP 即可，甚至可以在支持修改 hosts 的路由器中给固定 IP 绑定一个定制域名。

端口号有两种修改方式：

- 通过“设置/高级设置/服务端口号”修改
- 通过启动命令参数 `gagu -p 8888` 修改（桌面版不支持）

命令参数的修改优先级最高，其次为设置中的修改，最后是默认端口号。

<div class="apply-tip">
未 ROOT 的安卓设备无法设置小于 1024 的端口号，真是非常遗憾，因为设为 80 端口可以免去输入端口号的过程。
</div>

## 默认账号

第一次启动服务时，GAGU 会自动生成一个用户名为 `gagu`, 密码为 `9293` 并拥有全部权限的默认账号。

第一次登录时，只能使用该默认账号登录。

<div class="apply-tip">
建议登录后立即修改密码；或新建一个拥有全部权限的账号，并删除默认账号。
</div>
