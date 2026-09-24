// Увеличение миниатюры материалов по касанию.
//
// На устройствах с мышью это делает один CSS (:hover в rows.css), пальцем
// наведения нет — нужен класс. Только в «Материалах и отделке»: строки
// каталога и смежных услуг целиком ссылки, и тап по ним должен вести
// на услугу, а не разглядывать снимок.

(function () {
  if (window.matchMedia('(hover: hover)').matches) return;

  var thumbs = document.querySelectorAll('.ls-specs .ls-thumb');
  if (!thumbs.length) return;                  // на категории материалов нет
  var open = null;

  function close() {
    if (!open) return;
    open.classList.remove('ls-is-zoom');
    open = null;
  }

  Array.prototype.forEach.call(thumbs, function (thumb) {
    if (!thumb.querySelector('img')) return;   // заглушка без снимка
    thumb.addEventListener('click', function () {
      var same = thumb === open;
      close();
      if (same) return;                        // повторное касание закрывает
      thumb.classList.add('ls-is-zoom');
      open = thumb;
    });
  });

  // касание мимо и прокрутка закрывают: увеличенный снимок перекрывает
  // строки под собой и висеть сам по себе не должен
  document.addEventListener('pointerdown', function (e) {
    if (open && !e.target.closest('.ls-thumb')) close();
  });
  window.addEventListener('scroll', close, { passive: true });
})();
