"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-api";

interface User {
  email: string;
  name?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // localStorage에서 토큰을 읽어옴
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 강제 이동
      router.replace("/login");
      return;
    }
    // 서버에서 내 정보 조회
    getCurrentUser(token)
      .then((user) => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => {
        setError("사용자 정보를 불러오지 못했습니다.");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div className="max-w-md mx-auto mt-32 text-center text-lg text-gray-600">내 정보 불러오는 중...</div>;
  }
  if (error) {
    return <div className="max-w-md mx-auto mt-32 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-32 bg-white rounded-xl shadow-lg p-8">
      {/* 프로필 헤더 */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center mb-2">
          {/* 사용자 아이콘 */}
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">내 정보</h2>
      </div>
      {/* 사용자 정보 */}
      <div className="space-y-4">
        <div>
          <span className="block text-gray-500 text-sm mb-1">이름</span>
          <span className="block text-lg font-medium text-gray-800">{user?.name || "-"}</span>
        </div>
        <div>
          <span className="block text-gray-500 text-sm mb-1">이메일</span>
          <span className="block text-lg font-medium text-gray-800">{user?.email}</span>
        </div>
      </div>
    </div>
  );
} 