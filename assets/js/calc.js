// Блок расчёта: список услуг и перенос ответов в форму заявки внизу страницы.
//
// Зачем перенос, а не своя отправка: заявка одна, и обрабатывать две разные
// формы менеджеру негде. Плюс здесь не спрашивается контакт — человек
// отвечает на три необязательных вопроса, а телефон оставляет уже в форме,
// куда его приводит кнопка.

(function () {
  var form = document.querySelector('.ls-calc-form');
  if (!form) return;

  var task = document.querySelector('.ls-lead-form textarea');
  var phone = document.querySelector('.ls-lead-form input[type=tel]');
  var lead = document.getElementById('zayavka');
  var select = form.querySelector('#calc-what');
  var loaded = null;
  // Порядок направлений — как у плиток на странице, а не как в файле данных.
  var ORDER = ['Полиграфия', 'Упаковка и этикетки', 'Логотип и фирменный стиль',
    'Корпоративный брендинг'];

  // Список тот же, что у подсказок поиска в меню: 170 позиций, 13 КБ.
  // Группы в файле записаны как «Направление · Категория» — берём первую
  // половину: категории здесь дробят список без пользы.
  var picks = form.querySelector('.ls-calc-picks');
  var more = form.querySelector('.ls-calc-more');

  function fill(sel, data) {
    var by = {};
    data.s.forEach(function (item) {
      var dir = data.g[item[2]].split(' \u00b7 ')[0];
      (by[dir] = by[dir] || []).push(item[0]);
    });
    // Порядок направлений — как у плиток на странице, а не как в файле данных:
    // там услуги лежат по алфавиту и направления чередуются.
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
      sel.appendChild(box);
    });
  }

  if (select) {
    fetch('assets/data/services.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        loaded = data;
        fill(select, data);
        if (more) more.hidden = false;
      })
      .catch(function () {
        // Список не пришёл — поле незачем показывать пустым: задачу опишут
        // словами в соседнем поле и в форме ниже.
        select.hidden = true;
        var label = form.querySelector('.ls-calc-label');
        if (label) label.hidden = true;
      });
  }

  // Ещё услуга — ещё одно такое же поле. Четырёх хватает: в заявках больше
  // трёх позиций разом не называют, а список из десяти полей пугает.
  // У добавленных полей есть крестик: первое поле убрать нельзя, оно и есть
  // вопрос «что нужно нарисовать».
  function addPick() {
    var row = document.createElement('div');
    row.className = 'ls-calc-pick';

    var sel = document.createElement('select');
    sel.name = 'what';
    var first = document.createElement('option');
    first.value = '';
    first.textContent = 'Выберите услугу';
    sel.appendChild(first);
    if (loaded) fill(sel, loaded);

    var drop = document.createElement('button');
    drop.type = 'button';
    drop.className = 'ls-calc-drop';
    drop.setAttribute('aria-label', 'Убрать услугу');
    drop.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11"/></svg>';
    drop.addEventListener('click', function () {
      row.remove();
      more.hidden = false;
      more.focus();
    });

    row.appendChild(sel);
    row.appendChild(drop);
    picks.appendChild(row);
    sel.focus();
    if (picks.children.length >= 4) more.hidden = true;
  }

  if (more) more.addEventListener('click', addPick);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!task || !phone || !lead) return;

    var chosen = [].slice.call(form.querySelectorAll('[name=what]'))
      .map(function (s) { return s.value; })
      .filter(function (v, i, all) { return v && all.indexOf(v) === i; });
    var own = form.querySelector('[name=own]').value.trim();
    var print = form.querySelector('[name=print]:checked');
    var when = form.querySelector('[name=when]:checked');

    var parts = [];
    if (chosen.length) parts.push(chosen.join(', '));
    if (own) parts.push(own);
    if (print && print.value) parts.push(print.value);
    if (when && when.value) parts.push('срок: ' + when.value);
    // Написанное руками не затираем: человек мог начать заполнять форму сам.
    if (parts.length && !task.value.trim()) {
      task.value = parts.join(', ');
      task.dispatchEvent(new Event('input'));
    }

    lead.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Фокус без своей прокрутки: иначе браузер прыгает к полю мгновенно
    // и отменяет плавный переход.
    phone.focus({ preventScroll: true });
  });
})();
