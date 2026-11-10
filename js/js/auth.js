/**
 * 用户认证模块
 * 处理注册、登录、登出等功能
 */

const Auth = {
  // 简单的密码加密（仅用于演示，生产环境应使用 bcrypt）
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36) + password.length;
  },

  // 注册
  async register(username, password, nickname) {
    // 验证
    if (!username || username.trim().length < 3) {
      return { success: false, message: '用户名至少3个字符' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: '密码至少6个字符' };
    }
    if (Storage.findUserByUsername(username.trim())) {
      return { success: false, message: '该用户名已被注册' };
    }

    const user = {
      id: Storage.generateId(),
      username: username.trim(),
      password: this.hashPassword(password),
      nickname: nickname && nickname.trim() ? nickname.trim() : username.trim(),
      createdAt: Date.now(),
      avatarColor: this.getRandomColor()
    };

    await Storage.addUser(user);
    // 自动登录
    await Storage.setCurrentUser(this.sanitizeUser(user));
    return { success: true, user: this.sanitizeUser(user), message: '注册成功' };
  },

  // 登录
  async login(username, password) {
    if (!username || !password) {
      return { success: false, message: '请输入用户名和密码' };
    }

    const user = Storage.findUserByUsername(username.trim());
    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }

    if (user.password !== this.hashPassword(password)) {
      return { success: false, message: '用户名或密码错误' };
    }

    await Storage.setCurrentUser(this.sanitizeUser(user));
    return { success: true, user: this.sanitizeUser(user), message: '登录成功' };
  },

  // 登出
  logout() {
    Storage.clearCurrentUser();
    return { success: true };
  },

  // 获取当前用户
  getCurrentUser() {
    return Storage.getCurrentUser();
  },

  // 检查是否登录
  isLoggedIn() {
    return !!Storage.getCurrentUser();
  },

  // 清除敏感信息
  sanitizeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
  },

  // 生成随机头像颜色
  getRandomColor() {
    const colors = ['#0066ff', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
};
