/**
 * spa.js — SPA 导航核心（主页专用）
 *
 * 提供 loadPage / goHome / loadGame / goToSection 函数。
 * 使用 iframe 加载子页面，保持音乐播放器持续运行。
 * 监听 popstate 和 iframe postMessage 实现完整的前进/后退。
 *
 * 仅在主页（顶层窗口）加载此脚本。
 */
(function(window, document) {
  'use strict';

  // 仅在顶层窗口运行
  if (window.top !== window.self) return;

  var SITE_ROOT = location.pathname.replace(/\/[^/]*$/, "");
  if (SITE_ROOT.endsWith("/index.html")) {
    SITE_ROOT = SITE_ROOT.replace(/\/index.html$/, "");
  }

  function absUrl(u) {
    if (/^https?:\/\//i.test(u) || u.startsWith("//")) return u;
    if (u.startsWith("/")) return u;
    return SITE_ROOT + "/" + u;
  }

  // ===== 页面生命周期管理器 =====
  var _pageHandlers = {};
  var _currentPage = null;

  window.AppLifecycle = {
    register: function(name, handler) {
      _pageHandlers[name] = handler;
    },
    navigateTo: function(name) {
      if (_currentPage && _currentPage !== name && _pageHandlers[_currentPage]) {
        if (_pageHandlers[_currentPage].destroy) _pageHandlers[_currentPage].destroy();
      }
      _currentPage = name;
      if (_pageHandlers[name] && _pageHandlers[name].init) _pageHandlers[name].init();
    },
    getCurrent: function() { return _currentPage; }
  };

  // ===== 注册页面处理器 =====
  AppLifecycle.register('index', {
    init: function() {
      var splash = document.getElementById('splash');
      var hero = document.getElementById('heroContent');
      if (sessionStorage.getItem('splashShown')) {
        if (splash) splash.classList.add('hide');
        if (hero) hero.classList.add('loaded');
      }
    },
    destroy: function() {}
  });

  function loadPage(url) {
    AppLifecycle.navigateTo('subpage');
    var mainView = document.getElementById("main-view");
    var subView = document.getElementById("sub-view");
    if (!mainView || !subView) return;
    mainView.style.display = "none";
    subView.style.display = "block";
    window.scrollTo(0, 0);
    subView.innerHTML = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg);z-index:50;display:flex;align-items:center;justify-content:center;color:var(--text-sec)">加载中...</div>' +
      '<iframe id="page-iframe" src="' + absUrl(url) + '" style="width:100%;border:none;min-height:100vh;display:block" onload="this.style.display=\'block\';this.previousElementSibling.style.display=\'none\'"></iframe>';
    history.pushState({ url: url, action: "page" }, "", absUrl(url));
  }

  function goHome(hash) {
    var mainView = document.getElementById("main-view");
    var subView = document.getElementById("sub-view");
    if (mainView) mainView.style.display = "";
    if (subView) subView.style.display = "none";
    history.pushState({ action: "home" }, "", SITE_ROOT + "/index.html");
    window.scrollTo(0, 0);
    if (hash) {
      setTimeout(function() {
        var el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
    AppLifecycle.navigateTo('index');
  }

  function loadGame(url) {
    AppLifecycle.navigateTo('subpage');
    var mainView = document.getElementById("main-view");
    var subView = document.getElementById("sub-view");
    if (!mainView || !subView) return;
    subView.innerHTML = '<div style="max-width:1000px;margin:0 auto;padding:24px">' +
      '<button class="back-btn" onclick="goHome()">← 返回首页</button></div>' +
      '<div style="max-width:600px;margin:0 auto;padding:0 24px 60px"><iframe src="' + absUrl(url) + '" style="width:100%;border:none;min-height:80vh;border-radius:16px;background:var(--bg)" allow="autoplay"></iframe></div>';
    mainView.style.display = "none";
    subView.style.display = "block";
    history.pushState({ url: url, action: "game" }, "", absUrl(url));
    window.scrollTo(0, 0);
  }

  function goToSection(sectionId) {
    var subView = document.getElementById("sub-view");
    if (subView && subView.style.display !== "none") {
      goHome();
    }
    setTimeout(function() {
      var el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  // 暴露为全局函数
  window.loadPage = loadPage;
  window.goHome = goHome;
  window.loadGame = loadGame;
  window.goToSection = goToSection;

  // 拦截 nav 内的 hash 链接（首页、项目、游戏锚点）
  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("nav a[href^='#']").forEach(function(a) {
      a.addEventListener("click", function(e) {
        var href = this.getAttribute("href");
        if (href === "#" || href === "#projects" || href === "#games" || href === "#hero") {
          e.preventDefault();
          var id = href.slice(1);
          if (id) goToSection(id);
        }
      });
    });
  });

  // 接收 iframe 发来的消息
  window.addEventListener("message", function(e) {
    if (!e.data) return;
    if (e.data.action === "goHome") {
      goHome(e.data.hash);
    } else if (e.data.action === "loadPage") {
      loadPage(e.data.url);
    } else if (e.data.action === "loadGame") {
      loadGame(e.data.url);
    } else if (e.data.action === "themeChange") {
      if (window.TalesTheme) window.TalesTheme.setTheme(e.data.theme === "dark");
    }
  });

  // 浏览器前进/后退
  window.addEventListener("popstate", function(e) {
    var mainView = document.getElementById("main-view");
    var subView = document.getElementById("sub-view");
    if (!mainView || !subView) return;
    if (e.state && e.state.action === "home") {
      mainView.style.display = "";
      subView.style.display = "none";
      AppLifecycle.navigateTo('index');
    } else if (e.state && e.state.action === "game") {
      loadGame(e.state.url);
    } else if (e.state && e.state.url) {
      loadPage(e.state.url);
    } else {
      mainView.style.display = "";
      subView.style.display = "none";
      AppLifecycle.navigateTo('index');
    }
  });

  // 侧边导航初始化（子页面加载后调用）
  window.initSideNav = function() {
    var subView = document.getElementById("sub-view");
    if (!subView) return;
    var nav = subView.querySelector(".side-nav");
    if (!nav) return;
    var links = nav.querySelectorAll("a");
    var sections = [];
    links.forEach(function(a) {
      var id = a.getAttribute("data-section") || a.getAttribute("href").slice(1);
      var sec = subView.querySelector("#" + CSS.escape(id));
      if (sec) sections.push({ el: a, section: sec });
      a.addEventListener("click", function(e) {
        e.preventDefault();
        var targetId = a.getAttribute("data-section") || a.getAttribute("href").slice(1);
        var target = subView.querySelector("#" + CSS.escape(targetId));
        if (target) {
          var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      });
    });
    if (sections.length === 0) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          links.forEach(function(l) { l.classList.remove("active"); });
          var match = sections.find(function(s) { return s.section === entry.target; });
          if (match) match.el.classList.add("active");
        }
      });
    }, { rootMargin: "-60px 0px -40%", threshold: 0.2 });
    sections.forEach(function(s) { obs.observe(s.section); });
  };

  // 暴露 SITE_ROOT
  window.SITE_ROOT = SITE_ROOT;
  window.absUrl = absUrl;
})(window, document);
