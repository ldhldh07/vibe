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
  isCompleted?: boolean;
  priority?: Priority;
  projectId: number;
  createdBy: number;
  assignedTo?: number;
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
  projectId: number;
  assignedTo?: number;
  dueDate?: string;
}

/**
 * Todo 수정 요청 타입
 */
export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: Priority;
  assignedTo?: number;
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
  isCompleted?: boolean;
  priority?: Priority;
  sort?: 'CREATED_AT' | 'UPDATED_AT' | 'TITLE' | 'PRIORITY';
  order?: 'ASC' | 'DESC';
  projectId?: number;
  assignedTo?: number;
  createdBy?: number;
}

/**
 * 프로젝트 역할 열거형
 */
export type ProjectRole = 'VIEWER' | 'MEMBER' | 'ADMIN' | 'OWNER';

/**
 * 프로젝트 엔티티 타입
 */
export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  isPrivate: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 프로젝트 멤버 엔티티 타입
 */
export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: ProjectRole;
  joinedAt: string;
}

/**
 * 프로젝트 생성 요청 타입
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

/**
 * 프로젝트 수정 요청 타입
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

/**
 * 멤버 초대 요청 타입
 */
export interface InviteMemberRequest {
  userId: number;
  role?: ProjectRole;
}

/**
 * 멤버 역할 변경 요청 타입
 */
export interface UpdateMemberRoleRequest {
  role: ProjectRole;
} 