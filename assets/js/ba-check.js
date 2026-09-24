// «Покажите свой макет» под шторкой «Лечим макеты».
//
// Кнопка ведёт в форму и сразу открывает выбор файла: человек уже понял,
// что макет можно прислать, и заставлять его второй раз искать «Прикрепить
// файлы» незачем.
//
// Туда же файл можно просто перетащить мышью — он попадёт в форму сам,
// а страница доедет до неё. Без скрипта кнопка остаётся обычной ссылкой
// на форму, перетаскивание просто не работает.

(function () {
  var cta = document.querySelector('.ls-ba-cta');
  if (!cta) return;

  var form = document.querySelector('.ls-lead-form');
  var input = form && form.querySelector('input[type="file"]');
  if (!input) return;

  // Выбор файла открываем не сразу: сначала страница должна доехать до формы,
  // иначе диалог встаёт поверх ещё едущей страницы и непонятно, куда попал файл.
  var btn = cta.querySelector('a[href="#zayavka"]');
  if (btn) btn.addEventListener('click', function () {
    setTimeout(function () { input.click(); }, 600);
  });

  ['dragenter', 'dragover'].forEach(function (type) {
    cta.addEventListener(type, function (e) {
      e.preventDefault();
      cta.classList.add('is-over');
    });
  });
  cta.addEventListener('dragleave', function () { cta.classList.remove('is-over'); });

  cta.addEventListener('drop', function (e) {
    e.preventDefault();
    cta.classList.remove('is-over');
    if (!e.dataTransfer || !e.dataTransfer.files.length) return;
    input.files = e.dataTransfer.files;
    // change слушает file-attach.js: он рисует список выбранных файлов
    input.dispatchEvent(new Event('change', {bubbles: true}));
    form.scrollIntoView({block: 'start', behavior: 'smooth'});
  });
})();
