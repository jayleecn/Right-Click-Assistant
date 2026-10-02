# Repository navigation

Chrome Manifest V3 extension; plain JavaScript, no npm or build step.

- Runtime entries: `manifest.json` → `background.js` and `popup.html` → `popup.js`.
- Menu lifecycle, default engines, placeholder encoding: `background.js`.
- Shortcut editing and `chrome.storage.sync.shortcuts`: `popup.js`.
- Appearance: `popup.html`, `popup.css`; store privacy copy: `docs/privacy.html`.
- Start with [README.md](README.md) for unpacked installation and smoke checks.

The manifest is the authority for version and permissions. Menus rebuild on storage changes and lifecycle events. Saved shortcut objects cross the popup/worker boundary; inspect both sides when changing their fields. There is no automated test suite.
