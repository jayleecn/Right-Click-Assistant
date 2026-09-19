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
- Rebuild menus only from `storage.onChanged`

### 0.1.1
- Header link + style tweak

### 0.1.0
- Initial release

## License

MIT
