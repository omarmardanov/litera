// Контакты на десктопе копируются, а не звонят.
//
// Правило: любая ссылка `tel:` и `mailto:` на широком экране по клику кладёт
// контакт в буфер обмена и говорит об этом подсказкой, вместо того чтобы
// открывать звонилку или почтовый клиент. Причина: на десктопе tel: в лучшем
// случае откроет выбор приложения, а mailto: — клиент, который у многих
// не настроен. По телефону и так обращаются заметно реже, чем через
// мессенджеры и форму, терять эти клики на пустой диалог незачем.
//
// Ссылка остаётся ссылкой: если запись не удалась, отрабатывает обычный
// переход. На телефоне скрипт не вмешивается.
//
// Копируем двумя путями. Clipboard API работает только в защищённом контексте:
// по https и на localhost. Просмотр макета с телефона идёт по адресу вида
// http://192.168.0.5:8080, там `navigator.clipboard` просто не существует —
// и на живом сайте будет так же, если он окажется доступен по http.
// Поэтому запасной путь через `execCommand('copy')`: он старый и объявлен
// устаревшим, но работает без защищённого контекста.

(function () {
  var links = [].slice.call(document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]'));
  if (!links.length) return;

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      // за экраном, но не display:none — иначе выделять нечего
      ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      var back = document.activeElement;
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      // Фокус увели у ссылки — возвращаем, иначе пропадает подсказка с клавиатуры.
      // preventScroll обязателен: без него браузер подкручивает страницу, чтобы
      // показать элемент с учётом scroll-padding-top, и клик по телефону в шапке
      // дёргал страницу вверх. Видно это было только по сетевому адресу:
      // на localhost и по https работает Clipboard API, и сюда не заходит.
      if (back && back.focus) back.focus({ preventScroll: true });
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  var wide = window.matchMedia('(min-width: 1024px)');
  var tip = document.createElement('span');
  tip.className = 'ls-copy-tip';
  // «Скопировано» должно дойти и до скринридера, а не только до глаза
  tip.setAttribute('aria-live', 'polite');
  // Галочка и текст лежат отдельно: подменять весь чип на разметку каждый раз
  // нельзя — aria-live тогда объявляет его заново на каждое наведение.
  tip.innerHTML = '<svg class="ls-copy-ok" width="12" height="12" viewBox="0 0 12 12" ' +
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><path d="M2 6.5l2.5 2.5L10 3.5"/></svg>' +
    '<span class="ls-copy-text"></span>';
  var tipText = tip.querySelector('.ls-copy-text');
  document.body.appendChild(tip);

  var current = null, timer = 0;

  function place(el) {
    var r = el.getBoundingClientRect();
    tip.style.left = Math.round(r.left + r.width / 2) + 'px';
    // Обычно подсказка висит над ссылкой. У телефона в шапке над ней ничего
    // нет — она обрезалась бы верхним краем окна, поэтому там падает вниз.
    var below = r.top < 56;
    tip.classList.toggle('ls-is-below', below);
    tip.style.top = Math.round(below ? r.bottom + 8 : r.top - 8) + 'px';
  }

  function show(el, text, done) {
    current = el;
    tipText.textContent = text;
    tip.classList.toggle('ls-is-done', !!done);
    place(el);
    tip.classList.add('ls-is-on');
  }

  function hide() {
    current = null;
    tip.classList.remove('ls-is-on');
  }

  links.forEach(function (a) {
    function offer() { if (wide.matches) show(a, 'Скопировать'); }
    function leave() { if (current === a) { clearTimeout(timer); hide(); } }

    a.addEventListener('mouseenter', offer);
    a.addEventListener('focus', offer);
    a.addEventListener('mouseleave', leave);
    a.addEventListener('blur', leave);

    a.addEventListener('click', function (e) {
      if (!wide.matches) return;
      e.preventDefault();
      // берём то, что человек видит: так и вставится. Неразрывные пробелы
      // из разметки сводим к обычным, иначе они уедут в буфер как есть.
      var text = a.textContent.replace(/\s+/g, ' ').trim();
      copy(text).then(function () {
        clearTimeout(timer);
        show(a, 'Скопировано', true);
        timer = setTimeout(function () { if (current === a) show(a, 'Скопировать'); }, 1600);
      }, function () {
        window.location.href = a.getAttribute('href');
      });
    });
  });

  // Адрес ведёт на Яндекс.Карты в новой вкладке. Копировать его незачем,
  // но по виду он такая же ссылка, как телефон и почта рядом, и без подсказки
  // непонятно, куда он уведёт. Поэтому подсказка та же, а клик не перехватываем.
  var addr = document.querySelector('.ls-addr a[href*="yandex"]');
  if (addr) {
    addr.addEventListener('mouseenter', function () {
      if (wide.matches) show(addr, 'Открыть на Яндекс.Картах');
    });
    addr.addEventListener('focus', function () {
      if (wide.matches) show(addr, 'Открыть на Яндекс.Картах');
    });
    addr.addEventListener('mouseleave', function () { if (current === addr) hide(); });
    addr.addEventListener('blur', function () { if (current === addr) hide(); });
  }

  // подсказка привязана к месту на экране, а не к странице
  window.addEventListener('scroll', function () { if (current) place(current); }, { passive: true });
  window.addEventListener('resize', function () { if (current) place(current); });
  wide.addEventListener('change', function () { if (!wide.matches) hide(); });
})();
