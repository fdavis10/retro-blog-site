# Troubleshooting ERR_CONNECTION_REFUSED

## Быстрая диагностика

### 1. Проверить статус контейнеров
```bash
docker-compose ps
# или
docker-compose -f docker-compose.production.yml ps
```

### 2. Проверить логи
```bash
# Все логи
docker-compose logs

# Логи конкретного сервиса
docker-compose logs nginx
docker-compose logs backend
docker-compose logs frontend

# Последние 50 строк
docker-compose logs --tail=50 nginx
```

### 3. Проверить, запущены ли контейнеры
```bash
docker ps
```

### 4. Проверить порты
```bash
# Какие порты слушают
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Или
ss -tulpn | grep :80
```

### 5. Проверить nginx конфигурацию
```bash
docker-compose exec nginx nginx -t
```

### 6. Перезапустить все сервисы
```bash
docker-compose down
docker-compose -f docker-compose.production.yml up -d --build
```

### 7. Проверить firewall
```bash
# Если используете ufw
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Если используете firewalld
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```
