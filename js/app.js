/**
 * 主应用逻辑 - UI 渲染与交互
 */

const App = {
  // 当前页面状态
  currentView: 'home',
  currentPostId: null,
  searchKeyword: '',
  currentTag: null,
  detailPostId: null, // 当前正在查看的帖子详情（用于云端同步后原地刷新）

  // ========== 初始化 ==========
  init() {
    // 等待 IndexedDB 图片存储就绪后再渲染
    Storage.ready().then(() => {
      this.bindEvents();
      this.updateNavbar();
      this.render();
    });
  },

  // ========== 事件绑定 ==========
  bindEvents() {
    // 导航按钮
    document.getElementById('nav-home').addEventListener('click', () => {
      this.currentView = 'home';
      this.currentPostId = null;
      this.currentTag = null;
      this.updateActiveNav('home');
      this.render();
    });

    document.getElementById('nav-hot').addEventListener('click', () => {
      this.currentView = 'home';
      this.currentPostId = null;
      this.currentTag = null;
      this.updateActiveNav('hot');
      this.render();
    });

    document.getElementById('nav-follow').addEventListener('click', () => {
      this.currentView = 'home';
      this.currentPostId = null;
      this.currentTag = null;
      this.updateActiveNav('follow');
      this.render();
    });

    // Logo 点击回首页
    document.querySelector('.navbar-logo').addEventListener('click', () => {
      this.currentView = 'home';
      this.currentPostId = null;
      this.currentTag = null;
      this.updateActiveNav('home');
      this.render();
    });

    // 搜索
    document.querySelector('.navbar-search input').addEventListener('input', (e) => {
      this.searchKeyword = e.target.value;
      this.renderPostList();
    });

    // 发帖按钮
    document.getElementById('btn-create-post').addEventListener('click', () => {
      if (!Auth.isLoggedIn()) {
        this.showToast('请先登录', 'error');
        this.showLoginModal();
        return;
      }
      this.showCreatePostModal();
    });

    // 登录/注册按钮
    document.getElementById('btn-login').addEventListener('click', () => this.showLoginModal());
    document.getElementById('btn-register').addEventListener('click', () => this.showRegisterModal());

    // 登出按钮
    document.getElementById('btn-logout').addEventListener('click', () => {
      Auth.logout();
      this.showToast('已登出', 'info');
      this.updateNavbar();
      this.render();
    });

    // 左侧菜单
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view === 'home' || view === 'hot' || view === 'follow') {
          this.currentView = 'home';
          this.currentPostId = null;
          this.currentTag = null;
          this.updateActiveNav(view);
          this.render();
        }
      });
    });

    // 点击模态框外部关闭
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeModal();
      }
    });
  },

  // ========== 渲染主界面 ==========
  render() {
    this.detailPostId = null;
    this.updateNavbar();
    this.renderPostList();
    this.renderSidebar();
  },

  // ========== 云端有新内容时刷新界面 ==========
  refreshFromRemote() {
    // 详情页：原地刷新，保留滚动位置；用户正在写评论时不打扰
    if (this.detailPostId) {
      const textarea = document.getElementById('comment-textarea');
      if (textarea && textarea.value.trim()) return;
      if (this._pendingCommentImages && this._pendingCommentImages.length) return;

      const scrollY = window.scrollY;
      this.showPostDetail(this.detailPostId);
      window.scrollTo(0, scrollY);
      return;
    }

    // 其他页面（地图、个人主页等）不自动刷新，避免打断操作
    if (this.currentView !== 'home') return;
    if (!document.getElementById('post-list-container')) return;

    const scrollY = window.scrollY;
    this.render();
    window.scrollTo(0, scrollY);
  },

  // ========== 更新导航栏 ==========
  updateNavbar() {
    const user = Auth.getCurrentUser();
    const userArea = document.getElementById('user-area');
    const guestArea = document.getElementById('guest-area');

    if (user) {
      userArea.style.display = 'flex';
      guestArea.style.display = 'none';
      userArea.querySelector('.user-name').textContent = user.nickname;
      const navAvatar = userArea.querySelector('.user-avatar');
      navAvatar.innerHTML = this.avatarInnerHtml(user.avatarColor, user.nickname, user.avatarImage);
      navAvatar.style.background = this.avatarBg(user.avatarColor, user.avatarImage);
    } else {
      userArea.style.display = 'none';
      guestArea.style.display = 'flex';
    }
  },

  // ========== 更新激活的导航项 ==========
  updateActiveNav(view) {
    document.querySelectorAll('.navbar-nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));

    const navBtn = document.getElementById(`nav-${view}`);
    const sidebarLi = document.querySelector(`.sidebar-menu li[data-view="${view}"]`);
    if (navBtn) navBtn.classList.add('active');
    if (sidebarLi) sidebarLi.classList.add('active');
  },

  // ========== 渲染帖子列表 ==========
  renderPostList() {
    const container = document.getElementById('post-list-container');
    if (!container) return;
    let posts = this.searchKeyword ? Posts.search(this.searchKeyword) : Posts.getList();

    // 按热门话题标签筛选
    if (this.currentTag) {
      posts = posts.filter(post => post.tags && post.tags.indexOf(this.currentTag) !== -1);
    }

    const filterBar = this.currentTag ? `
      <div class="tag-filter-bar">
        <span class="tag-filter-label">话题：<strong>${this.escapeHtml(this.currentTag)}</strong></span>
        <button class="tag-filter-clear" type="button">✕ 清除筛选</button>
      </div>
    ` : '';

    if (posts.length === 0) {
      container.innerHTML = filterBar + `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-text">${this.currentTag ? '该话题下暂无帖子' : '暂无帖子，快来发表第一条吧！'}</div>
        </div>
      `;
      this.bindTagFilterClear(container);
      return;
    }

    container.innerHTML = filterBar + `
      <div class="post-list">
        ${posts.map(post => this.renderPostItem(post)).join('')}
      </div>
    `;

    this.bindTagFilterClear(container);

    // 绑定帖子点击事件
    container.querySelectorAll('.post-item').forEach(el => {
      el.addEventListener('click', (e) => {
        // 避免点击按钮时触发
        if (e.target.closest('.post-actions')) return;
        const postId = el.dataset.postId;
        this.showPostDetail(postId);
      });
    });

    // 绑定点赞事件
    container.querySelectorAll('.btn-like').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const postId = btn.dataset.postId;
        this.handleLike(postId, btn);
      });
    });

    // 绑定删除事件
    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const postId = btn.dataset.postId;
        this.handleDeletePost(postId);
      });
    });
  },

  // ========== 渲染单个帖子项 ==========
  renderPostItem(post) {
    const user = Auth.getCurrentUser();
    const isAuthor = user && user.id === post.authorId;
    const liked = user ? Storage.hasLiked(post.id, user.id) : false;
    const author = Storage.findUserById(post.authorId);
    const avatarImage = (author && author.avatarImage) || post.authorAvatarImage || null;

    return `
      <div class="post-item" data-post-id="${post.id}">
        <div class="post-meta">
          <div class="post-author">
            <div class="avatar-small" style="background: ${this.avatarBg(post.authorAvatarColor, avatarImage)}">
              ${this.avatarInnerHtml(post.authorAvatarColor, post.authorName, avatarImage)}
            </div>
            <span class="post-author-name">${post.authorName}</span>
          </div>
          <span>·</span>
          <span>${Posts.formatTime(post.createdAt)}</span>
        </div>
        <div class="post-title">${this.escapeHtml(post.title)}</div>
        <div class="post-excerpt">${this.escapeHtml(post.content)}</div>
        ${post.tags && post.tags.length > 0 ? `
          <div class="post-tags">
            ${post.tags.map(tag => `<span class="post-tag">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
        <div class="post-actions">
          <div class="post-action btn-like ${liked ? 'liked' : ''}" data-post-id="${post.id}">
            <span>${liked ? '♥' : '♡'}</span>
            <span>${post.likeCount || 0}</span>
          </div>
          <div class="post-action">
            <span>💬</span>
            <span>${post.commentCount || 0}</span>
          </div>
          <div class="post-action">
            <span>⭐</span>
            <span>收藏</span>
          </div>
          ${isAuthor ? `
            <div class="post-action delete btn-delete" data-post-id="${post.id}">
              <span>✕</span>
              <span>删除</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // ========== 渲染右侧边栏 ==========
  renderSidebar() {
    const hotTopics = Posts.getHotTopics();
    const sidebar = document.getElementById('sidebar-right');

    if (hotTopics.length === 0) {
      sidebar.innerHTML = `
        <div class="right-card">
          <div class="right-card-title">♨ 热门话题</div>
          <div class="empty-state" style="padding: 20px;">
            <div class="empty-state-text">暂无话题数据</div>
          </div>
        </div>
      `;
      return;
    }

    sidebar.innerHTML = `
      <div class="right-card">
        <div class="right-card-title">♨ 热门话题</div>
        ${hotTopics.map((topic, i) => `
          <div class="hot-topic" data-topic-index="${i}">
            <div class="hot-rank">${i + 1}</div>
            <div>
              <div class="hot-title">${this.escapeHtml(topic.tag)}</div>
              <div class="hot-count">${topic.count} 个讨论</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // 点击话题 → 只显示带该标签的帖子
    sidebar.querySelectorAll('.hot-topic').forEach(el => {
      const index = Number(el.dataset.topicIndex);
      const tag = hotTopics[index] && hotTopics[index].tag;
      el.addEventListener('click', () => {
        if (tag) this.filterByTag(tag);
      });
    });
  },

  // ========== 按话题标签筛选帖子 ==========
  filterByTag(tag) {
    this.currentTag = tag;
    this.currentView = 'home';
    this.currentPostId = null;
    this.updateActiveNav('home');
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ========== 清除话题筛选 ==========
  clearTagFilter() {
    this.currentTag = null;
    this.render();
  },

  bindTagFilterClear(container) {
    const btn = container.querySelector('.tag-filter-clear');
    if (btn) btn.addEventListener('click', () => this.clearTagFilter());
  },

  // ========== 显示帖子详情 ==========
  showPostDetail(postId) {
    const detail = Posts.getDetail(postId);
    if (!detail) {
      this.showToast('帖子不存在', 'error');
      return;
    }

    this._pendingCommentImages = [];
    this.detailPostId = postId;
    const contentArea = document.getElementById('content-area');
    const user = Auth.getCurrentUser();
    const isAuthor = user && user.id === detail.authorId;
    const authorUser = Storage.findUserById(detail.authorId);
    const authorAvatarImage = (authorUser && authorUser.avatarImage) || detail.authorAvatarImage || null;

    contentArea.innerHTML = `
      <div class="post-detail">
        <div class="post-detail-header">
          <div class="post-meta">
            <div class="post-author">
              <div class="avatar-small" style="background: ${this.avatarBg(detail.authorAvatarColor, authorAvatarImage)}; width:32px; height:32px;">
                ${this.avatarInnerHtml(detail.authorAvatarColor, detail.authorName, authorAvatarImage)}
              </div>
              <span class="post-author-name">${detail.authorName}</span>
            </div>
            <span>·</span>
            <span>${Posts.formatTime(detail.createdAt)}</span>
          </div>
          <h1 class="post-detail-title">${this.escapeHtml(detail.title)}</h1>
        </div>

        <div class="post-detail-content">${this.escapeHtml(detail.content)}</div>

        ${detail.images && detail.images.length > 0 ? `
          <div class="post-images${detail.images.length === 1 ? ' single' : ''}">
            ${detail.images.map(src => `<img class="post-image" src="${src}" alt="帖子图片">`).join('')}
          </div>
        ` : ''}

        ${detail.tags && detail.tags.length > 0 ? `
          <div class="post-tags" style="margin-top: 20px;">
            ${detail.tags.map(tag => `<span class="post-tag">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}

        <div class="post-detail-actions">
          <button class="btn-primary" id="detail-like-btn" style="padding: 8px 24px;">
            ${detail.liked ? '👍 已点赞' : '👍 赞同'} · ${detail.likeCount || 0}
          </button>
          <button class="btn-secondary">💬 评论 (${detail.commentCount || 0})</button>
          ${isAuthor ? `<button class="btn-secondary" id="detail-delete-btn" style="color:#e74c3c; border-color:#e74c3c;">🗑️ 删除</button>` : ''}
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <div class="comments-title">评论 (${detail.comments.length})</div>

          ${user ? `
            <div class="comment-input">
              <div class="avatar-small" style="background:${this.avatarBg(user.avatarColor, user.avatarImage)}; width:40px; height:40px; font-size:16px;">
                ${this.avatarInnerHtml(user.avatarColor, user.nickname, user.avatarImage)}
              </div>
              <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
                <textarea id="comment-textarea" placeholder="写下你的评论，也可以把图片拖到这里..."></textarea>
                <div class="comment-image-previews" id="comment-image-previews"></div>
                <div class="comment-image-toolbar">
                  <button type="button" class="comment-image-btn" id="comment-image-btn">📷 添加图片</button>
                  <input type="file" id="comment-image-input" accept="image/*" multiple style="display:none">
                  <button class="btn-primary" id="submit-comment">发布评论</button>
                </div>
              </div>
            </div>
          ` : `
            <div class="comment-input">
              <div style="flex:1; padding: 12px; background:#f6f6f6; border-radius:4px; color:#8590a6; text-align:center;">
                请先 <a href="#" style="color:#0066ff;" id="comment-login-link">登录</a> 后发表评论
              </div>
            </div>
          `}

          <ul class="comment-list">
            ${detail.comments.length === 0 ? `
              <div class="empty-state" style="padding: 30px;">
                <div class="empty-state-text">暂无评论，来说点什么吧</div>
              </div>
            ` : detail.comments.map(c => `
              <li class="comment-item" data-comment-id="${c.id}">
                <div class="comment-meta">
                  ${(c.authorName && c.authorName !== '匿名用户') ? '<div class="avatar-small" style="background:' + this.avatarBg(c.authorAvatarColor, c.authorAvatarImage) + '">' + this.avatarInnerHtml(c.authorAvatarColor, c.authorName, c.authorAvatarImage) + '</div>' : ''}
                  <span style="color:#1a1a1a; font-weight:500;">${c.authorName}</span>
                  <span>${Posts.formatTime(c.createdAt)}</span>
                </div>
                <div class="comment-content">${this.renderCommentContent(c)}</div>
                ${c.images && c.images.length ? `
                  <div class="comment-images${c.images.length === 1 ? ' single' : ''}">
                    ${c.images.map(src => `<img class="comment-image" src="${src}" alt="评论图片">`).join('')}
                  </div>
                ` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;

    // 绑定返回
    window.scrollTo(0, 0);

    // 帖子图片点击放大
    contentArea.querySelectorAll('.post-image').forEach(img => {
      img.addEventListener('click', () => this.showImageViewer(img.src));
    });

    // 评论图片点击放大
    contentArea.querySelectorAll('.comment-image').forEach(img => {
      img.addEventListener('click', () => this.showImageViewer(img.src));
    });

    // 评论内帖子链接跳转
    contentArea.querySelectorAll('.comment-post-link').forEach(a => {
      a.addEventListener('click', () => {
        const pid = a.getAttribute('data-post-id');
        if (pid) this.showPostDetail(pid);
      });
    });

    // 评论图片上传
    this.setupCommentImagePicker();

    // 绑定按钮事件
    document.getElementById('detail-like-btn').addEventListener('click', () => {
      this.handleLike(detail.id, document.getElementById('detail-like-btn'));
    });

    const deleteBtn = document.getElementById('detail-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.handleDeletePost(detail.id));
    }

    const submitComment = document.getElementById('submit-comment');
    if (submitComment) {
      submitComment.addEventListener('click', async () => {
        const textarea = document.getElementById('comment-textarea');
        const content = textarea.value.trim();
        const images = this._pendingCommentImages.slice();
        if (!content && images.length === 0) {
          this.showToast('请输入评论内容或添加图片', 'error');
          return;
        }
        const result = await Posts.addComment(detail.id, content, images);
        if (result.success) {
          this.showToast(result.message, 'success');
          this._pendingCommentImages = [];
          this.showPostDetail(detail.id); // 刷新
        } else {
          this.showToast(result.message, 'error');
        }
      });
    }

    const commentLoginLink = document.getElementById('comment-login-link');
    if (commentLoginLink) {
      commentLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginModal();
      });
    }
  },

  // ========== 点赞处理 ==========
  async handleLike(postId, btn) {
    if (!Auth.isLoggedIn()) {
      this.showToast('请先登录', 'error');
      this.showLoginModal();
      return;
    }

    const result = await Posts.toggleLike(postId);
    if (result.success) {
      // 更新列表中的显示
      if (btn.dataset.postId) {
        // 列表中的按钮
        btn.classList.toggle('liked');
        btn.querySelector('span:first-child').textContent = result.liked ? '👍' : '👎';
        btn.querySelector('span:last-child').textContent = result.count;
      } else {
        // 详情页按钮
        btn.textContent = `${result.liked ? '👍 已点赞' : '👍 赞同'} · ${result.count}`;
      }
      this.showToast(result.liked ? '点赞成功' : '已取消点赞', 'info');
    } else {
      this.showToast(result.message, 'error');
    }
  },

  // ========== 删除帖子处理 ==========
  async handleDeletePost(postId) {
    if (!confirm('确定要删除这篇帖子吗？此操作不可恢复。')) return;

    const result = await Posts.delete(postId);
    if (result.success) {
      this.showToast(result.message, 'success');
      this.currentPostId = null;
      this.render();
    } else {
      this.showToast(result.message, 'error');
    }
  },

  // ========== 模态框：登录 ==========
  showLoginModal() {
    this.showModal(`
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">登录</div>
          <button class="modal-close" onclick="App.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" id="login-username" placeholder="请输入用户名">
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" id="login-password" placeholder="请输入密码">
          </div>
          <div class="form-error" id="login-error"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="App.closeModal()">取消</button>
          <button class="btn-primary" onclick="App.handleLogin()">登录</button>
        </div>
        <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #f0f0f0;">
          <span style="color: #8590a6; font-size: 13px;">还没有账号？</span>
          <a href="#" onclick="App.closeModal(); App.showRegisterModal();" style="color: #0066ff; font-size: 13px;">立即注册</a>
        </div>
      </div>
    `);
  },

  // ========== 模态框：注册 ==========
  showRegisterModal() {
    this.showModal(`
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">注册</div>
          <button class="modal-close" onclick="App.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" id="reg-username" placeholder="至少3个字符">
            <div class="form-hint">用于登录，注册后不可修改</div>
          </div>
          <div class="form-group">
            <label>昵称</label>
            <input type="text" id="reg-nickname" placeholder="显示的昵称（可选）">
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" id="reg-password" placeholder="至少6个字符">
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <input type="password" id="reg-password2" placeholder="再次输入密码">
          </div>
          <div class="form-error" id="reg-error"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="App.closeModal()">取消</button>
          <button class="btn-primary" onclick="App.handleRegister()">注册</button>
        </div>
        <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #f0f0f0;">
          <span style="color: #8590a6; font-size: 13px;">已有账号？</span>
          <a href="#" onclick="App.closeModal(); App.showLoginModal();" style="color: #0066ff; font-size: 13px;">立即登录</a>
        </div>
      </div>
    `);
  },

  // ========== 模态框：发帖 ==========
  showCreatePostModal() {
    this._pendingImages = [];
    this.showModal(`
      <div class="modal" style="width: 600px;">
        <div class="modal-header">
          <div class="modal-title">发布新帖</div>
          <button class="modal-close" onclick="App.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题</label>
            <input type="text" id="post-title" placeholder="一个好标题能吸引更多人阅读...">
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea id="post-content" placeholder="分享你的想法、经验或问题..."></textarea>
          </div>
          <div class="form-group">
            <label>图片（可选）</label>
            <div class="post-dropzone" id="post-dropzone">
              <div class="post-dropzone-text">📷 点击选择图片，或将图片拖到这里</div>
              <div class="post-dropzone-hint">支持 JPG / PNG / WebP，最多 6 张</div>
            </div>
            <input type="file" id="post-image-input" accept="image/*" multiple style="display:none">
            <div class="post-image-previews" id="post-image-previews"></div>
          </div>
          <div class="form-group">
            <label>标签（用逗号分隔）</label>
            <input type="text" id="post-tags" placeholder="例如：技术, 生活, 问答">
            <div class="form-hint">添加相关标签，方便他人发现你的帖子</div>
          </div>
          <div class="form-error" id="post-error"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="App.closeModal()">取消</button>
          <button class="btn-primary" onclick="App.handleCreatePost()">发布</button>
        </div>
      </div>
    `);
    this.setupPostImagePicker();
  },

  // ========== 处理登录 ==========
  async handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';

    const result = await Auth.login(username, password);
    if (result.success) {
      this.closeModal();
      this.showToast(result.message, 'success');
      this.updateNavbar();
      this.render();
    } else {
      errorEl.textContent = result.message;
    }
  },

  // ========== 处理注册 ==========
  async handleRegister() {
    const username = document.getElementById('reg-username').value;
    const nickname = document.getElementById('reg-nickname').value;
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    const errorEl = document.getElementById('reg-error');
    errorEl.textContent = '';

    if (password !== password2) {
      errorEl.textContent = '两次输入的密码不一致';
      return;
    }

    const result = await Auth.register(username, password, nickname);
    if (result.success) {
      this.closeModal();
      this.showToast(result.message, 'success');
      this.updateNavbar();
      this.render();
    } else {
      errorEl.textContent = result.message;
    }
  },

  // ========== 处理发帖 ==========
  async handleCreatePost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const tagsStr = document.getElementById('post-tags').value;
    const errorEl = document.getElementById('post-error');
    errorEl.textContent = '';

    const tags = tagsStr ? tagsStr.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];

    const result = await Posts.create(title, content, tags, this._pendingImages.slice());
    if (result.success) {
      this._pendingImages = [];
      this.closeModal();
      this.showToast(result.message, 'success');
      this.render();
    } else {
      errorEl.textContent = result.message;
    }
  },

  // ========== 模态框通用 ==========
  showModal(html) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = html;
    overlay.id = 'current-modal';
    document.body.appendChild(overlay);
  },

  closeModal() {
    const modal = document.getElementById('current-modal');
    if (modal) modal.remove();
  },

  // ========== Toast 提示 ==========
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  },

  // ========== HTML 转义 ==========
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // ========== 头像内容（有图片用图片，否则用首字） ==========
  avatarInnerHtml(color, name, image) {
    if (image) return '<img class="avatar-img" src="' + image + '" alt="">';
    return this.escapeHtml((name || '?').charAt(0).toUpperCase());
  },

  avatarBg(color, image) {
    return image ? 'transparent' : (color || '#8A5A3B');
  },

  // ========== 图片压缩为 DataURL ==========
  fileToImageDataUrl(file, maxDim) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) {
        reject(new Error('not-image'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('bad-image'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('read-fail'));
      reader.readAsDataURL(file);
    });
  },

  // ========== 发帖待选图片 ==========
  _pendingImages: [],

  setupPostImagePicker() {
    const zone = document.getElementById('post-dropzone');
    const input = document.getElementById('post-image-input');
    if (!zone || !input) return;
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragover');
      this.addPostImages(e.dataTransfer.files);
    });
    input.addEventListener('change', () => {
      this.addPostImages(input.files);
      input.value = '';
    });
  },

  addPostImages(fileList) {
    const files = Array.from(fileList || []).filter(f => f.type && f.type.indexOf('image/') === 0);
    if (files.length === 0) return;
    const room = 6 - this._pendingImages.length;
    if (room <= 0) {
      this.showToast('最多添加 6 张图片', 'error');
      return;
    }
    files.slice(0, room).forEach(file => {
      this.fileToImageDataUrl(file, 1000).then(dataUrl => {
        this._pendingImages.push(dataUrl);
        this.renderPostImagePreviews();
      }).catch(() => this.showToast('图片读取失败', 'error'));
    });
  },

  renderPostImagePreviews() {
    const box = document.getElementById('post-image-previews');
    if (!box) return;
    box.innerHTML = this._pendingImages.map((src, i) =>
      '<div class="post-image-preview">' +
        '<img src="' + src + '" alt="">' +
        '<button type="button" class="post-image-remove" data-index="' + i + '">✕</button>' +
      '</div>'
    ).join('');
    box.querySelectorAll('.post-image-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this._pendingImages.splice(parseInt(btn.dataset.index, 10), 1);
        this.renderPostImagePreviews();
      });
    });
  },

  // ========== 评论内容渲染（支持可点击帖子链接） ==========
  renderCommentContent(c) {
    const text = this.escapeHtml(c.content || '');
    if (!c.linkTargets || !c.linkTargets.length) return text;
    let html = text;
    c.linkTargets.forEach(t => {
      if (!t || !t.text) return;
      const escaped = this.escapeHtml(t.text);
      const safePid = this.escapeHtml(t.postId || '');
      const link = '<a class="comment-post-link" data-post-id="' + safePid + '" href="javascript:void(0)">' + escaped + '</a>';
      html = html.split(escaped).join(link);
    });
    return html;
  },

  // ========== 评论待选图片 ==========
  _pendingCommentImages: [],

  setupCommentImagePicker() {
    const btn = document.getElementById('comment-image-btn');
    const input = document.getElementById('comment-image-input');
    const textarea = document.getElementById('comment-textarea');
    if (btn) btn.addEventListener('click', () => input && input.click());
    if (input) {
      input.addEventListener('change', () => {
        this.addCommentImages(input.files);
        input.value = '';
      });
    }
    if (textarea) {
      textarea.addEventListener('dragover', e => {
        e.preventDefault();
        textarea.classList.add('dragover');
      });
      textarea.addEventListener('dragleave', () => textarea.classList.remove('dragover'));
      textarea.addEventListener('drop', e => {
        e.preventDefault();
        textarea.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files) {
          this.addCommentImages(e.dataTransfer.files);
        }
      });
    }
    this.renderCommentImagePreviews();
  },

  addCommentImages(fileList) {
    const files = Array.from(fileList || []).filter(f => f.type && f.type.indexOf('image/') === 0);
    if (files.length === 0) return;
    const room = 6 - this._pendingCommentImages.length;
    if (room <= 0) {
      this.showToast('最多添加 6 张图片', 'error');
      return;
    }
    files.slice(0, room).forEach(file => {
      this.fileToImageDataUrl(file, 1000).then(dataUrl => {
        this._pendingCommentImages.push(dataUrl);
        this.renderCommentImagePreviews();
      }).catch(() => this.showToast('图片读取失败', 'error'));
    });
  },

  renderCommentImagePreviews() {
    const box = document.getElementById('comment-image-previews');
    if (!box) return;
    box.innerHTML = this._pendingCommentImages.map((src, i) =>
      '<div class="comment-image-preview">' +
        '<img src="' + src + '" alt="">' +
        '<button type="button" class="comment-image-remove" data-index="' + i + '">✕</button>' +
      '</div>'
    ).join('');
    box.querySelectorAll('.comment-image-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this._pendingCommentImages.splice(parseInt(btn.dataset.index, 10), 1);
        this.renderCommentImagePreviews();
      });
    });
  },

  // ========== 图片查看器 ==========
  showImageViewer(src) {
    const overlay = document.createElement('div');
    overlay.className = 'image-viewer-overlay';
    overlay.innerHTML = '<img src="' + src + '" alt="">';
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => App.init());
