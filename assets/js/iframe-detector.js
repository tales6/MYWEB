/**
 * iframe-detector.js — iframe 内页面通信桥
 *
 * 在 iframe 中：通过 postMessage 与父窗口通信
 * 在顶层窗口（刷新/直接访问）：注入底部音乐栏 + 提供导航函数，
 * 确保刷新后页面功能完整，不跳回首页。
 */
(function(window, document) {
  'use strict';

  // 计算当前页面到站点根目录的相对路径前缀
  function getRootPrefix() {
    var path = location.pathname.split('#')[0].split('?')[0];
    var segments = path.split('/').filter(Boolean);
    segments.pop();
    return segments.map(function() { return '../'; }).join('');
  }

  // ===== 在 iframe 中运行 =====
  if (window.top !== window.self) {
    function post(msg) {
      parent.postMessage(msg, "*");
    }

    window.loadPage = function(url) {
      post({ action: "loadPage", url: url });
    };

    window.goHome = function(hash) {
      var msg = { action: "goHome" };
      if (hash) msg.hash = hash;
      post(msg);
    };

    window.loadGame = function(url) {
      post({ action: "loadGame", url: url });
    };

    // 接收父窗口主题同步
    window.addEventListener("message", function(e) {
      if (!e.data) return;
      if (e.data.action === "themeChange") {
        document.body.classList.toggle("dark", e.data.theme === "dark");
      }
    });

    // 子页面内点击主题按钮时通知父页面
    document.addEventListener("click", function(e) {
      if (!e.target.closest(".theme-btn")) return;
      setTimeout(function() {
        var isDark = document.body.classList.contains("dark");
        parent.postMessage({ action: "themeChange", theme: isDark ? "dark" : "light" }, "*");
      }, 0);
    });

    // 拦截 <a> 点击
    document.addEventListener("click", function(e) {
      var a = e.target.closest("a");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http") || href.startsWith("//")) return;
      if (href.startsWith("#")) {
        e.preventDefault();
        var id = href.slice(1);
        if (!id) return;
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (href.includes("index.html")) {
        e.preventDefault();
        var hash = href.split("#")[1] || "";
        goHome(hash);
        return;
      }
      var hrefNoHash = href.split("#")[0];
      if (hrefNoHash.endsWith(".html") || hrefNoHash.endsWith("/")) {
        e.preventDefault();
        post({ action: "loadPage", url: href });
      }
    });
    return;
  }

  // ===== 在顶层窗口运行（刷新/直接访问）=====
  var rootPrefix = getRootPrefix();

  // 注入独立模式导航栏
  if (window.PageManager) {
    PageManager.injectStandaloneNav();
  }
  // 游戏页的特殊处理
  if (location.pathname.includes('/games/')) {
    // Chrome 中 body overflow:hidden 会传播到视口并裁剪 fixed 元素
    document.documentElement.style.overflow = 'hidden';
    document.body.style.paddingTop = '56px';
    // 加载 config.js + nav.js 以填充 dropdown 菜单
    function loadScript(src, cb) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = cb;
      s.onerror = cb;
      document.body.appendChild(s);
    }
    setTimeout(function() {
      loadScript(rootPrefix + 'assets/js/config.js', function() {
        loadScript(rootPrefix + 'assets/js/nav.js');
      });
    }, 50);
  }

  // 导航函数：直接整页跳转
  window.goHome = function(hash) {
    location.href = rootPrefix + 'index.html' + (hash ? '#' + hash : '');
  };
  window.loadPage = function(url) {
    location.href = rootPrefix + url;
  };
  window.loadGame = function(url) {
    location.href = rootPrefix + url;
  };

  // 注入底部音乐栏 CSS + HTML
  var style = document.createElement('style');
  style.textContent = '\
.bmb-wrap {\
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);\
  z-index: 200;\
  background: rgba(255,255,255,0.75);\
  backdrop-filter: blur(28px) saturate(1.6);\
  -webkit-backdrop-filter: blur(28px) saturate(1.6);\
  border: 0.5px solid rgba(0,0,0,0.06);\
  border-radius: 50px;\
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);\
  padding: 10px 28px;\
  transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);\
  opacity: 0; transform: translateX(-50%) translateY(24px);\
  pointer-events: none;\
}\
.bmb-wrap.show { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }\
.bmb-progress { display: none; }\
.bmb-wrap.collapsed { padding: 0; border-radius: 4px; width: 280px; height: 8px; background: linear-gradient(90deg, rgba(107,143,113,0.3), rgba(212,169,106,0.3), rgba(107,143,113,0.3)); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }\
.bmb-wrap.collapsed .bmb-inner { opacity: 0; visibility: hidden; }\
.bmb-wrap.collapsed .bmb-progress { position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, var(--accent), #d4a96a, var(--accent-light)); border-radius: 4px; width: 0%; transition: width 0.3s linear; }\
.bmb-wrap.expanded { padding: 12px 32px; box-shadow: 0 8px 36px rgba(0,0,0,0.08); }\
.bmb-wrap.expanded .bmb-inner { opacity: 1; }\
.bmb-wrap.expanded .bmb-progress { display: none; }\
.bmb-inner { display: flex; align-items: center; gap: 20px; transition: opacity 0.25s; }\
.bmb-left { display: flex; align-items: center; gap: 10px; }\
.bmb-icon { font-size: 1.1rem; }\
.bmb-name { font-size: 0.85rem; font-weight: 500; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\
.bmb-right { display: flex; align-items: center; gap: 6px; }\
.bmb-btn { background: none; border: none; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; color: var(--text-sec); transition: all 0.2s; }\
.bmb-btn:hover { background: rgba(0,0,0,0.06); color: var(--accent-dark); }\
.bmb-btn.bmb-play { width: 36px; height: 36px; background: var(--accent-dark); color: #fff; font-size: 1rem; }\
.bmb-btn.bmb-play:hover { background: var(--accent); }\
.bmb-time { font-size: 0.7rem; color: var(--text-light); font-variant-numeric: tabular-nums; min-width: 65px; text-align: right; margin-left: 4px; }\
body.dark .bmb-wrap { background: rgba(20,25,35,0.75); border-color: rgba(255,255,255,0.06); }\
body.dark .bmb-wrap.collapsed { background: rgba(180,150,90,0.25); }\
body.dark .bmb-btn { color: #b0c4d8; }\
body.dark .bmb-btn:hover { background: rgba(40,55,75,0.4); color: #fff; }\
body.dark .bmb-btn.bmb-play { background: var(--accent); color: #fff; }\
body.dark .bmb-name { color: #e0e8f4; }\
body.dark .bmb-time { color: #8899aa; }\
\
/* == CSS variables (self-contained for pages w/o common.css) == */\
:root { --text-sec: #5a7a5a; --text-light: #7a9a7a; --text: #1e2d24; --accent-dark: #2d5a4a; --accent: #3a6b4a; --accent-light: #6b8f71; --card-bg: rgba(255,255,255,0.6); --border: rgba(0,0,0,0.04); --tag-bg: rgba(107,143,113,0.08); }\
body.dark { --text-sec: #94a3b8; --text-light: #64748b; --text: #e2e8f0; --accent-dark: #6b8f71; --accent: #6b8f71; --accent-light: #8baa8a; --card-bg: rgba(30,30,40,0.7); --border: rgba(255,255,255,0.04); --tag-bg: rgba(107,143,113,0.12); }\
\
/* == Nav styles (self-contained, for pages w/o common.css) == */\
nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 16px 0; background: rgba(245,240,234,0.85); backdrop-filter: blur(20px) saturate(1.5); -webkit-backdrop-filter: blur(20px) saturate(1.5); border-bottom: 0.5px solid rgba(0,0,0,0.04); }\
nav .inner { max-width: 1000px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }\
.nav-brand { font-size: 1.1rem; font-weight: 700; color: #3a6b4a; letter-spacing: 0.05em; display: inline-flex; align-items: center; }\
.nav-brand a { color: inherit; text-decoration: none; }\
.nav-links { display: flex; align-items: center; gap: 24px; list-style: none; margin: 0; padding: 0; }\
.nav-links a { position: relative; font-size: 0.85rem; color: #5a7a5a; transition: color 0.3s; display: inline-flex; align-items: center; text-decoration: none; }\
.nav-links a:hover { color: #2d5a4a; }\
.nav-links a::after { content: \'\'; position: absolute; bottom: -3px; left: 0; width: 0; height: 1.5px; background: #6b8f71; transition: width 0.3s; }\
.nav-links a:hover::after { width: 100%; }\
.nav-dropdown { position: relative; }\
.dropdown-menu { position: absolute; top: calc(100% + 12px); left: 50%; transform: translateX(-50%) translateY(-8px); min-width: 260px; background: rgba(255,255,255,0.6); backdrop-filter: blur(20px) saturate(1.5); -webkit-backdrop-filter: blur(20px) saturate(1.5); border: 0.5px solid rgba(0,0,0,0.04); border-radius: 14px; padding: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.08); opacity: 0; visibility: hidden; transition: all 0.25s; z-index: 200; }\
.nav-dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }\
.dropdown-menu::before { content: \'\'; position: absolute; top: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 12px; height: 12px; background: var(--card-bg); border-left: 0.5px solid var(--border); border-top: 0.5px solid var(--border); }\
.dropdown-menu a { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; text-decoration: none; transition: background 0.2s; color: #5a7a5a; }\
.dropdown-menu a:hover { background: rgba(107,143,113,0.08); }\
.dropdown-menu a:hover::after { display: none; }\
.dropdown-menu .dd-icon { font-size: 1.4rem; flex-shrink: 0; }\
.dropdown-menu .dd-text { display: flex; flex-direction: column; gap: 2px; }\
.dropdown-menu .dd-title { font-size: 0.85rem; font-weight: 600; color: var(--text); }\
.dropdown-menu .dd-desc { font-size: 0.72rem; color: var(--text-light); }\
.theme-btn { width: 34px; height: 34px; border-radius: 50%; border: 0.5px solid var(--border); background: transparent; color: var(--text-sec); font-size: 1rem; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\
.theme-btn:hover { background: var(--tag-bg); border-color: var(--accent-light); }\
body.dark nav { background: rgba(18,18,18,0.85); border-color: rgba(255,255,255,0.04); }\
body.dark .nav-links a { color: #c8d4e0; }\
body.dark .nav-links a:hover { color: #fff; }\
body.dark .nav-brand { color: #6b8f71; }\
body.dark .theme-btn { color: #d0dce8; border-color: rgba(255,255,255,0.1); }\
body.dark .theme-btn:hover { background: rgba(60,80,110,0.3); }\
body.dark .dropdown-menu { background: rgba(25,30,40,0.9); border-color: rgba(255,255,255,0.06); }\
body.dark .dropdown-menu::before { background: rgba(25,30,40,0.9); border-color: rgba(255,255,255,0.06); }\
body.dark .dropdown-menu .dd-title { color: #e2e8f0; }\
body.dark .dropdown-menu .dd-desc { color: #94a3b8; }\
';
  document.head.appendChild(style);

  // 注入音乐栏 HTML
  var bar = document.createElement('div');
  bar.className = 'bmb-wrap';
  bar.id = 'bottomMusicBar';
  bar.innerHTML = '\
<div class="bmb-progress" id="bmbProgress"></div>\
<div class="bmb-inner">\
  <div class="bmb-left">\
    <span class="bmb-icon">🎵</span>\
    <span class="bmb-name" id="bmbTrackName">未播放</span>\
  </div>\
  <div class="bmb-right">\
    <button class="bmb-btn" id="bmbPrevBtn" title="上一首">⏮</button>\
    <button class="bmb-btn bmb-play" id="bmbPlayBtn" title="播放/暂停">▶</button>\
    <button class="bmb-btn" id="bmbNextBtn" title="下一首">⏭</button>\
    <span class="bmb-time" id="bmbTime">0:00 / 0:00</span>\
  </div>\
</div>';
  document.body.appendChild(bar);

  // 统一音乐栏折叠/展开（与 index.html 一致的实现）
  (function() {
    if (!bar || bar.dataset.mc === '1') return;
    bar.dataset.mc = '1';
    var _timer = null;
    function collapseBar() {
      bar.classList.add('collapsed');
      bar.classList.remove('expanded');
    }
    function expandBar() {
      if (_timer) { clearTimeout(_timer); _timer = null; }
      bar.classList.add('expanded');
      bar.classList.remove('collapsed');
    }
    var onEnter = function() {
      if (_timer) { clearTimeout(_timer); _timer = null; }
      expandBar();
    };
    var onLeave = function() {
      if (_timer) clearTimeout(_timer);
      _timer = setTimeout(collapseBar, 1000);
    };
    bar.addEventListener('mouseenter', onEnter);
    bar.addEventListener('mouseleave', onLeave);
    _timer = setTimeout(collapseBar, 1000);

    // 导出 cleanup 供 spa.js 生命周期调用
    window._bottomBarCleanup = function() {
      if (_timer) { clearTimeout(_timer); _timer = null; }
      bar.removeEventListener('mouseenter', onEnter);
      bar.removeEventListener('mouseleave', onLeave);
    };
  })();

  // UI 独立于音乐数据：先拉起显示
  setTimeout(function() {
    bar.classList.add('show');
  }, 800);

  // 异步加载音乐配置并初始化播放器
  var configUrl = rootPrefix + 'config/music.json';
  fetch(configUrl).then(function(r) { return r.json(); }).then(function(tracks) {
    if (!tracks || !tracks.length) return;

    var audio = new Audio();
    audio.volume = 0.5;
    var currentTrack = 0;
    var isPlaying = false;

    var playBtn = document.getElementById('bmbPlayBtn');
    var prevBtn = document.getElementById('bmbPrevBtn');
    var nextBtn = document.getElementById('bmbNextBtn');
    var nameEl = document.getElementById('bmbTrackName');
    var timeEl = document.getElementById('bmbTime');
    var progEl = document.getElementById('bmbProgress');

    function absUrl(u) {
      if (/^https?:\/\//i.test(u)) return u;
      return rootPrefix + u;
    }

    function formatTime(s) {
      if (isNaN(s) || !isFinite(s)) return '0:00';
      var m = Math.floor(s / 60);
      var sec = Math.floor(s % 60);
      return m + ':' + String(sec).padStart(2, '0');
    }

    function updateBar() {
      playBtn.textContent = isPlaying ? '⏸' : '▶';
      timeEl.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
      if (progEl && audio.duration) {
        progEl.style.width = (audio.currentTime / audio.duration * 100) + '%';
      }
    }

    function loadTrack(idx) {
      var t = tracks[idx];
      audio.src = absUrl(t.src);
      nameEl.textContent = t.name;
      audio.load();
      if (isPlaying) audio.play().catch(function() { isPlaying = false; playBtn.textContent = '▶'; });
      updateBar();
    }

    function togglePlay() {
      if (isPlaying) { audio.pause(); } else { audio.play().catch(function() {}); }
      isPlaying = !isPlaying;
      updateBar();
    }

    function nextTrack() { currentTrack = (currentTrack + 1) % tracks.length; loadTrack(currentTrack); }
    function prevTrack() { currentTrack = (currentTrack - 1 + tracks.length) % tracks.length; loadTrack(currentTrack); }

    audio.addEventListener('loadedmetadata', updateBar);
    audio.addEventListener('timeupdate', updateBar);
    audio.addEventListener('ended', nextTrack);

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);

    loadTrack(0);
  }).catch(function(err) {
    console.error('Failed to load music:', err);
  });

  // 侧导航锚点跳转
  function initSideNavScroll() {
    var links = document.querySelectorAll('.side-nav a');
    if (!links.length) return;
    links.forEach(function(a) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var id = a.getAttribute('data-section') || a.getAttribute('href').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (!target) return;
        var navEl = document.querySelector('nav:not(.side-nav):not(.sticky-nav)');
        var offset = navEl ? navEl.offsetHeight + 12 : 80;
        target.style.scrollMarginTop = offset + 'px';
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSideNavScroll);
  } else {
    initSideNavScroll();
  }

})(window, document);
