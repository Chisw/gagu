---
title: FAQ ⏳
layout: ../../../layouts/DocLayout.astro
---

# FAQ

### 默认账号是什么？

```
Username: gagu
Password: 9293
```

### Termux 上运行不能传输大文件？

```sh
# [SIZE] = 4096 | 8192 | ..
NODE_OPTIONS=--max-old-space-size=[SIZE] gagu
```
