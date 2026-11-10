/**
 * 夜间模式
 * 点击顶部的小月亮按钮切换；状态保存在 localStorage，刷新后保持。
 */
(function () {
  var KEY = 'survivorDarkMode';
  var root = document.documentElement;
  var btn = document.getElementById('dark-toggle');

  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'dark-toggle';
    btn.className = 'dark-toggle';
    btn.type = 'button';
    btn.textContent = '☾';
    var host = document.querySelector('.navbar-user');
    if (host) host.insertBefore(btn, host.firstChild);
  }

  function isOn() {
    return root.classList.contains('dark-mode');
  }

  function syncButton() {
    if (!btn) return;
    var on = isOn();
    btn.title = on ? '退出夜间模式' : '夜间模式';
    btn.setAttribute('aria-label', btn.title);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  btn.addEventListener('click', function () {
    var on = !isOn();
    root.classList.toggle('dark-mode', on);
    try {
      localStorage.setItem(KEY, on ? '1' : '0');
    } catch (e) {}
    syncButton();
  });

  syncButton();
})();
