/**
 * 社区扩展功能
 * 1. 评论楼层编号（1L、2L、3L...）
 * 2. 用户信息卡与私信系统
 */
(function () {
  // 评论按时间正序展示，便于楼层编号
  var origGetDetail = Posts.getDetail.bind(Posts);
  Posts.getDetail = function (postId) {
    var detail = origGetDetail(postId);
    if (detail && detail.comments) {
      detail.comments = detail.comments.slice().sort(function (a, b) {
        return a.createdAt - b.createdAt;
      });
    }
    return detail;
  };

  function displayName(user) {
    if (!user) return '已注销用户';
    return user.nickname || user.username || '无用户名账号';
  }

  // ========== 用户信息卡 ==========
  function bindAvatar(avatar, userId) {
    if (!avatar || !userId) return;
    if (avatar.dataset.avatarBound === '1') return;
    avatar.dataset.avatarBound = '1';
    avatar.dataset.userId = userId;
    avatar.style.cursor = 'pointer';
    avatar.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openUserInfo(userId);
    });
  }

  function openUserInfo(userId) {
    var user = Storage.findUserById(userId);
    if (!user) {
      // 用户记录已注销时，尝试从帖子中还原基础信息
      var altPosts = (Storage.get('posts') || []).filter(function (p) {
        return p.authorId === userId;
      });
      if (!altPosts.length) {
        App.showToast('用户不存在', 'error');
        return;
      }
      var alt = altPosts[0];
      user = {
        id: userId,
        nickname: alt.authorName,
        username: '',
        avatarColor: alt.authorAvatarColor,
        avatarImage: alt.authorAvatarImage
      };
    }

    var current = Auth.getCurrentUser();
    var name = displayName(user);
    var initial = user.nickname ? user.nickname.charAt(0).toUpperCase() : '';
    var usernameLine = user.username ? '@' + user.username : '';

    // 该用户发布过的帖子
    var userPosts = Posts.getList()
      .filter(function (post) { return post.authorId === user.id; })
      .sort(function (a, b) { return b.createdAt - a.createdAt; });

    var postsHtml =
      '<div class="user-info-posts">' +
        '<div class="user-info-posts-title">TA 发布的帖子 · ' + userPosts.length + '</div>' +
        (userPosts.length
          ? userPosts.map(function (post, index) {
              return '<button type="button" class="user-info-post-item" data-post-index="' + index + '">' +
                '<span class="user-info-post-title">' + App.escapeHtml(post.title) + '</span>' +
                '<span class="user-info-post-meta">' +
                  Posts.formatTime(post.createdAt) +
                  ' · 评论 ' + (post.commentCount || 0) +
                  ' · 赞同 ' + (post.likeCount || 0) +
                '</span>' +
              '</button>';
            }).join('')
          : '<div class="user-info-posts-empty">该用户还没有发布过帖子</div>') +
      '</div>';

    App.closeModal();
    App.showModal(
      '<div class="modal user-info-modal">' +
        '<div class="modal-header">' +
          '<div class="modal-title">用户信息</div>' +
          '<button class="modal-close" onclick="App.closeModal()">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="user-info-card">' +
            '<div class="user-info-avatar" style="background:' + App.avatarBg(user.avatarColor, user.avatarImage) + '">' +
              App.avatarInnerHtml(user.avatarColor, name, user.avatarImage) +
            '</div>' +
            '<div class="user-info-name">' + App.escapeHtml(name) + '</div>' +
            (usernameLine ? '<div class="user-info-sub">' + App.escapeHtml(usernameLine) + '</div>' : '') +
          '</div>' +
          postsHtml +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn-secondary" onclick="App.closeModal()">退出</button>' +
          (current && current.id === user.id ? '' :
            '<button class="btn-primary" id="user-info-follow">关注</button>' +
            '<button class="btn-secondary" id="user-info-message">私信</button>') +
        '</div>' +
      '</div>'
    );

    // 点击帖子跳转到帖子详情
    var postItems = document.querySelectorAll('.user-info-post-item');
    Array.prototype.forEach.call(postItems, function (item) {
      item.addEventListener('click', function () {
        var post = userPosts[Number(item.dataset.postIndex)];
        if (!post) return;
        App.closeModal();
        App.currentView = 'home';
        App.currentPostId = null;
        App.currentTag = null;
        App.showPostDetail(post.id);
        window.scrollTo(0, 0);
      });
    });

    var followBtn = document.getElementById('user-info-follow');
    if (followBtn) {
      var syncFollow = function () {
        var followed = current && window.UserFollow &&
          UserFollow.isFollowing(current.id, user.id);
        followBtn.textContent = followed ? '已关注' : '关注';
        followBtn.className = followed ? 'btn-secondary' : 'btn-primary';
      };
      syncFollow();
      followBtn.addEventListener('click', function () {
        if (!current) {
          App.closeModal();
          App.showLoginModal();
          return;
        }
        if (!window.UserFollow) {
          App.showToast('关注功能暂不可用', 'error');
          return;
        }
        var nowFollowed = UserFollow.toggle(current.id, user.id);
        syncFollow();
        App.showToast(nowFollowed ? '已关注' : '已取消关注', 'success');
      });
    }

    var msgBtn = document.getElementById('user-info-message');
    if (msgBtn) {
      msgBtn.addEventListener('click', function () {
        openChat(userId);
      });
    }
  }

  // 供地图等其他模块调用
  App.openUserInfo = openUserInfo;

  // ========== 私信数据 ==========
  function getMessages() {
    return Storage.get('messages') || [];
  }

  function saveMessages(messages) {
    Storage.set('messages', messages);
  }

  function unreadCount() {
    var user = Auth.getCurrentUser();
    if (!user) return 0;
    var privateUnread = getMessages().filter(function (msg) {
      return msg.toId === user.id && msg.fromId !== user.id && !msg.read;
    }).length;
    var groupUnread = window.GroupChat && GroupChat.unreadCount
      ? GroupChat.unreadCount(user.id)
      : 0;
    return privateUnread + groupUnread;
  }

  function refreshMessageBadge() {
    var dot = document.getElementById('msg-dot');
    if (!dot) return;
    dot.style.display = unreadCount() > 0 ? 'block' : 'none';
  }

  function markRead(otherId, myId) {
    var messages = getMessages();
    var changed = false;
    messages.forEach(function (msg) {
      if (msg.fromId === otherId && msg.toId === myId && !msg.read) {
        msg.read = true;
        changed = true;
      }
    });
    if (changed) saveMessages(messages);
    refreshMessageBadge();
  }

  // ========== 会话窗口 ==========
  function renderChatModal(otherId) {
    var me = Auth.getCurrentUser();
    if (!me) {
      App.showLoginModal();
      return;
    }

    var other = Storage.findUserById(otherId);
    var otherName = displayName(other);
    var initial = other && other.nickname ? other.nickname.charAt(0).toUpperCase() : '';

    var messages = getMessages().filter(function (msg) {
      return (msg.fromId === me.id && msg.toId === otherId) ||
             (msg.fromId === otherId && msg.toId === me.id);
    }).sort(function (a, b) {
      return a.createdAt - b.createdAt;
    });

    var bodyHtml = messages.length === 0
      ? '<div class="chat-empty">还没有消息，打个招呼吧</div>'
      : messages.map(function (msg) {
          var mine = msg.fromId === me.id;
          return '<div class="chat-row ' + (mine ? 'mine' : 'other') + '">' +
            '<div class="chat-bubble">' + App.escapeHtml(msg.content) + '</div>' +
            '<div class="chat-time">' + Posts.formatTime(msg.createdAt) + '</div>' +
          '</div>';
        }).join('');

    App.showModal(
      '<div class="modal chat-modal">' +
        '<div class="modal-header">' +
          '<div class="chat-header-user">' +
            '<div class="avatar-small" style="background:' + App.avatarBg(other ? other.avatarColor : '#999', other && other.avatarImage) + '">' + App.avatarInnerHtml(other && other.avatarColor, otherName, other && other.avatarImage) + '</div>' +
            '<div class="modal-title">' + App.escapeHtml(otherName) + '</div>' +
          '</div>' +
          '<button class="modal-close" onclick="App.closeModal()">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="chat-messages" id="chat-messages">' + bodyHtml + '</div>' +
        '</div>' +
        '<div class="modal-footer chat-footer">' +
          '<textarea id="chat-input" placeholder="输入消息..."></textarea>' +
          '<button class="btn-primary" id="chat-send">发送</button>' +
        '</div>' +
      '</div>'
    );

    var box = document.getElementById('chat-messages');
    if (box) box.scrollTop = box.scrollHeight;

    var input = document.getElementById('chat-input');
    document.getElementById('chat-send').addEventListener('click', function () {
      sendMessage(otherId);
    });
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(otherId);
        }
      });
      input.focus();
    }
  }

  function openChat(otherId) {
    var me = Auth.getCurrentUser();
    if (!me) {
      App.closeModal();
      App.showLoginModal();
      App.showToast('请先登录后再私信', 'error');
      return;
    }
    if (!Storage.findUserById(otherId)) {
      App.showToast('用户不存在', 'error');
      return;
    }

    markRead(otherId, me.id);
    App.closeModal();
    renderChatModal(otherId);
  }

  function sendMessage(otherId) {
    var me = Auth.getCurrentUser();
    if (!me) {
      App.showLoginModal();
      return;
    }

    var input = document.getElementById('chat-input');
    var content = input ? input.value.trim() : '';
    if (!content) {
      App.showToast('请输入消息内容', 'error');
      return;
    }

    var messages = getMessages();
    messages.push({
      id: Storage.generateId(),
      fromId: me.id,
      toId: otherId,
      content: content,
      createdAt: Date.now(),
      read: false
    });
    saveMessages(messages);

    App.closeModal();
    renderChatModal(otherId);
  }

  // ========== 私信收件箱 ==========
  function openInbox() {
    var me = Auth.getCurrentUser();
    if (!me) {
      App.showLoginModal();
      return;
    }

    var messages = getMessages();
    var latest = {};
    var unread = {};

    messages.forEach(function (msg) {
      if (msg.fromId !== me.id && msg.toId !== me.id) return;
      var otherId = msg.fromId === me.id ? msg.toId : msg.fromId;
      if (otherId === me.id) return;

      if (!latest[otherId] || latest[otherId].createdAt < msg.createdAt) {
        latest[otherId] = msg;
      }
      if (msg.toId === me.id && msg.fromId !== me.id && !msg.read) {
        unread[otherId] = (unread[otherId] || 0) + 1;
      }
    });

    var conversations = Object.keys(latest).map(function (otherId) {
      return { otherId: otherId, last: latest[otherId] };
    }).sort(function (a, b) {
      return b.last.createdAt - a.last.createdAt;
    });

    var bodyHtml = conversations.length === 0
      ? '<div class="empty-state" style="padding:30px;"><div class="empty-state-text">暂无私信</div></div>'
      : conversations.map(function (item) {
          var other = Storage.findUserById(item.otherId);
          var name = displayName(other);
          var initial = other && other.nickname ? other.nickname.charAt(0).toUpperCase() : '';
          var count = unread[item.otherId] || 0;
          var preview = item.last.fromId === me.id ? '我：' + item.last.content : item.last.content;

          return '<div class="convo-item" data-user-id="' + item.otherId + '">' +
            '<div class="avatar-small" style="background:' + App.avatarBg(other ? other.avatarColor : '#999', other && other.avatarImage) + '">' + App.avatarInnerHtml(other && other.avatarColor, name, other && other.avatarImage) + '</div>' +
            '<div class="convo-main">' +
              '<div class="convo-top">' +
                '<span class="convo-name">' + App.escapeHtml(name) + '</span>' +
                (count > 0 ? '<span class="convo-unread">' + count + '</span>' : '') +
              '</div>' +
              '<div class="convo-preview">' + App.escapeHtml(preview) + '</div>' +
            '</div>' +
          '</div>';
        }).join('');

    App.closeModal();
    App.showModal(
      '<div class="modal inbox-modal">' +
        '<div class="modal-header">' +
          '<div class="modal-title">私信</div>' +
          '<button class="modal-close" onclick="App.closeModal()">✕</button>' +
        '</div>' +
        '<div class="modal-body inbox-body">' + bodyHtml + '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn-secondary" onclick="App.closeModal()">退出</button>' +
        '</div>' +
      '</div>'
    );

    document.querySelectorAll('.convo-item').forEach(function (item) {
      item.addEventListener('click', function () {
        openChat(item.dataset.userId);
      });
    });
  }

  // ========== 列表与详情装饰 ==========
  var origRenderPostList = App.renderPostList;
  App.renderPostList = function () {
    origRenderPostList.call(this);

    document.querySelectorAll('#post-list-container .post-item').forEach(function (item) {
      var post = Storage.getPostById(item.dataset.postId);
      if (!post) return;
      bindAvatar(item.querySelector('.post-meta .avatar-small'), post.authorId);
    });

    refreshMessageBadge();
  };

  var origShowPostDetail = App.showPostDetail;
  App.showPostDetail = function (postId) {
    origShowPostDetail.call(this, postId);

    var detail = Posts.getDetail(postId);
    var detailEl = document.querySelector('.post-detail');
    if (!detail || !detailEl) return;

    var headerAvatar = detailEl.querySelector('.post-detail-header .post-meta .avatar-small');
    bindAvatar(headerAvatar, detail.authorId);

    var headerMeta = detailEl.querySelector('.post-detail-header .post-meta');
    if (headerMeta && !headerMeta.querySelector('.post-floor-tag')) {
      var opTag = document.createElement('span');
      opTag.className = 'post-floor-tag';
      opTag.textContent = '1L · 楼主';
      headerMeta.appendChild(opTag);
    }

    var isAnimePost = detail.title &&
      detail.title.indexOf('找一部在暗网上看过的离奇动画') !== -1 &&
      detail.title.indexOf('该帖记录') === -1 &&
      detail.title.indexOf('该帖整理') === -1;
    var jumpIndex = -1;
    var jumpIndex2 = -1;
    if (isAnimePost) {
      detail.comments.forEach(function (c, i) {
        if (c.content === '你们怎么讨论到700多楼了？') jumpIndex = i;
      });
      detail.comments.forEach(function (c, i) {
        if (jumpIndex2 === -1 && i > jumpIndex &&
            c.content === '浏览器🔍shaknb点me，里面什么都有，你们也用得上。') {
          jumpIndex2 = i;
        }
      });
    }

    var commentItems = detailEl.querySelectorAll('.comment-item');
    commentItems.forEach(function (item, index) {
      var meta = item.querySelector('.comment-meta');
      var avatar = meta ? meta.querySelector('.avatar-small') : null;
      var comment = detail.comments[index];

      if (meta && !meta.querySelector('.comment-floor')) {
        var floor = document.createElement('span');
        floor.className = 'comment-floor';
        if (isAnimePost && jumpIndex2 > -1 && index >= jumpIndex2) {
          floor.textContent = (17788 + index - jumpIndex2) + 'L';
        } else if (isAnimePost && jumpIndex > -1 && index >= jumpIndex) {
          floor.textContent = (734 + index - jumpIndex) + 'L';
        } else {
          floor.textContent = (index + 2) + 'L';
        }
        meta.appendChild(floor);
      }

      if (comment) bindAvatar(avatar, comment.authorId);
    });

    function addSeparator(atIndex) {
      if (!commentItems[atIndex]) return;
      var commentList = detailEl.querySelector('.comment-list');
      if (!commentList) return;
      var separator = document.createElement('li');
      separator.className = 'comment-separator';
      separator.textContent = '......';
      commentList.insertBefore(separator, commentItems[atIndex]);
    }

    if (isAnimePost && jumpIndex > -1) addSeparator(jumpIndex);
    if (isAnimePost && jumpIndex2 > -1) addSeparator(jumpIndex2);

    // 「调查进展」112L 后插入省略号，从下一楼起改为 231L 连续计数
    if (detail.title &&
        detail.title.indexOf('调查进展') !== -1 &&
        detail.title.indexOf('暗网动画') !== -1) {
      var investigationItems = detailEl.querySelectorAll('.comment-item');
      var boundaryIndex = -1;
      for (var ci = 0; ci < investigationItems.length; ci++) {
        var floorEl = investigationItems[ci].querySelector('.comment-floor');
        if (floorEl && floorEl.textContent.trim() === '112L') {
          boundaryIndex = ci;
          break;
        }
      }
      if (boundaryIndex > -1 && boundaryIndex + 1 < investigationItems.length) {
        var investigationList = detailEl.querySelector('.comment-list');
        if (investigationList) {
          var investigationSep = document.createElement('li');
          investigationSep.className = 'comment-separator';
          investigationSep.textContent = '......';
          investigationList.insertBefore(investigationSep, investigationItems[boundaryIndex + 1]);
        }
        for (var cj = boundaryIndex + 1; cj < investigationItems.length; cj++) {
          var nextFloor = investigationItems[cj].querySelector('.comment-floor');
          if (nextFloor) {
            nextFloor.textContent = (231 + cj - boundaryIndex - 1) + 'L';
          }
        }
      }
    }

    // 「该帖记录 / 该帖整理」正文第一句中「(原帖)」跳转到原帖（仅处理带括号的那一处）
    if (detail.title &&
        (detail.title.indexOf('该帖记录') !== -1 || detail.title.indexOf('该帖整理') !== -1)) {
      var contentEl = detailEl.querySelector('.post-detail-content');
      if (contentEl && contentEl.innerHTML.indexOf('(原帖)') !== -1) {
        var linkStyle = 'color:#8A5A3B;text-decoration:underline;cursor:pointer;';
        contentEl.innerHTML = contentEl.innerHTML.replace('(原帖)', function () {
          return '<a href="#" class="original-post-link" style="' + linkStyle + '">(原帖)</a>';
        });
        var originalPost = null;
        var posts = Storage.getPosts();
        for (var pi = 0; pi < posts.length; pi++) {
          if (posts[pi].title.indexOf('找一部在暗网上看过的离奇动画') !== -1 &&
              posts[pi].title.indexOf('该帖记录') === -1 &&
              posts[pi].title.indexOf('该帖整理') === -1) {
            originalPost = posts[pi];
            break;
          }
        }
        if (originalPost) {
          contentEl.querySelectorAll('.original-post-link').forEach(function (link) {
            link.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              App.showPostDetail(originalPost.id);
              window.scrollTo(0, 0);
            });
          });
        }
      }
    }

    // 「旧帖补充」正文中的「帖子」跳转到原帖（仅转换"抱歉我是这篇帖子"那一处）
    if (detail.title &&
               detail.title.indexOf('旧帖补充') !== -1 &&
               detail.title.indexOf('暗网动画') !== -1) {
      var supplementContentEl = detailEl.querySelector('.post-detail-content');
      if (supplementContentEl && supplementContentEl.innerHTML.indexOf('帖子') !== -1) {
        var supplementStyle = 'color:#8A5A3B;text-decoration:underline;cursor:pointer;';
        supplementContentEl.innerHTML = supplementContentEl.innerHTML.replace('帖子', function () {
          return '<a href="#" class="original-post-link" style="' + supplementStyle + '">帖子</a>';
        });
        var supplementOriginal = null;
        var supplementPosts = Storage.getPosts();
        for (var si = 0; si < supplementPosts.length; si++) {
          if (supplementPosts[si].title.indexOf('找一部在暗网上看过的离奇动画') !== -1 &&
              supplementPosts[si].title.indexOf('该帖记录') === -1 &&
              supplementPosts[si].title.indexOf('该帖整理') === -1) {
            supplementOriginal = supplementPosts[si];
            break;
          }
        }
        if (supplementOriginal) {
          supplementContentEl.querySelectorAll('.original-post-link').forEach(function (link) {
            link.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              App.showPostDetail(supplementOriginal.id);
              window.scrollTo(0, 0);
            });
          });
        }
      }
    }

    // 「调查进展」正文中的「整理帖 / 整理贴」跳转到整理帖
    if (detail.title &&
        detail.title.indexOf('调查进展') !== -1 &&
        detail.title.indexOf('暗网动画') !== -1) {
      var investigationContentEl = detailEl.querySelector('.post-detail-content');
      if (investigationContentEl && /整理[帖贴]/.test(investigationContentEl.innerHTML)) {
        var investigationStyle = 'color:#8A5A3B;text-decoration:underline;cursor:pointer;';
        investigationContentEl.innerHTML = investigationContentEl.innerHTML.replace(
          /整理[帖贴]/g,
          function (matched) {
            return '<a href="#" class="original-post-link" style="' + investigationStyle + '">' + matched + '</a>';
          }
        );
        var investigationTarget = null;
        var investigationPosts = Storage.getPosts();
        for (var ii = 0; ii < investigationPosts.length; ii++) {
          if (investigationPosts[ii].title.indexOf('找一部在暗网上看过的离奇动画') !== -1 &&
              investigationPosts[ii].title.indexOf('该帖整理') !== -1) {
            investigationTarget = investigationPosts[ii];
            break;
          }
        }
        if (investigationTarget) {
          investigationContentEl.querySelectorAll('.original-post-link').forEach(function (link) {
            link.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              App.showPostDetail(investigationTarget.id);
              window.scrollTo(0, 0);
            });
          });
        }
      }
    }

    var inputAvatar = detailEl.querySelector('.comment-input .avatar-small');
    var user = Auth.getCurrentUser();
    if (user) bindAvatar(inputAvatar, user.id);
  };

  // ========== 通讯台入口（右上原「私信」按钮已移除） ==========
  var origUpdateNavbar = App.updateNavbar;
  App.updateNavbar = function () {
    origUpdateNavbar.call(this);
    refreshMessageBadge();
  };

  // 获取与某人的全部私聊消息（按时间正序）
  function getConversation(otherId) {
    var me = Auth.getCurrentUser();
    if (!me) return [];
    return getMessages().filter(function (msg) {
      return (msg.fromId === me.id && msg.toId === otherId) ||
             (msg.fromId === otherId && msg.toId === me.id);
    }).sort(function (a, b) {
      return a.createdAt - b.createdAt;
    });
  }

  // 发送私聊消息（供通讯台右侧聊天面板使用）
  function sendTo(otherId, content) {
    var me = Auth.getCurrentUser();
    if (!me) {
      App.showLoginModal();
      return false;
    }
    var text = (content || '').trim();
    if (!text) return false;

    var messages = getMessages();
    messages.push({
      id: Storage.generateId(),
      fromId: me.id,
      toId: otherId,
      content: text,
      createdAt: Date.now(),
      read: false
    });
    saveMessages(messages);
    return true;
  }

  function markConversationRead(otherId) {
    var me = Auth.getCurrentUser();
    if (!me) return;
    markRead(otherId, me.id);
  }

  // 对外提供聊天相关能力，供通讯台调用
  window.SocialChat = {
    openChat: openChat,
    openInbox: openInbox,
    getMessages: getMessages,
    getConversation: getConversation,
    sendTo: sendTo,
    markRead: markConversationRead,
    unreadCount: unreadCount,
    refreshBadge: refreshMessageBadge,
    displayName: displayName
  };
})();
