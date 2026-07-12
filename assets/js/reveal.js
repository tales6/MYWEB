/**
 * reveal.js — 滚动显现动画
 *
 * 监听所有 .reveal 元素，进入视口时添加 .visible 类。
 * 支持 iframe 内页面和主页同时使用。
 * 提供 TalesReveal.refresh() 用于动态添加元素后重新观察。
 */
(function(window, document) {
  'use strict';

  var observer = null;

  function createObserver() {
    return new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  }

  function observeAll() {
    if (!observer) observer = createObserver();
    document.querySelectorAll('.reveal:not(.visible)').forEach(function(el) {
      observer.observe(el);
    });
  }

  function refresh() {
    observeAll();
  }

  function init() {
    observeAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TalesReveal = {
    refresh: refresh
  };
})(window, document);
