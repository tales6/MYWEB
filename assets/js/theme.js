/**
 * theme.js — 主题切换（亮色/暗色）
 *
 * 通过 localStorage 持久化用户选择，body.dark 类切换。
 * 使用事件委托，支持动态注入的子页面内容。
 *
 * 用法：在页面引入此脚本即可自动启用。
 *       手动切换：点击任何 .theme-btn 元素。
 */
(function(window, document) {
  'use strict';

  var STORAGE_KEY = 'tales-theme';

  // 初始化：读取存储的主题
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark') {
    document.body.classList.add('dark');
  }

  // 更新所有主题按钮的图标
  function updateThemeBtns() {
    var isDark = document.body.classList.contains('dark');
    document.querySelectorAll('.theme-btn').forEach(function(b) {
      b.textContent = isDark ? '☀️' : '🌙';
    });
  }

  // 事件委托：点击 .theme-btn 切换主题
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.theme-btn')) return;
    document.body.classList.toggle('dark');
    var isDark = document.body.classList.contains('dark');
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    updateThemeBtns();
  });

  // DOM 就绪后更新按钮图标
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateThemeBtns);
  } else {
    updateThemeBtns();
  }

  // 暴露 API
  window.TalesTheme = {
    isDark: function() { return document.body.classList.contains('dark'); },
    toggle: function() {
      document.body.classList.toggle('dark');
      var isDark = document.body.classList.contains('dark');
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
      updateThemeBtns();
    },
    updateBtns: updateThemeBtns
  };
})(window, document);
