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
.bmb-wrap.collapsed { padding: 0; border-radius: 4px; width: 280px; height: 8px; background: rgba(180,150,90,0.25); box-shadow: none; }\
.bmb-wrap.collapsed .bmb-inner { opacity: 0; transition: none; }\
.bmb-wrap.collapsed .bmb-progress { position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, var(--accent-light), #d4a96a); border-radius: 3px; width: 0%; transition: width 0.3s linear; }\
.bmb-wrap.expanded { padding: 12px 32px; box-shadow: 0 8px 36px rgba(0,0,0,0.08); }\
.bmb-wrap.expanded .bmb-inner { opacity: 1; }\
.bmb-wrap.expanded .bmb-progress { display: none; }\
.bmb-inner { display: flex; align-items: center; gap: 20px; transition: opacity 0.25s; }\
.bmb-progress { display: none; }\
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
body.dark .bmb-wrap.collapsed { background: rgba(180,150,90,0.2); }\
body.dark .bmb-btn { color: #b0c4d8; }\
body.dark .bmb-btn:hover { background: rgba(40,55,75,0.4); color: #fff; }\
body.dark .bmb-btn.bmb-play { background: var(--accent); color: #fff; }\
body.dark .bmb-name { color: #e0e8f4; }\
body.dark .bmb-time { color: #8899aa; }\
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

  // 加载音乐配置并初始化播放器
  function loadMusicConfig() {
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

      // Collapse/expand logic
      var collapseTimer = null;
      var innerEl = document.getElementById('bmbTrackName').closest('.bmb-inner');
      function collapseBar() {
        // hide text immediately before collapse animation
        innerEl.style.opacity = '0';
        bar.classList.add('collapsed');
        bar.classList.remove('expanded');
      }
      function expandBar() {
        if (collapseTimer) { clearTimeout(collapseTimer); collapseTimer = null; }
        bar.classList.remove('collapsed');
        bar.classList.add('expanded');
        // show text after expand animation starts
        setTimeout(function() { innerEl.style.opacity = ''; }, 50);
      }
      bar.addEventListener('mouseenter', function() {
        if (collapseTimer) { clearTimeout(collapseTimer); collapseTimer = null; }
        expandBar();
      });
      bar.addEventListener('mouseleave', function() {
        if (collapseTimer) clearTimeout(collapseTimer);
        collapseTimer = setTimeout(collapseBar, 1000);
      });

      loadTrack(0);
      setTimeout(function() { bar.classList.add('show'); }, 800);
      collapseTimer = setTimeout(collapseBar, 3000);
    }).catch(function(err) {
      console.error('Failed to load music:', err);
    });
  }

  // 等 DOM 加载完后初始化音乐
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMusicConfig);
  } else {
    loadMusicConfig();
  }

})(window, document);
