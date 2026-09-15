// Страница работ: сетка из assets/data/works.json, фильтр по направлению
// и продукту, показ порциями.
//
// Данные — выгрузка портфолио с сайта студии (813 работ), миниатюры
// берутся оттуда же по ссылке. В CMS это тот же список записей портфолио
// и та же медиатека, скрипт заменяется серверной выборкой.
// Плитки ведут на страницу работы; в прототипе такая одна — case.html.
// Фильтр можно задать адресом: ?dir=poligrafiya&prod=Абонементы и сертификаты
// или ?ind=Мода — так сюда ведут паспорт и «Все сертификаты» на странице работы.

(function () {
  var box = document.querySelector('.ls-projects');
  if (!box) return;
  var list = box.querySelector('ul');
  var more = box.querySelector('.ls-projects-more');
  var empty = box.querySelector('.ls-projects-empty');
  var count = document.querySelector('.ls-filter-count');
  var dirs = document.querySelectorAll('.ls-filter input[name=dir]');
  var prod = document.querySelector('#prod');
  var ind = document.querySelector('#ind');
  var PAGE = 24;
  var PRE = 'https://litera.studio/wp-content/uploads/';
  var all = [], names = {}, shown = 0, current = [];

  function apply() {
    var dir = '';
    dirs.forEach(function (r) { if (r.checked) dir = r.value; });
    var p = prod.value, i = ind.value;
    current = all.filter(function (w) {
      return (!dir || w[1] === dir) && (!p || w[2] === p) && (!i || (w[4] || []).indexOf(i) >= 0);
    });
    list.innerHTML = '';
    shown = 0;
    draw();
  }

  function draw() {
    var part = current.slice(shown, shown + PAGE);
    part.forEach(function (w) {
      var li = document.createElement('li');
      // под названием только продукт: направление уже видно по фильтру,
      // а вдвоём они давали три строки под плиткой
      var tags = w[2] || names[w[1]];
      li.innerHTML = '<a href="case.html" data-cursor="Посмотреть работу">' +
        '<img loading="lazy" decoding="async" width="544" height="360" alt="">' +
        '<b></b><span></span></a>';
      li.querySelector('img').src = PRE + w[3];
      li.querySelector('img').alt = w[0];
      li.querySelector('b').textContent = w[0];
      li.querySelector('span').textContent = tags;
      list.appendChild(li);
    });
    shown += part.length;
    more.hidden = shown >= current.length;
    empty.hidden = current.length > 0;
    if (count) count.textContent = current.length
      ? 'Показано ' + shown + ' из ' + current.length
      : '';
  }

  // Списки продуктов и отраслей — только те, что есть в выбранном направлении,
  // по убыванию числа работ: длинный хвост из одной работы уходит вниз.
  function fill(select, first, pick) {
    var dir = '';
    dirs.forEach(function (r) { if (r.checked) dir = r.value; });
    var by = {};
    all.forEach(function (w) {
      if (!dir || w[1] === dir) pick(w).forEach(function (k) { by[k] = (by[k] || 0) + 1; });
    });
    var keep = select.value;
    select.innerHTML = '<option value="">' + first + '</option>';
    Object.keys(by).sort(function (a, b) { return by[b] - by[a]; }).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k; o.textContent = k + ' (' + by[k] + ')';
      select.appendChild(o);
    });
    select.value = by[keep] ? keep : '';
  }
  function fillLists() {
    fill(prod, 'Все продукты', function (w) { return w[2] ? [w[2]] : []; });
    fill(ind, 'Любая отрасль', function (w) { return w[4] || []; });
  }

  fetch('assets/data/works.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      all = data.w; names = data.g;
      var q = new URLSearchParams(location.search);
      dirs.forEach(function (r) { r.checked = r.value === (q.get('dir') || ''); });
      fillLists();
      prod.value = q.get('prod') || '';
      if (prod.selectedIndex < 0) prod.value = '';
      ind.value = q.get('ind') || '';
      if (ind.selectedIndex < 0) ind.value = '';
      apply();
    });

  dirs.forEach(function (r) {
    r.addEventListener('change', function () { fillLists(); apply(); });
  });
  prod.addEventListener('change', apply);
  ind.addEventListener('change', apply);
  more.addEventListener('click', draw);
})();
