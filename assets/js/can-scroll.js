// Лента возможностей: стрелки у заголовка и полоса прокрутки под ней.
//
// Без скрипта лента всё равно листается — пальцем и колесом с Shift, — а
// стрелки просто не показываются: они помечены hidden в разметке и
// открываются отсюда. Полоса тоже висит на скрипте и без него не мешает.

(function () {
  var box = document.querySelector('.ls-can');
  if (!box) return;

  var list = box.querySelector('ul');
  var nav  = box.querySelector('.ls-can-nav');
  var prev = box.querySelector('.ls-can-prev');
  var next = box.querySelector('.ls-can-next');
  var bar  = box.querySelector('.ls-can-bar');
  var knob = bar && bar.querySelector('i');
  if (!list || !nav) return;

  function step() {
    var card = list.querySelector('li');
    if (!card) return list.clientWidth;
    // шаг — карточка с промежутком: так лента всегда встаёт по краю кадра
    var gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function sync() {
    var max = list.scrollWidth - list.clientWidth;
    var scrollable = max > 1;

    nav.hidden = !scrollable;
    if (bar) bar.hidden = !scrollable;
    if (!scrollable) return;

    prev.disabled = list.scrollLeft <= 1;
    next.disabled = list.scrollLeft >= max - 1;

    if (knob) {
      var visible = list.clientWidth / list.scrollWidth;
      knob.style.width = (visible * 100) + '%';
      knob.style.translate = (list.scrollLeft / max) * (100 / visible - 100) + '%';
    }
  }

  prev.addEventListener('click', function () { list.scrollBy({left: -step(), behavior: 'smooth'}); });
  next.addEventListener('click', function () { list.scrollBy({left:  step(), behavior: 'smooth'}); });

  list.addEventListener('scroll', sync, {passive: true});
  addEventListener('resize', sync);
  sync();
})();
