#!/bin/bash

# 🤖 Полная настройка менеджерского бота @ElectroServiceManagerBot
# Этот скрипт настраивает все аспекты бота для менеджеров

MANAGER_BOT_TOKEN="8004824610:AAFJQATOO_IJc8l-6yw9ZOzHcufpHSFt4RI"
NGROK_URL="${1:-https://1f88df7a89bb.ngrok.app}"
TIMESTAMP=$(date +%s)

echo "🤖 Настройка менеджерского бота @ElectroServiceManagerBot"
echo "========================================================"
echo "🔑 Токен: $MANAGER_BOT_TOKEN"
echo "🔗 URL: $NGROK_URL"
echo ""

# 1. Устанавливаем имя бота
echo "📛 Устанавливаем имя бота..."
curl -s -X POST "https://api.telegram.org/bot$MANAGER_BOT_TOKEN/setMyName" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ЭлектроСервис - Менеджерская панель"
  }'
echo " ✅"

# 2. Устанавливаем описание бота (полное)
echo "📝 Устанавливаем полное описание..."
curl -s -X POST "https://api.telegram.org/bot$MANAGER_BOT_TOKEN/setMyDescription" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "🔧 ЭлектроСервис - Менеджерская панель\n\n👨‍💼 Для менеджеров и директоров\n📋 Управление задачами и командой\n📊 Аналитика и отчеты\n🔔 Уведомления о завершении работ\n📸 Просмотр фото-отчетов\n✅ Быстрая приёмка задач\n\n🚀 Нажмите Menu → ЭлектроСервис MANAGER\n\n💡 Для связки аккаунта отправьте /start"
  }'
echo " ✅"

# 3. Устанавливаем короткое описание
echo "📄 Устанавливаем короткое описание..."
curl -s -X POST "https://api.telegram.org/bot$MANAGER_BOT_TOKEN/setMyShortDescription" \
  -H "Content-Type: application/json" \
  -d '{
    "short_description": "🔧 ЭлектроСервис - Менеджерская панель для управления задачами и командой"
  }'
echo " ✅"

# 4. Устанавливаем команды бота
echo "⚙️ Устанавливаем команды..."
curl -s -X POST "https://api.telegram.org/bot$MANAGER_BOT_TOKEN/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {
        "command": "start",
        "description": "🚀 Приветствие и связка аккаунта"
      },
      {
        "command": "dashboard",
        "description": "📊 Открыть дашборд с аналитикой"
      },
      {
        "command": "tasks",
        "description": "📋 Управление задачами и приёмка работ"
      },
      {
        "command": "team",
        "description": "👥 Управление командой рабочих"
      },
      {
        "command": "notifications",
        "description": "🔔 Настройки уведомлений"
      },
      {
        "command": "help",
        "description": "❓ Справка по использованию системы"
      }
    ]
  }'
echo " ✅"

# 5. Обновляем меню с Mini App
echo "🔧 Обновляем меню с Mini App..."
curl -s -X POST "https://api.telegram.org/bot$MANAGER_BOT_TOKEN/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d "{
    \"menu_button\": {
      \"type\": \"web_app\",
      \"text\": \"🔧 ЭлектроСервис MANAGER\",
      \"web_app\": {
        \"url\": \"$NGROK_URL?manager=1&v=$TIMESTAMP\"
      }
    }
  }"
echo " ✅"

echo ""
echo "🎉 Менеджерский бот полностью настроен!"
echo "========================================"
echo ""
echo "🤖 Бот: @ElectroServiceManagerBot"
echo "📱 Mini App URL: $NGROK_URL?manager=1&v=$TIMESTAMP"
echo "🔗 Webhook: https://enyewzeskpiqueogmssp.functions.supabase.co/telegram-webhook"
echo ""
echo "👨‍💼 Как использовать менеджерам:"
echo "1. Найдите @ElectroServiceManagerBot в Telegram"
echo "2. Отправьте /start для получения инструкций"
echo "3. Свяжите ваш аккаунт через веб-интерфейс"
echo "4. Нажмите Menu → 'ЭлектроСервис MANAGER'"
echo "5. Получайте уведомления о завершенных задачах"
echo ""
echo "🔔 Уведомления включают:"
echo "• Фото-отчеты от рабочих"
echo "• Кнопки для быстрой приёмки/отклонения"
echo "• Автоматические уведомления рабочим о решении"
echo ""
echo "🚀 Бот готов к использованию!"
