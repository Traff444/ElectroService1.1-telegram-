# 📱 Руководство по регистрации пользователей для Telegram

## 🔄 Процесс регистрации нового пользователя для Telegram

### Шаг 1: Создание пользователя в auth.users

#### Вариант A: Через веб-интерфейс
1. Откройте `https://732e7dfe7822.ngrok.app`
2. Нажмите "Создать аккаунт"
3. Заполните форму:
   - Email: `new.worker@electroservice.by`
   - Пароль: `password123`
   - Полное имя: `Новый Рабочий`
4. Нажмите "Создать аккаунт"

#### Вариант B: Через скрипт
```javascript
// Создание пользователя через API
const { data, error } = await supabase.auth.signUp({
  email: 'new.worker@electroservice.by',
  password: 'password123',
  options: {
    data: {
      full_name: 'Новый Рабочий'
    }
  }
});
```

### Шаг 2: Создание профиля в таблице users

После регистрации автоматически создается профиль в таблице `users` (благодаря обновленной функции `signUp`).

### Шаг 3: Создание связи в telegram_users

Создайте связь между Telegram ID и User ID:

```sql
INSERT INTO telegram_users (telegram_id, user_id)
VALUES (ВАШ_TELEGRAM_ID, 'ID_ПОЛЬЗОВАТЕЛЯ_ИЗ_AUTH');
```

### Шаг 4: Тестирование

1. Откройте @ElectroServiceBot в Telegram
2. Нажмите Menu → "🔧 ЭлектроСервис UNIFIED"
3. Должен произойти автоматический вход

## 🛠️ Автоматизированный скрипт для создания пользователя

Создайте файл `create_telegram_user.mjs`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enyewzeskpiqueogmssp.supabase.co';
const supabaseAnonKey = 'YOUR_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTelegramUser(email, password, fullName, telegramId) {
  console.log(`🔧 Создание пользователя для Telegram...`);
  console.log(`📧 Email: ${email}`);
  console.log(`👤 Имя: ${fullName}`);
  console.log(`📱 Telegram ID: ${telegramId}`);
  
  // 1. Создаем пользователя в auth.users
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
  
  if (signUpError) {
    console.log('❌ Ошибка создания пользователя:', signUpError.message);
    return;
  }
  
  console.log('✅ Пользователь создан в auth.users');
  console.log(`   - ID: ${signUpData.user.id}`);
  
  // 2. Создаем профиль в таблице users
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .insert({
      id: signUpData.user.id,
      email: email,
      full_name: fullName,
      role: 'worker',
      is_active: true,
      hourly_rate: 2.0
    })
    .select()
    .single();
    
  if (profileError) {
    console.log('❌ Ошибка создания профиля:', profileError.message);
  } else {
    console.log('✅ Профиль создан в таблице users');
  }
  
  // 3. Создаем связь в telegram_users
  const { data: telegramData, error: telegramError } = await supabase
    .from('telegram_users')
    .insert({
      telegram_id: telegramId,
      user_id: signUpData.user.id
    })
    .select()
    .single();
    
  if (telegramError) {
    console.log('❌ Ошибка создания связи:', telegramError.message);
  } else {
    console.log('✅ Связь создана в telegram_users');
  }
  
  // Выходим из системы
  await supabase.auth.signOut();
  
  console.log('\n🎉 Пользователь создан успешно!');
  console.log('📱 Теперь можно войти через Telegram');
}

// Пример использования:
// createTelegramUser('new.worker@electroservice.by', 'password123', 'Новый Рабочий', 123456789);
```

## 📋 Пошаговая инструкция для администратора

### 1. Получение Telegram ID пользователя
1. Попросите пользователя написать боту @ElectroServiceBot
2. В логах или базе данных найдите его Telegram ID
3. Или попросите пользователя отправить команду `/start` и посмотрите в логах

### 2. Создание пользователя
```bash
# Запустите скрипт
node create_telegram_user.mjs
```

### 3. Проверка результата
```sql
-- Проверьте, что пользователь создан
SELECT * FROM users WHERE email = 'new.worker@electroservice.by';

-- Проверьте связь в telegram_users
SELECT * FROM telegram_users WHERE telegram_id = ВАШ_TELEGRAM_ID;
```

## 🔍 Проверка существующих пользователей

```sql
-- Все пользователи с Telegram связями
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.is_active,
    tg.telegram_id
FROM users u
LEFT JOIN telegram_users tg ON u.id = tg.user_id
ORDER BY u.created_at DESC;
```

## ⚠️ Важные моменты

1. **Telegram ID должен быть уникальным** - один Telegram ID может быть связан только с одним пользователем
2. **Email должен быть уникальным** - один email может быть только у одного пользователя
3. **Пароль нужен для веб-входа** - даже если пользователь входит через Telegram, пароль может понадобиться для веб-версии
4. **Роль по умолчанию** - новые пользователи получают роль `worker`

## 🧪 Тестирование

После создания пользователя:
1. Откройте @ElectroServiceBot
2. Нажмите Menu → "🔧 ЭлектроСервис UNIFIED"
3. Должен произойти автоматический вход
4. Проверьте, что отображается правильное имя пользователя

## 🔧 Устранение проблем

### Проблема: "Пользователь не найден"
- Проверьте, что Telegram ID правильно записан в таблице `telegram_users`
- Убедитесь, что пользователь активен (`is_active: true`)

### Проблема: "Аккаунт неактивен"
- Установите `is_active: true` в таблице `users`

### Проблема: Дублирование пользователей
- Удалите дублирующие записи в `auth.users` и `users`
- Оставьте только одну активную запись
