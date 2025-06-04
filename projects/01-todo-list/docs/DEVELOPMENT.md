# 🛠 개발 가이드

Todo List 앱 개발을 위한 종합적인 개발 가이드입니다.

## 🚀 개발 워크플로우

### 기본 원칙
- **1파일 1기능**: 한 번에 하나의 파일만 완전히 구현
- **테스트 우선**: 기능 구현 전 테스트 케이스 작성
- **문서화**: 코드 변경 시 관련 문서 업데이트
- **리뷰 필수**: 모든 변경사항은 코드 리뷰 후 병합

### 브랜치 전략
```bash
main                    # 프로덕션 코드
├── develop            # 개발 통합 브랜치
├── feature/todo-api   # 백엔드 API 기능
├── feature/todo-ui    # 프론트엔드 UI 기능
└── hotfix/bug-fix     # 긴급 버그 수정
```

### 커밋 컨벤션
```bash
# 형식: type(scope): description
feat(todo-api): implement todo CRUD operations
fix(todo-list): resolve drag and drop issue
docs(readme): update installation guide
style(components): format code with prettier
refactor(storage): optimize memory usage
test(api): add unit tests for todo service
chore(deps): update gradle dependencies
```

## 🏗 프로젝트 구조

### 백엔드 (Ktor)
```
backend/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   ├── Application.kt          # 앱 진입점
│   │   │   ├── plugins/                # Ktor 플러그인 설정
│   │   │   │   ├── Routing.kt
│   │   │   │   ├── Serialization.kt
│   │   │   │   └── CORS.kt
│   │   │   ├── models/                 # 데이터 모델
│   │   │   │   ├── Todo.kt
│   │   │   │   └── ApiResponse.kt
│   │   │   ├── routes/                 # API 라우트
│   │   │   │   └── TodoRoutes.kt
│   │   │   ├── services/               # 비즈니스 로직
│   │   │   │   └── TodoService.kt
│   │   │   └── storage/                # 데이터 저장소
│   │   │       └── InMemoryStorage.kt
│   │   └── resources/
│   │       └── application.conf        # 설정 파일
│   └── test/
│       └── kotlin/                     # 테스트 코드
├── build.gradle.kts                    # 빌드 설정
└── gradle.properties                   # Gradle 속성
```

### 프론트엔드 (Next.js)
```
frontend/
├── app/                                # Next.js App Router
│   ├── globals.css                     # 전역 스타일
│   ├── layout.tsx                      # 루트 레이아웃
│   ├── page.tsx                        # 홈페이지
│   └── todos/                          # Todo 관련 페이지
│       ├── page.tsx                    # Todo 목록 페이지
│       └── [id]/
│           └── page.tsx                # Todo 상세 페이지
├── components/                         # 재사용 컴포넌트
│   ├── ui/                            # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── todo/                          # Todo 관련 컴포넌트
│       ├── TodoList.tsx
│       ├── TodoItem.tsx
│       ├── TodoForm.tsx
│       └── TodoFilters.tsx
├── lib/                               # 유틸리티 라이브러리
│   ├── api.ts                         # API 클라이언트
│   ├── utils.ts                       # 공통 유틸리티
│   └── validations.ts                 # 데이터 검증
├── store/                             # 상태 관리
│   ├── todoStore.ts                   # Todo 상태
│   └── uiStore.ts                     # UI 상태
├── types/                             # 타입 정의
│   └── index.ts                       # 공통 타입
├── hooks/                             # 커스텀 훅
│   ├── useTodos.ts
│   └── useLocalStorage.ts
└── __tests__/                         # 테스트 파일
    ├── components/
    └── utils/
```

## 📝 코딩 스타일 가이드

### Kotlin (백엔드)
```kotlin
// 네이밍 컨벤션
class TodoService                       // PascalCase for classes
fun createTodo()                        // camelCase for functions
val todoList                           // camelCase for variables
const val MAX_TITLE_LENGTH = 255       // SCREAMING_SNAKE_CASE for constants

// 함수 작성 스타일
suspend fun createTodo(request: CreateTodoRequest): Todo {
    // 파라미터 검증
    require(request.title.isNotBlank()) { "Title cannot be empty" }
    require(request.title.length <= MAX_TITLE_LENGTH) { "Title too long" }
    
    // 비즈니스 로직
    val todo = Todo(
        id = generateId(),
        title = request.title.trim(),
        description = request.description?.trim(),
        isCompleted = false,
        priority = request.priority ?: Priority.MEDIUM,
        createdAt = Instant.now(),
        updatedAt = Instant.now(),
        dueDate = request.dueDate
    )
    
    // 저장 및 반환
    return storage.save(todo)
}

// 데이터 클래스
@Serializable
data class Todo(
    val id: Long,
    val title: String,
    val description: String? = null,
    val isCompleted: Boolean = false,
    val priority: Priority = Priority.MEDIUM,
    val createdAt: Instant,
    val updatedAt: Instant,
    val dueDate: Instant? = null
)
```

### TypeScript (프론트엔드)
```typescript
// 인터페이스 정의
interface Todo {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

// 컴포넌트 작성
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, updates: Partial<Todo>) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleToggle = useCallback(() => {
    onToggle(todo.id);
  }, [todo.id, onToggle]);
  
  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg">
      <button
        onClick={handleToggle}
        className={clsx(
          'w-5 h-5 rounded border-2 flex items-center justify-center',
          todo.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'
        )}
      >
        {todo.isCompleted && <CheckIcon className="w-3 h-3 text-white" />}
      </button>
      
      <span className={clsx(
        'flex-1',
        todo.isCompleted && 'line-through text-gray-500'
      )}>
        {todo.title}
      </span>
    </div>
  );
}
```

## 🧪 테스트 전략

### 백엔드 테스트 (Kotlin)
```kotlin
// 단위 테스트
class TodoServiceTest {
    private val storage = InMemoryTodoStorage()
    private val service = TodoService(storage)
    
    @Test
    fun `should create todo with valid data`() = runTest {
        // Given
        val request = CreateTodoRequest(
            title = "Test Todo",
            description = "Test Description",
            priority = Priority.HIGH
        )
        
        // When
        val result = service.createTodo(request)
        
        // Then
        assertThat(result.title).isEqualTo("Test Todo")
        assertThat(result.isCompleted).isFalse()
        assertThat(result.priority).isEqualTo(Priority.HIGH)
    }
    
    @Test
    fun `should throw exception for empty title`() = runTest {
        // Given
        val request = CreateTodoRequest(title = "")
        
        // When & Then
        assertThrows<IllegalArgumentException> {
            service.createTodo(request)
        }
    }
}

// 통합 테스트
class TodoRoutesTest {
    @Test
    fun `POST api todos should create new todo`() = testApplication {
        // Given
        val client = createClient {
            install(ContentNegotiation) { json() }
        }
        
        // When
        val response = client.post("/api/todos") {
            contentType(ContentType.Application.Json)
            setBody(CreateTodoRequest(title = "Test Todo"))
        }
        
        // Then
        assertEquals(HttpStatusCode.Created, response.status)
        val todo = response.body<Todo>()
        assertEquals("Test Todo", todo.title)
    }
}
```

### 프론트엔드 테스트 (Jest + Testing Library)
```typescript
// 컴포넌트 테스트
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoItem } from './TodoItem';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: 1,
    title: 'Test Todo',
    isCompleted: false,
    priority: 'medium',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  };

  it('renders todo title', () => {
    render(
      <TodoItem 
        todo={mockTodo} 
        onToggle={jest.fn()} 
        onDelete={jest.fn()} 
        onEdit={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', () => {
    const onToggle = jest.fn();
    render(
      <TodoItem 
        todo={mockTodo} 
        onToggle={onToggle} 
        onDelete={jest.fn()} 
        onEdit={jest.fn()} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(1);
  });
});

// 커스텀 훅 테스트
import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos';

describe('useTodos', () => {
  it('should add new todo', () => {
    const { result } = renderHook(() => useTodos());
    
    act(() => {
      result.current.addTodo({
        title: 'New Todo',
        priority: 'high'
      });
    });
    
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe('New Todo');
  });
});
```

## 🔧 개발 도구 설정

### IntelliJ IDEA (백엔드)
```kotlin
// .editorconfig
[*.kt]
indent_style = space
indent_size = 4
continuation_indent_size = 4
max_line_length = 120

// ktlint 설정
ktlint {
    version.set("0.50.0")
    outputToConsole.set(true)
    coloredOutput.set(true)
    filter {
        exclude("**/generated/**")
    }
}
```

### VSCode (프론트엔드)
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}

// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Prettier 설정
```javascript
// prettier.config.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  plugins: ['prettier-plugin-tailwindcss'],
};
```

### ESLint 설정
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

## 🐛 디버깅 가이드

### 백엔드 디버깅
```kotlin
// 로깅 설정
private val logger = LoggerFactory.getLogger(TodoService::class.java)

suspend fun createTodo(request: CreateTodoRequest): Todo {
    logger.debug("Creating todo with title: ${request.title}")
    
    try {
        val todo = Todo(/* ... */)
        logger.info("Todo created successfully with id: ${todo.id}")
        return storage.save(todo)
    } catch (e: Exception) {
        logger.error("Failed to create todo", e)
        throw e
    }
}

// IntelliJ 디버깅 설정
// Run Configuration -> Add New -> Gradle
// Gradle project: backend
// Tasks: run
// Arguments: --debug-jvm
```

### 프론트엔드 디버깅
```typescript
// 브라우저 개발자 도구 활용
const TodoItem = ({ todo }: TodoItemProps) => {
  // 개발 환경에서만 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log('TodoItem rendered:', todo);
  }
  
  return (
    <div>
      {/* 디버깅을 위한 데이터 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-xs text-gray-500">
          {JSON.stringify(todo, null, 2)}
        </pre>
      )}
    </div>
  );
};

// React DevTools 활용
// - 컴포넌트 트리 확인
// - Props 및 State 실시간 수정
// - 성능 프로파일링
```

## 🚀 성능 최적화

### 백엔드 최적화
```kotlin
// 메모리 사용량 최적화
class InMemoryTodoStorage {
    private val todos = ConcurrentHashMap<Long, Todo>()
    private val maxSize = 10_000
    
    fun save(todo: Todo): Todo {
        if (todos.size >= maxSize) {
            // LRU 정책으로 오래된 항목 제거
            removeOldest()
        }
        todos[todo.id] = todo
        return todo
    }
}

// 비동기 처리 최적화
suspend fun getAllTodos(filters: TodoFilters): List<Todo> = withContext(Dispatchers.IO) {
    storage.findAll()
        .asSequence()
        .filter { applyFilters(it, filters) }
        .sortedWith(getSortComparator(filters.sort))
        .toList()
}
```

### 프론트엔드 최적화
```typescript
// React.memo로 불필요한 리렌더링 방지
export const TodoItem = React.memo<TodoItemProps>(({ todo, onToggle }) => {
  return (
    <div>{/* ... */}</div>
  );
}, (prevProps, nextProps) => {
  return prevProps.todo.id === nextProps.todo.id &&
         prevProps.todo.updatedAt === nextProps.todo.updatedAt;
});

// 가상화로 대량 데이터 처리
import { FixedSizeList as List } from 'react-window';

const TodoList = ({ todos }: { todos: Todo[] }) => (
  <List
    height={600}
    itemCount={todos.length}
    itemSize={60}
    itemData={todos}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <TodoItem todo={data[index]} />
      </div>
    )}
  </List>
);

// 상태 최적화 (Zustand)
const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  addTodo: (todo) => set((state) => ({
    todos: [...state.todos, todo]
  })),
  // 선택적 업데이트로 성능 개선
  updateTodo: (id, updates) => set((state) => ({
    todos: state.todos.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    )
  }))
}));
```

## 🔐 보안 고려사항

### 입력 검증
```kotlin
// 백엔드 검증
fun validateTodoInput(request: CreateTodoRequest) {
    require(request.title.isNotBlank()) { "Title cannot be empty" }
    require(request.title.length <= 255) { "Title too long" }
    require(!request.title.contains("<script>")) { "Invalid characters" }
    
    request.description?.let { desc ->
        require(desc.length <= 1000) { "Description too long" }
    }
}
```

```typescript
// 프론트엔드 검증 (Zod)
import { z } from 'zod';

const todoSchema = z.object({
  title: z.string()
    .min(1, "제목을 입력하세요")
    .max(255, "제목이 너무 깁니다")
    .refine(val => !val.includes('<script>'), "유효하지 않은 문자"),
  description: z.string()
    .max(1000, "설명이 너무 깁니다")
    .optional(),
});
```

## 📊 모니터링 및 로깅

### 성능 모니터링
```typescript
// 프론트엔드 성능 측정
export function measurePerformance<T>(
  name: string, 
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
}

// 사용 예시
const todos = measurePerformance('Todo filtering', () => 
  filterTodos(allTodos, currentFilters)
);
```

개발 중 문제가 발생하면 [이슈 등록](../../issues)하거나 팀 채널을 통해 도움을 요청하세요. 