'use client'

import React, { useState, useEffect } from 'react'

// 아이콘을 이모지로 대체 (heroicons 패키지 설치 후 교체 예정)
const Icons = {
  BookOpen: () => <span className="text-xl">📖</span>,
  CodeBracket: () => <span className="text-xl">💻</span>,
  Trophy: () => <span className="text-xl">🏆</span>,
  Fire: () => <span className="text-xl">🔥</span>,
  ChartBar: () => <span className="text-xl">📊</span>,
  QuestionMarkCircle: () => <span className="text-xl">❓</span>,
  UserGroup: () => <span className="text-xl">👥</span>,
  Clock: () => <span className="text-xl">⏰</span>,
  Sparkles: () => <span className="text-xl">✨</span>
}

/**
 * 바이브 코딩 스터디 대시보드 컴포넌트
 * 멤버의 학습 현황과 스터디 활동을 한눈에 보여주는 메인 대시보드
 */

interface UserStats {
  level: number
  experience: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  completedProblems: number
  studyTime: number // 분 단위
}

interface StudyGroup {
  id: string
  name: string
  studyType: string
  difficulty: string
  language: string
  memberCount: number
  nextSession?: string
  progress: number // 0-100
}

interface CodingProblem {
  id: string
  title: string
  difficulty: string
  type: string
  estimatedTime: number
  isCompleted: boolean
  dueDate?: string
}

interface TeamRanking {
  rank: number
  userId: string
  userName: string
  points: number
  problemsSolved: number
  isCurrentUser: boolean
}

interface RecentActivity {
  id: string
  type: 'problem_solved' | 'code_reviewed' | 'question_asked' | 'session_attended'
  title: string
  timestamp: string
  points?: number
}

const StudyDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [todayProblems, setTodayProblems] = useState<CodingProblem[]>([])
  const [teamRanking, setTeamRanking] = useState<TeamRanking[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // TODO: 실제 API 호출로 대체
      // 현재는 목업 데이터 사용
      setUserStats({
        level: 7,
        experience: 2850,
        totalPoints: 1240,
        currentStreak: 12,
        longestStreak: 28,
        completedProblems: 47,
        studyTime: 1420 // 23시간 40분
      })

      setStudyGroups([
        {
          id: '1',
          name: '알고리즘 마스터',
          studyType: 'ALGORITHM',
          difficulty: '중급',
          language: 'Python',
          memberCount: 8,
          nextSession: '2024-01-16T19:00:00',
          progress: 75
        },
        {
          id: '2', 
          name: 'React 깊이 파기',
          studyType: 'WEB_FRONTEND',
          difficulty: '고급',
          language: 'TypeScript',
          memberCount: 6,
          nextSession: '2024-01-17T20:00:00',
          progress: 45
        }
      ])

      setTodayProblems([
        {
          id: '1',
          title: '이진 탐색 트리 구현',
          difficulty: 'MEDIUM',
          type: 'ALGORITHM',
          estimatedTime: 60,
          isCompleted: false,
          dueDate: '2024-01-16T23:59:59'
        },
        {
          id: '2',
          title: 'React Hook 최적화 리팩토링',
          difficulty: 'HARD',
          type: 'CODE_REVIEW',
          estimatedTime: 90,
          isCompleted: true
        }
      ])

      setTeamRanking([
        { rank: 1, userId: '1', userName: '김개발', points: 1850, problemsSolved: 65, isCurrentUser: false },
        { rank: 2, userId: '2', userName: '박코딩', points: 1620, problemsSolved: 58, isCurrentUser: false },
        { rank: 3, userId: '3', userName: '나', points: 1240, problemsSolved: 47, isCurrentUser: true },
        { rank: 4, userId: '4', userName: '이스터디', points: 980, problemsSolved: 42, isCurrentUser: false }
      ])

      setRecentActivity([
        {
          id: '1',
          type: 'problem_solved',
          title: '배열 정렬 알고리즘 구현 완료',
          timestamp: '2024-01-15T14:30:00',
          points: 15
        },
        {
          id: '2',
          type: 'code_reviewed',
          title: '김개발님 코드 리뷰 작성',
          timestamp: '2024-01-15T11:20:00',
          points: 10
        }
      ])

    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNextLevelExp = (currentExp: number): number => {
    // 간단한 레벨 계산 (실제로는 LevelSystem 사용)
    const baseExp = 1000
    const level = Math.floor(currentExp / baseExp) + 1
    return level * baseExp - currentExp
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}시간 ${mins}분`
  }

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'EASY': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HARD': return 'text-red-600 bg-red-100'
      case 'EXPERT': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'problem_solved': return <Icons.CodeBracket />
      case 'code_reviewed': return <Icons.BookOpen />
      case 'question_asked': return <Icons.QuestionMarkCircle />
      case 'session_attended': return <Icons.UserGroup />
      default: return <Icons.Sparkles />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">대시보드 로딩 중...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">바이브 코딩 스터디</h1>
            <p className="text-blue-100 mt-1">함께 성장하는 코딩 여정 🚀</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">레벨 {userStats?.level}</div>
            <div className="text-blue-100">{userStats?.totalPoints.toLocaleString()} 포인트</div>
          </div>
        </div>
      </div>

      {/* 상태 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 경험치 & 레벨 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <Icons.ChartBar />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">현재 경험치</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.experience.toLocaleString()}</p>
              <p className="text-xs text-gray-500">다음 레벨까지 {getNextLevelExp(userStats?.experience || 0)}XP</p>
            </div>
          </div>
        </div>

        {/* 연속 달성 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <Icons.Fire />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">연속 달성</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.currentStreak}일</p>
              <p className="text-xs text-gray-500">최고 기록: {userStats?.longestStreak}일</p>
            </div>
          </div>
        </div>

        {/* 해결한 문제 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <Icons.CodeBracket />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">해결한 문제</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.completedProblems}개</p>
              <p className="text-xs text-gray-500">이번 주 +12개</p>
            </div>
          </div>
        </div>

        {/* 스터디 시간 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <Icons.Clock />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 스터디 시간</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(userStats?.studyTime || 0)}</p>
              <p className="text-xs text-gray-500">이번 주 +5시간</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 참여 중인 스터디 그룹 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="h-6 w-6 mr-2 text-blue-500" />
              참여 중인 스터디 그룹
            </h2>
            <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
              전체 보기
            </button>
          </div>
          
          <div className="space-y-4">
            {studyGroups.map((group) => (
              <div key={group.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-600">{group.language}</span>
                      <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {group.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">{group.memberCount}명</span>
                    </div>
                  </div>
                  {group.nextSession && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">다음 세션</p>
                      <p className="text-sm font-medium">
                        {new Date(group.nextSession).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* 진행률 바 */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>진행률</span>
                    <span>{group.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${group.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 팀 랭킹 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
            이번 주 랭킹
          </h2>
          
          <div className="space-y-3">
            {teamRanking.map((member) => (
              <div 
                key={member.userId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  member.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    member.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    member.rank === 2 ? 'bg-gray-100 text-gray-700' :
                    member.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {member.rank}
                  </div>
                  <div className="ml-3">
                    <p className={`font-medium ${member.isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                      {member.userName}
                    </p>
                    <p className="text-xs text-gray-500">{member.problemsSolved}문제</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{member.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">포인트</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 오늘의 코딩 문제 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CodeBracketIcon className="h-6 w-6 mr-2 text-green-500" />
            오늘의 문제
          </h2>
          
          <div className="space-y-4">
            {todayProblems.map((problem) => (
              <div key={problem.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{problem.title}</h3>
                      {problem.isCompleted && (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{problem.type}</span>
                      <span className="text-xs text-gray-500">⏱ {problem.estimatedTime}분</span>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    problem.isCompleted 
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}>
                    {problem.isCompleted ? '완료' : '시작'}
                  </button>
                </div>
                
                {problem.dueDate && !problem.isCompleted && (
                  <div className="mt-2 text-xs text-red-500">
                    마감: {new Date(problem.dueDate).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <SparklesIcon className="h-6 w-6 mr-2 text-purple-500" />
            최근 활동
          </h2>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {activity.points && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        +{activity.points}P
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-blue-500 hover:text-blue-700 text-sm font-medium">
            더 보기
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudyDashboard 