import St from 'gi://St';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

// Refresh interval in seconds
const INTERVAL = 5;

// Project metadata
const GITHUB_URL = 'https://github.com/ni720/syncthing-tray';

const SyncthingTray = GObject.registerClass(
class SyncthingTray extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Syncthing Tray');

        // The status icon shown in the panel
        this._icon = new St.Icon({
            gicon: Gio.icon_new_for_string('emblem-synchronizing-symbolic'),
            style_class: 'system-status-icon',
        });
        this.add_child(this._icon);

        // --- Menu Structure ---

        // 1. Status display (not clickable)
        this._statusItem = new PopupMenu.PopupMenuItem(
            'Syncthing: Checking...', { reactive: false });
        this.menu.addMenuItem(this._statusItem);

        // Separator after status
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // 2. Start Syncthing
        this._startItem = new PopupMenu.PopupMenuItem('Start Syncthing');
        this._startItem.connect('activate', () => {
            try {
                GLib.spawn_command_line_async(
                    'systemctl --user start syncthing');
                log('syncthing-tray: started Syncthing');
            } catch (e) {
                log(`syncthing-tray: failed to start Syncthing: ${e}`);
            }
        });
        this.menu.addMenuItem(this._startItem);

        // 3. Open Web UI
        this._openItem = new PopupMenu.PopupMenuItem('Open Syncthing Web UI');
        this._openItem.connect('activate', () => {
            try {
                GLib.spawn_command_line_async(
                    'xdg-open http://127.0.0.1:8384');
            } catch (e) {
                log(`syncthing-tray: failed to open web UI: ${e}`);
            }
        });
        this.menu.addMenuItem(this._openItem);

        // Separator before footer
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // 4. GitHub Project
        this._githubItem = new PopupMenu.PopupMenuItem('GitHub Project');
        this._githubItem.connect('activate', () => {
            try {
                GLib.spawn_command_line_async(
                    `xdg-open "${GITHUB_URL}"`);
            } catch (e) {
                log(`syncthing-tray: failed to open GitHub: ${e}`);
            }
        });
        this.menu.addMenuItem(this._githubItem);

        // Periodically refresh the status
        this._timeout = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT, INTERVAL, () => {
                this._update();
                return GLib.SOURCE_CONTINUE;
            });

        // Perform an initial check right away
        this._update();
    }

    // Refresh icon and status text based on the current status
    _update() {
        const running = this._isRunning();

        // Update icon
        if (running) {
            this._icon.set_gicon(
                Gio.icon_new_for_string('emblem-synchronizing-symbolic'));
            this._icon.set_style('');
        } else {
            this._icon.set_gicon(
                Gio.icon_new_for_string('dialog-warning-symbolic'));
            this._icon.set_style('opacity: 0.6;');
        }

        // Update status text in menu
        this._statusItem.label.set_text(
            running ? 'Syncthing: Running' : 'Syncthing: Not running');

        // Enable/disable start button based on status
        this._startItem.setSensitive(!running);
    }

    // Check whether Syncthing is running by looking at the process list
    _isRunning() {
        try {
            const [ok, , , status] = GLib.spawn_command_line_sync(
                'pgrep -x syncthing');
            return ok && status === 0;
        } catch (e) {
            return false;
        }
    }

    // Clean up timers when the extension is disabled
    destroy() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
        super.destroy();
    }
});

export default class SyncthingTrayExtension {
    enable() {
        this._indicator = new SyncthingTray();
        Main.panel.addToStatusArea('syncthing-tray', this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
