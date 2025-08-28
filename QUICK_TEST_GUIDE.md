# 🚀 Инструкция для НЕМЕДЛЕННОГО тестирования

## ⚡ Что нужно сделать за 15 минут:

### **Шаг 1: Создать Telegram бота (5 минут)**

1. **Откройте Telegram, найдите @BotFather**
2. **Отправьте команды:**
   ```
   /newbot
   ElectroService Manager Bot
   @YourCompanyElectroBot
   ```
3. **Скопируйте токен** (вида: `123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`)

### **Шаг 2: Применить миграции (2 минуты)**

```bash
# В папке проекта
supabase db reset
```

### **Шаг 3: Настроить переменные (3 минуты)**

В Supabase Dashboard → Settings → Environment Variables добавить:
```
TELEGRAM_BOT_TOKEN=123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

### **Шаг 4: Развернуть Edge Functions (3 минуты)**

```bash
supabase functions deploy telegram-notifications
supabase functions deploy telegram-webhook  
supabase functions deploy telegram-worker-notifications
```

### **Шаг 5: Настроить webhook (2 минуты)**

```bash
curl -X POST \
  https://api.telegram.org/bot<ВАШ_ТОКЕН>/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://your-project.supabase.co/functions/v1/telegram-webhook"
  }'
```

## 🧪 ТЕСТИРОВАНИЕ:

### **Как менеджер:**
1. Войдите в веб-систему как менеджер
2. Идите в **Настройки → Telegram**
3. Найдите вашего бота в Telegram, отправьте `/start`
4. Скопируйте ваш Telegram ID из ответа бота
5. Вставьте ID в веб-интерфейс, нажмите "Связать аккаунт"

### **Как рабочий:**
1. Войдите в веб-систему как рабочий
2. Начните смену
3. Возьмите задачу в работу
4. Добавьте фото через "Фото-отчёт"
5. **Нажмите "Завершить"** → Менеджер получит уведомление в Telegram!

## ✅ Что должно произойти:

**Менеджер получит в Telegram:**
```
🔔 Задача завершена и ожидает приемки

👤 Исполнитель: Иван Рабочий
📋 Задача: Название задачи
⏰ Завершено: 23.08.2025 14:30
📸 Фото: 2 шт.

[✅ Принять] [❌ Отклонить] [📸 Запросить фото]
```

**Когда менеджер нажмет кнопку:**
- Рабочий получит уведомление о результате
- Статус задачи обновится в системе

---

## 🎯 СЛЕДУЮЩИЙ ЭТАП: Telegram Mini App для рабочих

После успешного тестирования мы создадим Telegram Mini App для рабочих, где они смогут:
- Управлять сменами
- Работать с задачами  
- Отправлять фото-отчеты
- Получать уведомления

Все прямо в Telegram без веб-браузера!