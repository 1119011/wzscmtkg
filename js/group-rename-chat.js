(function () {
  var MARKER_KEY = 'survivorGroupRenameChat_v1';
  if (Storage.get(MARKER_KEY)) return;

  var groups = Storage.get('survivorGroupChats_v1') || [];
  if (!groups.length) return;

  var messages = Storage.get('survivorGroupMessages_v1') || [];
  var target = null;

  groups.forEach(function (group) {
    if (target) return;
    var hit = messages.some(function (msg) {
      if (msg.groupId !== group.id) return false;
      if (msg.senderName === '暗网管理员') return true;
      return msg.senderName === '小叶同学' &&
        typeof msg.content === 'string' &&
        msg.content.indexOf('以下为语音转文字') === 0;
    });
    if (hit) target = group;
  });

  if (!target) {
    target = groups.filter(function (group) {
      return group.name && group.name.indexOf('寻人调研群') !== -1;
    })[0];
  }
  if (!target) return;

  target.name = '寻人调研群';
  Storage.set('survivorGroupChats_v1', groups);
  Storage.set(MARKER_KEY, true);
})();
