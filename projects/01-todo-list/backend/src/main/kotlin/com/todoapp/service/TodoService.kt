package com.todoapp.service

import com.todoapp.storage.InMemoryStorage
import com.todoapp.models.Todo
import com.todoapp.models.CreateTodoRequest
import com.todoapp.models.UpdateTodoRequest
import com.todoapp.models.Priority
import com.todoapp.models.TodoFilters

/**
 * Todo 비즈니스 로직을 담당하는 서비스 클래스
 * InMemoryStorage를 사용하여 Todo CRUD 작업을 처리
 * 유효성 검증 및 비즈니스 규칙을 적용
 */
class TodoService(
    /**
     * Todo 데이터 저장을 위한 저장소
     * 기본값으로 새로운 InMemoryStorage 인스턴스 생성
     */
    private val storage: InMemoryStorage = InMemoryStorage()
) {
    /**
     * 새로운 Todo를 생성
     * @param request Todo 생성 요청 데이터
     * @return 생성된 Todo 객체
     * @throws IllegalArgumentException 유효하지 않은 요청 데이터
     */
    fun createTodo(request: CreateTodoRequest): Todo {
        // 요청 데이터 유효성 검증
        request.validate()
        
        // 기본값 적용
        val priority = request.priority ?: Priority.MEDIUM
        
        // 저장소에 저장
        return storage.save(
            title = request.title,
            description = request.description,
            priority = priority,
            dueDate = request.dueDate
        )
    }
    
    /**
     * ID로 특정 Todo를 조회
     * @param id 조회할 Todo의 ID
     * @return 해당 Todo 객체
     * @throws IllegalArgumentException Todo가 존재하지 않는 경우
     */
    fun getTodoById(id: Long): Todo {
        require(id > 0) { "ID는 양수여야 합니다" }
        
        return storage.findById(id)
            ?: throw IllegalArgumentException("ID $id 에 해당하는 Todo를 찾을 수 없습니다")
    }
    
    /**
     * 기존 Todo를 업데이트
     * @param id 업데이트할 Todo의 ID
     * @param request Todo 업데이트 요청 데이터
     * @return 업데이트된 Todo 객체
     * @throws IllegalArgumentException Todo가 존재하지 않거나 유효하지 않은 요청 데이터
     */
    fun updateTodo(id: Long, request: UpdateTodoRequest): Todo {
        require(id > 0) { "ID는 양수여야 합니다" }
        require(!request.isEmpty()) { "업데이트할 데이터가 없습니다" }
        
        // 요청 데이터 유효성 검증
        request.validate()
        
        // 기존 Todo 조회
        val existingTodo = getTodoById(id)
        
        // 저장소에서 업데이트
        return storage.update(
            id = id,
            title = request.title,
            description = request.description,
            isCompleted = request.isCompleted,
            priority = request.priority,
            dueDate = request.dueDate
        ) ?: throw IllegalArgumentException("ID $id 에 해당하는 Todo를 찾을 수 없습니다")
    }
    
    /**
     * 필터 조건에 따라 Todo 목록을 조회
     * @param filters 필터링 및 정렬 조건 (null이면 기본값 사용)
     * @return 조건에 맞는 Todo 목록
     */
    fun getAllTodos(filters: TodoFilters? = null): List<Todo> {
        val actualFilters = filters ?: TodoFilters()
        return storage.findAll(actualFilters)
    }
    
    /**
     * ID로 특정 Todo를 삭제
     * @param id 삭제할 Todo의 ID
     * @throws IllegalArgumentException Todo가 존재하지 않는 경우
     */
    fun deleteTodo(id: Long) {
        require(id > 0) { "ID는 양수여야 합니다" }
        
        val deleted = storage.delete(id)
        if (!deleted) {
            throw IllegalArgumentException("ID $id 에 해당하는 Todo를 찾을 수 없습니다")
        }
    }
} 