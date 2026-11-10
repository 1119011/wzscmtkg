(function () {
  var MARKER_KEY = 'lofterGroupChatSeed8_v1';
  if (Storage.get(MARKER_KEY)) return;

  var groups = Storage.get('survivorGroupChats_v1') || [];
  if (!groups.length) return;

  var messages = Storage.get('survivorGroupMessages_v1') || [];
  var targetGroupId = null;
  groups.forEach(function (g) {
    if (targetGroupId) return;
    var hit = messages.some(function (m) {
      return m.groupId === g.id && m.senderName === '小叶同学' &&
        typeof m.content === 'string' && m.content.indexOf('以下为语音转文字') === 0;
    });
    if (hit) targetGroupId = g.id;
  });
  if (!targetGroupId) {
    var hintGroup = groups.filter(function (g) {
      return g.name && g.name.indexOf('寻人调研群') !== -1;
    })[0];
    if (hintGroup) targetGroupId = hintGroup.id;
  }
  if (!targetGroupId) return;

  var targetGroup = groups.filter(function (g) { return g.id === targetGroupId; })[0];

  function findUser(rawName) {
    var users = Storage.getUsers();
    var name = rawName.replace(/^群主\s+/, '');
    var found = users.filter(function (u) { return u.username === rawName; })[0] ||
                users.filter(function (u) { return u.nickname === rawName; })[0] ||
                users.filter(function (u) { return u.username === name; })[0] ||
                users.filter(function (u) { return u.nickname === name; })[0];
    return found || null;
  }

  var lastTs = 0;
  messages.forEach(function (m) {
    if (m.groupId === targetGroupId && m.createdAt > lastTs) lastTs = m.createdAt;
  });
  var base = lastTs + 1;

  var entries = [
  {
    "author": "小叶同学",
    "content": "（语音转文字）\n\n抱歉刚刚上厕所去了。那么我现在继续讲。\n\n其实那不是我最后一次见到他，其实我对教授，我虽然害怕他，但是他真的是个很好很好的人。\n\n我知道我这么说有点矛盾，但是其实我也不知道描述这种感觉。就像是人生来对一种生物会有恐惧一样。"
  },
  {
    "author": "骑兵管理员",
    "content": "你直接说他不是人不就完了。"
  },
  {
    "author": "蒲公英",
    "content": "不是人那是什么？"
  },
  {
    "author": "霜月之子",
    "content": "……"
  },
  {
    "author": "骑兵管理员",
    "content": "我开个玩笑。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "你继续讲。"
  },
  {
    "author": "小叶同学",
    "content": "（语音转文字）\n\n好。也不能说他不是人吧，就是可能是因为我自己的原因，我真的有点害怕他。而那天他看着我笑的时候，我其实头皮发麻，我心里想的是，老天爷我真的再也，再也不要见到他了。\n\n但是教授其实什么也没有对我干，我这么想着还是有点愧疚。\n\n第二天的时候，大概是早上九点左右，我想起他的金毛丈夫给过我他们酒店的地址，我就提了点他爱喝的酒去拜访，结果一到酒店就遇到他的金毛丈夫，急匆匆地裹着皮夹克走出来，头发也乱糟糟的。\n\n他看见我很惊喜也很自来熟地把我的手握住，他说哎呀哎呀同学同学你来可是帮了我大忙啊这是我的房卡你快上去把他盯住我现在要去医院找个轮椅然后酒店一会儿会送餐你喂他吃点东西别把火鸡给他吃因为我要吃哈哈哈哈哈哈……\n\n说完他就头也不回地跑了。\n\n他说的太快，跑的也太快，我根本没有反应过来，他就不见了，只留下我一个人攥着房卡。我想了半天，觉得果然，能和菲林斯教授睡在一起的能是什么正常人吗？\n\n但是没有办法，我来都来了，我只有硬着头皮刷了房卡上去，毕竟教授都生病了，我也不能离开，万一出事了怎么办。\n\n然后，然后我记得我上楼了，酒店走廊的地毯很陈旧也很红，他们住在604号，我打开房门，就发现菲林斯教授跟他妈个扫地机器人一样爬在地上，嘴巴上还叼着个餐刀。就像以前他那个视频里面，一模一样，我给你们翻一下。"
  },
  {
    "author": "小叶同学",
    "content": "【视频·40s】"
  },
  {
    "author": "蒲公英",
    "content": "这个胸肌。"
  },
  {
    "author": "骑兵管理员",
    "content": "别看了就是法尔伽。"
  },
  {
    "author": "小叶同学",
    "content": "（语音转文字）\n\n我说真的，还好那是早上，要是晚上我看到这玩意儿我转头就跑。\n\n不过菲林斯教授没戴眼镜，他一向眼神不好，爬着爬着还哐当撞到了柜子上，吓得我哎哟一声。然后他就看看朝我看过来。\n\n他眯着眼睛，因为叼着餐刀所以困惑地呜呜两声，似乎在问我为什么我要来。\n\n我当时被吓得不轻都没想到要扶他起来，就一个劲儿地问教授你这是做什么？你怎么叼着个刀在地上爬？你这是做什么啊？\n\n他又呜呜两声，用手肘吃力地支撑着地面，把被绑着的手腕给我展示了一下。然后我就明白了，他想用餐刀把手上的绳子割开。\n\n这个时候我才想起来，我要把他扶到床上，这是一个有技术型的工作，他比我高，虽然瘦了还是很重，而且根本走不了路一样，我废了好大的劲儿才把他搬运到床上。\n\n教授说，小少爷，帮我解开怎么样？\n\n我留了个心眼，悄悄把餐刀藏起来，我说不了吧，这样，你让那个金毛回来帮你解开。\n\n他也没有为难我，只是看着我手上的酒轻飘飘来了一句，啊你给我带的吗？其实我不怎么会喝酒。\n\n我心想这可太神奇了你不会喝酒，老爷子都差点被你灌得跳苏卡不列你说你不会喝酒。\n\n但是我什么都没说，我就坐在他旁边静静看着他，说实话我神经很紧张，因为我真的被吓得不轻。\n\n也许是因为我，太没意思了，我让他觉得有点无聊，他开始没话找话说。他问我，你要喝水吗？我说不了不了，我不喝不不不我是说我不口渴。\n\n他就又对着我微笑，然后支撑着身体坐过来，说，小少爷，如果有一天我消失了，会有人发现我吗？\n\n我觉得很奇怪，我说当然了，这么一个大活人消失了，你丈夫肯定第一个报警啊。\n\n他说不不不看来你是会错意了，我是说“我”，菲林斯消失了，就像是比如说，克里洛消失了……有人发现吗？会有人发现吗？如果没人发现的话，那也太无趣了。哦不，我的意思是说，那太好了……\n\n他又凑我近一点，很真诚的用散掉的瞳孔看着我，他说，其实我有点腻了，我觉得这个世界有点无趣，但是，但是……\n\n但是什么。\n\n他说，但是我很爱我的丈夫，我有时候又很为我拥有的一切着迷，如果可以，我也想抛下一切沉睡过去，但是抛下一切谈何容易，作为菲林斯不会做出这样的决定。\n\n我觉得好奇怪，其实我知道他精神有点问题但是没想到有问题到这种地步，当时冷汗已经把后背打湿了。\n\n我说我知道了教授我知道了，下次你来挪德卡莱我再来看你吧……\n\n然而他忽然抓着我的肩膀，手劲儿特别大，掐的我生疼。\n\n他直勾勾看着我说，帮我报警，我被囚禁了，你去通知我的丈夫，我被囚禁了，我想回家，帮我报警！\n\n我在那个时候是真的叫出来了，我说你干什么啊教授，好痛好痛！\n\n他也不理我，只是抓着我的肩膀重复那几句话。 不过好在这个时候，我感觉有人拎着我的后颈，把我提起来，这个时候我才发现，法尔伽不知道什么时候回来了。\n\n他动作还是很快，把我提到门外边，然后哐当关上门了，我站在又脏又旧的红地毯上，仿佛满眼肮脏的污渍和血迹，只觉得心跳如鼓点一样没有停息。\n\n法尔伽摸着我的头说，是不是吓到你了哈哈哈哈哈，他跟你开玩笑呢。\n\n我觉得那不像是开玩笑，但是这个金毛肌肉男捏着我的后颈，嬉皮笑脸的，哦，脸上还有道疤痕。\n\n说实话我不知道他怎么在这种情况下还嬉皮笑脸的，但是我真的，我真的被吓到了，我当时想赶快走，我也琢磨着菲林斯教授的话，我只想走，哦对，于是我说，打扰你们了，他情绪不稳定，打扰你们了。\n\n我刚想走，法尔伽在我身后凉凉地说，你不会真要去警察局吧？你真相信他说的话吗？\n\n我脊椎骨都是麻的，我说我不信，但是先生，你真没想过送教授去医院吗？\n\n他笑嘻嘻的说就是才出院呢，他现在好多了。\n\n他说好多了算是什么好多了，其实我没有看出来。菲林斯教授有没有比以前好点，有没有比以前幸福，我其实一直都看不出来。但是他说他觉得无聊，作为菲林斯，他感受到了无聊。他上次觉得无聊烧了画室，丢掉了工作，而这次他又觉得无聊我总觉得他会做些什么，而他的丈夫——我也有一种不好的预感。\n\n荒原的鬼火碰上呼啸的北风，我想都不用想都知道这场燎原的火一定会把他们的生活烧的一干二净，但是我不敢说，我能做的只是在老头子问我，菲林斯教授过的怎么样的时候含糊着说，没联系，应该过得挺好的。"
  },
  {
    "author": "小叶同学",
    "content": "我好像说的有点多，但是这确实就是我最后一次见到菲林斯教授了。"
  },
  {
    "author": "霜月之子",
    "content": "和我想的差不多。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "嗯哼，和我想的也差不多。"
  },
  {
    "author": "骑兵管理员",
    "content": "你们到底在想什么？"
  },
  {
    "author": "蒲公英",
    "content": "你们到底在想什么？"
  },
  {
    "author": "霜月之子",
    "content": "没什么，只是不想多说。"
  },
  {
    "author": "骑兵管理员",
    "content": "@蒲公英 我在给法尔伽发邮件，电话他常年不接的。"
  },
  {
    "author": "骑兵管理员",
    "content": "我就给他说，有人在找他的便宜老婆。"
  },
  {
    "author": "小叶同学",
    "content": "。这话也太糙了。"
  },
  {
    "author": "蒲公英",
    "content": "别麻烦了，我正好在办公室，我在打开他的电脑。"
  },
  {
    "author": "骑兵管理员",
    "content": "现在半夜11:00你在他办公室干嘛？"
  },
  {
    "author": "蒲公英",
    "content": "说是他办公室他也没有用过几天啊。"
  },
  {
    "author": "蒲公英",
    "content": "我正好有他电脑密码，我去查一下他邮件。"
  },
  {
    "author": "小叶同学",
    "content": "这不好吧。"
  },
  {
    "author": "蒲公英",
    "content": "没什么不好的，找人最重要。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "而且，我们这边有菲林斯的小号账号。"
  },
  {
    "author": "骑兵管理员",
    "content": "发来。"
  },
  {
    "author": "蒲公英",
    "content": "@骑兵管理员 他电脑出故障了。"
  },
  {
    "author": "骑兵管理员",
    "content": "哦？描述一下。"
  },
  {
    "author": "蒲公英",
    "content": "文件打不开。"
  },
  {
    "author": "骑兵管理员",
    "content": "解压了吗？"
  },
  {
    "author": "蒲公英",
    "content": "这个我还是会的！"
  },
  {
    "author": "蒲公英",
    "content": "打开文件以后就莫名其妙黑屏了。"
  },
  {
    "author": "蒲公英",
    "content": "换一个电脑也是这样。"
  },
  {
    "author": "骑兵管理员",
    "content": "你拍一个操作视频给我看。"
  },
  {
    "author": "蒲公英",
    "content": "【视频·1】 【视频·2】"
  },
  {
    "author": "蒲公英",
    "content": "这是怎么回事？电脑坏了吗？"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "恐怕不是。"
  },
  {
    "author": "骑兵管理员",
    "content": "我这边也"
  },
  {
    "author": "骑兵管理员",
    "content": "我这边也出了点事。"
  },
  {
    "author": "蒲公英",
    "content": "怎么了？"
  },
  {
    "author": "骑兵管理员",
    "content": "我就想到一些事情，我开了我哥以前的笔记本，然后现在插上电源开机了，邮箱弹消息了。"
  },
  {
    "system": true,
    "content": "转载自邮箱：\n\n发件人：夜客\nchudmilovich@gmail.com\n收件人：暗网管理员\nragnvindr@gmail.com\n时间：2017.8.17\n主题：好久不见。"
  },
  {
    "author": "蒲公英",
    "content": "……"
  },
  {
    "author": "霜月之子",
    "content": "……"
  },
  {
    "author": "小叶同学",
    "content": "卧槽了别吓我啊！"
  },
  {
    "author": "小叶同学",
    "content": "我一个人在上夜班！"
  },
  {
    "author": "蒲公英",
    "content": "那我呢？"
  },
  {
    "author": "蒲公英",
    "content": "现在局里就我一个人。"
  },
  {
    "author": "骑兵管理员",
    "content": "你要不现在重启一下？"
  },
  {
    "system": true,
    "content": "暗网管理员加入了群聊",
    "join": "暗网管理员"
  },
  {
    "author": "小叶同学",
    "content": "？"
  },
  {
    "author": "蒲公英",
    "content": "这谁拉的？"
  },
  {
    "author": "骑兵管理员",
    "content": "@群主 蛇蛇故事猫"
  },
  {
    "author": "骑兵管理员",
    "content": "这怎么回事？"
  },
  {
    "author": "骑兵管理员",
    "content": "在恶搞吗？"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "我没有开权限。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "这是私密群。"
  },
  {
    "author": "霜月之子",
    "content": "这不是。"
  },
  {
    "author": "暗网管理员",
    "content": "快走"
  },
  {
    "author": "暗网管理员",
    "content": "快走"
  },
  {
    "author": "暗网管理员",
    "content": "快走"
  },
  {
    "author": "暗网管理员",
    "content": "快走"
  },
  {
    "author": "暗网管理员",
    "content": "快走"
  },
  {
    "author": "暗网管理员",
    "content": "快走"
  },
  {
    "author": "暗网管理员",
    "content": "快走"
  },
  {
    "author": "暗网管理员",
    "content": "快走"
  },
  {
    "author": "暗网管理员",
    "content": "快走"
  },
  {
    "author": "暗网管理员",
    "content": "快zou"
  },
  {
    "author": "暗网管理员",
    "content": "kuai走"
  },
  {
    "author": "暗网管理员",
    "content": "/@走ajh【**"
  },
  {
    "author": "用户163991",
    "content": "快qo@【^e走*oep%t"
  },
  {
    "system": true,
    "content": "（该用户不存在）"
  }
];
  entries.forEach(function (item, index) {
    var msg = {
      id: Storage.generateId(),
      groupId: targetGroupId,
      content: item.content,
      createdAt: base + index * 10
    };
    if (item.join) {
      var joiner = findUser(item.join);
      if (joiner && targetGroup && targetGroup.memberIds &&
          targetGroup.memberIds.indexOf(joiner.id) === -1) {
        targetGroup.memberIds.push(joiner.id);
      }
    }
    if (item.system) {
      msg.system = true;
    } else {
      var user = findUser(item.author);
      msg.fromId = user ? user.id : ('seed8-' + index);
      msg.senderName = item.author.replace(/^群主\s+/, '');
    }
    messages.push(msg);
  });

  Storage.set('survivorGroupMessages_v1', messages);
  Storage.set('survivorGroupChats_v1', groups);
  Storage.set(MARKER_KEY, true);
})();
