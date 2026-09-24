// Прикрепление файлов: накопление списка, проверка размера, удаление по одному.

// прикреплённые файлы: копим список, показываем, даём убрать по одному
(function () {
  var inp = document.querySelector('.ls-lead-form .ls-file input');
  var list = document.querySelector('.ls-lead-form .ls-file-list');
  var label = document.querySelector('.ls-lead-form .ls-file span');
  if (!inp || !list || !label) return;

  var store = [];
  var LIMIT = 25 * 1024 * 1024; // отраслевая норма для макетов; на сервере лимит поднять до неё
  var note = document.querySelector('.ls-lead-form .ls-file-note');
  var noteText = note ? note.textContent : '';

  function size(b) {
    return b < 1024 * 1024
      ? Math.max(1, Math.round(b / 1024)) + ' КБ'
      : (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' МБ';
  }

  function same(a, b) {
    return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
  }

  // input отдаёт только последний выбор, поэтому копим сами и переписываем FileList
  function sync() {
    var dt = new DataTransfer();
    store.forEach(function (f) { dt.items.add(f); });
    inp.files = dt.files;
  }

  function render() {
    list.textContent = '';
    list.hidden = !store.length;
    label.textContent = store.length ? 'Прикрепить ещё' : 'Прикрепить файлы';

    store.forEach(function (f, i) {
      var li = document.createElement('li');
      var n = document.createElement('span');
      n.className = 'ls-n';
      n.textContent = f.name;
      var sz = document.createElement('span');
      sz.className = 'ls-s';
      sz.textContent = size(f.size);
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Убрать ' + f.name);
      b.innerHTML = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" ' +
        'stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
        '<path d="M1 1l10 10M11 1L1 11"/></svg>';
      b.addEventListener('click', function () {
        store.splice(i, 1);
        sync();
        render();
      });
      li.appendChild(n); li.appendChild(sz); li.appendChild(b);
      list.appendChild(li);
    });
  }

  inp.addEventListener('change', function () {
    var heavy = [];
    Array.prototype.forEach.call(inp.files, function (f) {
      if (f.size > LIMIT) { heavy.push(f.name); return; }
      var dup = store.some(function (x) { return same(x, f); });
      if (!dup) store.push(f);
    });
    if (note) {
      note.classList.toggle('ls-err', heavy.length > 0);
      note.textContent = heavy.length
        ? (heavy.length === 1 ? 'Файл ' + heavy[0] + ' тяжелее 25 МБ — пришлите ссылкой на облако'
                              : heavy.length + ' файла тяжелее 25 МБ — пришлите ссылкой на облако')
        : noteText;
    }
    sync();
    render();
  });
})();
