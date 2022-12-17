---
title: "Usage"
layout: ../../../layouts/DocLayout.astro
---

# Usage

<iframe
  src="//player.bilibili.com/player.html"
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

<div class="apply-tip">
Stable package built via Vercel/pkg will be available after v0.1.0 is released.
</div>

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

Start with a customized port:

```sh
$ gagu -p 8888
$ gagu --port 8888
```

Show version:

```sh
$ gagu -v
$ gagu --version
```

Remove GAGU data directory `WORK_SPACE/.io.gagu/data`:

```sh
$ gagu --reset
```

Remove GAGU root directory `WORK_SPACE/.io.gagu`:

```sh
$ gagu --reset-all
```

Stop service：

```sh
# `Ctrl + C` or close terminal
```

<div class="apply-tip">
The `WORK_SPACE` selected by GAGU on different devices is different, more instructions in the next section.
</div>
