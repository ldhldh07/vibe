# 🚀 Vibe Coding

> **코딩의 새로운 경험을 만들어가는 프로젝트들의 집합**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Turborepo](https://img.shields.io/badge/Built%20with-Turborepo-blue)](https://turbo.build)
[![pnpm](https://img.shields.io/badge/package%20manager-pnpm-orange)](https://pnpm.io)

Vibe Coding은 다양한 웹 개발 프로젝트들을 모아놓은 **Monorepo**입니다. 각 프로젝트는 독특한 아이디어와 최신 기술 스택을 활용하여 개발되며, 실무에서 바로 활용할 수 있는 고품질의 코드를 제공합니다.

## 📋 목차

- [🏗️ 아키텍처](#️-아키텍처)
- [🎯 프로젝트 목록](#-프로젝트-목록)
- [🚀 빠른 시작](#-빠른-시작)
- [🛠️ 기술 스택](#️-기술-스택)
- [📁 폴더 구조](#-폴더-구조)
- [🔧 개발 가이드](#-개발-가이드)
- [✨ 최근 업데이트](#-최근-업데이트)
- [📚 문서](#-문서)
- [🤝 기여하기](#-기여하기)

## 🏗️ 아키텍처

이 레포지토리는 **Turborepo**를 기반으로 한 모노레포 구조를 사용합니다:

```
vibe-coding/
├── projects/           # 개별 프로젝트들
│   ├── 01-todo-list/  # Todo 애플리케이션
│   └── ...            # 추가 프로젝트들
├── shared/            # 공유 라이브러리
│   ├── ui/           # 공통 UI 컴포넌트
│   ├── utils/        # 유틸리티 함수
│   ├── types/        # 타입 정의
│   └── configs/      # 설정 파일들
└── docs/             # 전체 문서
```

## 🎯 프로젝트 목록

### 01. [Todo List Application](./projects/01-todo-list/) ✅ **완성**
**🏷️ 풀스택 웹 애플리케이션**

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Ktor (Kotlin) + REST API + Coroutines
- **최신 업데이트**: 
  - ✅ 완전한 CRUD API 구현 (POST, GET, PUT, DELETE)
  - ✅ 체크박스 버그 수정 (API 필드명 일치)
  - ✅ 브라우저 탭 아이콘 및 제목 설정
  - ✅ PWA 지원 (웹 매니페스트)
  - ✅ 백엔드 빠른 시작 스크립트
  - ✅ 개발 환경 최적화
- **특징**: 
  - 실시간 Todo 관리 (생성, 읽기, 수정, 삭제)
  - 우선순위 및 마감일 관리
  - 완료 상태 토글 기능
  - 필터링 및 정렬 기능
  - 현대적인 UI/UX (Tailwind CSS)
  - RESTful API 설계
  - 타입 안전성 (TypeScript + Kotlin)
  - In-Memory 스토리지 (개발용)

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0
- **Java** ≥ 17 (Kotlin 프로젝트용)

### 🏃‍♂️ 초고속 시작 (Todo List)

```bash
# 1. 레포지토리 클론
git clone https://github.com/ldhldh07/vibe.git
cd vibe-coding

# 2. 의존성 설치
pnpm install

# 3. 풀스택 개발 서버 실행 (프론트엔드 + 백엔드 동시 실행)
pnpm fullstack
```

### 🎯 개별 서버 실행

```bash
# Frontend만 실행 (http://localhost:3000)
pnpm frontend

# Backend만 실행 (http://localhost:8080)  
pnpm backend

# Backend 빠른 시작 (프로세스 정리 + 빌드 + 실행)
pnpm backend:dev

# Backend 프로세스 종료
pnpm backend:kill
```

### 설치 및 실행 (수동)

```bash
# 1. 레포지토리 클론
git clone https://github.com/ldhldh07/vibe.git
cd vibe-coding

# 2. 의존성 설치
pnpm install

# 3. 모든 프로젝트 빌드
pnpm build

# 4. 개발 서버 실행 (전체)
pnpm dev
```

## 🛠️ 기술 스택

### Frontend 기술스택
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Validation**: React Hook Form + Zod
- **Animation**: Framer Motion
- **Drag & Drop**: dnd-kit
- **HTTP Client**: Fetch API
- **Icons**: Lucide React

### Backend 기술스택
- **Framework**: Ktor (Kotlin)
- **Language**: Kotlin
- **Async**: Coroutines
- **Serialization**: Kotlinx Serialization
- **Build Tool**: Gradle
- **Storage**: In-Memory (개발용)
- **API Style**: RESTful API
- **CORS**: 설정 완료

### 개발 도구
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Process Manager**: Concurrently
- **Version Control**: Git
- **Deployment**: Vercel (Frontend) + Railway (Backend) 예정

## 📁 폴더 구조

```
vibe-coding/
├── 📦 projects/               # 메인 프로젝트들
│   └── 📂 01-todo-list/      # Todo 애플리케이션
│       ├── 🌐 frontend/       # Next.js 앱
│       │   ├── src/app/       # App Router 페이지
│       │   ├── src/types/     # TypeScript 타입
│       │   ├── src/lib/       # API 및 유틸리티
│       │   └── public/        # 정적 파일 (파비콘, 매니페스트)
│       ├── ⚙️ backend/        # Ktor API 서버
│       │   ├── src/main/kotlin/ # Kotlin 소스코드
│       │   ├── start.sh       # 빠른 시작 스크립트
│       │   └── dev.sh         # 개발용 스크립트
│       └── 📖 docs/          # 프로젝트 문서
├── 🔧 shared/                # 공유 라이브러리 (예정)
├── 📚 docs/                  # 전체 프로젝트 문서
├── 🏗️ turbo.json             # Turborepo 설정
├── 📦 package.json           # 루트 패키지 설정
└── 📋 README.md              # 이 파일
```

## ✨ 최근 업데이트

### 🔥 v1.2.0 (2024-01-XX) - 안정성 및 UX 개선
- **🐛 체크박스 버그 수정**: 프론트엔드-백엔드 API 필드명 불일치 해결
  - `completed` → `isCompleted` 통일
  - PUT `/api/todos/{id}` 엔드포인트 완성
  - 체크박스 상태 실시간 반영 정상화
- **🎨 브라우저 탭 개선**: 
  - 탭 제목: "📝 Todo List - 할 일 관리"
  - 커스텀 파비콘 (파란색 체크마크 디자인)
  - Apple 터치 아이콘 및 PWA 매니페스트 추가
- **⚡ 백엔드 성능 최적화**:
  - 빠른 시작 스크립트 (`start.sh`, `dev.sh`)
  - 프로세스 자동 정리 및 조건부 빌드
  - Gradle 실행 문제 해결 (83% 멈춤 현상)
- **🛠️ 개발 환경 개선**:
  - `pnpm fullstack` 명령어로 동시 실행
  - `concurrently` 패키지 추가
  - 백엔드 프로세스 관리 자동화

### 🔧 v1.1.0 - API 완성 및 CRUD 구현
- **PUT** `/api/todos/{id}` - Todo 수정 API
- **InMemoryStorage** `update` 메서드 구현
- 부분 업데이트 지원 (title, description, isCompleted, priority, dueDate)
- 자동 `updatedAt` 타임스탬프 관리

### 🚀 v1.0.0 - 초기 릴리즈
- Next.js 15 + Ktor 풀스택 애플리케이션
- 기본 CRUD 기능 (생성, 읽기, 삭제)
- TypeScript + Kotlin 타입 안전성
- Tailwind CSS 현대적 UI

## 🔧 개발 가이드

### 새 프로젝트 추가하기

1. `projects/` 폴더에 새 디렉토리 생성
2. 해당 디렉토리에 프로젝트 구조 설정
3. `turbo.json`에 빌드 설정 추가
4. 루트 `package.json`에 워크스페이스 추가

### 백엔드 개발 팁

```bash
# 백엔드 빠른 재시작 (권장)
pnpm backend:kill && pnpm backend

# 백엔드 개발 모드 (자동 빌드)
pnpm backend:dev

# Gradle 직접 실행 (문제가 있을 때)
cd projects/01-todo-list/backend
./gradlew buildFatJar
java -jar build/libs/todo-app.jar
```

### 코드 스타일

- **TypeScript**: ESLint + Prettier 사용
- **Kotlin**: kotlinter 플러그인 사용
- **커밋 메시지**: Conventional Commits 방식

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `fix/*`: 버그 수정 브랜치

## 📚 문서

- [📖 전체 프로젝트 문서](./docs/)
- [🔧 개발 설정 가이드](./docs/DEVELOPMENT.md)
- [🚀 배포 가이드](./docs/DEPLOYMENT.md)
- [🎯 프로젝트별 문서](./projects/)

### 프로젝트별 상세 문서

| 프로젝트 | README | API 문서 | 설정 가이드 |
|---------|--------|----------|------------|
| Todo List | [📖](./projects/01-todo-list/README.md) | [📡](./projects/01-todo-list/docs/API.md) | [⚙️](./projects/01-todo-list/docs/SETUP.md) |

## 🤝 기여하기

### 기여 방법

1. 이 레포지토리를 Fork
2. 새 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 커밋 메시지 규칙

```
type(scope): description

feat(todo): add task priority feature
fix(api): resolve authentication bug  
fix(checkbox): resolve field name mismatch in todo update
feat(ui): add favicon and page title
docs(readme): update installation guide
style(ui): improve button styling
refactor(auth): simplify login logic
test(api): add integration tests
chore(deps): update dependencies
perf(backend): add fast startup scripts
```

### 이슈 리포팅

버그를 발견하거나 새로운 기능을 제안하고 싶다면 [GitHub Issues](https://github.com/ldhldh07/vibe/issues)를 사용해주세요.

## 📊 프로젝트 현황

- ✅ **Todo List**: 개발 완료 (v1.2.0)
  - 체크박스 버그 수정 완료
  - 브라우저 탭 아이콘 및 제목 설정 완료
  - 백엔드 성능 최적화 완료
  - PWA 지원 추가
  - 완전한 CRUD API 구현 완료

## 🔗 링크

- **Repository**: [GitHub](https://github.com/ldhldh07/vibe.git)
- **Live Demo**: [Todo List App](https://vibe-todo.vercel.app) (예정)
- **API Documentation**: [Swagger UI](https://api.vibe-todo.com/docs) (예정)

## 📞 연락처

프로젝트 관련 문의나 협업 제안은 GitHub Issues 또는 Pull Request를 통해 연락해주세요.

---

**Made with ❤️ by Vibe Coding Team** 