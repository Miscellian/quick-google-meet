/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const GETTEXT_DOMAIN = "my-indicator-extension";
const { GObject, St, Gio, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;
const Me = ExtensionUtils.getCurrentExtension();
const _ = ExtensionUtils.gettext;

const Indicator = GObject.registerClass(
	class Indicator extends PanelMenu.Button {
		_init() {
			super._init(0.0, _("Quick Google Meet"));

			// Icon
			const gicon = Gio.icon_new_for_string(`${Me.path}/static/google-meet.svg`);
			this.menuItem = new St.Icon({
				gicon,
				style_class: "system-status-icon"
			});

			this.add_child(this.menuItem);

			// Menu items
			const staticLinkItem = new PopupMenu.PopupMenuItem(_("Static Link"));
			const dynamicLinkItem = new PopupMenu.PopupMenuItem(_(`Dynamic Link`));

			staticLinkItem.connect("activate", () => {
				// Copy link to clipboard
				St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, `http://g.co/meet/${GLib.get_real_name()}`);
				// Open link google chrome
				Util.spawn(["xdg-open", `http://g.co/meet/${GLib.get_real_name()}`]);
			});
			dynamicLinkItem.connect("activate", () => {
				// Copy link to clipboard
				St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, `http://g.co/meet${GLib.get_real_name()}${Date.now()}`);
				// Open link google chrome
				Util.spawn(["xdg-open", `http://g.co/meet/${GLib.get_real_name()}${Date.now()}`]);
			});

			this.menu.addMenuItem(staticLinkItem);
			this.menu.addMenuItem(dynamicLinkItem);
		}
	});

class Extension {
	constructor(uuid) {
		this._uuid = uuid;

		ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
	}

	enable() {
		this._indicator = new Indicator();
		Main.panel.addToStatusArea(this._uuid, this._indicator);
	}

	disable() {
		this._indicator.destroy();
		this._indicator = null;
	}
}

function init(meta) {
	return new Extension(meta.uuid);
}
