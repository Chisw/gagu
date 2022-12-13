---
title: 开发与构建
layout: ../../../layouts/DocLayout.astro
---

# 开发与构建

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
