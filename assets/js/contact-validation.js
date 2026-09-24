// Своё сообщение в системном пузыре валидации поля «Телефон».

(function () {
  var c = document.getElementById('contact');
  if (!c) return;

  var PHONE = /^[\d\s()+\-]{7,}$/;

  function check() {
    var v = c.value.trim();
    if (!v) { c.setCustomValidity(''); return; }   // пустое поле оставляем браузеру
    c.setCustomValidity(PHONE.test(v) ? ''
      : 'Укажите номер телефона — по нему мы напишем в мессенджер или позвоним');
  }

  c.addEventListener('input', function () { c.setCustomValidity(''); });
  c.addEventListener('invalid', check);
  if (c.form) c.form.addEventListener('submit', check);
})();
