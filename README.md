# 🏯 Imperial Cabinet (大清内阁) v1.1

**English** | [中文说明](#chinese-readme)

> **🟢 Live Demo / 在线试玩**: [https://naoziyoupao.github.io/imperial-cabinet---the-six-ministries/](https://naoziyoupao.github.io/imperial-cabinet---the-six-ministries/)

An immersive AI role-playing application built with **React 19**, **TypeScript**, and **Vite**. You play as the Emperor of China, consulting with the full bureaucratic hierarchy of the Six Ministries. 

**v1.1 Update**: Now features a complete **Bureaucratic Tree** (Ministers, Vice Ministers, Directors), a new **Imperial Theme**, and a **Role Editor** to customize AI personas on the fly.

---

## ✨ v1.1 New Features

*   **🏛️ Expanded Bureaucracy (Hierarchy System)**: 
    *   The Six Ministries are now fully realized departments.
    *   Navigate a recursive tree structure: **Minister (尚书)** -> **Vice Minister (侍郎)** -> **Director (郎中)** -> **Secretary (主事)**.
    *   Each subordinate has a unique rank, duty, and AI personality.
*   **🎨 Visual Customization**:
    *   **Imperial Theme**: Switch between the classic "Scholar's Studio" (Ink & Wood) and the new "Imperial Hall" (Red Lacquer & Gold).
    *   **Full Chinese Mode**: Option to hide all English text for a completely immersive ancient experience.
    *   **Resizable Windows**: All settings panels can now be resized by dragging the edges.
*   **🎭 Role Settings (Prompt Editor)**: 
    *   Modify the System Instruction (Persona) of any official directly within the chat interface. 
    *   Make a Minister more corrupt, more loyal, or more poetic with a few clicks.
*   **⚡ Logic Improvements**:
    *   **Lazy Loading**: The app no longer blocks startup for an API key. It only prompts when necessary.
    *   **DeepSeek Support**: Optimized presets for DeepSeek V3 and R1 models.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) installed.

### 2. Installation
Open your terminal/command prompt in the project folder:

```bash
# Install dependencies
npm install
```

### 3. API Setup (Lazy Loading)
Unlike v1.0, you do **not** need to set up an environment variable immediately.
1.  Run the app: `npm run dev`
2.  Open the browser.
3.  When you try to chat with a minister using a Google model, if no key is found, an **"Imperial Decree"** modal will appear.
4.  Paste your key there once, and it will be saved to your browser.

### 4. Run the App
```bash
npm run dev
```

---

## 📖 User Guide

### 👑 The Audience Hall (Sidebar)
*   **Navigation**: Click the arrow (`>`) next to a Minister's name to expand their department and reveal subordinates (Vice Ministers, Directors, etc.).
*   **Return to Hall**: Click the "Imperial Cabinet" seal/title at the top of the sidebar to return to the welcome screen.

### 🎨 Internal Affairs (Appearance)
Click the **"Appearance" (Palette Icon)** on the welcome screen or in the sidebar.
*   **Theme**: Switch between "Classic" and "Imperial".
*   **语言**: Toggle "Full Chinese" to remove English UI labels.
*   **Font**: Switch between Serif (Standard) and Calligraphy (Cursive).

### 🎭 Role Settings (Persona Editor)
Inside a chat, click the **"Role Settings" (Scroll Icon)** in the top header.
*   You can view and edit the AI's system prompt here.
*   Click **"Save Persona"** to apply changes immediately. 
*   Click **"Reset"** to revert to the default historical persona.

### ⚙️ Secret Edict (Model Settings)
Click the **Settings (Gear Icon)** in the top right.
*   **Protocol**: Switch between Google GenAI and Universal (OpenAI/DeepSeek).
*   **Imperial Library**: Save your favorite model configurations as presets.

---

## 🛠️ Developer Guide

### 📂 Key Files

*   `src/constants.tsx`: **Core Logic**. Contains the `generatePlayableHierarchy` function which builds the recursive tree of ministers.
*   `src/components/MinisterCard.tsx`: Renders the recursive tree nodes in the sidebar.
*   `src/services/geminiService.ts`: Handles API calls, now with distinct error handling for "Missing Seal" (Google) vs "Missing Mandate" (Custom).

### 📖 Customization

#### How to add more ranks to the hierarchy?
Open `src/constants.tsx` and look for the `SUB_ROLES` array. You can define new ranks (e.g., "Grand Secretary") and add them to the `generatePlayableHierarchy` function.

---
---

<a id="chinese-readme"></a>
# 🏯 大清内阁 (Imperial Cabinet) v1.1

> **🟢 在线试玩 (无需安装)**: [https://naoziyoupao.github.io/imperial-cabinet---the-six-ministries/](https://naoziyoupao.github.io/imperial-cabinet---the-six-ministries/)

这是一个基于 **React 19**、**TypeScript** 和 **Vite** 构建的沉浸式 AI 角色扮演应用。

**v1.1 重大更新**: 带来了完整的**官僚树状体系**（从尚书到笔帖式）、金碧辉煌的**皇极殿主题**以及**御批人设**功能。

---

## ✨ v1.1 新增功能

*   **🏛️ 完整的官僚体系 (Hierarchy System)**:
    *   六部不再只是六个联系人，而是完整的部门。
    *   支持点击展开树状结构：**尚书 -> 侍郎 -> 郎中 -> 员外郎 -> 主事 -> 笔帖式**。
    *   每位下属都有独特的品级、职责和 AI 性格。
*   **🎨 深度外观定制**:
    *   **皇极殿主题**: 新增“皇极殿”配色，模拟红漆金丝楠木柱与皇家金饰，体验紫禁城的威严。
    *   **全中文模式**: 可一键隐藏界面上所有的英文标注，还原纯正古风体验。
    *   **弹窗缩放**: 所有的“圣旨”、“密旨”弹窗均支持鼠标拖拽边缘调整大小。
*   **🎭 御批人设 (Role Editor)**:
    *   在聊天界面可直接点击“角色设定”，修改当前官员的 System Prompt（提示词）。
    *   您可以钦定某位官员变得更加贪婪、正直或是唯唯诺诺。
*   **⚡ 体验优化**:
    *   **非阻塞启动**: 启动时不再强制检查 API Key，只有在真正需要时才会弹出提示。
    *   **DeepSeek 优化**: 针对 DeepSeek V3/R1 模型优化了预设配置。

---

## 🚀 快速开始

### 1. 准备工作
确保安装 **Node.js** (v18+)。

### 2. 安装
```bash
npm install
```

### 3. 配置 API (懒加载)
v1.1 版本不需要立即配置环境变量。
1.  运行 `npm run dev` 启动。
2.  在浏览器中尝试与尚书对话。
3.  如果使用的是 Google 模型且未检测到 Key，屏幕会弹出 **“圣旨”** 窗口。
4.  在此处填入 Key 即可。

---

## 📖 使用说明

### 👑 侧边栏 (朝房)
*   **层级导航**: 点击尚书名字右侧的箭头 (`>`) 可展开该部，查看下属官员（侍郎、郎中等）。
*   **回銮**: 点击侧边栏顶部的“大清内阁”标题或玉玺图标，可返回初始欢迎界面。

### 🎨 内务府 (外观设置)
点击欢迎页或侧边栏底部的 **“外观设置”** (画盘图标)。
*   **主题**: 切换 “清雅书斋” (默认) 或 “皇极殿” (新)。
*   **语言**: 选择 “全中文” 模式以隐藏英文。
*   **字体**: 切换 宋体 (标准) 或 楷体 (书法)。

### 🎭 御批人设
在聊天界面顶部，点击 **“角色设定”** (卷轴图标)。
*   此处显示当前 AI 的系统提示词。
*   修改后点击 **“颁布设定”** 即可生效。
*   点击 **“恢复祖制”** 可重置为默认设定。

### ⚙️ 密旨 (模型配置)
点击右上角的 **设置 (齿轮图标)**。
*   **御书房**: 保存您常用的模型配置（如 DeepSeek、Local LLM）。
*   **通讯规制**: 切换 Google 官方源或通用源 (OpenAI 格式)。

---

## 🛠️ 开发者指南

### 📂 核心文件更新

*   `src/constants.tsx`: **核心逻辑**。包含了 `generatePlayableHierarchy` 函数，用于生成六部的递归树状结构。
*   `src/components/MinisterCard.tsx`: 升级为支持递归渲染的组件，处理缩进和折叠逻辑。
*   `src/App.tsx`: 增加了外观状态管理（主题、语言）和树状节点的展开/折叠状态管理。

### 📖 如何扩展

#### 如何增加新的官职层级？
打开 `src/constants.tsx`，找到 `SUB_ROLES` 数组。您可以在此定义新的职位（如“大学士”），并在生成函数中将其挂载到对应的节点下。
