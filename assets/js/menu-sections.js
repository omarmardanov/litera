// Разделы меню: вся строка раскрывает свой список, открытым остаётся один.
// Высота анимируется через grid-template-rows, поэтому hidden снимаем сразу,
// а закрываем классом — иначе анимации не будет.

(function () {
  var buttons = [].slice.call(document.querySelectorAll('.ls-menu-group[aria-controls]'));
  if (!buttons.length) return;

  var subs = buttons.map(function (b) { return document.getElementById(b.getAttribute('aria-controls')); });
  subs.forEach(function (s) { if (s) s.hidden = false; });   // видимость держит класс

  function setOpen(i, on) {
    var btn = buttons[i], sub = subs[i];
    if (!btn || !sub) return;
    btn.setAttribute('aria-expanded', String(on));
    sub.classList.toggle('ls-is-open', on);
  }

  // На широком экране разделы стоят колонками и раскрыты все сразу — места
  // хватает, аккордеон там только мешает. Состояние ставим здесь, а не в CSS,
  // чтобы aria-expanded не расходился с тем, что видно.
  var wide = window.matchMedia('(min-width: 1024px)');
  function applyWide() {
    buttons.forEach(function (_, i) { setOpen(i, wide.matches); });
  }
  wide.addEventListener('change', applyWide);
  applyWide();

  buttons.forEach(function (btn, i) {
    btn.addEventListener('click', function (e) {
      // Заголовок раздела — ссылка на его страницу. На широком экране она так
      // и работает: списки раскрыты, раскрывать нечего. На телефоне список
      // свёрнут, и там строка по-прежнему раскрывает раздел, а не уводит
      // со страницы: переход остаётся первым пунктом внутри списка.
      if (wide.matches) return;
      e.preventDefault();
      var willOpen = btn.getAttribute('aria-expanded') !== 'true';
      // открытым остаётся один раздел: иначе список разрастается на несколько экранов
      buttons.forEach(function (_, k) { setOpen(k, false); });
      if (willOpen) setOpen(i, true);
    });
  });
})();
