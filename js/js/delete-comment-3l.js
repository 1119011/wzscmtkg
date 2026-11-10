/**
 * 删除「关于“找一部在暗网上看过的离奇动画”该帖记录」中 3L 的评论
 * 楼层规则：楼主为 1L，评论从 2L 开始，因此 3L 是第 2 条评论。
 */
Storage.ready().then(async function () {
  var PATCH_KEY = 'animeRecordDelete3L_v1';
  if (localStorage.getItem(PATCH_KEY)) return;

  var posts = Storage.getPosts();
  var target = null;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].title.indexOf('该帖记录') === -1) continue;
    if (posts[i].title.indexOf('找一部在暗网上看过的离奇动画') === -1) continue;
    target = posts[i];
    break;
  }
  if (!target) return;

  var postComments = Storage.getComments()
    .filter(function (c) { return c.postId === target.id; })
    .sort(function (a, b) { return a.createdAt - b.createdAt; });

  if (postComments.length < 3) return;

  var victim = postComments[1];
  var all = Storage.getComments().filter(function (c) { return c.id !== victim.id; });
  await Storage.saveComments(all);
  await Storage.updatePost(target.id, { commentCount: all.filter(function (c) {
    return c.postId === target.id;
  }).length });

  localStorage.setItem(PATCH_KEY, '1');
  console.log('[评论] 已删除 3L：' + victim.content);
});
