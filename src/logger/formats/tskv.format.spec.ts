import { tskvFormat } from './tskv.format';
import { Logform } from 'winston';

// Моки для символов, которые использует winston
const LEVEL = Symbol.for('level');
const MESSAGE = Symbol.for('message');

describe('tskvFormat', () => {
  it('должен корректно форматировать запись лога с базовыми полями', () => {
    // 1. Подготовка данных
    const info: Logform.TransformableInfo = {
      level: 'info',
      message: 'Это тестовое сообщение',
      timestamp: '2024-01-01T12:00:00.000Z',
    };
    info[LEVEL] = 'info';
    info[MESSAGE] = 'Это тестовое сообщение';

    // 2. Вызов тестируемого метода
    const result = tskvFormat.transform(info);

    // 3. Проверка результата
    const expected =
      'timestamp=2024-01-01T12:00:00.000Z\tlevel=info\tmessage=Это тестовое сообщение';
    expect(result[MESSAGE]).toBe(expected);
  });

  it('должен корректно форматировать запись лога с метаданными', () => {
    // 1. Подготовка данных
    const info: Logform.TransformableInfo = {
      level: 'warn',
      message: 'Еще один тест',
      timestamp: '2024-01-01T12:30:00.000Z',
      context: 'MyTestContext',
      traceId: '123-abc',
    };
    info[LEVEL] = 'warn';
    info[MESSAGE] = 'Еще один тест';

    // 2. Вызов тестируемого метода
    const result = tskvFormat.transform(info);

    // 3. Проверка результата
    const expected =
      'timestamp=2024-01-01T12:30:00.000Z\tlevel=warn\tmessage=Еще один тест\tcontext=MyTestContext\ttraceId=123-abc';
    expect(result[MESSAGE]).toBe(expected);
  });

  it('должен обрабатывать метаданные объекта, преобразуя их в строку', () => {
    // 1. Подготовка данных
    const info: Logform.TransformableInfo = {
      level: 'error',
      message: 'Произошла ошибка',
      timestamp: '2024-01-01T13:00:00.000Z',
      details: { code: 500, reason: 'Внутренняя ошибка сервера' },
    };
    info[LEVEL] = 'error';
    info[MESSAGE] = 'Произошла ошибка';

    // 2. Вызов тестируемого метода
    const result = tskvFormat.transform(info);

    // 3. Проверка результата
    const expected =
      'timestamp=2024-01-01T13:00:00.000Z\tlevel=error\tmessage=Произошла ошибка\tdetails={"code":500,"reason":"Внутренняя ошибка сервера"}';
    expect(result[MESSAGE]).toBe(expected);
  });
});
