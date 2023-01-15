<div align="center">
<img src="https://gagu.io/assets/logo.svg" style="height: 64px;" >
<br>
<br>
<h1>GAGU (Alpha)</h1>
<p>Website: <a href="https://gagu.io" target="_blank">gagu.io</a></p>
<p>A web-based file management system</p>
<p>Manage files on your different devices in the browser</p>
<p>Works on Windows, macOS, Linux and Android/Termux</p>
<p>Inspired by <a href="https://play.google.com/store/apps/details?id=com.lonelycatgames.Xplore" target="_blank">Android/X-plore</a> and <a href="https://www.npmjs.com/package/anywhere" target="_blank">NPM/anywhere</a></p>
<img src="https://img.shields.io/badge/NPM-0.0.34-orange">
<img src="https://img.shields.io/badge/Package Size-589KB-success">
<img src="https://img.shields.io/badge/License-MIT-blue">
<img src="https://api.netlify.com/api/v1/badges/43a65c74-6640-4341-a3fd-b0bc8f52e670/deploy-status">
<br>
<br>
</div>

## 📦 Getting started

GAGU is published on NPM, so install [Node.js](https://nodejs.org/) on your device first.

You need to install [ffmpeg](https://ffmpeg.org/) and [GraphicsMagick](http://www.graphicsmagick.org/) to support thumbnail api.

```sh
# Install with NPM
$ npm i -g gagu

# Show help info
$ gagu -h
```

Default admin:

```
Username: gagu
Password: 9293
```

[Docs here](https://gagu.io/docs/getting-started/usage)

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

- `GAGU_VERSION` in `gagu/gagu-back-end/src/utils/constant.util.ts`
- `version field` in `gagu/package.json`
- `version tag` in `gagu/README.md`
- `version field` in `gagu/gagu-website/.env`

2. Sync dependencies in `gagu/gagu-back-end/package.json` to `gagu/package.json`.

3. Run build script `yarn build:bin`, refer to [./build.sh](./build.sh).

4. Dry run publish, update package size info, publish to NPM.

## 📜  License

The MIT license.
