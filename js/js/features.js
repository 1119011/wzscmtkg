/**
 * 论坛扩展功能
 * 1. 账号设置（修改用户名与密码）
 * 2. 帖子关注与「我的关注」筛选
 * 3. 无用户名特殊账号（仅论坛管理组可登录）
 */
(function () {
  var followFilter = false;
  var pendingAvatarImage = null;

  function isAdminUser(user) {
    return !!(user && (
      user.role === 'admin' ||
      user.username === '论坛管理组' ||
      user.username === '论坛管理员'
    ));
  }

  function getAnonymousUser() {
    return Storage.getUsers().find(function (user) {
      return user.username === '' || user.isAnonymous;
    });
  }

  // ========== 特殊账号登录限制 ==========
  var origLogin = Auth.login.bind(Auth);
  Auth.login = async function (username, password) {
    var name = String(username || '').trim();

    if (name === '') {
      var current = Auth.getCurrentUser();
      if (!isAdminUser(current)) {
        return { success: false, message: '仅论坛管理员可登入此账号' };
      }
    }

    return await origLogin(username, password);
  };

  // ========== 关注数据 ==========
  function getFollows() {
    return Storage.get('follows') || [];
  }

  function isFollowing(postId, userId) {
    var uid = userId || (Auth.getCurrentUser() || {}).id;
    if (!uid) return false;
    return getFollows().some(function (item) {
      return item.userId === uid && item.postId === postId;
    });
  }

  function toggleFollow(postId) {
    var user = Auth.getCurrentUser();
    if (!user) {
      App.showToast('请先登录', 'error');
      App.showLoginModal();
      return;
    }

    var follows = getFollows();
    var index = follows.findIndex(function (item) {
      return item.userId === user.id && item.postId === postId;
    });

    if (index !== -1) {
      follows.splice(index, 1);
      Storage.set('follows', follows);
      App.showToast('已取消关注', 'info');
    } else {
      follows.push({ userId: user.id, postId: postId, createdAt: Date.now() });
      Storage.set('follows', follows);
      App.showToast('已关注该帖子', 'success');
    }

    if (document.querySelector('.post-detail')) {
      App.showPostDetail(postId);
    } else {
      App.render();
    }
  }

  function createFollowButton(postId, inDetail) {
    var followed = isFollowing(postId);

    if (inDetail) {
      var button = document.createElement('button');
      button.className = 'btn-secondary btn-follow';
      button.textContent = followed ? '★ 已关注' : '☆ 关注';
      button.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFollow(postId);
      });
      return button;
    }

    var item = document.createElement('div');
    item.className = 'post-action follow-btn' + (followed ? ' followed' : '');
    item.innerHTML =
      '<span>' + (followed ? '★' : '☆') + '</span>' +
      '<span>' + (followed ? '已关注' : '关注') + '</span>';
    item.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleFollow(postId);
    });
    return item;
  }

  function decorateFollows() {
    var items = document.querySelectorAll('#post-list-container .post-item');
    items.forEach(function (item) {
      if (item.querySelector('.follow-btn')) return;
      var actions = item.querySelector('.post-actions');
      if (actions) actions.appendChild(createFollowButton(item.dataset.postId, false));
    });
  }

  function followEmptyState(message) {
    return '<div class="empty-state">' +
      '<div class="empty-state-icon">☆</div>' +
      '<div class="empty-state-text">' + message + '</div>' +
      '</div>';
  }

  function applyFollowFilter() {
    var container = document.getElementById('post-list-container');
    if (!container) return;

    var user = Auth.getCurrentUser();
    if (!user) {
      container.innerHTML = followEmptyState('登录后可查看关注的帖子');
      return;
    }

    var followedIds = getFollows()
      .filter(function (item) { return item.userId === user.id; })
      .map(function (item) { return item.postId; });

    var items = container.querySelectorAll('.post-item');
    var visible = 0;

    items.forEach(function (item) {
      if (followedIds.indexOf(item.dataset.postId) === -1) {
        item.remove();
      } else {
        visible += 1;
      }
    });

    if (visible === 0) {
      container.innerHTML = followEmptyState('还没有关注的帖子，去首页逛逛吧');
    }
  }

  // ========== 渲染包装 ==========
  function goHomeFromDetail() {
    var area = document.getElementById('content-area');
    if (area) area.innerHTML = '<div id="post-list-container"></div>';
    followFilter = false;
    App.currentView = 'home';
    App.currentPostId = null;
    App.updateActiveNav('home');
    App.render();
  }

  var origRenderPostList = App.renderPostList;
  App.renderPostList = function () {
    origRenderPostList.call(this);
    if (followFilter) applyFollowFilter();
    decorateFollows();
  };

  // 点击热门话题时退出「我的关注」筛选，避免两种筛选冲突
  var origFilterByTag = App.filterByTag;
  App.filterByTag = function (tag) {
    followFilter = false;
    origFilterByTag.call(this, tag);
  };

  var origShowPostDetail = App.showPostDetail;
  App.showPostDetail = function (postId) {
    origShowPostDetail.call(this, postId);

    var detail = document.querySelector('.post-detail');
    if (detail && !detail.querySelector('.post-back-btn')) {
      var backBtn = document.createElement('button');
      backBtn.className = 'post-back-btn';
      backBtn.textContent = '⇦';
      backBtn.title = '返回首页';
      backBtn.addEventListener('click', goHomeFromDetail);
      detail.insertBefore(backBtn, detail.firstChild);
    }

    var actions = document.querySelector('.post-detail-actions');
    if (actions && !actions.querySelector('.btn-follow')) {
      actions.appendChild(createFollowButton(postId, true));
    }
  };

  // ========== 「我的关注」筛选 ==========
  function showHome(activeNav) {
    followFilter = false;
    App.currentView = 'home';
    App.currentPostId = null;
    App.currentTag = null;
    App.updateActiveNav(activeNav);
    App.render();
  }

  function showFollow() {
    followFilter = true;
    App.currentView = 'home';
    App.currentPostId = null;
    App.currentTag = null;
    App.updateActiveNav('follow');
    App.render();
  }

  function intercept(el, handler) {
    if (!el) return;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      handler();
    }, true);
  }

  intercept(document.getElementById('nav-follow'), showFollow);
  intercept(document.querySelector('.sidebar-menu li[data-view="follow"]'), showFollow);
  intercept(document.getElementById('nav-home'), function () { showHome('home'); });
  intercept(document.getElementById('nav-hot'), function () { showHome('hot'); });
  intercept(document.querySelector('.sidebar-menu li[data-view="home"]'), function () { showHome('home'); });
  intercept(document.querySelector('.sidebar-menu li[data-view="hot"]'), function () { showHome('hot'); });
  intercept(document.querySelector('.navbar-logo'), function () { showHome('home'); });

  var logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      followFilter = false;
    });
  }

  // ========== 账号设置 ==========
  function openSettings() {
    var user = Auth.getCurrentUser();
    if (!user) return;

    var isAnon = !!user.isAnonymous;
    var locked = !!user.accountLocked;
    pendingAvatarImage = null;

    App.showModal(
      '<div class="modal">' +
        '<div class="modal-header">' +
          '<div class="modal-title">账号设置</div>' +
          '<button class="modal-close" onclick="App.closeModal()">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="form-group">' +
            '<label>头像</label>' +
            '<div class="settings-avatar-row">' +
              '<div class="avatar-small settings-avatar-preview" id="settings-avatar-preview" style="background:' + App.avatarBg(user.avatarColor, user.avatarImage) + '">' +
                App.avatarInnerHtml(user.avatarColor, user.nickname || user.username, user.avatarImage) +
              '</div>' +
              '<button type="button" class="btn-secondary" id="settings-avatar-btn">更换头像</button>' +
              '<input type="file" id="settings-avatar-input" accept="image/*" style="display:none">' +
            '</div>' +
            '<div class="form-hint">从电脑中选择一张图片作为头像</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label>用户名</label>' +
            '<input type="text" id="settings-username" value="' + (user.username || '') + '"' +
              (isAnon || locked ? ' disabled' : '') + ' placeholder="至少3个字符">' +
            (isAnon ? '<div class="form-hint">无用户名账号不可修改用户名</div>' : '') +
            (!isAnon && locked ? '<div class="form-hint">该账号已被锁定，用户名不可修改</div>' : '') +
          '</div>' +
          '<div class="form-group">' +
            '<label>新密码</label>' +
            '<input type="password" id="settings-password" placeholder="不修改请留空"' + (locked ? ' disabled' : '') + '>' +
            '<div class="form-hint">' + (locked ? '该账号已被锁定，密码不可修改' : '至少6个字符') + '</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label>确认新密码</label>' +
            '<input type="password" id="settings-password2" placeholder="再次输入新密码"' + (locked ? ' disabled' : '') + '>' +
          '</div>' +
          '<div class="form-error" id="settings-error"></div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn-secondary" onclick="App.closeModal()">取消</button>' +
          '<button class="btn-primary" id="settings-save">保存</button>' +
        '</div>' +
      '</div>'
    );

    document.getElementById('settings-save').addEventListener('click', saveSettings);

    var avatarBtn = document.getElementById('settings-avatar-btn');
    var avatarInput = document.getElementById('settings-avatar-input');
    avatarBtn.addEventListener('click', function () { avatarInput.click(); });
    avatarInput.addEventListener('change', function () {
      var file = avatarInput.files && avatarInput.files[0];
      if (!file) return;
      App.fileToImageDataUrl(file, 128).then(function (dataUrl) {
        pendingAvatarImage = dataUrl;
        var preview = document.getElementById('settings-avatar-preview');
        preview.style.background = 'transparent';
        preview.innerHTML = '<img class="avatar-img" src="' + dataUrl + '" alt="">';
      }).catch(function () {
        App.showToast('头像图片读取失败', 'error');
      });
      avatarInput.value = '';
    });
  }

  async function saveSettings() {
    var current = Auth.getCurrentUser();
    if (!current) return;

    var errorEl = document.getElementById('settings-error');
    errorEl.textContent = '';

    var users = Storage.getUsers();
    var index = users.findIndex(function (user) { return user.id === current.id; });
    if (index === -1) {
      errorEl.textContent = '账号不存在';
      return;
    }

    var record = users[index];
    var usernameInput = document.getElementById('settings-username');
    var newName = usernameInput.disabled ? record.username : usernameInput.value.trim();
    var password = document.getElementById('settings-password').value;
    var password2 = document.getElementById('settings-password2').value;

    if (!record.isAnonymous && !record.accountLocked) {
      if (newName.length < 3) {
        errorEl.textContent = '用户名至少3个字符';
        return;
      }
    }

    if (!record.accountLocked && password) {
      if (password.length < 6) {
        errorEl.textContent = '密码至少6个字符';
        return;
      }
      if (password !== password2) {
        errorEl.textContent = '两次输入的密码不一致';
        return;
      }
    }

    // 更新用户名与显示名称（锁定账号不允许修改）
    if (!record.isAnonymous && !record.accountLocked && newName !== record.username) {
      record.username = newName;
      record.nickname = newName;

      var posts = Storage.getPosts();
      var postsChanged = false;
      posts.forEach(function (post) {
        if (post.authorId === record.id) {
          post.authorName = newName;
          postsChanged = true;
        }
      });
      if (postsChanged) await Storage.savePosts(posts);
    }

    // 更新密码（锁定账号不允许修改）
    if (!record.accountLocked && password) {
      record.password = Auth.hashPassword(password);
    }

    // 更新头像
    if (pendingAvatarImage) {
      record.avatarImage = pendingAvatarImage;
      pendingAvatarImage = null;
    }

    await Storage.saveUsers(users);
    await Storage.setCurrentUser(Auth.sanitizeUser(record));

    App.closeModal();
    App.updateNavbar();
    App.render();
    App.showToast('账号信息已更新', 'success');
  }

  // ========== 导航栏按钮 ==========
  var origUpdateNavbar = App.updateNavbar;
  App.updateNavbar = function () {
    origUpdateNavbar.call(this);

    var user = Auth.getCurrentUser();
    var area = document.getElementById('user-area');
    if (!area) return;

    var settingsBtn = document.getElementById('btn-account-settings');
    if (user && !user.isAnonymous) {
      if (!settingsBtn) {
        settingsBtn = document.createElement('button');
        settingsBtn.id = 'btn-account-settings';
        settingsBtn.className = 'btn-secondary';
        settingsBtn.style.padding = '6px 12px';
        settingsBtn.textContent = '账号设置';
        settingsBtn.addEventListener('click', openSettings);
        area.insertBefore(settingsBtn, document.getElementById('btn-logout'));
      }
      settingsBtn.style.display = 'inline-block';
    } else if (settingsBtn) {
      settingsBtn.style.display = 'none';
    }

    var anonBtn = document.getElementById('btn-anonymous');
    if (user && isAdminUser(user)) {
      if (!anonBtn) {
        anonBtn = document.createElement('button');
        anonBtn.id = 'btn-anonymous';
        anonBtn.className = 'btn-secondary';
        anonBtn.style.padding = '6px 12px';
        anonBtn.textContent = '无用户名账号';
        anonBtn.addEventListener('click', enterAnonymous);
        area.insertBefore(anonBtn, settingsBtn || document.getElementById('btn-logout'));
      }
      anonBtn.style.display = 'inline-block';
    } else if (anonBtn) {
      anonBtn.style.display = 'none';
    }
  };

  // ========== 无用户名账号登录（管理员直接进入） ==========
  async function enterAnonymous() {
    var current = Auth.getCurrentUser();
    if (!isAdminUser(current)) {
      App.showToast('仅论坛管理员可登入此账号', 'error');
      return;
    }

    var anon = getAnonymousUser();
    if (!anon) {
      App.showToast('无用户名账号不存在', 'error');
      return;
    }

    await Storage.setCurrentUser(Auth.sanitizeUser(anon));
    followFilter = false;
    App.currentView = 'home';
    App.currentPostId = null;
    App.updateActiveNav('home');
    App.updateNavbar();
    App.render();
    App.showToast('已进入无用户名账号', 'success');
  }
})();
