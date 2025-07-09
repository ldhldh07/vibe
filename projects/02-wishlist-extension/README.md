# 🛍️ Smart Wishlist Chrome Extension

> **스마트 쇼핑 위시리스트 - 모든 웹사이트 지원하는 Chrome 익스텐션**

[![Vue 3](https://img.shields.io/badge/Vue-3.0-4FC08D?logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome)](https://developer.chrome.com/docs/extensions)

## 📋 목차

- [🎯 프로젝트 개요](#-프로젝트-개요)
- [✨ 주요 기능](#-주요-기능)
- [🛠️ 기술 스택](#️-기술-스택)
- [🚀 빠른 시작](#-빠른-시작)
- [📁 프로젝트 구조](#-프로젝트-구조)
- [⚙️ 개발 가이드](#️-개발-가이드)
- [🔧 빌드 및 배포](#-빌드-및-배포)
- [📊 지원 사이트](#-지원-사이트)
- [🎨 UI/UX 가이드](#-uiux-가이드)
- [🤝 기여하기](#-기여하기)

## 🎯 프로젝트 개요

Smart Wishlist는 **모든 웹사이트에서 동작하는 하이브리드 Chrome 익스텐션**입니다. 주요 쇼핑몰에서는 자동으로 상품 정보를 추출하고, 일반 사이트에서는 수동 입력을 통해 위시리스트를 관리할 수 있습니다.

### 🎨 하이브리드 접근 방식

- **🛒 쇼핑몰 자동 인식**: 쿠팡, 11번가, G마켓 등 주요 쇼핑몰에서 자동 상품 추출
- **🌐 범용 사이트 지원**: 모든 웹사이트에서 수동 입력으로 위시리스트 추가
- **🎯 스마트 감지**: 휴리스틱 알고리즘으로 쇼핑 사이트 자동 판별

## ✨ 주요 기능

### 🛍️ 핵심 기능
- **원클릭 위시리스트 추가**: 플로팅 버튼으로 간편한 아이템 추가
- **브랜드별 자동 분류**: URL 기반 브랜드 인식 및 자동 정리
- **가격 추적**: 상품 가격 변동 모니터링 (개발 예정)
- **카테고리 분류**: 상품명 기반 자동 카테고리 분류

### 🔧 기술적 특징
- **Chrome Extension Manifest V3**: 최신 Chrome 익스텐션 표준 적용
- **Vue 3 Composition API**: 현대적인 Vue.js 개발 방식
- **TypeScript**: 완전한 타입 안전성 보장
- **Pinia**: 상태 관리 라이브러리
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크

### 🌟 사용자 경험
- **실시간 상태 피드백**: 로딩, 성공, 실패 상태 시각적 표시
- **SPA 대응**: 단일 페이지 애플리케이션 URL 변경 감지
- **반응형 디자인**: 모든 화면 크기에 최적화된 UI

## 🛠️ 기술 스택

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: Pinia

### Chrome Extension
- **Manifest Version**: 3
- **Architecture**: Content Scripts + Background Service Worker
- **Storage**: Chrome Storage API
- **Permissions**: All URLs, Storage, Tabs, Scripting, Context Menus

### Development Tools
- **Package Manager**: pnpm
- **Build Plugin**: @crxjs/vite-plugin
- **Type Checking**: TypeScript
- **Code Quality**: ESLint + Prettier

## 🚀 빠른 시작

### 필수 요구사항
- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0
- **Chrome Browser** (개발 및 테스트용)

### 설치 및 실행

```bash
# 1. 프로젝트 루트로 이동
cd /path/to/vibe-coding

# 2. 의존성 설치
pnpm install

# 3. 개발 서버 실행
pnpm wishlist:dev

# 4. 또는 직접 실행
cd projects/02-wishlist-extension
pnpm dev
```

### Chrome 익스텐션 로드

```bash
# 1. 프로덕션 빌드
pnpm wishlist:build

# 2. Chrome에서 로드
# - Chrome 브라우저 열기
# - chrome://extensions/ 접속
# - 개발자 모드 활성화
# - "압축해제된 확장 프로그램을 로드합니다" 클릭
# - projects/02-wishlist-extension/dist 폴더 선택
```

## 📁 프로젝트 구조

```
projects/02-wishlist-extension/
├── 📦 dist/                    # 빌드 결과물
├── 📂 src/
│   ├── 🎯 background/          # 백그라운드 스크립트
│   │   └── index.ts            # 서비스 워커
│   ├── 📝 content/             # 콘텐츠 스크립트
│   │   ├── index.ts            # 메인 콘텐츠 스크립트
│   │   └── components/         # 콘텐츠 컴포넌트
│   ├── 🖼️ popup/              # 팝업 UI
│   │   ├── index.html          # 팝업 HTML
│   │   ├── Popup.vue           # 팝업 Vue 컴포넌트
│   │   └── index.ts            # 팝업 엔트리 포인트
│   ├── ⚙️ options/            # 옵션 페이지
│   │   ├── index.html          # 옵션 HTML
│   │   ├── Options.vue         # 옵션 Vue 컴포넌트
│   │   └── index.ts            # 옵션 엔트리 포인트
│   └── 🔗 shared/             # 공유 모듈
│       ├── stores/             # Pinia 스토어
│       │   └── wishlist.ts     # 위시리스트 스토어
│       └── types/              # TypeScript 타입 정의
├── 📋 manifest.json            # 익스텐션 매니페스트
├── 📦 package.json             # 패키지 설정
├── ⚙️ vite.config.ts          # Vite 설정
├── 🎨 tailwind.config.js      # Tailwind CSS 설정
└── 📖 README.md               # 이 파일
```

## ⚙️ 개발 가이드

### 개발 환경 설정

```bash
# 개발 서버 실행 (Hot Reload 지원)
pnpm dev

# 타입 체크
pnpm type-check

# 빌드
pnpm build

# 프로덕션 빌드
pnpm build:prod
```

### 콘텐츠 스크립트 개발

콘텐츠 스크립트는 `src/content/index.ts`에 위치하며, 다음과 같은 주요 기능을 담당합니다:

#### 🎯 사이트 감지 로직
```typescript
// 1. 알려진 쇼핑몰 체크
const knownSite = knownSites.find(site => 
  site.domains.some(domain => hostname.includes(domain))
)

// 2. 휴리스틱 감지
const heuristicResult = detectByHeuristics()
```

#### 🛍️ 상품 정보 추출
```typescript
// 쇼핑몰별 전용 추출기
const extractors = [
  createCoupangExtractor(),    // 쿠팡
  create11stExtractor(),       // 11번가
  createGmarketExtractor(),    // G마켓
  createGenericExtractor()     // 범용
]
```

### 새로운 쇼핑몰 지원 추가

1. **쇼핑몰 정보 추가** (`src/content/index.ts`)
```typescript
{
  brand: 'NewSite',
  domains: ['newsite.com'],
  extractors: [createNewSiteExtractor()]
}
```

2. **전용 추출기 구현**
```typescript
function createNewSiteExtractor(): ProductExtractor {
  return {
    name: 'NewSite',
    priority: 10,
    extract: () => {
      const title = document.querySelector('.product-title')?.textContent?.trim()
      const price = parsePrice(document.querySelector('.price')?.textContent || '')
      const image = (document.querySelector('.product-image img') as HTMLImageElement)?.src
      
      return title && price > 0 ? { title, price, currency: 'KRW', image, brand: 'NewSite' } : null
    }
  }
}
```

## 🔧 빌드 및 배포

### 개발 빌드
```bash
# 개발용 빌드 (소스맵 포함)
pnpm build

# 실시간 빌드 (파일 변경 감지)
pnpm dev
```

### 프로덕션 빌드
```bash
# 프로덕션 빌드 (최적화)
pnpm build:prod

# 빌드 결과 확인
ls -la dist/
```

### Chrome 웹 스토어 업로드

1. **빌드 파일 압축**
```bash
cd dist
zip -r smart-wishlist-extension.zip *
```

2. **Chrome 웹 스토어 개발자 콘솔 업로드**
   - [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard) 접속
   - 새 아이템 업로드 또는 기존 아이템 업데이트

## 📊 지원 사이트

### 🛒 완전 지원 사이트 (자동 추출)
| 사이트 | 브랜드 | 상품 추출 | 가격 추출 | 이미지 추출 |
|--------|--------|-----------|-----------|-------------|
| 쿠팡 | Coupang | ✅ | ✅ | ✅ |
| 11번가 | 11번가 | ✅ | ✅ | ✅ |
| G마켓 | G마켓 | ✅ | ✅ | ✅ |
| 옥션 | 옥션 | 🚧 | 🚧 | 🚧 |
| Nike | Nike | 🚧 | 🚧 | 🚧 |
| Adidas | Adidas | 🚧 | 🚧 | 🚧 |
| Amazon | Amazon | 🚧 | 🚧 | 🚧 |

### 🌐 범용 지원 (수동 입력)
- **모든 웹사이트**: 휴리스틱 감지 + 사용자 입력
- **감지 기준**: URL 패턴, DOM 요소, 키워드 분석
- **입력 방식**: 프롬프트 기반 제목/가격 입력

## 🎨 UI/UX 가이드

### 플로팅 버튼 디자인
```css
/* 기본 스타일 */
background-color: #dc64ff;
border-radius: 25px;
box-shadow: 0 4px 12px rgba(220, 100, 255, 0.3);

/* 상태별 색상 */
loading: #fbbf24   /* 노란색 */
success: #22c55e   /* 초록색 */
error: #ef4444     /* 빨간색 */
```

### 팝업 UI 구조
- **홈 탭**: 최근 추가된 위시리스트 아이템
- **브랜드 탭**: 브랜드별 분류된 아이템
- **카테고리 탭**: 카테고리별 분류된 아이템
- **알림 탭**: 가격 변동 알림 설정

### 반응형 디자인
- **데스크톱**: 480px 최대 너비
- **태블릿**: 유연한 너비 조정
- **모바일**: 전체 화면 활용

## 🤝 기여하기

### 기여 방법
1. 이슈 확인 및 생성
2. 포크 및 브랜치 생성
3. 코드 작성 및 테스트
4. 풀 리퀘스트 제출

### 코딩 규칙
- **TypeScript**: 엄격한 타입 체크
- **Vue 3**: Composition API 사용
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅

### 커밋 메시지 규칙
```bash
feat(content): add new shopping site support
fix(popup): resolve wishlist loading issue
docs(readme): update installation guide
style(ui): improve button hover effects
```

---

**🔗 관련 링크**
- [Vue 3 공식 문서](https://vuejs.org/)
- [Chrome Extension 개발 가이드](https://developer.chrome.com/docs/extensions/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/)