/**
 * 细节调整
 * 1. 最近登录账号（快速切换）
 * 2. 移除帖子卡片上的「收藏」按钮
 */
(function () {
  var RECENT_KEY = 'recentAccounts';
  var RECENT_LIMIT = 5;

  function getRecent() {
    return Storage.get(RECENT_KEY) || [];
  }

  function recordRecent(user) {
    if (!user || !user.id || user.isAnonymous) return;
    var ids = getRecent().filter(function (id) { return id !== user.id; });
    ids.unshift(user.id);
    Storage.set(RECENT_KEY, ids.slice(0, RECENT_LIMIT));
  }

  function displayName(user) {
    return user.nickname || user.username || '无用户名账号';
  }

  function getRecentUsers() {
    return getRecent().map(function (id) {
      return Storage.findUserById(id);
    }).filter(function (user) {
      return !!user && !user.isAnonymous;
    });
  }

  var current = Auth.getCurrentUser();
  if (current) recordRecent(current);

  // 记录成功登录的账号
  var origLogin = Auth.login.bind(Auth);
  Auth.login = async function (username, password) {
    var result = await origLogin(username, password);
    if (result && result.success) recordRecent(result.user);
    return result;
  };

  async function switchAccount(userId) {
    var user = Storage.findUserById(userId);
    if (!user) {
      App.showToast('账号不存在', 'error');
      return;
    }

    await Storage.setCurrentUser(Auth.sanitizeUser(user));
    recordRecent(user);
    App.closeModal();
    App.updateNavbar();
    App.render();
    App.showToast('已切换至 ' + displayName(user), 'success');
  }

  // 在登录弹窗中展示最近登录账号
  var origShowLoginModal = App.showLoginModal;
  App.showLoginModal = function () {
    origShowLoginModal.call(this);

    var overlay = document.getElementById('current-modal');
    if (!overlay) return;

    var modal = overlay.querySelector('.modal');
    var body = overlay.querySelector('.modal-body');
    var footer = overlay.querySelector('.modal-footer');
    if (!modal || !body) return;

    var users = getRecentUsers();
    if (users.length === 0) return;

    var section = document.createElement('div');
    section.className = 'recent-accounts';
    section.innerHTML =
      '<div class="recent-title">最近登录账号</div>' +
      users.map(function (user) {
        var initial = user.nickname ? user.nickname.charAt(0).toUpperCase() : '';
        return '<div class="recent-account" data-user-id="' + user.id + '">' +
          '<div class="avatar-small" style="background:' + App.avatarBg(user.avatarColor, user.avatarImage) + '">' + App.avatarInnerHtml(user.avatarColor, user.nickname, user.avatarImage) + '</div>' +
          '<div class="recent-main">' +
            '<div class="recent-name">' + App.escapeHtml(displayName(user)) + '</div>' +
            '<div class="recent-hint">点击快速登录</div>' +
          '</div>' +
        '</div>';
      }).join('');

    if (footer) {
      modal.insertBefore(section, footer);
    } else {
      body.appendChild(section);
    }

    section.querySelectorAll('.recent-account').forEach(function (item) {
      item.addEventListener('click', function () {
        switchAccount(item.dataset.userId);
      });
    });
  };

  // 移除帖子卡片上的收藏按钮
  var origRenderPostList = App.renderPostList;
  App.renderPostList = function () {
    origRenderPostList.call(this);
    document.querySelectorAll('#post-list-container .post-item .post-actions .post-action').forEach(function (item) {
      if (item.textContent.indexOf('收藏') !== -1) item.remove();
    });

    document.querySelectorAll('#post-list-container .post-item').forEach(function (item) {
      if (!hasTag(item, '失传媒体')) return;
      var meta = item.querySelector('.post-meta');
      if (meta) hideMetaTime(meta);
    });
  };

  // 「失传媒体」标签的帖子不显示发布时间
  var TIME_RE = /^(刚刚|\d+分钟前|\d+小时前|\d+天前|\d{4}-\d{2}-\d{2})$/;

  function hasTag(root, tag) {
    var tags = root.querySelectorAll('.post-tag');
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].textContent.trim() === tag) return true;
    }
    return false;
  }

  function hideMetaTime(meta) {
    var children = meta.children;
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      if (el.tagName !== 'SPAN' || !TIME_RE.test(el.textContent.trim())) continue;
      el.style.display = 'none';
      var prev = el.previousElementSibling;
      if (prev && prev.tagName === 'SPAN' && prev.textContent.trim() === '·') {
        prev.style.display = 'none';
      }
    }
  }

  var origShowPostDetail = App.showPostDetail;
  App.showPostDetail = function (postId) {
    origShowPostDetail.call(this, postId);

    var detail = document.querySelector('.post-detail');
    if (!detail || !hasTag(detail, '失传媒体')) return;
    var meta = detail.querySelector('.post-detail-header .post-meta');
    if (meta) hideMetaTime(meta);
  };
})();
