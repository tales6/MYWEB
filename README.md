# tales 个人主页

## 简介

tales 的个人作品集网站，展示嵌入式开发项目、内置在线小游戏和音乐播放。全静态页面，通过 GitHub Pages 部署，绑定自定义域名。

## 架构

采用 **数据驱动 + 模块化** 架构，所有内容（项目/游戏/音乐/语录）通过 JSON 配置文件管理，公共样式和脚本抽取为独立文件。

```
tales-site/
├── index.html                  # 主页（SPA 控制器）
├── CNAME                       # 自定义域名
├── deployed-p1.html            # 部署说明页
├── test-iframe.html            # iframe 测试页
├── config/                     # 📁 数据配置（改这里就能加内容）
│   ├── site.json               #   站点元数据
│   ├── projects.json           #   项目列表
│   ├── games.json              #   游戏列表
│   ├── music.json              #   音乐曲目
│   └── quotes.json             #   开机语录
├── assets/
│   ├── css/
│   │   └── common.css          # 公共样式（变量+导航+文档页）
│   ├── js/
│   │   ├── config.js           # 配置加载器
│   │   ├── theme.js            # 主题切换
│   │   ├── nav.js              # 数据驱动导航渲染
│   │   ├── spa.js              # SPA 导航（loadPage/goHome）
│   │   ├── iframe-detector.js  # iframe 通信桥
│   │   └── reveal.js           # 滚动显现动画
│   ├── avatar.jpg              # 头像（同时作为 favicon）
│   ├── bg.png                  # 背景图
│   └── music/                  # 音乐文件
├── projects/                   # 项目文档
│   └── <project-id>/
│       ├── docs.html           # 项目文档入口
│       └── 代码详解/*.html      # 代码详解页面
├── games/                      # 小游戏
└── README.md                   # 本文件
```

## 功能特性

- **个人主页**：头像展示、数字时钟、音乐播放器、明暗主题切换、启动页名言随机展示
- **项目展示**：FreeRTOS 物联网天气站、STM32 智能浇花系统的完整文档和演示
- **在线小游戏**：贪吃蛇、2048、俄罗斯方块（纯前端 HTML5）
- **嵌入式文档**：项目代码详解、设计报告、接线图、实物演示视频
- **iframe 子系统**：子页面通过 iframe 隔离加载，避免样式/导航冲突
- **底部音乐条**：全局迷你播放器，页面切换不影响播放
- **数据驱动**：项目/游戏/音乐/语录均通过 JSON 配置，修改即生效

## 如何添加内容

### 添加新项目

1. 在 `config/projects.json` 数组中添加一条：
```json
{
  "id": "my-new-project",
  "icon": "🤖",
  "title": "我的新项目",
  "shortTitle": "新项目",
  "desc": "项目描述，显示在卡片上。",
  "dropdownDesc": "技术栈简述",
  "tags": ["STM32", "ROS"],
  "docs": "projects/my-new-project/docs.html",
  "github": "https://github.com/xxx/xxx"
}
```

2. 创建项目目录 `projects/my-new-project/`，在其中创建 `docs.html`（可从现有项目复制）。

3. 完成。导航栏下拉菜单和主页卡片会自动更新。

### 添加新游戏

1. 在 `config/games.json` 数组中添加一条：
```json
{
  "id": "tetris",
  "icon": "🎮",
  "title": "俄罗斯方块",
  "desc": "经典方块消除游戏。",
  "file": "games/tetris.html"
}
```

2. 将游戏文件放入 `games/` 目录。

3. 完成。导航栏和主页游戏卡片会自动更新。

### 添加新音乐

1. 将音频文件放入 `assets/music/` 目录。

2. 在 `config/music.json` 数组中添加一条：
```json
{ "src": "assets/music/song.mp3", "name": "歌曲名", "artist": "艺术家" }
```

3. 完成。音乐播放器曲目列表会自动更新。

### 添加新语录

在 `config/quotes.json` 数组中添加一条：
```json
{ "t": "中文正文", "a": "— 出处" }
```

如果是英文名言需要双语显示：
```json
{ "t": "中文翻译", "o": "English original", "a": "— 出处" }
```

## 创建新的子页面

新建的子页面只需引入公共文件，无需重复 CSS/JS：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="icon" type="image/jpeg" href="<相对路径>/assets/avatar.jpg">
<link rel="apple-touch-icon" href="<相对路径>/assets/avatar.jpg">
<link rel="stylesheet" href="<相对路径>/assets/css/common.css">
<title>页面标题</title>
</head>
<body>
<nav class="top-nav">
  <div class="inner">
    <span class="nav-brand"><a href="<相对路径>/index.html"><span>✦</span> tales</a></span>
    <ul class="nav-links">
      <li><a href="<相对路径>/index.html">首页</a></li>
      <li class="nav-dropdown">
        <a href="javascript:void(0)">项目 ▾</a>
        <div class="dropdown-menu nav-projects-dropdown"></div>
      </li>
      <li class="nav-dropdown">
        <a href="javascript:void(0)">小游戏 ▾</a>
        <div class="dropdown-menu nav-games-dropdown"></div>
      </li>
      <li><a href="https://github.com/tales6" target="_blank">GitHub</a></li>
      <li><a href="https://qm.qq.com/cgi-bin/qm/qr?k=2416829925" target="_blank">QQ</a></li>
      <button class="theme-btn">🌙</button>
    </ul>
  </div>
</nav>

<!-- 页面内容 -->

<script src="<相对路径>/assets/js/config.js"></script>
<script src="<相对路径>/assets/js/theme.js"></script>
<script src="<相对路径>/assets/js/nav.js"></script>
<script src="<相对路径>/assets/js/reveal.js"></script>
<script src="<相对路径>/assets/js/iframe-detector.js"></script>
</body>
</html>
```

**相对路径**根据文件深度：
- 根目录（index.html）→ `assets/...`
- `projects/xxx/` → `../../assets/...`
- `projects/xxx/代码详解/` → `../../../assets/...`

## 本地开发

```bash
python -m http.server 8000
```

浏览器打开 `http://localhost:8000`。

## 部署

推送到 GitHub 仓库 `tales6/MYWEB`，GitHub Pages 自动部署到 `https://www.tales.cc.cd/`。

## 技术栈

- HTML5 / CSS3 / 原生 JavaScript
- CSS 自定义属性（亮/暗主题）
- iframe + postMessage（SPA 导航，保持音乐播放器持续运行）
- JSON 数据驱动（项目/游戏/音乐/语录配置）
- IntersectionObserver（滚动显现动画）

## 许可证

MIT
