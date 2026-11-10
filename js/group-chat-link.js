(function () {
  var TARGET_GROUP = '寻人调研群';
  var PHRASE = '【聊天记录1】【聊天记录2】';

  var origShowPostDetail = App.showPostDetail;
  App.showPostDetail = function (postId) {
    var result = origShowPostDetail.apply(this, arguments);
    setTimeout(decorate, 0);
    return result;
  };

  function openGroup() {
    if (window.SocialChat && SocialChat.openGroupByName) {
      SocialChat.openGroupByName(TARGET_GROUP);
    } else {
      App.showToast('通讯台暂不可用', 'error');
    }
  }

  function decorate() {
    var area = document.getElementById('content-area');
    if (!area) return;

    Array.prototype.forEach.call(area.querySelectorAll('.comment-content'), function (el) {
      if (el.dataset.chatJump === '1') return;
      var text = el.textContent || '';
      var index = text.indexOf(PHRASE);
      if (index === -1) return;

      el.dataset.chatJump = '1';
      el.innerHTML = App.escapeHtml(text.slice(0, index)) +
        '<span class="group-chat-jump" role="button" tabindex="0">' + App.escapeHtml(PHRASE) + '</span>' +
        App.escapeHtml(text.slice(index + PHRASE.length));

      var link = el.querySelector('.group-chat-jump');
      if (!link) return;
      link.addEventListener('click', function (e) {
        e.stopPropagation();
        openGroup();
      });
      link.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openGroup();
        }
      });
    });
  }
})();
