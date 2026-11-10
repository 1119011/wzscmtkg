/**
 * 将帖子标题「关于“找一部在暗网上看过的离奇动画”该帖记录」
 * 改为「关于“找一部在暗网上看过的离奇动画”该帖整理」。
 * 只执行一次。
 */
Storage.ready().then(async function () {
  var RENAME_KEY = 'animeRecordRename_v1';
  if (localStorage.getItem(RENAME_KEY)) return;

  var posts = Storage.getPosts();
  var target = null;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].title.indexOf('找一部在暗网上看过的离奇动画') !== -1 &&
        posts[i].title.indexOf('该帖记录') !== -1) {
      target = posts[i];
      break;
    }
  }
  if (!target) return;

  await Storage.updatePost(target.id, {
    title: target.title.replace(/该帖记录/g, '该帖整理')
  });
  localStorage.setItem(RENAME_KEY, '1');
});
