/**
 * Базовый интерфейс для ответа API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

/**
 * Интерфейс для пагинированных ответов
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Параметры пагинации
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Базовый тип для ошибки API
 */
export interface ApiError {
  status: number;
  data: {
    message: string;
    statusCode: number;
    error?: string;
  };
}

/**
 * Тип для пользователя
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

/**
 * Тип для навыка
 */
export interface Skill {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Тип для категории
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Тип для запроса (request)
 */
export interface Request {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  userId: string;
  skillId: string;
  createdAt: string;
  updatedAt: string;
}

// Типы для аутентификации
export interface LoginRequest {
  email: string;
  password: string;
}

// DTO типы
export interface CreateSkillDto {
  name: string;
  description?: string;
  categoryId: string;
}

export interface UpdateSkillDto extends Partial<CreateSkillDto> {}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CreateRequestDto {
  title: string;
  description: string;
  skillId: string;
}

export interface UpdateRequestDto extends Partial<CreateRequestDto> {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
}

export interface RegisterRequest extends LoginRequest {
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
