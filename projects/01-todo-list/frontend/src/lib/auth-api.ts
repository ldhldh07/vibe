import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, User } from '@/types/auth';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * API 호출 시 사용할 기본 헤더
 */
const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * 회원가입 API 호출
 */
export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '회원가입에 실패했습니다.');
  }

  return response.json();
};

/**
 * 로그인 API 호출
 */
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '로그인에 실패했습니다.');
  }

  return response.json();
};

/**
 * 현재 사용자 정보 조회 API 호출 (JWT 토큰 필요)
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '사용자 정보 조회에 실패했습니다.');
  }

  const data: ApiResponse<User> = await response.json();
  return data.data!;
};

/**
 * 서버 상태 확인
 */
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8080/health');
    return response.ok;
  } catch {
    return false;
  }
}; 