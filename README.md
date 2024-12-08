# 右键助手 (Right-Click Assistant)

一个简单而强大的 Chrome 扩展，用于增强浏览器的右键菜单功能。

## 功能特点

- 🔍 **内置搜索功能**
  - Baidu 搜索
  - Google 搜索
  - 支持选中文本直接搜索

- 📤 **快捷分享**
  - 分享到 X (Twitter)
  - 邮件分享

- ✨ **自定义快捷方式**
  - 添加自定义右键菜单项
  - 支持自定义 URL 模板
  - 灵活的启用/禁用控制
  - 简单的删除管理

## 变量支持

在创建自定义快捷方式时，支持以下变量：

- `{text_selected}` - 选中的文本
- `{url}` - 当前页面的 URL
- `{title}` - 当前页面的标题

## 使用方法

1. **安装扩展**
   - 从 Chrome 网上应用店安装
   - 或下载源码后，通过开发者模式加载

2. **使用默认功能**
   - 选中文本
   - 右键点击
   - 选择需要的功能（搜索/分享）

3. **添加自定义快捷方式**
   - 点击扩展图标
   - 点击"添加快捷方式"
   - 输入名称和 URL 模板
   - 使用上述变量自定义功能

## 技术特点

- 使用 Chrome Extension Manifest V3
- 纯原生 JavaScript 实现，无需额外依赖
- 支持 Chrome 存储同步
- 简洁现代的用户界面

## 开发相关

本扩展使用以下技术：
- HTML5
- CSS3
- JavaScript (ES6+)
- Chrome Extension API

主要文件结构：
```
├── manifest.json      # 扩展配置文件
├── popup.html        # 弹出窗口 HTML
├── popup.js         # 弹出窗口逻辑
├── popup.css        # 弹出窗口样式
├── background.js    # 后台服务
└── icons/          # 图标文件夹
```

## 许可证

MIT License
