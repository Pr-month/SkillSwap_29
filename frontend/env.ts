import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const env = createEnv({
  /**
   * Переменные, доступные на клиенте и сервере.
   */
  shared: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
  },

  /**
   * Переменные, доступные только на сервере.
   */
  server: {},

  /**
   * Переменные, доступные на клиенте.
   */
  client: {
    NEXT_PUBLIC_BASE_URL: z.url({
      message: 'NEXT_PUBLIC_BASE_URL должен быть валидным URL',
    }),
    NEXT_PUBLIC_API_URL: z.url({
      message: 'NEXT_PUBLIC_API_URL должен быть валидным URL',
    }),
    NEXT_PUBLIC_ALLOWED_DEV_ORIGINS: z.string().optional().transform((val) => val ? val.split(',') : undefined),
  },

  /**
   * Объект для доступа к переменным во время выполнения.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_ALLOWED_DEV_ORIGINS: process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS,
  },

  /**
   * Функция для обработки ошибок валидации переменных окружения.
   */
  onValidationError: (issues) => {
    const errorMessage = issues
      .map((issue) => {
        const variableName = issue.path ? issue.path.join('.') : 'неизвестная';
        return `- Переменная "${variableName}": ${issue.message}`;
      })
      .join('\n');

    console.error('❌ Ошибка валидации переменных окружения:\n', errorMessage);

    process.exit(1);
  },
});

export default env;
