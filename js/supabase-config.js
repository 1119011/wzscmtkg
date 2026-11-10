/**
 * Supabase 配置（多人真实互动）
 *
 * 留空 = 本地模式：数据只存在当前浏览器，其他人看不到你的帖子。
 * 填好 = 云端模式：所有访客共享同一份用户 / 帖子 / 评论 / 点赞，实现多人真实互动。
 *
 * 配置步骤：
 *   1. 注册并新建项目：https://supabase.com
 *   2. 左侧 Project Settings → API，复制两个值：
 *        Project URL      → 填到下面的 url
 *        anon public key  → 填到下面的 anonKey
 *   3. 左侧 SQL Editor → New query，粘贴并运行 supabase/schema.sql（建表 + 图片桶）
 *   4. 保存本文件，重新部署到 GitHub Pages 即可
 */
window.SUPABASE_CONFIG = {
  url: 'https://csuhlvyeciwevywcvhna.supabase.co',      // 例：'https://abcdefghijk.supabase.co'
  anonKey: 'sb_publishable_mNBzfboiAuaijTAxP8veNw_slCO_QUq'   // 例：'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
