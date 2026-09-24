// Меню: панель под шапкой. Шапка остаётся на месте, бургер в ней работает
// и на открытие, и на закрытие.

(function () {
  var burger = document.querySelector('.ls-burger');
  var bar = document.querySelector('.ls-topbar');
  var menu = document.getElementById('menu');
  if (!burger || !bar || !menu) return;

  // Панель одна на оба экрана: на телефоне её открывает бургер, на десктопе —
  // кнопка «Услуги» в шапке. Второй навигации в проекте нет.
  var triggers = [].slice.call(document.querySelectorAll('.ls-burger,.ls-topnav-menu'));
  var wide = window.matchMedia('(min-width: 1024px)');
  var last = burger;

  var open = false;
  var savedY = 0;

  // На iOS overflow:hidden страницу не держит — фиксируем её и возвращаем позицию.
  function lockPage(on) {
    var b = document.body;
    if (on) {
      savedY = window.scrollY;
      b.style.position = 'fixed';
      b.style.top = -savedY + 'px';
      b.style.left = '0';
      b.style.right = '0';
      b.style.width = '100%';
    } else {
      b.style.position = '';
      b.style.top = '';
      b.style.left = '';
      b.style.right = '';
      b.style.width = '';
      // высоту документа надо пересчитать до прыжка, иначе позиция обрежется,
      // а behavior:instant нужен, потому что для якорей включена плавная прокрутка
      void b.offsetHeight;
      window.scrollTo({ top: savedY, behavior: 'instant' });
    }
  }

  function set(on) {
    open = on;
    menu.hidden = false;                    // hidden только до первого открытия
    menu.classList.toggle('ls-is-open', on);
    bar.classList.toggle('ls-menu-open', on);
    document.body.classList.toggle('ls-is-menu', on);
    triggers.forEach(function (t) { t.setAttribute('aria-expanded', String(on)); });
    burger.setAttribute('aria-label', on ? 'Закрыть меню' : 'Меню');
    // Страницу держим только на телефоне: там панель во весь экран. На десктопе
    // она падает из-под шапки, а position:fixed убрал бы полосу прокрутки
    // и дёрнул вёрстку на её ширину.
    if (!wide.matches) lockPage(on);
    // строка статуса должна совпасть с тёмной шапкой
    if (on) document.body.classList.remove('ls-canvas-light');
    // поиск слушает это, чтобы вернуться в исходное состояние
    if (!on) document.dispatchEvent(new CustomEvent('menu:close'));

    // кнопка в шапке доступна, пока открыто меню, даже если шапка не прилипла
    var cta = document.querySelector('.ls-topbar-cta');
    if (cta) {
      // на широком экране кнопка видна всегда, независимо от прокрутки
      var visible = on || wide.matches || bar.classList.contains('ls-is-stuck');
      cta.setAttribute('aria-hidden', visible ? 'false' : 'true');
      cta.setAttribute('tabindex', visible ? '0' : '-1');
    }
  }

  triggers.forEach(function (t) {
    t.addEventListener('click', function () { last = t; set(!open); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) { set(false); last.focus(); }
  });

  // Клик мимо закрывает — но только на широком экране, где панель падает
  // из-под шапки и вокруг неё есть страница. На телефоне она во весь экран,
  // и «мимо» там разве что сама шапка, где закрытием ведает бургер.
  document.addEventListener('pointerdown', function (e) {
    if (!open || !wide.matches) return;
    if (menu.contains(e.target) || bar.contains(e.target)) return;
    set(false);
  });

  // переход по ссылке — панель уходит
  menu.addEventListener('click', function (e) {
    // заголовок раздела теперь тоже ссылка, но на телефоне он раскрывает
    // список, а не уводит со страницы — панель на нём закрывать нельзя
    if (e.target.closest('a') && !e.target.closest('.ls-menu-group')) set(false);
  });

  // Кнопка в шапке лежит вне панели, поэтому обработчик выше её не ловил:
  // адрес менялся на #zayavka, а страница оставалась заблокированной под меню.
  // Закрываем панель сами и ведём к форме, когда прокрутка снова возможна.
  var headCta = document.querySelector('.ls-topbar-cta');
  if (headCta) headCta.addEventListener('click', function (e) {
    if (!open) return;
    e.preventDefault();
    set(false);
    var target = document.querySelector(headCta.getAttribute('href'));
    if (target) setTimeout(function () { target.scrollIntoView({ block: 'start' }); }, 340);
  });
})();
