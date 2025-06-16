/**
 * Navbar 컴포넌트 기본 테스트
 * 스터디 내용 적용: AAA 패턴, 인터페이스 기반 테스트
 * 목표: 복잡한 Mock 없이 기본 렌더링부터 성공시키기
 */

import { render, screen } from '@testing-library/react'
import Navbar from '../Navbar'

// 간단한 localStorage Mock
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

beforeEach(() => {
  // 각 테스트 전에 Mock 초기화
  jest.clearAllMocks()
  
  // localStorage Mock 설정
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  })
})

describe('Navbar 기본 테스트', () => {
  /**
   * 📚 학습 포인트 1: 가장 기본적인 렌더링 테스트
   * - 스터디 내용: "인터페이스 기준 테스트 (사용자가 보는 요소들)"
   * - 실무 적용: 컴포넌트가 에러 없이 렌더링되는지 확인
   */
  describe('🎯 기본 렌더링 (가장 중요한 테스트)', () => {
    test('컴포넌트가 에러 없이 렌더링된다', () => {
      // Arrange (준비): 비로그인 상태 설정
      mockLocalStorage.getItem.mockReturnValue(null)
      
      // Act (실행): 컴포넌트 렌더링
      render(<Navbar />)
      
      // Assert (검증): 기본 요소가 존재하는지 확인
      // 로고가 표시되는지 확인 (가장 확실한 요소)
      expect(screen.getByText('Vibe Todo')).toBeInTheDocument()
    })

    test('로고가 홈 링크로 연결된다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(null)
      
      // Act
      render(<Navbar />)
      
      // Assert: href 속성 확인
      const logoLink = screen.getByText('Vibe Todo').closest('a')
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  /**
   * 📚 학습 포인트 2: 상태별 UI 검증
   * - 스터디 내용: "의미있는 테스트 (실제 사용 시나리오)"
   * - 실무 적용: 로그인/비로그인 상태에 따른 다른 UI 표시
   */
  describe('🔄 비로그인 상태 UI', () => {
    test('비로그인 시 로그인/회원가입 버튼이 표시된다', () => {
      // Arrange: localStorage에 사용자 정보 없음
      mockLocalStorage.getItem.mockReturnValue(null)
      
      // Act
      render(<Navbar />)
      
      // Assert: 비로그인 상태 UI 요소들 확인
      expect(screen.getByText('로그인')).toBeInTheDocument()
      expect(screen.getByText('회원가입')).toBeInTheDocument()
    })

    test('비로그인 시 로그인 전용 요소들은 표시되지 않는다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(null)
      
      // Act
      render(<Navbar />)
      
      // Assert: 로그인 전용 요소들이 없는지 확인
      expect(screen.queryByText('로그아웃')).not.toBeInTheDocument()
      expect(screen.queryByText('내 정보')).not.toBeInTheDocument()
    })
  })

  describe('🙋‍♂️ 로그인 상태 UI', () => {
    const mockUser = {
      email: 'test@example.com',
      name: 'Test User'
    }

    test('로그인 시 사용자 이름이 표시된다', () => {
      // Arrange: localStorage에 사용자 정보 저장
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      
      // Act
      render(<Navbar />)
      
      // Assert: 사용자 정보 표시 확인
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    test('로그인 시 내 정보, 로그아웃 버튼이 표시된다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      
      // Act
      render(<Navbar />)
      
      // Assert: 로그인 상태 UI 요소들 확인
      expect(screen.getByText('내 정보')).toBeInTheDocument()
      expect(screen.getByText('로그아웃')).toBeInTheDocument()
    })

    test('로그인 시 비로그인 전용 요소들은 표시되지 않는다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      
      // Act
      render(<Navbar />)
      
      // Assert: 비로그인 전용 요소들이 없는지 확인
      expect(screen.queryByText('로그인')).not.toBeInTheDocument()
      expect(screen.queryByText('회원가입')).not.toBeInTheDocument()
    })

    test('사용자 이름이 없으면 이메일이 표시된다', () => {
      // Arrange: 이름 없는 사용자 정보
      const userWithoutName = { email: 'test@example.com' }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userWithoutName))
      
      // Act
      render(<Navbar />)
      
      // Assert: 이메일 표시 확인
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  /**
   * 📚 학습 포인트 3: 예외 상황 처리
   * - 스터디 내용: "견고한 코드를 위한 엣지 케이스 테스트"
   * - 실무 적용: 잘못된 데이터에 대한 안전한 처리
   */
  describe('🛡️ 예외 상황 처리', () => {
    test('잘못된 JSON 데이터는 안전하게 처리된다', () => {
      // Arrange: localStorage에 잘못된 JSON 저장
      mockLocalStorage.getItem.mockReturnValue('invalid json string')
      
      // Act: 에러 없이 렌더링되어야 함
      render(<Navbar />)
      
      // Assert: 비로그인 상태로 안전하게 처리됨
      expect(screen.getByText('로그인')).toBeInTheDocument()
      expect(screen.getByText('회원가입')).toBeInTheDocument()
    })

    test('빈 문자열도 안전하게 처리된다', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue('')
      
      // Act
      render(<Navbar />)
      
      // Assert
      expect(screen.getByText('로그인')).toBeInTheDocument()
    })
  })
}) 