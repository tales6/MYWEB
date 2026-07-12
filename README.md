# tales 个人主页

## 简介

tales 的个人作品集网站，展示嵌入式开发项目、提供在线小游戏和音乐播放。全静态页面，可直接通过 GitHub Pages 部署访问。

## 功能特性

- **个人主页**：头像展示、数字时钟、音乐播放器、明暗主题切换
- **项目展示**：FreeRTOS 物联网天气站、STM32 智能浇花系统的文档和演示
- **在线小游戏**：贪吃蛇、2048、俄罗斯方块（纯前端 HTML5）
- **嵌入式文档**：项目代码详解、设计报告、接线图、实物演示视频

## 技术栈

- HTML5 / CSS3 / JavaScript（原生）
- CSS 自定义属性实现明暗主题切换
- SPA 式页面加载（前端路由）
- IntersectionObserver 滚动动画

## 项目结构

```
tales-site/
├── index.html                      # 主页面
├── freertos-weather-docs.html      # FreeRTOS 天气站文档入口
├── stm32-smart-watering.html       # 智能浇花系统文档入口
├── avatar.jpg                      # 头像
├── bg.png                          # 背景图
├── games/                          # 小游戏
│   ├── 2048.html
│   ├── breakout.html               # 俄罗斯方块
│   └── snake.html                  # 贪吃蛇
├── music/                          # 音乐播放器曲目
│   ├── track01.flac
│   ├── track02.mp3
│   └── ...
├── freertos-weather/               # FreeRTOS 天气站项目文档
│   ├── 代码详解/
│   ├── 设计报告/
│   ├── 接线图/
│   ├── 运行截图/
│   └── 演示视频/
└── stm32-smart-watering/           # 智能浇花系统项目文档
    ├── 代码详解/
    ├── 嘉立创文件.epro2
    └── 实物运行视频.mp4
```

## 快速开始

### 本地打开

直接用浏览器打开 `index.html` 即可。

### GitHub Pages 部署

1. 推送至 GitHub 仓库
2. 在仓库 Settings > Pages 中选择 `main` 分支的根目录
3. 访问 `https://<用户名>.github.io/<仓库名>/`

## 许可证

MIT
