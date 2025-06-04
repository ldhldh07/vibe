import type { 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest, 
  ApiResult, 
  TodoFilters 
} from '@/types/api';

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * API 요청을 위한 기본 fetch 래퍼 함수
 */
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    console.log('API 요청:', url); // 디버깅용
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    console.log('응답 상태:', response.status); // 디버깅용
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('응답 데이터:', data); // 디버깅용
    
    // 백엔드 응답이 이미 ApiResult 형태인지 확인
    if (data && typeof data === 'object' && 'success' in data) {
      return data as ApiResult<T>;
    }
    
    // 백엔드가 직접 데이터를 반환하는 경우 (구조 변경 대비)
    return {
      success: true,
      data: data as T
    };
    
  } catch (error) {
    console.error('API 요청 오류:', error);
    
    // 네트워크 오류인지 HTTP 오류인지 구분
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.',
        }
      };
    }
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      }
    };
  }
}

/**
 * Todo 목록 조회
 */
export async function getTodos(filters?: TodoFilters): Promise<ApiResult<Todo[]>> {
  const params = new URLSearchParams();
  
  if (filters?.isCompleted !== undefined) {
    params.append('completed', filters.isCompleted.toString());
  }
  if (filters?.priority) {
    params.append('priority', filters.priority);
  }
  if (filters?.sort) {
    params.append('sort', filters.sort);
  }
  if (filters?.order) {
    params.append('order', filters.order);
  }

  const query = params.toString();
  const endpoint = query ? `/api/todos?${query}` : '/api/todos';
  
  return apiRequest<Todo[]>(endpoint);
}

/**
 * 특정 Todo 조회
 */
export async function getTodo(id: number): Promise<ApiResult<Todo>> {
  return apiRequest<Todo>(`/api/todos/${id}`);
}

/**
 * Todo 생성
 */
export async function createTodo(todo: CreateTodoRequest): Promise<ApiResult<Todo>> {
  console.log('createTodo 호출됨:', todo); // 디버깅용
  
  return apiRequest<Todo>('/api/todos', {
    method: 'POST',
    body: JSON.stringify(todo),
  });
}

/**
 * Todo 수정
 */
export async function updateTodo(
  id: number, 
  updates: UpdateTodoRequest
): Promise<ApiResult<Todo>> {
  return apiRequest<Todo>(`/api/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Todo 삭제
 */
export async function deleteTodo(id: number): Promise<ApiResult<string>> {
  return apiRequest<string>(`/api/todos/${id}`, {
    method: 'DELETE',
  });
}

/**
 * API 응답이 성공인지 확인하는 타입 가드
 */
export function isApiSuccess<T>(result: ApiResult<T>): result is { success: true; data: T; count?: number } {
  return result.success === true;
}

/**
 * API 응답이 에러인지 확인하는 타입 가드
 */
export function isApiError<T>(result: ApiResult<T>): result is { success: false; error: { code: string; message: string; details?: Record<string, string> } } {
  return result.success === false;
} 