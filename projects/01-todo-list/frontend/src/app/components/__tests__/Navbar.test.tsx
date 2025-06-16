/**
 * Navbar 컴포넌트 테스트
 * 스터디 내용 적용: AAA 패턴, 인터페이스 기반 테스트, 의미있는 테스트
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navbar from '../Navbar'

// 테스트 유틸리티 함수들
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// window.confirm Mock
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

describe('Navbar 컴포넌트', () => {
  /**
   * 테스트 1: 기본 UI 렌더링 검증
   * 스터디 적용: 인터페이스 기준 테스트 (사용자가 보는 요소들)
   */
  describe('기본 렌더링', () => {
    test('로고와 앱 이름이 표시된다', () => {
      // Arrange (준비): 테스트 환경 설정
      mockLocalStorage.getItem.mockReturnValue(null) // 비로그인 상태
      
      // Act (실행): 컴포넌트 렌더링
      render(<Navbar />)
      
      // Assert (검증): 사용자가 보는 요소들 확인
      const logo = screen.getByText('Vibe Todo')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('href', '/')
    })

    test('홈 링크가 올바른 경로를 가진다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(null)
      
      // Act
      render(<Navbar />)
      
      // Assert: 링크 요소의 href 속성 확인
      const homeLink = screen.getByRole('link', { name: /vibe todo/i })
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })

  /**
   * 테스트 2: 비로그인 상태 UI 검증
   * 스터디 적용: 의미있는 테스트 (실제 사용 시나리오)
   */
  describe('비로그인 상태', () => {
    test('로그인과 회원가입 버튼이 표시된다', () => {
      // Arrange: localStorage에 사용자 정보 없음
      mockLocalStorage.getItem.mockReturnValue(null)
      
      // Act
      render(<Navbar />)
      
      // Assert: 사용자가 보는 버튼들 확인
      expect(screen.getByText('로그인')).toBeInTheDocument()
      expect(screen.getByText('회원가입')).toBeInTheDocument()
      
      // 로그인 상태 전용 요소들은 없어야 함
      expect(screen.queryByText('로그아웃')).not.toBeInTheDocument()
      expect(screen.queryByText('내 정보')).not.toBeInTheDocument()
    })

    test('로그인/회원가입 버튼이 올바른 링크를 가진다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(null)
      
      // Act
      render(<Navbar />)
      
      // Assert: 각 버튼의 링크 확인
      const loginLink = screen.getByRole('link', { name: '로그인' })
      const signupLink = screen.getByRole('link', { name: '회원가입' })
      
      expect(loginLink).toHaveAttribute('href', '/login')
      expect(signupLink).toHaveAttribute('href', '/auth/signup')
    })
  })

  /**
   * 테스트 3: 로그인 상태 UI 검증
   * 스터디 적용: 다양한 사용자 상태 테스트
   */
  describe('로그인 상태', () => {
    const mockUser = {
      email: 'test@example.com',
      name: 'Test User'
    }

    test('사용자 이름이 표시된다', () => {
      // Arrange: localStorage에 사용자 정보 저장
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      
      // Act
      render(<Navbar />)
      
      // Assert: 사용자 이름 표시 확인
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    test('이름이 없으면 이메일이 표시된다', () => {
      // Arrange: 이름 없는 사용자 정보
      const userWithoutName = { email: 'test@example.com' }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userWithoutName))
      
      // Act
      render(<Navbar />)
      
      // Assert: 이메일 표시 확인
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    test('내 정보와 로그아웃 버튼이 표시된다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      
      // Act
      render(<Navbar />)
      
      // Assert: 로그인 상태 전용 요소들 확인
      expect(screen.getByText('내 정보')).toBeInTheDocument()
      expect(screen.getByText('로그아웃')).toBeInTheDocument()
      
      // 비로그인 상태 요소들은 없어야 함
      expect(screen.queryByText('로그인')).not.toBeInTheDocument()
      expect(screen.queryByText('회원가입')).not.toBeInTheDocument()
    })

    test('내 정보 버튼이 프로필 페이지로 연결된다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      
      // Act
      render(<Navbar />)
      
      // Assert
      const profileLink = screen.getByRole('link', { name: '내 정보' })
      expect(profileLink).toHaveAttribute('href', '/profile')
    })
  })

  /**
   * 테스트 4: 사용자 상호작용 테스트
   * 스터디 적용: 실제 사용자 행동 시뮬레이션
   */
  describe('사용자 상호작용', () => {
    const mockUser = {
      email: 'test@example.com',
      name: 'Test User'
    }

    test('로그아웃 버튼 클릭 시 확인창이 표시된다', async () => {
      // Arrange: 사용자 로그인 상태, 확인창 취소
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      mockConfirm.mockReturnValue(false) // 확인창에서 "취소" 선택
      
      const user = userEvent.setup()
      
      // Act: 컴포넌트 렌더링 후 로그아웃 버튼 클릭
      render(<Navbar />)
      const logoutButton = screen.getByRole('button', { name: '로그아웃' })
      await user.click(logoutButton)
      
      // Assert: 확인창 호출 확인
      expect(mockConfirm).toHaveBeenCalledWith('로그아웃 하시겠습니까?')
    })

    test('로그아웃 확인 시 localStorage가 정리된다', async () => {
      // Arrange: 확인창에서 "확인" 선택
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      mockConfirm.mockReturnValue(true) // 확인창에서 "확인" 선택
      
      const user = userEvent.setup()
      
      // Act: 로그아웃 버튼 클릭
      render(<Navbar />)
      const logoutButton = screen.getByRole('button', { name: '로그아웃' })
      await user.click(logoutButton)
      
      // Assert: localStorage 정리 확인
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
    })

    test('로그아웃 취소 시 아무 동작하지 않는다', async () => {
      // Arrange: 확인창에서 "취소" 선택
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      mockConfirm.mockReturnValue(false)
      
      const user = userEvent.setup()
      
      // Act
      render(<Navbar />)
      const logoutButton = screen.getByRole('button', { name: '로그아웃' })
      await user.click(logoutButton)
      
      // Assert: localStorage는 건드리지 않음
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
    })
  })

  /**
   * 테스트 5: 예외 상황 처리
   * 스터디 적용: 견고한 코드를 위한 엣지 케이스 테스트
   */
  describe('예외 상황 처리', () => {
    test('잘못된 JSON 형식의 사용자 정보는 무시된다', () => {
      // Arrange: localStorage에 잘못된 JSON 저장
      mockLocalStorage.getItem.mockReturnValue('invalid json')
      
      // Act
      render(<Navbar />)
      
      // Assert: 비로그인 상태로 처리됨
      expect(screen.getByText('로그인')).toBeInTheDocument()
      expect(screen.getByText('회원가입')).toBeInTheDocument()
      expect(screen.queryByText('로그아웃')).not.toBeInTheDocument()
    })
  })
}) 