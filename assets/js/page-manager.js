(function(w, d) {
  'use strict';
  if (w.PageManager) return;

  var handlers = {};
  var currentPage = null;
  var _musicCleanup = null;

  w.PageManager = {
    register: function(name, h) {
      handlers[name] = { init: h.init || null, destroy: h.destroy || null };
    },

    switchTo: function(name) {
      if (currentPage && currentPage !== name && handlers[currentPage]) {
        if (handlers[currentPage].destroy) handlers[currentPage].destroy();
        PageManager._cleanupMusic();
      }
      currentPage = name;
      if (handlers[name] && handlers[name].init) handlers[name].init();
    },

    initCurrent: function(name) {
      currentPage = name;
      if (handlers[name] && handlers[name].init) handlers[name].init();
    },

    destroyCurrent: function() {
      if (currentPage && handlers[currentPage]) {
        if (handlers[currentPage].destroy) handlers[currentPage].destroy();
      }
      PageManager._cleanupMusic();
      currentPage = null;
    },

    getCurrentPage: function() { return currentPage; },

    _cleanupMusic: function() {
      if (_musicCleanup) { _musicCleanup(); _musicCleanup = null; }
    },

    splashPrevent: function() {
      if (sessionStorage.getItem('splashShown')) {
        var splash = d.getElementById('splash');
        if (splash) {
          splash.classList.add('hide');
          var hero = d.getElementById('heroContent');
          if (hero) hero.classList.add('loaded');
        }
        return true;
      }
      return false;
    },

    setupMusicCollapse: function(bar) {
      if (!bar) return null;
      var timer = null;

      function collapse() {
        bar.classList.add('collapsed');
      }
      function expand() {
        if (timer) { clearTimeout(timer); timer = null; }
        bar.classList.remove('collapsed');
      }

      var onEnter = function() {
        if (timer) { clearTimeout(timer); timer = null; }
        expand();
      };
      var onLeave = function() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(collapse, 1000);
      };

      bar.addEventListener('mouseenter', onEnter);
      bar.addEventListener('mouseleave', onLeave);

      timer = setTimeout(collapse, 3000);

      _musicCleanup = function() {
        if (timer) { clearTimeout(timer); timer = null; }
        bar.removeEventListener('mouseenter', onEnter);
        bar.removeEventListener('mouseleave', onLeave);
      };
      return _musicCleanup;
    },

    // 独立模式下注入导航栏（仅当没有主导航时；游戏页跳过）
    injectStandaloneNav: function() {
      if (d.querySelector('.nav-links')) return;
      var prefix = PageManager._getRootPrefix();
      var nav = d.createElement('nav');
      nav.innerHTML =
        '<div class="inner">' +
          '<span class="nav-brand"><a href="' + prefix + 'index.html">✦ tales</a></span>' +
          '<ul class="nav-links">' +
            '<li><a href="' + prefix + 'index.html#hero">首页</a></li>' +
            '<li><a href="' + prefix + 'index.html#projects">项目</a></li>' +
            '<li><a href="' + prefix + 'index.html#games">小游戏</a></li>' +
            '<li><a href="https://github.com/tales6" target="_blank">GitHub</a></li>' +
            '<li><a href="https://qm.qq.com/cgi-bin/qm/qr?k=2416829925" target="_blank">QQ</a></li>' +
            '<li><button class="theme-btn" id="themeBtn" style="margin-left:4px">\uD83C\uDF19</button></li>' +
          '</ul>' +
        '</div>';
      d.body.insertBefore(nav, d.body.firstChild);
      var themeBtn = d.getElementById('themeBtn');
      if (themeBtn) {
        themeBtn.addEventListener('click', function() {
          d.body.classList.toggle('dark');
          themeBtn.textContent = d.body.classList.contains('dark') ? '\u2600' : '\uD83C\uDF19';
        });
      }
    },

    _getRootPrefix: function() {
      var path = location.pathname.split('#')[0].split('?')[0];
      var segs = path.split('/').filter(Boolean);
      segs.pop();
      return segs.map(function() { return '../'; }).join('');
    }
  };
})(window, document);
