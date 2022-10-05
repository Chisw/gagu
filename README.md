<div align="center">
  <img src="./logo.svg" style="height: 96px;" >
  <br>
  <br>
  <h1>GAGU (Beta)</h1>
  <p>Website: <a href="https://gagu.io" target="_blank">gagu.io</a></p>
  <p>A cool web file management system.</p>
  <p>Work on macOS, Windows, Linux(planning), and Android/Termux.</p>
  <p>Inspired by <a href="https://play.google.com/store/apps/details?id=com.lonelycatgames.Xplore" target="_blank">Android/X-plore</a> and <a href="https://www.npmjs.com/package/anywhere" target="_blank">NPM/anywhere</a>.</p>
  <img src="https://img.shields.io/badge/NPM-0.0.24-orange">
  <img src="https://img.shields.io/badge/Package Size-233KB-success">
  <img src="https://img.shields.io/badge/License-MIT-green">
  <br>
  <br>
</div>

## 🔔 Preparation

GAGU is published on NPM, so install [Node.js](https://nodejs.org/) on your device first.

You need to install [ffmpeg](https://ffmpeg.org/) and [GraphicsMagick](http://www.graphicsmagick.org/) to support thumbnail api.

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

# Show help info
$ gagu -h

# Start and open in browser
$ gagu -o

# Start with customized port
$ gagu -p 8888

# Show version
$ gagu -v

# Reset with removing GAGU root directory
$ gagu --reset

# Stop service
# Ctrl + C
```

Default admin:

```
username: gagu
password: 9293
```

## 🛠 Development

GAGU app code consists of two parts: `./gagu-back-end` and `./gagu-front-end`.

```sh
# Back-end
$ cd gagu-back-end
$ yarn
$ yarn start:dev

# Font-end
$ cd gagu-front-end
$ yarn
$ yarn start
```

GAGU website code is in `./gagu-website`.

```sh
$ cd gagu-website
$ yarn
$ yarn start
```

## 🔨 Build NPM package

1. Update following version tags:

```
./gagu-back-end/src/utils/constant.ts - GAGU_VERSION
./package.json - version field
./README.md - version tag
```

2. Sync back-end package dependencies to root package.

3. Run build script, refer to [./build.sh](./build.sh).

4. Publish to NPM.

## 📜  License

The MIT license.
