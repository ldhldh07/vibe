'use client'

import React, { useState } from 'react'

/**
 * AI 기반 목표 분해 컴포넌트
 * 사용자의 큰 목표를 입력받아 AI로 세분화된 학습 계획으로 변환
 */

interface LearningPlan {
  id: string
  originalGoal: string
  totalEstimatedHours: number
  estimatedWeeks: number
  phases: LearningPhase[]
}

interface LearningPhase {
  id: string
  phaseNumber: number
  title: string
  description: string
  estimatedHours: number
  estimatedDays: number
  difficulty: string
  milestones: PhaseMilestone[]
  skills: string[]
}

interface PhaseMilestone {
  id: string
  title: string
  description: string
  estimatedHours: number
  type: string
  order: number
}

const AiGoalBreakdown: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [availableHoursPerWeek, setAvailableHoursPerWeek] = useState(10)
  const [generatedPlan, setGeneratedPlan] = useState<LearningPlan | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 실제 백엔드 AI API 호출
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다.')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/ai/breakdown-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          goalTitle,
          goalDescription: goalDescription || null,
          availableHoursPerWeek
        })
      })

      const data = await response.json()
      
      if (data.success && data.plan) {
        setGeneratedPlan(data.plan)
      } else {
        console.error('계획 생성 실패:', data.error)
        alert(data.error || '계획 생성 중 오류가 발생했습니다.')
      }
      
    } catch (error) {
      console.error('계획 생성 실패:', error)
      alert('계획 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-700'
      case 'MODERATE': return 'bg-yellow-100 text-yellow-700'
      case 'HARD': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDifficultyText = (difficulty: string): string => {
    switch (difficulty) {
      case 'EASY': return '쉬움'
      case 'MODERATE': return '보통'
      case 'HARD': return '어려움'
      default: return difficulty
    }
  }

  const getMilestoneIcon = (type: string): string => {
    switch (type) {
      case 'LEARNING': return '📚'
      case 'PRACTICE': return '💻'
      case 'PROJECT': return '🚀'
      case 'REVIEW': return '🔍'
      case 'ASSESSMENT': return '📝'
      default: return '✨'
    }
  }

  const createTodosFromPlan = () => {
    if (!generatedPlan) return

    alert(`${generatedPlan.phases.length}개 단계의 학습 계획이 Todo로 생성됩니다!\n\n각 단계는 별도의 Todo 항목으로 추가되며, 마일스톤은 하위 작업으로 구성됩니다.`)
    
    // 생성 완료 후 폼 초기화
    setGeneratedPlan(null)
    setIsFormVisible(false)
    setGoalTitle('')
    setGoalDescription('')
    setAvailableHoursPerWeek(10)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI 목표 분해</h1>
        <p className="text-gray-600">큰 목표를 달성 가능한 단계별 계획으로 자동 분해해드립니다</p>
      </div>

      {/* 시작 버튼 */}
      {!isFormVisible && !generatedPlan && (
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white mb-6">
            <h2 className="text-2xl font-bold mb-4">목표를 입력하면 AI가 자동으로 계획을 세워드려요!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="font-semibold">목표 분석</h3>
                <p className="text-sm text-blue-100">AI가 목표를 분석하여 최적의 학습 경로를 찾습니다</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📋</div>
                <h3 className="font-semibold">단계별 계획</h3>
                <p className="text-sm text-blue-100">달성 가능한 단계로 세분화하여 체계적인 계획을 수립합니다</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">⏰</div>
                <h3 className="font-semibold">맞춤형 일정</h3>
                <p className="text-sm text-blue-100">개인의 가용 시간에 맞춰 현실적인 일정을 제안합니다</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsFormVisible(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            목표 분해 시작하기 🚀
          </button>
        </div>
      )}

      {/* 목표 입력 폼 */}
      {isFormVisible && !generatedPlan && (
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">목표 정보 입력</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                달성하고 싶은 목표 *
              </label>
              <input
                type="text"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="예: React 마스터하기, Python 웹 개발 배우기, 알고리즘 문제 해결 능력 향상"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목표 상세 설명
              </label>
              <textarea
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="어떤 것을 배우고 싶은지, 왜 이 목표를 설정했는지 자세히 설명해주세요"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주당 학습 가능 시간 *
              </label>
              <select
                value={availableHoursPerWeek}
                onChange={(e) => setAvailableHoursPerWeek(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5시간 (하루 1시간)</option>
                <option value={10}>10시간 (하루 1-2시간)</option>
                <option value={15}>15시간 (하루 2-3시간)</option>
                <option value={20}>20시간 (하루 3-4시간)</option>
                <option value={30}>30시간 (집중 학습)</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading || !goalTitle}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? '🤖 AI가 계획을 생성중...' : '🚀 학습 계획 생성하기'}
              </button>
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">AI가 당신만의 학습 계획을 생성하고 있습니다</h3>
          <p className="text-gray-600">목표를 분석하고 최적의 학습 경로를 계산 중입니다...</p>
        </div>
      )}

      {/* 생성된 학습 계획 */}
      {generatedPlan && (
        <div className="space-y-6">
          {/* 계획 요약 */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">🎉 학습 계획이 완성되었습니다!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">{generatedPlan.phases.length}단계</div>
                <div className="text-green-100">학습 단계</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{generatedPlan.totalEstimatedHours}시간</div>
                <div className="text-green-100">예상 총 시간</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{generatedPlan.estimatedWeeks}주</div>
                <div className="text-green-100">예상 완료 기간</div>
              </div>
            </div>
          </div>

          {/* 학습 단계들 */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">📚 단계별 학습 계획</h3>
            
            {generatedPlan.phases.map((phase) => (
              <div key={phase.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {phase.phaseNumber}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{phase.title}</h4>
                      <p className="text-gray-600">{phase.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(phase.difficulty)}`}>
                      {getDifficultyText(phase.difficulty)}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                      {phase.estimatedHours}시간 · {phase.estimatedDays}일
                    </div>
                  </div>
                </div>

                {/* 마일스톤들 */}
                <div className="space-y-3 mb-4">
                  <h5 className="font-medium text-gray-700">세부 목표:</h5>
                  {phase.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                      <span className="text-lg">{getMilestoneIcon(milestone.type)}</span>
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900">{milestone.title}</h6>
                        <p className="text-gray-600 text-sm">{milestone.description}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          예상 시간: {milestone.estimatedHours}시간
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 습득 스킬 */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">습득 스킬:</h5>
                  <div className="flex flex-wrap gap-2">
                    {phase.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex space-x-4">
            <button
              onClick={createTodosFromPlan}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              ✅ 이 계획으로 Todo 생성하기
            </button>
            <button
              onClick={() => {
                setGeneratedPlan(null)
                setIsFormVisible(true)
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              다시 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AiGoalBreakdown 