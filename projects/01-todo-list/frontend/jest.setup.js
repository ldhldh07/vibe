/**
 * Jest 테스트 셋업 파일
 * 모든 테스트 실행 전에 한번 실행되는 설정
 */

// React Testing Library의 추가 DOM 매쳐들을 Jest에 추가
// toBeInTheDocument, toHaveClass 등의 매쳐 사용 가능
import '@testing-library/jest-dom'

// 전역 Mock 설정들

// Next.js router Mock (테스트에서 라우터 기능 시뮬레이션)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// localStorage Mock (브라우저 API 시뮬레이션)
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// console.error 억제 (React 경고 메시지 등)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 