---
title: 开发与构建
layout: ../../../layouts/DocLayout.astro
---

# 开发与构建

## 项目选型

### 前端

为了最大程度地减少包的体积，项目独立出来后，逐步移除了原本使用的 UI 组件库 BlueprintJS，换成了可以按需加载的 SemiUI。

同时移除的还有 Windows 的壁纸和 MIUI V5 图标，单色图标也从 Carbon Design System 换成了 RemixIcon。几乎所有的图标都使用自 RemixIcon，即使是内部应用的图标也是从中选取至 Figma 编辑而来。

整体仍然使用了 React + TailwindCSS 的组合，构建后的体积非常小。

### 后端

在选型时对比了几种常见的框架，最终选择 NestJS 的原因很简单，因为它采用了 ES6 的模块语法，且对 TS 有着良好的支持；还有就是考虑到前、后端的代码会放在同一个仓库，切换上下文时，统一风格或多或少能降低一些切换成本。

### 网站

尝试一下 Astro，第一次使用它。

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

## Build NPM package

1. Update following version tags:

- `GAGU_VERSION` in `./gagu-back-end/src/utils/constant.util.ts`
- `version field` in `./package.json`
- `version tag` in `./README.md`
- `version field` in `./gagu-website/.env`

2. Sync back-end package dependencies to root package.

3. Run build script `yarn build:bin`, refer to [./build.sh](./build.sh).

4. Publish to NPM.
