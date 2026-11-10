/**
 * LOFTER 帖子内容补全脚本（记录帖）
 * 将「找一部在暗网上看过的离奇动画3」原文评论，
 * 接在帖子「关于“找一部在暗网上看过的离奇动画”该帖记录」已有评论之后。
 * 只执行一次；原文楼层与论坛楼层不一致，这里按顺序逐条追加。
 */
Storage.ready().then(async function () {
  var SEED_KEY = 'animeRecordCommentsSeed_v1';
  if (localStorage.getItem(SEED_KEY)) return;

  var ENTRIES = [
    { floor: 1, author: null, content: "？" },
    { floor: 2, author: null, content: "完全没听说过。" },
    { floor: 3, author: null, content: "去看了原贴，是有点猎奇。" },
    { floor: 4, author: null, content: "看描述挺毛骨悚然的。" },
    { floor: 5, author: null, content: "我好奇了。" },
    { floor: 6, author: null, content: "这个确实挺恐怖的。" },
    { floor: 7, author: null, content: "我觉得这个动漫听起来就吓人。" },
    { floor: 8, author: null, content: "看完帖子了。" },
    { floor: 9, author: null, content: "楼主最后回复是因为有人约他出去见面，说好把电脑修好就把动漫发在楼里。" },
    { floor: 10, author: null, content: "但是楼主再也没有回了。" },
    { floor: 11, author: null, content: "你们大白天能不能别吓我。" },
    { floor: 12, author: null, content: "对楼主再也没回复了。" },
    { floor: 13, author: null, content: "什么什么？" },
    { floor: 14, author: null, content: "你们别吓我。" },
    { floor: 15, author: null, content: "不是，你们真的信啊。" },
    { floor: 16, author: null, content: "楼主不是因为编不下去了自己跑路了吗？" },
    { floor: 17, author: null, content: "他为什么编不下去了。" },
    { floor: 18, author: null, content: "我觉得应该是被那个叫烛光灵的线下真实了吧。" },
    { floor: 19, author: null, content: "看完了。" },
    { floor: 20, author: null, content: "楼主就是骗子吧，我以前也喜欢编故事骗别人。" },
    { floor: 21, author: null, content: "但是说不通啊，就算他见面以后修好了电脑看到那部片子，他直接说不是还不是可以继续在楼里让别人寻找。" },
    { floor: 22, author: null, content: "可能不想玩了。" },
    { floor: 23, author: null, content: "我觉得很诡异。" },
    { floor: 24, author: null, content: "楼主销号了。" },
    { floor: 25, author: null, content: "我们现在别说连动漫存不存在，连楼主有没有活着都不知道。" },
    { floor: 26, author: null, content: "一群纯货，这么简单的骗局都看不出来。" },
    { floor: 27, author: null, content: "就你聪明。" },
    { floor: 28, author: null, content: "楼上怎么说话的？" },
    { floor: 29, author: null, content: "在论坛说话堪比非洲支教。" },
    { floor: 30, author: null, content: "每个人都在描述“朋友的朋友看过”，但谁都没有实际证据。它没有官方来源、没有制作信息，甚至可能从未真实存在过。" },
    { floor: 31, author: null, content: "但是楼主说过了啊，有很多电影也是这样。" },
    { floor: 32, author: null, content: "这里是失传媒体讨论论坛。" },
    { floor: 33, author: null, content: "所有失传媒体都是这样的。" },
    { floor: 34, author: null, content: "但是那个楼主如果真的想找到为什么后续不发声还要销号。" },
    { floor: 35, author: null, content: "我觉得那个烛光灵也像是托。" },
    { floor: 36, author: null, content: "很诡异啊没有人觉得这件事情就很诡异啊。" },
    { floor: 37, author: null, content: "楼主在楼里聊了很多的。" },
    { floor: 38, author: null, content: "楼主在楼里把自己的工作和照片都发了。" },
    { floor: 39, author: null, content: "对楼主还是警察来着。" },
    { floor: 40, author: null, content: "警察也看这玩意儿吗？" },
    { floor: 41, author: null, content: "楼主说自己在当警察之前还是个小混混呢。" },
    { floor: 42, author: null, content: "蒙德警察和我们这边不太一样。" },
    { floor: 43, author: null, content: "他去挪德卡莱出差然后约好见面，于是就再也没有发过消息。" },
    { floor: 44, author: null, content: "天菩萨你们一定要在这个时间点说这个吗？" },
    { floor: 45, author: null, content: "我求你们了。" },
    { floor: 46, author: null, content: "现在我宁愿相信是假的了。" },
    { floor: 47, author: "霜月祭司", content: "那个烛光灵本名：克里洛·楚德米洛维奇·菲林斯，至冬挪德卡莱人。" },
    { floor: 48, author: null, content: "？" },
    { floor: 49, author: null, content: "？" },
    { floor: 50, author: null, content: "？" },
    { floor: 51, author: null, content: "？" },
    { floor: 52, author: null, content: "卧槽盒！" },
    { floor: 53, author: null, content: "楼主！楼主有人开盒！" },
    { floor: 54, author: null, content: "楼主！" },
    { floor: 55, author: "霜月祭司", content: "我并没有开盒。" },
    { floor: 56, author: null, content: "额这个人是个漫画家吧。" },
    { floor: 57, author: null, content: "【图片·1】" },
    { floor: 58, author: null, content: "【图片·2】" },
    { floor: 59, author: null, content: "我点进去人家账号没有注销，全是平时画的插画。" },
    { floor: 60, author: null, content: "黄吗？" },
    { floor: 61, author: null, content: "什么黄不黄啊！人家画的正经插画！" },
    { floor: 62, author: null, content: "哦。" },
    { floor: 63, author: "霜月祭司", content: "看他的号应该是工作号，发了不少作品。" },
    { floor: 64, author: null, content: "我看了一下画的很好啊。" },
    { floor: 65, author: null, content: "查了一下网上真的有信息欸。" },
    { floor: 66, author: null, content: "人家有百度百科词条。" },
    { floor: 67, author: "小叶同学", content: "这是菲林斯教授啊。" },
    { floor: 68, author: null, content: "什么？" },
    { floor: 69, author: null, content: "知情人来了吗？" },
    { floor: 70, author: "小叶同学", content: "这是我以前至冬美院的教授啊，人很好的。" },
    { floor: 71, author: "小叶同学", content: "我记得他是一个很优雅很会说话的人，跟他聊天很开心，但是确实有时候会很阴郁。" },
    { floor: 72, author: null, content: "所以你教授现在还联系得上吗？" },
    { floor: 73, author: "小叶同学", content: "他好久以前就辞职了，大概是三年前吧。" },
    { floor: 74, author: null, content: "那不就是2012年吗？" },
    { floor: 75, author: null, content: "他作品集的最后更新日记也是2012年。" },
    { floor: 76, author: null, content: "我想到一些不好的事情。" },
    { floor: 77, author: null, content: "我也想到一些不好的事情。" },
    { floor: 78, author: null, content: "也就是说。" },
    { floor: 79, author: null, content: "这两个人见面以后目前就是失联状态？" },
    { floor: 80, author: null, content: "其中一个销号了一个没有销号。" },
    { floor: 81, author: null, content: "但是都联系不上了。" },
    { floor: 82, author: null, content: "知情人能联系上吗？" },
    { floor: 83, author: "小叶同学", content: "啊我可以试着给他发邮件如果他邮箱没有弃号的话。" },
    { floor: 84, author: "小叶同学", content: "因为我在挪德卡莱入学时间比较晚，所以并不是特别了解教授。" },
    { floor: 85, author: "小叶同学", content: "我只知道他离职以后去蒙德了。" },
    { floor: 86, author: null, content: "歪个楼，虽然但是这种是人家隐私吧。" },
    { floor: 87, author: null, content: "我们的目的不是找片吗？" },
    { floor: 88, author: null, content: "对我觉得这种隐私还是不要说比较好。" },
    { floor: 89, author: null, content: "我反而觉得这个已经不是隐私不隐私的问题了。" },
    { floor: 90, author: null, content: "人还活着吗？" },
    { floor: 91, author: null, content: "我一个人在走夜路现在一身冷汗。" },
    { floor: 92, author: null, content: "大晚上的别这样。" },
    { floor: 93, author: null, content: "可是烛光灵老师存档了动漫啊，修了这么多年如果修好了不就是找到了吗？" },
    { floor: 94, author: null, content: "对我觉得烛光灵老师这种用大号的不至于来造假。" },
    { floor: 95, author: null, content: "哇塞你家教授看猎奇动画？" },
    { floor: 96, author: null, content: "万一那个人只是窃了几张作品来伪造呢？" },
    { floor: 97, author: null, content: "大哥这是侵权的。" },
    { floor: 98, author: null, content: "人家没有必要为了网络上这点事连自己作品号都不要了。" },
    { floor: 99, author: null, content: "我越想越觉得恐怖兄弟们，" },
    { floor: 100, author: null, content: "所以你们的意思是说，一个楼主和烛光灵老师这种自曝了线下身份的一般没必要造假，" },
    { floor: 101, author: null, content: "但是就算我们知道他们线下的身份也不知道他们是死是活，因为目前处于失联状态。" },
    { floor: 102, author: null, content: "然而这一切失联都是因为他们在线下见过一次面之后？" },
    { floor: 103, author: null, content: "别吓我兄弟。" },
    { floor: 104, author: null, content: "对而且当时楼主也是很奇怪。" },
    { floor: 105, author: null, content: "这种动漫他却说自己很难过很难过，非常想再见他一面，" },
    { floor: 106, author: null, content: "烛光灵老师在原贴也是。" },
    { floor: 107, author: null, content: "忽然在见面前奇怪的说了一堆长篇大论。" },
    { floor: 108, author: null, content: "我真觉得事情有点不对劲儿了。" },
    { floor: 109, author: "北风狼王", content: "打扰了各位，我是原贴的楼主。" },
    { floor: 110, author: "北风狼王", content: "因为隔壁有人在冒充我所以我特意赶过来辟谣。" },
    { floor: 111, author: "北风狼王", content: "没想到吧我还活着哈哈哈哈哈哈！" }
  ];

  function norm(text) {
    return String(text || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  var posts = Storage.getPosts();
  var target = null;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].title.indexOf('该帖记录') === -1) continue;
    if (posts[i].title.indexOf('找一部在暗网上看过的离奇动画') === -1) continue;
    target = posts[i];
    break;
  }
  if (!target) return;

  var comments = Storage.getComments();
  var existing = comments
    .filter(function (c) { return c.postId === target.id; })
    .sort(function (a, b) { return a.createdAt - b.createdAt; });

  var startIndex = 0;
  var prefix = 0;
  while (prefix < existing.length && prefix < ENTRIES.length &&
         norm(existing[prefix].content) === norm(ENTRIES[prefix].content)) {
    prefix += 1;
  }

  if (prefix === existing.length) {
    startIndex = prefix;
  } else {
    var bestScore = 0;
    var bestIndex = -1;
    for (var k = 0; k < ENTRIES.length; k++) {
      if (norm(ENTRIES[k].content) !== norm(existing[existing.length - 1].content)) continue;
      var score = 0;
      var ei = existing.length - 1;
      var ai = k;
      while (ei >= 0 && ai >= 0 &&
             norm(existing[ei].content) === norm(ENTRIES[ai].content)) {
        score += 1;
        ei -= 1;
        ai -= 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestIndex = k;
      }
    }
    startIndex = (bestScore > 0 && bestIndex >= prefix) ? bestIndex + 1 : prefix;
  }

  var users = Storage.getUsers();
  function findUser(name) {
    return users.find(function (u) {
      return u.username === name || u.nickname === name;
    });
  }
  async function resolveAuthor(name) {
    if (!name) {
      var anon = users.find(function (u) {
        return u.isAnonymous || u.username === '';
      });
      if (!anon) {
        anon = {
          id: Storage.generateId(),
          username: '',
          password: '',
          nickname: '',
          createdAt: Date.now(),
          avatarColor: '#999999',
          isAnonymous: true
        };
        await Storage.addUser(anon);
        users = Storage.getUsers();
      }
      return anon.id;
    }
    var user = findUser(name);
    if (!user) {
      user = {
        id: Storage.generateId(),
        username: name,
        password: 'seed-user',
        nickname: name,
        createdAt: Date.now(),
        avatarColor: '#8A5A3B',
        isSeedUser: true
      };
      await Storage.addUser(user);
      users = Storage.getUsers();
    }
    return user.id;
  }

  var baseTime = Date.now();
  existing.forEach(function (c) {
    if (c.createdAt > baseTime) baseTime = c.createdAt;
  });
  baseTime += 1000;

  var added = 0;
  var entriesToAdd = ENTRIES.slice(startIndex);
  for (var ei = 0; ei < entriesToAdd.length; ei++) {
    var entry = entriesToAdd[ei];
    await Storage.addComment({
      id: Storage.generateId(),
      postId: target.id,
      content: entry.content,
      authorId: await resolveAuthor(entry.author),
      createdAt: baseTime + ei * 1000
    });
    added += 1;
  }

  localStorage.setItem(SEED_KEY, '1');
  console.log('[LOFTER] 记录帖已从第 ' + (startIndex + 1) + ' 条起补入 ' + added + ' 条');
});
