# tales 个人主页

## 简介

tales 的个人作品集网站，展示嵌入式开发项目、内置在线小游戏和音乐播放。全静态页面，通过 GitHub Pages 部署访问。

## 功能特性

- **个人主页**：头像展示、数字时钟、音乐播放器、明暗主题切换
- **导航下拉菜单**：鼠标悬停展开项目 / 小游戏快捷入口
- **浏览器标签图标**：使用个人头像作为 favicon
- **项目展示**：FreeRTOS 物联网天气站、STM32 智能浇花系统的文档和演示
- **在线小游戏**：贪吃蛇、2048、俄罗斯方块（纯前端 HTML5）
- **嵌入式文档**：项目代码详解、设计报告、接线图、实物演示视频

## 技术栈

- HTML5 / CSS3 / JavaScript（原生）
- CSS 自定义属性实现明暗主题切换
- iframe 加载子页面（保持音乐播放器持续运行）
- postMessage 实现父子页面通信
- IntersectionObserver 滚动动画

## 项目结构

```
tales-site/
├── index.html                      # 主页面（SPA 控制器）
├── assets/                         # 静态资源
│   ├── avatar.jpg                  # 头像（同时作为 favicon）
│   └── bg.png                      # 背景图
├── games/                          # 小游戏
│   ├── 2048.html
│   ├── breakout.html               # 俄罗斯方块
│   └── snake.html                  # 贪吃蛇
├── music/                          # 音乐播放器曲目
└── projects/                       # 项目文档
    ├── freertos-weather/           # FreeRTOS 天气站
    │   ├── docs.html               # 项目文档入口
    │   ├── 代码详解/
    │   ├── 设计报告/
    │   ├── 接线图/
    │   ├── 运行截图/
    │   └── 演示视频/
    └── stm32-smart-watering/       # 智能浇花系统
        ├── docs.html               # 项目文档入口
        ├── 代码详解/
        ├── 嘉立创文件.epro2
        └── 实物运行视频.mp4
```

## 快速开始

### 本地预览

```bash
python -m http.server 8000
```

浏览器打开 `http://localhost:8000`。

### GitHub Pages 部署

1. 推送至 GitHub 仓库
2. 在仓库 Settings > Pages 中选择 `master` 分支的根目录
3. 访问 `https://www.tales.cc.cd/`

## 许可证

MIT
