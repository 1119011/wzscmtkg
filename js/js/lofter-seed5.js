/**
 * LOFTER 帖子内容补全脚本（调查进展）
 * 将「找一部在暗网上看过的离奇动画5」原文评论，
 * 接在帖子「关于“暗网动画”调查进展」已有评论之后。
 * 只执行一次；原文楼层与论坛楼层不一致，这里按顺序逐条追加。
 */
Storage.ready().then(async function () {
  var SEED_KEY = 'animeInvestigationSeed_v1';
  if (localStorage.getItem(SEED_KEY)) return;

  var ENTRIES = [
    { floor: 1, author: null, content: "我的天啊是暗网管理员大人！" },
    { floor: 2, author: null, content: "从隔壁帖子过来的，时间跨度有点大。" },
    { floor: 3, author: null, content: "蹲一下。" },
    { floor: 4, author: null, content: "蹲一下。" },
    { floor: 5, author: null, content: "我的天暗网管理员大人真的是暗网管理员。" },
    { floor: 6, author: null, content: "实名上网吗。" },
    { floor: 7, author: null, content: "我靠，居然真的有进展吗？" },
    { floor: 8, author: null, content: "但是隔壁楼主都说是假的的了。" },
    { floor: 9, author: null, content: "你信息有点闭塞了。" },
    { floor: 10, author: null, content: "隔壁真楼主出来了。" },
    { floor: 11, author: null, content: "胸肌很棒，笑纳了。" },
    { floor: 12, author: null, content: "？" },
    { floor: 13, author: null, content: "你们只是去看胸肌的吗？" },
    { floor: 14, author: null, content: "他老婆也很棒。" },
    { floor: 15, author: null, content: "笑纳了。" },
    { floor: 16, author: null, content: "不要什么都笑纳！人家都结婚了啊！" },
    { floor: 17, author: null, content: "隔壁楼主升官发财睡网友吗？" },
    { floor: 18, author: null, content: "笑纳了。" },
    { floor: 19, author: null, content: "不要笑纳了啊喂！" },
    { floor: 20, author: "北风狼王", content: "给我干哪儿来了哈哈哈哈！" },
    { floor: 21, author: null, content: "我靠原楼主来了！" },
    { floor: 22, author: "北风狼王", content: "@暗网管理员\u00a0所以最后定位到的是这个网站吗？" },
    { floor: 23, author: null, content: "我咋点不进去呢？" },
    { floor: 24, author: "骑兵管理员", content: "加个VPN。" },
    { floor: 25, author: null, content: "要VPN。" },
    { floor: 26, author: null, content: "谢谢管理员提供的网址，我睡前就用这个。" },
    { floor: 27, author: null, content: "？" },
    { floor: 28, author: null, content: "有点猎奇了。" },
    { floor: 29, author: null, content: "大家相聚在这里谁也别嫌弃谁。" },
    { floor: 30, author: "暗网管理员", content: "是的，最后定位就是这个网站。" },
    { floor: 31, author: "暗网管理员", content: "楼主来看一下是不是这个网站。" },
    { floor: 32, author: null, content: "我看了原帖子，页面不太像啊。" },
    { floor: 33, author: null, content: "对，楼主是4399点进去的，我觉得那个都不知道是几手的视频了。" },
    { floor: 34, author: null, content: "肯定是转载出来了。" },
    { floor: 35, author: null, content: "楼主人呢？" },
    { floor: 36, author: null, content: "人呢？" },
    { floor: 37, author: null, content: "我对他失踪有ptsd了。" },
    { floor: 38, author: null, content: "没事儿，他应该是去喝酒了。" },
    { floor: 39, author: "北风狼王", content: "啊哈哈哈哈哈哈抱歉抱歉，刚刚我妻子给我倒了点酒来" },
    { floor: 40, author: null, content: "你看我说什么。" },
    { floor: 41, author: null, content: "。" },
    { floor: 42, author: null, content: "楼主有没有清醒过。" },
    { floor: 43, author: "北风狼王", content: "哦没有。" },
    { floor: 44, author: null, content: "没有？" },
    { floor: 45, author: "北风狼王", content: "哦我的意思是说，刚刚我妻子非要凑过来看我电脑我把他赶走了。" },
    { floor: 46, author: null, content: "楼主你在干什么？" },
    { floor: 47, author: null, content: "我们在正大光明聊天能不能别让嫂子误会。" },
    { floor: 48, author: null, content: "楼主我除了喜欢看你大胸肌我也没做什么伤天害理的事情。" },
    { floor: 49, author: "北风狼王", content: "不不不你们误会了，因为我在限制他接触网络的时间，一方面是他视力在下降，另外一方面也不好多说。" },
    { floor: 50, author: "北风狼王", content: "总而言之我现在打发他去和女儿买酒啦！" },
    { floor: 51, author: null, content: "我现在就像是一只阴暗的老鼠窥探楼主幸福生活的一角。" },
    { floor: 52, author: null, content: "烛光灵大人眼睛怎么有问题了。" },
    { floor: 53, author: null, content: "可能手机看多了吧。" },
    { floor: 54, author: null, content: "我还不是因为电脑看多了散光。" },
    { floor: 55, author: "北风狼王", content: "【图片·合照】" },
    { floor: 56, author: null, content: "哎呀哎呀，小姑娘好可爱啊！" },
    { floor: 57, author: null, content: "这他妈是小姑娘吗？这不红毛御姐吗？" },
    { floor: 58, author: null, content: "楼主你女儿比我们想象的要大。" },
    { floor: 59, author: null, content: "烛光灵大人和楼主女儿怎么有遗传黑眼圈？" },
    { floor: 60, author: null, content: "好像两只猫猫哦。" },
    { floor: 61, author: null, content: "虽然但是我一直对烛光灵大人的眼睛有点恐怖谷效应。" },
    { floor: 62, author: null, content: "对对对" },
    { floor: 63, author: null, content: "有点不太像人类的眼睛。" },
    { floor: 64, author: null, content: "楼上不觉得这么说别人很没礼貌吗？" },
    { floor: 65, author: null, content: "烛光灵大人还在电脑旁边看着呢。" },
    { floor: 66, author: null, content: "很没礼貌好吗？" },
    { floor: 67, author: "北风狼王", content: "哦没事没事，他已经带着罗莎去教堂了，希望罗莎不要心软又把手机借给他玩哈哈哈哈哈哈。" },
    { floor: 68, author: null, content: "好憋屈的烛光灵大人。" },
    { floor: 69, author: null, content: "居然要找女儿借手机吗？" },
    { floor: 70, author: null, content: "怎么办我一直在笑。" },
    { floor: 71, author: "暗网管理员", content: "对面网站员工回复我消息了。" },
    { floor: 72, author: "暗网管理员", content: "转载自邮件：" },
    { floor: 73, author: null, content: "卧槽找到了！" },
    { floor: 74, author: null, content: "卧槽！" },
    { floor: 75, author: null, content: "暗网管理员大人！" },
    { floor: 76, author: null, content: "这个效率太高了。" },
    { floor: 77, author: null, content: "楼主快看看是不是。" },
    { floor: 78, author: null, content: "难道我有生之年可以看见互联网悬案被破解吗？" },
    { floor: 79, author: "北风狼王", content: "可是我打不开啊。" },
    { floor: 80, author: "暗网管理员", content: "打不开是正常的，因为年代太久远很多都失效了。" },
    { floor: 81, author: "暗网管理员", content: "但是以上三个链接都提到了被困浴室以及虐杀的关键词。" },
    { floor: 82, author: null, content: "我鸡皮疙瘩起来了。" },
    { floor: 83, author: null, content: "我流汗了吗？原来是尿啊。" },
    { floor: 84, author: null, content: "怎么连屎也出来了。" },
    { floor: 85, author: null, content: "别吓我，我真怕了。" },
    { floor: 86, author: "暗网管理员", content: "那边管理员给我说，其中一个链接是一个叫做暗黑动漫的动漫网站，我怀疑当年楼主就是在那个上面看到的。" },
    { floor: 87, author: null, content: "楼主你说呢？" },
    { floor: 88, author: "北风狼王", content: "我也不记得了哈哈哈哈哈。" },
    { floor: 89, author: null, content: "楼主这不好笑我要吓尿了。" },
    { floor: 90, author: "暗网管理员", content: "我去用了网页时光机，然后找到了这个网站的明网存档。" },
    { floor: 91, author: null, content: "网页时光机是啥？" },
    { floor: 92, author: "骑兵管理员", content: "网页时光机是互联网档案馆的一个功能，能查询失效网页。" },
    { floor: 93, author: null, content: "竟然有这么高级的东西吗？" },
    { floor: 94, author: "骑兵管理员", content: "这个需要查很久的，估计要等一会儿。" },
    { floor: 95, author: null, content: "焦虑等待中。" },
    { floor: 96, author: null, content: "加油啊管理员大人。" },
    { floor: 97, author: null, content: "我沿着管理员大人的路线去网站看了。" },
    { floor: 98, author: null, content: "怎么能有这么多猎奇的东西啊。" },
    { floor: 99, author: null, content: "看完中午吃的饭都吐出来了。" },
    { floor: 100, author: null, content: "挪德卡莱怎么这么多阴间东西。" },
    { floor: 101, author: null, content: "我看到东欧小电影都有点反胃。" },
    { floor: 102, author: "北风狼王", content: "因为他们那边自从解体以后就没安宁过啊。" },
    { floor: 103, author: "北风狼王", content: "有好多家庭都是因为时代原因分崩离析，那一代人完全是时代的创伤。" },
    { floor: 104, author: null, content: "本地人必须发言这是真的。" },
    { floor: 105, author: null, content: "当时经济形势很不好，而且好多好多孩子，生了好多好多孩子。" },
    { floor: 106, author: null, content: "你们看过动漫《黑礁》应该就知道了。" },
    { floor: 107, author: null, content: "还有儿童xx电影。" },
    { floor: 108, author: null, content: "我有点想吐。" },
    { floor: 109, author: null, content: "我也。" },
    { floor: 110, author: "暗网管理员", content: "我找到了。" },
    { floor: 111, author: "暗网管理员", content: "【视频·\u00a0ARALOS\u00a0SOLNARI\u00a0CANNON】" }
  ];

  function norm(text) {
    return String(text || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  var posts = Storage.getPosts();
  var target = null;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].title.indexOf('调查进展') === -1) continue;
    if (posts[i].title.indexOf('暗网动画') === -1) continue;
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
  console.log('[LOFTER] 调查进展已从第 ' + (startIndex + 1) + ' 条起补入 ' + added + ' 条');
});
