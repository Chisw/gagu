---
title: "Project Origin"
layout: ../../../layouts/DocLayout.astro
---

# Project Origin

This starts with the fact that I bought a portable screen in 2021. The 347 PPI (13.3' 4K) has a very good display effect whether it is connected to an external Switch or used as a secondary screen during development. I always want to use it more.

## New Discovery

When importing ROMs to RetroArch on Android GoogleTV, I downloaded some file managers randomly because of the need to adjust the file directory.

One of them called X-plore has a feature named "WIFI File sharing", which can directly manage files on the device in the browser, it is very convenient:

![screenshot](/assets/screenshots/x-plore-screenshot.png)

This immediately caught my attention because I usually prefer to use my Android phone alongside my Mac, and transferring files between them has always been awkward.

> I have used Lao Luo's well-received SmartFinder before, but it had to install a client on the computer and the mobile phone. As a web developer, I really don't like too much installation.<br>
> Later, when I found that the Android official also has a driver for Mac, I immediately uninstalled SmartFinder. Although the driver is ugly and difficult to use, and you have to plug it in, for me, it is better to install one client than two, and it is not necessary to install it on every Android device.

## Procedure of Optimization

After a period of use, the idea of optimizing this interface came up.

### 1. Browser Extension Stage

Use existing browser extension directly to override the style of it, set a full screen display and replace icons:

![override](/assets/screenshots/x-plore-style-override.png)

However, this third-party extension can only be bound to a fixed domain. Once the IP or port number is changed, it will not take effect, and it cannot be synchronized on multiple computers.

So I migrated the code to my own browser extension, and distinguished by certain rules, it can be synchronized on other computers with Git.

### 2. Decompilation and Adjustment Stage

What about computers that don't have Git installed? Can I put the code directly into the apk file?

After roughly learning the decompilation of Android, it doesn't seem that difficult.

I tried optimizing some internal JS code again, recompiling, installing, running, and now, forget about browser extension!

### 3. Decompilation and Rewriting Stage

The internal code is written in jQuery, the overall readability is not high, and there are some bugs, such as the value returned by the `hasChildren` field is not accurate.

After several adjustments, I found that errors have begun to be reported and it cannot run normally.

In this way, I had to give up on continuing to improve it. Keep the server-side interface part, and then use React to rewrite the front-end part.

I built a new repository, simulates a desktop system design, named it WFMS (Web File Management System), and started a new round of development.

It can be said that this is a ‘system’ that combines macOS layout, Windows wallpaper and MIUI V5 icons:

![wfms](/assets/screenshots/x-plore-wfms.jpg)

### 4. Complete Independence Stage

As the development process continued to deepen, some new problems were discovered:

- The data fields are not uniform and the format is confusing
- Cross-domain access is not allowed (cannot customize hosts to modify access domain)
- Passwords are transmitted in clear text via GET requests
- Port number range is limited
- ...

Also generated some new ideas:

- Compression and decompression
- More users and access control
- File sharing with no account
- Runs on other non-Android devices
- ...

I thought of an NPM package "Anywhere" that I often use. If you install it globally and run it as a command line, you can access the files in the execution directory in the browser, but you can only read the files with simple interaction.

Anywhere can run normally on Termux, so can I follow its example and make a package with more features?

This way I can uninstall X-plore, and it seems impolite to tamper with other people's App at will.

After studying the source code of Anywhere and trying out the NestJS online course, I decided to spend no more time on the apk anymore, let's start again! 

Use NestJS to develop the server-side, integrate with the previous front-end work (you will find the original front-end code of [GAGU Repository](https://github.com/Chisw/gagu) is migrated from [WFMS Repository](https://github.com/chisw-archived/x-plore-wfms)), build and publish my own NPM package, runs on all Node.js enabled device!

## Name of GAGU

When I planned to completely separate the project, I thought of renaming it, because WFMS `/ˈdʌbəlju-ɛf-ɛm-ɛs/` is still too long to read, and it will inevitably be a mouthful when introducing it to others in the future.

It is best to have only two syllables and fewer letters, and the corresponding NPM package name and domain name cannot be registered.

It's really not easy to name it. When I was troubled by it, my one-year-old little daughter gave me inspiration. She has been muttering something like `/'gʌgu/` lately (the pronunciation at the top of the homepage is contributed by her 😜), we don't understand it.

I then searched for 'GAGU', and it wasn't registered yet, great!

This is where the name of the GAGU project comes from.

The default port number and password of the default account are both `9293`, one is because `9293` looks similar to `gagu`, and the other is because the baby's mom and I were born in 1993 and 1992 respectively.

<div class="apply-tip">
The name of GAGU has only two writing formats: 'GAGU' and 'gagu', the former is used for text description, and the latter is used for code.
</div>
