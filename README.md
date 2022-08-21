<div align="center">
  <img src="./logo.svg" style="height: 96px;" >
  <br>
  <br>
  <h1>GAGU (Beta)</h1>
  <p>Website: <a href="https://gagu.io" target="_blank">gagu.io</a></p>
  <p>A cool web file management system.</p>
  <p>Work on macOS, Windows, Linux(planning), and Android/Termux.</p>
  <p>Inspired by <a href="https://play.google.com/store/apps/details?id=com.lonelycatgames.Xplore" target="_blank">Android/X-plore</a> and <a href="https://www.npmjs.com/package/anywhere" target="_blank">NPM/anywhere</a>.</p>
  <img src="https://img.shields.io/badge/NPM-v0.0.16-orange">
  <img src="https://img.shields.io/badge/Package-653KB-success">
  <img src="https://img.shields.io/badge/License-MIT-green">
  <br>
  <br>
</div>

## 🔔 Preparation

GAGU is published on NPM, so install [Node.js](https://nodejs.org/) on your device first.

## 📦 Installation

Install GAGU as a command line tool:

```sh
$ npm i gagu -g
```

In macOS, you may need command `sudo`:

```sh
$ sudo npm i gagu -g
```

## 📝  Usage

```sh
# Start service
$ gagu

# Default admin:
#   username: gagu
#   password: 9293

# Start with customized port
$ gagu -p 8888

# Show version
$ gagu -v

# Show help info
$ gagu -h

# Stop service
# Ctrl + C
```

You need to install [ffmpeg](https://ffmpeg.org/) and [GraphicsMagick](http://www.graphicsmagick.org/) to support thumbnail api.

## 🛠 Development

The project consists of two parts: gagu-back-end and gagu-front-end.

Back-end:

```sh
$ cd gagu-back-end

# Install dependencies
$ yarn

# Start dev
$ yarn start:dev
```

Front-end:

```sh
$ cd gagu-front-end

# Install dependencies
$ yarn

# Start dev
$ yarn start
```

## 🔨 Build NPM package

Update following version tags:

```
./gagu-back-end/src/utils/index.ts - GAGU_CURRENT_VERSION
./package.json - version field
./README.md - version tag
```

Sync back-end package dependencies to root package.

Run build script, refer to [./build.sh](./build.sh).

Publish to NPM.

## 📜  License

The MIT license.
