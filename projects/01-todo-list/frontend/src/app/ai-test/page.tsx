'use client'

import { useState } from 'react'

interface ChatMessage {
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function AiTestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // 백엔드 AI API 호출
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage
        })
      })

      const data = await response.json()
      
      // AI 응답 추가
      const aiMessage: ChatMessage = {
        type: 'ai',
        content: data.success ? data.answer : `오류: ${data.error || '응답을 받을 수 없습니다'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('AI API 호출 실패:', error)
      const errorMessage: ChatMessage = {
        type: 'ai',
        content: '네트워크 오류가 발생했습니다.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setInputMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-t-xl p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            🤖 AI 채팅 테스트
          </h1>
          <p className="text-gray-600 mt-2">
            백엔드 AI API 연결을 테스트해보세요! (현재 OpenAI 할당량 초과 상태)
          </p>
        </div>

        {/* 채팅 메시지 영역 */}
        <div className="bg-white h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">💬</div>
              <p>AI와 대화를 시작해보세요!</p>
              <p className="text-sm mt-2">로그인이 필요합니다.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span>AI가 응답하는 중...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="bg-white rounded-b-xl p-6 border-t border-gray-200">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요... (Enter로 전송)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              전송
            </button>
          </div>
          
          {/* 상태 표시 */}
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>백엔드 서버: 연결됨 (localhost:8080)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>OpenAI API: 할당량 초과 (데모 응답 예상)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 