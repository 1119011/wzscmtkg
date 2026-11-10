/**
 * 复古主题增强脚本
 * 负责站点名称与复古图标替换（运行时处理）
 */
(function () {
  var ICONS = {
    '📝': '✎',
    '👍': '♥',
    '👎': '♡',
    '💬': '❝',
    '⭐': '❖',
    '🗑️': '✕',
    '🔥': '♨',
    '✏️': '✎',
    '🏠': '⌂',
    '🔍': '⌕'
  };

  var EMOJI_RE = new RegExp(Object.keys(ICONS).join('|'), 'g');

  var COLORS = {
    '#0066ff': '#8A5A3B',
    '#e74c3c': '#B04A32',
    '#f6f6f6': '#F2E7D5',
    '#8590a6': '#8C7B68',
    '#1a1a1a': '#3B3228'
  };

  function fixText(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      var value = node.nodeValue;
      if (!value || !EMOJI_RE.test(value)) return;
      EMOJI_RE.lastIndex = 0;
      node.nodeValue = value.replace(EMOJI_RE, function (m) { return ICONS[m]; });
    });
  }

  function fixInlineStyles(root) {
    if (!root.querySelectorAll) return;
    root.querySelectorAll('[style]').forEach(function (el) {
      var style = el.getAttribute('style');
      if (!style) return;
      var next = style;
      Object.keys(COLORS).forEach(function (key) {
        if (next.indexOf(key) !== -1) {
          next = next.split(key).join(COLORS[key]);
        }
      });
      if (next !== style) el.setAttribute('style', next);
    });
  }

  function apply() {
    document.title = '幸存者 - 志怪论坛';
    var logo = document.querySelector('.navbar-logo');
    if (logo && logo.textContent !== '幸存者') logo.textContent = '幸存者';

    fixText(document.body);
    fixInlineStyles(document.body);
  }

  // 注册表使用复古配色
  if (typeof Auth !== 'undefined' && Auth.getRandomColor) {
    Auth.getRandomColor = function () {
      var colors = ['#8A5A3B', '#B04A32', '#5C7A4A', '#B8892F', '#7B5E83', '#4F7268', '#A96A4A', '#4A5660'];
      return colors[Math.floor(Math.random() * colors.length)];
    };
  }

  function init() {
    apply();

    // 监听后续动态渲染的内容
    var observer = new MutationObserver(function () {
      apply();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
