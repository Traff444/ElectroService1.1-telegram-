import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Интерфейсы для типизации
interface TelegramMessage {
  chat_id: number;
  text: string;
  parse_mode?: string;
  reply_markup?: {
    inline_keyboard: Array<Array<{
      text: string;
      callback_data: string;
    }>>;
  };
}

interface TelegramPhoto {
  chat_id: number;
  photo: string;
  caption?: string;
}

interface TaskNotificationData {
  task_id: string;
  worker_id: string;
  worker_name: string;
  task_title: string;
  task_description?: string;
  completed_at: string;
  photos?: string[];
  checklist_items?: number;
  checklist_completed?: number;
}

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: {
      id: number;
    };
  };
  error_code?: number;
  description?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Получаем переменные окружения
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN не настроен')
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase конфигурация не настроена')
    }

    // Инициализируем Supabase клиент
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Парсим данные запроса
    const requestData = await req.json()
    console.log('Получены данные для уведомления:', requestData)

    const taskData: TaskNotificationData = requestData

    // Получаем данные менеджера для отправки уведомления
    const { data: managerData, error: managerError } = await supabase
      .rpc('get_manager_telegram_data', { task_uuid: taskData.task_id })

    if (managerError) {
      console.error('Ошибка получения данных менеджера:', managerError)
      throw new Error(`Ошибка получения данных менеджера: ${managerError.message}`)
    }

    if (!managerData || managerData.length === 0) {
      console.log('Менеджер с Telegram не найден для задачи:', taskData.task_id)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Менеджер с настроенным Telegram не найден' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    const manager = managerData[0]

    if (!manager.notifications_enabled) {
      console.log('Уведомления отключены для менеджера:', manager.manager_id)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Уведомления отключены для менеджера' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Формируем текст уведомления
    const completedDate = new Date(taskData.completed_at).toLocaleString('ru-RU', {
      timeZone: 'Europe/Minsk',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const checklistInfo = taskData.checklist_items && taskData.checklist_completed 
      ? `\n✅ Чек-лист: ${taskData.checklist_completed}/${taskData.checklist_items}`
      : ''

    const photoInfo = taskData.photos && taskData.photos.length > 0
      ? `\n📸 Фото: ${taskData.photos.length} шт.`
      : '\n📸 Фото: не прикреплены'

    const messageText = `🔔 *Задача завершена и ожидает приемки*

👤 *Исполнитель:* ${taskData.worker_name}
📋 *Задача:* ${taskData.task_title}
⏰ *Завершено:* ${completedDate}${photoInfo}${checklistInfo}

Пожалуйста, проверьте выполненную работу и примите решение:`

    // Формируем клавиатуру с кнопками для ответа
    const keyboard = {
      inline_keyboard: [
        [
          { 
            text: "✅ Принять", 
            callback_data: `approve_${taskData.task_id}` 
          },
          { 
            text: "❌ Отклонить", 
            callback_data: `reject_${taskData.task_id}` 
          }
        ],
        [
          { 
            text: "📸 Запросить фото", 
            callback_data: `request_photos_${taskData.task_id}` 
          },
          { 
            text: "👁 Подробнее", 
            callback_data: `details_${taskData.task_id}` 
          }
        ]
      ]
    }

    // Отправляем основное уведомление
    const message: TelegramMessage = {
      chat_id: manager.chat_id,
      text: messageText,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    }

    console.log('Отправляем сообщение в Telegram:', {
      chat_id: manager.chat_id,
      task_id: taskData.task_id
    })

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      }
    )

    const telegramResult: TelegramResponse = await telegramResponse.json()

    if (!telegramResult.ok) {
      console.error('Ошибка отправки в Telegram:', telegramResult)
      throw new Error(`Telegram API error: ${telegramResult.description}`)
    }

    const messageId = telegramResult.result?.message_id

    console.log('Сообщение отправлено, ID:', messageId)

    // Отправляем фото, если они есть
    if (taskData.photos && taskData.photos.length > 0) {
      console.log('Отправляем фото:', taskData.photos.length)
      
      for (let i = 0; i < Math.min(taskData.photos.length, 10); i++) {
        const photoUrl = taskData.photos[i]
        
        try {
          const photoMessage: TelegramPhoto = {
            chat_id: manager.chat_id,
            photo: photoUrl,
            caption: `Фото ${i + 1} к задаче: ${taskData.task_title}`
          }

          await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(photoMessage)
            }
          )

          console.log(`Фото ${i + 1} отправлено`)
        } catch (photoError) {
          console.error(`Ошибка отправки фото ${i + 1}:`, photoError)
          // Продолжаем отправку остальных фото
        }
      }
    }

    // Логируем отправленное уведомление в базу данных
    if (messageId) {
      const { error: logError } = await supabase
        .rpc('log_task_notification', {
          p_task_id: taskData.task_id,
          p_manager_id: manager.manager_id,
          p_worker_id: taskData.worker_id,
          p_telegram_message_id: messageId,
          p_notification_type: 'task_completion'
        })

      if (logError) {
        console.error('Ошибка логирования уведомления:', logError)
        // Не бросаем ошибку, так как основная функция выполнена
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Уведомление отправлено',
        telegram_message_id: messageId,
        photos_sent: taskData.photos?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Ошибка в telegram-notifications function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})