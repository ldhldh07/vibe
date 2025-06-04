# 📝 Todo List App

Ktor 백엔드와 Next.js 프론트엔드로 구성된 현대적인 Todo 관리 애플리케이션

## 🚀 기술 스택

### 백엔드
- **Ktor** - 경량 Kotlin 웹 프레임워크
- **Kotlin Coroutines** - 비동기 처리
- **Kotlinx Serialization** - JSON 직렬화
- **메모리 저장소** - 간단한 인메모리 데이터 관리

### 프론트엔드
- **Next.js 14** - React 메타 프레임워크 (App Router)
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 퍼스트 CSS
- **Zustand** - 경량 상태 관리
- **React Hook Form + Zod** - 폼 처리 및 검증
- **@dnd-kit** - 드래그앤드롭
- **Framer Motion** - 애니메이션

## 📁 프로젝트 구조

```
todo-app/
├── backend/                 # Ktor 서버
│   ├── src/main/kotlin/
│   │   ├── Application.kt
│   │   ├── models/
│   │   ├── routes/
│   │   └── storage/
│   ├── build.gradle.kts
│   └── gradle.properties
├── frontend/                # Next.js 앱
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── store/
│   ├── types/
│   └── package.json
├── docs/                    # 문서
│   ├── SETUP.md
│   ├── API.md
│   └── DEVELOPMENT.md
└── README.md
```

## 🚀 Todo App - 빠른 실행 가이드

## ⚡ 백엔드만 실행 (가장 빠름!)

```bash
# 프로젝트 루트에서
pnpm backend

# 또는 백엔드 폴더에서 직접
cd backend
./start.sh
```

## 🔥 개발 모드 (hot reload)

```bash
# 프로젝트 루트에서
pnpm backend:dev

# 또는 백엔드 폴더에서 직접
cd backend
./dev.sh
```

## 🎯 풀스택 실행 (백엔드 + 프론트엔드 동시)

```bash
# 프로젝트 루트에서
pnpm fullstack
```

## 🛑 백엔드 종료

```bash
pnpm backend:kill
```

## 📍 주요 엔드포인트

- 백엔드: http://localhost:8080
- 프론트엔드: http://localhost:3000
- 헬스체크: http://localhost:8080/health
- API 문서: http://localhost:8080/api

## 🔧 문제 해결

### 포트가 이미 사용중일 때
```bash
pnpm backend:kill
```

### JAR 파일이 없다는 오류
```bash
cd backend
./gradlew clean build
./start.sh
```

### gradle이 83%에서 멈출 때
- JAR 실행 방식을 사용하므로 문제없음
- `./start.sh` 스크립트가 자동으로 해결

## 🔧 개발 환경

### API 엔드포인트
- `GET /api/todos` - Todo 목록 조회
- `POST /api/todos` - Todo 생성
- `PUT /api/todos/{id}` - Todo 수정
- `DELETE /api/todos/{id}` - Todo 삭제

### 주요 기능
- ✅ Todo CRUD 작업
- 🔄 실시간 상태 동기화
- 🎨 드래그앤드롭 정렬
- 🔍 검색 및 필터링
- 📱 반응형 디자인
- 🌙 다크모드
- 💾 로컬스토리지 백업

## 📚 문서

- [설치 가이드](./docs/SETUP.md)
- [API 문서](./docs/API.md) 
- [개발 가이드](./docs/DEVELOPMENT.md)

## 🤝 개발 규칙

### 커밋 컨벤션
```
type(scope): description

# 예시
feat(todo-api): implement todo CRUD endpoints
docs(readme): add project setup instructions
fix(todo-list): resolve sorting issue
```

### 파일 수정 규칙
- 대화당 하나의 파일만 수정
- 완전한 기능 단위로 구현
- 파일 완료 시 즉시 커밋

## 🚀 배포

### 개발 환경
- 백엔드: `./gradlew run` (포트 8080)
- 프론트엔드: `pnpm dev` (포트 3000)

### 프로덕션 배포
- 백엔드: Gradle 빌드 후 JAR 실행
- 프론트엔드: Vercel 또는 정적 빌드

## 📄 라이선스

MIT License

## 👨‍💻 개발자

프로젝트 문의사항이나 개선 제안은 이슈로 등록해주세요. 