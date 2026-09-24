// Виджет связи. Кнопка раскрывает список каналов — как «Кнопка на сайт»
// Битрикс24 на живом сайте.
//
// Разработчику: родной запускающий элемент Битрикса спрятать, а его чат
// подключать сюда же, если понадобится вернуть пункт «Чат на сайте» —
// сейчас в списке только мессенджеры.

(function () {
  var fab = document.querySelector('.ls-chat-fab');
  var list = document.getElementById('chat-list');
  if (!fab || !list) return;

  var open = false;

  function set(on) {
    open = on;
    list.hidden = false;              // hidden только до первого открытия
    list.classList.toggle('ls-is-open', on);
    fab.setAttribute('aria-expanded', String(on));
    fab.setAttribute('aria-label', on ? 'Закрыть' : 'Связаться');
  }

  fab.addEventListener('click', function () { set(!open); });

  // переход по каналу — список закрывается
  list.addEventListener('click', function (e) {
    if (e.target.closest('.ls-chat-item')) set(false);
  });

  // На телефоне виджет не висит на первом экране: он перекрывает кадр и кнопку
  // «Рассчитать». Появляется, когда первый экран ушёл под шапку — по метке
  // `.ls-chat-sentinel` в разметке. На широком экране виджет как был.
  var wrap = document.querySelector('.ls-chat');
  var mark = document.querySelector('.ls-chat-sentinel');
  var barH = (document.querySelector('.ls-topbar') || {}).offsetHeight || 54;
  var narrow = window.matchMedia('(max-width: 1023px)');

  if (mark) {
    var past = false;
    var paint = function () {
      var away = narrow.matches && !past;
      wrap.classList.toggle('ls-is-away', away);
      if (away && open) set(false);
    };
    paint();
    // Положение метки считаем сами, а не по isIntersecting: метка может быть
    // и выше окна, и ниже его — «не пересекается» об этом не говорит.
    new IntersectionObserver(function () {
      past = mark.getBoundingClientRect().top <= barH;
      paint();
    }, { rootMargin: '-' + barH + 'px 0px 0px 0px', threshold: 0 }).observe(mark);
    narrow.addEventListener('change', paint);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) { set(false); fab.focus(); }
  });

  // клик мимо закрывает: виджет висит поверх страницы и перехватывать
  // внимание после выбора не должен
  document.addEventListener('pointerdown', function (e) {
    if (open && !e.target.closest('.ls-chat')) set(false);
  });
})();
