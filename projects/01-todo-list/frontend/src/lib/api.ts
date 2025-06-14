import type { 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest, 
  ApiResult, 
  TodoFilters,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectMember,
  InviteMemberRequest,
  UpdateMemberRoleRequest
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
  
  // localStorage에서 토큰을 읽어와 헤더에 추가 (클라이언트 환경에서만)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    console.log('API 요청:', url); // 디버깅용
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    console.log('응답 상태:', response.status); // 디버깅용
    
    if (!response.ok) {
      // 401 Unauthorized 에러 시 자동 로그아웃
      if (response.status === 401) {
        console.log('인증 실패: 자동 로그아웃 처리');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다. 다시 로그인해주세요.',
          }
        };
      }
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
 * Todo 목록 조회 (사용자가 접근 가능한 모든 프로젝트)
 */
export async function getTodos(filters?: TodoFilters): Promise<ApiResult<Todo[]>> {
  const params = new URLSearchParams();
  
  if (filters?.isCompleted !== undefined) {
    params.append('completed', filters.isCompleted.toString());
  }
  if (filters?.priority) {
    params.append('priority', filters.priority);
  }
  if (filters?.projectId) {
    params.append('projectId', filters.projectId.toString());
  }
  if (filters?.assignedTo) {
    params.append('assignedTo', filters.assignedTo.toString());
  }
  if (filters?.createdBy) {
    params.append('createdBy', filters.createdBy.toString());
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

// ==================== 프로젝트 관련 API ====================

/**
 * 프로젝트 목록 조회
 */
export async function getProjects(): Promise<ApiResult<Project[]>> {
  return apiRequest<Project[]>('/api/projects');
}

/**
 * 특정 프로젝트 조회
 */
export async function getProject(id: number): Promise<ApiResult<Project>> {
  return apiRequest<Project>(`/api/projects/${id}`);
}

/**
 * 프로젝트 생성
 */
export async function createProject(project: CreateProjectRequest): Promise<ApiResult<Project>> {
  return apiRequest<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });
}

/**
 * 프로젝트 수정
 */
export async function updateProject(
  id: number, 
  updates: UpdateProjectRequest
): Promise<ApiResult<Project>> {
  return apiRequest<Project>(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * 프로젝트 삭제
 */
export async function deleteProject(id: number): Promise<ApiResult<string>> {
  return apiRequest<string>(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 프로젝트 멤버 목록 조회
 */
export async function getProjectMembers(projectId: number): Promise<ApiResult<ProjectMember[]>> {
  return apiRequest<ProjectMember[]>(`/api/projects/${projectId}/members`);
}

/**
 * 프로젝트에 멤버 초대
 */
export async function inviteMember(
  projectId: number, 
  request: InviteMemberRequest
): Promise<ApiResult<ProjectMember>> {
  return apiRequest<ProjectMember>(`/api/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * 멤버 역할 변경
 */
export async function updateMemberRole(
  projectId: number,
  userId: number,
  request: UpdateMemberRoleRequest
): Promise<ApiResult<ProjectMember>> {
  return apiRequest<ProjectMember>(`/api/projects/${projectId}/members/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

/**
 * 프로젝트에서 멤버 제거
 */
export async function removeMember(
  projectId: number,
  userId: number
): Promise<ApiResult<string>> {
  return apiRequest<string>(`/api/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  });
}

/**
 * 프로젝트 탈퇴
 */
export async function leaveProject(projectId: number): Promise<ApiResult<string>> {
  return apiRequest<string>(`/api/projects/${projectId}/leave`, {
    method: 'POST',
  });
}

/**
 * 특정 프로젝트의 Todo 목록 조회
 */
export async function getTodosByProject(
  projectId: number, 
  filters?: TodoFilters
): Promise<ApiResult<Todo[]>> {
  const params = new URLSearchParams();
  
  if (filters?.isCompleted !== undefined) {
    params.append('completed', filters.isCompleted.toString());
  }
  if (filters?.priority) {
    params.append('priority', filters.priority);
  }
  if (filters?.assignedTo) {
    params.append('assignedTo', filters.assignedTo.toString());
  }
  if (filters?.createdBy) {
    params.append('createdBy', filters.createdBy.toString());
  }
  if (filters?.sort) {
    params.append('sort', filters.sort);
  }
  if (filters?.order) {
    params.append('order', filters.order);
  }

  const query = params.toString();
  const endpoint = query 
    ? `/api/todos/project/${projectId}?${query}` 
    : `/api/todos/project/${projectId}`;
  
  return apiRequest<Todo[]>(endpoint);
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