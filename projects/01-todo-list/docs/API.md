# 🚀 API 문서

Todo List 앱의 백엔드 API 상세 문서입니다.

## 📋 API 개요

### 기본 정보
- **Base URL**: `http://localhost:8080`
- **Content-Type**: `application/json`
- **인증**: 없음 (현재 버전)
- **데이터 형식**: JSON
- **인코딩**: UTF-8

### API 버전
- **현재 버전**: v1
- **API 경로**: `/api/*`

## 📊 데이터 모델

### Todo 객체
```typescript
interface Todo {
  id: number;           // 고유 식별자
  title: string;        // Todo 제목 (필수, 1-255자)
  description?: string; // Todo 설명 (선택사항, 최대 1000자)
  isCompleted: boolean; // 완료 상태
  priority: "low" | "medium" | "high"; // 우선순위
  createdAt: string;    // 생성 시간 (ISO 8601)
  updatedAt: string;    // 수정 시간 (ISO 8601)
  dueDate?: string;     // 마감일 (ISO 8601, 선택사항)
}
```

### CreateTodo 요청 객체
```typescript
interface CreateTodoRequest {
  title: string;        // 필수
  description?: string; // 선택사항
  priority?: "low" | "medium" | "high"; // 기본값: "medium"
  dueDate?: string;     // ISO 8601 형식
}
```

### UpdateTodo 요청 객체
```typescript
interface UpdateTodoRequest {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}
```

## 🛠 API 엔드포인트

### 1. 모든 Todo 조회

```http
GET /api/todos
```

**설명**: 저장된 모든 Todo 항목을 조회합니다.

**쿼리 파라미터**:
- `completed` (선택): `true` | `false` - 완료 상태로 필터링
- `priority` (선택): `low` | `medium` | `high` - 우선순위로 필터링
- `sort` (선택): `created` | `updated` | `priority` - 정렬 기준 (기본값: `created`)
- `order` (선택): `asc` | `desc` - 정렬 순서 (기본값: `desc`)

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Kotlin 학습하기",
      "description": "Ktor 프레임워크 튜토리얼 완료",
      "isCompleted": false,
      "priority": "high",
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T09:00:00Z",
      "dueDate": "2024-01-20T18:00:00Z"
    }
  ],
  "count": 1
}
```

**상태 코드**: `200 OK`

### 2. 새 Todo 생성

```http
POST /api/todos
```

**설명**: 새로운 Todo 항목을 생성합니다.

**요청 본문**:
```json
{
  "title": "Next.js 프로젝트 완성",
  "description": "Todo 앱 프론트엔드 구현",
  "priority": "high",
  "dueDate": "2024-01-25T17:00:00Z"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "Next.js 프로젝트 완성",
    "description": "Todo 앱 프론트엔드 구현",
    "isCompleted": false,
    "priority": "high",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "dueDate": "2024-01-25T17:00:00Z"
  }
}
```

**상태 코드**: `201 Created`

### 3. 특정 Todo 조회

```http
GET /api/todos/{id}
```

**설명**: ID로 특정 Todo 항목을 조회합니다.

**경로 파라미터**:
- `id`: Todo의 고유 식별자

**응답**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Kotlin 학습하기",
    "description": "Ktor 프레임워크 튜토리얼 완료",
    "isCompleted": false,
    "priority": "high",
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T09:00:00Z",
    "dueDate": "2024-01-20T18:00:00Z"
  }
}
```

**상태 코드**: `200 OK`

### 4. Todo 수정

```http
PUT /api/todos/{id}
```

**설명**: 기존 Todo 항목을 수정합니다.

**경로 파라미터**:
- `id`: 수정할 Todo의 고유 식별자

**요청 본문** (부분 업데이트 지원):
```json
{
  "title": "Kotlin과 Ktor 완전 정복",
  "isCompleted": true,
  "priority": "medium"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Kotlin과 Ktor 완전 정복",
    "description": "Ktor 프레임워크 튜토리얼 완료",
    "isCompleted": true,
    "priority": "medium",
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T14:20:00Z",
    "dueDate": "2024-01-20T18:00:00Z"
  }
}
```

**상태 코드**: `200 OK`

### 5. Todo 삭제

```http
DELETE /api/todos/{id}
```

**설명**: 특정 Todo 항목을 삭제합니다.

**경로 파라미터**:
- `id`: 삭제할 Todo의 고유 식별자

**응답**:
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

**상태 코드**: `204 No Content`

## ⚠️ 에러 처리

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 데이터가 올바르지 않습니다",
    "details": {
      "field": "title",
      "reason": "제목은 필수입니다"
    }
  }
}
```

### 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| `200` | OK | 요청 성공 |
| `201` | Created | 리소스 생성 성공 |
| `204` | No Content | 삭제 성공 |
| `400` | Bad Request | 잘못된 요청 데이터 |
| `404` | Not Found | 리소스를 찾을 수 없음 |
| `422` | Unprocessable Entity | 데이터 검증 실패 |
| `500` | Internal Server Error | 서버 내부 오류 |

### 공통 에러 코드

| 에러 코드 | 설명 |
|-----------|------|
| `VALIDATION_ERROR` | 입력 데이터 검증 실패 |
| `NOT_FOUND` | 요청한 리소스가 존재하지 않음 |
| `INVALID_ID` | 잘못된 ID 형식 |
| `INTERNAL_ERROR` | 서버 내부 오류 |

## 📝 사용 예시

### JavaScript/TypeScript (fetch)

```typescript
// 모든 Todo 조회
const getTodos = async () => {
  const response = await fetch('http://localhost:8080/api/todos');
  const result = await response.json();
  return result.data;
};

// 새 Todo 생성
const createTodo = async (todoData: CreateTodoRequest) => {
  const response = await fetch('http://localhost:8080/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todoData),
  });
  const result = await response.json();
  return result.data;
};

// Todo 완료 상태 토글
const toggleTodo = async (id: number, isCompleted: boolean) => {
  const response = await fetch(`http://localhost:8080/api/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isCompleted }),
  });
  const result = await response.json();
  return result.data;
};
```

### cURL 예시

```bash
# 모든 Todo 조회
curl -X GET http://localhost:8080/api/todos

# 새 Todo 생성
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "새로운 할 일",
    "description": "설명",
    "priority": "high"
  }'

# Todo 수정
curl -X PUT http://localhost:8080/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"isCompleted": true}'

# Todo 삭제
curl -X DELETE http://localhost:8080/api/todos/1
```

## 🔄 데이터 동기화

### 실시간 업데이트 (향후 기능)
현재 버전은 폴링 방식을 권장합니다:

```typescript
// 5초마다 데이터 새로고침
const pollTodos = () => {
  setInterval(async () => {
    const todos = await getTodos();
    updateTodoList(todos);
  }, 5000);
};
```

### 캐싱 전략
- **클라이언트 캐싱**: 로컬스토리지 활용
- **서버 캐싱**: 메모리 기반 (서버 재시작 시 초기화)

## 🚀 성능 고려사항

### 요청 제한
- 현재 요청 제한 없음
- 향후 Rate Limiting 도입 예정

### 페이지네이션 (향후 기능)
```http
GET /api/todos?page=1&limit=20
```

## 🔧 개발자 도구

### API 테스트
- **Postman**: 컬렉션 파일 제공 예정
- **Thunder Client**: VSCode 확장 프로그램
- **HTTP Client**: IntelliJ IDEA 내장 도구

### 로깅
서버 콘솔에서 요청/응답 로그 확인 가능:
```
[INFO] GET /api/todos - 200 OK (15ms)
[INFO] POST /api/todos - 201 Created (8ms)
```

API에 대한 문의사항이나 버그 리포트는 [이슈 등록](../../issues)을 통해 알려주세요. 