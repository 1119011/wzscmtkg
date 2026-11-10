/**
 * LOFTER 帖子内容补全脚本（调查进展·第十篇）
 * 将「找一部在暗网上看过的离奇动画10」原文评论，
 * 接在帖子「关于“暗网动画”调查进展」已有评论之后。
 * 只执行一次；原文楼层与论坛楼层不一致，这里按顺序逐条追加。
 */
Storage.ready().then(async function () {
  var SEED_KEY = 'animeInvestigationSeed10_v1';
  if (localStorage.getItem(SEED_KEY)) return;

  var ENTRIES = [
    { floor: 1, author: null, content: "什么？" },
    { floor: 2, author: null, content: "天呐这个社区居然还有人！" },
    { floor: 3, author: null, content: "不是你怎么还在蹦跶。" },
    { floor: 4, author: null, content: "蹲。" },
    { floor: 5, author: null, content: "什么什么？" },
    { floor: 6, author: null, content: "不是，就是这个人在原楼主下面造谣他们夫妻，然后还开盒。" },
    { floor: 7, author: null, content: "卧槽了。" },
    { floor: 8, author: null, content: "图什么呢？" },
    { floor: 9, author: null, content: "他不会又要开盒吧。" },
    { floor: 10, author: null, content: "点点举报。" },
    { floor: 11, author: null, content: "何必呢？" },
    { floor: 12, author: "霜月之子", content: "【图片·CG杂图】【图片·CG杂图】【图片·CG杂图】" },
    { floor: 13, author: "霜月之子", content: "以上就是我从那个CG合集里的截图。其中包含了GFAP最臭名昭著的片段。抓破自己的脖子，排水口冒出来的血水，以及最后把主角的头摁在水池里淹死。" },
    { floor: 14, author: "霜月之子", content: "同时，我看了一下这个合集的日期是在2008年，一个IP在挪德卡莱的画家画的。而我看到这一篇合集的时间是在2012年。" },
    { floor: 15, author: null, content: "楼主求个链接。" },
    { floor: 16, author: null, content: "不是楼主你从哪儿找的。" },
    { floor: 17, author: null, content: "画的好好。" },
    { floor: 18, author: null, content: "晚上就用这个配菜。" },
    { floor: 19, author: null, content: "？" },
    { floor: 20, author: null, content: "太诡异了。" },
    { floor: 21, author: "霜月之子", content: "地址在这里。" },
    { floor: 22, author: "霜月之子", content: "浏览器🔍shaknb点me，里面什么都有，你们也用得上。" },
    { floor: 23, author: null, content: "不是。" },
    { floor: 24, author: null, content: "楼主你真点进去了啊！" },
    { floor: 25, author: null, content: "我进去了。" },
    { floor: 26, author: null, content: "好多人类招募视频。" },
    { floor: 27, author: null, content: "好喜欢。" },
    { floor: 28, author: null, content: "不要喜欢了啊喂！" },
    { floor: 29, author: "霜月之子", content: "其实在我看到这个CG杂图的时候我忽然就想到了一些往事，我忽然明白了这是谁。但是我还是不敢肯定，说实话这么多年过去了，我觉得他大概率也不该活着。直到我当时点进去了那个叫烛光灵的账号，我整个人都不好了。说实话，我本来是无神论者（大家别出去说，我现在在教堂工作），但说我看到他账号的时候我真的整个人都不好了。" },
    { floor: 30, author: null, content: "回复楼主，我是从最开始帖子追过来的，" },
    { floor: 31, author: null, content: "烛光灵老师是美院教授，他的账号里也没有什么啊。" },
    { floor: 32, author: null, content: "我看过。" },
    { floor: 33, author: null, content: "画的挺好的。" },
    { floor: 34, author: null, content: "我这里说个疑问。" },
    { floor: 35, author: null, content: "其实很久以前就想说了。" },
    { floor: 36, author: null, content: "烛光灵老师的作品没有训练痕迹啊。" },
    { floor: 37, author: null, content: "画的很好啊你说人家没有被训练过。" },
    { floor: 38, author: null, content: "不不不。" },
    { floor: 39, author: null, content: "我的意思是，很多画他最终呈现出来的色彩，是颜色叠加的结果。" },
    { floor: 40, author: null, content: "他画的有水彩吧。就他这个颜色调得太精准了，是打印机一样的画法。" },
    { floor: 41, author: "霜月之子", content: "【图片·水彩】【图片·油画】" },
    { floor: 42, author: "霜月之子", content: "这是我，在13岁的时候画的。" },
    { floor: 43, author: null, content: "？" },
    { floor: 44, author: null, content: "所以楼主是想说烛光灵抄袭你吗？" },
    { floor: 45, author: "霜月之子", content: "一言半语说不清楚。抄袭不抄袭是最小的事情。对于那个东西来说，他根本无法理解什么叫抄袭。" },
    { floor: 46, author: "霜月之子", content: "我觉得我打字来不及了。我还是拍个视频来给你们讲清楚这件事吧。" },
    { floor: 47, author: null, content: "楼主大人有事情吗？" },
    { floor: 48, author: null, content: "为什么不能打字非要视频？" },
    { floor: 48, author: null, content: "编的吧。" },
    { floor: 49, author: null, content: "怎么突然要拍视频了。" },
    { floor: 50, author: null, content: "楼主已经疯到要盒自己了吗？" },
    { floor: 51, author: "霜月之子", content: "【聊天记录1】【聊天记录2】" },
    { floor: 52, author: "霜月之子", content: "我时间不多的意思是说，我估计也要遭殃了。我是唯物主义者我现在其实挺平静的，就算是鬼魂什么的。" },
    { floor: 53, author: "霜月之子", content: "这是我们在2017年拉的群。你们可以看到其中六个群成员，现在头像还亮着的只剩下我和小叶同学。" },
    { floor: 54, author: null, content: "不是。" },
    { floor: 55, author: null, content: "发生什么事了。" },
    { floor: 56, author: "霜月之子", content: "暗网管理员（原蒙德网警）2012年在家中浴室割腕身亡。蒲公英（原蒙德刑警）2017年在警察局厕所饮枪身亡。骑兵管理员（原蒙德网警）2017年在浴室跳楼身亡。蛇蛇故事猫（原挪德卡莱人口数据库管理员）2020年在公共卫生间自缢，目前处于昏迷脑死亡状态。" },
    { floor: 57, author: "霜月之子", content: "蛇蛇故事猫在出事前几天给我打电话，她联系上了蒙德那边和原楼主关系比较近的联系人，基本上搞清楚了楼主那边事情的全貌。然而她在出事前只给我了传真和她账户的秘钥，我可以登上人口数据库查找关于我以前，那个人的猜想。" },
    { floor: 58, author: "霜月之子", content: "当我找到的时候，我就意识到，我也会被诅咒。以下为视频语音转文字：如果让我从头开始说，那么事情从1999年起。我来爷爷工作的地下研究所休假。我们家不是住在城市里的，因为家里人都信奉霜月女神，这是我们挪德卡莱这边才有的信仰。但是我比较好玩，我不太信这个。但是这些都不太重要了。其实那边说是实验所，其实是个监狱，收容了很多奇奇怪怪的东西。千禧年之前的挪德卡莱是个很混乱的地带，当然，现在也差不多。这种黑监狱经常做点什么人体实验，和药物研发公司签约了，可以谋取大量利益，时至今日我想起来都觉得有点不适。我当时在那下面其实也没干什么，很无聊很黑很阴森，坐落在一个岛上。地下有七层，我每天住在三层，玩爷爷买回来的游戏机和看电视上的动漫。我现在都记得那个监狱，他中间是空的，每一层都有大大小小的牢房，最中间的那个大场地是犯人日常活动的地方，如果有人死掉了，可以通过电梯运送到地上，那个地方现在正好就是北地的坟茔。我第一次去见克里洛，是我爷爷派我从通风管道爬进去。给我的任务呢也很简单，就是和他聊聊天，看他会不会说话。医疗间是白色的，但是很黑，他病床旁边有一盏小灯，我把灯打开，就看到他了。那个时候他还带着呼吸机，脖子上插着静脉插管，他蓝黑色的头发和我差不多长，耳朵上订着那种我在农场看到牲畜才会订的名牌。没有活人是这个脸色也没有活人会是这个体温。但是他还活着。其实我有点害怕，但是我装成我根本无所畏惧的样子，他盯着我，我也盯着他，就在赌谁先说话。当然是他先说话了。他喊我小姐，我那个时候才12岁，大家都把我当成毛都没长齐的丫头，他恭恭敬敬喊了我一声小姐。所以我其实挺喜欢他的。这场对话并没有进行多久就被打断了，我被抓到审讯室。他们都说我现在很温和，其实我12岁的时候不仅脾气大而且什么都不怕。当时枪口就顶在我的后脑勺，他们问我他给我说了什么，我说，说了他以前军队的事情。其实我的胡编乱造根本没有什么用，因为世界上有一种东西叫做监控。然而我爷爷是这里还把他当作一个人来看待的，一切都是因为他的努力，他说我可以撬开那玩意儿的嘴巴，两百万买回来的东西，你们真的不想物尽其用吗？他们当然想了。所以我在这边休假也有了暑假作业，我要陪他说话，撬开他的嘴巴。这是一件很轻松的事情，因为我只需要带着游戏机进去在他面前翘着二郎腿打马里奥，或者是和他一起看动漫。他们给了我很多动漫带子，他就被绑在床上看我打游戏看我看动漫看我画画。他的眼睛是金黄色的，在黑暗待太久了有点像退化的鱼。我问他到底能不能看清，他很有礼貌地摇摇头说我看不清小姐。于是我就坐在他病床旁边画画，他也很安静地用那双不属于人类世界的眼睛看着我画画，偶尔很有礼貌地请求我把灯调亮一点。他很正常，我觉得他正常的不可思议。爷爷测过他的骨龄，他只有18岁。我就给他说你其实18岁。他咦了一声，说记不清了，反正年年都一样。我记得有一次，我从带子里面拿出来一卷动漫叫堕天使之城。那个挺恐怖的，我看的往他那边缩。但是那些血腥的镜头对于他却没有什么影响，他说这有什么大不了的，不就是把脑袋切开了吗？我也切开过。我说那很疼吧。他说痛都痛过了，记不清了，反正过两个月头发就长回来。他说血最多也不能放一个浴缸吧，里面肯定加水了，反正我没放这么多。他又说，你怎么了小姐，为什么用这种眼神看着我。我说，因为正常人不应该这种反应。他很谦肯地向我取经——那么正常人应该是什么反应。我说他们会呕吐悲伤，也许等你以后出去了，你要学会这样的情绪。我知道这句话是在安慰他，他其实这辈子都出不去。爷爷说了，他身上没有几个好的器官，也找不到几块属于自己的骨头。他也许是罗马尼亚人，一出生就在孤儿院等待着卖到实验室，现在他的国家和军队都分崩离析了，他肯定也活不久。说真的，我在那个时候真的把那个叫克里洛的实验体当朋友，他尊重我，会真诚地说希望你以后走到更远的地方。我渐渐也不会害怕他，我也挺喜欢在他面前画画的，底下六层看不见光，他只会温和地让我把灯调亮一点，然后说一些不合时宜的奇怪幽默笑话，其实大多数都不好笑，但是我很喜欢和他聊外面和未来。他总是说想起蒙德找蓝眼睛的小狗，哦不，小男孩。但是他过了一会儿又说算了，太无聊了，我想就这么睡下去也好。我说好啊，你睡吧，我要继续看动漫了。1999年11月份的时候，我那天带着画板想要去找他，但是我发现有些事情不太一样，有很多医疗人员进去，还有狱警拿着枪走进去，他们把我拦在外边，不让我去看。我后来才知道他在咬掉一个医疗人员的喉咙，血流了一地，他挣扎着翻滚到地上，大家赶过来的时候他很虔诚地被反绑着双手趴在地上舔舐着地面上的血液。于是我想起来，他的的确确不算是人类。这让我脊梁骨发凉。再后来我爷爷辞职了，我也离开故乡去上学了。那段时间的记忆在我脑海中逐渐模糊，我只知道，就像是帝国也会分崩离析一样，战争也会席卷挪德卡莱。你们没有在这边的边境待过，不太理解，战争是常有的事情。他们会毁掉监狱，也会建立起新的工厂，新的城市会拔地而起，而像克里洛这样的旧时代的不算人类的产物，在我脑海里他早点死了。毕竟他也说了，死亡对于他来说也算是陷入了无梦的安眠，也算是解脱。2012年，我回到挪德卡莱建设故乡，我只在森林里，远离城市的地方。夜晚我在家里打开了论坛，刷完了原楼主所有的帖子，然后我点进去了烛光灵的账号，我发现那是我的画。然而我只是当作巧合，我刷到CG杂图我也觉得是巧合，直到我看到了照片，我分不清他是人还是鬼，他就在电脑里静静看着我，和我童年的记忆重叠。但是我还是在想，长得像的人常有，更何况你有新名字了，你叫克里洛·楚德米洛维奇·菲林斯。你是从小到大都娇生惯养的至冬贵族，考上了列宾美院，以前是高级军官，现在是光鲜亮丽的教授。你切掉了四分之一个胃，肾脏肝脏全是人工的，身体里没有一块完整的骨骼属于自己，心脏毒性已经高了好几倍，大脑记忆区域受损，精神极度不稳定。你是被评估的残次品根本不能活过三年。然而十二年后你竟然还披着一张更像人的人皮活着。其实当我看到你的词条的时候，我就知道到底发生什么事了。菲林斯是冬都的贵族，而克里洛连自己家乡都不知道在哪里。菲林斯是美院的教授，但是你连书都没有读过。他十八岁的时候去了前线，但是你十八岁还被困在挪德卡莱的监狱。我想我已经知道了问题的答案，但是我还是不想确认，还是不敢确认。因为我刷到论坛的时候我发现你和心爱的人结婚了，他说你过的很好，我真心实意为年少时的朋友过的好而高兴。但是我很快发现事情好像不太对劲，也超出了我的预期。你没有回复我的消息，我以为你不想，但是我逐渐发现事情已经完全超出了我的预料。因为我发现无论在哪里你都不能算作一个人，你很多事情都没有学会，也理解不了。第一个死掉的人是蒙德的网警，他好像是第一个找到那一部动漫的人，看完就自杀了。第二个人也是蒙德的网警和刑警，当时我们在调查这件事情，他们打开了你丈夫和他哥哥的电脑，于是他们是其次看到那部动漫的人。他们也自杀了。这是当着我们的面。于是我找到了挪德卡莱知道最多故事的人奈芙尔，我最终还是下定决心给她讲述了我隐藏许久的故事。我不是想要毁掉你的生活，而是我觉得你根本没过上你想要的生活。我知道那个动画是你画的，我也知道其实你骨子里平等地憎恨这个世界上一切的人和事，但是你报复的都是无辜的人，我不明白为什么。于是我和奈芙尔开始找你，但是那个叫法尔伽的人把你藏的很好，我们根本找不到你。今年的时候，奈芙尔给那个叫法尔伽的人发邮件，他终于回复了，他说你们回到了挪德卡莱，如果真的是你的旧友，可以一起吃个饭，叙叙旧。然而你还是没有来。那个金毛在饭桌上和我和奈芙尔嘻嘻哈哈，推杯换盏，他看起来比以前的照片老了，我猜测你也一样。于是我问起了你，他说你生病了，更多的他不想提。我问他想不想听一个故事，他说可以听，但是也许，我可以讲一些他不知道的故事。于是我说不出口了。因为我在猜测，我猜测你们在一起这么多年，他也许早就知道。但是我还是忍不下心，万一他不知道，我说出这个没有百分之百把握的猜测，会不会把你好不容易回去的家毁掉。就算是这一刻我还是在念旧情，因为我看得出来法尔伽在说你名字的时候眼睛会微微眯起来，这样他看起来有点沧桑的脸一下子就温柔下来。法尔伽说他的梦想是当一个好丈夫和好父亲，也许1999年那个被关押的东西他根本不关心。他还说起那个动漫，他故作惊讶的样子说，啊那是年轻时候随手发的东西，你们还在关心吗？我说怎么会不关心呢？你不觉得奇怪吗？为什么自己的下属徒弟都自杀了？法尔伽还是笑嘻嘻地说，人生总是这样没有办法。他笑的有点假，但是我和奈芙尔也没有办法，我们见不到菲林斯。走的时候法尔伽一边点烟一边含混地说，下次等他病好了，一起出来，在海边找一个餐厅，晒晒太阳，聊聊天。可是还会有下次吗？我不知道也不确定。因为奈芙尔给我说，她觉得法尔伽有很大的问题，她想去查一下。可是我再次见到她是在医院，她只留给我两份传真。我想，她一定是找到了什么看到了什么。于是昨天夜晚，我登录了奈芙尔的账号去找最后一块儿拼图，我在搜索栏输入了菲林斯的名字去寻找最后一块儿拼图，因为我感觉我能坚持到我现在没有疯，全撑着一口气。我看到那个叫菲林斯的家伙的照片的时候，这个困扰我多年的猜想终于落地了，克里洛，我终于明白了。你们长得很像但是总有些东西是改变不了的，他是人而你还没有学会怎么成为人。你平等地憎恨着这个世界每一个人，我不知道你怎么做到的，我也不相信月亮上或者世界上有神明，但是我无比明确一切一定是因为你的诅咒。（笑）那么恭喜你，你已经报复很多人了，其实过去伤害过你的人都死了，但是你还不满意。我现在会割开我的手腕，我知道你在挪德卡莱，我也知道你在看这个视频，你有十分钟的时间来找我，我们墓里见。（黑屏）……" },
    { floor: 72, author: null, content: "卧槽卧槽！" },
    { floor: 73, author: null, content: "来真的吗！" },
    { floor: 74, author: null, content: "卧槽！" },
    { floor: 75, author: null, content: "她真的割了！" },
    { floor: 76, author: null, content: "这他妈不是护林员菈乌玛女士吗！" },
    { floor: 77, author: null, content: "报警啊！快点报警！" },
    { floor: 78, author: null, content: "她疯了吗！" },
    { floor: 79, author: null, content: "谁有菈乌玛女士的住址！" },
    { floor: 80, author: null, content: "卧槽真的割了！" },
    { floor: 81, author: null, content: "我有我有。" },
    { floor: 82, author: null, content: "已报警。" },
    { floor: 83, author: null, content: "她真的割了。" },
    { floor: 84, author: null, content: "不不不我不明白。" },
    { floor: 85, author: null, content: "她的意思是说只要看到那部动画原版的人都会死吗？" },
    { floor: 86, author: null, content: "就是说烛光灵根本不是人。" },
    { floor: 87, author: null, content: "只要你看了他就会来弄死你。" },
    { floor: 88, author: null, content: "你们别管这个了人命关天！" },
    { floor: 89, author: null, content: "菈乌玛女士看起来精神状态不太好。" },
    { floor: 90, author: null, content: "有没有住在女士附近的人！" },
    { floor: 91, author: null, content: "救命她真的流了好多血。" },
    { floor: 92, author: null, content: "所以，菈乌玛女士最后也自杀了。" },
    { floor: 93, author: null, content: "就是菈乌玛女士知道了真相也没有逃过吗？" },
    { floor: 94, author: null, content: "我真怕了卧槽。" },
    { floor: 95, author: null, content: "我的手一直在抖。" },
    { floor: 96, author: null, content: "救命，有没有人报警！" },
    { floor: 97, author: "北风狼王", content: "【图片·救护车】" },
    { floor: 98, author: "北风狼王", content: "各位不用担心，已经第一时间把菈乌玛女士送到医院了。" },
    { floor: 99, author: null, content: "？卧槽原楼主！" },
    { floor: 100, author: "北风狼王", content: "我回来和大家道别了。" }
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
