package com.todoapp.service

import com.todoapp.storage.InMemoryStorage
import com.todoapp.models.*

/**
 * 협업 Todo 비즈니스 로직을 담당하는 서비스 클래스
 * InMemoryStorage를 사용하여 Todo CRUD 작업을 처리
 * 프로젝트 기반 권한 검증 및 비즈니스 규칙을 적용
 */
class TodoService(
    /**
     * Todo 데이터 저장을 위한 저장소
     * 기본값으로 새로운 InMemoryStorage 인스턴스 생성
     */
    private val storage: InMemoryStorage = InMemoryStorage()
) {
    /**
     * 새로운 Todo를 생성 (프로젝트 기반)
     * @param request Todo 생성 요청 데이터
     * @param userId 요청한 사용자 ID
     * @return 생성된 Todo 객체
     * @throws IllegalArgumentException 유효하지 않은 요청 데이터 또는 권한 없음
     */
    fun createTodo(request: CreateTodoRequest, userId: String): Todo {
        // 요청 데이터 유효성 검증
        request.validate()
        
        // 프로젝트 존재 및 권한 확인
        val project = storage.findProjectById(request.projectId)
            ?: throw IllegalArgumentException("프로젝트 ID ${request.projectId}를 찾을 수 없습니다")
        
        val membership = storage.findProjectMember(request.projectId, userId)
            ?: throw IllegalArgumentException("프로젝트에 대한 접근 권한이 없습니다")
        
        // MEMBER 이상의 권한 필요 (Todo 생성 권한)
        if (!membership.role.canCreateTodo()) {
            throw IllegalArgumentException("Todo 생성 권한이 없습니다")
        }
        
        // 할당자 검증 (지정된 경우)
        request.assignedTo?.let { assigneeId ->
            val assigneeMembership = storage.findProjectMember(request.projectId, assigneeId)
                ?: throw IllegalArgumentException("할당하려는 사용자가 프로젝트 멤버가 아닙니다")
        }
        
        // 기본값 적용
        val priority = request.priority ?: Priority.MEDIUM
        
        // 저장소에 저장
        return storage.saveTodo(
            title = request.title,
            description = request.description,
            priority = priority,
            projectId = request.projectId,
            createdBy = userId,
            assignedTo = request.assignedTo,
            dueDate = request.dueDate
        )
    }
    
    /**
     * ID로 특정 Todo를 조회 (권한 검증 포함)
     * @param id 조회할 Todo의 ID
     * @param userId 요청한 사용자 ID
     * @return 해당 Todo 객체
     * @throws IllegalArgumentException Todo가 존재하지 않거나 권한 없음
     */
    fun getTodoById(id: Long, userId: String): Todo {
        require(id > 0) { "ID는 양수여야 합니다" }
        
        val todo = storage.findTodoById(id)
            ?: throw IllegalArgumentException("ID $id 에 해당하는 Todo를 찾을 수 없습니다")
        
        // 프로젝트 접근 권한 확인
        val membership = storage.findProjectMember(todo.projectId, userId)
            ?: throw IllegalArgumentException("Todo에 대한 접근 권한이 없습니다")
        
        return todo
    }
    
    /**
     * 기존 Todo를 업데이트 (권한 검증 포함)
     * @param id 업데이트할 Todo의 ID
     * @param request Todo 업데이트 요청 데이터
     * @param userId 요청한 사용자 ID
     * @return 업데이트된 Todo 객체
     * @throws IllegalArgumentException Todo가 존재하지 않거나 권한 없음
     */
    fun updateTodo(id: Long, request: UpdateTodoRequest, userId: String): Todo {
        require(id > 0) { "ID는 양수여야 합니다" }
        require(!request.isEmpty()) { "업데이트할 데이터가 없습니다" }
        
        // 요청 데이터 유효성 검증
        request.validate()
        
        // 기존 Todo 조회 및 권한 확인
        val existingTodo = getTodoById(id, userId)
        val membership = storage.findProjectMember(existingTodo.projectId, userId)!!
        
        // 수정 권한 확인 (생성자, 할당자, 또는 MEMBER 이상)
        val canEdit = existingTodo.isCreatedBy(userId) || 
                     existingTodo.isAssignedTo(userId) || 
                     membership.role.canEditTodo()
        
        if (!canEdit) {
            throw IllegalArgumentException("Todo 수정 권한이 없습니다")
        }
        
        // 할당자 변경 검증 (지정된 경우)
        request.assignedTo?.let { assigneeId ->
            val assigneeMembership = storage.findProjectMember(existingTodo.projectId, assigneeId)
                ?: throw IllegalArgumentException("할당하려는 사용자가 프로젝트 멤버가 아닙니다")
        }
        
        // 저장소에서 업데이트
        return storage.updateTodo(
            id = id,
            title = request.title,
            description = request.description,
            isCompleted = request.isCompleted,
            priority = request.priority,
            assignedTo = request.assignedTo,
            dueDate = request.dueDate
        ) ?: throw IllegalArgumentException("ID $id 에 해당하는 Todo를 찾을 수 없습니다")
    }
    
    /**
     * 필터 조건에 따라 Todo 목록을 조회 (사용자 접근 가능한 프로젝트만)
     * @param filters 필터링 및 정렬 조건 (null이면 기본값 사용)
     * @param userId 요청한 사용자 ID
     * @return 조건에 맞는 Todo 목록
     */
    fun getAllTodos(filters: TodoFilters? = null, userId: String): List<Todo> {
        val actualFilters = filters ?: TodoFilters()
        
        // 사용자가 접근 가능한 프로젝트 ID 목록 조회
        val userProjects = storage.findProjectsByUserId(userId)
        val accessibleProjectIds = userProjects.map { it.id }.toSet()
        
        // 모든 Todo 조회 후 접근 가능한 프로젝트만 필터링
        val allTodos = storage.findAllTodos(actualFilters)
        return allTodos.filter { it.projectId in accessibleProjectIds }
    }
    
    /**
     * 특정 프로젝트의 Todo 목록을 조회
     * @param projectId 프로젝트 ID
     * @param filters 필터링 및 정렬 조건 (null이면 기본값 사용)
     * @param userId 요청한 사용자 ID
     * @return 조건에 맞는 Todo 목록
     */
    fun getTodosByProject(projectId: Long, filters: TodoFilters? = null, userId: String): List<Todo> {
        // 프로젝트 접근 권한 확인
        val membership = storage.findProjectMember(projectId, userId)
            ?: throw IllegalArgumentException("프로젝트에 대한 접근 권한이 없습니다")
        
        val actualFilters = (filters ?: TodoFilters()).copy(projectId = projectId)
        return storage.findAllTodos(actualFilters)
    }
    
    /**
     * ID로 특정 Todo를 삭제 (권한 검증 포함)
     * @param id 삭제할 Todo의 ID
     * @param userId 요청한 사용자 ID
     * @throws IllegalArgumentException Todo가 존재하지 않거나 권한 없음
     */
    fun deleteTodo(id: Long, userId: String) {
        require(id > 0) { "ID는 양수여야 합니다" }
        
        // 기존 Todo 조회 및 권한 확인
        val existingTodo = getTodoById(id, userId)
        val membership = storage.findProjectMember(existingTodo.projectId, userId)!!
        
        // 삭제 권한 확인 (생성자 또는 ADMIN 이상)
        val canDelete = existingTodo.isCreatedBy(userId) || membership.role.canDeleteTodo()
        
        if (!canDelete) {
            throw IllegalArgumentException("Todo 삭제 권한이 없습니다")
        }
        
        val deleted = storage.deleteTodo(id)
        if (!deleted) {
            throw IllegalArgumentException("ID $id 에 해당하는 Todo를 찾을 수 없습니다")
        }
    }
} 