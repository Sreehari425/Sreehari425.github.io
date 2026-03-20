# Sreehari425.github.io

a portfolio that got out of hand.

started as a fake terminal.
then i added a real linux kernel.
because why not.

## Running locally
```bash
python -m http.server # or use npx serve
# then open http://localhost:8000
```

> A local HTTP server is required (not `file://`) for the Service Worker and SharedArrayBuffer used by v86 to work.

## Getting the v86 assets

Source for the binary blobs for refrence :)

```bash
# js + wasm
curl -L -o libv86.js https://copy.sh/v86/build/libv86.js
curl -L -o v86.wasm https://copy.sh/v86/build/v86.wasm

# bios + linux image
mkdir -p bios images
curl -L -o bios/seabios.bin  https://copy.sh/v86/bios/seabios.bin
curl -L -o bios/vgabios.bin  https://copy.sh/v86/bios/vgabios.bin
curl -L -o images/linux.iso  https://copy.sh/v86/images/linux.iso
```

## Third-party credits & licenses

This project ships the following binary assets:

| Asset | Project | License |
|---|---|---|
| `libv86.js`, `v86.wasm` | [v86](https://github.com/copy/v86) by Fabian Hemmer | [MIT](https://github.com/copy/v86/blob/master/LICENSE) |
| `bios/seabios.bin` | [SeaBIOS](https://www.seabios.org) | LGPL v3 |
| `bios/vgabios.bin` | [LGPL VGA BIOS](https://www.nongnu.org/vgabios/) | LGPL v2 |
| `images/linux.iso` | Linux kernel + BusyBox (via v86 buildroot image) | GPL v2 |
| `coi-serviceworker.js` | [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) by Guido Zuidhof | [MIT](https://github.com/gzuidhof/coi-serviceworker/blob/master/LICENSE) |

Source code for GPL/LGPL components:
- Linux kernel source: https://kernel.org
- BusyBox source: https://busybox.net
- SeaBIOS source: https://github.com/coreboot/seabios
- v86 buildroot image sources: https://github.com/copy/v86/tree/master/tools/docker/buildroot

## inspiration

[adpandey.com](https://www.adpandey.com/): borrowed the nav bar design and general vibe.
go check it out, it's sick.
