// Отправка формы и экран «Заявка у нас». В прототипе отправка имитируется.

// отправка и «спасибо». В прототипе отправки нет: preventDefault стоит всегда,
// при переносе в CMS убрать и вешать сообщение на успешный ответ сервера.
(function () {
  var form = document.querySelector('.ls-lead-form form');
  if (!form) return;
  var btn = form.querySelector('button[type=submit]');
  var head = document.querySelector('.ls-lead-form h2');
  var sub = document.querySelector('.ls-lead-form .ls-sub');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = 'Отправляем…';

    setTimeout(function () {
      var ok = document.createElement('div');
      ok.className = 'ls-sent';
      ok.setAttribute('role', 'status');
      ok.tabIndex = -1;
      ok.innerHTML =
        '<span class="ls-sent-mark"><svg viewBox="0 0 113.12 161.82" fill="currentColor" ' +
        'aria-hidden="true"><path d="m53.39,38.49l-4.17,17.01c-.35,1.45-2.16,1.95-3.21.9l-22.43-22.43c-1.16-1.16-3.15-.34-3.15,1.31v30.92c0,.49.19.96.54,1.31l3.55,3.55c1.2,1.2.35,3.26-1.35,3.26h-.82c-1.06,0-1.92.86-1.92,1.92v22.93c0,1.06.86,1.92,1.92,1.92h13.26c1.24,0,2.15,1.16,1.86,2.37l-2.79,11.37c-.09.35.02.73.3,1.06l17.6,21.04c.93,1.11,3,.99,3.29-.18l5.95-24.28c.35-1.45,2.16-1.95,3.21-.9l24.51,24.52c1.16,1.16,3.15.34,3.15-1.31v-30.91c0-.49-.19-.96-.54-1.31l-11.15-11.15c-.75-.75-.75-1.96,0-2.7l11.12-11.12c1.21-1.21.35-3.27-1.36-3.27h-17.17c-1.24,0-2.15-1.16-1.86-2.37l10.57-43.09c.29-1.18-1.5-2.24-2.83-1.68l-25.34,10.52c-.4.16-.67.45-.75.8Z"/></svg></span>';
      if (head) {
        head.innerHTML = 'Заявка у нас.<br>Ответим в рабочее время';
      }

      // внизу те же каналы ссылками, поэтому вводную меняем: «не любите формы» уже не к месту
      var or = document.querySelector('.ls-lead-form .ls-or');
      if (or && or.firstChild) or.firstChild.textContent = 'Если нужно быстрее — напишите в ';
      if (sub) sub.remove();
      form.replaceWith(ok);
      ok.focus();
    }, 900);
  });
})();
