// Крупная врезка между текстовыми блоками кейса.
//
// Врезка держит паузу между «Задачей» и «Что сделали». Если хотя бы одного
// из блоков нет — разбивать нечего, и крупный кадр посреди страницы читается
// случайным. Тогда он возвращается в галерею обычной клеткой, сразу после
// широкого кадра.
//
// В CMS это же правило считается на сервере; здесь скрипт нужен, чтобы
// прототип вёл себя так же, что бы редактор ни оставил пустым.

(function () {
  var inline = document.querySelector('.ls-case-inline');
  var gallery = document.querySelector('.ls-case-gallery');
  if (!inline || !gallery) return;

  // оба текстовых блока на месте — врезка остаётся крупной
  if (document.querySelectorAll('.ls-case-text').length >= 2) return;

  var fig = document.createElement('figure');
  fig.innerHTML = inline.innerHTML;
  // после первого, широкого кадра: он общий вид и остаётся первым
  var wide = gallery.querySelector('.is-wide');
  gallery.insertBefore(fig, wide ? wide.nextElementSibling : gallery.firstElementChild);
  inline.remove();
})();
