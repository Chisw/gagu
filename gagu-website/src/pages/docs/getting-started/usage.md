---
title: "Usage"
layout: ../../../layouts/DocLayout.astro
---

# Usage

<iframe
  src="//player.bilibili.com/player.html?bvid=BV1W84y1h71d"
  scrolling="no"
  border="0"
  frameborder="no"
  framespacing="0"
  allowfullscreen="true"
>
</iframe>

## Getting

### NPM Install

Globally install with `npm`：

```sh
$ npm i -g gagu
```

You may need command `sudo` in macOS:

```sh
$ sudo npm i -g gagu
```

### Download

<div class="download-list"></div>

[All releases](https://github.com/Chisw/gagu/releases)

## Available Parameters

Show help info:

```sh
$ gagu -h
$ gagu --help
```

Start service:

```sh
$ gagu
```

Start and open in browser:

```sh
$ gagu -o
$ gagu --open
```

Start with HTTPS:

```sh
$ gagu -s
$ gagu --security
```

Start with a specified Host:

```sh
$ gagu -H 0.0.0.0
$ gagu --Host 0.0.0.0
```

Start with a specified port:

```sh
$ gagu -p 80
$ gagu --port 80
```

Show version:

```sh
$ gagu -v
$ gagu --version
```

Remove GAGU data directory `WORKSPACE/.io.gagu/data`:

```sh
$ gagu --reset
```

Remove GAGU root directory `WORKSPACE/.io.gagu`:

```sh
$ gagu --reset-all
```

Stop service：

```sh
# `Ctrl + C` or close terminal
```

## Running Conditions

### Workspace

The running of GAGU needs to provide a local root directory of its own `GAGU_PATH.ROOT` to store some data.

Every time the service is started, GAGU will detect whether the root directory exists, and if it does not exist, it will automatically create a root directory named `.io.gagu` in the workspace.

Different platforms will choose different workspaces to create. Here, it is assumed that the user name of the login device is `jay`:

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

`/data/data/com.termux/files/home/storage/shared` points to the internal storage mounted by the Android system, which needs to be obtained through `termux-setup-storage` in Termux.

For the use of Termux, please refer to [Termux Wiki](https://wiki.termux.com/) or [Termux Advanced Terminal Installation and Configuration Tutorial](https://www.sqlsec.com/2018/05/termux.html ).

### Root Directory

GAGU's root directory `.io.gagu` is a hidden folder named at the beginning of `.`, which can be displayed on the device through specific settings, but will be forcibly filtered in GAGU's API, even if it has Users with administrator rights cannot access it in GAGU's Web page.

After the root directory is successfully created, the following subdirectories will continue to be created:

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

- `data` is used to persistently store some data files in JSON format such as users, logins, download tunnels, settings, etc
- `log` is used to store API log
- `public/avatar` is used to store the user's avatar, and the file name is the username
- `public/image` is used to store some config images
- `public/lib` is used to store third-party js libraries that may be used in the future
- `secrets` is used to store HTTPS PEM files
- `thumbnail` is used to store thumbnails generated in use
- `users` is used to store user's personal files

<div class="apply-tip">
The root directory will be created as `WORKSPACE/.io.gagu.dev` in local development.
</div>

### Thumbnail

When accessing a file that can display thumbnails in GAGU's File Explorer, GAGU will use the "full path" of the file plus "modification time" to perform `md5` operations to obtain a 32-bit string, and then request the thumbnail file with the same name as the string under `.io.gagu/thumbnail`, if it does not exist, call the thumbnail interface to generate and return.

```js
const { mtimeMs } = statSync(path)
const thumbnailId = md5(`${path}-${mtimeMs}`)
```

Therefore, when the file does not change (move location or modify), it will take a certain amount of time to obtain the thumbnail for the first time. You can use the "Thumbnail Actively Generating" feature in the "Settings" for the directory containing the thumbnail files that need to be displayed. features to enhance the browsing experience.

GAGU will use [ffmpeg](https://ffmpeg.org/) and [GraphicsMagick](http://www.graphicsmagick.org/) interfaces when generating thumbnails, you can decide whether you need to install them, if not, it will not affect the use of GAGU's main functions, and all files will be displayed with default type icons.

<div class="apply-tip">
You need to restart GAGU service after you have installed ffmpeg and GraphicsMagick.
</div>

## Default Port Number

The default port number of the GAGU service is `9293`. After the service is started, it can be accessed locally through `http://127.0.0.1:9293`. When accessing other devices in the LAN, replace the IP in it with the intranet IP of the server device.

> I assigned a fixed IP `192.168.31.13` to the 13-inch Mac in my home router, and pointed the domain `mac.io` in the hosts of the router to `192.168.31.13`, and started the GAGU service on the Mac with port `80` , now, every device in the LAN can access `http://mac.io` through a browser to use the GAGU service on the Mac. I also specified the shorter domain `i.io` for my mobile phone.

There are two ways to modify the port number:

- Modify through "Settings / Advanced / Service Port"
- Modify by starting the command parameter `gagu -p 80` (binary version does not support)

The modification of command parameters has the highest priority, followed by the modification in the settings, and the last is the default port number.

<div class="apply-tip">
Unrooted Android devices cannot set a port number lower than 1024, which is a pity, because setting port 80 saves the trouble of entering the port number.
</div>

## Default Account

When starting the service for the first time, GAGU will automatically generate a default account with full permissions.

```
Username: gagu
Password: 9293
```

When you log in for the first time, you can only log in with the default account.

<div class="apply-tip">
It is recommended to change the password immediately after logging in; or create a new account with full permissions and delete the default account.
</div>
