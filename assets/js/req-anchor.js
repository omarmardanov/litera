// Требования: раскрыть раздел, на который ведёт якорь.
//
// Оглавление и ссылки менеджеров ведут на `#cvet`, `#shrift` и так далее —
// это адреса с сайта студии, их нельзя менять. Раздел там `<details>`, а его
// браузер сам не раскрывает, когда id стоит на самом элементе: получалось,
// что по ссылке страница прокручивалась к закрытой строке.
(function () {
  var list = document.querySelector('.ls-req-group');
  if (!list) return;

  function open(hash) {
    if (!hash || hash.length < 2) return;
    var el;
    try { el = document.querySelector(hash); } catch (e) { return; }
    if (!el || el.tagName !== 'DETAILS') return;
    el.open = true;
    el.scrollIntoView();
  }

  open(location.hash);
  window.addEventListener('hashchange', function () { open(location.hash); });
})();
