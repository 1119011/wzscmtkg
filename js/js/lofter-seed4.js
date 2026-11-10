/**
 * LOFTER 帖子内容补全脚本（旧帖补充）
 * 将「找一部在暗网上看过的离奇动画4」原文评论，
 * 接在帖子「关于“暗网动画”旧帖补充」已有评论之后。
 * 只执行一次；原文楼层与论坛楼层不一致，这里按顺序逐条追加。
 */
Storage.ready().then(async function () {
  var SEED_KEY = 'animeOldSupplementSeed_v1';
  if (localStorage.getItem(SEED_KEY)) return;

  var ENTRIES = [
    { floor: 1, author: null, content: "什么？" },
    { floor: 2, author: null, content: "这是什么？" },
    { floor: 3, author: null, content: "开到这个论坛什么意思？" },
    { floor: 4, author: null, content: "求翻译。" },
    { floor: 5, author: null, content: "我草你就是当年那个楼主。" },
    { floor: 6, author: null, content: "你有病吧，编故事很好玩吗？" },
    { floor: 7, author: null, content: "我没看懂他在说什么？" },
    { floor: 8, author: null, content: "什么叫就当你是编的。" },
    { floor: 9, author: null, content: "你到底是不是编的？" },
    { floor: 10, author: null, content: "不对我觉得这玩意儿是不是楼主都是个问题。" },
    { floor: 11, author: null, content: "对啊楼主失踪了这么久现在忽然冒出来一个小号说回来了吗？" },
    { floor: 12, author: null, content: "楼主拿点证明。" },
    { floor: 13, author: null, content: "卧槽真的吗？" },
    { floor: 14, author: null, content: "隔壁那个帖子热度起来了楼主就回来了？" },
    { floor: 15, author: null, content: "兄弟有点诡异了。" },
    { floor: 16, author: "用户1860", content: "【图片·1】" },
    { floor: 17, author: "用户1860", content: "这是我当时的图片截图，账号截图，上面都标注了时间。" },
    { floor: 18, author: "用户1860", content: "很抱歉给各位带来困扰，这件事情，我们就结束吧。在那些事情以后我的生活也一团乱麻，之前确诊了一些精神上的小疾病不过也不碍事哈哈哈哈哈。" },
    { floor: 19, author: null, content: "你笑你妈了个逼。" },
    { floor: 20, author: null, content: "楼主你还笑得出来啊，你到底什么意思？" },
    { floor: 21, author: null, content: "亏我还对那个动画报有这么大期待。" },
    { floor: 22, author: null, content: "没想到居然是编的。" },
    { floor: 23, author: null, content: "我真是服了。" },
    { floor: 24, author: null, content: "楼主觉得很有意思吗？" },
    { floor: 25, author: "用户1860", content: "抱歉抱歉，真的很抱歉，关于这一切我也很后悔。" },
    { floor: 26, author: "用户1860", content: "关于这一切我本来不想再说但是我已经累了，我想及时止损。" },
    { floor: 27, author: null, content: "我觉得有问题。" },
    { floor: 28, author: null, content: "几张图片你就可以证明自己是楼主了吗？" },
    { floor: 29, author: null, content: "人家都把图片拿出来了还说啥。" },
    { floor: 30, author: null, content: "都散了吧，一个人喜欢编故事而已。" },
    { floor: 31, author: "北风狼王", content: "？" },
    { floor: 32, author: "北风狼王", content: "你是楼主我是谁？" },
    { floor: 33, author: "北风狼王", content: "这篇帖子\u00a0的主人是我。" },
    { floor: 34, author: null, content: "？" },
    { floor: 35, author: null, content: "什么？" },
    { floor: 36, author: null, content: "事情已经精彩到我想象不到的程度。" },
    { floor: 37, author: "北风狼王", content: "真让人苦恼呢哈哈哈哈哈，没想到这么多年没有玩论坛一上号就发现有人顶替我。" },
    { floor: 38, author: "用户1860", content: "啊。" },
    { floor: 39, author: "用户1860", content: "你。" },
    { floor: 40, author: null, content: "咋了？" },
    { floor: 41, author: "用户1860", content: "我懂了，原来是这样吗？" },
    { floor: 42, author: "用户1860", content: "对不起，我都想起来了。" },
    { floor: 43, author: null, content: "点举报吧。" },
    { floor: 44, author: null, content: "不知道这个人什么目的。" },
    { floor: 45, author: null, content: "我也不知道啊。" },
    { floor: 46, author: "北风狼王", content: "我也不知道啊。" },
    { floor: 47, author: null, content: "还有你！" },
    { floor: 48, author: null, content: "楼主你他吗还活着啊！" },
    { floor: 49, author: "北风狼王", content: "我也没死过啊。" },
    { floor: 50, author: null, content: "这家伙到底在说什么？" },
    { floor: 51, author: null, content: "我从三年前的原帖回来了。" },
    { floor: 52, author: null, content: "楼主你到底经历了什么？" },
    { floor: 53, author: "北风狼王", content: "啊，没有什么啊？我现在在蒙德过的挺好的" },
    { floor: 54, author: null, content: "楼主楼主你到底有没有找到那一部动画。" },
    { floor: 55, author: null, content: "楼主你为什么和烛光灵老师见面以后就不上号了？" },
    { floor: 56, author: null, content: "楼主你回话啊！" },
    { floor: 57, author: null, content: "卧槽楼主不会又失踪了吧。" },
    { floor: 58, author: null, content: "别吓我好吗！" },
    { floor: 59, author: "北风狼王", content: "来了来了。" },
    { floor: 60, author: "北风狼王", content: "我怎么会忽然失踪呢！我只是去冰箱里拿点小酒喝。" },
    { floor: 61, author: null, content: "对味儿了。" },
    { floor: 62, author: null, content: "是以前那个楼主。" },
    { floor: 63, author: null, content: "不是。" },
    { floor: 64, author: null, content: "以前楼主的形象这么深入人心吗？" },
    { floor: 65, author: null, content: "不是在喝酒就是在傻笑。" },
    { floor: 66, author: null, content: "这家伙在干什么。" },
    { floor: 67, author: null, content: "我刚刚分析了下原楼主给的两张图片，无躁点无ps痕迹。" },
    { floor: 68, author: null, content: "我觉得有点奇怪。" },
    { floor: 69, author: null, content: "别想了，原楼主都跑路了。" },
    { floor: 70, author: null, content: "他是被举报封号了吧。" },
    { floor: 71, author: "北风狼王", content: "哎呀真的是我啦！大家放心好啦！要不要我拍两张照片？" },
    { floor: 72, author: null, content: "可以看看胸肌吗？" },
    { floor: 73, author: null, content: "可以看看胸肌吗？" },
    { floor: 74, author: null, content: "可以看看胸肌吗？" },
    { floor: 75, author: "北风狼王", content: "【图片·1】" },
    { floor: 76, author: null, content: "不是真给看啊。" },
    { floor: 77, author: null, content: "这个大小，是本人没错了。" },
    { floor: 78, author: null, content: "你们居然是用胸肌解决的吗！" },
    { floor: 79, author: null, content: "楼主楼主，我是三年前楼里的小透明。" },
    { floor: 80, author: null, content: "我想询问一下，你到底有没有打开烛光灵大人的电脑。" },
    { floor: 81, author: null, content: "以及为什么你们两个见面以后就失联了？" },
    { floor: 82, author: null, content: "所以最重要的是那部动画找到没有。" },
    { floor: 84, author: "北风狼王", content: "没有。" },
    { floor: 85, author: "北风狼王", content: "他的电脑打不开了，因为他从浴缸里捞出来的。" },
    { floor: 86, author: null, content: "……" },
    { floor: 87, author: null, content: "我记得烛光灵大人没这么呆啊。" },
    { floor: 88, author: null, content: "烛光灵大人到底是谁啊！" },
    { floor: 89, author: null, content: "指路。" },
    { floor: 90, author: null, content: "多接触论坛社会吧孩子。" },
    { floor: 91, author: null, content: "所以最后还是没有找到吗？" },
    { floor: 92, author: null, content: "那楼主为什么不更新了。" },
    { floor: 93, author: "北风狼王", content: "说来惭愧，因为我和烛光灵大人一见面就喝多了。" },
    { floor: 94, author: "北风狼王", content: "准确来说是我喝多了。" },
    { floor: 95, author: null, content: "不是。" },
    { floor: 96, author: null, content: "谁家网友见面就开始整伏特加啊！" },
    { floor: 97, author: null, content: "什么？" },
    { floor: 98, author: null, content: "我们等了三年什么恐怖的事情都想过了你说你俩喝多了！" },
    { floor: 99, author: null, content: "我释怀笑了。" },
    { floor: 100, author: null, content: "没关系，人没事就好。" },
    { floor: 101, author: null, content: "对啊，至少人没事。" },
    { floor: 102, author: null, content: "楼主稳定发挥。" },
    { floor: 103, author: null, content: "所以你们就发现电脑打不开然后喝麻了然后分道扬镳了？" },
    { floor: 104, author: "北风狼王", content: "没有分道扬镳。" },
    { floor: 105, author: "北风狼王", content: "喝多了把下午飞机错过了，然后凌晨两点在酒店床上醒过来套都用完了。" },
    { floor: 106, author: "北风狼王", content: "挪德卡莱是个好地方。" },
    { floor: 107, author: null, content: "？" },
    { floor: 108, author: null, content: "这家伙在说什么？" },
    { floor: 109, author: null, content: "管理员！管理员！" },
    { floor: 110, author: null, content: "你和网友睡了？" },
    { floor: 111, author: "北风狼王", content: "啊这个我确实要和你们道歉，大概就是，我当时一在线下看到烛光灵我一下子就把什么动漫论坛抛诸脑后了。" },
    { floor: 112, author: null, content: "男人也可以如此美丽吗？" },
    { floor: 113, author: null, content: "谢谢楼主，我现在觉得一点都不恐怖了。" },
    { floor: 114, author: null, content: "我们辛辛苦苦等了三年，结果故事的结局你把他睡了？" },
    { floor: 115, author: null, content: "对不起我现在笑的有点难受。" },
    { floor: 116, author: null, content: "插个楼。" },
    { floor: 117, author: null, content: "我从隔壁论坛过来的。" },
    { floor: 118, author: null, content: "对面扒出来烛光灵大人线下是美院教授，但是现在已经离职了联系不上，他的学生也在找他，不知道楼主能不能因为自己一念之插联系上烛光灵大人。" },
    { floor: 119, author: null, content: "怎么办我一直在笑。" },
    { floor: 120, author: null, content: "楼主你功德一件我现在一点都不害怕了。" },
    { floor: 121, author: "北风狼王", content: "【图片·厨房背影】" },
    { floor: 122, author: null, content: "这是谁？" },
    { floor: 123, author: null, content: "这个拴着围裙做饭的人是谁？" },
    { floor: 124, author: "小叶同学", content: "菲林斯教授？" },
    { floor: 125, author: null, content: "这他妈是烛光灵老师啊？" },
    { floor: 126, author: "北风狼王", content: "哦还有其他角度。" },
    { floor: 127, author: "北风狼王", content: "【图片·回头】" },
    { floor: 128, author: null, content: "啊啊啊啊啊你不仅睡了网友还让网友给你做饭！" },
    { floor: 129, author: null, content: "不对，不对。" },
    { floor: 130, author: null, content: "没看懂。" },
    { floor: 131, author: "小叶同学", content: "所以菲林斯教授去蒙德结婚了！" },
    { floor: 132, author: null, content: "不是，楼主你吃挺好啊！" },
    { floor: 133, author: null, content: "哪个方面。" },
    { floor: 134, author: null, content: "各种方面。" },
    { floor: 135, author: "北风狼王", content: "【图片·鲑鱼】" },
    { floor: 136, author: null, content: "好了好了都知道你吃的很好。" },
    { floor: 137, author: "北风狼王", content: "大概就是我和烛光灵大人一见面就一见钟情然后我带他回蒙德结婚了。" },
    { floor: 138, author: "北风狼王", content: "现在我们搬了新家。" },
    { floor: 139, author: "北风狼王", content: "我们领养了一个女儿哈哈哈哈哈，现在生活的太幸福了所以完全忘记了还有这个论坛的事情。" },
    { floor: 140, author: null, content: "羡慕……" },
    { floor: 141, author: null, content: "让楼主歪打正着了。" },
    { floor: 142, author: "小叶同学", content: "教授的手腕怎么了，怎么绑着OK绷。" },
    { floor: 143, author: "北风狼王", content: "不要担心。" },
    { floor: 144, author: null, content: "烛光灵大人好漂亮……" },
    { floor: 145, author: null, content: "眼睛也好好看。" },
    { floor: 146, author: null, content: "啊我有点怕烛光灵大人的眼睛。" },
    { floor: 147, author: null, content: "感觉有点非人。" },
    { floor: 148, author: "北风狼王", content: "他前两天雕刻的时候不小心划到手腕了，不要担心。" },
    { floor: 149, author: null, content: "蒙德看起来挺冷的啊。" },
    { floor: 150, author: "北风狼王", content: "还好吧哈哈哈哈哈。" },
    { floor: 151, author: null, content: "烛光灵大人这个天气还在穿高领。" },
    { floor: 153, author: null, content: "楼主又骗了我们。" },
    { floor: 154, author: null, content: "上次说自己是邋遢大叔。" },
    { floor: 155, author: null, content: "结果是型男。" },
    { floor: 156, author: null, content: "楼主你忏悔吧，你这个在赛博掀起惊涛骇浪的男人。" },
    { floor: 157, author: null, content: "自己偷偷和漂亮教授结婚留我们在网上瑟瑟发抖。" },
    { floor: 158, author: "北风狼王", content: "哈哈哈哈哈哈哈哈没有的事啊！" },
    { floor: 159, author: "北风狼王", content: "虽然但是我还是很想找到动漫的。" },
    { floor: 160, author: null, content: "楼主，旁边有个帖子好像有进展要不要看一下。" }
  ];

  function norm(text) {
    return String(text || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  var posts = Storage.getPosts();
  var target = null;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].title.indexOf('旧帖补充') === -1) continue;
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
  console.log('[LOFTER] 旧帖补充已从第 ' + (startIndex + 1) + ' 条起补入 ' + added + ' 条');
});
