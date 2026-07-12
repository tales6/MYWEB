/**
 * nav.js — 数据驱动的导航栏渲染
 *
 * 从 config/projects.json 和 config/games.json 读取数据，
 * 自动渲染导航栏的下拉菜单和主页的卡片网格。
 *
 * 在主页：渲染 project-grid 和 game-grid
 * 在子页面：渲染 nav 里的下拉菜单
 *
 * 用法：<body> 内放置 <div id="project-grid"></div> 和 <div id="game-grid"></div>
 *       或在 nav 内放置 <div class="nav-projects-dropdown"></div>
 */
(function(window, document) {
  'use strict';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 渲染导航栏的项目下拉菜单
  function renderProjectsDropdown(projects, currentDepth) {
    return projects.map(function(p) {
      return '<a href="javascript:void(0)" onclick="loadPage(\'' + p.docs + '\')">' +
        '<span class="dd-icon">' + p.icon + '</span>' +
        '<span class="dd-text">' +
          '<span class="dd-title">' + escapeHtml(p.shortTitle) + '</span>' +
          '<span class="dd-desc">' + escapeHtml(p.dropdownDesc) + '</span>' +
        '</span>' +
      '</a>';
    }).join('');
  }

  // 渲染导航栏的游戏下拉菜单
  function renderGamesDropdown(games) {
    return games.map(function(g) {
      return '<a href="javascript:void(0)" onclick="loadGame(\'' + g.file + '\')">' +
        '<span class="dd-icon">' + g.icon + '</span>' +
        '<span class="dd-text">' +
          '<span class="dd-title">' + escapeHtml(g.title) + '</span>' +
          '<span class="dd-desc">' + escapeHtml(g.desc) + '</span>' +
        '</span>' +
      '</a>';
    }).join('');
  }

  // 渲染主页的项目卡片网格
  function renderProjectGrid(projects) {
    var html = projects.map(function(p, i) {
      var delay = i % 3 + 1;
      var tags = p.tags.map(function(t) {
        return '<span>' + escapeHtml(t) + '</span>';
      }).join('');
      return '<div class="project-card reveal reveal-delay-' + delay + '" onclick="return loadPage(\'' + p.docs + '\')">' +
        '<div class="card-header">' +
          '<span class="icon">' + p.icon + '</span>' +
          '<h3>' + escapeHtml(p.title) + '</h3>' +
        '</div>' +
        '<div class="tags">' + tags + '</div>' +
        '<p>' + escapeHtml(p.desc) + '</p>' +
        '<div class="links" onclick="event.stopPropagation()">' +
          '<a href="' + p.github + '" target="_blank">GitHub →</a>' +
          '<a href="javascript:void(0)" onclick="loadPage(\'' + p.docs + '\')">文档 →</a>' +
        '</div>' +
      '</div>';
    }).join('');

    // 添加占位卡片
    html += '<div class="project-card placeholder reveal reveal-delay-3">' +
      '<span class="plus-icon">＋</span>' +
      '<h3 style="color:#8a9a8a;">未来项目</h3>' +
      '<p style="color:#9aaa9a;">这里将展示你的下一个精彩作品。</p>' +
    '</div>';
    html += '<div class="project-card placeholder reveal reveal-delay-3">' +
      '<span class="plus-icon">＋</span>' +
      '<h3 style="color:#8a9a8a;">未来项目</h3>' +
      '<p style="color:#9aaa9a;">等你来填满这个位置。</p>' +
    '</div>';

    return html;
  }

  // 渲染主页的游戏卡片网格
  function renderGameGrid(games) {
    return games.map(function(g, i) {
      var delay = i % 3 + 1;
      return '<a href="' + g.file + '" class="game-card reveal reveal-delay-' + delay + '" onclick="event.preventDefault();loadGame(\'' + g.file + '\')">' +
        '<span class="icon">' + g.icon + '</span>' +
        '<h3>' + escapeHtml(g.title) + '</h3>' +
        '<p>' + escapeHtml(g.desc) + '</p>' +
        '<span class="play-tag">Play →</span>' +
      '</a>';
    }).join('');
  }

  function init() {
    if (!window.SiteConfig) {
      console.error('SiteConfig not loaded. Make sure config.js is included before nav.js.');
      return;
    }

    SiteConfig.ready().then(function(cfg) {
      // 渲染导航下拉菜单
      var projectsDropdowns = document.querySelectorAll('.nav-projects-dropdown');
      projectsDropdowns.forEach(function(el) {
        el.innerHTML = renderProjectsDropdown(cfg.projects);
      });

      var gamesDropdowns = document.querySelectorAll('.nav-games-dropdown');
      gamesDropdowns.forEach(function(el) {
        el.innerHTML = renderGamesDropdown(cfg.games);
      });

      // 渲染主页卡片网格
      var projectGrid = document.getElementById('project-grid');
      if (projectGrid) {
        projectGrid.innerHTML = renderProjectGrid(cfg.projects);
        // 触发 reveal 动画
        if (window.TalesReveal) {
          window.TalesReveal.refresh();
        }
      }

      var gameGrid = document.getElementById('game-grid');
      if (gameGrid) {
        gameGrid.innerHTML = renderGameGrid(cfg.games);
        if (window.TalesReveal) {
          window.TalesReveal.refresh();
        }
      }
    }).catch(function(err) {
      console.error('Failed to load config for nav:', err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
