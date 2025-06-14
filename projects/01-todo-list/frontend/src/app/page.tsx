'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { Todo, Priority, CreateTodoRequest, UpdateTodoRequest, Project, ProjectMember, InviteMemberRequest } from '@/types/api';
import { getTodosByProject, createTodo, updateTodo, deleteTodo, getProjectMembers, inviteMember, removeMember } from '@/lib/api';
import ProjectSelector from './components/ProjectSelector';

// 필터 타입 정의
type FilterType = 'ALL' | 'COMPLETED' | 'PENDING';

// YouTube Player 타입 정의
interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: {
        height: string;
        width: string;
        videoId: string;
        origin?: string;
        playerVars: Record<string, number>;
        events: {
          onReady: (event: { target: YouTubePlayer }) => void;
          onStateChange: (event: { data: number }) => void;
        };
      }) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function TodoPage() {
  const router = useRouter();

  useEffect(() => {
    // localStorage에서 토큰 확인
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      // 토큰 없으면 로그인 페이지로 강제 이동
      router.replace("/login");
    }
  }, [router]);

  // 상태 관리
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<number | 'ALL'>('ALL');
  
  // 프로젝트 설정 모달 상태
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  
  // 멤버 초대 폼 상태
  const [inviteForm, setInviteForm] = useState<{
    userId: string;
    role: 'VIEWER' | 'MEMBER' | 'ADMIN';
  }>({
    userId: '',
    role: 'MEMBER'
  });
  const [isInviting, setIsInviting] = useState(false);

  // 음악 플레이어 상태 추가
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  // YouTube 플레이어 참조
  const playerRef = useRef<YouTubePlayer | null>(null);

  // 아이유 네버엔딩 스토리 YouTube 비디오 ID
  const VIDEO_ID = '6J9ixwhDYSM'; // 아이유 - 네버엔딩 스토리 공식 MV

  // YouTube Player API 초기화
  useEffect(() => {
    // YouTube API가 로드될 때까지 대기
    const initializePlayer = () => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: VIDEO_ID,
          origin: window.location.origin,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            enablejsapi: 1,
            start: 30,
          },
          events: {
            onReady: (event: { target: YouTubePlayer }) => {
              console.log('YouTube 플레이어가 준비되었습니다!');
              setIsPlayerReady(true);
              event.target.setVolume(100);
              event.target.playVideo();
            },
            onStateChange: (event: { data: number }) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
          },
        });
      }
    };

    // YouTube API 콜백 함수 설정
    window.onYouTubeIframeAPIReady = initializePlayer;

    // 이미 API가 로드된 경우 바로 초기화
    if (window.YT && window.YT.Player) {
      initializePlayer();
    }

    return () => {
      // 컴포넌트 언마운트 시 플레이어 정리
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // 볼륨 변경 시 플레이어에 반영
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // 음악 재생/일시정지 핸들러
  const handleTogglePlay = () => {
    if (!playerRef.current || !isPlayerReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // Todo 입력 폼 상태
  const [formData, setFormData] = useState<CreateTodoRequest>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    projectId: 0, // 프로젝트 선택 시 업데이트됨
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Todo 데이터 로딩
  useEffect(() => {
    if (selectedProject) {
      loadTodos();
      loadProjectMembers();
    }
  }, [selectedProject]);

  const loadTodos = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    const result = await getTodosByProject(selectedProject.id);
    if (result.success) {
      setTodos(result.data);
    }
    setLoading(false);
  };

  // 프로젝트 멤버 로딩
  const loadProjectMembers = async () => {
    if (!selectedProject) return;
    
    setMembersLoading(true);
    const result = await getProjectMembers(selectedProject.id);
    if (result.success) {
      setProjectMembers(result.data);
    }
    setMembersLoading(false);
  };

  // 프로젝트 선택 핸들러
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    // 폼 데이터의 projectId도 업데이트
    setFormData(prev => ({
      ...prev,
      projectId: project.id
    }));
  };

  // 멤버 초대 핸들러
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject || !inviteForm.userId.trim()) {
      alert('사용자 ID를 입력해주세요.');
      return;
    }

    setIsInviting(true);
    
    const inviteData: InviteMemberRequest = {
      userId: Number(inviteForm.userId),
      role: inviteForm.role
    };

    const result = await inviteMember(selectedProject.id, inviteData);
    
    if (result.success) {
      // 멤버 목록 새로고침
      await loadProjectMembers();
      // 폼 초기화
      setInviteForm({ userId: '', role: 'MEMBER' });
      alert('멤버를 성공적으로 초대했습니다.');
    } else {
      alert(result.error?.message || '멤버 초대에 실패했습니다.');
    }
    
    setIsInviting(false);
  };

  // 멤버 제거 핸들러
  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!selectedProject) return;
    
    if (!confirm(`사용자 ${userName}을(를) 프로젝트에서 제거하시겠습니까?`)) {
      return;
    }

    const result = await removeMember(selectedProject.id, userId);
    
    if (result.success) {
      // 멤버 목록 새로고침
      await loadProjectMembers();
      alert('멤버를 성공적으로 제거했습니다.');
    } else {
      alert(result.error?.message || '멤버 제거에 실패했습니다.');
    }
  };

  // 새 Todo 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 제목이 비어있으면 리턴
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    // 빈 값들 제거하고 날짜 형식 변환
    const todoData: CreateTodoRequest = {
      title: formData.title.trim(),
      ...(formData.description?.trim() && { description: formData.description.trim() }),
      priority: formData.priority,
      projectId: selectedProject!.id, // 선택된 프로젝트 ID 사용
      // 날짜를 ISO 8601 형식으로 변환 (백엔드에서 Instant로 파싱 가능)
      ...(formData.dueDate && { 
        dueDate: new Date(formData.dueDate + 'T00:00:00.000Z').toISOString() 
      })
    };

    console.log('변환된 todoData:', todoData); // 디버깅용

    const result = await createTodo(todoData);
    
    if (result.success) {
      // 폼 초기화
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        projectId: selectedProject!.id,
        dueDate: ''
      });
      
      // Todo 목록 다시 로드
      await loadTodos();
      
      alert('새 Todo가 성공적으로 추가되었습니다! 🎉');
    } else {
      alert(`오류가 발생했습니다: ${result.error.message}`);
    }
    
    setIsSubmitting(false);
  };

  // Todo 완료 상태 토글
  const handleToggleComplete = async (todo: Todo) => {
    const updates: UpdateTodoRequest = {
      isCompleted: !todo.isCompleted
    };

    const result = await updateTodo(todo.id, updates);
    
    if (result.success) {
      await loadTodos(); // 목록 새로고침
    } else {
      alert(`오류가 발생했습니다: ${result.error.message}`);
    }
  };

  // Todo 삭제
  const handleDelete = async (todoId: number, title: string) => {
    if (confirm(`"${title}" 항목을 정말 삭제하시겠습니까?`)) {
      const result = await deleteTodo(todoId);
      
      if (result.success) {
        await loadTodos(); // 목록 새로고침
        alert('Todo가 삭제되었습니다.');
      } else {
        alert(`오류가 발생했습니다: ${result.error.message}`);
      }
    }
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof CreateTodoRequest, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // D-day 계산 함수
  const calculateDday = (dueDate: string): string => {
    if (!dueDate) return '';
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  // 우선순위 색상 및 아이콘
  const getPriorityStyle = (priority?: Priority) => {
    switch (priority) {
      case 'HIGH':
        return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🔴' };
      case 'MEDIUM':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '🟡' };
      case 'LOW':
        return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '🟢' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: '⚪' };
    }
  };

  // 필터링된 Todo 계산
  const filteredTodos = todos.filter(todo => {
    // 완료 상태 필터
    if (activeFilter === 'COMPLETED' && !todo.isCompleted) return false;
    if (activeFilter === 'PENDING' && todo.isCompleted) return false;
    
    // 우선순위 필터
    if (priorityFilter !== 'ALL' && todo.priority !== priorityFilter) return false;
    
    // 할당자 필터
    if (assigneeFilter !== 'ALL') {
      if (assigneeFilter === 0) {
        // "나에게 할당된 것"을 선택한 경우 - 현재 사용자 ID로 필터링 (임시로 createdBy 사용)
        if (todo.assignedTo !== todo.createdBy) return false;
      } else {
        // 특정 사용자에게 할당된 것
        if (todo.assignedTo !== assigneeFilter) return false;
      }
    }
    
    return true;
  });

  // 통계 계산
  const totalCount = todos.length;
  const completedCount = todos.filter(todo => todo.isCompleted).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 프로젝트 선택 헤더 */}
      <ProjectSelector 
        selectedProject={selectedProject}
        onProjectSelect={handleProjectSelect}
        onProjectSettings={() => setShowProjectSettings(true)}
      />
      
      {/* 헤더 영역 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 제목과 통계 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📝 Todo List
              </h1>
              <p className="text-gray-600 mt-1">
                할 일을 체계적으로 관리해보세요
              </p>
            </div>

            {/* 음악 컨트롤러 */}
            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {/* 앨범 커버 이미지 */}
                  <div className="flex-shrink-0">
                    <img
                      src="https://i.namu.wiki/i/d_G3G3BhiY-f00ctiP1fiZsWWogzE00VH8zEsqkoQmi_fXTgwkD-nLIAtyx_MfoJLn8Mxh3ywwSRHQADjgFvQ_RySqRjUcXHucIaFHYVZIVd_V0VjuqzCyvPnqdR2lXXSpUcIE_Ze5MqJmfO93JiCA.webp"
                      alt="아이유 - 꽃-갈피셋 앨범 커버"
                      className="w-12 h-12 rounded-lg object-cover shadow-sm border border-purple-100"
                      onError={(e) => {
                        // 이미지 로드 실패 시 대체 이미지 표시
                        e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iNCIgZmlsbD0iIzk4NTVmNyIvPgo8cGF0aCBkPSJNMjQgMTZjLTQuNDEgMC04IDMuNTktOCA4czMuNTkgOCA4IDggOC0zLjU5IDgtOC0zLjU5LTgtOC04em0wIDEwYy0xLjEgMC0yLS45LTItMnMuOS0yIDItMiAyIC45IDIgMi0uOSAyLTIgMnoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=";
                      }}
                    />
                  </div>

                  {/* 곡 정보 */}
                  <div className="text-left min-w-0 flex-1">
                    <div className="text-xs text-purple-600 font-medium">🎵 Now Playing</div>
                    <div className="text-sm font-medium text-gray-800 truncate">
                      네버엔딩 스토리
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      아이유 (IU)
                    </div>
                  </div>

                  {/* 재생/일시정지 버튼 */}
                  <button
                    onClick={handleTogglePlay}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isPlaying 
                        ? 'bg-purple-500 text-white shadow-lg hover:bg-purple-600' 
                        : 'bg-white border-2 border-purple-300 text-purple-500 hover:bg-purple-50'
                    }`}
                    disabled={!isPlayerReady}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>

                  {/* 볼륨 조절 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔊</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-16 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume}%, #e9d5ff ${volume}%, #e9d5ff 100%)`
                      }}
                    />
                    <span className="text-xs text-gray-600 min-w-8">{volume}%</span>
                  </div>
                </div>
              </div>

              {/* 통계 */}
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                  <div className="text-sm text-gray-500">전체</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                  <div className="text-sm text-gray-500">완료</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                  <div className="text-sm text-gray-500">대기</div>
                </div>
              </div>
            </div>
          </div>

          {/* 필터 버튼들 */}
          <div className="flex flex-wrap gap-4">
            {/* 완료 상태 필터 */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === 'ALL'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                전체 ({totalCount})
              </button>
              <button
                onClick={() => setActiveFilter('PENDING')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === 'PENDING'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                대기 중 ({pendingCount})
              </button>
              <button
                onClick={() => setActiveFilter('COMPLETED')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === 'COMPLETED'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                완료 ({completedCount})
              </button>
            </div>

            {/* 우선순위 필터 */}
            <div className="flex gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Priority | 'ALL')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">모든 우선순위</option>
                <option value="HIGH">🔴 높음</option>
                <option value="MEDIUM">🟡 보통</option>
                <option value="LOW">🟢 낮음</option>
              </select>
            </div>

            {/* 할당자 필터 */}
            <div className="flex gap-2">
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">모든 할당자</option>
                <option value="0">👤 나에게 할당된 것</option>
                {projectMembers.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    👤 사용자 ID: {member.userId}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!selectedProject ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              프로젝트를 선택해주세요
            </h3>
            <p className="text-gray-500">
              위에서 프로젝트를 선택하거나 새로 만들어보세요.
            </p>
          </div>
        ) : (
          <>
            {/* Todo 입력 폼 섹션 */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            ➕ 새 Todo 추가
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 제목 입력 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="할 일을 입력하세요..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* 설명 입력 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                설명 (선택사항)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="자세한 설명을 입력하세요..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* 할당자 선택 */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                할당자 (선택사항)
              </label>
              <select
                id="assignedTo"
                value={formData.assignedTo || ''}
                onChange={(e) => handleInputChange('assignedTo', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting || membersLoading}
              >
                <option value="">본인에게 할당 (기본값)</option>
                {projectMembers.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    👤 사용자 ID: {member.userId} ({member.role})
                  </option>
                ))}
              </select>
              {membersLoading && (
                <p className="text-sm text-gray-500 mt-1">멤버 목록을 불러오는 중...</p>
              )}
            </div>

            {/* 우선순위와 마감일 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 우선순위 선택 */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  우선순위
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="LOW">🟢 낮음</option>
                  <option value="MEDIUM">🟡 보통</option>
                  <option value="HIGH">🔴 높음</option>
                </select>
              </div>

              {/* 마감일 설정 */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  마감일 (선택사항)
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                  min={new Date().toISOString().split('T')[0]} // 오늘 이후만 선택 가능
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting || !formData.title.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    추가 중...
                  </div>
                ) : (
                  '✅ Todo 추가'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Todo 목록 섹션 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span>📋 Todo 목록</span>
            <span className="text-sm font-normal text-gray-500">
              {filteredTodos.length}개 항목
            </span>
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">데이터를 불러오는 중...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeFilter === 'ALL' ? '등록된 Todo가 없습니다' :
                 activeFilter === 'COMPLETED' ? '완료된 Todo가 없습니다' :
                 '대기 중인 Todo가 없습니다'}
              </h3>
              <p className="text-gray-500">
                {activeFilter === 'ALL' ? '새로운 Todo를 추가해보세요!' :
                 '다른 필터를 선택해보세요.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTodos.map((todo) => {
                const priorityStyle = getPriorityStyle(todo.priority);
                const dday = calculateDday(todo.dueDate || '');
                
                return (
                  <div
                    key={todo.id}
                    className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                      todo.isCompleted 
                        ? 'bg-gray-50 border-gray-200 opacity-75' 
                        : `${priorityStyle.bg} ${priorityStyle.border}`
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* 체크박스 */}
                      <button
                        onClick={() => handleToggleComplete(todo)}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          todo.isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {todo.isCompleted && '✓'}
                      </button>

                      {/* 메인 컨텐츠 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${
                                todo.isCompleted 
                                  ? 'line-through text-gray-500' 
                                  : 'text-gray-900'
                              }`}>
                                {todo.title}
                              </h3>
                              
                              {/* 할당자 아바타 */}
                              <div className="flex items-center gap-1">
                                {todo.assignedTo ? (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {todo.assignedTo.toString().slice(-1)}
                                    </div>
                                    <span>사용자 {todo.assignedTo}</span>
                                    {todo.assignedTo === todo.createdBy && (
                                      <span className="text-blue-600">👤</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                    <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                                      ?
                                    </div>
                                    <span>미할당</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {todo.description && (
                              <p className={`mt-1 text-sm ${
                                todo.isCompleted 
                                  ? 'line-through text-gray-400' 
                                  : 'text-gray-600'
                              }`}>
                                {todo.description}
                              </p>
                            )}

                            {/* 메타 정보 */}
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                {priorityStyle.icon} {todo.priority || 'MEDIUM'}
                              </span>
                              
                              {/* 할당자 정보 */}
                              <span className="flex items-center gap-1">
                                👤 할당: {todo.assignedTo ? `사용자 ${todo.assignedTo}` : '미할당'}
                                {todo.assignedTo === todo.createdBy && (
                                  <span className="text-blue-500">(본인)</span>
                                )}
                              </span>
                              
                              {/* 생성자 정보 */}
                              <span className="flex items-center gap-1">
                                ✏️ 생성: 사용자 {todo.createdBy}
                              </span>
                              
                              {todo.dueDate && (
                                <span className={`flex items-center gap-1 ${
                                  dday.includes('+') ? 'text-red-500' : 
                                  dday === 'D-Day' ? 'text-orange-500' : ''
                                }`}>
                                  📅 {todo.dueDate} {dday && `(${dday})`}
                                </span>
                              )}
                              
                              <span>
                                📝 {new Date(todo.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* 액션 버튼들 */}
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleDelete(todo.id, todo.title)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
          </>
        )}
      </main>

      {/* 숨겨진 YouTube 플레이어 */}
      <div id="youtube-player" style={{ display: 'none' }}></div>

      {/* 프로젝트 설정 모달 */}
      {showProjectSettings && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                프로젝트 설정: {selectedProject.name}
              </h2>
              <button
                onClick={() => setShowProjectSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 프로젝트 정보 섹션 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">프로젝트 정보</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        프로젝트 이름
                      </label>
                      <input
                        type="text"
                        value={selectedProject.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        설명
                      </label>
                      <textarea
                        value={selectedProject.description || '설명이 없습니다.'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        readOnly
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">공개 설정:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedProject.isPrivate 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedProject.isPrivate ? '🔒 비공개' : '🌐 공개'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">멤버 수:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          👥 {selectedProject.memberCount}명
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 멤버 관리 섹션 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">멤버 관리</h3>
                  <div className="space-y-4">
                    {/* 멤버 목록 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">현재 멤버</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {projectMembers.map((member) => (
                          <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {member.userId.toString().slice(-1)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">사용자 {member.userId}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(member.joinedAt).toLocaleDateString()} 가입
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                                member.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                member.role === 'MEMBER' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {member.role === 'OWNER' ? '👑 소유자' :
                                 member.role === 'ADMIN' ? '⚡ 관리자' :
                                 member.role === 'MEMBER' ? '👤 멤버' :
                                 '👁️ 뷰어'}
                              </span>
                              {member.role !== 'OWNER' && (
                                <button 
                                  onClick={() => handleRemoveMember(member.userId, `사용자 ${member.userId}`)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  제거
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                                         {/* 멤버 초대 */}
                     <div>
                       <h4 className="text-sm font-medium text-gray-700 mb-2">새 멤버 초대</h4>
                       <form onSubmit={handleInviteMember} className="flex space-x-2">
                         <input
                           type="number"
                           placeholder="사용자 ID 입력"
                           value={inviteForm.userId}
                           onChange={(e) => setInviteForm(prev => ({ ...prev, userId: e.target.value }))}
                           className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           disabled={isInviting}
                           required
                         />
                         <select 
                           value={inviteForm.role}
                           onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as 'VIEWER' | 'MEMBER' | 'ADMIN' }))}
                           className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           disabled={isInviting}
                         >
                           <option value="VIEWER">뷰어</option>
                           <option value="MEMBER">멤버</option>
                           <option value="ADMIN">관리자</option>
                         </select>
                         <button 
                           type="submit"
                           disabled={isInviting || !inviteForm.userId.trim()}
                           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           {isInviting ? '초대 중...' : '초대'}
                         </button>
                       </form>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowProjectSettings(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                닫기
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                변경사항 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}