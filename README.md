<div style="display:flex; justify-content: center;">
  <svg width="396" height="98" viewBox="0 0 396 98" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0H396V98H0V0Z" fill="#FED500"/>
  <path d="M118.286 10.3158V72.2105H159.429V56.7368H180V72.2105H200.571V10.3158H118.286Z" fill="white"/>
  <path d="M108 10.3158H25.7143V72.2105H108V36.1053H87.4286V56.7368H66.8571V25.7895H108V10.3158Z" fill="white"/>
  <path d="M293.143 10.3158H210.857V72.2105H293.143V36.1053H272.571V56.7368H252V25.7895H293.143V10.3158Z" fill="white"/>
  <path d="M303.429 10.3158H344.571V56.7368H365.143V10.3158H385.714V72.2105H303.429V10.3158Z" fill="white"/>
  <path d="M159.429 25.7895H180V36.1053H159.429V25.7895Z" fill="#FED500"/>
  </svg>
</div>

<br>

<div style="text-align: center;">

# GAGU (Beta)

A cool web file management system.

Running on macOS, Windows, Linux, and Android/Termux.

![](https://img.shields.io/badge/npm-v0.0.14-orange)
![](https://img.shields.io/badge/license-MIT-green)
![](https://img.shields.io/badge/package-655KB-success)

</div>

## Preparation

GAGU is published on npm, so install node.js on your device first.

## Installation

```sh
npm i gagu -g
```

In macOS, you may need command `sudo`:

```sh
sudo npm i gagu -g
```

## Usage

```sh
# Start service and visit http://127.0.0.1:9293
# Default admin:
#   username: gagu
#   password: 9293
gagu

# Customize service port with -p
gagu -p 8888

# Show version with -v or --version
gagu -v
```

## Thumbnail

You need to install `ffmpeg` and `GraphicsMagick` to support thumbnail api.

## License

The MIT license.
