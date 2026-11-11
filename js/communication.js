/**
 * 用户关注 + 通讯台（群聊 / 私聊）
 */
(function () {
  var FOLLOW_KEY = 'survivorUserFollows_v1';
  var GROUP_KEY = 'survivorGroupChats_v1';
  var GROUP_MSG_KEY = 'survivorGroupMessages_v1';
  var GROUP_READ_KEY = 'survivorGroupReads_v1';

  // ==================== 用户关注 ====================
  function getFollows() {
    return Storage.get(FOLLOW_KEY) || [];
  }

  function saveFollows(list) {
    Storage.set(FOLLOW_KEY, list);
  }

  var UserFollow = {
    isFollowing(followerId, targetId) {
      if (!followerId || !targetId) return false;
      return getFollows().some(function (f) {
        return f.followerId === followerId && f.followingId === targetId;
      });
    },

    toggle(followerId, targetId) {
      var list = getFollows();
      var index = -1;
      for (var i = 0; i < list.length; i++) {
        if (list[i].followerId === followerId && list[i].followingId === targetId) {
          index = i;
          break;
        }
      }
      if (index > -1) {
        list.splice(index, 1);
        saveFollows(list);
        return false;
      }
      list.push({ followerId: followerId, followingId: targetId, createdAt: Date.now() });
      saveFollows(list);
      return true;
    },

    countFollowers(userId) {
      return getFollows().filter(function (f) { return f.followingId === userId; }).length;
    },

    countFollowing(userId) {
      return getFollows().filter(function (f) { return f.followerId === userId; }).length;
    },

    listFollowing(userId) {
      return getFollows()
        .filter(function (f) { return f.followerId === userId; })
        .map(function (f) { return Storage.findUserById(f.followingId); })
        .filter(Boolean);
    },

    listFollowers(userId) {
      return getFollows()
        .filter(function (f) { return f.followingId === userId; })
        .map(function (f) { return Storage.findUserById(f.followerId); })
        .filter(Boolean);
    }
  };

  window.UserFollow = UserFollow;

  // ==================== 通讯台数据 ====================
  function getGroups() {
    return Storage.get(GROUP_KEY) || [];
  }

  // 当前打开的会话，用于别人发来新消息时原地刷新
  var activeGroupId = null;
  var activeUserId = null;

  function saveGroups(groups) {
    Storage.set(GROUP_KEY, groups);
  }

  function getGroupMessages() {
    return Storage.get(GROUP_MSG_KEY) || [];
  }

  function saveGroupMessages(messages) {
    Storage.set(GROUP_MSG_KEY, messages);
  }

  function getReadMap() {
    return Storage.get(GROUP_READ_KEY) || {};
  }

  function markGroupRead(userId, groupId) {
    var map = getReadMap();
    if (!map[userId]) map[userId] = {};
    map[userId][groupId] = Date.now();
    Storage.set(GROUP_READ_KEY, map);
  }

  function groupUnread(user, group) {
    var map = getReadMap();
    var since = (map[user.id] && map[user.id][group.id]) || 0;
    return getGroupMessages().filter(function (msg) {
      return msg.groupId === group.id && msg.fromId !== user.id && msg.createdAt > since;
    }).length;
  }

  function totalGroupUnread(userId) {
    var user = Storage.findUserById(userId);
    if (!user) return 0;
    return myGroups(user).reduce(function (sum, group) {
      return sum + groupUnread(user, group);
    }, 0);
  }

  // 供右上角红点统计使用
  window.GroupChat = {
    unreadCount: totalGroupUnread
  };

  function displayName(user) {
    if (!user) return '已注销用户';
    return user.nickname || user.username || '无用户名账号';
  }

  function initialOf(user) {
    var name = displayName(user);
    return name.charAt(0).toUpperCase();
  }

  function myGroups(user) {
    return getGroups().filter(function (g) {
      return g.memberIds.indexOf(user.id) !== -1;
    }).sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });
  }

  // ==================== 通讯台入口 ====================
  var origRenderSidebar = App.renderSidebar;
  App.renderSidebar = function () {
    origRenderSidebar.apply(this, arguments);

    var sidebar = document.getElementById('sidebar-right');
    if (!sidebar) return;

    var card = document.createElement('div');
    card.className = 'right-card console-card';
    card.innerHTML =
      '<div class="right-card-title">✉ 通讯台</div>' +
      '<div class="console-entry" id="console-entry" role="button" tabindex="0">' +
        '<span class="console-entry-icon">✉</span>' +
        '<span class="console-entry-text">群聊 / 私聊</span>' +
        '<span class="msg-dot" id="msg-dot"></span>' +
      '</div>';

    sidebar.appendChild(card);

    var entry = card.querySelector('#console-entry');
    if (entry) {
      entry.addEventListener('click', openConsole);
      entry.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openConsole();
        }
      });
    }

    if (window.SocialChat) SocialChat.refreshBadge();
  };

  // ==================== 通讯台主界面 ====================
  function openConsole() {
    var me = Auth.getCurrentUser();
    if (!me) {
      App.showLoginModal();
      App.showToast('请先登录后再使用通讯台', 'error');
      return;
    }

    App.closeModal();
    App.showModal(
      '<div class="modal console-modal">' +
        '<div class="modal-header">' +
          '<div class="modal-title">通讯台</div>' +
          '<button class="modal-close" onclick="App.closeModal()">✕</button>' +
        '</div>' +
        '<div class="modal-body console-body">' +
          '<div class="console-layout">' +
            '<aside class="console-side">' +
              '<div class="console-lists" id="console-lists">' +
                '<section class="console-section">' +
                  '<div class="console-section-head">' +
                    '<span>群聊</span>' +
                    '<button type="button" class="console-new" id="console-new-group">＋ 发起群聊</button>' +
                  '</div>' +
                  '<div class="console-list" id="console-group-list"></div>' +
                '</section>' +
                '<section class="console-section">' +
                  '<div class="console-section-head"><span>私聊</span></div>' +
                  '<div class="console-list" id="console-private-list"></div>' +
                '</section>' +
              '</div>' +
            '</aside>' +
            '<section class="console-main" id="console-main"></section>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn-secondary" onclick="App.closeModal()">退出</button>' +
        '</div>' +
      '</div>'
    );

    renderConsoleLists(me);
    renderConsoleEmpty();

    var lists = document.getElementById('console-lists');
    if (lists) {
      lists.addEventListener('click', function (e) {
        var item = e.target.closest('.convo-item');
        if (!item) return;
        if (item.dataset.groupId) openGroupPanel(item.dataset.groupId);
        else if (item.dataset.userId) openPrivatePanel(item.dataset.userId);
      });
    }

    var newGroupBtn = document.getElementById('console-new-group');
    if (newGroupBtn) {
      newGroupBtn.addEventListener('click', openGroupPicker);
    }

    if (window.SocialChat) SocialChat.refreshBadge();
  }

  function renderConsoleEmpty() {
    var main = document.getElementById('console-main');
    if (!main) return;
    activeGroupId = null;
    activeUserId = null;
    main.innerHTML =
      '<div class="console-main-empty">' +
        '<div class="console-empty-icon">✉</div>' +
        '<div>选择左侧的群聊或私聊开始聊天</div>' +
      '</div>';
  }

  function renderConsoleLists(me) {
    var groupListEl = document.getElementById('console-group-list');
    var privateListEl = document.getElementById('console-private-list');
    if (!groupListEl || !privateListEl) return;

    var groups = myGroups(me);
    if (groups.length === 0) {
      groupListEl.innerHTML = '<div class="console-empty">还没有群聊，点击右上角发起一个吧</div>';
    } else {
      groupListEl.innerHTML = groups.map(function (group) {
        var messages = getGroupMessages()
          .filter(function (m) { return m.groupId === group.id; })
          .sort(function (a, b) { return a.createdAt - b.createdAt; });
        var last = messages[messages.length - 1];
        var preview = last
          ? (last.fromId === me.id ? '我：' : '') + last.content
          : '暂无消息';
        var unread = groupUnread(me, group);

        return '<div class="convo-item" data-group-id="' + App.escapeHtml(group.id) + '">' +
          '<div class="avatar-small group-avatar">群</div>' +
          '<div class="convo-main">' +
            '<div class="convo-top">' +
              '<span class="convo-name">' + App.escapeHtml(group.name) + '</span>' +
              '<span class="group-member-count">' + group.memberIds.length + ' 人</span>' +
              (unread > 0 ? '<span class="convo-unread">' + unread + '</span>' : '') +
            '</div>' +
            '<div class="convo-preview">' + App.escapeHtml(preview) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    var privateConvos = getPrivateConversations(me);
    if (privateConvos.length === 0) {
      privateListEl.innerHTML = '<div class="console-empty">暂无私聊消息</div>';
    } else {
      privateListEl.innerHTML = privateConvos.map(function (item) {
        var other = item.user;
        var count = item.unread;
        var preview = item.last.fromId === me.id ? '我：' + item.last.content : item.last.content;

        return '<div class="convo-item" data-user-id="' + App.escapeHtml(other.id) + '">' +
          '<div class="avatar-small" style="background:' + App.avatarBg(other.avatarColor, other.avatarImage) + '">' +
            App.avatarInnerHtml(other.avatarColor, displayName(other), other.avatarImage) +
          '</div>' +
          '<div class="convo-main">' +
            '<div class="convo-top">' +
              '<span class="convo-name">' + App.escapeHtml(displayName(other)) + '</span>' +
              (count > 0 ? '<span class="convo-unread">' + count + '</span>' : '') +
            '</div>' +
            '<div class="convo-preview">' + App.escapeHtml(preview) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  function getPrivateConversations(me) {
    if (!window.SocialChat) return [];

    var latest = {};
    var unread = {};

    SocialChat.getMessages().forEach(function (msg) {
      if (msg.fromId !== me.id && msg.toId !== me.id) return;
      var otherId = msg.fromId === me.id ? msg.toId : msg.fromId;
      if (!otherId || otherId === me.id) return;

      if (!latest[otherId] || latest[otherId].createdAt < msg.createdAt) {
        latest[otherId] = msg;
      }
      if (msg.toId === me.id && msg.fromId !== me.id && !msg.read) {
        unread[otherId] = (unread[otherId] || 0) + 1;
      }
    });

    return Object.keys(latest).map(function (otherId) {
      var other = Storage.findUserById(otherId);
      if (!other) return null;
      return { user: other, last: latest[otherId], unread: unread[otherId] || 0 };
    }).filter(Boolean).sort(function (a, b) {
      return b.last.createdAt - a.last.createdAt;
    });
  }

  // ==================== 右侧聊天面板 ====================
  function messagesHtml(messages, me, showSender, ownerId) {
    if (messages.length === 0) {
      return '<div class="chat-empty">还没有消息，说点什么吧</div>';
    }
    return messages.map(function (msg) {
      if (msg.system) {
        return '<div class="chat-system">' + App.escapeHtml(msg.content) + '</div>';
      }
      var mine = msg.fromId === me.id;
      var sender = Storage.findUserById(msg.fromId);
      var ownerTag = (ownerId && sender && sender.id === ownerId)
        ? '<span class="group-owner-tag">群主</span>'
        : '';
      return '<div class="chat-row ' + (mine ? 'mine' : 'other') + '">' +
        (showSender && !mine
          ? '<div class="chat-sender">' + App.escapeHtml(msg.senderName || displayName(sender)) + ownerTag + '</div>'
          : '') +
        '<div class="chat-bubble">' + App.escapeHtml(msg.content) + '</div>' +
        '<div class="chat-time">' + Posts.formatTime(msg.createdAt) + '</div>' +
      '</div>';
    }).join('');
  }

  function bindChatPanel(main, onSend) {
    var input = document.getElementById('console-chat-input');
    var sendBtn = document.getElementById('console-chat-send');

    var box = document.getElementById('console-chat-messages');
    if (box) box.scrollTop = box.scrollHeight;

    if (sendBtn) sendBtn.addEventListener('click', onSend);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSend();
        }
      });
      input.focus();
    }
  }

  function chatPanelHtml(headHtml, rowsHtml, readOnly) {
    return '<div class="console-chat-head">' + headHtml + '</div>' +
      '<div class="chat-messages console-chat-messages" id="console-chat-messages">' + rowsHtml + '</div>' +
      (readOnly
        ? '<div class="chat-readonly-note">你不在该群聊中，仅可查看消息</div>'
        : '<div class="chat-footer console-chat-footer">' +
            '<textarea id="console-chat-input" placeholder="输入消息..."></textarea>' +
            '<button class="btn-primary" id="console-chat-send">发送</button>' +
          '</div>');
  }

  function openPrivatePanel(userId) {
    var me = Auth.getCurrentUser();
    if (!me) {
      App.showLoginModal();
      return;
    }
    var other = Storage.findUserById(userId);
    if (!other) {
      App.showToast('用户不存在', 'error');
      return;
    }

    if (window.SocialChat) SocialChat.markRead(userId);
    renderPrivatePanel(other);
    renderConsoleLists(me);
    if (window.SocialChat) SocialChat.refreshBadge();
  }

  function renderPrivatePanel(other) {
    var me = Auth.getCurrentUser();
    var main = document.getElementById('console-main');
    if (!main) return;
    activeUserId = other.id; activeGroupId = null;

    var messages = window.SocialChat ? SocialChat.getConversation(other.id) : [];
    var head =
      '<div class="avatar-small" style="background:' + App.avatarBg(other.avatarColor, other.avatarImage) + '">' +
        App.avatarInnerHtml(other.avatarColor, displayName(other), other.avatarImage) +
      '</div>' +
      '<div class="console-chat-title">' +
        '<div class="modal-title">' + App.escapeHtml(displayName(other)) + '</div>' +
      '</div>';

    main.innerHTML = chatPanelHtml(head, messagesHtml(messages, me, false));

    bindChatPanel(main, function () {
      var input = document.getElementById('console-chat-input');
      var content = input ? input.value.trim() : '';
      if (!content) {
        App.showToast('请输入消息内容', 'error');
        return;
      }
      if (window.SocialChat) SocialChat.sendTo(other.id, content);
      renderPrivatePanel(other);
      renderConsoleLists(me);
    });
  }

  function openGroupPanel(groupId) {
    var me = Auth.getCurrentUser();
    if (!me) {
      App.showLoginModal();
      return;
    }

    var group = getGroups().filter(function (g) {
      return g.id === groupId && g.memberIds.indexOf(me.id) !== -1;
    })[0];

    if (!group) {
      App.showToast('群聊不存在', 'error');
      return;
    }

    markGroupRead(me.id, group.id);
    renderGroupPanel(group, me);
    renderConsoleLists(me);
    if (window.SocialChat) SocialChat.refreshBadge();
  }

  function openGroupByName(name) {
    var me = Auth.getCurrentUser();
    if (!me) {
      App.showLoginModal();
      App.showToast('请先登录后再查看群聊', 'error');
      return;
    }

    var groups = getGroups();
    var group = groups.filter(function (g) { return g.name === name; })[0] ||
                groups.filter(function (g) { return g.name && g.name.indexOf(name) !== -1; })[0];
    if (!group) {
      App.showToast('群聊不存在', 'error');
      return;
    }

    var isMember = group.memberIds.indexOf(me.id) !== -1;
    openConsole();
    if (isMember) markGroupRead(me.id, group.id);
    renderGroupPanel(group, me, !isMember);
    renderConsoleLists(me);
    if (isMember && window.SocialChat) SocialChat.refreshBadge();
  }

  function renderGroupPanel(group, me, readOnly) {
    var main = document.getElementById('console-main');
    if (!main) return;
    activeGroupId = group.id; activeUserId = null;

    var messages = getGroupMessages()
      .filter(function (m) { return m.groupId === group.id; })
      .sort(function (a, b) { return a.createdAt - b.createdAt; });

    var head =
      '<div class="avatar-small group-avatar">群</div>' +
      '<div class="console-chat-title">' +
        '<div class="modal-title">' + App.escapeHtml(group.name) + '</div>' +
        '<div class="group-member-count">' + group.memberIds.length + ' 人</div>' +
      '</div>';

    main.innerHTML = chatPanelHtml(head, messagesHtml(messages, me, true, group.ownerId), readOnly);

    if (readOnly) return;

    bindChatPanel(main, function () {
      var input = document.getElementById('console-chat-input');
      var content = input ? input.value.trim() : '';
      if (!content) {
        App.showToast('请输入消息内容', 'error');
        return;
      }

      var all = getGroupMessages();
      all.push({
        id: Storage.generateId(),
        groupId: group.id,
        fromId: me.id,
        content: content,
        createdAt: Date.now()
      });
      saveGroupMessages(all);

      renderGroupPanel(group, me);
      renderConsoleLists(me);
    });
  }

  // ==================== 创建群聊 ====================
  function openGroupPicker() {
    var me = Auth.getCurrentUser();
    if (!me) {
      App.showLoginModal();
      return;
    }

    var following = UserFollow.listFollowing(me.id);
    var followers = UserFollow.listFollowers(me.id);
    var candidates = [];
    var seen = {};
    following.concat(followers).forEach(function (user) {
      if (!user || user.id === me.id || seen[user.id]) return;
      seen[user.id] = true;
      candidates.push(user);
    });

    if (candidates.length === 0) {
      App.showToast('暂无可邀请的联系人，请先关注其他用户', 'error');
      return;
    }

    var listHtml = candidates.map(function (user) {
      return '<label class="group-pick-item">' +
        '<input type="checkbox" class="group-pick-check" value="' + App.escapeHtml(user.id) + '">' +
        '<span class="avatar-small" style="background:' + App.avatarBg(user.avatarColor, user.avatarImage) + '">' +
          App.avatarInnerHtml(user.avatarColor, displayName(user), user.avatarImage) +
        '</span>' +
        '<span class="group-pick-name">' + App.escapeHtml(displayName(user)) + '</span>' +
      '</label>';
    }).join('');

    App.closeModal();
    App.showModal(
      '<div class="modal group-picker-modal">' +
        '<div class="modal-header">' +
          '<div class="modal-title">发起群聊</div>' +
          '<button class="modal-close" onclick="App.closeModal()">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="form-group">' +
            '<label>群聊名称（可选）</label>' +
            '<input type="text" id="group-name-input" placeholder="不填则自动使用成员名字" maxlength="24">' +
          '</div>' +
          '<div class="group-pick-title">选择成员</div>' +
          '<div class="group-pick-list">' + listHtml + '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn-secondary" id="group-pick-cancel">取消</button>' +
          '<button class="btn-primary" id="group-pick-create">创建群聊</button>' +
        '</div>' +
      '</div>'
    );

    document.getElementById('group-pick-cancel').addEventListener('click', openConsole);

    document.getElementById('group-pick-create').addEventListener('click', function () {
      var checked = Array.prototype.slice.call(
        document.querySelectorAll('.group-pick-check:checked')
      ).map(function (input) { return input.value; });

      if (checked.length === 0) {
        App.showToast('请至少选择一位成员', 'error');
        return;
      }

      var nameInput = document.getElementById('group-name-input');
      var name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        var picked = checked.map(function (id) {
          var u = Storage.findUserById(id);
          return u ? displayName(u) : '';
        }).filter(Boolean);
        name = picked.slice(0, 3).join('、') + (picked.length > 3 ? '…' : '');
      }
      if (!name) name = '群聊';

      var group = {
        id: Storage.generateId(),
        name: name,
        ownerId: me.id,
        memberIds: [me.id].concat(checked),
        createdAt: Date.now()
      };

      var groups = getGroups();
      groups.push(group);
      saveGroups(groups);

      openConsole();
      openGroupPanel(group.id);
      App.showToast('群聊已创建', 'success');
    });
  }

  if (window.SocialChat) {
    window.SocialChat.openGroupByName = openGroupByName;
  }

  // 云端同步到新消息时，原地刷新通讯台（不打断正在输入的文字）
  document.addEventListener('storage:synced', function () {
    var me = Auth.getCurrentUser();
    if (!me) return;
    if (!document.getElementById('console-lists')) return;

    renderConsoleLists(me);

    var box = document.getElementById('console-chat-messages');
    if (!box) return;

    if (activeGroupId) {
      var group = getGroups().filter(function (g) {
        return g.id === activeGroupId && g.memberIds.indexOf(me.id) !== -1;
      })[0];
      if (!group) return;
      var messages = getGroupMessages()
        .filter(function (m) { return m.groupId === group.id; })
        .sort(function (a, b) { return a.createdAt - b.createdAt; });
      box.innerHTML = messagesHtml(messages, me, true, group.ownerId);
      box.scrollTop = box.scrollHeight;
    } else if (activeUserId) {
      var other = Storage.findUserById(activeUserId);
      if (!other) return;
      if (window.SocialChat) SocialChat.markRead(other.id);
      box.innerHTML = messagesHtml(SocialChat.getConversation(other.id), me, false);
      box.scrollTop = box.scrollHeight;
    }

    if (window.SocialChat) SocialChat.refreshBadge();
  });

  // 打开通讯台时若已在页面内，刷新左侧列表
  window.addEventListener('storage', function () {
    var lists = document.getElementById('console-lists');
    if (!lists) return;
    var me = Auth.getCurrentUser();
    if (me) renderConsoleLists(me);
    if (window.SocialChat) SocialChat.refreshBadge();
  });
})();
