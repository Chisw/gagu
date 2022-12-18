---
title: Dev & Build
layout: ../../../layouts/DocLayout.astro
---

# Dev & Build

All the codes of GAGU are in the same [repository](https://github.com/Chisw/gagu), which consists of three parts and is scattered under three directories.

```
gagu
|- gagu-back-end
|- gagu-front-end
|- gagu-website
```

## Constitution

### Front-end

In order to minimize the size of the package, after the project became independent, the originally used UI component library [BlueprintJS](https://blueprintjs.com) was gradually removed and replaced with [SemiUI](https://semi.design) which can be loaded on demand.

Windows wallpapers and MIUI V5 icons were also removed, and the monochrome icons were replaced from [Carbon Design System](https://carbondesignsystem.com/guidelines/icons/library/) to [RemixIcon](https://remixicon.com/). Almost all icons are used from RemixIcon, even the icons of internal Apps are selected from it and edited in Figma.

The whole still uses the combination of React + [TailwindCSS](https://tailwindcss.com), and the built size is very small.

```sh
# dev
$ cd gagu-front-end
$ yarn
$ yarn start
```

### Back-end

After comparing several common frameworks during model selection, the reason for finally choosing [NestJS](https://nestjs.com) is very simple, because it adopts the module syntax of ES6 and has good support for TS.

In addition, considering that the front-end and back-end codes will be placed in the same repository, when switching contexts, a unified code style can more or less reduce switching costs.

```sh
# dev
$ cd gagu-back-end
$ yarn
$ yarn start:dev
```

### Website

Have a try with [Astro](https://astro.build), first time using it.

```sh
# dev
$ cd gagu-website
$ yarn
$ yarn start
```

## Build NPM package

1. Update following version tags:

- `GAGU_VERSION` in `gagu/gagu-back-end/src/utils/constant.util.ts`
- `version field` in `gagu/package.json`
- `version tag` in `gagu/README.md`
- `version field` in `gagu/gagu-website/.env`

2. Sync dependencies in `gagu/gagu-back-end/package.json` to `gagu/package.json`.

3. Run build script `yarn build:bin`, refer to [./build.sh](https://github.com/Chisw/gagu/blob/main/build.sh).

4. Dry run publish, update package size info, publish to NPM.

## Build Desktop Version

1. The desktop version needs to complete the previous built step above.

2. Install the dependencies in `gagu/package.json`, yes, this is a bit redundant, this is caused by the original decision to put the three parts in the same repository, fortunately, it is not a big problem.

3. Execute `yarn pkg` in the `gagu` directory, actually execute `pkg . --out-path=pkg`, you need to install Vercel/pkg globally in advance `npm install -g pkg`.

4. The built content will appear in `gagu/pkg`.

## Thanks

There are also many dependencies used throughout the project:

[@craco/craco](https://npmjs.com/package/@craco/craco)&emsp;
[axios](https://npmjs.com/package/axios)&emsp;
[lodash](https://npmjs.com/package/lodash)&emsp;
[luxon](https://npmjs.com/package/luxon)&emsp;
[md5](https://npmjs.com/package/md5)&emsp;
[qrcode.react](https://npmjs.com/package/qrcode.react)&emsp;
[react-hot-toast](https://npmjs.com/package/react-hot-toast)&emsp;
[react-photo-view](https://npmjs.com/package/react-photo-view)&emsp;
[react-rnd](https://npmjs.com/package/react-rnd)&emsp;
[recoil](https://npmjs.com/package/recoil)&emsp;
[express-zip](https://npmjs.com/package/express-zip)&emsp;
[gm](https://npmjs.com/package/gm)&emsp;
[jsmediatags](https://npmjs.com/package/jsmediatags)&emsp;
[minimist](https://npmjs.com/package/minimist)&emsp;
[node-disk-info](https://npmjs.com/package/node-disk-info)&emsp;
[piexifjs](https://npmjs.com/package/piexifjs)&emsp;
[thumbsupply](https://npmjs.com/package/thumbsupply)&emsp;

My workload would be enormous without them and I am very grateful to them.
