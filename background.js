// Defaults only on first install — one ChatGPT entry enabled; rest off.
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== 'install') {
    await createContextMenus();
    return;
  }

  const defaultShortcuts = [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      url: 'https://chatgpt.com/?q={text_selected}',
      enabled: true,
      system: true,
      removable: true
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      url: 'https://www.perplexity.ai/?q={text_selected}',
      enabled: false,
      system: true,
      removable: true
    },
    {
      id: 'google',
      name: 'Google Search',
      url: 'https://www.google.com/search?q={text_selected}',
      enabled: false,
      system: true,
      removable: true
    },
    {
      id: 'x_search',
      name: 'X Search',
      url: 'https://x.com/search?q={text_selected}',
      enabled: false,
      system: true,
      removable: true
    },
    {
      id: 'baidu',
      name: 'Baidu Search',
      url: 'https://www.baidu.com/s?wd={text_selected}',
      enabled: false,
      system: true,
      removable: true
    }
  ];
  await chrome.storage.sync.set({ shortcuts: defaultShortcuts });
  await createContextMenus(defaultShortcuts);
});

async function createContextMenus(shortcuts) {
  await chrome.contextMenus.removeAll();

  if (!shortcuts) {
    const stored = await chrome.storage.sync.get('shortcuts');
    shortcuts = stored.shortcuts || [];
  }

  for (const shortcut of shortcuts) {
    if (!shortcut?.enabled || !shortcut.id) continue;
    chrome.contextMenus.create({
      id: String(shortcut.id),
      title: String(shortcut.name || shortcut.id),
      contexts: ['selection']
    });
  }
}

// Single path: storage change rebuilds menus (popup only writes storage).
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.shortcuts) {
    createContextMenus(changes.shortcuts.newValue);
  }
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

createContextMenus();

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const { shortcuts = [] } = await chrome.storage.sync.get('shortcuts');
  const shortcut = shortcuts.find((s) => s.id === info.menuItemId);
  if (!shortcut?.url) return;

  const url = shortcut.url
    .replaceAll('{text_selected}', encodeURIComponent(info.selectionText || ''))
    .replaceAll('{url}', encodeURIComponent(tab?.url || ''))
    .replaceAll('{title}', encodeURIComponent(tab?.title || ''));

  chrome.tabs.create({ url });
});
