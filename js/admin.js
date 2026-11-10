/**
 * 管理员功能
 * 登录「论坛管理组」后可置顶、封贴、删帖
 */
(function () {
  function isAdmin() {
    var user = Auth.getCurrentUser();
    return !!(user && (
      user.role === 'admin' ||
      user.username === '论坛管理组' ||
      user.username === '论坛管理员'
    ));
  }

  // 置顶帖子排在列表最前
  var origGetList = Posts.getList.bind(Posts);
  Posts.getList = function () {
    return origGetList().slice().sort(function (a, b) {
      return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    });
  };

  var origSearch = Posts.search.bind(Posts);
  Posts.search = function (keyword) {
    return origSearch(keyword).slice().sort(function (a, b) {
      return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    });
  };

  // 封贴后不允许点赞
  var origToggleLike = Posts.toggleLike.bind(Posts);
  Posts.toggleLike = async function (id) {
    var post = Storage.getPostById(id);
    if (post && post.locked) {
      return { success: false, message: '该帖已被封贴' };
    }
    return await origToggleLike(id);
  };

  // ========== 通用操作 ==========
  async function togglePin(id) {
    var post = Storage.getPostById(id);
    if (!post) return;
    var wasPinned = !!post.pinned;
    await Storage.updatePost(id, { pinned: !wasPinned });
    App.showToast(wasPinned ? '已取消置顶' : '帖子已置顶', 'success');
    refreshView(id);
  }

  async function toggleLock(id) {
    var post = Storage.getPostById(id);
    if (!post) return;
    var wasLocked = !!post.locked;
    await Storage.updatePost(id, { locked: !wasLocked });
    App.showToast(wasLocked ? '已解除封贴' : '帖子已封贴', 'success');
    refreshView(id);
  }

  async function deletePost(id) {
    if (!confirm('确定要删除这篇帖子吗？此操作不可恢复。')) return;
    await Storage.deletePost(id);
    App.showToast('帖子已删除', 'success');
    goHome();
  }

  function refreshView(id) {
    var detail = document.querySelector('.post-detail');
    if (detail) {
      App.showPostDetail(id);
    } else {
      App.render();
    }
  }

  function goHome() {
    App.currentView = 'home';
    App.currentPostId = null;
    var area = document.getElementById('content-area');
    if (area) area.innerHTML = '<div id="post-list-container"></div>';
    App.updateActiveNav('home');
    App.render();
  }

  // ========== 评论管理（编辑 / 删除，仅管理员） ==========
  function startEditComment(item, commentId, postId) {
    if (item.querySelector('.comment-edit-box')) {
      item.querySelector('.comment-edit-textarea').focus();
      return;
    }

    var contentEl = item.querySelector('.comment-content');
    if (!contentEl) return;
    var original = contentEl.textContent || '';

    var comment = Storage.getComments().find(function (x) { return x.id === commentId; });
    var editImages = (comment && comment.images ? comment.images.slice() : []);

    var box = document.createElement('div');
    box.className = 'comment-edit-box';

    var textarea = document.createElement('textarea');
    textarea.className = 'comment-edit-textarea';
    textarea.value = original;

    var previews = document.createElement('div');
    previews.className = 'comment-image-previews';

    var toolbar = document.createElement('div');
    toolbar.className = 'comment-edit-toolbar';

    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'comment-image-btn';
    addBtn.textContent = '📷 添加图片';

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';

    var spacer = document.createElement('span');
    spacer.style.flex = '1';

    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'admin-action';
    saveBtn.textContent = '保存';

    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'admin-action';
    cancelBtn.textContent = '取消';

    toolbar.appendChild(addBtn);
    toolbar.appendChild(fileInput);
    toolbar.appendChild(spacer);
    toolbar.appendChild(saveBtn);
    toolbar.appendChild(cancelBtn);
    box.appendChild(textarea);
    box.appendChild(previews);
    box.appendChild(toolbar);
    item.appendChild(box);

    contentEl.style.display = 'none';
    textarea.focus();

    function renderPreviews() {
      previews.innerHTML = editImages.map(function (src, i) {
        return '<div class="comment-image-preview">' +
          '<img src="' + src + '" alt="">' +
          '<button type="button" class="comment-image-remove" data-index="' + i + '">✕</button>' +
        '</div>';
      }).join('');
      previews.querySelectorAll('.comment-image-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
          editImages.splice(parseInt(btn.dataset.index, 10), 1);
          renderPreviews();
        });
      });
    }

    function addFiles(fileList) {
      var files = Array.prototype.slice.call(fileList || []).filter(function (f) {
        return f.type && f.type.indexOf('image/') === 0;
      });
      if (!files.length) return;
      var room = 6 - editImages.length;
      if (room <= 0) {
        App.showToast('最多添加 6 张图片', 'error');
        return;
      }
      files.slice(0, room).forEach(function (file) {
        App.fileToImageDataUrl(file, 1000).then(function (dataUrl) {
          editImages.push(dataUrl);
          renderPreviews();
        }).catch(function () {
          App.showToast('图片读取失败', 'error');
        });
      });
    }

    renderPreviews();

    addBtn.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      addFiles(fileInput.files);
      fileInput.value = '';
    });

    box.addEventListener('dragover', function (e) {
      e.preventDefault();
      box.classList.add('dragover');
    });
    box.addEventListener('dragleave', function (e) {
      if (!box.contains(e.relatedTarget)) box.classList.remove('dragover');
    });
    box.addEventListener('drop', function (e) {
      e.preventDefault();
      box.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });

    function close() {
      contentEl.style.display = '';
      box.remove();
    }

    cancelBtn.addEventListener('click', close);

    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    saveBtn.addEventListener('click', async function () {
      try {
        var value = textarea.value.trim();
        if (!value && editImages.length === 0) {
          App.showToast('评论内容不能为空', 'error');
          return;
        }

        var ok = false;
        try {
          ok = await Storage.updateComment(commentId, value, editImages);
        } catch (e) {
          // 兜底：若 Storage.updateComment 不可用或写入异常，直接走原始数据接口
          console.warn('[评论编辑] updateComment 异常，尝试兜底写入', e);
          var all = Storage.getComments();
          var target = null;
          for (var i = 0; i < all.length; i++) {
            if (all[i].id === commentId) { target = all[i]; break; }
          }
          if (!target) {
            App.showToast('评论不存在，请刷新后重试', 'error');
            return;
          }
          target.content = value;
          target.images = editImages.slice();
          await Storage.saveComments(all);
          ok = true;
        }

        if (!ok) {
          App.showToast('评论不存在，请刷新后重试', 'error');
          return;
        }

        App.showToast('评论已更新', 'success');
        App.showPostDetail(postId);
      } catch (err) {
        console.error('[评论编辑] 保存失败', err);
        var msg = err && err.message ? err.message : '未知错误';
        if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
          msg = '本地存储空间不足，请减少图片数量或尺寸';
        }
        App.showToast('保存失败：' + msg, 'error');
      }
    });
  }

  async function deleteComment(commentId, postId) {
    if (!confirm('确定要删除这条评论吗？此操作不可恢复。')) return;
    var result = await Storage.deleteComment(commentId);
    if (!result) {
      App.showToast('评论不存在', 'error');
      return;
    }
    App.showToast('评论已删除', 'success');
    App.showPostDetail(postId);
  }

  function decorateComments(postId) {
    if (!isAdmin()) return;
    var items = document.querySelectorAll('.comments-section .comment-item');
    items.forEach(function (item) {
      var commentId = item.getAttribute('data-comment-id');
      if (!commentId) return;
      if (item.querySelector('.comment-admin-actions')) return;

      var meta = item.querySelector('.comment-meta');
      if (!meta) return;

      var box = document.createElement('div');
      box.className = 'comment-admin-actions';

      var editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'comment-admin-edit';
      editBtn.textContent = '编辑';
      editBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        startEditComment(item, commentId, postId);
      });

      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'comment-admin-delete';
      delBtn.textContent = '删除';
      delBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        deleteComment(commentId, postId);
      });

      box.appendChild(editBtn);
      box.appendChild(delBtn);
      meta.appendChild(box);
    });
  }

  // ========== 管理按钮 ==========
  function makeAdminBar(post) {
    var bar = document.createElement('div');
    bar.className = 'admin-actions';
    bar.innerHTML =
      '<button class="admin-action" data-act="pin">' +
        (post.pinned ? '取消置顶' : '▲ 置顶') +
      '</button>' +
      '<button class="admin-action" data-act="lock">' +
        (post.locked ? '解除封贴' : '◼ 封贴') +
      '</button>' +
      '<button class="admin-action danger" data-act="delete">✕ 删帖</button>';

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.admin-action');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();

      if (btn.dataset.act === 'pin') togglePin(post.id);
      if (btn.dataset.act === 'lock') toggleLock(post.id);
      if (btn.dataset.act === 'delete') deletePost(post.id);
    });

    return bar;
  }

  function addFlags(container, post, beforeEl) {
    var html = '';
    if (post.pinned) html += '<span class="post-flag">▲ 置顶</span>';
    if (post.locked) html += '<span class="post-flag locked">◼ 封贴</span>';
    if (!html) return;

    var flags = document.createElement('div');
    flags.className = 'post-flags';
    flags.innerHTML = html;

    if (beforeEl && beforeEl.parentNode === container) {
      container.insertBefore(flags, beforeEl);
    } else {
      container.insertBefore(flags, container.firstChild);
    }
  }

  function decorateList() {
    var items = document.querySelectorAll('#post-list-container .post-item');
    items.forEach(function (item) {
      var post = Storage.getPostById(item.dataset.postId);
      if (!post) return;

      addFlags(item, post, item.querySelector('.post-title'));

      if (isAdmin() && !item.querySelector('.admin-actions')) {
        item.appendChild(makeAdminBar(post));
      }
    });
  }

  // 渲染列表后补充标识与管理按钮，并修复详情页返回后的容器
  var origRenderPostList = App.renderPostList;
  App.renderPostList = function () {
    var area = document.getElementById('content-area');
    if (area && !document.getElementById('post-list-container')) {
      area.innerHTML = '<div id="post-list-container"></div>';
    }
    origRenderPostList.call(this);
    decorateList();
  };

  // 详情页补充标识、固定状态与管理员操作
  var origShowPostDetail = App.showPostDetail;
  App.showPostDetail = function (postId) {
    origShowPostDetail.call(this, postId);

    var post = Storage.getPostById(postId);
    if (!post) return;

    var header = document.querySelector('.post-detail-header');
    var title = document.querySelector('.post-detail-title');
    if (header && title) addFlags(header, post, title);

    if (post.locked) applyLockedUI(post);

    if (isAdmin()) {
      var actions = document.querySelector('.post-detail-actions');
      if (actions && !actions.querySelector('.admin-actions')) {
        actions.appendChild(makeAdminBar(post));
      }
      decorateComments(postId);
    }
  };

  function applyLockedUI(post) {
    var section = document.querySelector('.comments-section');
    if (section) {
      var input = section.querySelector('.comment-input');
      if (input) input.remove();

      if (!section.querySelector('.admin-note')) {
        var note = document.createElement('div');
        note.className = 'admin-note';
        note.textContent = '该帖已被封贴，无法继续评论或点赞。';
        var heading = section.querySelector('.comments-title');
        section.insertBefore(note, heading || section.firstChild);
      }
    }

    var likeBtn = document.getElementById('detail-like-btn');
    if (likeBtn) {
      likeBtn.disabled = true;
      likeBtn.style.opacity = '0.55';
      likeBtn.style.cursor = 'not-allowed';
      likeBtn.textContent = '◼ 已封贴 · ' + (post.likeCount || 0);
    }
  }
})();
