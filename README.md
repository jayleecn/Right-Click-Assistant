# Right Click Assistant

Select text → right-click → open a search or AI URL. Custom engines. Minimal permissions.

Store: [Chrome Web Store](https://chromewebstore.google.com/detail/right-click-assistant/naebpmldncffaicbbckajajogemnbjlh)

## Features

- Context menu on selected text
- Defaults: ChatGPT on; Perplexity / Google / X / Baidu off
- Custom URL templates with `{text_selected}`, `{url}`, `{title}`

## Permissions

- `contextMenus` — menu items
- `storage` — save shortcuts

No host access. No `activeTab`. Opens a new tab with the built URL only.

## Changelog

### 0.1.2
- Drop `host_permissions` (`*://*/*`) and `activeTab`
- Fix startup wiping menus without recreate
- Remove dead Email/TextProcess settings code
- Serialize menu rebuilds from storage changes, install/update, startup, and worker initialization

### 0.1.1
- Header link + style tweak

### 0.1.0
- Initial release

## License

MIT

## Develop locally

Load this repository directory as an unpacked extension at `chrome://extensions/` (enable Developer mode first). There is no package installation or build step. Reload the extension after editing its files.

| Task | Start here |
| --- | --- |
| Default engines, context-menu lifecycle, URL substitution | [background.js](background.js) |
| Add/delete/toggle engines and synced settings | [popup.js](popup.js) |
| Popup markup and appearance | [popup.html](popup.html), [popup.css](popup.css) |
| Permissions, version, runtime entry points | [manifest.json](manifest.json) |
| Published privacy page | [docs/privacy.html](docs/privacy.html) |

`chrome.storage.sync.shortcuts` connects the popup and worker. Each item has `id`, `name`, `url`, and `enabled`; URL placeholders are encoded by the worker.

Smoke check: select text and open the enabled engine; add/toggle/delete an engine in the popup; restart Chrome and confirm saved engines and menus persist. Inspect service-worker errors from the extension's card at `chrome://extensions/`. The repository has no automated test runner.
