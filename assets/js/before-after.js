// Шторка «Лечим макеты».
//
// Позиция живёт в CSS-переменной --pos: по ней обрезается верхний слой
// и стоит ручка. На десктопе шторка просто идёт за курсором — тянуть
// и зажимать ничего не надо, достаточно провести мышью по кадру.
// На телефоне шторка идёт за пальцем, пока его не отпустят.
//
// Ползунок под ней остаётся: это клавиатура. Без скрипта он работает
// сам по себе, просто картинку не двигает.

(function () {
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.querySelectorAll('.ls-ba-frame').forEach(function (frame) {
    var range = frame.querySelector('.ls-ba-range');
    if (!range) return;

    function set(percent) {
      frame.style.setProperty('--pos', percent + '%');
      range.value = percent;
    }

    range.addEventListener('input', function () { set(range.value); });

    // Показ при появлении: шторка один раз проходит туда-сюда, чтобы было
    // понятно, что кадр живой. Дальше блок слушается курсора.
    if ('IntersectionObserver' in window) {
      var shown = false;
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || shown) return;
          shown = true;
          frame.classList.add('is-demo');
          frame.addEventListener('animationend', function done() {
            frame.classList.remove('is-demo');
            frame.removeEventListener('animationend', done);
          });
          obs.disconnect();
        });
      }, {threshold: 0.45}).observe(frame);
    }

    var frameId = 0, pending = 50;

    // за пальцем и курсором следим покадрово: событий приходит больше,
    // чем перерисовок
    function follow(clientX) {
      var box = frame.getBoundingClientRect();
      pending = Math.min(100, Math.max(0, ((clientX - box.left) / box.width) * 100));
      if (!frameId) frameId = requestAnimationFrame(function () {
        frameId = 0;
        set(pending);
      });
    }

    // Телефон: нативный ползунок тянется только за свой бегунок, а он тут
    // невидим, и палец обычно попадает мимо — выходит прыжок по тычку вместо
    // движения. Поэтому на тач-экране шторку ведём сами, а ползунку убираем
    // приём касаний, чтобы он не спорил за палец. Значение ему проставляет
    // set(), клавиатура и фокус работают как раньше; без скрипта он остаётся
    // обычным ползунком.
    if (!fine) {
      var pointer = null;

      range.style.pointerEvents = 'none';

      frame.addEventListener('pointerdown', function (e) {
        pointer = e.pointerId;
        frame.classList.remove('is-demo');
        frame.setPointerCapture(pointer);
        follow(e.clientX);
      });

      frame.addEventListener('pointermove', function (e) {
        if (e.pointerId === pointer) follow(e.clientX);
      });

      function release(e) {
        if (e.pointerId === pointer) pointer = null;
      }
      frame.addEventListener('pointerup', release);
      frame.addEventListener('pointercancel', release);

      return;
    }

    // курсор пришёл — показ обрывается, дальше ведёт человек
    frame.addEventListener('mouseenter', function () {
      frame.classList.remove('is-demo');
    });

    frame.addEventListener('mousemove', function (e) {
      follow(e.clientX);
    });

    // курсор ушёл — шторка возвращается на середину, чтобы блок не оставался
    // показанным наполовину. Возврат плавный, слежение — нет: с переходом
    // шторка тянулась бы за курсором с задержкой.
    frame.addEventListener('mouseleave', function () {
      frame.classList.add('is-easing');
      set(50);
      setTimeout(function () { frame.classList.remove('is-easing'); }, 320);
    });
  });
})();
