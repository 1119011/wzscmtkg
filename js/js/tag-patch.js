/**
 * 帖子标签修正：将北风狼王发布的「找一部在暗网上看过的离奇动画」标签改为「失传媒体」
 */
Storage.ready().then(async function () {
  var PATCH_KEY = 'animePostTagPatch_v1';
  if (localStorage.getItem(PATCH_KEY)) return;

  var posts = Storage.getPosts();
  var matches = posts.filter(function (p) {
    return p.title.indexOf('找一部在暗网上看过的离奇动画') !== -1;
  });
  var target = matches.find(function (p) {
    return p.authorName === '北风狼王';
  }) || (matches.length === 1 ? matches[0] : null);

  if (!target) return;

  await Storage.updatePost(target.id, { tags: ['失传媒体'] });
  localStorage.setItem(PATCH_KEY, '1');
  console.log('[标签] 已更新为「失传媒体」');
});
