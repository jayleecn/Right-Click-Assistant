const shortcutsContainer = document.getElementById('shortcuts-container');
const addShortcutBtn = document.getElementById('add-shortcut');
const shortcutForm = document.getElementById('shortcut-form');
const shortcutNameInput = document.getElementById('shortcut-name');
const shortcutUrlInput = document.getElementById('shortcut-url');
const saveShortcutBtn = document.getElementById('save-shortcut');
const cancelShortcutBtn = document.getElementById('cancel-shortcut');

document.addEventListener('DOMContentLoaded', async () => {
  await loadShortcuts();
  setupEventListeners();
});

function setupEventListeners() {
  addShortcutBtn.addEventListener('click', showShortcutForm);
  saveShortcutBtn.addEventListener('click', saveShortcut);
  cancelShortcutBtn.addEventListener('click', hideShortcutForm);
}

async function loadShortcuts() {
  const { shortcuts = [] } = await chrome.storage.sync.get('shortcuts');
  const shortcutsList = document.querySelector('.shortcuts-list');

  shortcutsContainer.innerHTML = '';

  if (shortcuts.length === 0) {
    shortcutsList.style.display = 'none';
    return;
  }

  shortcutsList.style.display = 'block';
  for (const shortcut of shortcuts) {
    shortcutsContainer.appendChild(createShortcutElement(shortcut));
  }
}

function createShortcutElement(shortcut) {
  const div = document.createElement('div');
  div.className = 'shortcut-item';
  div.dataset.id = shortcut.id;

  const info = document.createElement('div');
  info.className = 'shortcut-info';

  const nameEl = document.createElement('div');
  nameEl.className = 'shortcut-name';
  nameEl.textContent = shortcut.name;

  const urlEl = document.createElement('div');
  urlEl.className = 'shortcut-url';
  urlEl.title = shortcut.url;
  urlEl.textContent = shortcut.url;

  info.appendChild(nameEl);
  info.appendChild(urlEl);

  const actions = document.createElement('div');
  actions.className = 'shortcut-actions';

  const label = document.createElement('label');
  label.className = 'toggle-switch';
  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.checked = Boolean(shortcut.enabled);
  const slider = document.createElement('span');
  slider.className = 'slider';
  label.appendChild(toggle);
  label.appendChild(slider);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.type = 'button';
  deleteBtn.textContent = '×';

  actions.appendChild(label);
  actions.appendChild(deleteBtn);
  div.appendChild(info);
  div.appendChild(actions);

  toggle.addEventListener('change', async () => {
    await handleToggleChange(shortcut, toggle);
  });

  deleteBtn.addEventListener('click', async () => {
    const confirmed = await showConfirmDialog(`Are you sure you want to delete "${shortcut.name}"?`);
    if (!confirmed) return;

    const { shortcuts = [] } = await chrome.storage.sync.get('shortcuts');
    const next = shortcuts.filter((s) => s.id !== shortcut.id);
    await chrome.storage.sync.set({ shortcuts: next });
    div.remove();

    const shortcutsList = document.querySelector('.shortcuts-list');
    if (next.length === 0) shortcutsList.style.display = 'none';
  });

  return div;
}

function showShortcutForm() {
  shortcutForm.classList.remove('hidden');
  addShortcutBtn.style.display = 'none';
}

function hideShortcutForm() {
  shortcutForm.classList.add('hidden');
  addShortcutBtn.style.display = 'block';
  shortcutNameInput.value = '';
  shortcutUrlInput.value = '';
}

async function saveShortcut() {
  const name = shortcutNameInput.value.trim();
  const url = shortcutUrlInput.value.trim();

  if (!name || !url) {
    await showAlertDialog('Please enter both name and URL');
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

  const shortcutsList = document.querySelector('.shortcuts-list');
  shortcutsList.style.display = 'block';
  shortcutsContainer.appendChild(createShortcutElement(shortcut));
  hideShortcutForm();
}

async function handleToggleChange(shortcut, checkbox) {
  const { shortcuts = [] } = await chrome.storage.sync.get('shortcuts');
  const updated = shortcuts.map((s) =>
    s.id === shortcut.id ? { ...s, enabled: checkbox.checked } : s
  );
  await chrome.storage.sync.set({ shortcuts: updated });
}

function showConfirmDialog(message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirm-dialog');
    const messageEl = dialog.querySelector('.confirm-dialog-message');
    const cancelBtn = dialog.querySelector('.confirm-dialog-cancel');
    const okBtn = dialog.querySelector('.confirm-dialog-ok');

    messageEl.textContent = message;
    dialog.classList.remove('hidden');

    const cleanup = (value) => {
      dialog.classList.add('hidden');
      cancelBtn.removeEventListener('click', onCancel);
      okBtn.removeEventListener('click', onOk);
      resolve(value);
    };
    const onCancel = () => cleanup(false);
    const onOk = () => cleanup(true);

    cancelBtn.addEventListener('click', onCancel);
    okBtn.addEventListener('click', onOk);
  });
}

function showAlertDialog(message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('alert-dialog');
    const messageEl = dialog.querySelector('.confirm-dialog-message');
    const okBtn = dialog.querySelector('.alert-dialog-ok');

    messageEl.textContent = message;
    dialog.classList.remove('hidden');

    const onOk = () => {
      dialog.classList.add('hidden');
      okBtn.removeEventListener('click', onOk);
      resolve();
    };
    okBtn.addEventListener('click', onOk);
  });
}
