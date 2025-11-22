# 🏯 Imperial Cabinet (大清内阁)

**English** | [中文说明](#chinese-readme)

> **🟢 Live Demo / 在线试玩**: [https://naoziyoupao.github.io/imperial-cabinet---the-six-ministries/](https://naoziyoupao.github.io/imperial-cabinet---the-six-ministries/)

An immersive AI role-playing application built with **React 19**, **TypeScript**, and **Vite**. You play as the Emperor of China, consulting with the Six Ministers (Personnel, Revenue, Rites, War, Justice, Works). The application features a unique "Guofeng" (Ancient Chinese) aesthetic and supports multiple AI providers (Google Gemini, DeepSeek, OpenAI).

---

## ✨ Features

*   **Six Unique Personas**: Each minister has a distinct personality, specific duties, and memory context.
*   **Ancient Aesthetic**: UI designed with ink-wash colors, wood textures, and vertical calligraphy.
*   **Persistent Memory**: Your **API Keys**, **Model Settings**, and **Chat History** are automatically saved in your browser (LocalStorage). No need to re-configure every time you open the app.
*   **Imperial Library (Presets)**: Configure and save your favorite model setups (e.g., "DeepSeek V3", "Local Llama") into the "Imperial Library" for one-click switching.
*   **Multi-Model Support**:
    *   **Google GenAI**: Built-in support for Gemini Flash/Pro.
    *   **Universal Protocol**: Support for OpenAI-compatible APIs (DeepSeek, GPT-4, Claude via proxy).
*   **Multimodal**: Upload images ("Present Scroll") for the ministers to analyze.

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

### 3. Configuration (Two Ways)

#### Option A: UI Setup (Recommended & Easiest)
1.  Run the app (`npm run dev`).
2.  If no key is detected, an **"Imperial Decree" (圣旨)** banner will appear at the top.
3.  Paste your Google Gemini API Key there and click **Accept**.
4.  The key is saved securely in your browser's local storage.

#### Option B: Code Setup (.env)
Create a file named `.env` in the root directory. Add your key:

```env
VITE_API_KEY=your_google_api_key_here
```

### 4. Run the App
```bash
npm run dev
```
Click the link shown in the terminal (usually `http://localhost:5173`) to open the app.

---

## 📖 User Guide

### 👑 Summoning Ministers
Click on the tablets on the left sidebar to switch between ministries. Each minister acts independently.

### ⚙️ Secret Edict (Settings & Library)
Click the **Settings (Gear Icon)** in the top right to open the **Secret Edict** panel.
*   **Communication Protocol**: Switch between Google GenAI and Universal (OpenAI format).
*   **Imperial Library**: Click a preset to load it instantly.
*   **Configuration Editor**:
    1.  Enter a Model ID (e.g., `deepseek-chat`).
    2.  Enter a Base URL (if using non-Google models).
    3.  Give it a **Name** and click **"Add Current Config to Library"** to save it for later.

---

## 🛠️ Developer Guide

### 📂 Project Structure

*   `src/constants.tsx`: **Start here!** Contains the definitions for Ministers, Icons, and Prompts.
*   `src/services/geminiService.ts`: The "backend" logic connecting to AI APIs.
*   `src/App.tsx`: Main layout and state management (persistence logic).

### 📖 Common Customizations

#### 1. How to change a Minister's personality?
Open `src/constants.tsx`, find `MINISTERS`. Edit the `systemInstruction`. This is the prompt that defines how they speak.

#### 2. How to add a new Minister?
1.  `src/types.ts`: Add to `MinistryType` enum.
2.  `src/constants.tsx`: Add icon to `MINISTRY_ICONS` and details to `MINISTERS` array.

#### 3. How to add more default presets?
Open `src/constants.tsx` and edit `AI_PRESETS`. These are the hardcoded defaults available to all users.

---
---

<a id="chinese-readme"></a>
# 🏯 大清内阁 (Imperial Cabinet)

> **🟢 在线试玩 (无需安装)**: [https://naoziyoupao.github.io/imperial-cabinet---the-six-ministries/](https://naoziyoupao.github.io/imperial-cabinet---the-six-ministries/)

这是一个基于 **React 19**、**TypeScript** 和 **Vite** 构建的沉浸式 AI 角色扮演应用。您将扮演皇帝，与大清六部（吏、户、礼、兵、刑、工）尚书进行廷议。应用拥有独特的中国古风 UI，并支持多种 AI 模型（Google Gemini, DeepSeek, OpenAI）。

---

## ✨ 功能亮点

*   **六大个性尚书**：每位尚书都有独特的性格、职责和独立的记忆上下文。
*   **古风美学**：水墨配色、木质纹理、竖排书法字体。
*   **自动存档**：您的 **API Key**、**模型设置**以及**御书房配置**会自动保存在浏览器本地（LocalStorage），下次打开无需重新输入。
*   **御书房 (模型库)**：您可以将常用的模型配置（如 DeepSeek V3、本地 Ollama 配置）保存到“御书房”，实现一键切换。
*   **多模型支持**：
    *   **Google GenAI**：原生支持 Gemini Flash/Pro。
    *   **通用协议**：支持 OpenAI 兼容接口（可连接 DeepSeek、GPT-4、Kimi 等）。
*   **多模态交互**：支持上传图片（“呈览图卷”），尚书可识别图片内容。

---

## 🚀 快速开始

### 1. 准备工作
确保您的电脑已安装 **Node.js** (推荐 v18 或更高版本)。

### 2. 安装依赖
在项目文件夹中打开终端（Terminal / CMD）：

```bash
npm install
```

### 3. 配置 API Key (两种方式)

#### 方式 A：界面设置 (最简单)
1.  启动应用 (`npm run dev`)。
2.  如果程序未检测到 Key，顶部会降下 **“圣旨” (Imperial Decree)** 横幅。
3.  在横幅中直接粘贴您的 Google Gemini API Key，点击 **Accept (钦此)**。
4.  Key 会被保存在您的浏览器中，下次打开自动加载。

#### 方式 B：代码设置 (.env)
在项目根目录创建一个名为 `.env` 的文件，填入您的 Key：

```env
VITE_API_KEY=这里填入你的key
```

### 4. 启动应用
```bash
npm run dev
```
点击终端中显示的链接（通常是 `http://localhost:5173`）即可打开。

---

## 📖 使用说明

### 👑 召见尚书
点击左侧的官职名牌即可切换不同的部门。每位尚书的记忆和设置都是独立的。

### ⚙️ 密旨 (设置与御书房)
点击右上角的 **设置 (齿轮图标)** 打开 **密旨** 面板。
*   **通讯协议**：切换 Google 官方源或通用源 (OpenAI 格式)。
*   **御书房 (Imperial Library)**：点击列表中的预设，一键加载模型配置。
*   **配置编辑器**：
    1.  输入模型 ID (如 `deepseek-chat`)。
    2.  输入接口地址 (Base URL，如果使用非 Google 模型)。
    3.  在上方输入 **名称 (Name)**，点击 **"Add to Library"** 即可将其收入御书房，永久保存。

---

## 🛠️ 开发者指南 (魔改)

### 📂 核心文件

*   `src/constants.tsx`: **核心配置**。包含尚书人设、图标和提示词 (Prompt)。
*   `src/services/geminiService.ts`: 负责调用 AI 接口的逻辑层。
*   `src/App.tsx`: 主界面布局及存档逻辑。

### 📖 常见修改

#### 1. 如何修改尚书的性格/人设？
打开 `src/constants.tsx`，找到 `MINISTERS`。修改 `systemInstruction` 字段。这是发送给 AI 的系统提示词，您可以规定他必须用文言文，或者变成一个贪官。

#### 2. 如何增加一个新的尚书？
1.  `src/types.ts`: 在 `MinistryType` 中增加新枚举。
2.  `src/constants.tsx`: 在 `MINISTERS` 数组中添加新尚书信息。

#### 3. 如何添加默认的推荐模型？
打开 `src/constants.tsx`，修改 `AI_PRESETS` 对象。这里定义的预设是所有用户默认可见的。