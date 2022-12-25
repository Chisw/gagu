---
title: "What is GAGU ?"
layout: ../../../layouts/DocLayout.astro
---

# What is GAGU ?

GAGU is a package published on the NPM platform, It can be installed globally using `npm` on a device that supports Node.js, and run as a command line to manage files on the device in a browser on the LAN.

GAGU can also run on public networks, but this has not been tested for safety, please use with caution.

## Web-based

![gagu-diagram](/assets/diagram.svg)

GAGU choose NestJS to open some file system I/O operations as a web interface that can be controlled through HTTP requests, and choose React to develop a web interface that can be operated in a browser, and it was hosted by NestJS.

## Desktop Version

GAGU will provide a desktop program that can be double-clicked to run after v1.0.0 is released. It is packaged with Vercel/pkg, including the Node.js execution environment, dependency packages, and the built GAGU program code.

The desktop version is suitable for running immediately on a brand new device, or sharing with users who don't know much about Node.js.

<div class="apply-tip">
The desktop version is not available on Android.
</div>

## Inspiration

GAGU is inspired by the "Wireless File Sharing" feature in [Android/X-plore](https://play.google.com/store/apps/details?id=com.lonelycatgames.Xplore), and borrows from the running mode of [NPM/anywhere](https://www.npmjs.com/package/anywhere) that can be used as soon as it is activated.

Visit the next section for more information.