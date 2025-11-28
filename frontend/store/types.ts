export interface Skill {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
  category?: Category;
  categoryId?: string;
  owner?: User;
  ownerId?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  about: string | null;
  birthdate: string | null;
  city: string | null;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  avatar: string | null;
  role: 'USER' | 'ADMIN';
  skills: Skill[];
  wantToLearn: Skill[];
  favoriteSkills: Skill[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface FilterState {
  search: string;
  category: string | null;
  location: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AppState {
  themeMode: 'light' | 'dark' | 'system';
  sideBarCollapsed: boolean;
  filters: FilterState;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserDto {
  name: string;
  about?: string;
  birthdate?: string;
  city?: string;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  avatar?: string;
}

export interface CreateSkillDto {
  title: string;
  description?: string;
  categoryId?: string;
  images?: string[];
}

export interface UpdateSkillDto {
  title?: string;
  description?: string;
  categoryId?: string;
  images?: string[];
}

export interface CreateCategoryDto {
  name: string;
  parentId?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  parentId?: string;
}

export interface CreateRequestDto {
  offeredSkillId: string;
  requestedSkillId: string;
}

export interface Request {
  id: string;
  createdAt: string;
  sender: User;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected' | 'inProgress' | 'done';
  offeredSkill: Skill;
  requestedSkill: Skill;
  isRead: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  location?: string;
}

export interface SkillsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
