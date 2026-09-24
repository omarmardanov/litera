// Картинка крупно поверх страницы: памятка с требованиями и кадры кейса.
//
// Открывает всё, что помечено `data-pic`: значение — путь к большой картинке,
// `data-alt` — её описание. Диалог на странице один, скрипт подставляет в него
// снимок, а рядом собирает листалку, если снимков в группе несколько.
//
// Группа — общий предок с `data-gallery`. У памятки такого предка нет,
// и она открывается одна, без стрелок и счётчика.
//
// Разметка остаётся рабочей без скрипта: у памятки это ссылка на страницу
// требований, у кадров кейса — кнопка, которая просто ничего не делает,
// а сами кадры и так видны на странице.

(function () {
  var modal = document.querySelector('.ls-modal-pic');
  if (!modal || !modal.showModal) return;

  var img = modal.querySelector('img');
  var triggers = [].slice.call(document.querySelectorAll('[data-pic]'));
  if (!triggers.length) return;

  var group = [], index = 0;

  // ── Листалка ────────────────────────────────────────────────────────
  var nav = document.createElement('div');
  nav.className = 'ls-modal-nav';
  nav.innerHTML =
    '<button type="button" class="ls-modal-prev" aria-label="Предыдущий кадр">' +
      '<svg width="15" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 1 1 7l6.5 6M1 7h16"/></svg></button>' +
    '<span class="ls-modal-count" aria-live="polite"></span>' +
    '<button type="button" class="ls-modal-next" aria-label="Следующий кадр">' +
      '<svg width="15" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 1 17 7l-6.5 6M17 7H1"/></svg></button>';
  modal.appendChild(nav);
  var count = nav.querySelector('.ls-modal-count');

  function show(i) {
    // по кругу: с последнего кадра стрелка ведёт на первый, и наоборот —
    // иначе на краях кнопка молча перестаёт работать
    index = (i + group.length) % group.length;
    var t = group[index];
    img.src = t.getAttribute('data-pic');
    img.alt = t.getAttribute('data-alt') || '';
    count.textContent = (index + 1) + ' / ' + group.length;
    nav.hidden = group.length < 2;
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var box = trigger.closest('[data-gallery]');
      group = box ? [].slice.call(box.querySelectorAll('[data-pic]')) : [trigger];
      show(group.indexOf(trigger));
      modal.showModal();
    });
  });

  nav.querySelector('.ls-modal-prev').addEventListener('click', function () { show(index - 1); });
  nav.querySelector('.ls-modal-next').addEventListener('click', function () { show(index + 1); });

  // стрелки клавиатуры: диалог держит фокус внутри себя, поэтому событие
  // ловим на нём, а не на документе
  modal.addEventListener('keydown', function (e) {
    if (group.length < 2) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
  });

  modal.querySelector('.ls-modal-close').addEventListener('click', function () {
    modal.close();
  });

  // клик мимо картинки закрывает: диалог во весь экран, и промах по фону
  // читается как «закрыть», а не как «ничего не делать»
  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.close();
  });

  // ── Свайп ───────────────────────────────────────────────────────────
  // На телефоне стрелок нет: кадры листают пальцем. Порог в 40 пикселей
  // отсекает дрожание при закрытии тапом, вертикальный жест не перехватываем —
  // это может быть щипок или прокрутка.
  var startX = 0, startY = 0, swiping = false;

  img.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    swiping = true;
  }, {passive: true});

  img.addEventListener('touchend', function (e) {
    if (!swiping || group.length < 2) return;
    swiping = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - startX, dy = t.clientY - startY;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    show(dx < 0 ? index + 1 : index - 1);
  }, {passive: true});

  // ── Лупа ────────────────────────────────────────────────────────────
  // В диалоге снимок и так почти во весь экран, поэтому лупа показывает
  // не «крупнее», а честные пиксели файла: увеличение равно отношению
  // натурального размера к показанному. Если файл не крупнее того, что уже
  // видно, лупы нет — увеличивать нечего, кроме размытия.
  //
  // Только там, где есть мышь: пальцем наводить не на что.
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var lens = document.createElement('i');
  lens.className = 'ls-modal-lens';
  lens.setAttribute('aria-hidden', 'true');
  modal.appendChild(lens);

  var zoom = 1;

  img.addEventListener('load', function () {
    var box = img.getBoundingClientRect();
    zoom = box.width ? img.naturalWidth / box.width : 1;
    // меньше трети прибавки не стоит показа: лупа только мешала бы
    if (zoom < 1.3) return;
    lens.style.backgroundImage = 'url("' + img.currentSrc + '")';
    lens.style.backgroundSize = img.naturalWidth + 'px ' + img.naturalHeight + 'px';
  });

  img.addEventListener('mousemove', function (e) {
    if (zoom < 1.3) return;
    var box = img.getBoundingClientRect();
    var size = lens.offsetWidth || 220;
    // точка под курсором в пикселях файла, минус половина лупы —
    // чтобы она оказалась в центре кружка
    var x = (e.clientX - box.left) / box.width * img.naturalWidth;
    var y = (e.clientY - box.top) / box.height * img.naturalHeight;
    lens.style.left = e.clientX + 'px';
    lens.style.top = e.clientY + 'px';
    lens.style.backgroundPosition = (size / 2 - x) + 'px ' + (size / 2 - y) + 'px';
    lens.classList.add('is-on');
  });

  img.addEventListener('mouseleave', function () { lens.classList.remove('is-on'); });
  modal.addEventListener('close', function () { lens.classList.remove('is-on'); });
})();
