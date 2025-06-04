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

## ⚡ 빠른 시작

### 필수 요구사항
- **Node.js** 18+ 
- **pnpm** 8+
- **JDK** 17+
- **Git**

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **백엔드 실행**
   ```bash
   cd backend
   ./gradlew run
   # 또는 Windows: gradlew.bat run
   ```
   - 서버: http://localhost:8080

3. **프론트엔드 실행** (새 터미널)
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```
   - 웹앱: http://localhost:3000

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