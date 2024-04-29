<div align="center">
<img src="https://gagu.io/assets/logo.svg" style="height: 64px;" >
<br>
<br>
<h1>GAGU (Alpha)</h1>
<p>Website: <a href="https://gagu.io" target="_blank">https://gagu.io</a></p>
<p>A web-based file management system</p>
<p>Manage files on your different devices in the browser</p>
<p>Works on Windows, macOS, Linux and Android/Termux</p>
<p>Inspired by <a href="https://play.google.com/store/apps/details?id=com.lonelycatgames.Xplore" target="_blank">Android/X-plore</a> and <a href="https://www.npmjs.com/package/anywhere" target="_blank">NPM/anywhere</a></p>
<img src="https://img.shields.io/npm/v/gagu">
<img src="https://img.shields.io/badge/Package Size-768KB-success">
<img src="https://img.shields.io/badge/License-MIT-blue">
<img src="https://api.netlify.com/api/v1/badges/43a65c74-6640-4341-a3fd-b0bc8f52e670/deploy-status">
<br>
<br>
</div>

<table>
  <tr>
    <td width="50%">
      <img src="https://raw.githubusercontent.com/Chisw/gagu/main/gagu-website/public/assets/screenshots/screenshot-desktop-light.jpg" />
      <img src="https://raw.githubusercontent.com/Chisw/gagu/main/gagu-website/public/assets/screenshots/screenshot-desktop-dark.jpg" />
    </td>
    <td width="50%">
      <img style="width: 48%;" src="https://raw.githubusercontent.com/Chisw/gagu/main/gagu-website/public/assets/screenshots/screenshot-touch-light.jpg" />
      <img style="width: 48%;" src="https://raw.githubusercontent.com/Chisw/gagu/main/gagu-website/public/assets/screenshots/screenshot-touch-dark.jpg" />
    </td>
  </tr>
</table>

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

Only the `yarn.lock` file is uploaded in the project, so using `yarn` instead of `npm` to install dependencies can ensure that our running results in the development environment are consistent.

GAGU app code consists of two parts: `./gagu-back-end` and `./gagu-front-end`.

```sh
# Back-end
$ cd gagu-back-end
$ yarn
$ yarn start:dev

# Front-end
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

1. Update following version info:

- `version field` in `./package.json`
- `GAGU_VERSION` in `./gagu-back-end/src/utils/constant.util.ts`
- `version field` in `./gagu-website/.env`

2. Sync dependencies in `./gagu-back-end/package.json` to `./package.json`.

3. Run build script `npm run build:npm`, refer to [./build-npm.sh](./build-npm.sh).

4. Dry run publish, update package size info, publish to NPM.

## 📜  License

The MIT license.
