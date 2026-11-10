/**
 * 地图第二批用户账号补建
 * 骑兵管理员/蒲公英为同事，北风狼王/烛光灵在一起。
 * 前两个已在数据库中（若有），本脚本只补建不存在的用户。
 */
Storage.ready().then(async function () {
  var KEY = 'mapUsersSeed2_v1';
  if (localStorage.getItem(KEY)) return;

  var toCreate = [
    { username: '蒲公英', nickname: '蒲公英', avatarColor: '#3B82C4' },   // 蓝
    { username: '烛光灵', nickname: '烛光灵', avatarColor: '#6FA84A' }    // 绿
  ];

  for (var i = 0; i < toCreate.length; i++) {
    var u = toCreate[i];
    if (!Storage.findUserByUsername(u.username)) {
      await Storage.addUser({
        id: Storage.generateId(),
        username: u.username,
        password: Auth.hashPassword('123456'),
        nickname: u.nickname,
        createdAt: Date.now(),
        avatarColor: u.avatarColor
      });
    }
  }

  localStorage.setItem(KEY, '1');
});
