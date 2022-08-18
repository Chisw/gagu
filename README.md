# GAGU (Beta)

A cool web file management system.

Running on macOS, Windows, Linux, and Android/Termux.

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

## About thumbnail

You need to install `ffmpeg` and `GraphicsMagick` to support thumbnail api.

## License

The MIT license.
