/**
 * 数据存储模块
 *
 * 两种运行模式：
 * 1. 云端模式（多人真实互动）：在 js/supabase-config.js 填入 Supabase 地址与 anon key 后自动启用。
 *    所有用户 / 帖子 / 评论 / 点赞 / 群聊都存到 Supabase，所有访客共享同一份数据。
 * 2. 本地模式：没填配置时保持原样，数据存 localStorage + IndexedDB 图片，仅本机可见。
 *
 * 读接口保持同步（渲染层直接调用）：
 *   云端模式下读的是内存缓存 _cache，初始化时一次性拉全量；
 *   写接口先更新缓存与本地镜像，再按 FIFO 顺序推送到云端，保证操作顺序与本地模式一致。
 */

const DB_NAME = 'forum_db';
const DB_VERSION = 1;
const IMAGE_STORE = 'images';

// 需要与云端同步的键值对（群聊 + 私信内容）
const SYNC_KV_KEYS = ['survivorGroupChats_v1', 'survivorGroupMessages_v1', 'messages'];

// 一次性种子 / 补丁脚本的守卫键。
// 云端已有数据时直接标记为已完成，避免每个新访客重复导入一遍。
const SEED_FLAGS = [
  'lofterAnimeCommentsSeed_v1',
  'lofterAnimeCommentsSeed2_v1',
  'animeRecordCommentsSeed_v1',
  'animeOldSupplementSeed_v1',
  'animeInvestigationSeed_v1',
  'animeInvestigationSeed6_v1',
  'animeInvestigationSeed10_v1',
  'animeOriginalPosterSeed10_v1',
  'forumAccountSeed_v1',
  'forumAccountSeed_v2',
  'forumAnonymousSeed_v1',
  'forumAccountLock_v1',
  'mapUsersSeed2_v1',
  'animeRecordDelete3L_v1',
  'announcementDelete4L_v1',
  'lofterGroupChatSeed7_v1',
  'lofterGroupChatSeed8_v1',
  'survivorGroupRenameChat_v1',
  'darknetAnimationCommentPatch_v1',
  'darknetComment121Patch_v1',
  'originalPosterCommentFormat_v1',
  'animeRecordRename_v1',
  'restoreWipedPosts_20261107_v1',
  'animePostTagPatch_v1'
];

const Storage = {
  _remote: false,
  _offline: false,
  _cache: { users: [], posts: [], comments: [], likes: [], kv: {} },
  _db: null,
  _imageCache: new Map(), // id -> dataUrl
  _ready: null,
  _queue: Promise.resolve(),
  _pending: 0,
  _pollTimer: null,
  _lastSig: '',
  _kvSnap: {}, // 聊天数据逐条写入的已同步快照：key -> { itemId: json }

  // ========== 初始化 ==========
  init() {
    ['users', 'posts', 'comments', 'likes'].forEach(key => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, '[]');
    });
    if (!localStorage.getItem('currentUser')) localStorage.setItem('currentUser', 'null');

    const config = (typeof window !== 'undefined' && window.SUPABASE_CONFIG) || null;
    const enabled = !!(config && config.url && config.anonKey &&
      typeof SupabaseAPI !== 'undefined' && SupabaseAPI.init(config));

    this._remote = enabled;
    this._ready = enabled ? this._initRemote() : this._initLocal();
    return this._ready;
  },

  // 等待存储就绪（种子脚本、App 渲染都依赖它）
  ready() {
    return this._ready || Promise.resolve();
  },

  // ---------- 本地模式：IndexedDB 图片库 ----------
  _initLocal() {
    return this._openDB()
      .then(() => this._loadImageCache())
      .then(() => this._migrateImagesToIndexedDB())
      .catch(err => {
        console.error('[Storage] IndexedDB 初始化失败，图片将无法持久化', err);
      });
  },

  // ---------- 云端模式 ----------
  async _initRemote() {
    // 先用 localStorage 里的 mirror 填充 _cache 做兜底（对首次访问用户 mirror 为空）
    this._cache = {
      users: (this.get('users') || []).map(u => ({ ...u })),
      posts: (this.get('posts') || []).map(p => ({ ...p })),
      comments: (this.get('comments') || []).map(c => ({ ...c })),
      likes: (this.get('likes') || []).map(l => ({ ...l })),
      kv: (this.get('kv') || {})
    };
    // 本机镜像里的聊天记录（旧版本只存在本机，需要合并进云端）
    const mirrorChat = this._readMirrorChat();
    console.log('[Storage] 初始化：mirror 兜底已加载', this._cache.posts.length + ' posts');

    try {
      const fetched = await this._fetchRemote();
      const failed = fetched.failed || [];

      // 云端是空的、本机也没有内容 → 首次导入
      if (fetched.posts.length === 0 && fetched.users.length === 0 &&
          this._cache.posts.length === 0 && this._cache.users.length === 0) {
        await this._importLocalData();
        this._cache = await this._fetchRemote();
      } else {
        // 某张表拉取失败（弱网/超时）时保留 mirror 里的旧数据，避免整页变空
        this._cache = {
          users: failed.indexOf('users') === -1 ? fetched.users : this._cache.users,
          posts: failed.indexOf('posts') === -1 ? fetched.posts : this._cache.posts,
          comments: failed.indexOf('comments') === -1 ? fetched.comments : this._cache.comments,
          likes: failed.indexOf('likes') === -1 ? fetched.likes : this._cache.likes,
          kv: failed.indexOf('kv') === -1 ? fetched.kv : this._cache.kv
        };
      }

      // 记录云端已有的聊天条目，再把本机多出来的聊天记录补推上去
      const kvFailed = (failed.indexOf('kv') !== -1) ||
        (this._cache.failed && this._cache.failed.indexOf('kv') !== -1);
      this._resetKvSnap(kvFailed ? {} : this._cache.kv);
      this._mergeMirrorChat(mirrorChat);
      SYNC_KV_KEYS.forEach(key => this._pushKvItems(key, this._cache.kv[key]));
      this._ensureCurrentUserSynced();

      this._mirror();
      this._primeSeedFlags();
      this._lastSig = this._signature();
      this._startPolling();
      console.log('[Storage] 云端模式已启用，所有访客共享同一份数据',
        'posts=' + this._cache.posts.length,
        'comments=' + this._cache.comments.length,
        failed.length ? '拉取失败=' + failed.join(',') : '');
    } catch (err) {
      console.error('[Storage] 云端连接失败，已回退到本地模式：', err);
      this._remote = false;
      this._offline = true;
      await this._initLocal();
    }
  },

  _parseLocal(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  // 本地图片（IndexedDB id 或 base64）→ 云端公开链接
  async _uploadLocalImage(value) {
    if (!value) return null;
    if (this._isHttpUrl(value)) return value;
    if (this._isDataUrl(value)) return await SupabaseAPI.uploadImage(value);
    const cached = this._imageCache.get(value);
    if (cached) return await SupabaseAPI.uploadImage(cached);
    return null;
  },

  async _mapLocalImages(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (const item of arr) {
      const url = await this._uploadLocalImage(item);
      if (url) out.push(url);
    }
    return out;
  },

  async _pushRows(table, rows) {
    const size = 100;
    for (let i = 0; i < rows.length; i += size) {
      await this._enqueue(() => SupabaseAPI.upsert(table, rows.slice(i, i + size)));
    }
  },

  // 把本机 localStorage / IndexedDB 里的现有内容导入云端（只会在云端为空时执行一次）
  async _importLocalData() {
    const users = this._parseLocal('users');
    const posts = this._parseLocal('posts');
    const comments = this._parseLocal('comments');
    const likes = this._parseLocal('likes');

    if (!users.length && !posts.length && !comments.length) return;

    console.log('[Storage] 检测到本机已有内容，正在导入云端，请稍候…');

    await this._openDB().then(() => this._loadImageCache()).catch(() => {});

    for (const user of users) {
      user.avatarImage = await this._uploadLocalImage(user.avatarImage);
    }
    for (const post of posts) {
      post.images = await this._mapLocalImages(post.images);
      post.authorAvatarImage = await this._uploadLocalImage(post.authorAvatarImage);
    }
    for (const comment of comments) {
      comment.images = await this._mapLocalImages(comment.images);
    }

    await this._pushRows('users', users.map(u => this._userRow(u)));
    await this._pushRows('posts', posts.map(p => this._postRow(p)));
    await this._pushRows('comments', comments.map(c => this._commentRow(c)));
    await this._pushRows('likes', likes.map(l => this._likeRow(l)));

    for (const key of SYNC_KV_KEYS) {
      const value = this._parseLocal(key);
      if (Array.isArray(value) && value.length) {
        const rows = value
          .filter(item => item && item.id)
          .map(item => ({
            key: key + '#' + item.id,
            value: item,
            updated_at: new Date().toISOString()
          }));
        if (rows.length) {
          await this._enqueue(() => SupabaseAPI.upsert('kv', rows, 'key'));
        }
      }
    }

    console.log('[Storage] 本机内容已全部导入云端');
  },

  async _fetchRemote() {
    const failed = [];
    const load = async (table, timeout) => {
      try {
        return await SupabaseAPI.select(table, null, timeout);
      } catch (err) {
        failed.push(table);
        console.warn('[Storage] 拉取 ' + table + ' 失败：' + (err && err.message));
        return [];
      }
    };

    const [users, posts, comments, likes, kv] = await Promise.all([
      load('users', 10000),
      load('posts', 10000),
      load('comments', 15000),
      load('likes', 10000),
      load('kv', 18000)
    ]);

    return {
      failed: failed,
      users: users.map(row => ({
        ...(row.data || {}),
        id: row.id,
        username: row.username
      })),
      posts: posts.map(row => ({ ...(row.data || {}), id: row.id })),
      comments: comments.map(row => ({
        ...(row.data || {}),
        id: row.id,
        postId: (row.data && row.data.postId) || row.post_id
      })),
      likes: likes.map(row => ({
        postId: row.post_id,
        userId: row.user_id,
        createdAt: row.created_at
      })),
      kv: this._assembleKv(kv)
    };
  },

  // 聊天记录按「每条一行」存在 kv 表里（key 形如 xxx#消息id），
  // 读取时再合并成数组；这样多人同时发言不会互相覆盖。
  _assembleKv(rows) {
    const out = {};
    const items = {};
    (rows || []).forEach(row => {
      if (SYNC_KV_KEYS.indexOf(row.key) !== -1) {
        out[row.key] = row.value;
        return;
      }
      let matched = false;
      for (const key of SYNC_KV_KEYS) {
        const prefix = key + '#';
        if (row.key.indexOf(prefix) === 0) {
          (items[key] = items[key] || []).push(row.value);
          matched = true;
          break;
        }
      }
      if (!matched) out[row.key] = row.value;
    });

    SYNC_KV_KEYS.forEach(key => {
      const byId = {};
      if (Array.isArray(out[key])) {
        out[key].forEach(v => { if (v && v.id) byId[v.id] = v; });
      }
      (items[key] || []).forEach(v => { if (v && v.id) byId[v.id] = v; });
      // 逐条数据优先（同 id 时覆盖旧的整段数组）
      out[key] = Object.keys(byId).map(id => byId[id])
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    });
    return out;
  },

  _readMirrorChat() {
    const mirror = {};
    SYNC_KV_KEYS.forEach(key => {
      try {
        const raw = localStorage.getItem(key);
        mirror[key] = raw ? JSON.parse(raw) : null;
      } catch (e) {
        mirror[key] = null;
      }
    });
    return mirror;
  },

  // 把本机旧版本留下的聊天记录合并进缓存（只补云端没有的条目）
  _mergeMirrorChat(mirror) {
    SYNC_KV_KEYS.forEach(key => {
      const local = mirror[key];
      if (!Array.isArray(local) || !local.length) return;
      const cloud = Array.isArray(this._cache.kv[key]) ? this._cache.kv[key] : [];
      const byId = {};
      cloud.forEach(v => { if (v && v.id) byId[v.id] = v; });
      let added = 0;
      local.forEach(v => {
        if (v && v.id && !byId[v.id]) { byId[v.id] = v; added++; }
      });
      if (!added) return;
      this._cache.kv[key] = Object.keys(byId).map(id => byId[id])
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      console.log('[Storage] 本机 ' + key + ' 有 ' + added + ' 条云端没有的聊天记录，已合并');
    });
  },

  _resetKvSnap(kv) {
    this._kvSnap = {};
    SYNC_KV_KEYS.forEach(key => {
      const arr = kv && kv[key];
      if (!Array.isArray(arr)) return;
      const map = {};
      arr.forEach(item => {
        if (item && item.id) map[item.id] = JSON.stringify(item);
      });
      this._kvSnap[key] = map;
    });
  },

  // 合并云端聊天数据：云端没有的本地条目保留下来并重推（聊天记录不做删除，保留更安全）
  _mergeCloudChat(cloudKv) {
    const out = { ...cloudKv };
    SYNC_KV_KEYS.forEach(key => {
      const cloud = Array.isArray(cloudKv[key]) ? cloudKv[key] : [];
      const snap = this._kvSnap[key] || (this._kvSnap[key] = {});
      const byId = {};
      cloud.forEach(item => {
        if (!item || !item.id) return;
        byId[item.id] = item;
        snap[item.id] = JSON.stringify(item);
      });

      (this._cache.kv[key] || []).forEach(item => {
        if (!item || !item.id || byId[item.id]) return;
        byId[item.id] = item;
      });

      out[key] = Object.keys(byId).map(id => byId[id])
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    });
    return out;
  },

  // 把云端数据在本地存一份镜像，云端连不上时页面仍有内容可看
  _mirror() {
    ['users', 'posts', 'comments', 'likes'].forEach(key => {
      this._writeLocal(key, this._cache[key]);
    });
    SYNC_KV_KEYS.forEach(key => {
      if (this._cache.kv[key] !== undefined) this._writeLocal(key, this._cache.kv[key]);
    });
  },

  // 本机账号如果还没进云端（注册时网络不通等情况），补传一次，
  // 否则别人查不到这个用户，私信和群聊就会被过滤掉。
  _ensureCurrentUserSynced() {
    if (this._userSyncTriedAt && Date.now() - this._userSyncTriedAt < 60000) return;
    this._userSyncTriedAt = Date.now();

    let cur = null;
    let full = null;
    try {
      cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (cur && cur.id) {
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        full = (localUsers || []).filter(u => u && u.id === cur.id)[0] || null;
      }
    } catch (e) { cur = null; }
    if (!cur || !cur.id || !cur.username) return;
    if (this._cache.users.some(u => u.id === cur.id)) return;

    // 优先用本机完整记录（含密码），保证她换设备后还能登录
    const target = full || cur;
    console.log('[Storage] 本机账号尚未同步到云端，正在补传：' + target.username);
    this._cache.users.push(target);
    this._writeLocal('users', this._cache.users);
    this._enqueue(() => SupabaseAPI.upsert('users', [this._userRow(target)])).catch(() => {});
  },

  _primeSeedFlags() {
    if (!(this._cache.posts.length > 0 && this._cache.users.length > 0)) return;
    try {
      SEED_FLAGS.forEach(key => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, '1');
      });
    } catch (e) { /* ignore */ }
  },

  _signature() {
    const c = this._cache;
    let maxPost = 0;
    let maxComment = 0;
    let maxUser = 0;
    c.posts.forEach(p => { maxPost = Math.max(maxPost, p.updatedAt || p.createdAt || 0); });
    c.comments.forEach(x => { maxComment = Math.max(maxComment, x.updatedAt || x.createdAt || 0); });
    c.users.forEach(u => { maxUser = Math.max(maxUser, u.createdAt || 0); });
    return [c.users.length, c.posts.length, c.comments.length, c.likes.length,
      maxPost, maxComment, maxUser, this._kvSignature()].join('|');
  },

  // 聊天内容的变化也要参与比对，否则别人发来的消息不会触发界面刷新
  _kvSignature() {
    const kv = this._cache.kv || {};
    return SYNC_KV_KEYS.map(key => {
      const arr = kv[key];
      if (!Array.isArray(arr) || !arr.length) return '0';
      let maxCreated = 0;
      arr.forEach(item => { maxCreated = Math.max(maxCreated, (item && item.createdAt) || 0); });
      return arr.length + ':' + maxCreated;
    }).join(',');
  },

  // 定时拉取别人的新内容
  _startPolling() {
    if (this._pollTimer) return;
    const self = this;
    this._pollTimer = setInterval(() => self.syncFromRemote(), 12000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') self.syncFromRemote();
    });
  },

  // 手动 / 定时同步：有变化时刷新界面
  async syncFromRemote() {
    if (!this._remote || this._offline) return false;
    if (this._pending > 0) return false; // 本地还有写入没落地，先别覆盖缓存

    try {
      const data = await this._fetchRemote();
      const failed = data.failed || [];
      // 拉取失败的表保留旧缓存，避免弱网下整套内容被清空
      this._cache = {
        users: failed.indexOf('users') === -1 ? data.users : this._cache.users,
        posts: failed.indexOf('posts') === -1 ? data.posts : this._cache.posts,
        comments: failed.indexOf('comments') === -1 ? data.comments : this._cache.comments,
        likes: failed.indexOf('likes') === -1 ? data.likes : this._cache.likes,
        kv: failed.indexOf('kv') === -1 ? this._mergeCloudChat(data.kv) : this._cache.kv
      };

      // 把还没成功推到云端的聊天条目补推一次（正常情况下没有差异，不会发请求）
      if (failed.indexOf('kv') === -1) {
        SYNC_KV_KEYS.forEach(key => this._pushKvItems(key, this._cache.kv[key]));
      }
      if (failed.indexOf('users') === -1) {
        this._ensureCurrentUserSynced();
      }

      const sig = this._signature();
      if (sig === this._lastSig) return false;

      this._lastSig = sig;
      this._mirror();
      if (typeof App !== 'undefined' && App && typeof App.refreshFromRemote === 'function') {
        App.refreshFromRemote();
      }
      // 通知聊天界面刷新（通讯台 / 私信窗口）
      try { document.dispatchEvent(new CustomEvent('storage:synced')); } catch (e) { /* ignore */ }
      return true;
    } catch (err) {
      console.warn('[Storage] 云端同步失败，稍后自动重试', err);
      return false;
    }
  },

  // 云端写操作排队执行，保证顺序与本地模式一致
  _enqueue(task) {
    const run = this._queue.then(() => {
      this._pending++;
      const p = task();
      return p.catch(err => {
        console.error('[Storage] 云端写入失败', err);
        throw err;
      }).finally(() => {
        this._pending--;
      });
    });
    this._queue = run.catch(() => {});
    return run;
  },

  _writeLocal(key, value) {
    const json = JSON.stringify(value);
    if (this._remote) {
      // 云端模式下本地只是镜像，写不进去也不影响使用
      try { localStorage.setItem(key, json); } catch (e) { /* ignore */ }
      return;
    }
    localStorage.setItem(key, json);
  },

  _rawArray(kind) {
    if (this._remote && !this._offline) return this._cache[kind];
    return this.get(kind) || [];
  },

  _setArray(kind, arr) {
    if (this._remote && !this._offline) this._cache[kind] = arr;
    this._writeLocal(kind, arr);
  },

  _strip(obj, keys) {
    const out = {};
    Object.keys(obj).forEach(key => {
      if (keys.indexOf(key) === -1) out[key] = obj[key];
    });
    return out;
  },

  _postRow(post) {
    return {
      id: post.id,
      created_at: post.createdAt || null,
      updated_at: post.updatedAt || post.createdAt || null,
      data: this._strip(post, ['id'])
    };
  },

  _commentRow(comment) {
    return {
      id: comment.id,
      post_id: comment.postId,
      created_at: comment.createdAt || null,
      data: this._strip(comment, ['id'])
    };
  },

  _userRow(user) {
    return {
      id: user.id,
      username: user.username,
      data: this._strip(user, ['id', 'username']),
      updated_at: new Date().toISOString()
    };
  },

  _likeRow(like) {
    return {
      id: like.postId + '__' + like.userId,
      post_id: like.postId,
      user_id: like.userId,
      created_at: like.createdAt || Date.now(),
      data: like
    };
  },

  // ========== IndexedDB（仅本地模式使用） ==========
  _openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IMAGE_STORE)) {
          db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = e => { this._db = e.target.result; resolve(); };
      req.onerror = e => reject(e.target.error);
    });
  },

  _loadImageCache() {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(IMAGE_STORE, 'readonly');
      const req = tx.objectStore(IMAGE_STORE).getAll();
      req.onsuccess = () => {
        this._imageCache.clear();
        (req.result || []).forEach(item => this._imageCache.set(item.id, item.dataUrl));
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  },

  // 把一张 base64 图片存入 IndexedDB，返回图片 ID（相同 base64 会复用已有 ID）
  _saveImageToDB(dataUrl) {
    return new Promise((resolve, reject) => {
      if (!dataUrl || typeof dataUrl !== 'string') { resolve(null); return; }
      for (const [existingId, existingUrl] of this._imageCache) {
        if (existingUrl === dataUrl) { resolve(existingId); return; }
      }
      const id = 'img_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const tx = this._db.transaction(IMAGE_STORE, 'readwrite');
      tx.objectStore(IMAGE_STORE).put({ id, dataUrl });
      tx.oncomplete = () => {
        this._imageCache.set(id, dataUrl);
        resolve(id);
      };
      tx.onerror = () => reject(tx.error);
    });
  },

  // ========== 图片字段 ==========
  _isDataUrl(v) {
    return typeof v === 'string' && v.indexOf('data:image') === 0;
  },

  _isHttpUrl(v) {
    return typeof v === 'string' && /^https?:\/\//i.test(v);
  },

  // base64 或 id → 存储值：云端模式上传成图片链接，本地模式存成 IndexedDB ID
  async _imageValueToId(value) {
    if (!value) return null;
    if (this._isHttpUrl(value)) return value;
    if (this._isDataUrl(value)) {
      if (this._remote && !this._offline) return await SupabaseAPI.uploadImage(value);
      return await this._saveImageToDB(value);
    }
    return value;
  },

  _imageIdToValue(id) {
    if (!id) return null;
    if (this._isHttpUrl(id) || this._isDataUrl(id)) return id;
    return this._imageCache.get(id) || id;
  },

  async _imageArrayToIds(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (const item of arr) {
      out.push(await this._imageValueToId(item));
    }
    return out.filter(Boolean);
  },

  _imageIdsToValues(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(id => this._imageIdToValue(id)).filter(Boolean);
  },

  // 启动时把旧数据中的 base64 图片迁移到 IndexedDB
  async _migrateImagesToIndexedDB() {
    let posts = this.get('posts') || [];
    let postsChanged = false;
    for (const post of posts) {
      if (Array.isArray(post.images) && post.images.some(this._isDataUrl)) {
        post.images = await this._imageArrayToIds(post.images);
        postsChanged = true;
      }
      if (this._isDataUrl(post.authorAvatarImage)) {
        post.authorAvatarImage = await this._imageValueToId(post.authorAvatarImage);
        postsChanged = true;
      }
    }
    if (postsChanged) this._setArray('posts', posts);

    let comments = this.get('comments') || [];
    let commentsChanged = false;
    for (const c of comments) {
      if (Array.isArray(c.images) && c.images.some(this._isDataUrl)) {
        c.images = await this._imageArrayToIds(c.images);
        commentsChanged = true;
      }
    }
    if (commentsChanged) this._setArray('comments', comments);

    let users = this.get('users') || [];
    let usersChanged = false;
    for (const u of users) {
      if (this._isDataUrl(u.avatarImage)) {
        u.avatarImage = await this._imageValueToId(u.avatarImage);
        usersChanged = true;
      }
    }
    if (usersChanged) this._setArray('users', users);

    const cur = this.get('currentUser');
    if (cur && this._isDataUrl(cur.avatarImage)) {
      cur.avatarImage = await this._imageValueToId(cur.avatarImage);
      this._writeLocal('currentUser', cur);
    }
  },

  // ========== 通用操作 ==========
  get(key) {
    if (this._remote && !this._offline) {
      if (key === 'users') return this._cache.users.map(u => ({ ...u }));
      if (key === 'posts') return this._cache.posts.map(p => ({ ...p }));
      if (key === 'comments') return this._cache.comments.map(c => ({ ...c }));
      if (key === 'likes') return this._cache.likes.map(l => ({ ...l }));
      if (Object.prototype.hasOwnProperty.call(this._cache.kv, key)) {
        return JSON.parse(JSON.stringify(this._cache.kv[key]));
      }
    }
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  set(key, value) {
    if (this._remote && !this._offline && SYNC_KV_KEYS.indexOf(key) !== -1) {
      this._cache.kv[key] = value;
      this._writeLocal(key, value);
      if (Array.isArray(value)) {
        this._pushKvItems(key, value);
      } else {
        const row = { key: key, value: value, updated_at: new Date().toISOString() };
        this._enqueue(() => SupabaseAPI.upsert('kv', [row], 'key')).catch(() => {});
      }
      return;
    }
    this._writeLocal(key, value);
  },

  // 聊天记录逐条写入：只推新增 / 有变化的条目，多人同时发言不会互相覆盖
  _pushKvItems(key, arr) {
    if (!Array.isArray(arr)) return;
    const snap = this._kvSnap[key] || (this._kvSnap[key] = {});
    const rows = [];
    const jsons = {};
    arr.forEach(item => {
      if (!item || !item.id) return;
      const json = JSON.stringify(item);
      jsons[item.id] = json;
      if (snap[item.id] === json) return;
      rows.push({
        key: key + '#' + item.id,
        value: item,
        updated_at: new Date().toISOString()
      });
    });
    if (!rows.length) return;

    const sentKeys = rows.map(r => r.key);
    this._enqueue(async () => {
      for (let i = 0; i < rows.length; i += 50) {
        await SupabaseAPI.upsert('kv', rows.slice(i, i + 50), 'key');
      }
      sentKeys.forEach(rowKey => {
        const id = rowKey.slice(key.length + 1);
        if (jsons[id] !== undefined) snap[id] = jsons[id];
      });
    }).catch(() => {});
  },

  // ========== 用户相关 ==========
  _hydrateUser(user) {
    return { ...user, avatarImage: this._imageIdToValue(user.avatarImage) };
  },

  getUsers() {
    return this._rawArray('users').map(u => this._hydrateUser(u));
  },

  async saveUsers(users) {
    for (const u of users) {
      u.avatarImage = await this._imageValueToId(u.avatarImage);
    }
    this._setArray('users', users);
    if (this._remote && !this._offline) {
      await this._enqueue(() => SupabaseAPI.upsert('users', users.map(u => this._userRow(u))));
    }
  },

  findUserByUsername(username) {
    const u = this._rawArray('users').find(x => x.username === username);
    return u ? this._hydrateUser(u) : null;
  },

  findUserById(id) {
    const u = this._rawArray('users').find(x => x.id === id);
    return u ? this._hydrateUser(u) : null;
  },

  async addUser(user) {
    user.avatarImage = await this._imageValueToId(user.avatarImage);
    if (this._remote && !this._offline) {
      await this._enqueue(() => SupabaseAPI.upsert('users', [this._userRow(user)]));
      this._cache.users.push(user);
      this._writeLocal('users', this._cache.users);
    } else {
      const users = this._rawArray('users');
      users.push(user);
      this._setArray('users', users);
    }
  },

  getCurrentUser() {
    const raw = this.get('currentUser');
    if (!raw) return raw;
    if (this._remote && !this._offline) {
      const fresh = this._cache.users.find(u => u.id === raw.id);
      if (fresh) return this._hydrateUser(fresh);
    }
    return this._hydrateUser(raw);
  },

  async setCurrentUser(user) {
    let next = user;
    if (next) next = { ...next, avatarImage: await this._imageValueToId(next.avatarImage) };
    this._writeLocal('currentUser', next);
  },

  clearCurrentUser() {
    localStorage.removeItem('currentUser');
  },

  // ========== 帖子相关 ==========
  _hydratePost(post) {
    return {
      ...post,
      images: this._imageIdsToValues(post.images),
      authorAvatarImage: this._imageIdToValue(post.authorAvatarImage)
    };
  },

  getPosts() {
    return this._rawArray('posts').map(p => this._hydratePost(p));
  },

  async savePosts(posts) {
    for (const p of posts) {
      p.images = await this._imageArrayToIds(p.images);
      p.authorAvatarImage = await this._imageValueToId(p.authorAvatarImage);
    }
    this._setArray('posts', posts);
    if (this._remote && !this._offline) {
      await this._enqueue(() => SupabaseAPI.upsert('posts', posts.map(p => this._postRow(p))));
    }
  },

  getPostById(id) {
    const p = this._rawArray('posts').find(x => x.id === id);
    return p ? this._hydratePost(p) : null;
  },

  async addPost(post) {
    post.images = await this._imageArrayToIds(post.images);
    post.authorAvatarImage = await this._imageValueToId(post.authorAvatarImage);
    if (this._remote && !this._offline) {
      await this._enqueue(() => SupabaseAPI.upsert('posts', [this._postRow(post)]));
      this._cache.posts.unshift(post);
      this._writeLocal('posts', this._cache.posts);
    } else {
      const posts = this._rawArray('posts');
      posts.unshift(post);
      this._setArray('posts', posts);
    }
  },

  async updatePost(id, updates) {
    const posts = this._rawArray('posts');
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return null;

    const merged = { ...posts[index], ...updates, updatedAt: Date.now() };
    merged.images = await this._imageArrayToIds(merged.images);
    merged.authorAvatarImage = await this._imageValueToId(merged.authorAvatarImage);

    const next = posts.slice();
    next[index] = merged;
    this._setArray('posts', next);

    if (this._remote && !this._offline) {
      await this._enqueue(() => SupabaseAPI.update('posts', id, this._postRow(merged)));
    }
    return merged;
  },

  async deletePost(id) {
    if (this._remote && !this._offline) {
      await this._enqueue(async () => {
        await SupabaseAPI.remove('posts', 'id=eq.' + encodeURIComponent(id));
        await SupabaseAPI.remove('comments', 'post_id=eq.' + encodeURIComponent(id));
        await SupabaseAPI.remove('likes', 'post_id=eq.' + encodeURIComponent(id));
      });
    }
    this._setArray('posts', this._rawArray('posts').filter(p => p.id !== id));
    this._setArray('comments', this._rawArray('comments').filter(c => c.postId !== id));
    this._setArray('likes', this._rawArray('likes').filter(l => l.postId !== id));
  },

  // ========== 评论相关 ==========
  getComments() {
    return this._rawArray('comments').map(c => ({ ...c, images: this._imageIdsToValues(c.images) }));
  },

  async saveComments(comments) {
    for (const c of comments) {
      c.images = await this._imageArrayToIds(c.images);
    }
    this._setArray('comments', comments);
    if (this._remote && !this._offline) {
      await this._enqueue(() => SupabaseAPI.upsert('comments', comments.map(c => this._commentRow(c))));
    }
  },

  getCommentsByPostId(postId) {
    return this._rawArray('comments')
      .filter(c => c.postId === postId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(c => ({ ...c, images: this._imageIdsToValues(c.images) }));
  },

  async addComment(comment) {
    comment.images = await this._imageArrayToIds(comment.images);
    if (this._remote && !this._offline) {
      await this._enqueue(() => SupabaseAPI.upsert('comments', [this._commentRow(comment)]));
      this._cache.comments.push(comment);
      this._writeLocal('comments', this._cache.comments);
    } else {
      const comments = this._rawArray('comments');
      comments.push(comment);
      this._setArray('comments', comments);
    }

    const post = this.getPostById(comment.postId);
    if (post) {
      await this.updatePost(post.id, { commentCount: (post.commentCount || 0) + 1 });
    }
  },

  async deleteComment(commentId) {
    const target = this._rawArray('comments').find(c => c.id === commentId);
    if (!target) return false;

    if (this._remote && !this._offline) {
      await this._enqueue(() => SupabaseAPI.remove('comments', 'id=eq.' + encodeURIComponent(commentId)));
    }
    this._setArray('comments', this._rawArray('comments').filter(c => c.id !== commentId));

    const post = this.getPostById(target.postId);
    if (post) {
      await this.updatePost(post.id, {
        commentCount: Math.max(0, (post.commentCount || 1) - 1)
      });
    }
    return true;
  },

  async updateComment(commentId, content, images) {
    const comments = this._rawArray('comments');
    const index = comments.findIndex(c => c.id === commentId);
    if (index === -1) return false;

    const target = { ...comments[index], content: content, updatedAt: Date.now() };
    if (Array.isArray(images)) {
      target.images = await this._imageArrayToIds(images);
    }

    const next = comments.slice();
    next[index] = target;
    this._setArray('comments', next);

    if (this._remote && !this._offline) {
      await this._enqueue(() => SupabaseAPI.update('comments', commentId, this._commentRow(target)));
    }
    return true;
  },

  // ========== 点赞相关 ==========
  getLikes() {
    return this._rawArray('likes').map(l => ({ ...l }));
  },

  saveLikes(likes) {
    this._setArray('likes', likes);
    if (this._remote && !this._offline) {
      this._enqueue(() => SupabaseAPI.upsert('likes', likes.map(l => this._likeRow(l)))).catch(() => {});
    }
  },

  hasLiked(postId, userId) {
    return this._rawArray('likes').some(l => l.postId === postId && l.userId === userId);
  },

  async toggleLike(postId, userId) {
    const liked = this.hasLiked(postId, userId);
    const post = this.getPostById(postId);

    if (liked) {
      if (this._remote && !this._offline) {
        await this._enqueue(() => SupabaseAPI.remove('likes',
          'post_id=eq.' + encodeURIComponent(postId) + '&user_id=eq.' + encodeURIComponent(userId)));
      }
      this._setArray('likes', this._rawArray('likes')
        .filter(l => !(l.postId === postId && l.userId === userId)));
    } else {
      const like = { postId, userId, createdAt: Date.now() };
      if (this._remote && !this._offline) {
        await this._enqueue(() => SupabaseAPI.upsert('likes', [this._likeRow(like)]));
      }
      const likes = this._rawArray('likes').slice();
      likes.push(like);
      this._setArray('likes', likes);
    }

    const count = Math.max(0, (post ? post.likeCount || 0 : 0) + (liked ? -1 : 1));
    if (post) await this.updatePost(postId, { likeCount: count });
    return { liked: !liked, count };
  },

  // ========== 生成唯一 ID ==========
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  // ========== 搜索帖子 ==========
  searchPosts(keyword) {
    const posts = this.getPosts();
    if (!keyword) return posts;
    const kw = keyword.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(kw) ||
      p.content.toLowerCase().includes(kw) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(kw)))
    );
  }
};

// 初始化
Storage.init();
