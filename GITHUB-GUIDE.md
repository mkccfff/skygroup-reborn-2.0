# Как самостоятельно публиковать сайт на GitHub Pages

## Что публикуется

Исходники находятся в корне проекта, а готовый сайт после сборки появляется в папке `dist`.
GitHub Pages сейчас использует отдельный Git-репозиторий внутри `dist`.

## Перед первой публикацией

1. Установите Git и Node.js.
2. Откройте PowerShell в папке проекта:

```powershell
cd D:\codex\claude\skygroup-reborn-2.0
```

3. Если папки `node_modules` нет, установите зависимости:

```powershell
npm.cmd install
```

4. На GitHub создайте пустой публичный репозиторий, например `skygroup`.
5. В настройках репозитория откройте `Settings -> Pages`:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`

## Обычная публикация после правок

Соберите сайт с относительными путями:

```powershell
cd D:\codex\claude\skygroup-reborn-2.0
npm.cmd run build -- --base=./
```

Файл `.nojekyll` добавляется в `dist` автоматически.

Затем отправьте содержимое `dist`:

```powershell
git -C dist add -A
git -C dist commit -m "Обновление сайта"
git -C dist push origin main
```

Если Git сообщает, что изменений нет, значит новая сборка совпадает с опубликованной.

## Если `dist` ещё не подключён к GitHub

Выполните один раз:

```powershell
git -C dist init
git -C dist branch -M main
git -C dist remote add origin https://github.com/ВАШ_ЛОГИН/skygroup.git
git -C dist add -A
git -C dist commit -m "Первая публикация"
git -C dist push -u origin main
```

GitHub может попросить авторизацию через браузер. Пароль аккаунта для Git-команд не используется.

## Проверка перед публикацией

```powershell
npm.cmd run build
npm.cmd run dev
```

Откройте `http://localhost:5273`.

## Важные ограничения

- Один файл в обычном GitHub-репозитории не должен превышать 100 МБ.
- Не загружайте `_media-backups`: там тяжёлые оригиналы.
- Для GitHub Pages используйте сборку с `--base=./`.
- Для собственного домена и сервера обычно используется обычная команда `npm.cmd run build`.
