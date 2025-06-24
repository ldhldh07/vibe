'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  // 인증 상태 및 사용자 정보 관리
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

  useEffect(() => {
    // 클라이언트에서 localStorage의 user 정보 읽기
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  }, []);

  // 로그아웃 핸들러
  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      // 토큰 및 유저 정보 삭제
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      // 로그인 페이지로 즉시 이동
      window.location.href = '/login';
    }
  };

  return (
    <nav className="w-full h-16 flex items-center justify-between px-6 bg-white shadow-md fixed top-0 left-0 z-50">
      {/* 좌측: 로고 및 홈 링크 */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center font-bold text-xl text-indigo-700">
          {/* 심플한 아이콘 */}
          <svg className="w-7 h-7 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-2-2h-3.5a2 2 0 00-2 2v1" />
          </svg>
          Vibe Todo
        </Link>
      </div>
      {/* 우측: 인증 상태에 따라 버튼/유저 영역 표시 */}
      <div className="flex items-center space-x-4">
        {user ? (
          // 로그인 상태: 사용자 정보 + AI 테스트 + 내 정보 + 로그아웃 버튼
          <>
            {/* 사용자 이름/이메일 표시 */}
            <span className="text-gray-700 font-medium">{user.name || user.email}</span>
            {/* AI 테스트 페이지 링크 */}
            <Link
              href="/ai-test"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>🤖</span>
              <span>AI 테스트</span>
            </Link>
            {/* 내 정보 페이지 링크 */}
            <Link
              href="/profile"
              className="px-4 py-2 rounded-lg bg-white border border-indigo-500 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors duration-200"
            >
              내 정보
            </Link>
            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold hover:from-indigo-600 hover:to-blue-600 transition-colors duration-200"
            >
              로그아웃
            </button>
          </>
        ) : (
          // 비로그인 상태: 로그인/회원가입 버튼
          <>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-white border border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 transition-colors duration-200"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors duration-200"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </nav>
  );
} 