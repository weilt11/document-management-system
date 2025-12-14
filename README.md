# document-management-system
# 📁 纯前端文档在线管理系统

一个基于 **React** 和 **Ant Design** 构建的纯前端文档管理应用。所有数据通过浏览器本地存储 (`localStorage`) 处理，无需后端支持，实现了用户管理、文档上传/下载/预览、操作日志等完整功能。

> **对应实验**：此项目为《Web应用开发与安全》课程实验一的核心成果，并作为实验二（Web安全攻防）的测试平台。

## ✨ 核心功能
- **👨‍💻 用户管理**：注册、登录、登出与信息维护。
- **📄 文档全周期管理**：支持上传、预览、下载、重命名与删除文档。
- **🖼️ 智能预览**：支持在线预览图片及PDF文件。
- **📊 操作日志**：完整记录所有用户操作，便于审计。
- **💾 本地化存储**：使用 `localStorage` 持久化存储用户、文档及日志数据。

## 🚀 快速启动
按照以下步骤在本地运行此项目：

1.  **克隆项目**
    ```bash
    git clone 你的仓库URL
    cd document-management-system
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm start
    ```
    应用将在浏览器中自动打开（通常为 `http://localhost:3000`）。

4.  **首次使用**
    *   访问 `http://localhost:3000`。
    *   注册一个新账号。
    *   登录后即可开始使用所有文档管理功能。

## 📁 项目结构与技术栈
document-management-system/
├── public/ # 静态资源
├── src/
│ ├── components/ # 可复用组件
│ ├── pages/ # 页面组件 (登录、文档管理、用户管理等)
│ ├── services/ # 核心服务 (AuthService, DocumentService)
│ └── ...
├── package.json # 项目依赖与脚本
└── README.md # 本文件

**主要技术栈**：
- **前端框架**: React 18
- **UI 组件库**: Ant Design 5
- **路由管理**: React Router DOM 6
- **状态管理**: React Context API
- **构建工具**: Create React App

## 🔧 核心服务接口
项目采用纯前端架构，核心业务逻辑封装在 `src/services/` 下：
- **`AuthService.js`**：处理用户认证、注册与会话管理。
- **`DocumentService.js`**：处理所有文档操作，利用 `FileReader API` 实现文件与Base64的转换。

## 📝 实验报告关联
本系统作为《Web应用开发与安全》课程实验的基础平台：
- **实验一**：实现了本系统的全部功能。
- **实验二**：在本系统基础上，搭建了模拟的SQL注入漏洞环境 (`vulnerable-server.js`) 与安全防护环境 (`safe-server.js`)，用于进行Web安全攻防实验。

## 🛠️ 构建与部署
构建用于生产环境的优化版本：
```bash
npm run build
