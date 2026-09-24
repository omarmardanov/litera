// Уведомление о сборе данных: показываем один раз, выбор помним.
// Появляется с задержкой, чтобы не перекрывать первый экран сразу при заходе.

(function () {
  var KEY = 'litera-cookie-ok';
  var box = document.getElementById('cookie');
  if (!box) return;

  var seen;
  try { seen = localStorage.getItem(KEY); } catch (e) { seen = '1'; }  // приватный режим
  if (seen) return;

  box.hidden = false;
  setTimeout(function () { box.classList.add('ls-is-shown'); }, 900);

  box.querySelector('.ls-cookie-ok').addEventListener('click', function () {
    box.classList.remove('ls-is-shown');
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    setTimeout(function () { box.hidden = true; }, 350);
  });
})();
