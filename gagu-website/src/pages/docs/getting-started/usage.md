---
title: "Usage"
layout: ../../../layouts/DocLayout.astro
---

# Usage

GAGU is published on NPM, so install [Node.js](https://nodejs.org/) on your device first.

You need to install [ffmpeg](https://ffmpeg.org/) and [GraphicsMagick](http://www.graphicsmagick.org/) to support thumbnail api.

## Installation

### Install with NPM

```sh
$ npm i -g gagu
```

In macOS, you may need command `sudo`:

```sh
$ sudo npm i -g gagu
```

### Download

Stable package built via Vercel/pkg will be available after v0.1.0 released.

## Commands

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

