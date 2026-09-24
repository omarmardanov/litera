// Подбор услуги в меню: подсказки появляются с первой буквы, без похода на сервер.
// Не поиск по сайту — искать надо услугу, а не статью. Список из 222 позиций
// весит 17 КБ, грузится один раз при первом открытии меню.

(function () {
  var form = document.querySelector('.ls-menu-search');
  if (!form) return;
  var input = form.querySelector('input');
  var box = document.createElement('div');
  box.className = 'ls-menu-hints';
  box.hidden = true;
  form.insertAdjacentElement('afterend', box);

  // Синонимы: как люди называют услугу на самом деле. Список из запросов
  // внутреннего поиска на сайте и из разговорной практики.
  var SYN = {
    'флаер': 'листовк', 'лифлет': 'буклет', 'бирка': 'этикетк', 'ярлык': 'этикетк',
    'бланк': 'фирменны бланк', 'меню': 'меню', 'ценник': 'прайс',
    'пригласительн': 'приглашен', 'сертификат': 'сертификат', 'абонемент': 'абонемент',
    'значок': 'бейдж', 'бедж': 'бейдж', 'карточк': 'визитк', 'логотип': 'логотип',
    'коробк': 'коробк', 'пакет': 'пакет', 'наклейк': 'стикер этикетк', 'календар': 'календар'
  };

  // «Бэйдж», «бейджик», «Йц» — из реальных запросов. Сводим написание к одному виду.
  function norm(s) {
    return s.toLowerCase()
      .replace(/ё/g, 'е').replace(/э/g, 'е').replace(/й/g, 'и')
      .replace(/[^a-zа-я0-9]+/g, ' ').trim();
  }

  // Ключи и значения словаря прогоняем через ту же нормализацию, что и запрос,
  // иначе «этикетк» никогда не совпадёт с «Этикетками» после замены э→е.
  var SYNN = {};
  for (var k0 in SYN) SYNN[norm(k0)] = norm(SYN[k0]);

  // «бирка» должна находить «Бирки», «флаер» — «Флаеры». Полноценная морфология
  // тут не нужна: хватает отсечь последнюю букву у слов длиннее четырёх.
  function stem(w) { return w.length > 4 ? w.slice(0, -1) : w; }

  var data = null, loading = false;

  function load(then) {
    if (data) return then();
    if (loading) return;
    loading = true;
  // Версию берём из ссылки на стили: у скриптов и стилей в адресе стоит ?v=,
  // а данные грузились без него — и браузер отдавал вчерашний JSON. На холсте
  // артборды из-за этого показывали прежний порядок работ, хотя страницы были
  // свежие.
  var V = ((document.querySelector('link[rel=stylesheet]') || {}).href || '').split('?v=')[1];
  var Q = V ? '?v=' + V : '';
    fetch('assets/data/services.json' + Q)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        data = j;
        data.norm = j.s.map(function (x) { return norm(x[0]); });
        loading = false;
        then();
      })
      .catch(function () { loading = false; });
  }

  // первым идёт то, что человек написал, синонимы — следом и с наценкой:
  // на «флаер» сначала должны идти флаеры, а листовки после них
  function expand(q) {
    var out = [{ t: q, add: 0 }];
    for (var k in SYNN) if (q.indexOf(k) === 0 || k.indexOf(q) === 0) out.push({ t: SYNN[k], add: 3 });
    return out;
  }

  function find(raw) {
    var q = norm(raw);
    if (!q) return data.t.slice();
    var terms = expand(q), hits = [];
    data.norm.forEach(function (name, i) {
      var best = -1;
      terms.forEach(function (term) {
        term.t.split(' ').forEach(function (word) {
          if (!word) return;
          var at = name.indexOf(stem(word));
          if (at < 0) return;
          // совпадение с начала названия важнее, чем в середине слова
          var score = (at === 0 ? 0 : (name.charAt(at - 1) === ' ' ? 1 : 2)) + term.add;
          if (best < 0 || score < best) best = score;
        });
      });
      if (best >= 0) hits.push([best, i]);
    });
    hits.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    return hits.slice(0, 8).map(function (h) { return h[1]; });
  }

  function draw(raw) {
    var idx = find(raw);
    if (!idx.length) {
      // Обещание «подберём» должно чем-то заканчиваться: ведём к форме
      // и переносим туда набранное, чтобы не пришлось печатать второй раз.
      box.innerHTML = '<p class="ls-menu-hints-empty">Такого в списке нет. Опишите задачу своими словами — подберём и посчитаем.</p>' +
        '<button class="ls-menu-hints-ask" type="button">Описать задачу</button>';
      box.querySelector('.ls-menu-hints-ask').addEventListener('click', function () { ask(raw); });
      box.hidden = false;
      return;
    }
    box.innerHTML = '<p class="ls-menu-hints-title">' +
      (norm(raw) ? 'Нашли' : 'Чаще всего ищут') + '</p><ul>' +
      idx.map(function (i) {
        var s = data.s[i];
        return '<li><a href="' + url(s[1]) + '"><b>' + s[0] + '</b><span>' + data.g[s[2]] + '</span></a></li>';
      }).join('') + '</ul>';
    box.hidden = false;
  }

  var clear = form.querySelector('.ls-menu-search-clear');

  // Адреса в списке — с живого сайта. В прототипе свои страницы только у двух
  // услуг, остальные ведут на litera.studio. В CMS адреса станут настоящими.
  var LOCAL = { '/dizajn-sertifikata': 'sertifikat.html', '/dizajn-advent-kalendarya': 'advent.html' };
  function url(path) { return LOCAL[path] || 'https://litera.studio' + path; }

  // «Ничего не нашли» → форма. Набранное слово кладём в поле задачи:
  // человек уже сказал, что ему нужно, повторять не должен.
  function ask(text) {
    var task = document.querySelector('#task');
    var burger = document.querySelector('.ls-burger');
    if (task && text) {
      task.value = text.trim();
      task.dispatchEvent(new Event('input'));   // form-task.js подгонит высоту
    }
    if (burger && document.body.classList.contains('ls-is-menu')) burger.click();
    var form = document.querySelector('#zayavka');
    // ждём дольше, чем закрытие меню: оно возвращает страницу на прежнее место
    // и перебивает переход, если начать сразу
    if (form) setTimeout(function () { form.scrollIntoView({ block: 'start' }); }, 340);
    else location.href = './#zayavka';
  }

  function update() {
    if (clear) clear.hidden = !input.value;
    load(function () { draw(input.value); });
  }

  function hide() { box.hidden = true; }

  if (clear) clear.addEventListener('click', function () {
    input.value = '';
    input.focus();
    update();
  });

  input.addEventListener('input', update);
  input.addEventListener('focus', update);

  // Подсказки надо уметь убрать. Клавиатура и закрытие меню сами по себе
  // список не прячут, поэтому вешаем три выхода: уход фокуса, Escape и клик мимо.
  input.addEventListener('blur', function () {
    // задержка: без неё касание по подсказке снимает фокус раньше, чем срабатывает переход
    setTimeout(function () { if (!box.contains(document.activeElement)) hide(); }, 160);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (input.value) { input.value = ''; update(); } else { hide(); input.blur(); }
  });
  document.addEventListener('pointerdown', function (e) {
    if (!box.hidden && !box.contains(e.target) && !form.contains(e.target)) hide();
  });
  // Меню закрыли — поиск возвращается в исходное состояние.
  // Именно так, а не через update(): тот грузит список и рисует подсказки
  // в колбэке, то есть уже ПОСЛЕ hide(). Пока поле жило в панели, это было
  // не видно — панель закрывалась вместе с ним. Стоило полю переехать
  // в шапку, и закрытие каталога стало открывать список подсказок.
  document.addEventListener('menu:close', function () {
    input.value = '';
    if (clear) clear.hidden = true;
    hide();
  });


  // С 1080 поле переезжает в шапку, ниже живёт в панели меню. Подсказки лежат
  // отдельным блоком сразу за формой, поэтому переносим их следом — иначе
  // список остался бы висеть на старом месте.
  //
  // Порог обязан совпадать с медиазапросом в header.css: слот в шапке
  // показывает CSS, а поле в него кладёт скрипт. Разойдутся — на промежуточных
  // ширинах в шапке будет пустое место в 200 пикселей вместо поля.
  var slot = document.querySelector('.ls-topbar-search');
  var panel = document.getElementById('menu');
  if (slot && panel) {
    var wide = window.matchMedia('(min-width: 1080px)');
    var place = function () {
      var host = wide.matches ? slot : panel;
      if (form.parentNode === host) return;
      hide();
      host.insertBefore(form, wide.matches ? null : panel.firstChild);
      form.insertAdjacentElement('afterend', box);
    };
    wide.addEventListener('change', place);
    place();
  }

  // Enter на клавиатуре всё равно отправляет форму — уводим его на первую подсказку.
  // Отдельной страницы результатов нет: всё, что нашлось, уже показано здесь.
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = box.querySelector('a');
    if (first) first.click();
  });
})();
