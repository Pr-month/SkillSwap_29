import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

interface Storage {
  getItem: (_key: string) => Promise<string | null>;
  setItem: (_key: string, value: string) => Promise<void>;
  removeItem: (_key: string) => Promise<void>;
}

/**
 * Создает объект хранилища, который ничего не делает.
 *
 * @returns Объект хранилища с методами getItem, setItem и removeItem, которые возвращают разрешенные промисы.
 */
const createNoopStorage = (): Storage => ({
  getItem: (_key: string) => Promise.resolve(null),
  setItem: (_key: string, _value: string) => Promise.resolve(),
  removeItem: (_key: string) => Promise.resolve(),
});

/**
 * Создает объект хранилища в зависимости от среды выполнения.
 *
 * @returns Объект хранилища с методами getItem, setItem и removeItem.
 */
const storage: Storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

export default storage;
