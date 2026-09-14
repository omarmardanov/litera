// Липкая шапка: пока видно фотографию — прозрачная поверх кадра,
// как только фото ушло вверх — белая полоса с кнопкой «Рассчитать».

(function () {
  var bar = document.querySelector('.ls-topbar');
  var sentinel = document.querySelector('.ls-scroll-sentinel');

  // На страницах без фотографии шапке не на чем быть прозрачной: сразу белая,
  // затемнение под ней не нужно.
  if (!document.querySelector('.ls-hero')) {
    document.documentElement.classList.add('ls-no-hero');
  }
  var cta = document.querySelector('.ls-topbar-cta');
  if (!bar || !sentinel) return;

  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var noHero = document.documentElement.classList.contains('ls-no-hero');

  // Холст под содержимым: тёмный, пока видно фотографию, и у футера.
  // Объявлены здесь, потому что их красит setStuck — он вызывается раньше.
  var foot = document.querySelector('.ls-foot');
  var atTop = true, atFoot = false;

  function setStuck(on) {
    bar.classList.toggle('ls-is-stuck', on);
    // На странице без фотографии верх всегда белый — тёмная строка статуса
    // там висела бы над белой страницей.
    if (themeMeta) themeMeta.setAttribute('content', on || noHero ? '#ffffff' : '#111112');
    // Холст переключается тем же событием, что и шапка: Safari берёт цвет
    // строки статуса из фона тела, а не из theme-color. По своей метке в начале
    // документа холст белел уже после 50 px прокрутки — фотография ещё на весь
    // экран, а строка статуса над ней уже белая.
    atTop = !on;
    paintCanvas();
    if (!cta) return;
    // пока открыто меню, кнопкой распоряжается menu.js — не перебиваем
    if (document.body.classList.contains('ls-is-menu')) return;
    // кнопка не должна ловить фокус и голос скринридера, пока скрыта.
    // На широком экране она видна всегда — там прятать нечего.
    var shown = on || window.matchMedia('(min-width: 1024px)').matches;
    cta.setAttribute('aria-hidden', shown ? 'false' : 'true');
    cta.setAttribute('tabindex', shown ? '0' : '-1');
  }

  // Переключаем в самом начале прокрутки: если тянуть затемнение по кадру,
  // на светлых участках фотографии оно читается как грязь.
  var sentinelVisible = true;
  var io = new IntersectionObserver(function (entries) {
    sentinelVisible = entries[0].isIntersecting;
    // если своих меток нет (категория), решает эта
    if (!document.querySelector('.ls-rest-sentinel') &&
        !document.querySelector('.ls-body-sentinel')) setStuck(!sentinelVisible);
  }, { threshold: 0 });

  io.observe(sentinel);

  // На широком экране первый экран прилипает, а страница наезжает на него.
  // Метка в начале документа там не годится — шапка белела бы сразу. Считаем
  // моментом переключения то, когда до шапки дошёл белый слой: его метка
  // стоит в начале этого слоя.
  // Шапка белеет ровно тогда, когда до неё доходит белый слой страницы.
  // Слой начинается в разных местах: на широком экране это блок под первым
  // экраном, на телефоне — текст сразу под кадром. Поэтому меток две,
  // и работает та, что соответствует ширине.
  var wide = window.matchMedia('(min-width: 1024px)');
  var marks = {
    wide: document.querySelector('.ls-rest-sentinel'),
    narrow: document.querySelector('.ls-body-sentinel')
  };
  var seen = { wide: true, narrow: true };

  function applyMark() {
    var key = wide.matches ? 'wide' : 'narrow';
    if (marks[key]) setStuck(!seen[key]);
    else setStuck(!sentinelVisible);
  }

  Object.keys(marks).forEach(function (key) {
    if (!marks[key]) return;
    new IntersectionObserver(function (entries) {
      // Не `isIntersecting`, а положение метки: метка ниже окна — это тоже
      // «белый слой ещё не дошёл», а пересечения там нет. На главной первый
      // экран выше окна, метка начинается за его нижним краем, и по признаку
      // пересечения шапка белела сразу на чёрном. Условие то же, что
      // в страховке ниже по файлу.
      seen[key] = entries[0].boundingClientRect.top > (bar.offsetHeight || 54);
      applyMark();
      // граница считается по нижнему краю шапки, а не по верху окна:
      // иначе цвет меняется, когда слой уже наполовину заехал под неё
    }, { rootMargin: '-' + (bar.offsetHeight || 54) + 'px 0px 0px 0px', threshold: 0 })
      .observe(marks[key]);
  });

  wide.addEventListener('change', applyMark);

  // Страховка от рывка. При быстрой прокрутке наблюдатель иногда не успевает
  // сообщить о пересечении, и шапка остаётся белой на тёмном кадре.
  // Здесь просто сверяем положение метки с нижним краем шапки.
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var mark = wide.matches ? marks.wide : marks.narrow;
      if (!mark) return;
      var visible = mark.getBoundingClientRect().top > (bar.offsetHeight || 54);
      var key = wide.matches ? 'wide' : 'narrow';
      if (seen[key] !== visible) { seen[key] = visible; applyMark(); }
    });
  }, { passive: true });

  // Тёмный на первом экране и у футера (там фотография и чёрный футер),
  // светлый в середине. Иначе при оттяжке снизу видно белую полосу под футером.
  function paintCanvas() {
    document.body.classList.toggle('ls-canvas-light', !atTop && !atFoot);
    document.body.classList.toggle('ls-canvas-foot', atFoot);
  }

  if (foot) {
    new IntersectionObserver(function (e) {
      atFoot = e[0].isIntersecting;
      paintCanvas();
    }, { threshold: 0 }).observe(foot);
  }
})();
