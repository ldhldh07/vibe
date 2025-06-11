package com.todoapp.storage

import com.todoapp.models.Todo
import com.todoapp.models.Priority
import com.todoapp.models.TodoFilters
import com.todoapp.models.TodoSortField
import com.todoapp.models.SortOrder
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant

/**
 * 메모리 기반 Todo 저장소
 * 실제 데이터베이스 없이 HashMap으로 Todo 데이터를 관리
 * 애플리케이션 재시작 시 데이터는 초기화됨
 */
class InMemoryStorage {
    /**
     * Todo 저장을 위한 메모리 저장소
     * Key: Todo ID, Value: Todo 객체
     */
    private val todos = mutableMapOf<Long, Todo>()
    
    /**
     * 새로운 Todo ID 생성을 위한 카운터
     * 1부터 시작하여 순차적으로 증가
     */
    private var nextId = 1L
    
    /**
     * 새로운 Todo를 저장하고 ID를 할당
     * @param title Todo 제목
     * @param description Todo 설명 (선택사항)
     * @param priority Todo 우선순위
     * @param dueDate Todo 마감일 (선택사항)
     * @return 저장된 Todo 객체 (ID 포함)
     */
    fun save(title: String, description: String?, priority: Priority, dueDate: Instant?): Todo {
        val now = Clock.System.now()
        val todo = Todo(
            id = nextId,
            title = title,
            description = description,
            isCompleted = false,
            priority = priority,
            createdAt = now,
            updatedAt = now,
            dueDate = dueDate
        )
        
        todos[nextId] = todo
        nextId++
        return todo
    }
    
    /**
     * ID로 특정 Todo를 조회
     * @param id 조회할 Todo의 ID
     * @return 해당 Todo 객체, 없으면 null
     */
    fun findById(id: Long): Todo? {
        return todos[id]
    }
    
    /**
     * 기존 Todo를 업데이트
     * @param id 업데이트할 Todo의 ID
     * @param title 새로운 제목 (null이면 기존값 유지)
     * @param description 새로운 설명 (null이면 기존값 유지)
     * @param isCompleted 새로운 완료 상태 (null이면 기존값 유지)
     * @param priority 새로운 우선순위 (null이면 기존값 유지)
     * @param dueDate 새로운 마감일 (null이면 기존값 유지)
     * @return 업데이트된 Todo 객체, 해당 ID가 없으면 null
     */
    fun update(
        id: Long, 
        title: String? = null, 
        description: String? = null, 
        isCompleted: Boolean? = null, 
        priority: Priority? = null, 
        dueDate: Instant? = null
    ): Todo? {
        val existingTodo = todos[id] ?: return null
        
        val updatedTodo = existingTodo.copy(
            title = title ?: existingTodo.title,
            description = description ?: existingTodo.description,
            isCompleted = isCompleted ?: existingTodo.isCompleted,
            priority = priority ?: existingTodo.priority,
            dueDate = dueDate ?: existingTodo.dueDate,
            updatedAt = Clock.System.now()
        )
        
        todos[id] = updatedTodo
        return updatedTodo
    }
    
    /**
     * 필터와 정렬 조건에 따라 Todo 목록을 조회
     * @param filters 필터링 및 정렬 조건
     * @return 조건에 맞는 Todo 목록
     */
    fun findAll(filters: TodoFilters): List<Todo> {
        var result = todos.values.toList()
        
        // 완료 상태 필터링
        filters.completed?.let { completed ->
            result = result.filter { it.isCompleted == completed }
        }
        
        // 우선순위 필터링
        filters.priority?.let { priority ->
            result = result.filter { it.priority == priority }
        }
        
        // 정렬 적용
        result = when (filters.sort) {
            TodoSortField.CREATED_AT -> result.sortedBy { it.createdAt }
            TodoSortField.UPDATED_AT -> result.sortedBy { it.updatedAt }
            TodoSortField.PRIORITY -> result.sortedBy { it.priority.value }
            TodoSortField.DUE_DATE -> result.sortedBy { it.dueDate }
            TodoSortField.TITLE -> result.sortedBy { it.title }
        }
        
        // 정렬 순서 적용
        return if (filters.order == SortOrder.DESC) result.reversed() else result
    }
    
    /**
     * ID로 특정 Todo를 삭제
     * @param id 삭제할 Todo의 ID
     * @return 삭제 성공하면 true, 해당 ID가 없으면 false
     */
    fun delete(id: Long): Boolean {
        return todos.remove(id) != null
    }
} 