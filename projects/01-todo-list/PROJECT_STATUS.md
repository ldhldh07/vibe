# Todo List 프로젝트 진행상황 문서

## 📋 **프로젝트 개요**

### **목표**
- **백엔드**: Kotlin + Ktor 기반 REST API 서버
- **프론트엔드**: Next.js + TypeScript + Tailwind CSS
- **기능**: 사용자 인증, 프로젝트 관리, Todo CRUD, 팀 협업
- **인증**: JWT 토큰 기반 인증 시스템

### **기술 스택**
- **Backend**: Kotlin, Ktor, JWT, InMemory Storage
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, pnpm
- **Development**: Gradle, Hot Reload, CORS 설정

---

## 🎯 **현재 상태 (2024-01-15 기준)**

### ✅ **완료된 기능들**
1. **백엔드 기본 구조**
   - Ktor 서버 설정 완료
   - JWT 인증 시스템 구현
   - CORS 설정 완료
   - 파일 업로드 시스템 초기화

2. **인증 시스템**
   - 회원가입/로그인 API 구현
   - JWT 토큰 생성/검증
   - 사용자 정보 관리

3. **데이터 모델**
   - User, Project, Todo 모델 정의
   - 권한 시스템 (ProjectRole) 구현
   - InMemory 저장소 구현

4. **프론트엔드 기본 구조**
   - Next.js 프로젝트 설정
   - 로그인/회원가입 페이지
   - 메인 대시보드 레이아웃
   - Tailwind CSS 스타일링

---

## 🚨 **현재 발생 중인 문제들**

### **1. 백엔드 컴파일 에러 (CRITICAL)**
```
❌ 상태: 컴파일 실패
❌ 원인: 타입 불일치 및 함수 누락
❌ 영향: 백엔드 서버 실행 불가
```

**주요 에러들:**
- `getUserId()` 함수 누락 (ProjectRoutes.kt, TodoRoutes.kt)
- Long vs String 타입 불일치 (모든 userId 관련)
- ProjectRole 확장 함수 누락 (`canManageProject`, `canInviteMembers` 등)
- TodoFilters 파라미터 순서 문제
- CreateTodoRequest의 projectId null 처리 문제

### **2. 프론트엔드 빌드 문제**
```
❌ 상태: 빌드 파일 누락
❌ 원인: .next 디렉토리 서버 파일 부재
❌ 영향: CSS/JS 404 에러, favicon 충돌
```

**주요 에러들:**
- `_document.js` 파일 누락
- CSS/JS 정적 파일 404 에러
- favicon 충돌 경고
- 트레이스 파일 생성 실패

### **3. 포트 충돌 문제**
```
⚠️ 상태: 다중 인스턴스 실행
⚠️ 원인: 이전 프로세스 미종료
⚠️ 영향: 포트 3000→3001→3002 순차 사용
```

---

## 🔧 **해결된 문제들 (이전 사이클)**

### **1. JWT 인증 시스템 타입 불일치**
- **문제**: JWT에서 userId를 String(UUID)로 반환하지만 백엔드는 Long 타입 기대
- **해결**: 모든 Service 클래스의 userId 파라미터를 String으로 변경
- **영향**: ProjectService, TodoService, InMemoryStorage 전면 수정

### **2. 프론트엔드 인증 처리**
- **문제**: 로그아웃 후 로그인 페이지로 리다이렉트 안됨
- **해결**: API 401 에러 시 자동 로그아웃 및 리다이렉트 구현
- **파일**: `src/lib/api.ts`, `src/app/page.tsx`, `src/components/Navbar.tsx`

### **3. Hydration 에러**
- **문제**: 서버/클라이언트 렌더링 불일치
- **해결**: `isClient` 상태로 클라이언트 전용 렌더링 구현

---

## 📝 **이번 사이클에서 수행된 작업들**

### **백엔드 타입 시스템 통일 작업**
1. **JwtConfig.kt**: `getUserId()` 확장 함수 추가
2. **ProjectService.kt**: 모든 userId 파라미터 Long → String 변경
3. **TodoService.kt**: 모든 userId 파라미터 Long → String 변경
4. **InMemoryStorage.kt**: 저장소 메서드 시그니처 수정
5. **Todo.kt**: createdBy, assignedTo 필드 String으로 변경
6. **Project.kt**: ownerId, ProjectMember.userId String으로 변경

### **프론트엔드 인증 처리 개선**
1. **API 에러 처리**: 401 에러 시 자동 로그아웃 구현
2. **로그아웃 플로우**: 확인 후 즉시 로그인 페이지 이동
3. **인증 검사 강화**: 토큰 유효성 검사 개선

### **시도된 해결책들**
- 백엔드 컴파일 에러 수정 (진행 중)
- 프론트엔드 빌드 캐시 초기화
- 포트 충돌 해결을 위한 프로세스 종료

---

## 🎯 **다음 사이클에서 해야할 일들**

### **우선순위 1: 백엔드 컴파일 에러 해결**
```kotlin
// 해결해야 할 주요 에러들:
1. getUserId() 함수 누락 → JwtConfig.kt에 확장 함수 추가
2. ProjectRole 확장 함수들 누락 → canManageProject, canInviteMembers 등 구현
3. TodoFilters 파라미터 순서 수정
4. Long vs String 타입 불일치 완전 해결
```

### **우선순위 2: 프론트엔드 빌드 문제 해결**
```bash
# 해결 방법:
1. .next 디렉토리 완전 삭제 후 재빌드
2. favicon 충돌 해결
3. 정적 파일 경로 문제 해결
4. 트레이스 파일 생성 문제 해결
```

### **우선순위 3: 테스트 코드 구현 (내일 작업 예정)**
```kotlin
// 백엔드 테스트 코드 작성 계획:
1. 단위 테스트 (Unit Tests)
   - AuthService 테스트 (로그인/회원가입)
   - ProjectService 테스트 (CRUD 기능)
   - TodoService 테스트 (CRUD 기능)
   - JWT 토큰 검증 테스트

2. 통합 테스트 (Integration Tests)
   - API 엔드포인트 테스트
   - 인증 플로우 테스트
   - 권한 검사 테스트

3. 테스트 환경 설정
   - Ktor Test Engine 설정
   - 테스트용 InMemory 데이터베이스
   - Mock 데이터 생성 유틸리티
   - 테스트 실행 자동화 (Gradle)
```

```typescript
// 프론트엔드 테스트 코드 작성 계획:
1. 컴포넌트 테스트 (Jest + React Testing Library)
   - 로그인/회원가입 폼 테스트
   - Navbar 컴포넌트 테스트
   - ProjectSelector 컴포넌트 테스트
   - Todo 관련 컴포넌트 테스트

2. API 통신 테스트
   - API 클라이언트 함수 테스트
   - 에러 처리 로직 테스트
   - 인증 토큰 처리 테스트

3. E2E 테스트 (Playwright 또는 Cypress)
   - 전체 사용자 플로우 테스트
   - 로그인 → 프로젝트 생성 → Todo 관리 플로우
   - 다중 사용자 시나리오 테스트
```

### **우선순위 4: 통합 테스트**
```
1. 백엔드 API 엔드포인트 테스트
2. 프론트엔드-백엔드 연동 테스트
3. 인증 플로우 전체 테스트
4. CRUD 기능 테스트
```

---

## 🔍 **현재 실행 상태**

### **백엔드**
```
❌ 상태: 컴파일 실패로 실행 불가
🔧 마지막 시도: ./gradlew compileKotlin 실패
📍 포트: 8080 (사용 예정)
```

### **프론트엔드**
```
✅ 상태: 실행 중 (불안정)
📍 포트: 3000 (현재 실행 중)
⚠️ 문제: CSS/JS 404 에러, 빌드 파일 누락
```

---

## 📚 **참고 정보**

### **주요 파일 경로**
```
Backend:
- src/main/kotlin/com/todoapp/config/JwtConfig.kt
- src/main/kotlin/com/todoapp/service/ProjectService.kt
- src/main/kotlin/com/todoapp/service/TodoService.kt
- src/main/kotlin/com/todoapp/models/Todo.kt
- src/main/kotlin/com/todoapp/models/Project.kt

Frontend:
- src/lib/api.ts
- src/app/page.tsx
- src/app/components/Navbar.tsx
- src/app/components/ProjectSelector.tsx
```

### **테스트 계정**
```
Email: test@example.com
Password: password123
Status: 회원가입 완료, 로그인 테스트 성공
```

### **API 엔드포인트**
```
POST /api/auth/register - 회원가입 ✅
POST /api/auth/login - 로그인 ✅
GET /api/projects - 프로젝트 목록 (컴파일 에러로 테스트 불가)
```

---

## 🚀 **다음 대화 시작 시 체크리스트**

1. **백엔드 컴파일 상태 확인**: `cd projects/01-todo-list/backend && ./gradlew compileKotlin`
2. **프론트엔드 실행 상태 확인**: `http://localhost:3000` 접속 테스트
3. **포트 사용 현황 확인**: `lsof -i :8080` (백엔드), `lsof -i :3000` (프론트엔드)
4. **최신 에러 로그 확인**: 컴파일 에러 메시지 분석
5. **우선순위 작업 선택**: 백엔드 컴파일 에러 해결부터 시작

---

**마지막 업데이트**: 2024-01-15 22:10 KST  
**다음 목표**: 백엔드 컴파일 에러 완전 해결 → 서버 실행 → 통합 테스트 