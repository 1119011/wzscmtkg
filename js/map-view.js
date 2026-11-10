/**
 * 异闻定位 - 提瓦特地图
 * 底图为观测枢地图工具拼接的提瓦特全图，仅保留地形，不包含探索度与标点。
 */
(function () {
  var IMG_W = 4044;
  var IMG_H = 3525;
  var MIN_SCALE = 1;
  var MAX_SCALE = 4;
  var ZOOM_STEP = 1.25;

  // 各区域标签位置（相对底图的百分比）
  var LABELS = [
    { name: '蒙德', x: 75.2, y: 45.8 },
    { name: '璃月', x: 67.6, y: 56.0 },
    { name: '须弥', x: 54.8, y: 63.5 },
    { name: '枫丹', x: 53.6, y: 43.2 },
    { name: '纳塔', x: 31.2, y: 70.8 },
    { name: '稻妻', x: 85.0, y: 81.2 },
    { name: '至冬', x: 47.0, y: 11.0 },
    { name: '挪德卡莱', x: 25.5, y: 46.5, minor: true }
  ];

  var state = { baseW: 0, baseH: 0, scale: 1, tx: 0, ty: 0 };
  var viewport = null;
  var canvas = null;
  var zoomLabel = null;
  var dragging = false;
  var dragStart = null;

  var LABEL_HTML = LABELS.map(function (label, index) {
    return '<span class="map-label' + (label.minor ? ' minor' : '') + '"' +
      ' data-label-index="' + index + '">' +
      label.name + '</span>';
  }).join('');

  // 用户头像位置（相对底图的百分比）
  var USER_MARKERS = [
    { name: '霜月之子', x: 23.1, y: 53.4 },
    { name: '蛇蛇故事猫', x: 28.1, y: 53.4 },
    { name: '小叶同学', x: 30.1, y: 41.8 },
    { name: '暗网管理员', x: 78.2, y: 55.6 },
    // 第二批：蒙德东北区域（右移并做对角错位，避免相邻头像重叠）
    { name: '骑兵管理员', x: 75.4, y: 48.4 },   // 黄
    { name: '蒲公英', x: 80.6, y: 50.0 },        // 蓝
    { name: '北风狼王', x: 85.4, y: 54.2 },      // 红
    { name: '烛光灵', x: 89.4, y: 57.0 }         // 绿
  ];

  // 构建地图上的用户头像标记
  function buildUserMarkers() {
    var users = Storage.getUsers() || [];
    var posts = Storage.getPosts() || [];
    var byName = {};
    users.forEach(function (user) {
      if (user.nickname && !byName[user.nickname]) byName[user.nickname] = user;
      if (user.username && !byName[user.username]) byName[user.username] = user;
    });

    return USER_MARKERS.map(function (marker, markerIndex) {
      var user = byName[marker.name];
      var userId, displayName, avatarColor, avatarImage;

      if (user) {
        userId = user.id;
        displayName = user.nickname || user.username || marker.name;
        avatarColor = user.avatarColor;
        avatarImage = user.avatarImage;
      } else {
        // 用户记录不存在时，用其帖子中的作者信息兜底
        var post = null;
        for (var i = 0; i < posts.length; i++) {
          if (posts[i].authorName === marker.name) { post = posts[i]; break; }
        }
        if (!post) return '';
        userId = post.authorId;
        displayName = marker.name;
        avatarColor = post.authorAvatarColor;
        avatarImage = post.authorAvatarImage;
      }

      return '<button type="button" class="map-user-marker"' +
        ' data-user-id="' + userId + '"' +
        ' data-marker-index="' + markerIndex + '"' +
        ' title="' + App.escapeHtml(displayName) + '">' +
        '<span class="map-user-marker-avatar" style="background:' +
          App.avatarBg(avatarColor, avatarImage) + '">' +
          App.avatarInnerHtml(avatarColor, displayName, avatarImage) +
        '</span>' +
        '<span class="map-user-marker-name">' + App.escapeHtml(displayName) + '</span>' +
      '</button>';
    }).join('');
  }

  var PAGE_HTML =
    '<div class="map-page" id="map-page">' +
      '<div class="map-head">' +
        '<div>' +
          '<div class="map-title">异闻定位</div>' +
          '<div class="map-subtitle">诡事寻踪 全息区域图</div>' +
        '</div>' +
        '<div class="map-controls">' +
          '<button type="button" class="map-btn" data-map-act="zoom-out" title="缩小">－</button>' +
          '<span class="map-zoom" id="map-zoom">100%</span>' +
          '<button type="button" class="map-btn" data-map-act="zoom-in" title="放大">＋</button>' +
          '<button type="button" class="map-btn map-btn-reset" data-map-act="reset">重置</button>' +
        '</div>' +
      '</div>' +
      '<div class="map-viewport" id="map-viewport">' +
        '<div class="map-canvas" id="map-canvas">' +
          '<img class="map-image" src="assets/teyvat-map-holo.webp?v=20261110b" alt="提瓦特大陆地图" draggable="false">' +
        '</div>' +
        '<div class="map-label-layer" id="map-label-layer">' + LABEL_HTML + '</div>' +
        '<div class="map-user-layer" id="map-user-layer"></div>' +
        '<div class="map-hint">滚轮缩放 · 按住拖动</div>' +
      '</div>' +
    '</div>';

  function ensurePage() {
    var area = document.getElementById('content-area');
    if (!area) return null;

    var page = document.getElementById('map-page');
    if (!page) {
      area.innerHTML = PAGE_HTML;
      page = document.getElementById('map-page');
      viewport = document.getElementById('map-viewport');
      canvas = document.getElementById('map-canvas');
      zoomLabel = document.getElementById('map-zoom');
      bindControls();
    } else {
      viewport = document.getElementById('map-viewport');
      canvas = document.getElementById('map-canvas');
      zoomLabel = document.getElementById('map-zoom');
    }

    refreshUserMarkers();
    return page;
  }

  // 刷新地图上的用户头像标记（头像可能因登录/设置变化而更新）
  function refreshUserMarkers() {
    var layer = document.getElementById('map-user-layer');
    if (!layer || !canvas) return;

    // 头像尺寸随地图宽度自适应，窄屏时缩小以免相邻标记糊在一起
    var canvasWidth = canvas.offsetWidth || 0;
    var size = Math.max(26, Math.min(42, canvasWidth * 0.055));
    layer.style.setProperty('--map-marker-size', size.toFixed(1) + 'px');

    layer.innerHTML = buildUserMarkers();
    Array.prototype.forEach.call(layer.querySelectorAll('.map-user-marker'), function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (App.openUserInfo) App.openUserInfo(btn.dataset.userId);
      });
    });
    positionUserMarkers();
  }

  // 头像标记与地名一样放在不缩放的覆盖层，按地图变换换算屏幕坐标，保证文字清晰
  function positionUserMarkers() {
    var layer = document.getElementById('map-user-layer');
    if (!layer || !state.baseW || !state.baseH) return;

    var nodes = layer.querySelectorAll('.map-user-marker');
    for (var i = 0; i < nodes.length; i++) {
      var marker = USER_MARKERS[Number(nodes[i].dataset.markerIndex)];
      if (!marker) continue;
      nodes[i].style.left = (state.tx + state.baseW * marker.x / 100 * state.scale) + 'px';
      nodes[i].style.top = (state.ty + state.baseH * marker.y / 100 * state.scale) + 'px';
    }
  }

  function bindControls() {
    if (!viewport || !canvas) return;

    var page = document.getElementById('map-page');
    if (page) {
      page.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-map-act]');
        if (!btn) return;
        var act = btn.dataset.mapAct;
        if (act === 'zoom-in') {
          zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, state.scale * ZOOM_STEP);
        } else if (act === 'zoom-out') {
          zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, state.scale / ZOOM_STEP);
        } else if (act === 'reset') {
          fitView();
        }
      });
    }

    viewport.addEventListener('wheel', function (e) {
      e.preventDefault();
      var rect = viewport.getBoundingClientRect();
      var factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, state.scale * factor);
    }, { passive: false });

    // 窗口尺寸变化时刷新标记尺寸
    window.addEventListener('resize', function () {
      if (document.getElementById('map-user-layer')) refreshUserMarkers();
    });

    viewport.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      if (e.target.closest('[data-map-act]')) return;
      if (e.target.closest('.map-user-marker')) return;
      dragging = true;
      dragStart = { x: e.clientX, y: e.clientY, tx: state.tx, ty: state.ty };
      viewport.classList.add('map-dragging');
      viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!dragging || !dragStart) return;
      state.tx = dragStart.tx + (e.clientX - dragStart.x);
      state.ty = dragStart.ty + (e.clientY - dragStart.y);
      clampPan();
      applyTransform();
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      dragStart = null;
      viewport.classList.remove('map-dragging');
      if (viewport.releasePointerCapture && e.pointerId != null) {
        try { viewport.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    viewport.addEventListener('dblclick', function (e) {
      var rect = viewport.getBoundingClientRect();
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, state.scale * ZOOM_STEP);
    });
  }

  window.addEventListener('resize', function () {
    if (App.currentView === 'map' && document.getElementById('map-page')) {
      fitView();
    }
  });

  function fitView() {
    if (!viewport || !canvas) return;
    var vw = viewport.clientWidth;
    var vh = viewport.clientHeight;
    if (!vw || !vh) return;

    var fit = Math.min(vw / IMG_W, vh / IMG_H);
    state.baseW = IMG_W * fit;
    state.baseH = IMG_H * fit;
    canvas.style.width = state.baseW + 'px';
    canvas.style.height = state.baseH + 'px';

    state.scale = 1;
    state.tx = (vw - state.baseW) / 2;
    state.ty = (vh - state.baseH) / 2;
    applyTransform();
  }

  function zoomAt(px, py, nextScale) {
    if (!viewport) return;
    var scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    if (Math.abs(scale - state.scale) < 0.001) return;

    var ratio = scale / state.scale;
    state.tx = px - (px - state.tx) * ratio;
    state.ty = py - (py - state.ty) * ratio;
    state.scale = scale;
    clampPan();
    applyTransform();
  }

  function clampPan() {
    var vw = viewport.clientWidth;
    var vh = viewport.clientHeight;
    var sw = state.baseW * state.scale;
    var sh = state.baseH * state.scale;

    if (sw <= vw) {
      state.tx = (vw - sw) / 2;
    } else {
      state.tx = Math.min(0, Math.max(vw - sw, state.tx));
    }

    if (sh <= vh) {
      state.ty = (vh - sh) / 2;
    } else {
      state.ty = Math.min(0, Math.max(vh - sh, state.ty));
    }
  }

  function applyTransform() {
    canvas.style.transform =
      'translate(' + state.tx + 'px,' + state.ty + 'px) scale(' + state.scale + ')';
    canvas.style.setProperty('--map-inv', String(1 / state.scale));
    if (zoomLabel) zoomLabel.textContent = Math.round(state.scale * 100) + '%';
    positionLabels();
    positionUserMarkers();
  }

  // 地名标签位于不缩放的覆盖层，按地图变换换算屏幕坐标，保证文字始终清晰
  function positionLabels() {
    var layer = document.getElementById('map-label-layer');
    if (!layer || !state.baseW || !state.baseH) return;

    var nodes = layer.children;
    for (var i = 0; i < nodes.length; i++) {
      var index = Number(nodes[i].dataset.labelIndex);
      var label = LABELS[index];
      if (!label) continue;
      nodes[i].style.left = (state.tx + state.baseW * label.x / 100 * state.scale) + 'px';
      nodes[i].style.top = (state.ty + state.baseH * label.y / 100 * state.scale) + 'px';
    }
  }

  function showMap() {
    var page = ensurePage();
    if (!page) return;

    App.currentView = 'map';
    App.currentPostId = null;
    App.updateActiveNav('map');
    window.scrollTo(0, 0);
    requestAnimationFrame(fitView);
  }

  var mapItem = document.querySelector('.sidebar-menu li[data-view="map"]');
  if (mapItem) {
    mapItem.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (App.currentView === 'map' && document.getElementById('map-page')) return;
      showMap();
    });
  }
})();
