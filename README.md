# Stay on Monitor

**Keep Chrome locked to the monitor you choose.**

Playing a fullscreen game (CS2, Valorant, etc.) on one screen and browsing on the other?
Every alt+tab, Windows throws Chrome back to your main monitor. Stay on Monitor puts it right back.

![icon](icons/icon128.png)

## Features

- 🔒 One-click toggle to lock every Chrome window to a monitor
- 🖥️ Choose which monitor from the popup
- ⌨️ Keyboard shortcut: `Alt+Shift+F`
- 🎮 Fixes the alt+tab problem with fullscreen / stretched-resolution games
- 🌎 English and Portuguese (switch with the flags in the popup)
- 🇧🇷 Built-in Pix QR code page for donations (choose the amount)
- 🕵️ No data collected, no ads, no network requests

## Install

**Chrome Web Store:** _coming soon_

**Manual (developer mode):**
1. Download this repository (`Code → Download ZIP`) and unzip it
2. Open `chrome://extensions`
3. Turn on **Developer mode**
4. Click **Load unpacked** and select the folder

## How to use

1. Put Chrome on the monitor you want
2. Click the Stay on Monitor icon and turn the switch on (or press `Alt+Shift+F`)
3. Done. If Chrome gets moved to another monitor, it goes back automatically

To change the shortcut, open `chrome://extensions/shortcuts`.

## Support ❤

Stay on Monitor is free. If it helps you, consider supporting development:

- 🇧🇷 **Pix** (Brazil): click **Pix** in the extension popup to get a QR code, or use the key `6cf2fa1a-ddeb-40e8-868e-aaed58270125`
- 🌎 International options (Ko-fi / PayPal): coming soon
- ⭐ Star this repository

## Development

```
background.js        service worker: lock logic
i18n.js              UI strings (English / Portuguese)
popup/               popup UI (switch, monitor picker, language flags, support buttons)
popup/config.js      donation links and Pix key (empty = button hidden)
pix/                 Pix donation page (QR code generated locally)
icons/               extension icons
```

After editing, click ↻ on the extension card in `chrome://extensions`.

## License

Source-available, **all rights reserved**. You can read the code and use the extension,
but copying, republishing or distributing modified versions is not allowed. See [LICENSE](LICENSE).

Contributions are welcome via issues and pull requests.

### Third-party

- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) by Kazuhiko Arase, MIT license (`pix/vendor/qrcode.js`)
