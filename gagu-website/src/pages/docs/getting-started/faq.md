---
title: FAQ ⏳
layout: ../../../layouts/DocLayout.astro
---

# FAQ

### What is the default account?

```
Username: gagu
Password: 9293
```

### Can't transfer large files when running on Termux?

```sh
# [SIZE] = 4096 | 8192 | ..
NODE_OPTIONS=--max-old-space-size=[SIZE] gagu
```
