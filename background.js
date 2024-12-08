// 创建右键菜单
chrome.runtime.onInstalled.addListener(async (details) => {
  // 只在首次安装时初始化默认快捷方式
  if (details.reason === 'install') {
    const defaultShortcuts = [
      {
        id: 'baidu',
        name: 'Baidu搜索',
        url: 'https://www.baidu.com/s?wd={selectiontext}',
        enabled: true,
        system: true,
        removable: true
      },
      {
        id: 'google',
        name: 'Google搜索',
        url: 'https://www.google.com/search?q={selectiontext}',
        enabled: true,
        system: true,
        removable: true
      },
      {
        id: 'email',
        name: '发送邮件',
        url: 'mailto:?body={selectiontext}',
        enabled: true,
        system: true,
        removable: true
      }
    ];
    await chrome.storage.sync.set({ shortcuts: defaultShortcuts });
  }
  await updateContextMenus();
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateContextMenus') {
    updateContextMenus(message.shortcuts);
  }
});

// 更新右键菜单
async function updateContextMenus(shortcuts) {
  // 清除所有现有菜单
  await chrome.contextMenus.removeAll();

  // 如果没有提供快捷方式，从存储中加载
  if (!shortcuts) {
    const { shortcuts: storedShortcuts = [] } = await chrome.storage.sync.get('shortcuts');
    shortcuts = storedShortcuts;
  }

  // 只为启用的快捷方式创建菜单
  shortcuts.filter(s => s.enabled).forEach(shortcut => {
    chrome.contextMenus.create({
      id: shortcut.id,
      title: shortcut.name,
      contexts: ['selection'],
    });
  });
}

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // 获取所有快捷方式
  const { shortcuts = [] } = await chrome.storage.sync.get('shortcuts');
  
  // 查找被点击的快捷方式
  const shortcut = shortcuts.find(s => s.id === info.menuItemId);
  
  if (shortcut) {
    // 替换选中文本
    let url = shortcut.url.replace('{selectiontext}', encodeURIComponent(info.selectionText || ''));
    
    // 在新标签页中打开URL
    chrome.tabs.create({ url });
  }
});
