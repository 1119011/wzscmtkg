/**
 * Supabase 轻量客户端
 * 只用浏览器原生 fetch 调用 Supabase 的 REST 与 Storage 接口，不依赖任何第三方 SDK。
 */
const SupabaseAPI = {
  url: '',
  key: '',

  init(config) {
    this.url = String((config && config.url) || '')
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/rest\/v1$/, '');
    this.key = String((config && config.anonKey) || '').trim();
    return !!(this.url && this.key);
  },

  _headers(extra) {
    const headers = {
      apikey: this.key,
      'Content-Type': 'application/json'
    };
    // 旧版 anon key 是 JWT（eyJ 开头）才需要放进 Authorization；
    // 新版 publishable key（sb_publishable_ 开头）只放 apikey 即可。
    if (this.key.indexOf('eyJ') === 0) {
      headers.Authorization = 'Bearer ' + this.key;
    }
    if (extra) Object.keys(extra).forEach(k => { headers[k] = extra[k]; });
    return headers;
  },

  async _check(res, label) {
    if (res.ok) return res;
    let detail = '';
    try { detail = await res.text(); } catch (e) { /* ignore */ }
    throw new Error('[Supabase] ' + label + '失败（' + res.status + '）' + detail);
  },

  // 带超时的 fetch：避免弱网下请求挂死导致页面长时间空白
  async _fetch(url, options, timeoutMs) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const opts = Object.assign({}, options);
    if (ctrl) opts.signal = ctrl.signal;
    let timer = null;
    const timeout = new Promise(function (_, reject) {
      timer = setTimeout(function () {
        if (ctrl) { try { ctrl.abort(); } catch (e) {} }
        reject(new Error('[Supabase] 请求超时（' + Math.round(timeoutMs / 1000) + 's）'));
      }, timeoutMs || 10000);
    });
    try {
      return await Promise.race([fetch(url, opts), timeout]);
    } finally {
      clearTimeout(timer);
    }
  },

  // 读取整张表
  async select(table, query, timeoutMs) {
    const res = await this._fetch(
      this.url + '/rest/v1/' + table + '?' + (query || 'select=*'),
      { headers: this._headers() },
      timeoutMs || 10000
    );
    await this._check(res, '读取 ' + table + ' ');
    return res.json();
  },

  // 批量写入 / 覆盖（按主键 upsert）
  async upsert(table, rows, conflictKey) {
    if (!rows || !rows.length) return;
    const res = await fetch(
      this.url + '/rest/v1/' + table + '?on_conflict=' + (conflictKey || 'id'),
      {
        method: 'POST',
        headers: this._headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify(rows)
      }
    );
    await this._check(res, '写入 ' + table + ' ');
  },

  // 按主键更新一行
  async update(table, id, patch) {
    const res = await fetch(
      this.url + '/rest/v1/' + table + '?id=eq.' + encodeURIComponent(id),
      {
        method: 'PATCH',
        headers: this._headers({ Prefer: 'return=minimal' }),
        body: JSON.stringify(patch)
      }
    );
    await this._check(res, '更新 ' + table + ' ');
  },

  // 按条件删除，例如 remove('comments', 'post_id=eq.abc')
  async remove(table, query) {
    const res = await fetch(this.url + '/rest/v1/' + table + '?' + query, {
      method: 'DELETE',
      headers: this._headers({ Prefer: 'return=minimal' })
    });
    await this._check(res, '删除 ' + table + ' ');
  },

  // 上传 base64 图片，返回可公开访问的 URL
  async uploadImage(dataUrl) {
    const blobRes = await fetch(dataUrl);
    const blob = await blobRes.blob();

    let ext = ((blob.type || 'image/png').split('/')[1] || 'png').toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';

    const path = 'u/' + Date.now().toString(36) + '-' +
      Math.random().toString(36).slice(2, 8) + '.' + ext;

    const res = await fetch(this.url + '/storage/v1/object/images/' + path, {
      method: 'POST',
      headers: {
        apikey: this.key,
        Authorization: 'Bearer ' + this.key,
        'Content-Type': blob.type || 'image/png',
        'x-upsert': 'true',
        'cache-control': 'max-age=31536000'
      },
      body: blob
    });
    await this._check(res, '上传图片');

    return this.url + '/storage/v1/object/public/images/' + path;
  }
};
