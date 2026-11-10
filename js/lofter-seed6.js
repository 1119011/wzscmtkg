/**
 * LOFTER 帖子内容补全脚本（调查进展·第六篇）
 * 将「找一部在暗网上看过的离奇动画6」原文评论，
 * 接在帖子「关于“暗网动画”调查进展」已有评论之后。
 * 只执行一次；原文楼层与论坛楼层不一致，这里按顺序逐条追加。
 */
Storage.ready().then(async function () {
  var SEED_KEY = 'animeInvestigationSeed6_v1';
  if (localStorage.getItem(SEED_KEY)) return;

  var ENTRIES = [
    { floor: 231, author: "北风狼王", content: "【视频·40s】" },
    { floor: 232, author: null, content: "？" },
    { floor: 233, author: null, content: "楼主好啊" },
    { floor: 234, author: null, content: "楼主怎么凌晨1:00上线了。" },
    { floor: 235, author: null, content: "楼主不是不熬夜吗？" },
    { floor: 236, author: null, content: "卧槽这视频是什么啊？" },
    { floor: 237, author: null, content: "好黑。" },
    { floor: 238, author: null, content: "这个是楼主的前置摄像头吧。" },
    { floor: 239, author: null, content: "对。" },
    { floor: 240, author: null, content: "我看到楼主大胸肌了。" },
    { floor: 241, author: null, content: "不要看胸肌啊喂！" },
    { floor: 242, author: null, content: "不是很诡异啊。" },
    { floor: 243, author: null, content: "为什么楼主的睡衣也这么慷慨。" },
    { floor: 244, author: null, content: "不要看胸肌啦！" },
    { floor: 245, author: null, content: "我只听到了鼠标声。" },
    { floor: 246, author: null, content: "楼主是不是忘了关摄像头所以录下来了。" },
    { floor: 247, author: null, content: "那大半夜发出来干什么？" },
    { floor: 248, author: null, content: "@北风狼王" },
    { floor: 249, author: null, content: "楼主你要干什么？" },
    { floor: 250, author: null, content: "楼主不会又喝多了发酒疯吧@北风狼王。" },
    { floor: 251, author: null, content: "【截图】" },
    { floor: 252, author: null, content: "楼主出来说句话。" },
    { floor: 253, author: null, content: "咋还截图人家胸肌啊。" },
    { floor: 254, author: null, content: "你们看这个。" },
    { floor: 255, author: null, content: "别看胸肌了。" },
    { floor: 256, author: null, content: "你们看楼主后面。" },
    { floor: 257, author: null, content: "不是黑的吗？" },
    { floor: 258, author: null, content: "你们看楼主后面。" },
    { floor: 259, author: null, content: "卧槽我打字的时候冷汗都下来了。" },
    { floor: 260, author: null, content: "卧槽我看到了。" },
    { floor: 261, author: null, content: "什么什么？" },
    { floor: 262, author: null, content: "楼主后面有人。" },
    { floor: 263, author: null, content: "我没看到啊不是黑色的吗？" },
    { floor: 264, author: null, content: "后面有" },
    { floor: 265, author: null, content: "我擦。" },
    { floor: 266, author: null, content: "不。" },
    { floor: 267, author: null, content: "卧槽喔打字阿狗。" },
    { floor: 268, author: null, content: "你看后面有两个光点。" },
    { floor: 269, author: null, content: "我打字现在手都在抖。" },
    { floor: 270, author: null, content: "【截图·曝光提高】" },
    { floor: 271, author: null, content: "我他妈喷出来了" },
    { floor: 272, author: null, content: "卧槽。" },
    { floor: 273, author: null, content: "你妈的那是什么？" },
    { floor: 274, author: null, content: "这不是烛光灵大人吗？" },
    { floor: 275, author: null, content: "他为什么爬在地上地上？" },
    { floor: 276, author: null, content: "他嘴巴上有东西。" },
    { floor: 277, author: null, content: "卧槽这他妈是什么啊？" },
    { floor: 278, author: null, content: "我看清楚了。" },
    { floor: 279, author: null, content: "他嘴巴上叼着水果刀。" },
    { floor: 280, author: null, content: "我吓尿了你们知道吗我现在一个人在上夜班。" },
    { floor: 281, author: null, content: "楼主呢？@北风狼王" },
    { floor: 282, author: null, content: "有没有楼主亲友联系得上楼主！@北风狼王" },
    { floor: 283, author: null, content: "我现在手都在抖。" },
    { floor: 284, author: null, content: "【截图·放大】" },
    { floor: 285, author: null, content: "他没有在看楼主。" },
    { floor: 286, author: null, content: "他在看我们。" },
    { floor: 287, author: null, content: "我真的不行了。" },
    { floor: 288, author: null, content: "给我看死了知道吗？" },
    { floor: 289, author: null, content: "楼主呢！" },
    { floor: 290, author: null, content: "楼主不会已经……" },
    { floor: 291, author: null, content: "你们在想什么？" },
    { floor: 292, author: null, content: "人家结婚这么多年怎么可能！" },
    { floor: 293, author: null, content: "对啊万一只是烛光灵大人想要整蛊一下楼主呢！" },
    { floor: 294, author: null, content: "他妈的楼主倒是回话啊！" },
    { floor: 295, author: null, content: "谁家夫妻半夜叼着刀在地上爬！" },
    { floor: 296, author: null, content: "@北风狼王" },
    { floor: 297, author: null, content: "谁有楼主联系方式。" },
    { floor: 298, author: null, content: "要不要报警啊这个太吓人。" },
    { floor: 299, author: null, content: "楼主就是警察他报自己啊？" },
    { floor: 300, author: null, content: "神金害的我一边尿一边笑。" },
    { floor: 301, author: null, content: "别开玩笑了，这个真的很吓人。" },
    { floor: 302, author: "北风狼王", content: "【视频·30s】" },
    { floor: 303, author: null, content: "他妈的这他妈又是啥啊！" },
    { floor: 304, author: null, content: "为什么。" },
    { floor: 305, author: null, content: "好黑。" },
    { floor: 306, author: null, content: "我看到他眼睛了。" },
    { floor: 307, author: null, content: "烛光灵大人？" },
    { floor: 308, author: null, content: "卧槽这是要做什么啊？" },
    { floor: 309, author: null, content: "他为什么就这么一动不动在电脑面前盯着我们。" },
    { floor: 310, author: null, content: "我不敢看。" },
    { floor: 311, author: null, content: "我求你们了。" },
    { floor: 312, author: null, content: "所以楼主本人呢？" },
    { floor: 313, author: null, content: "他为什么就不说话就在电脑面前看着我们微笑" },
    { floor: 314, author: null, content: "我一早就说过他眼睛不太像人类的眼睛。" },
    { floor: 315, author: null, content: "所以楼主呢！" },
    { floor: 316, author: null, content: "我真的会被吓死啊！" },
    { floor: 317, author: null, content: "楼主人呢？" },
    { floor: 318, author: null, content: "等一下也就是说现在在线的是烛光灵大人？" },
    { floor: 319, author: null, content: "你们有没有觉得烛光灵大人看起来精神不太正常。" },
    { floor: 320, author: null, content: "就是他平时，根据楼主的描述。" },
    { floor: 321, author: null, content: "还有那些照片，还有他画的画。" },
    { floor: 322, author: null, content: "对他平时表现有一种因为服用镇静或者抗抑郁药物带来的迟钝感。" },
    { floor: 323, author: null, content: "也别这么说。" },
    { floor: 324, author: null, content: "谁家正常人会这么半夜叼着刀在地上爬！" },
    { floor: 325, author: null, content: "曹操。" },
    { floor: 326, author: null, content: "那他妈是献刀！" },
    { floor: 327, author: null, content: "烛光灵大人的账号画的画都很清新啊，功底很好，而且用色也很漂亮。" },
    { floor: 328, author: null, content: "万一人家只是天生迟钝呢！" },
    { floor: 329, author: null, content: "我不信。" },
    { floor: 330, author: null, content: "我真的要被吓死了你们知道吗？" },
    { floor: 331, author: null, content: "楼主还活着吗？" },
    { floor: 332, author: null, content: "@小叶同学\u00a0菲林斯教授的亲友能不能联系一下？" },
    { floor: 333, author: "小叶同学", content: "我联系不上教授啊，而且我在挪德卡莱他在蒙德我怎么联系得上啊！" },
    { floor: 334, author: null, content: "报警吧。" },
    { floor: 335, author: null, content: "烛光灵大人是不是被什么脏东西影响了。" },
    { floor: 336, author: null, content: "不会吧，怎么会。" },
    { floor: 337, author: null, content: "你们别吓我好吗？" },
    { floor: 338, author: "北风狼王", content: "啊啊啊哈哈怎么一会儿不见你们怎么吓成这样。" },
    { floor: 339, author: null, content: "楼主！" },
    { floor: 340, author: null, content: "楼主你看看你还在阳间吗！" },
    { floor: 341, author: null, content: "楼主你他吗还活着啊！" },
    { floor: 342, author: null, content: "我有点死了！" },
    { floor: 343, author: null, content: "你们在做什么我草，卧槽…" },
    { floor: 344, author: null, content: "楼主你知道你老婆叼着个刀在你背后满地爬吗？" },
    { floor: 345, author: "北风狼王", content: "我知道啊。他在cos扫地机器人" },
    { floor: 346, author: null, content: "？" },
    { floor: 347, author: null, content: "？楼主我们看起来是傻逼吗？" },
    { floor: 348, author: null, content: "卧槽你在做什么啊！" },
    { floor: 349, author: null, content: "【图片·昏暗灯光·合照】" },
    { floor: 350, author: null, content: "哦看到楼主和烛光灵大人全须全尾我就放心了。" },
    { floor: 351, author: null, content: "卧槽吓死我了楼主。" },
    { floor: 352, author: null, content: "不要让烛光灵大人开这种玩笑了。" },
    { floor: 353, author: null, content: "怪不得楼主不让他玩电脑。" },
    { floor: 354, author: "霜月之子", content: "你们两个是打架了吗？" },
    { floor: 355, author: null, content: "？在说什么？楼主说了他们两个关系很好。" },
    { floor: 356, author: null, content: "楼主夫妻关系很和谐吧。" },
    { floor: 357, author: "霜月之子", content: "那你掐着他后颈不放干什么？" },
    { floor: 358, author: "霜月之子", content: "而且你手掌上也绑了ok绷。" },
    { floor: 359, author: "霜月之子", content: "他现在精神恍惚嘴角还有水渍的样子\u00a0，看起来像被你强行灌了药物吧。" },
    { floor: 360, author: null, content: "我同意，我还是觉得菲林斯教授精神不太正常的样子。" },
    { floor: 361, author: null, content: "不要乱猜测好吗？" },
    { floor: 362, author: "北风狼王", content: "风神在上啊" },
    { floor: 363, author: "霜月之子", content: "神明真的有用吗？" },
    { floor: 364, author: null, content: "但是照片确实不太正常啊。" },
    { floor: 365, author: null, content: "我求你们了能不能别吓我了。" },
    { floor: 366, author: null, content: "人家夫妻之间的隐私不要乱猜测好不好。" },
    { floor: 367, author: null, content: "楼主都说生活幸福随便闹着玩的，你们替人家担心上了吗？" },
    { floor: 368, author: "北风狼王", content: "我再郑重说一遍，我的妻子精神没有问题，希望你们不要传谣言了。他确实平时喜欢搞一些恶作剧但是这不能说他什么脑子有问题，而且他有些习惯我也觉得很莫名其妙，比如喜欢抱着灯睡觉吃饭散步，但是这些都无关紧要，他变成什么样子我都喜欢。" },
    { floor: 369, author: "北风狼王", content: "他失去了工作，也选择和我走。那么我无论如何都不会让他以后过得痛苦。" },
    { floor: 370, author: null, content: "楼主真男人。" },
    { floor: 371, author: null, content: "看哭了。" },
    { floor: 372, author: null, content: "我无言面对楼主胸肌。" },
    { floor: 373, author: "霜月之子", content: "可是我觉得有时候我们需要接受现实。" },
    { floor: 374, author: null, content: "卧槽楼上烦不烦？" },
    { floor: 375, author: null, content: "上次开盒烛光灵大人也是他。" },
    { floor: 376, author: null, content: "能不能不要对别人的私生活指指点点。" },
    { floor: 377, author: null, content: "没礼貌啊。" },
    { floor: 378, author: null, content: "真的很没礼貌。" },
    { floor: 501, author: "暗网管理员", content: "根据我很久的查询目前确认了一个链接。" },
    { floor: 502, author: "暗网管理员", content: "点开以后是这个动画。我觉得根据描述应该是楼主当时看的原版。" },
    { floor: 503, author: "暗网管理员", content: "@北风狼王\u00a0你可以过目一下。" },
    { floor: 504, author: null, content: "！真的吗！" },
    { floor: 505, author: null, content: "我的天居然真的找到了。" },
    { floor: 506, author: null, content: "卧槽难道我要见证历史了！" },
    { floor: 507, author: null, content: "卧槽我追了三年的互联网悬案终于出结局了！" },
    { floor: 508, author: "北风狼王", content: "我看一下我看一下！" },
    { floor: 509, author: "北风狼王", content: "如果真的这样，我要倒两杯酒开心一下哈哈哈哈哈！" },
    { floor: 510, author: null, content: "你倒是开心了楼主。" },
    { floor: 511, author: null, content: "我们昨天晚上吓尿了。" },
    { floor: 512, author: "北风狼王", content: "抱歉哈哈哈哈哈哈哈。" },
    { floor: 513, author: null, content: "诶我怎么点不开。" },
    { floor: 514, author: null, content: "加个vpn试试？" },
    { floor: 515, author: null, content: "已经加了啊。" },
    { floor: 516, author: null, content: "我也点不开啊。" },
    { floor: 517, author: null, content: "昨天那个都可以点开。" },
    { floor: 518, author: null, content: "昨天那个只有开头，暗网管理员大人去找原片了。" },
    { floor: 519, author: null, content: "楼主打开了吗？" },
    { floor: 520, author: "北风狼王", content: "没有。" },
    { floor: 521, author: "北风狼王", content: "有进去的吗？" },
    { floor: 522, author: null, content: "我没有。" },
    { floor: 523, author: null, content: "我也没有。" },
    { floor: 524, author: null, content: "这是怎么回事@暗网管理员" },
    { floor: 525, author: "暗网管理员", content: "有耐心一点。" },
    { floor: 526, author: "暗网管理员", content: "可能因为大量用户涌入和举报把页面举报掉了。" },
    { floor: 527, author: "北风狼王", content: "可是这是明网镜像存档怎么会被举报掉呢？" },
    { floor: 528, author: null, content: "对啊，明网存档不会丢失的。" },
    { floor: 529, author: null, content: "这是个无效网址。" },
    { floor: 530, author: "暗网管理员", content: "你们在质疑我吗？" },
    { floor: 531, author: "北风狼王", content: "不不不不是这个意思啊啊啊啊！" },
    { floor: 532, author: "暗网管理员", content: "果然这么多年还是这样吗？" },
    { floor: 533, author: null, content: "不是，质疑一下也不行吗？" },
    { floor: 534, author: null, content: "这是个幽灵网址啊。" },
    { floor: 535, author: null, content: "这是无效网址。" },
    { floor: 536, author: null, content: "不是，你是不是在逗我们玩。" },
    { floor: 537, author: null, content: "从始至终提出这个猜想的是你，联络管理员的也是你，提供网址的也是你一个人操作。" },
    { floor: 538, author: null, content: "很难让人不怀疑啊。" },
    { floor: 539, author: null, content: "能不能去死啊这些说谎骗人的！" },
    { floor: 540, author: null, content: "你这个一直都是自己在说，完全就是在骗人吧。" },
    { floor: 541, author: null, content: "给个合理的解释@暗网管理员" },
    { floor: 542, author: "北风狼王", content: "不要这么说他……大家冷静点。" },
    { floor: 543, author: null, content: "别装死@暗网管理员" },
    { floor: 544, author: null, content: "大家那么信任你！" },
    { floor: 545, author: null, content: "能不能别为了搏关注这么没下限。" },
    { floor: 546, author: null, content: "可是万一管理员大人没撒谎呢。" },
    { floor: 547, author: null, content: "差不多得了这场闹剧。" },
    { floor: 548, author: null, content: "这种人活着干嘛？" },
    { floor: 549, author: null, content: "可是那就是无效网址，根本不存在！他在撒谎！" },
    { floor: 550, author: "骑兵管理员", content: "打扰大家了，我是三年前活跃在论坛的骑兵管理员。前两天我收到消息发现被盗号了，现在才把账号找回来，同时我也确信暗网管理员的账号也被盗窃了。大家注意一下这个都是盗号人所发的消息。" },
    { floor: 551, author: null, content: "？" },
    { floor: 552, author: null, content: "这么精彩吗？" },
    { floor: 553, author: null, content: "不是，刚被揭穿就激情开演吗？" },
    { floor: 554, author: null, content: "卧槽还有托。" },
    { floor: 555, author: null, content: "你怎么确信人家是盗号，乐。" },
    { floor: 556, author: null, content: "别演。" },
    { floor: 557, author: "骑兵管理员", content: "因为我哥三年前就自杀了。" },
    { floor: 558, author: null, content: "你在开玩笑吗？" },
    { floor: 559, author: null, content: "别演。" },
    { floor: 560, author: "骑兵管理员", content: "【图片·死亡证明】" },
    { floor: 561, author: "骑兵管理员", content: "我说的都是真的，我不知道盗号的人什么目的，但是请不要消费死者了。" },
    { floor: 562, author: null, content: "卧槽啊。" },
    { floor: 563, author: null, content: "你们不要吓我。" },
    { floor: 564, author: null, content: "这是做什么？" },
    { floor: 565, author: null, content: "所以暗网管理员大人三年前就去世了吗？" },
    { floor: 566, author: "北风狼王", content: "节哀顺变但是有句话我不知当讲不当讲。" },
    { floor: 567, author: "北风狼王", content: "如果是盗号为什么能显示手机型号和IP地址都一模一样？" }
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
  console.log('[LOFTER] 调查进展第六篇已从第 ' + (startIndex + 1) + ' 条起补入 ' + added + ' 条');
});
