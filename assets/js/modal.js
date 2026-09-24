// Ролик в диалоге поверх страницы.
//
// Видео живёт во «ВКонтакте» и грузится только по клику: на странице лежит
// одна картинка-превью, а не плеер. Так же сделано на текущем сайте —
// четыре ролика стоят четверть мегабайта превью вместо мегабайтов видео.
//
// Плитка остаётся ссылкой на ролик: без скрипта клик просто уводит во
// «ВКонтакте», и это рабочий запасной путь.
//
// autoplay=1 — как на боевом сайте: ролик стартует сразу, и круглая кнопка
// плеера «ВКонтакте» не показывается. Кастомизировать её всё равно нельзя,
// плеер живёт в чужом iframe.

(function () {
  var modal = document.querySelector('.ls-modal-video');
  if (!modal || !modal.showModal) return;

  var frame = modal.querySelector('iframe');

  document.querySelectorAll('[data-video]').forEach(function (tile) {
    tile.addEventListener('click', function (e) {
      var id = tile.getAttribute('data-video').split('_');
      if (id.length !== 2) return;
      e.preventDefault();
      frame.src = 'https://vk.com/video_ext.php?oid=-' + id[0] + '&id=' + id[1] + '&hd=2&autoplay=1';
      modal.showModal();
    });
  });

  // src снимаем при закрытии: иначе ролик продолжает играть за кулисами,
  // и звук идёт с невидимой страницы
  function stop() { frame.removeAttribute('src'); }
  modal.addEventListener('close', stop);

  modal.querySelector('.ls-modal-close').addEventListener('click', function () {
    modal.close();
  });

  // клик мимо кадра закрывает: диалог во весь экран, и промах по фону
  // читается как «закрыть», а не как «ничего не делать»
  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.close();
  });
})();
