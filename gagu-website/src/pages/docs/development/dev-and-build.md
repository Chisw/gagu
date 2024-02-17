---
title: Dev & Build
layout: ../../../layouts/DocLayout.astro
---

# Dev & Build

All the codes of GAGU are in the same [repository](https://github.com/Chisw/gagu), which consists of three parts:

```
gagu
|- gagu-back-end
|- gagu-front-end
|- gagu-website
```

Only the `yarn.lock` file is uploaded in the project, so using `yarn` instead of `npm` to install dependencies can ensure that our running results in the development environment are consistent.

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

1. Update following version info:

- `version field` in `./package.json`
- `GAGU_VERSION` in `./gagu-back-end/src/utils/constant.util.ts`
- `version field` in `./gagu-website/.env`

2. Sync production dependencies in `./gagu-back-end/package.json` to `./package.json`

3. Run build script `npm run build:npm`, refer to [./build-npm.sh](https://github.com/Chisw/gagu/blob/main/build-npm.sh)

4. Dry run publish, update package size info, publish to NPM

## Build Binary Version

1. The binary version needs to complete the previous built step above

2. Install the dependencies in `./package.json`, yes, this is a bit redundant, this is caused by the original decision to put the three parts in the same repository, fortunately, it is not a big problem

3. Execute `npm run build:pkg` in the `gagu` directory, you need to install Vercel/pkg globally in advance `npm i -g pkg`

4. The built content will appear in `./pkg`

## Thanks

### References

1. SVG compression: [SVG在线压缩合并工具](https://www.zhangxinxu.com/sp/svgo/)
2. useClickAway: [useClickAway.ts](https://github.com/streamich/react-use/blob/master/src/useClickAway.ts)
3. Audio spectrum effects: [做一个酷酷的音乐频谱](https://juejin.cn/post/6844903478934896647)
4. Call IINA: [Chrome_Open_In_IINA](https://github.com/iina/iina/blob/develop/browser/Chrome_Open_In_IINA/common.js#L59C18-L59C18)
5. JSON format: [json-format](https://github.com/luizstacio/json-format/blob/master/index.js)
6. Read 100+ files: [readEntries](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry#javascript)
7. Infrared code format: [「一块钢板的重生」——7年前的小米4还能干什么](https://blog.hans362.cn/post/rebirth-of-xiaomi-4)
8. MI TV infrared code: [哪位大佬有小米电视的红外遥控码](https://bbs.hassbian.com/archiver/?tid-9045.html)

### Dependencies

There are also many dependencies used throughout the project:

[@craco/craco](https://npmjs.com/package/@craco/craco)&emsp;
[axios](https://npmjs.com/package/axios)&emsp;
[chalk](https://npmjs.com/package/chalk)&emsp;
[express-zip](https://npmjs.com/package/express-zip)&emsp;
[github-markdown-css](https://npmjs.com/package/github-markdown-css)&emsp;
[gm](https://npmjs.com/package/gm)&emsp;
[lodash](https://npmjs.com/package/lodash)&emsp;
[luxon](https://npmjs.com/package/luxon)&emsp;
[md5](https://npmjs.com/package/md5)&emsp;
[minimist](https://npmjs.com/package/minimist)&emsp;
[music-metadata](https://npmjs.com/package/music-metadata)&emsp;
[node-disk-info](https://npmjs.com/package/node-disk-info)&emsp;
[piexifjs](https://npmjs.com/package/piexifjs)&emsp;
[qrcode.react](https://npmjs.com/package/qrcode.react)&emsp;
[react-hot-toast](https://npmjs.com/package/react-hot-toast)&emsp;
[react-i18next](https://npmjs.com/package/react-i18next)&emsp;
[react-markdown](https://npmjs.com/package/react-markdown)&emsp;
[react-photo-view](https://npmjs.com/package/react-photo-view)&emsp;
[react-rnd](https://npmjs.com/package/react-rnd)&emsp;
[recoil](https://npmjs.com/package/recoil)&emsp;
[rehype-raw](https://npmjs.com/package/rehype-raw)&emsp;
[remark-gfm](https://npmjs.com/package/recoil)&emsp;
[thumbsupply](https://npmjs.com/package/thumbsupply)&emsp;

My workload would be enormous without them and I am very grateful to them.
