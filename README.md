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

### 01. [Todo List Application](./projects/01-todo-list/)
**🏷️ 풀스택 웹 애플리케이션**

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Ktor (Kotlin) + REST API
- **특징**: 
  - 실시간 Todo 관리
  - 현대적인 UI/UX
  - RESTful API 설계
  - 완전한 CRUD 기능

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0
- **Java** ≥ 17 (Kotlin 프로젝트용)

### 설치 및 실행

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

### 개별 프로젝트 실행

```bash
# Todo List 프로젝트만 실행
cd projects/01-todo-list

# Frontend 개발 서버
cd frontend && pnpm dev

# Backend 개발 서버  
cd backend && ./gradlew buildFatJar && java -jar build/libs/todo-app.jar
```

## 🛠️ 기술 스택

### Frontend 기술스택
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks / Zustand
- **HTTP Client**: Fetch API / Axios

### Backend 기술스택
- **Framework**: Ktor (Kotlin)
- **Language**: Kotlin
- **Build Tool**: Gradle
- **API Style**: RESTful API
- **Serialization**: Kotlinx Serialization

### 개발 도구
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Version Control**: Git
- **CI/CD**: GitHub Actions (예정)
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 📁 폴더 구조

```
vibe-coding/
├── 📦 projects/               # 메인 프로젝트들
│   └── 📂 01-todo-list/      # Todo 애플리케이션
│       ├── 🌐 frontend/       # Next.js 앱
│       ├── ⚙️ backend/        # Ktor API 서버
│       └── 📖 docs/          # 프로젝트 문서
├── 🔧 shared/                # 공유 라이브러리
│   ├── 🎨 ui/                # 공통 UI 컴포넌트
│   ├── 🛠️ utils/             # 유틸리티 함수들
│   ├── 📝 types/             # 공통 타입 정의
│   └── ⚙️ configs/           # 설정 파일들
├── 📚 docs/                  # 전체 프로젝트 문서
├── 🏗️ turbo.json             # Turborepo 설정
├── 📦 package.json           # 루트 패키지 설정
└── 📋 README.md              # 이 파일
```

## 🔧 개발 가이드

### 새 프로젝트 추가하기

1. `projects/` 폴더에 새 디렉토리 생성
2. 해당 디렉토리에 프로젝트 구조 설정
3. `turbo.json`에 빌드 설정 추가
4. 루트 `package.json`에 워크스페이스 추가

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
docs(readme): update installation guide
style(ui): improve button styling
refactor(auth): simplify login logic
test(api): add integration tests
chore(deps): update dependencies
```

### 이슈 리포팅

버그를 발견하거나 새로운 기능을 제안하고 싶다면 [GitHub Issues](https://github.com/ldhldh07/vibe/issues)를 사용해주세요.

## 📊 프로젝트 현황

- ✅ **Todo List**: 개발 완료 (v1.0.0)

## 📞 연락처

- **개발자**: [@ldhldh07](https://github.com/ldhldh07)
- **이메일**: [개발자 이메일]
- **이슈**: [GitHub Issues](https://github.com/ldhldh07/vibe/issues)

## 📄 라이선스

이 프로젝트는 [MIT License](./LICENSE) 하에 배포됩니다.

---

<div align="center">
  <p><strong>🚀 함께 코딩의 새로운 경험을 만들어가요!</strong></p>
  <p>Made with ❤️ by <a href="https://github.com/ldhldh07">@ldhldh07</a></p>
</div> 