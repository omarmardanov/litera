// Переключение «Фото / Видео» в блоке работ.
//
// Без скрипта видна первая панель, вторая скрыта атрибутом hidden — то есть
// фотографии показываются всегда, а ролики теряются. Это осознанный размен:
// разметка остаётся простой, а работы важнее роликов.

(function () {
  var tabs = document.querySelector('.ls-works-tabs');
  if (!tabs) return;

  var buttons = tabs.querySelectorAll('[role="tab"]');

  function show(active) {
    buttons.forEach(function (b) {
      var on = b === active;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { show(b); });
  });

  // стрелками, как это принято во вкладках
  tabs.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var list = Array.prototype.slice.call(buttons);
    var i = list.indexOf(document.activeElement);
    if (i < 0) return;
    var next = list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
    next.focus();
    show(next);
  });
})();
