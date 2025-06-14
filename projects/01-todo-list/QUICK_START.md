# Todo List 프로젝트 빠른 시작 가이드

## 🚀 **새 대화 시작 시 필수 체크리스트**

### **1. 현재 상태 파악 (2분)**
```bash
# 1.1 백엔드 컴파일 상태 확인
cd projects/01-todo-list/backend && ./gradlew compileKotlin

# 1.2 포트 사용 현황 확인
lsof -i :8080  # 백엔드
lsof -i :3000  # 프론트엔드

# 1.3 프로세스 상태 확인
ps aux | grep -E "(gradle|next|java)"
```

### **2. 프로젝트 실행 상태 확인 (1분)**
```bash
# 2.1 프론트엔드 접속 테스트
curl -I http://localhost:3000

# 2.2 백엔드 접속 테스트 (실행 중인 경우)
curl -I http://localhost:8080/api/auth/login
```

### **3. 최신 문서 확인 (1분)**
- `PROJECT_STATUS.md` - 전체 진행상황
- `WORK_LOG.md` - 최근 작업 내역
- `QUICK_START.md` - 이 파일

---

## ⚡ **즉시 실행 명령어 모음**

### **백엔드 관련**
```bash
# 컴파일 테스트
cd projects/01-todo-list/backend && ./gradlew compileKotlin

# 서버 실행 (컴파일 성공 시)
cd projects/01-todo-list/backend && ./gradlew run

# 포트 8080 사용 프로세스 종료
lsof -ti:8080 | xargs kill -9

# 백엔드 로그 확인
cd projects/01-todo-list/backend && ./gradlew run 2>&1 | tee backend.log
```

### **프론트엔드 관련**
```bash
# 프론트엔드 재시작 (완전 초기화)
cd projects/01-todo-list/frontend && pkill -f "next dev" && rm -rf .next && pnpm dev

# 포트 3000 사용 프로세스 종료
lsof -ti:3000 | xargs kill -9

# 의존성 재설치
cd projects/01-todo-list/frontend && rm -rf node_modules && pnpm install

# 개발 서버 시작
cd projects/01-todo-list/frontend && pnpm dev
```

### **통합 테스트**
```bash
# 백엔드 API 테스트 (서버 실행 후)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🎯 **현재 우선순위 작업**

### **🔥 CRITICAL: 백엔드 컴파일 에러 해결**
```
상태: ❌ 컴파일 실패
우선순위: 1순위
예상 시간: 30-60분
```

**해결해야 할 에러들:**
1. `getUserId()` 함수 누락 → JwtConfig.kt 수정
2. ProjectRole 확장 함수 누락 → Project.kt 수정
3. Long vs String 타입 불일치 → 전체 파일 수정
4. TodoFilters 파라미터 순서 → TodoRoutes.kt 수정

### **⚠️ HIGH: 프론트엔드 빌드 최적화**
```
상태: ⚠️ 실행 중이지만 불안정
우선순위: 2순위
예상 시간: 15-30분
```

**해결해야 할 문제들:**
1. CSS/JS 404 에러
2. _document.js 파일 누락
3. favicon 충돌 경고
4. 트레이스 파일 생성 실패

---

## 📋 **주요 파일 위치**

### **백엔드 핵심 파일**
```
src/main/kotlin/com/todoapp/
├── config/JwtConfig.kt          # JWT 설정 (getUserId 함수 추가 필요)
├── service/ProjectService.kt    # 프로젝트 서비스 (타입 수정 필요)
├── service/TodoService.kt       # Todo 서비스 (타입 수정 필요)
├── models/Project.kt           # 프로젝트 모델 (확장 함수 추가 필요)
├── models/Todo.kt              # Todo 모델 (타입 수정 완료)
├── routes/ProjectRoutes.kt     # 프로젝트 라우트 (getUserId 에러)
└── routes/TodoRoutes.kt        # Todo 라우트 (getUserId 에러)
```

### **프론트엔드 핵심 파일**
```
src/
├── lib/api.ts                  # API 클라이언트 (401 처리 완료)
├── lib/auth.ts                 # 인증 유틸리티
├── app/page.tsx               # 메인 페이지 (인증 검사 완료)
├── app/login/page.tsx         # 로그인 페이지
└── app/components/
    ├── Navbar.tsx             # 네비게이션 (로그아웃 완료)
    └── ProjectSelector.tsx    # 프로젝트 선택기 (에러 처리 완료)
```

---

## 🔧 **자주 사용하는 디버깅 명령어**

### **에러 로그 확인**
```bash
# 백엔드 컴파일 에러 상세 보기
cd projects/01-todo-list/backend && ./gradlew compileKotlin --info

# 프론트엔드 에러 로그
cd projects/01-todo-list/frontend && pnpm dev 2>&1 | grep -E "(error|Error|ERROR)"

# 포트 사용 현황 상세
netstat -tulpn | grep -E "(3000|8080)"
```

### **Git 상태 확인**
```bash
# 변경된 파일 확인
git status

# 최근 커밋 확인
git log --oneline -5

# 변경사항 확인
git diff
```

---

## 📞 **테스트 계정 정보**

```
Email: test@example.com
Password: password123
Status: 회원가입 완료 ✅
JWT Token: 로그인 시 발급됨
```

---

## 🎯 **성공 기준**

### **백엔드 성공 기준**
- [ ] `./gradlew compileKotlin` 성공
- [ ] `./gradlew run` 서버 실행 성공
- [ ] `curl http://localhost:8080/api/auth/login` 응답 성공

### **프론트엔드 성공 기준**
- [ ] `http://localhost:3000` 접속 성공
- [ ] CSS/JS 파일 로딩 성공 (404 에러 없음)
- [ ] 로그인/로그아웃 플로우 정상 작동

### **통합 테스트 성공 기준**
- [ ] 프론트엔드에서 백엔드 API 호출 성공
- [ ] 인증 토큰 정상 처리
- [ ] 프로젝트 목록 조회 성공

---

**마지막 업데이트**: 2024-01-15 22:30 KST  
**다음 작업**: 백엔드 컴파일 에러 해결부터 시작 