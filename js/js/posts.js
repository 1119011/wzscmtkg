/**
 * 帖子功能模块
 * 处理发帖、列表、详情、评论等功能
 */

const Posts = {
  // 创建帖子（异步：图片存 IndexedDB）
  async create(title, content, tags = [], images = []) {
    const user = Auth.getCurrentUser();
    if (!user) {
      return { success: false, message: '请先登录' };
    }
    if (!title || title.trim().length < 5) {
      return { success: false, message: '标题至少5个字符' };
    }
    if (!content || content.trim().length < 10) {
      return { success: false, message: '内容至少10个字符' };
    }

    const post = {
      id: Storage.generateId(),
      title: title.trim(),
      content: content.trim(),
      tags: tags.filter(t => t.trim()),
      authorId: user.id,
      authorName: user.nickname,
      authorAvatarColor: user.avatarColor || '#0066ff',
      authorAvatarImage: user.avatarImage || null,
      images: Array.isArray(images) ? images.slice(0, 6) : [],
      likeCount: 0,
      commentCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      await Storage.addPost(post);
    } catch (e) {
      console.error('[Posts] 发帖失败', e);
      return { success: false, message: '保存失败，存储空间不足或图片异常' };
    }
    return { success: true, post, message: '发布成功' };
  },

  // 获取帖子列表
  getList() {
    return Storage.getPosts();
  },

  // 获取帖子详情
  getDetail(id) {
    const post = Storage.getPostById(id);
    if (!post) return null;

    // 获取评论
    const comments = Storage.getCommentsByPostId(id).map(c => {
      const author = Storage.findUserById(c.authorId);
      return {
        ...c,
        authorName: author ? author.nickname : '匿名用户',
        authorAvatarColor: author ? author.avatarColor : '#999',
        authorAvatarImage: author ? (author.avatarImage || null) : null
      };
    });

    // 检查当前用户是否点赞
    const currentUser = Auth.getCurrentUser();
    const liked = currentUser ? Storage.hasLiked(id, currentUser.id) : false;

    return { ...post, comments, liked };
  },

  // 删除帖子
  async delete(id) {
    const user = Auth.getCurrentUser();
    if (!user) {
      return { success: false, message: '请先登录' };
    }

    const post = Storage.getPostById(id);
    if (!post) {
      return { success: false, message: '帖子不存在' };
    }
    if (post.authorId !== user.id) {
      return { success: false, message: '无权删除该帖子' };
    }

    await Storage.deletePost(id);
    return { success: true, message: '删除成功' };
  },

  // 点赞/取消点赞
  async toggleLike(id) {
    const user = Auth.getCurrentUser();
    if (!user) {
      return { success: false, message: '请先登录' };
    }

    const result = await Storage.toggleLike(id, user.id);
    return { success: true, ...result };
  },

  // 添加评论（异步：图片存 IndexedDB）
  async addComment(postId, content, images = []) {
    const user = Auth.getCurrentUser();
    if (!user) {
      return { success: false, message: '请先登录' };
    }
    const cleanText = (content || '').trim();
    const imgList = Array.isArray(images) ? images.filter(Boolean) : [];
    if (!cleanText && imgList.length === 0) {
      return { success: false, message: '请输入评论内容或添加图片' };
    }

    const comment = {
      id: Storage.generateId(),
      postId,
      content: cleanText,
      images: imgList,
      authorId: user.id,
      createdAt: Date.now()
    };

    try {
      await Storage.addComment(comment);
    } catch (e) {
      console.error('[Posts] 评论失败', e);
      return { success: false, message: '保存失败，存储空间不足或图片异常' };
    }
    return { success: true, message: '评论成功' };
  },

  // 搜索帖子
  search(keyword) {
    return Storage.searchPosts(keyword);
  },

  // 格式化时间
  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  // 获取热门话题（基于帖子数量的标签）
  getHotTopics() {
    const posts = Storage.getPosts();
    const tagCount = {};

    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, count }));
  }
};
