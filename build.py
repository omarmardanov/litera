#!/usr/bin/env python3
"""Сборка страниц из частей.

   Разметка шапки, меню, шагов, формы, футера, куки-баннера, виджета и списки
   стилей и скриптов одинаковы на всех страницах. Пока их правили руками
   в каждом файле, они расходились молча: раздел отстал от главной на пять
   стилей и четыре скрипта.

   Части лежат в `_parts/`, исходники страниц — в `_pages/`, собранные
   страницы кладутся рядом с `assets/`, их отдаёт сервер. Правим только
   `_parts/` и `_pages/`, собранные файлы не трогаем.

   Части один в один ложатся на `get_template_part` в WordPress — это заодно
   готовая нарезка шаблона для разработчика.

   Что умеет шаблон:
       <!-- @include lead.html -->        вставить часть
       <!-- @set dir poligrafiya -->      переменная страницы → {{dir}} в частях
       <!-- @block what -->…<!-- @endblock -->
                                          содержимое для <!-- @slot what --> в части;
                                          если блока нет, слот пустой
       <!-- @slot what -->…<!-- @endslot -->
                                          слот со значением по умолчанию: остаётся,
                                          пока страница не задала свой блок
   Версия ассетов подставляется в {{v}} из `_build.json`.

   Запуск из этой папки:
       python3 build.py          — собрать
       python3 build.py --bump   — поднять ?v= и собрать
"""
import re, sys, json, pathlib

ROOT = pathlib.Path(__file__).parent
VER  = ROOT / '_build.json'

def version(bump=False):
    d = json.loads(VER.read_text(encoding='utf-8')) if VER.exists() else {'v': 1}
    if bump:
        d['v'] += 1
        VER.write_text(json.dumps(d, ensure_ascii=False), encoding='utf-8')
    return d['v']

def include(text, depth=0):
    assert depth < 5, 'слишком глубокая вложенность частей'
    def sub(m):
        f = ROOT / '_parts' / m.group(1)
        assert f.exists(), f'нет части: {m.group(1)}'
        return include(f.read_text(encoding='utf-8').rstrip('\n'), depth + 1)
    return re.sub(r'<!-- @include ([\w.-]+) -->', sub, text)

def build(src, v):
    text = src.read_text(encoding='utf-8')
    # переменные и блоки страницы собираются до включений и из текста убираются
    vars = {'v': str(v)}
    for m in re.finditer(r'<!-- @set (\w+) (.*?) -->\n?', text):
        vars[m.group(1)] = m.group(2)
    text = re.sub(r'<!-- @set (\w+) (.*?) -->\n?', '', text)
    blocks = {}
    def grab(m):
        blocks[m.group(1)] = m.group(2).rstrip('\n')
        return ''
    text = re.sub(r'<!-- @block (\w+) -->\n?(.*?)<!-- @endblock -->\n?', grab, text, flags=re.S)
    out = include(text)
    def slot(m):
        name, default = m.group(1), (m.group(2) or '')
        body = blocks.get(name, default.rstrip('\n'))
        return body + '\n' if body else ''
    out = re.sub(r'<!-- @slot (\w+) -->\n?(?:(.*?)<!-- @endslot -->\n?)?', slot, out, flags=re.S)
    out = re.sub(r'\{\{(\w+)\}\}', lambda m: vars.get(m.group(1), m.group(0)), out)
    # предупреждение прямо в собранном файле: правки здесь затрутся
    out = out.replace('<!doctype html>',
        '<!doctype html>\n<!-- СОБРАНО build.py. Не править этот файл: правки затрутся '
        'при следующей сборке.\n     Исходник страницы — _pages/%s, общие части — _parts/. -->' % src.name, 1)
    left = re.findall(r'\{\{(\w+)\}\}', out)
    assert not left, f'{src.name}: не подставлено {set(left)}'
    assert '@include' not in out and '@slot' not in out, f'{src.name}: осталась директива'
    return out

def main():
    v = version('--bump' in sys.argv)
    made = []
    for src in sorted((ROOT / '_pages').glob('*.html')):
        out = build(src, v)
        (ROOT / src.name).write_text(out, encoding='utf-8')
        made.append(f'{src.name} ({out.count(chr(10)) + 1} строк)')
    print(f'?v={v} · собрано: ' + ', '.join(made))

main()
