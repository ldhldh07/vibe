// 백엔드 API와 통신하기 위한 타입 정의

/**
 * Todo 우선순위 열거형
 */
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Todo 엔티티 타입
 */
export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

/**
 * Todo 생성 요청 타입
 */
export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
}

/**
 * Todo 수정 요청 타입
 */
export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: string;
}

/**
 * 성공적인 API 응답 타입
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  count?: number;
}

/**
 * 에러 상세 정보 타입
 */
export interface ErrorDetails {
  code: string;
  message: string;
  details?: Record<string, string>;
}

/**
 * 에러 API 응답 타입
 */
export interface ApiErrorResponse {
  success: false;
  error: ErrorDetails;
}

/**
 * API 응답 유니언 타입
 */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

/**
 * Todo 필터링 옵션
 */
export interface TodoFilters {
  completed?: boolean;
  priority?: Priority;
  sort?: 'CREATED_AT' | 'UPDATED_AT' | 'TITLE' | 'PRIORITY';
  order?: 'ASC' | 'DESC';
} 