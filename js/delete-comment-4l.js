/**
 * 删除「关于规范论坛发帖秩序公告」中 4L 的评论（论坛管理员：版主我喜欢你，我俩结婚吧）
 * 楼层规则：楼主为 1L，评论从 2L 开始，因此 4L 是第 3 条评论。
 */
Storage.ready().then(async function () {
  var PATCH_KEY = 'announcementDelete4L_v1';
  if (localStorage.getItem(PATCH_KEY)) return;

  var posts = Storage.getPosts();
  var target = null;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].title.indexOf('规范论坛发帖秩序') === -1) continue;
    target = posts[i];
    break;
  }
  if (!target) return;

  var postComments = Storage.getComments()
    .filter(function (c) { return c.postId === target.id; })
    .sort(function (a, b) { return a.createdAt - b.createdAt; });

  if (postComments.length < 3) return;

  // 优先按内容精确定位，避免误删
  var victim = null;
  for (var j = 0; j < postComments.length; j++) {
    var text = (postComments[j].content || '').replace(/\s/g, '');
    if (text === '版主我喜欢你，我俩结婚吧') {
      victim = postComments[j];
      break;
    }
  }
  if (!victim) victim = postComments[2];

  var all = Storage.getComments().filter(function (c) { return c.id !== victim.id; });
  await Storage.saveComments(all);
  await Storage.updatePost(target.id, { commentCount: all.filter(function (c) {
    return c.postId === target.id;
  }).length });

  localStorage.setItem(PATCH_KEY, '1');
  console.log('[评论] 已删除 4L：' + victim.content);
});
