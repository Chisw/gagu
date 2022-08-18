<div align="center">

  <img src="./logo.svg" style="height: 98px;" >
  
  <br>

  <h1>GAGU (Beta)</h1>

  <p>A cool web file management system.</p>

  <p>Work on macOS, Windows, Linux(planning), and Android/Termux.</p>
  
  <p>Website: <a href="https://gagu.io" target="_blank">https://gagu.io</a></p>

  <img src="https://img.shields.io/badge/NPM-v0.0.14-orange">
  <img src="https://img.shields.io/badge/Package-655KB-success">
  <img src="https://img.shields.io/badge/License-MIT-green">

  <br>

</div>

## 🔔 Preparation

GAGU is published on NPM, so install [Node.js](https://nodejs.org/) on your device first.

## 📦 Installation

Install GAGU globally as a command line tool:

```sh
$ npm i gagu -g
```

In macOS, you may need command `sudo`:

```sh
$ sudo npm i gagu -g
```

## 📝  Usage

```sh
# Start service and visit http://127.0.0.1:9293
$ gagu

# Default admin:
#   username: gagu
#   password: 9293

# Customize service port with `-p`
$ gagu -p 8888

# Show version with `-v` or `--version`
$ gagu -v
```

## 💡 Thumbnail

You need to install [ffmpeg](https://ffmpeg.org/) and [GraphicsMagick](http://www.graphicsmagick.org/) to support thumbnail api.

## 🛠 Development

The project consists of two parts: gagu-front-end and gagu-back-end.

Front-end:

```sh
$ cd gagu-front-end

# Install dependencies
$ yarn

# Start dev at http://127.0.0.1:3000 default
$ yarn start
```

Back-end:

```sh
cd gagu-back-end

# Install dependencies
$ yarn

# Start dev at http://127.0.0.1:9293 default
yarn start:dev
```

## 🔨 Build package

Refer to [./build.sh](./build.sh).

## 📜  License

The MIT license.
