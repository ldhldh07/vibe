/**
 * Jest DOM 타입 선언 파일
 * @testing-library/jest-dom의 커스텀 매쳐들을 TypeScript에서 인식할 수 있도록 설정
 */

import '@testing-library/jest-dom'

// Jest 네임스페이스 확장하여 jest-dom 매쳐들 타입 추가
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveValue(value: string | number): R
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
      toBeRequired(): R
      toBeValid(): R
      toBeInvalid(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveStyle(css: string | Record<string, string>): R
      toHaveFocus(): R
      toBeChecked(): R
      toBePartiallyChecked(): R
      toHaveDescription(text?: string | RegExp): R
      toHaveErrorMessage(text?: string | RegExp): R
      toBeEmptyDOMElement(): R
    }
  }
} 