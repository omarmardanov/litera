// Список услуг в форме заявки: 170 позиций из assets/data/services.json,
// того же файла, что подсказки поиска в меню. Группы — четыре направления
// в том порядке, что и плитки на главной.
//
// Пока список не пришёл (или не пришёл вовсе), в поле одна строка «Что
// нужно» — задачу тогда описывают словами в соседнем поле.

(function () {
  var select = document.querySelector('.ls-lead-form select[name=what]');
  if (!select) return;

  var ORDER = ['Полиграфия', 'Упаковка и этикетки', 'Логотип и фирменный стиль',
    'Корпоративный брендинг'];

  fetch('assets/data/services.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var by = {};
      data.s.forEach(function (item) {
        // группы в файле записаны как «Направление · Категория»
        var dir = data.g[item[2]].split(' \u00b7 ')[0];
        (by[dir] = by[dir] || []).push(item[0]);
      });
      ORDER.forEach(function (dir) {
        if (!by[dir]) return;
        var box = document.createElement('optgroup');
        box.label = dir;
        by[dir].forEach(function (name) {
          var opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          box.appendChild(opt);
        });
        select.appendChild(box);
      });
    })
    .catch(function () { select.hidden = true; });
})();
