(function () {
  var MARKER_KEY = 'lofterGroupChatSeed7_v1';
  if (Storage.get(MARKER_KEY)) return;

  var groups = Storage.get('survivorGroupChats_v1') || [];
  if (!groups.length) return;

  var messages = Storage.get('survivorGroupMessages_v1') || [];
  var targetGroupId = null;
  var typoMessage = null;
  messages.forEach(function (m) {
    if (!typoMessage && m.content && m.content.indexOf('给我干哪来了') !== -1) {
      typoMessage = m;
    }
  });
  if (typoMessage) targetGroupId = typoMessage.groupId;
  if (!targetGroupId) {
    var hintGroup = groups.filter(function (g) {
      return g.name && g.name.indexOf('寻人调研群') !== -1;
    })[0];
    if (hintGroup) targetGroupId = hintGroup.id;
  }
  if (!targetGroupId) return;

  // 修正原文中的错字
  messages.forEach(function (m) {
    if (m.groupId === targetGroupId && typeof m.content === 'string') {
      m.content = m.content.replace(/给我干哪来了/g, '给我干哪儿来了');
    }
  });

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
    "author": "蒲公英",
    "content": "你问我吗？不是你拉我进来的吗？"
  },
  {
    "author": "小叶同学",
    "content": "这是哪儿？还是挪德卡莱吗？"
  },
  {
    "author": "霜月之子",
    "content": "这里是挪德卡莱。"
  },
  {
    "author": "霜月之子",
    "content": "我拉你进来的。"
  },
  {
    "author": "小叶同学",
    "content": "ber。"
  },
  {
    "author": "小叶同学",
    "content": "难道你是菈乌玛姐姐？"
  },
  {
    "system": true,
    "content": "消息已被撤回"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "打听别人的身世可不是好习惯。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "虽然我也喜欢。"
  },
  {
    "author": "小叶同学",
    "content": "……"
  },
  {
    "author": "骑兵管理员",
    "content": "这个群到底是干什么的？"
  },
  {
    "author": "蒲公英",
    "content": "别告诉我就是用来水聊的。"
  },
  {
    "author": "蒲公英",
    "content": "我很忙，很久没有玩论坛了。"
  },
  {
    "author": "霜月之子",
    "content": "倒也不是因为这个。"
  },
  {
    "author": "霜月之子",
    "content": "只是在论坛上刷完帖子以后，我们想找一个很久很久联系不上的人。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "克里洛·楚德米洛维奇·菲林斯。"
  },
  {
    "author": "骑兵管理员",
    "content": "不认识。"
  },
  {
    "author": "蒲公英",
    "content": "这谁啊？"
  },
  {
    "author": "小叶同学",
    "content": "菲林斯教授吗？"
  },
  {
    "author": "霜月之子",
    "content": "怎么了，你不是说不熟悉吗？"
  },
  {
    "author": "小叶同学",
    "content": "……"
  },
  {
    "author": "小叶同学",
    "content": "额，这种事情也比较复杂，也不能说不熟悉吧，其实还是挺熟悉的，但是又没有那么熟悉。"
  },
  {
    "author": "蒲公英",
    "content": "……"
  },
  {
    "author": "骑兵管理员",
    "content": "这家伙在说些什么？"
  },
  {
    "author": "小叶同学",
    "content": "啊啊啊啊啊啊！我说的都是真的，我只是觉得菲林斯教授好说歹说当了我一年的老师，在网络上暴露老师的信息什么的我做不到啊！"
  },
  {
    "author": "霜月之子",
    "content": "现在是私人群聊，大家都是熟人。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "你可以说了。"
  },
  {
    "author": "小叶同学",
    "content": "我，我说不出来。"
  },
  {
    "author": "骑兵管理员",
    "content": "那我退群了。"
  },
  {
    "author": "蒲公英",
    "content": "我觉得没我俩事了。"
  },
  {
    "author": "霜月之子",
    "content": "怎么没你俩事了？"
  },
  {
    "author": "霜月之子",
    "content": "你们上司。"
  },
  {
    "author": "霜月之子",
    "content": "不是故事的主角吗。"
  },
  {
    "author": "骑兵管理员",
    "content": "我上司把我马牵走了至今未归。"
  },
  {
    "author": "蒲公英",
    "content": "有没有一种可能，我们上司其实一年三百多天都在外边跑。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "那他还娶老婆？"
  },
  {
    "author": "霜月之子",
    "content": "那他还娶老婆？"
  },
  {
    "author": "蒲公英",
    "content": "可能给孩子找妈吧。"
  },
  {
    "author": "蒲公英",
    "content": "你找我们也没用，他回挪德卡莱以后法尔伽就再也没有提起过了。"
  },
  {
    "author": "骑兵管理员",
    "content": "那是因为法尔伽也很久没有回来了。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "不是，那你们至少还联系得上不是吗？"
  },
  {
    "author": "霜月之子",
    "content": "那么，菲林斯先生是死是活，全参考那位在网络上发的照片。"
  },
  {
    "author": "骑兵管理员",
    "content": "其实照的也一般。"
  },
  {
    "author": "蒲公英",
    "content": "设备没那么好。"
  },
  {
    "author": "骑兵管理员",
    "content": "说到手机，你的那个旧手机呢？"
  },
  {
    "author": "蒲公英",
    "content": "旧手机我放到……"
  },
  {
    "author": "小叶同学",
    "content": "差不多得了！有没有人关心一下我家菲林斯教授啊！"
  },
  {
    "author": "蒲公英",
    "content": "关心吗？我们也很想关心。但是遗憾的是我们真的不熟悉，不知道怎么帮上你的忙。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "其实我也不熟悉。"
  },
  {
    "author": "霜月之子",
    "content": "我也只是，有几面之缘。"
  },
  {
    "author": "小叶同学",
    "content": "什么！合着就我接触最多啊！"
  },
  {
    "author": "骑兵管理员",
    "content": "你们不熟找他干嘛？他欠你们钱了啊？"
  },
  {
    "author": "霜月之子",
    "content": "比欠钱还可怕的事情。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "两年后再找齐这么多人，实在不容易，而我们也有我们想要知道的秘密。"
  },
  {
    "author": "蛇蛇故事猫",
    "content": "所以小少爷，关于你那位前辈，你那位教授，你还记得多少，可以给我们说一下吗？"
  },
  {
    "author": "小叶同学",
    "content": "这让我怎么说，那个时候我那么年轻，现在我都毕业这么多年。"
  },
  {
    "author": "小叶同学",
    "content": "打字太慢了，我直接发语音吧。"
  },
  {
    "author": "小叶同学",
    "content": "以下为语音转文字：\n\n那我先说一下怎么碰上的。首先我上大学的时候选这个专业有点奇怪，但是为了刷学分还是选了菲林斯教授的选修课，去上课才发现，怎么只有我一个人。\n\n不过我也知道，这是水课。像菲林斯教授这种高级军官，估计只是在校园挂个名就当转业以后的补贴，其实没人在乎他画的怎么样，就像没有人去上他的课一样。\n\n但是我的老爷子听说我选了他的课还挺开心的，说你去看看他也好，像他这种基本上不出门的人，哪天在房间里臭了都不知道。\n\n我心想，那确实听起来有点诡异了。\n\n然而他在我眼里的形象也一下子变得很诡异，就是，我当时真的以为他是个什么大胃袋炫压抑宅男，天天蹲在宿舍里画点什么本子漫画……\n\n然而不是，当时他带着眼镜打开宿舍门的时候就这么直勾勾看着我，他的眼睛太诡异了导致我当时都没仔细看他的脸，后来想起来才发现他确实比我想象的好漂亮。性格，性格也不是那么闷闷的，还挺幽默的，因为我把他宿舍的桶装水喝完了，他还很有礼貌的问我是不是葫芦娃。\n\n但是说实话，这么多年过去了，就是，就是我回想起来，我也不知道为什么，我还是很怕他。\n\n因为他确实在某些地方表现的让人恐惧。\n\n我的选修课就是一周只有一节课，而且因为只有我一个人，我也不敢逃课——虽然后面我还是逃课了，他也没管我，但是老爷子把我骂了一顿。\n\n他反正一年四季就穿着那种话很沉闷的衬衫，黑白灰，但是架不住人长得好看，挂个渔网都惹眼。学校里面很多人都会看他，我如果跟在他后面，就会感受到很多目光，然而他也会看回去，这是让我最不适的一点。\n\n作为画家，其实我们的确需要观察。画画就是看的艺术，但是我没有办法描述菲林斯教授的眼睛。他盯着一个东西的时候就是这么直勾勾盯着，瞳孔是散开的。一个人看一个活泼的小猫咪和一滩烂肉的眼神是完全不一样的，但是他就是眼神完全一样的，没有波澜，我最开始问他是不是有眼疾，他斟酌了一下给了一个模棱两可想回答——去了前线就变成这样了。\n\n我印象很深刻的是，我和他熟了以后我问他，前线到底是什么样子，你的队友呢？他没有说话，但是他的表情我现在都记得。按理说，如果就像他平时表演的那样，他肯定会游刃有余地给我讲一下，适合我听的故事，但是他当时就一下子愣住了，有点像那种石膏面具戴在脸上一动不动，脸刷一下子就白了，把我吓得够呛。\n\n于是我小心翼翼问他，我说，你怎么了教授，你是不是太伤心了。\n\n他过了一会儿才反应过来，垂着脑袋——说实话——看着有点假。他说对啊我太伤心了。\n\n我当时就忽然觉得有点怪怪的，我心里忽然有一种想法，虽然我知道菲林斯教授是个很好很好的人，但是我还是有一种，我和他，不像是一种生物的奇怪感觉。\n\n而他那双眼睛看我的时候，更像是孩童在好奇地观赏一件新奇的物件。\n\n毕业以后，他就离开了挪德卡莱。\n\n其实我说他辞职是骗你们的，他离开的原因是有一天他在画室里画着画着来了一句真无聊啊，然后点燃了火柴点燃了窗帘。最后因为纵火被辞退了。\n\n说实话，如果没怎么和他接触，也看不出来他有什么问题。毕竟他是那么漂亮的一个贵族青年，有钱又有才华，我后来再听到他的消息就是辞退以后去蒙德结婚了。\n\n2015年的时候，我刚刚换了一个工作，路过北地的坟茔的时候看到菲林斯教授站在路边抽烟。他当时瘦了点，黑眼圈也很重，但是还是很帅很有风度，看到我还脱下来帽子，说实话，他比三年前更像人了。\n\n他说，小少爷，你长高了一点啊。\n\n我确实长高了一点，也不算是小孩子了。\n\n我说教授，这么多年我给你发邮件你怎么不回复我呢？\n\n他神神秘秘凑过来，小声说，我丈夫心眼小，他不让我用电脑。\n\n我当时也没想这么多，只是像以前一样应和他说啊啊啊那真是太过分了。\n\n哦，说到他丈夫也是个神人，金毛脑袋，笑起来声音特别大，哈哈哈哈哈的脸上还有一道疤，非要拉着我去喝酒，我知道菲林斯有多能喝，也知道自己几斤几两，于是连连婉拒了，他的丈夫脸上露出很遗憾的表情，说要不要送送我。\n\n我说不用了不用了，我自己回去就好了，再见再见。\n\n转身离开北地坟茔的路上下着小雪，那要道路要走到尽头的时候我还是忍不住回头看了一眼。菲林斯和他的丈夫站在路灯下面，他丈夫背对着我给他系围巾，而菲林斯——他又用他那双眼睛直勾勾看着我，看得我头皮发麻。\n\n我在心里祈祷着，安慰自己反正他是近视眼啊，看不清我的……\n\n然而他冲着我笑了一下。"
  }
];
  entries.forEach(function (item, index) {
    var msg = {
      id: Storage.generateId(),
      groupId: targetGroupId,
      content: item.content,
      createdAt: base + index * 10
    };
    if (item.system) {
      msg.system = true;
    } else {
      var user = findUser(item.author);
      msg.fromId = user ? user.id : ('seed-' + index);
      msg.senderName = item.author.replace(/^群主\s+/, '');
    }
    messages.push(msg);
  });

  Storage.set('survivorGroupMessages_v1', messages);
  Storage.set(MARKER_KEY, true);
})();
