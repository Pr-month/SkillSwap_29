const WebSocket = require('ws');
const http = require('http');

// --- Данные для входа тестового пользователя ---
const loginDetails = {
  email: 'ivan@example.com', // Email из seed-users.ts
  password: 'user123',       // Пароль из seed-users.ts
};
// ---------------------------------------------

async function getFreshToken() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(loginDetails);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Ошибка логина: ${res.statusCode} ${data}`));
        }
        resolve(JSON.parse(data).accessToken);
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function testWebSocket() {
  try {
    console.log(`[Клиент] Получение свежего токена для ${loginDetails.email}...`);
    const token = await getFreshToken();
    console.log('[Клиент] Токен получен. Попытка подключения к WebSocket...');

    const url = `ws://localhost:3000?token=${token}`;
    const ws = new WebSocket(url);

    ws.on('open', () => {
    console.log('[Клиент] ✅ Соединение успешно установлено!');
      ws.close(1000, 'Тест завершен');
    });

    ws.on('error', (error) => console.error('[Клиент] ❌ Ошибка соединения:', error.message));
    ws.on('close', (code, reason) => console.log(`[Клиент] Соединение закрыто. Код: ${code}, Причина: ${reason.toString()}`));
    ws.on('unexpected-response', (req, res) => console.error(`❌ [Клиент] Неожиданный ответ от сервера. Статус: ${res.statusCode}. Вероятно, токен невалиден.`));

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('[Клиент] ❌ Не удалось выполнить тест: Невозможно подключиться к серверу. Убедитесь, что сервер запущен на порту 3000.');
    } else {
      console.error('[Клиент] ❌ Не удалось выполнить тест:', error);
    }
  }
}

void testWebSocket();
