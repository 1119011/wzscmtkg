/**
 * 个人主页
 * 在左侧栏「我的关注」下方新增入口，展示当前登录用户的
 * 头像、用户名、密码、获赞数和已发布帖子。
 */
(function () {
  var PLAIN_MAP_KEY = 'survivorPlainPasswordMap_v1';
  var origHashPassword = Auth.hashPassword.bind(Auth);

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function getPlainMap() {
    try {
      return JSON.parse(localStorage.getItem(PLAIN_MAP_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function rememberPlain(hash, plainPassword) {
    if (!hash || !plainPassword) return;
    var map = getPlainMap();
    if (map[hash] === plainPassword) return;
    map[hash] = plainPassword;
    localStorage.setItem(PLAIN_MAP_KEY, JSON.stringify(map));
  }

  // 记录之后注册 / 登录 / 修改密码时用到的明文密码
  Auth.hashPassword = function (password) {
    var hash = origHashPassword(password);
    if (password) rememberPlain(hash, String(password));
    return hash;
  };

  // 已知的初始账号密码（这些账号的密码在功能上线前就已存在）
  function getKnownPlain(user) {
    if (!user || !user.password) return null;
    var name = user.username || '';
    if (user.password === 'seed-user') return 'seed-user';
    if (user.role === 'admin' || name === '论坛管理组' || name === '论坛管理员') {
      if (user.password === origHashPassword('yiqingjiu')) return 'yiqingjiu';
    }
    if (user.isAnonymous || name === '') {
      if (user.password === origHashPassword('000')) return '000';
    }
    return null;
  }

  function getPlainPassword(user) {
    var map = getPlainMap();
    if (map[user.password]) return map[user.password];
    var known = getKnownPlain(user);
    if (known) rememberPlain(user.password, known);
    return known;
  }

  function getRawUser() {
    var current = Auth.getCurrentUser();
    if (!current) return null;
    return Storage.findUserById(current.id) || current;
  }

  function formatTime(timestamp) {
    return Posts.formatTime(timestamp);
  }

  function renderGuest(area) {
    area.innerHTML =
      '<div class="profile-page profile-guest">' +
        '<div class="profile-empty-icon">☺</div>' +
        '<div class="profile-empty-text">登录后查看个人主页</div>' +
        '<button class="btn-primary" id="profile-login-btn">登录</button>' +
      '</div>';

    var loginBtn = document.getElementById('profile-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function () {
        App.showLoginModal();
      });
    }
  }

  function renderProfile(area, user) {
    var posts = Storage.getPosts()
      .filter(function (post) { return post.authorId === user.id; })
      .sort(function (a, b) { return b.createdAt - a.createdAt; });

    var postIds = posts.map(function (post) { return post.id; });
    var receivedLikes = Storage.getLikes().filter(function (like) {
      return postIds.indexOf(like.postId) !== -1;
    }).length;

    var displayName = user.username ? user.username : '（无用户名）';
    var plainPassword = user.password ? getPlainPassword(user) : null;
    var passwordHtml;
    var passwordNote;
    if (!user.password) {
      passwordHtml = '<span class="profile-password-plain profile-password-empty">（未设置）</span>';
      passwordNote = '该账号未设置密码';
    } else if (plainPassword) {
      passwordHtml = '<span class="profile-password-plain">' + escapeHtml(plainPassword) + '</span>';
      passwordNote = '仅你自己可见';
    } else {
      passwordHtml =
        '<span class="profile-password-mask">••••••</span>' +
        '<button type="button" class="profile-reveal-btn" id="profile-reveal-btn">显示密码</button>';
      passwordNote = '点击“显示密码”，输入当前密码后即可查看';
    }
    var initial = user.username ? user.username.trim().charAt(0).toUpperCase() : '';
    var avatarColor = user.avatarColor || '#8A5A3B';
    var avatarInner = App.avatarInnerHtml(avatarColor, user.nickname || user.username, user.avatarImage);
    var avatarBgValue = App.avatarBg(avatarColor, user.avatarImage);
    var followerCount = window.UserFollow ? UserFollow.countFollowers(user.id) : 0;

    var postHtml = posts.length === 0
      ? '<div class="profile-empty-posts">还没有发布过帖子</div>'
      : posts.map(function (post) {
          return (
            '<div class="profile-post-item" data-post-id="' + escapeHtml(post.id) + '">' +
              '<div class="profile-post-title">' + escapeHtml(post.title) + '</div>' +
              '<div class="profile-post-meta">' +
                '<span>' + escapeHtml(formatTime(post.createdAt)) + '</span>' +
                '<span>👍 ' + (post.likeCount || 0) + '</span>' +
                '<span>💬 ' + (post.commentCount || 0) + '</span>' +
              '</div>' +
            '</div>'
          );
        }).join('');

    area.innerHTML =
      '<div class="profile-page">' +
        '<section class="profile-header">' +
          '<div class="profile-avatar" style="background:' + avatarBgValue + '">' +
            avatarInner +
          '</div>' +
          '<div class="profile-head-info">' +
            '<div class="profile-display-name">' + escapeHtml(displayName) + '</div>' +
            '<div class="profile-head-sub">幸存者 · 志怪论坛</div>' +
          '</div>' +
          '<div class="profile-fans">' +
            '<div class="profile-fans-value">' + followerCount + '</div>' +
            '<div class="profile-fans-label">粉丝</div>' +
          '</div>' +
        '</section>' +

        '<section class="profile-stats">' +
          '<div class="profile-stat">' +
            '<div class="profile-stat-value">' + receivedLikes + '</div>' +
            '<div class="profile-stat-label">获赞数</div>' +
          '</div>' +
          '<div class="profile-stat">' +
            '<div class="profile-stat-value">' + posts.length + '</div>' +
            '<div class="profile-stat-label">发布帖子</div>' +
          '</div>' +
        '</section>' +

        '<section class="profile-fields">' +
          '<div class="profile-field">' +
            '<div class="profile-field-label">用户名</div>' +
            '<div class="profile-field-value">' + escapeHtml(displayName) + '</div>' +
          '</div>' +
          '<div class="profile-field">' +
            '<div class="profile-field-label">密码</div>' +
            '<div class="profile-field-value profile-password" id="profile-password-value">' + passwordHtml + '</div>' +
            '<div class="profile-field-note">' + escapeHtml(passwordNote) + '</div>' +
          '</div>' +
        '</section>' +

        '<section class="profile-posts">' +
          '<div class="profile-posts-header">' +
            '<span>发布的帖子</span>' +
            '<span class="profile-posts-count">' + posts.length + ' 篇</span>' +
          '</div>' +
          '<div class="profile-post-list">' + postHtml + '</div>' +
        '</section>' +
      '</div>';

    area.querySelectorAll('.profile-post-item').forEach(function (item) {
      item.addEventListener('click', function () {
        App.showPostDetail(item.dataset.postId);
        window.scrollTo(0, 0);
      });
    });

    bindPasswordReveal(area, user);
  }

  // 旧账号只有密码哈希，验证当前密码后展示明文并记住
  function bindPasswordReveal(area, user) {
    var btn = document.getElementById('profile-reveal-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var box = document.getElementById('profile-password-value');
      if (!box) return;

      box.innerHTML =
        '<form class="profile-reveal-form" id="profile-reveal-form">' +
          '<input type="password" id="profile-reveal-input" placeholder="输入当前密码" autocomplete="off">' +
          '<button type="submit">确认</button>' +
          '<button type="button" class="profile-reveal-cancel" id="profile-reveal-cancel">取消</button>' +
        '</form>';

      var form = document.getElementById('profile-reveal-form');
      var input = document.getElementById('profile-reveal-input');
      if (input) input.focus();

      document.getElementById('profile-reveal-cancel').addEventListener('click', function () {
        renderProfile(area, getRawUser());
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var value = input ? input.value : '';
        if (!value) {
          App.showToast('请输入密码', 'error');
          return;
        }
        if (user.password === value || user.password === origHashPassword(value)) {
          rememberPlain(user.password, value);
          App.showToast('密码已显示', 'success');
          renderProfile(area, getRawUser());
        } else {
          App.showToast('密码不正确', 'error');
          if (input) {
            input.value = '';
            input.focus();
          }
        }
      });
    });
  }

  function showProfile() {
    var area = document.getElementById('content-area');
    if (!area) return;

    App.currentView = 'profile';
    App.currentPostId = null;
    App.updateActiveNav('profile');

    var user = getRawUser();
    if (!user) {
      renderGuest(area);
    } else {
      renderProfile(area, user);
    }
    window.scrollTo(0, 0);
  }

  // 离开个人主页时恢复帖子列表容器，保证首页等页面正常渲染
  var origRender = App.render;
  App.render = function () {
    var area = document.getElementById('content-area');
    if (area && !area.querySelector('#post-list-container')) {
      area.innerHTML = '<div id="post-list-container"></div>';
    }
    return origRender.call(this);
  };

  var profileItem = document.querySelector('.sidebar-menu li[data-view="profile"]');
  if (profileItem) {
    profileItem.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      showProfile();
    });
  }
})();
