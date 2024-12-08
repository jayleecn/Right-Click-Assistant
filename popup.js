// DOM 元素
const shortcutsContainer = document.getElementById('shortcuts-container');
const addShortcutBtn = document.getElementById('add-shortcut');
const shortcutForm = document.getElementById('shortcut-form');
const shortcutNameInput = document.getElementById('shortcut-name');
const shortcutUrlInput = document.getElementById('shortcut-url');
const saveShortcutBtn = document.getElementById('save-shortcut');
const cancelShortcutBtn = document.getElementById('cancel-shortcut');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadShortcuts();
  setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
  addShortcutBtn.addEventListener('click', showShortcutForm);
  saveShortcutBtn.addEventListener('click', saveShortcut); 
  cancelShortcutBtn.addEventListener('click', hideShortcutForm);
}

// 加载快捷方式
async function loadShortcuts() {
  const { shortcuts = [] } = await chrome.storage.sync.get('shortcuts');
  
  shortcutsContainer.innerHTML = '';
  shortcuts.forEach(shortcut => {
    shortcutsContainer.appendChild(createShortcutElement(shortcut));
  });
  
  // 更新右键菜单
  updateContextMenus(shortcuts);
}

// 创建快捷方式元素
function createShortcutElement(shortcut) {
  const div = document.createElement('div');
  div.className = 'shortcut-item';
  div.dataset.id = shortcut.id;
  div.innerHTML = `
    <div class="shortcut-info">
      <div class="shortcut-name">${shortcut.name}</div>
      <div class="shortcut-url" title="${shortcut.url}">${shortcut.url}</div>
    </div>
    <div class="shortcut-actions">
      <label class="toggle-switch">
        <input type="checkbox" ${shortcut.enabled ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
      <button class="delete-btn">×</button>
    </div>
  `;

  // 切换开关事件
  const toggle = div.querySelector('input[type="checkbox"]');
  toggle.addEventListener('change', async () => {
    await handleToggleChange(shortcut, toggle);
  });

  // 删除按钮事件
  const deleteBtn = div.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', async () => {
    const confirmed = await showConfirmDialog(`确定要删除"${shortcut.name}"吗？`);
    if (confirmed) {
      div.remove();
      // 获取当前所有快捷方式
      const currentShortcuts = Array.from(shortcutsContainer.children).map(element => {
        const nameEl = element.querySelector('.shortcut-name');
        const urlEl = element.querySelector('.shortcut-url');
        const toggle = element.querySelector('input[type="checkbox"]');
        return {
          id: element.dataset.id,
          name: nameEl.textContent,
          url: urlEl.textContent,
          enabled: toggle.checked,
          system: false,
          removable: true
        };
      });
      await saveShortcuts(currentShortcuts);
    }
  });

  return div;
}

// 显示添加快捷方式表单
function showShortcutForm() {
  shortcutForm.classList.remove('hidden');
  addShortcutBtn.style.display = 'none';
}

// 隐藏添加快捷方式表单
function hideShortcutForm() {
  shortcutForm.classList.add('hidden');
  addShortcutBtn.style.display = 'block';
  shortcutNameInput.value = '';
  shortcutUrlInput.value = '';
}

// 保存新的快捷方式
async function saveShortcut() {
  const name = shortcutNameInput.value.trim();
  const url = shortcutUrlInput.value.trim();

  if (!name || !url) {
    await showAlertDialog('请填写名称和URL');
    return;
  }

  const shortcut = {
    id: Date.now().toString(),
    name,
    url,
    enabled: true,
    system: false,
    removable: true
  };

  const { shortcuts = [] } = await chrome.storage.sync.get('shortcuts');
  shortcuts.push(shortcut);
  await chrome.storage.sync.set({ shortcuts });

  shortcutsContainer.appendChild(createShortcutElement(shortcut));
  hideShortcutForm();
  updateContextMenus(shortcuts);
}

// 保存所有快捷方式
async function saveShortcuts(shortcuts) {
  await chrome.storage.sync.set({ shortcuts });
  // 发送消息给 background.js 更新右键菜单
  await chrome.runtime.sendMessage({ 
    action: 'updateContextMenus',
    shortcuts: shortcuts 
  });
}

// 更新右键菜单
async function updateContextMenus(shortcuts) {
  try {
    await chrome.runtime.sendMessage({ 
      action: 'updateContextMenus',
      shortcuts: shortcuts 
    });
  } catch (error) {
    console.error('Failed to update context menus:', error);
  }
}

// 切换开关事件处理
async function handleToggleChange(shortcut, checkbox) {
  shortcut.enabled = checkbox.checked;
  const { shortcuts = [] } = await chrome.storage.sync.get('shortcuts');
  const updatedShortcuts = shortcuts.map(s => 
    s.id === shortcut.id ? shortcut : s
  );
  await saveShortcuts(updatedShortcuts);
}

// 自定义确认对话框
function showConfirmDialog(message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirm-dialog');
    const messageEl = dialog.querySelector('.confirm-dialog-message');
    const cancelBtn = dialog.querySelector('.confirm-dialog-cancel');
    const okBtn = dialog.querySelector('.confirm-dialog-ok');

    messageEl.textContent = message;
    dialog.classList.remove('hidden');

    const handleCancel = () => {
      dialog.classList.add('hidden');
      cancelBtn.removeEventListener('click', handleCancel);
      okBtn.removeEventListener('click', handleOk);
      resolve(false);
    };

    const handleOk = () => {
      dialog.classList.add('hidden');
      cancelBtn.removeEventListener('click', handleCancel);
      okBtn.removeEventListener('click', handleOk);
      resolve(true);
    };

    cancelBtn.addEventListener('click', handleCancel);
    okBtn.addEventListener('click', handleOk);
  });
}

// 自定义提示对话框
function showAlertDialog(message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('alert-dialog');
    const messageEl = dialog.querySelector('.confirm-dialog-message');
    const okBtn = dialog.querySelector('.alert-dialog-ok');

    messageEl.textContent = message;
    dialog.classList.remove('hidden');

    const handleOk = () => {
      dialog.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      resolve();
    };

    okBtn.addEventListener('click', handleOk);
  });
}

// 获取设置选项的元素
const emailCheckbox = document.getElementById('enableEmail');
const textProcessCheckbox = document.getElementById('enableTextProcess');


// 从存储中加载设置
chrome.storage.sync.get(['enableEmail', 'enableTextProcess'], (result) => {
  emailCheckbox.checked = result.enableEmail !== false;
  textProcessCheckbox.checked = result.enableTextProcess !== false;
});


// 保存设置变更
emailCheckbox.addEventListener('change', (e) => {
  chrome.storage.sync.set({ enableEmail: e.target.checked });
  updateContextMenus();
});

textProcessCheckbox.addEventListener('change', (e) => {
  chrome.storage.sync.set({ enableTextProcess: e.target.checked });
  updateContextMenus();
});
