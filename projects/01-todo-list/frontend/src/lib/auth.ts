/**
 * JWT 토큰 관련 유틸리티 함수들
 */

interface JWTPayload {
  userId: number;
  username: string;
  exp: number;
  iat: number;
}

/**
 * JWT 토큰을 디코딩하여 페이로드를 반환
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT는 header.payload.signature 형태
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Base64 URL 디코딩
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decoded);

    return parsed as JWTPayload;
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
}

/**
 * 현재 로그인한 사용자의 ID를 반환
 */
export function getCurrentUserId(): number | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  if (!token) return null;

  const payload = decodeJWT(token);
  return payload?.userId || null;
}

/**
 * 현재 로그인한 사용자의 정보를 반환
 */
export function getCurrentUser(): { userId: number; username: string } | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  if (!token) return null;

  const payload = decodeJWT(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    username: payload.username
  };
}

/**
 * JWT 토큰이 만료되었는지 확인
 */
export function isTokenExpired(token?: string): boolean {
  const tokenToCheck = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (!tokenToCheck) return true;

  const payload = decodeJWT(tokenToCheck);
  if (!payload) return true;

  // exp는 초 단위, Date.now()는 밀리초 단위
  return payload.exp * 1000 < Date.now();
}

/**
 * 토큰을 제거하고 로그아웃 처리
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    // 페이지 새로고침으로 상태 초기화
    window.location.href = '/login';
  }
}

/**
 * 토큰 유효성 검사 및 자동 로그아웃
 */
export function validateToken(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;

  if (isTokenExpired(token)) {
    console.log('토큰이 만료되었습니다. 로그아웃 처리합니다.');
    logout();
    return false;
  }

  return true;
} 