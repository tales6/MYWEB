/**
 * iframe-detector.js — iframe 内页面通信桥
 *
 * 此脚本运行在 iframe 加载的子页面中，提供：
 *   - window.loadPage(url)  → 通知父页面加载新子页面
 *   - window.goHome()       → 通知父页面返回首页
 *   - window.loadGame(url)  → 通知父页面加载游戏
 *   - 自动拦截 <a> 点击，通过 postMessage 转发给父页面
 *
 * 如果页面不在 iframe 中（直接访问），则自动跳转到首页加载该页面。
 */
(function(window, document) {
  'use strict';

  // 如果不在 iframe 中，不需要做任何事
  if (window.top === window.self) return;

  function post(msg) {
    parent.postMessage(msg, "*");
  }

  // 暴露全局导航函数
  window.loadPage = function(url) {
    post({ action: "loadPage", url: url });
  };

  window.goHome = function(hash) {
    var msg = { action: "goHome" };
    if (hash) msg.hash = hash;
    post(msg);
  };

  window.loadGame = function(url) {
    post({ action: "loadPage", url: url });
  };

  // 拦截 <a> 点击
  document.addEventListener("click", function(e) {
    var a = e.target.closest("a");
    if (!a) return;

    var href = a.getAttribute("href");
    if (!href) return;

    // 外部链接：不拦截
    if (href.startsWith("http") || href.startsWith("//")) return;

    // 锚点：平滑滚动
    if (href.startsWith("#")) {
      e.preventDefault();
      var id = href.slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // 首页链接（包含 index.html）：通知父页面 goHome
    if (href.includes("index.html")) {
      e.preventDefault();
      var hash = href.split("#")[1] || "";
      goHome(hash);
      return;
    }

    // HTML 页面链接：通知父页面 loadPage
    var hrefNoHash = href.split("#")[0];
    if (hrefNoHash.endsWith(".html") || hrefNoHash.endsWith("/")) {
      e.preventDefault();
      post({ action: "loadPage", url: href });
    }
  });
})(window, document);
