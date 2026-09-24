// Поле «что нужно напечатать» растёт по мере ввода: начинается одной строкой,
// чтобы не пугать объёмом, но вмещает длинный текст без внутренней прокрутки.

(function () {
  var ta = document.querySelector('.ls-lead-form textarea');
  if (!ta) return;

  function fit() {
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  ta.addEventListener('input', fit);
})();
