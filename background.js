// 创建右键菜单
chrome.runtime.onInstalled.addListener(async (details) => {
  // 只在首次安装时初始化默认快捷方式
  if (details.reason === 'install') {
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
        name: 'Google搜索',
        url: 'https://www.google.com/search?q={text_selected}',
        enabled: false,
        system: true,
        removable: true
      },
      {
        id: 'x_search',
        name: 'X 搜索',
        url: 'https://x.com/search?q={text_selected}',
        enabled: false,
        system: true,
        removable: true
      },
      {
        id: 'baidu',
        name: 'Baidu搜索',
        url: 'https://www.baidu.com/s?wd={text_selected}',
        enabled: false,
        system: true,
        removable: true
      }
    ];
    await chrome.storage.sync.set({ shortcuts: defaultShortcuts });
  }
});

// 清除所有右键菜单
chrome.runtime.onStartup.addListener(() => {
  chrome.contextMenus.removeAll();
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateContextMenus') {
    createContextMenus(message.shortcuts);
  }
});

// 创建右键菜单
async function createContextMenus(shortcuts) {
  // 先清除所有现有菜单
  await chrome.contextMenus.removeAll();
  
  // 如果没有提供快捷方式，从存储中加载
  if (!shortcuts) {
    const { shortcuts: storedShortcuts = [] } = await chrome.storage.sync.get('shortcuts');
    shortcuts = storedShortcuts;
  }
  
  // 获取所有启用的快捷方式
  const enabledShortcuts = shortcuts.filter(shortcut => shortcut.enabled);
  
  // 为每个启用的快捷方式创建一级菜单项
  enabledShortcuts.forEach(shortcut => {
    chrome.contextMenus.create({
      id: shortcut.id,
      title: shortcut.name,
      contexts: ['selection'],
    });
  });
}

// 监听存储变化，更新右键菜单
chrome.storage.onChanged.addListener((changes) => {
  if (changes.shortcuts) {
    createContextMenus();
  }
});

// 初始化右键菜单
createContextMenus();

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // 获取所有快捷方式
  const { shortcuts = [] } = await chrome.storage.sync.get('shortcuts');
  
  // 查找被点击的快捷方式
  const shortcut = shortcuts.find(s => s.id === info.menuItemId);
  
  if (shortcut) {
    // 替换选中文本、当前页面 URL 和标题
    let url = shortcut.url
      .replace('{text_selected}', encodeURIComponent(info.selectionText || ''))
      .replace('{url}', encodeURIComponent(tab.url || ''))
      .replace('{title}', encodeURIComponent(tab.title || ''));
    
    // 在新标签页中打开URL
    chrome.tabs.create({ url });
  }
});
