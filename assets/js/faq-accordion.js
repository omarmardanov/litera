// Аккордеон вопросов: открыт один за раз. Запасной вариант для старых браузеров.

// один открытый вопрос за раз. Современные браузеры делают это сами по name,
// для старых — тот же эффект вручную.
(function () {
  if ('name' in document.createElement('details')) return;
  var list = [].slice.call(document.querySelectorAll('.ls-faq .ls-qa'));
  list.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      list.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
