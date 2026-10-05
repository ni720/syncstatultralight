# Syncthing Tray Ultra light

A minimal GNOME Shell extension that shows whether Syncthing is running.
no dependencies, quickly slopped with AI

## Features

- 🔄 Panel icon showing Syncthing's status (🔄 = running, ⚠️ = stopped)
- 🔄 Auto-refresh every 5 seconds
- 🔗 opens the Syncthing web UI via menu (`http://127.0.0.1:8384`)
- 🚫 No dependencies — pure GJS, checks the process list via `pgrep`

## Installation

```bash
git clone https://github.com/ni720/syncstatultralight.git
cp -r syncstatultralight ~/.local/share/gnome-shell/extensions/syncstatultralight@user
```

Log out and back in, then:

```bash
gnome-extensions enable syncstatultralight@user
```

## Configuration

- **Interval:** change `INTERVAL` in `extension.js` (seconds)
- **Check method:** edit `_isRunning()` in `extension.js` (e.g. replace `pgrep -x syncthing` with `systemctl is-active --user syncthing`)

## Requirements

- GNOME Shell 45+ (tested with to 50)
- Syncthing running locally

## Debugging

```bash
journalctl --user -b -o cat | grep -i syncstat
```

## License

MIT
