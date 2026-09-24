// Подпись у курсора: что случится по клику.
//
// Карточка работы — большая картинка без видимой кнопки, и по ней не очевидно,
// что это ссылка. Подпись отвечает на вопрос ровно в тот момент, когда он
// возникает, и не занимает места в вёрстке.
//
// Только там, где есть мышь: на телефоне курсора нет, а наведение there
// эмулируется тапом — подпись мигала бы при каждом касании.

(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var targets = document.querySelectorAll('[data-cursor]');
  if (!targets.length) return;

  var label = document.createElement('div');
  label.className = 'ls-cursor';
  label.setAttribute('aria-hidden', 'true');
  document.body.appendChild(label);

  var x = 0, y = 0, shown = false, frame = 0;

  function draw() {
    frame = 0;
    label.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  }

  function move(e) {
    x = e.clientX; y = e.clientY;
    if (!frame) frame = requestAnimationFrame(draw);
  }

  targets.forEach(function (el) {
    el.addEventListener('mouseenter', function (e) {
      label.textContent = el.getAttribute('data-cursor');
      x = e.clientX; y = e.clientY;
      draw();
      if (!shown) { shown = true; label.classList.add('is-on'); }
      document.addEventListener('mousemove', move);
    });
    el.addEventListener('mouseleave', function () {
      shown = false;
      label.classList.remove('is-on');
      document.removeEventListener('mousemove', move);
    });
  });
})();
