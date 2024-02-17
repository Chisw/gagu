---
title: 开发与构建
layout: ../../../layouts/DocLayout.astro
---

# 开发与构建

GAGU 所有的代码都在同一个[仓库](https://github.com/Chisw/gagu)里，由三部分构成：

```
gagu
|- gagu-back-end
|- gagu-front-end
|- gagu-website
```

项目中只上传了 `yarn.lock` 文件，所以使用 `yarn` 而不是 `npm` 来安装依赖，可以确保我们在开发坏境的运行结果是一致的。

## 构成

### 前端

为了最大程度地减少包的体积，项目独立出来后，逐步移除了原本使用的 UI 组件库 [BlueprintJS](https://blueprintjs.com)，换成了可以按需加载的 [SemiUI](https://semi.design)。

同时移除的还有 Windows 的壁纸和 MIUI V5 图标，单色图标也从 [Carbon Design System](https://carbondesignsystem.com/guidelines/icons/library/) 换成了 [RemixIcon](https://remixicon.com/)。几乎所有的图标都使用自 RemixIcon，即使是内部应用的图标也是从中选取至 Figma 编辑而来。

整体仍然使用了 React + [TailwindCSS](https://tailwindcss.com) 的组合，构建后的体积非常小。

```sh
# dev
$ cd gagu-front-end
$ yarn
$ yarn start
```

### 后端

在选型时对比了几种常见的框架，最终选择 [NestJS](https://nestjs.com) 的原因很简单，因为它采用了 ES6 的模块语法，且对 TS 有着良好的支持。

还有就是考虑到前、后端的代码会放在同一个仓库，切换上下文时，统一的代码风格或多或少能降低一些切换成本。

```sh
# dev
$ cd gagu-back-end
$ yarn
$ yarn start:dev
```

### 网站

尝试一下 [Astro](https://astro.build)，第一次使用它。

```sh
# dev
$ cd gagu-website
$ yarn
$ yarn start
```

## 构建 NPM 包

1. 更新以下版本信息：

- `version field` 位于 `./package.json`
- `GAGU_VERSION` 位于 `./gagu-back-end/src/utils/constant.util.ts`
- `version field` 位于 `./gagu-website/.env`

2. 同步 `./gagu-back-end/package.json` 中的生产环境依赖项到 `./package.json` 中

3. 执行构建脚本 `npm run build:npm`，参考 [./build-npm.sh](https://github.com/Chisw/gagu/blob/main/build-npm.sh)

4. 预发布检查，更新包体积信息，发布到 NPM

## 构建二进制版

1. 二进制版的构建需要先完成上一步骤

2. 然后安装好 `./package.json` 中的依赖，是的，这有点冗余，这是最初决定将三部分放至同一仓库造成的，好在问题不大

3. 在 `gagu` 目录下执行 `npm run build:pkg`，你需要事先全局安装好 Vercel/pkg `npm i -g pkg`

4. 构建后的内容会出现在 `./pkg` 中

## 感谢

### 参考项

1. SVG 压缩：[SVG在线压缩合并工具](https://www.zhangxinxu.com/sp/svgo/)
2. useClickAway: [useClickAway.ts](https://github.com/streamich/react-use/blob/master/src/useClickAway.ts)
3. 音频频谱效果：[做一个酷酷的音乐频谱](https://juejin.cn/post/6844903478934896647)
4. 调用 IINA：[Chrome_Open_In_IINA](https://github.com/iina/iina/blob/develop/browser/Chrome_Open_In_IINA/common.js#L59C18-L59C18)
5. JSON 格式化：[json-format](https://github.com/luizstacio/json-format/blob/master/index.js)
6. 扫描 100+ 文件：[readEntries](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry#javascript)
7. 红外码格式：[「一块钢板的重生」——7年前的小米4还能干什么](https://blog.hans362.cn/post/rebirth-of-xiaomi-4)
8. 小米红外码：[哪位大佬有小米电视的红外遥控码](https://bbs.hassbian.com/archiver/?tid-9045.html)

### 依赖项

整个项目中还用到了很多依赖：

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

如果没有他们，我的工作量将是巨大的，十分感谢。
