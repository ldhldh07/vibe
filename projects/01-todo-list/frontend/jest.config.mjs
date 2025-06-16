/**
 * Jest 설정 파일 (ESM 버전)
 * Next.js + TypeScript + React Testing Library 환경 구성
 */

import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Next.js 앱의 경로 (package.json과 next.config.js가 있는 위치)
  dir: './',
})

// Jest에 추가할 커스텀 설정
const customJestConfig = {
  // 테스트 환경: jsdom (브라우저 환경 시뮬레이션)
  testEnvironment: 'jest-environment-jsdom',
  
  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // 모듈 경로 매핑 (Next.js의 경로 별칭 지원)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // 테스트 실행 전 설정 파일
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 커버리지 수집 설정
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{js,jsx,ts,tsx}',
  ],
  
  // 커버리지 임계값 설정 (선택사항)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
}

// Next.js Jest 설정과 커스텀 설정 결합
export default createJestConfig(customJestConfig) 