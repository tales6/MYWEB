/**
 * config.js — 统一配置加载入口
 *
 * 所有页面通过 window.SiteConfig 异步加载配置数据。
 * 配置文件位于 /config/*.json，支持本地文件和 GitHub Pages 部署。
 *
 * 用法：
 *   SiteConfig.ready().then(function(cfg) {
 *     // cfg.site, cfg.projects, cfg.games, cfg.music, cfg.quotes
 *   });
 */
(function(window) {
  'use strict';

  // 计算 SITE_ROOT：兼容 GitHub Pages 子路径 (/MYWEB/) 和根域名部署
  var SITE_ROOT = location.pathname.replace(/\/[^/]*$/, "");
  // 处理 index.html 在子目录的情况
  if (SITE_ROOT.endsWith("/index.html")) {
    SITE_ROOT = SITE_ROOT.replace(/\/index.html$/, "");
  }

  function absUrl(u) {
    if (/^https?:\/\//i.test(u) || u.startsWith("//")) return u;
    if (u.startsWith("/")) return u;
    return SITE_ROOT + "/" + u;
  }

  // 计算相对于当前页面的资源路径
  // 子页面在 projects/xxx/ 或 projects/xxx/代码详解/ 下，需要回溯到根
  function resUrl(u) {
    if (/^https?:\/\//i.test(u) || u.startsWith("//") || u.startsWith("data:")) return u;
    if (u.startsWith("/")) return u;
    // 计算当前页面到根的相对路径
    var path = location.pathname.replace(/^\//, "").replace(/\/$/, "");
    var depth = 0;
    if (path) {
      // 移除文件名
      var dirPart = path.replace(/\/[^/]*$/, "");
      if (dirPart) depth = dirPart.split("/").length;
    }
    // index.html 在根目录 depth=0，docs.html 在 projects/xxx/ depth=2，代码详解在 projects/xxx/代码详解/ depth=3
    var prefix = "";
    for (var i = 0; i < depth; i++) prefix += "../";
    return prefix + u;
  }

  var cache = null;
  var loadingPromise = null;

  function loadJSON(path) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", absUrl(path), true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error("Failed to load " + path + ": " + xhr.status));
          }
        }
      };
      xhr.send();
    });
  }

  function loadAll() {
    if (cache) return Promise.resolve(cache);
    if (loadingPromise) return loadingPromise;

    loadingPromise = Promise.all([
      loadJSON("config/site.json"),
      loadJSON("config/projects.json"),
      loadJSON("config/games.json"),
      loadJSON("config/music.json"),
      loadJSON("config/quotes.json")
    ]).then(function(results) {
      cache = {
        site: results[0],
        projects: results[1],
        games: results[2],
        music: results[3],
        quotes: results[4]
      };
      return cache;
    });
    return loadingPromise;
  }

  window.SiteConfig = {
    SITE_ROOT: SITE_ROOT,
    absUrl: absUrl,
    resUrl: resUrl,
    ready: loadAll
  };
})(window);
