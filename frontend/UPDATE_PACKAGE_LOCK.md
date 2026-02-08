# Обновление package-lock.json

## Проблема
`package-lock.json` не синхронизирован с `package.json` после добавления PWA зависимостей.

## Решение

Выполните следующие команды **локально** в директории `frontend`:

```bash
cd frontend
npm install
```

Это обновит `package-lock.json` с новыми зависимостями:
- `vite-plugin-pwa`
- `workbox-window`

После этого закоммитьте обновленный `package-lock.json`:

```bash
git add frontend/package-lock.json
git commit -m "Update package-lock.json with PWA dependencies"
git push
```

Затем на сервере пересоберите Docker образ:

```bash
docker-compose -f docker-compose.production.yml build frontend
docker-compose -f docker-compose.production.yml up -d
```

## Альтернативное решение (временное)

Если не можете обновить локально, можно временно изменить Dockerfile, чтобы использовать `npm install` вместо `npm ci`:

В `frontend/Dockerfile` замените:
```dockerfile
RUN npm ci
```

на:
```dockerfile
RUN npm install
```

**Внимание:** Это не рекомендуется для production, так как `npm install` может установить разные версии зависимостей. Используйте только как временное решение.
