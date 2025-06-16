/**
 * Navbar 컴포넌트 상호작용 테스트
 * 스터디 내용 적용: 사용자 상호작용 시뮬레이션, Mock 활용법
 * 목표: 실제 사용자 행동 테스트하기
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navbar from '../Navbar'

// 테스트용 Mock들
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

const mockConfirm = jest.fn()

beforeEach(() => {
  // 각 테스트 전에 Mock 초기화
  jest.clearAllMocks()
  
  // localStorage Mock 설정
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  })
  
  // window.confirm Mock 설정
  Object.defineProperty(window, 'confirm', {
    value: mockConfirm,
    writable: true
  })
})

describe('Navbar 상호작용 테스트', () => {
  /**
   * 📚 학습 포인트 4: 사용자 상호작용 테스트
   * - 스터디 내용: "실제 사용자 행동 시뮬레이션"
   * - 실무 적용: 클릭, 입력 등의 이벤트 처리 검증
   */
  describe('🖱️ 로그아웃 버튼 클릭 상호작용', () => {
    const mockUser = {
      email: 'test@example.com',
      name: 'Test User'
    }

    test('로그아웃 버튼 클릭 시 확인창이 표시된다', async () => {
      // Arrange: 로그인 상태 + 사용자 취소 시나리오
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      mockConfirm.mockReturnValue(false) // 사용자가 "취소" 선택
      
      const user = userEvent.setup()
      
      // Act: 컴포넌트 렌더링 후 로그아웃 버튼 클릭
      render(<Navbar />)
      const logoutButton = screen.getByRole('button', { name: '로그아웃' })
      await user.click(logoutButton)
      
      // Assert: 확인창이 올바른 메시지로 호출되었는지 검증
      expect(mockConfirm).toHaveBeenCalledWith('로그아웃 하시겠습니까?')
      expect(mockConfirm).toHaveBeenCalledTimes(1)
    })

    test('로그아웃 취소 시 아무 동작하지 않는다', async () => {
      // Arrange: 확인창에서 "취소" 선택 시나리오
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      mockConfirm.mockReturnValue(false) // 취소 선택
      
      const user = userEvent.setup()
      
      // Act
      render(<Navbar />)
      const logoutButton = screen.getByRole('button', { name: '로그아웃' })
      await user.click(logoutButton)
      
      // Assert: localStorage는 건드리지 않아야 함
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
      
      // 여전히 로그인 상태 UI가 표시되어야 함
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('로그아웃')).toBeInTheDocument()
    })

    test('로그아웃 확인 시 localStorage가 정리된다', async () => {
      // Arrange: 확인창에서 "확인" 선택 시나리오
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      mockConfirm.mockReturnValue(true) // 확인 선택
      
      const user = userEvent.setup()
      
      // Act
      render(<Navbar />)
      const logoutButton = screen.getByRole('button', { name: '로그아웃' })
      await user.click(logoutButton)
      
      // Assert: localStorage에서 토큰과 사용자 정보가 삭제되어야 함
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2)
    })
  })

  /**
   * 📚 학습 포인트 5: 링크 요소 테스트
   * - 스터디 내용: "인터페이스 기준 테스트"
   * - 실무 적용: 네비게이션 링크들의 올바른 경로 설정 검증
   */
  describe('🔗 네비게이션 링크 테스트', () => {
    test('비로그인 상태에서 모든 링크가 올바른 경로를 가진다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(null)
      
      // Act
      render(<Navbar />)
      
      // Assert: 각 링크의 href 속성 검증
      expect(screen.getByRole('link', { name: /vibe todo/i })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
      expect(screen.getByRole('link', { name: '회원가입' })).toHaveAttribute('href', '/auth/signup')
    })

    test('로그인 상태에서 내 정보 링크가 올바른 경로를 가진다', () => {
      // Arrange
      const mockUser = { email: 'test@example.com', name: 'Test User' }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      
      // Act
      render(<Navbar />)
      
      // Assert
      expect(screen.getByRole('link', { name: '내 정보' })).toHaveAttribute('href', '/profile')
    })
  })

  /**
   * 📚 학습 포인트 6: 접근성 (Accessibility) 테스트
   * - 스터디 내용: "사용자 중심 테스트"
   * - 실무 적용: 키보드 네비게이션, 스크린 리더 지원 등
   */
  describe('♿ 접근성 테스트', () => {
    test('로그아웃 버튼이 적절한 role을 가진다', () => {
      // Arrange
      const mockUser = { email: 'test@example.com', name: 'Test User' }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      
      // Act
      render(<Navbar />)
      
      // Assert: button role로 올바르게 식별되는지 확인
      const logoutButton = screen.getByRole('button', { name: '로그아웃' })
      expect(logoutButton).toBeInTheDocument()
      expect(logoutButton.tagName).toBe('BUTTON')
    })

    test('모든 링크 요소가 적절한 텍스트를 가진다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(null)
      
      // Act
      render(<Navbar />)
      
      // Assert: 링크 텍스트가 명확한지 확인 (스크린 리더 사용자를 위해)
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveTextContent(/.+/) // 빈 텍스트가 아닌지 확인
      })
    })
  })
}) 