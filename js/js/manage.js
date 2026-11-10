/**
 * 账号维护脚本
 * 1. 注销「小叶同学」账号
 * 2. 创建论坛管理员账号
 * 3. 将「论坛管理员」更名为「论坛管理组」并赋予管理员角色
 *
 * 注意：Storage 中的图片已迁移至 IndexedDB，相关写入为异步，
 * 因此所有种子逻辑统一放在 Storage.ready() 之后执行。
 */
Storage.ready().then(async function () {

  var SEED_KEY = 'forumAccountSeed_v1';
  if (!localStorage.getItem(SEED_KEY)) {
    // 注销「小叶同学」
    var users = Storage.getUsers();
    var removed = users.filter(function (user) {
      return user.username !== '小叶同学' && user.nickname !== '小叶同学';
    });
    await Storage.saveUsers(removed);

    // 若当前登录的正是被注销账号，则退出登录
    var current = Storage.getCurrentUser();
    if (current && (current.username === '小叶同学' || current.nickname === '小叶同学')) {
      Storage.clearCurrentUser();
    }

    // 创建管理员账号
    if (!Storage.findUserByUsername('论坛管理员')) {
      await Storage.addUser({
        id: Storage.generateId(),
        username: '论坛管理员',
        password: Auth.hashPassword('yiqingjiu'),
        nickname: '论坛管理员',
        createdAt: Date.now(),
        avatarColor: '#8A5A3B'
      });
    }

    localStorage.setItem(SEED_KEY, '1');
  }

  /**
   * 账号升级：论坛管理员 → 论坛管理组，并赋予管理员角色
   */
  var MIGRATE_KEY = 'forumAccountSeed_v2';
  if (!localStorage.getItem(MIGRATE_KEY)) {
    var users2 = Storage.getUsers();
    var adminId = null;
    var changed = false;

    users2.forEach(function (user) {
      if (user.username === '论坛管理员' || user.nickname === '论坛管理员') {
        user.username = '论坛管理组';
        user.nickname = '论坛管理组';
        user.role = 'admin';
        adminId = user.id;
        changed = true;
      } else if (user.username === '论坛管理组') {
        user.role = 'admin';
        adminId = user.id;
        changed = true;
      }
    });

    // 没有管理员账号时补建
    if (!Storage.findUserByUsername('论坛管理组')) {
      var admin = {
        id: Storage.generateId(),
        username: '论坛管理组',
        password: Auth.hashPassword('yiqingjiu'),
        nickname: '论坛管理组',
        createdAt: Date.now(),
        avatarColor: '#8A5A3B',
        role: 'admin'
      };
      users2.push(admin);
      adminId = admin.id;
      changed = true;
    }

    if (changed) await Storage.saveUsers(users2);

    // 同步更新当前登录状态
    var current2 = Storage.getCurrentUser();
    if (current2 && (current2.username === '论坛管理员' || current2.nickname === '论坛管理员' ||
        current2.username === '论坛管理组')) {
      current2.username = '论坛管理组';
      current2.nickname = '论坛管理组';
      current2.role = 'admin';
      await Storage.setCurrentUser(current2);
    }

    // 同步旧帖作者显示名称
    if (adminId) {
      var posts = Storage.getPosts();
      var postsChanged = false;
      posts.forEach(function (post) {
        if (post.authorId === adminId && post.authorName === '论坛管理员') {
          post.authorName = '论坛管理组';
          postsChanged = true;
        }
      });
      if (postsChanged) await Storage.savePosts(posts);
    }

    localStorage.setItem(MIGRATE_KEY, '1');
  }

  /**
   * 创建无用户名的特殊账号（仅论坛管理员可登录，密码 000）
   */
  var ANON_KEY = 'forumAnonymousSeed_v1';
  if (!localStorage.getItem(ANON_KEY)) {
    var users3 = Storage.getUsers();
    var exists = users3.some(function (user) {
      return user.username === '' || user.isAnonymous;
    });

    if (!exists) {
      users3.push({
        id: Storage.generateId(),
        username: '',
        password: Auth.hashPassword('000'),
        nickname: '',
        createdAt: Date.now(),
        avatarColor: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
        isAnonymous: true
      });
      await Storage.saveUsers(users3);
    }

    localStorage.setItem(ANON_KEY, '1');
  }

  /**
   * 账号锁定迁移：除「论坛管理员 / 论坛管理组」与「非人类拟态生物」外，
   * 将本次迁移时已有的账号标记为锁定（用户名与密码均不可更改）。
   * 之后新注册的账号不受影响。
   */
  var LOCK_KEY = 'forumAccountLock_v1';
  if (!localStorage.getItem(LOCK_KEY)) {
    var EXEMPT = ['论坛管理员', '论坛管理组', '非人类拟态生物'];
    var users4 = Storage.getUsers();
    var changed4 = false;

    users4.forEach(function (user) {
      var username = user.username || '';
      var nickname = user.nickname || '';
      if (EXEMPT.indexOf(username) !== -1 || EXEMPT.indexOf(nickname) !== -1) return;
      if (!user.accountLocked) {
        user.accountLocked = true;
        changed4 = true;
      }
    });

    if (changed4) await Storage.saveUsers(users4);

    // 若当前登录账号被锁定，同步当前会话信息
    var current4 = Storage.getCurrentUser();
    if (current4) {
      var record = users4.find(function (u) { return u.id === current4.id; });
      if (record && record.accountLocked && !current4.accountLocked) {
        current4.accountLocked = true;
        await Storage.setCurrentUser(current4);
      }
    }

    localStorage.setItem(LOCK_KEY, '1');
  }
});
