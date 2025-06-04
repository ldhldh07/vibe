# 🌟 바이브 코딩 모노레포

다양한 풀스택 프로젝트를 통한 체계적인 개발 학습 공간

## 🏗️ 프로젝트 구조

```
vibe-coding/
├── projects/                    # 개별 프로젝트들
│   └── 01-todo-list/           # 첫 번째 프로젝트: Todo List App
│       ├── backend/            # Kotlin Ktor 백엔드
│       └── frontend/           # Next.js 프론트엔드
├── shared/                     # 공유 라이브러리
│   ├── ui/                     # 공통 UI 컴포넌트
│   ├── utils/                  # 공통 유틸리티
│   ├── types/                  # 공통 타입 정의
│   └── configs/                # 공통 설정
└── docs/                       # 문서
    └── learnings/              # 학습 노트
```

## 🚀 기술 스택

- **모노레포 관리**: Turborepo + pnpm
- **프론트엔드**: Next.js 14, TypeScript, Tailwind CSS
- **백엔드**: Kotlin Ktor, Gradle
- **개발 도구**: Prettier, ESLint
- **배포**: Vercel

## 📦 워크스페이스 명령어

```bash
# 전체 개발 서버 실행
pnpm dev

# 전체 빌드
pnpm build

# 전체 린트
pnpm lint

# 코드 포맷팅
pnpm format

# 캐시 정리
pnpm clean
```

## 🎯 프로젝트 목표

1. **점진적 학습**: 각 프로젝트마다 새로운 기술 도입
2. **코드 재사용**: 공통 컴포넌트와 유틸리티 활용
3. **개발 효율성**: 통합된 개발 환경과 빌드 시스템
4. **학습 기록**: 각 프로젝트의 학습 내용 문서화

## 📋 프로젝트 목록

### ✅ 01-todo-list
- **기술**: Kotlin Ktor + Next.js 14
- **상태**: 완료
- **학습 포인트**: 풀스택 CRUD, API 통신, 날짜 형식 호환성

### 🔮 향후 프로젝트 계획
- **02-blog-system**: 마크다운 기반 블로그
- **03-e-commerce**: 간단한 쇼핑몰
- **04-real-time-chat**: 실시간 채팅 앱

## 🔧 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (첫 번째 프로젝트)
cd projects/01-todo-list/backend && ./gradlew run &
cd projects/01-todo-list/frontend && pnpm dev
``` 