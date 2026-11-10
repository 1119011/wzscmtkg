/**
 * LOFTER 帖子内容补全脚本
 * 将「找一部在暗网上看过的离奇动画1」原文中
 * 「哇那很久以前了。」之后的评论，按顺序补入论坛同名帖子。
 * 只执行一次；原文楼层与论坛楼层不一致，这里按顺序逐条追加。
 */
Storage.ready().then(async function () {
  var SEED_KEY = 'lofterAnimeCommentsSeed_v1';
  if (localStorage.getItem(SEED_KEY)) return;

  var ANCHOR = '哇那很久以前了。';

  var ENTRIES = [
    { floor: 30, author: '暗网管理员', content: '四年前吗？' },
    { floor: 31, author: '楼主', content: '我觉得这个动漫的年纪应该更久远，当时也不知道是不是因为喝多了，所以甚至感觉包浆了呢！' },
    { floor: 32, author: null, content: '暗网动漫大多数都年代久远' },
    { floor: 33, author: null, content: '点了，你更别说这种猎奇的，' },
    { floor: 34, author: null, content: '我真的很好奇到底猎奇到什么程度能让一个大叔哭着入睡。' },
    { floor: 35, author: '骑兵管理员', content: '万一大叔本来就很感性呢？' },
    { floor: 36, author: null, content: '哈哈哈哈' },
    { floor: 37, author: null, content: '那就厉害了。' },
    { floor: 38, author: '烛光灵', content: '抱歉询问，请问里面角色长什么样子？' },
    { floor: 39, author: null, content: '对，楼主描述一下。' },
    { floor: 40, author: null, content: '我们有些人真的非常感兴趣。' },
    { floor: 41, author: null, content: '楼主呢！' },
    { floor: 42, author: null, content: '楼主！' },
    { floor: 43, author: '楼主', content: '哦哦哦来了，刚刚只是去冰箱拿了啤酒哈哈哈哈哈！' },
    { floor: 44, author: null, content: '怎么感觉楼主不是在喝酒就是在傻笑。' },
    { floor: 45, author: null, content: '点了。' },
    { floor: 46, author: '楼主', content: '哦这个我记得的。' },
    { floor: 47, author: '楼主', content: '有一个金色头发蓝眼睛的，是个德国人，然后看起来喝多了开头醒来醉醺醺的，头发颜色很鲜艳，脸上有一道疤看起来年纪有点大了。额，看起来有点壮实。' },
    { floor: 48, author: '楼主', content: '另外一个是俄国人，哦不，应该是东欧人。蓝黑色头发，然后高高瘦瘦的，我对他眼睛印象很深刻，是金黄色的好像有问题。' },
    { floor: 49, author: '楼主', content: '我记得刚开始的时候那个蓝黑色头发的很有礼貌，然后金色头发的很懒散，他们最开始只是在聊天辩论，最后开始吵架，然后发现真的出不去以后开始尖叫，那个尖叫的声音有点像闪灵，我给你们录一段。' },
    { floor: 50, author: '楼主', content: '【音频·1860】' },
    { floor: 51, author: null, content: '楼主我尿床上你知道吗？' },
    { floor: 52, author: null, content: '楼主你放这个音频要活全家啊？' },
    { floor: 53, author: null, content: '我厕所都不敢上了你信吗？' },
    { floor: 54, author: '楼主', content: '我说句实话我在调音频的时候也一直在流冷汗，如果让我再听到那个声音我也会发狂的。' },
    { floor: 55, author: '烛光灵', content: '那么，关于视频的标题呢？' },
    { floor: 56, author: null, content: '对啊，楼主还记得标题吗？' },
    { floor: 57, author: '楼主', content: '很遗憾我不认识日语，但是那的确是一串日语片假名混合着英文单词。但是我当时用的是windows\u00a0xp只能看见小方框。只能看到一个\u00a0punch。' },
    { floor: 58, author: '暗网管理员', content: '拳。' },
    { floor: 59, author: '蒲公英', content: '这也不是一个好词儿啊' },
    { floor: 60, author: '楼主', content: '顺便说一句，网站的布局和现在的视频预览器很像。' },
    { floor: 61, author: null, content: '可是楼主你不是从4399跳转吗？' },
    { floor: 62, author: null, content: '我在4399就差鬼没见过。' },
    { floor: 63, author: null, content: '这个和见鬼也差不多了。' },
    { floor: 64, author: null, content: '4399没有审核的。' },
    { floor: 65, author: '楼主', content: '额，我必须补充一下，这个确实给我一种很抽象的感觉，也许是因为我喝多了，我感觉他不是纯粹想要表达一些猎奇和血腥，而是作者挣扎着用这些隐喻好像要给我们传递什么。' },
    { floor: 66, author: '楼主', content: '而且我是真心实意为他们感到难过，金色头发的那个还在兴致勃勃和他讨论自己家里还有儿子和女儿，以及懂事的后辈。而蓝色头发那个最开始很有礼貌很绅士，然后应该是个贵族吧，我猜测的。' },
    { floor: 67, author: null, content: '为什么会猜测？' },
    { floor: 68, author: null, content: '里面的台词楼主还记得起来吗？' },
    { floor: 69, author: null, content: '别为难楼主了，他四年前看的。' },
    { floor: 70, author: '楼主', content: '因为他一直在强调自己的姓氏啊，然后好像也说过关于自己血统的故事，他的姓氏很特别，但是因为太长了我真的记不清了……' },
    { floor: 71, author: '楼主', content: '我记得整个片子最诡异的是，他基本上没有伴奏，只有水滴下来的声音。然后后面自杀的情节也是，根本没有恐怖音乐，只是那个金发男人抬眼看到蓝黑色头发的男人站在洗漱台前面直勾勾看着他，说对不起，我果然还是没有办法淹死自己，可以帮帮我吗？' },
    { floor: 72, author: null, content: '然后那个金色头发的男人就抓着他的头发把他摁到洗漱台的水里面，声音就是那种呼噜噜人呛水冒泡的声音。他死的时候很安静，把他从水里面提起来的时候就断气了。然后金色头发的男人估计没力气了就松手了，他的头砰地磕到洗手台边缘出了血，慢慢就滑到地上了。' },
    { floor: 73, author: '骑兵管理员', content: '楼主你这不记得挺清楚的吗？' },
    { floor: 74, author: null, content: '楼主说过他对自杀的情节印象很深。' },
    { floor: 75, author: null, content: '我还是觉得楼主是编的。' },
    { floor: 76, author: '烛光灵', content: '不是编的，我感觉我看过。' },
    { floor: 77, author: null, content: '！' },
    { floor: 78, author: null, content: '！' },
    { floor: 79, author: null, content: '！' },
    { floor: 80, author: '楼主', content: '！' },
    { floor: 81, author: null, content: '楼主你跟着干嘛！' },
    { floor: 82, author: '烛光灵', content: '我确实看过，情节大多都对得上。' },
    { floor: 83, author: '烛光灵', content: '补充一点，当时他们在浴室里排水口一直在往外冒着血水，第一天干干净净的，第二天就到脚踝了……最后就大概到腰的位置。' },
    { floor: 84, author: null, content: '猎奇动画总是不缺乏血腥场面。' },
    { floor: 85, author: null, content: '我觉得那不是暗网，那是深网，垃圾信息很多的。' },
    { floor: 86, author: '楼主', content: '哦哦哦我想起来了，就是大概第三天的时候，那个蓝黑色头发的人就尝试自杀了，他穿着高领然后就抓破了自己脖子，然后被拦住了。' },
    { floor: 87, author: '烛光灵', content: '他们开始接吻。' },
    { floor: 88, author: null, content: '？还有男同！' },
    { floor: 89, author: null, content: '怎么还有男同！' },
    { floor: 90, author: null, content: '猎奇动漫不是很正常吗？' },
    { floor: 91, author: null, content: '对，我当时还在想怎么没有这种环节。' },
    { floor: 92, author: '暗网管理员', content: '楼主你火了，帖子浏览量爆了。' },
    { floor: 93, author: '楼主', content: '诶？我只是喝了个酒！其实我也在拿着电脑开始找网址。' },
    { floor: 94, author: null, content: '其实我感觉楼主说的挺诚恳的。' },
    { floor: 95, author: null, content: '而且楼主也在努力回忆' },
    { floor: 96, author: '蒲公英', content: '这个情节我也觉得有点熟悉，我不知道什么时候看过。' },
    { floor: 97, author: null, content: '有线索吗？' },
    { floor: 98, author: '蒲公英', content: '我记得好像是当时用我上司电脑的时候不小心看到的，我当时在想这老登玩的还挺花。' },
    { floor: 99, author: null, content: '楼上还记得多少？' },
    { floor: 100, author: '骑兵管理员', content: '我在/a/上找到了这个名字TSEM，不知道楼主想起来没有。' },
    { floor: 101, author: '骑兵管理员', content: '说来也怪，我在谷歌上搜索没有任何结果，而且版主和管理员还删我帖子，楼主这是你找的那个吗？' }
  ];

  var posts = Storage.getPosts();
  var comments = Storage.getComments();

  var target = null;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].title.indexOf('找一部在暗网上看过的离奇动画') === -1) continue;
    var hasAnchor = comments.some(function (c) {
      return c.postId === posts[i].id && c.content === ANCHOR;
    });
    if (hasAnchor) { target = posts[i]; break; }
  }

  if (!target) return;

  var postComments = comments
    .filter(function (c) { return c.postId === target.id; })
    .sort(function (a, b) { return a.createdAt - b.createdAt; });

  var anchor = null;
  postComments.forEach(function (c) {
    if (c.content === ANCHOR) anchor = c;
  });
  if (!anchor) return;

  var users = Storage.getUsers();
  var anonymous = users.find(function (u) {
    return u.isAnonymous || u.username === '';
  });
  if (!anonymous) {
    anonymous = {
      id: Storage.generateId(),
      username: '',
      password: '',
      nickname: '',
      createdAt: Date.now(),
      avatarColor: '#999999',
      isAnonymous: true
    };
    await Storage.addUser(anonymous);
    users = Storage.getUsers();
  }
  var opAuthorId = target.authorId;

  function findUserId(name) {
    var user = users.find(function (u) {
      return u.username === name || u.nickname === name;
    });
    return user ? user.id : null;
  }

  function resolveAuthor(name) {
    if (!name) return anonymous ? anonymous.id : null;
    if (name === '楼主') {
      return findUserId('北风狼王') || opAuthorId;
    }
    return findUserId(name) || (anonymous ? anonymous.id : null);
  }

  var baseTime = anchor.createdAt;
  postComments.forEach(function (c) {
    if (c.createdAt > baseTime) baseTime = c.createdAt;
  });
  baseTime += 1000;
  if (baseTime < Date.now()) baseTime = Date.now();

  var added = 0;
  for (var ei = 0; ei < ENTRIES.length; ei++) {
    var entry = ENTRIES[ei];
    var authorId = resolveAuthor(entry.author);
    if (!authorId) continue;

    await Storage.addComment({
      id: Storage.generateId(),
      postId: target.id,
      content: entry.content,
      authorId: authorId,
      createdAt: baseTime + ei * 1000
    });
    added += 1;
  }

  if (added > 0) {
    localStorage.setItem(SEED_KEY, '1');
  }
  console.log('[LOFTER] 已补入评论 ' + added + ' 条');
});
