/**
 * LOFTER 帖子内容补全脚本（第二篇）
 * 将「找一部在暗网上看过的离奇动画2」原文中的评论，
 * 接在第一篇最后一条评论之后，按顺序补入论坛同名帖子。
 * 只执行一次；原文楼层与论坛楼层不一致，这里按顺序逐条追加。
 */
Storage.ready().then(async function () {
  var SEED_KEY = 'lofterAnimeCommentsSeed2_v1';
  if (localStorage.getItem(SEED_KEY)) return;

  var PREV_LAST = '说来也怪，我在谷歌上搜索没有任何结果，而且版主和管理员还删我帖子，楼主这是你找的那个吗？';

  var ENTRIES = [
    { floor: 314, author: "楼主", content: "醒了。" },
    { floor: 315, author: null, content: "楼主你醒啦？" },
    { floor: 316, author: null, content: "楼主你醒啦？" },
    { floor: 317, author: null, content: "楼主你醒啦？" },
    { floor: 318, author: "骑兵管理员", content: "楼主你醒啦？你变成女武神啦。" },
    { floor: 319, author: "暗网管理员", content: "黄花菜都凉了。" },
    { floor: 320, author: "楼主", content: "哦哦哦抱歉抱歉，昨天喝多了哈哈哈哈哈哈。" },
    { floor: 321, author: null, content: "楼主自己去爬楼好不好？" },
    { floor: 322, author: "楼主", content: "我错过了什么" },
    { floor: 323, author: null, content: "人家给你找出了第二个名字，你看过吗？" },
    { floor: 324, author: null, content: "楼主要不要搜一下第二个名字。" },
    { floor: 325, author: "骑兵管理员", content: "搜不到，被删帖了。" },
    { floor: 326, author: null, content: "有没有可能是《少女椿》那种。" },
    { floor: 327, author: null, content: "那不是少女漫吗？" },
    { floor: 328, author: null, content: "我是说大概就是那种类型。" },
    { floor: 329, author: "烛光灵", content: "个人拙见，更像是《梅图一雄的诅咒》。" },
    { floor: 330, author: null, content: "阴成啥样了。" },
    { floor: 331, author: null, content: "这个太阴间了。" },
    { floor: 332, author: "楼主", content: "可是我觉得原片更阴间诶。" },
    { floor: 333, author: null, content: "听出来了。" },
    { floor: 334, author: "蒲公英", content: "我捋了一下，所以这个动漫的要素大概是男子被困浴室崩溃自杀是吧。" },
    { floor: 335, author: "蒲公英", content: "我有一点点印象，但是因为看的太匆忙所以后半段没看。" },
    { floor: 336, author: null, content: "还有后半段？" },
    { floor: 337, author: null, content: "楼主有说后半段吗？" },
    { floor: 338, author: null, content: "没有人提过后半段啊" },
    { floor: 339, author: "楼主", content: "啊我没有看过后半段。" },
    { floor: 340, author: "楼主", content: "我刚刚在爬楼哈哈哈哈哈哈哈。" },
    { floor: 341, author: "烛光灵", content: "我没有看到后半段。" },
    { floor: 342, author: null, content: "都没有看到过后半段吗？" },
    { floor: 343, author: "烛光灵", content: "内容是戛然而止的。" },
    { floor: 344, author: "楼主", content: "我没有看过后半段，我只能看到其中一个人死掉的那一部分。" },
    { floor: 345, author: null, content: "也就是楼主是看到的前半部分就是，金发男人把蓝黑色头发的男人淹死在水池里，然后动画结束？" },
    { floor: 346, author: null, content: "有点诡异了。" },
    { floor: 347, author: null, content: "有点诡异了。" },
    { floor: 348, author: "楼主", content: "欸好像是有后半部分但是我当时好像哭晕过去了记不住了哈哈哈哈哈哈。" },
    { floor: 349, author: "楼主", content: "你们不要自己吓自己啦！" },
    { floor: 350, author: null, content: "楼主有没有可能一直是你在吓我们？" },
    { floor: 351, author: "骑兵管理员", content: "楼主我又翻出来一部动漫你来看看是不是？" },
    { floor: 734, author: "烛光灵", content: "你们怎么讨论到700多楼了？" },
    { floor: 735, author: null, content: "我靠烛光灵老大！" },
    { floor: 736, author: null, content: "烛光灵老大回来了！" },
    { floor: 737, author: "楼主", content: "我靠你还活着啊？" },
    { floor: 738, author: "烛光灵", content: "……" },
    { floor: 739, author: "烛光灵", content: "我只是忙了一周没有上论坛。" },
    { floor: 740, author: null, content: "你回来了烛光灵大人。" },
    { floor: 741, author: null, content: "烛光灵大人，一个好消息和一个坏消息你要听哪一个？" },
    { floor: 742, author: "烛光灵", content: "坏消息。" },
    { floor: 743, author: "骑兵管理员", content: "坏消息是我们还是没有找到。" },
    { floor: 744, author: "烛光灵", content: "好消息呢？" },
    { floor: 745, author: "暗网管理员", content: "这个帖子已经变成楼主水聊帖了。" },
    { floor: 746, author: null, content: "对，前两天楼主还自曝了照片。" },
    { floor: 747, author: null, content: "【图片·1】" },
    { floor: 748, author: null, content: "【图片.2】" },
    { floor: 749, author: null, content: "楼主还是个金毛西洋菜？" },
    { floor: 750, author: null, content: "楼主不是说自己是邋遢宅男炫压抑大叔吗？" },
    { floor: 751, author: null, content: "对啊，说好大叔怎么是型男？" },
    { floor: 752, author: "暗网管理员", content: "甚至楼主还没有三十岁。" },
    { floor: 753, author: null, content: "楼主你欺骗了我们。" },
    { floor: 754, author: null, content: "楼主呢！" },
    { floor: 755, author: null, content: "楼主！" },
    { floor: 756, author: "楼主", content: "来了来了。" },
    { floor: 757, author: "蒲公英", content: "是不是又喝了。" },
    { floor: 758, author: "楼主", content: "刚刚看到烛光灵大人回来太高兴了喝了两杯哈哈哈哈哈哈。" },
    { floor: 789, author: "蒲公英", content: "你看我说啥。" },
    { floor: 790, author: null, content: "算无遗策。" },
    { floor: 791, author: "烛光灵", content: "所以你们还在找吗？" },
    { floor: 792, author: "骑兵管理员", content: "我基本上找了好几部那种情节相近的动漫但是楼主都说不是，暗网管理员准备追踪一下网址。" },
    { floor: 793, author: null, content: "追踪4399吗？" },
    { floor: 794, author: null, content: "可以追踪快手。" },
    { floor: 795, author: null, content: "这个更阴。" },
    { floor: 796, author: null, content: "这个更阴。" },
    { floor: 797, author: "烛光灵", content: "话说楼主是干什么的？" },
    { floor: 798, author: null, content: "楼主不是炫压抑宅男吗？" },
    { floor: 799, author: null, content: "楼主还说他是大叔结果呢？" },
    { floor: 800, author: null, content: "是胸肌比我脸大的型男。" },
    { floor: 801, author: null, content: "楼主真的很帅啊，但是为什么一天到晚不是在喝酒就是在傻笑。" },
    { floor: 802, author: "楼主", content: "风神在上，喝酒是生活啊喂！" },
    { floor: 803, author: "烛光灵", content: "楼主是蒙德人吧。" },
    { floor: 804, author: "烛光灵", content: "为什么IP在挪德卡莱。" },
    { floor: 805, author: null, content: "欸楼主IP都变了诶。" },
    { floor: 806, author: null, content: "前两天还是在蒙德来着。" },
    { floor: 807, author: "楼主", content: "哈哈哈哈哈因为楼主我啊出差去了。" },
    { floor: 808, author: "楼主", content: "关于楼主做什么工作吗？" },
    { floor: 809, author: "楼主", content: "我的工作也不是不能说，因为楼主以前是个不务正业的小混混但是后来忽然想通了就去当了警察啦！" },
    { floor: 810, author: "暗网管理员", content: "警察可以一直喝酒摸鱼吗？" },
    { floor: 811, author: null, content: "楼主居然是警察吗？" },
    { floor: 812, author: null, content: "完全看不出来。" },
    { floor: 813, author: "烛光灵", content: "打扰了，但是我这边有重要线索。" },
    { floor: 814, author: "烛光灵", content: "我这个星期因为一直在念念不忘这件事，甚至在浴室里也经常想起那个金发男人坐在浴室的血泊中静静看着我，所以回到我的老宅子，拿到了以前我的电脑。" },
    { floor: 815, author: "烛光灵", content: "因为我当时确实对这个动画印象颇为深刻，所以我点击了缓存。但是因为这个电脑实在是年久失修，所以楼主有空线下来见一面吗？" },
    { floor: 816, author: null, content: "我靠不愧是烛光灵大人，这就找到了吗？" },
    { floor: 817, author: null, content: "别高兴的太早，烛光灵大人说了电脑打不开了。" },
    { floor: 818, author: null, content: "但是只要电脑打开就可以看到视频了啊。" },
    { floor: 819, author: "蒲公英", content: "楼主又不会修电脑。" },
    { floor: 820, author: "楼主", content: "喂我也是会一点的好吗？" },
    { floor: 821, author: "楼主", content: "就算我不会我们也可以一起去找专业修电脑的人啊。" },
    { floor: 822, author: "烛光灵", content: "什么时候见面。" },
    { floor: 823, author: "楼主", content: "我吗，我明天下午的飞机哈哈哈，要不上午见面好吗？" },
    { floor: 824, author: "烛光灵", content: "可以。" },
    { floor: 825, author: "烛光灵", content: "我的地址是在北地的坟茔——劳烦你前来。" },
    { floor: 826, author: "楼主", content: "啊哈哈哈哈哈哈好哦，到时候我们带上一瓶好酒然后好好说说。" },
    { floor: 827, author: null, content: "楼主又喝上了。" },
    { floor: 828, author: null, content: "楼主真的要和烛光灵大人一边看下饭视频然后一边喝酒吗？" },
    { floor: 829, author: "骑兵管理员", content: "没事儿可以先刷会儿快手。" },
    { floor: 830, author: "骑兵管理员", content: "一会儿就当洗洗眼睛。" },
    { floor: 831, author: "烛光灵", content: "虽然但是，其实这么多天我一直很困惑，也不知道自己在做什么。" },
    { floor: 832, author: "烛光灵", content: "我不得不提醒一句，那部动画其实给我造成了不少的心理伤害，其中两个人对于自己的经历的叙述也让我十分共情。以至于当时我看到死亡场景的时候开始呕吐，不是因为血腥，是因为悲伤。" },
    { floor: 833, author: "烛光灵", content: "我也不知道为什么可能是因为这种绝望恐怖是蔓延的，所以这一周我也在思考，或许这样的片子一开始就不该存在。就像我想起开头他们困在那里的原因也仅仅是因为蓝黑色头发的那个男人想要自杀，然而挣扎了这么久还是回归到一样的结果。" },
    { floor: 834, author: "烛光灵", content: "以上就是我想要说的，如果真的有人想要看这部动画，我劝你们慎重。" },
    { floor: 835, author: null, content: "烛光灵大人忽然好严肃。" },
    { floor: 836, author: null, content: "把我吓到了。" },
    { floor: 837, author: null, content: "我也。" },
    { floor: 838, author: null, content: "烛光灵大人别这样。" },
    { floor: 839, author: null, content: "都是成年人了，看不看都是自己的事情。" },
    { floor: 840, author: "楼主", content: "忽然这么严肃真是吓我一跳呢哈哈哈哈哈。" },
    { floor: 841, author: "楼主", content: "说实话我也觉得那部动画惨烈得让人难以置信。" },
    { floor: 842, author: "楼主", content: "但是我还是为他们感到难过，以及非常非常想再见一面。" },
    { floor: 843, author: "楼主", content: "啊呀我觉着现在说这些也无意义，不如到时候我们相聚之后再好好聊聊哈哈哈哈哈！" },
    { floor: 844, author: null, content: "是啊。" },
    { floor: 845, author: null, content: "楼主和烛光灵大人见面以后一定要给我们汇报啊。" },
    { floor: 846, author: null, content: "蹲。" },
    { floor: 847, author: null, content: "蹲。" },
    { floor: 848, author: null, content: "蹲" },
    { floor: 1788, author: null, content: "浏览器🔍shaknb点me，里面什么都有，你们也用得上。" },
    { floor: 1789, author: null, content: "？" },
    { floor: 1790, author: null, content: "？" },
    { floor: 1791, author: null, content: "楼主麦片的来了处理一下。" },
    { floor: 1792, author: null, content: "浏览器🔍shaknb点me，里面什么都有，你们也用得上。" },
    { floor: 1793, author: null, content: "我不行了。" },
    { floor: 1794, author: null, content: "？" },
    { floor: 1795, author: null, content: "麦什么？" },
    { floor: 1796, author: null, content: "楼主麦片的混进来啦啊啊啊啊啊！" },
    { floor: 1797, author: null, content: "举报了。" },
    { floor: 1798, author: null, content: "还在想什么呢，楼主早就销号跑路了。" },
    { floor: 1799, author: null, content: "对，楼主就是个骗子。" },
    { floor: 1800, author: null, content: "估计和那个烛光灵见面以后编不下去了就没脸在楼里混了。" },
    { floor: 1801, author: null, content: "但是楼主说的很诚恳啊。" },
    { floor: 1802, author: null, content: "就是骗子。" },
    { floor: 1803, author: null, content: "难为他编这么多了。" }
  ];

  var posts = Storage.getPosts();
  var comments = Storage.getComments();

  var target = null;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].title.indexOf('找一部在暗网上看过的离奇动画') === -1) continue;
    var hasPrev = comments.some(function (c) {
      return c.postId === posts[i].id && c.content === PREV_LAST;
    });
    if (hasPrev) { target = posts[i]; break; }
  }

  if (!target) return;

  var postComments = comments
    .filter(function (c) { return c.postId === target.id; })
    .sort(function (a, b) { return a.createdAt - b.createdAt; });

  var prev = null;
  postComments.forEach(function (c) {
    if (c.content === PREV_LAST) prev = c;
  });
  if (!prev) return;

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

  var baseTime = prev.createdAt;
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
  console.log('[LOFTER] 第二篇已补入评论 ' + added + ' 条');
});
