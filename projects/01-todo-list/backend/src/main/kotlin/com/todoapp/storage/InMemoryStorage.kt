package com.todoapp.storage

import com.todoapp.models.*
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant

/**
 * 메모리 기반 협업 Todo 저장소
 * 실제 데이터베이스 없이 HashMap으로 Todo, Project, ProjectMember 데이터를 관리
 * 애플리케이션 재시작 시 데이터는 초기화됨
 */
class InMemoryStorage {
    /**
     * Todo 저장을 위한 메모리 저장소
     * Key: Todo ID, Value: Todo 객체
     */
    private val todos = mutableMapOf<Long, Todo>()
    
    /**
     * Project 저장을 위한 메모리 저장소
     * Key: Project ID, Value: Project 객체
     */
    private val projects = mutableMapOf<Long, Project>()
    
    /**
     * ProjectMember 저장을 위한 메모리 저장소
     * Key: Member ID, Value: ProjectMember 객체
     */
    private val projectMembers = mutableMapOf<Long, ProjectMember>()
    
    /**
     * 새로운 Todo ID 생성을 위한 카운터
     * 1부터 시작하여 순차적으로 증가
     */
    private var nextTodoId = 1L
    
    /**
     * 새로운 Project ID 생성을 위한 카운터
     * 1부터 시작하여 순차적으로 증가
     */
    private var nextProjectId = 1L
    
    /**
     * 새로운 ProjectMember ID 생성을 위한 카운터
     * 1부터 시작하여 순차적으로 증가
     */
    private var nextMemberId = 1L
    
    /**
     * 새로운 Todo를 저장하고 ID를 할당
     * @param title Todo 제목
     * @param description Todo 설명 (선택사항)
     * @param priority Todo 우선순위
     * @param projectId 소속 프로젝트 ID
     * @param createdBy 생성자 사용자 ID
     * @param assignedTo 할당된 사용자 ID (선택사항)
     * @param dueDate Todo 마감일 (선택사항)
     * @return 저장된 Todo 객체 (ID 포함)
     */
    fun saveTodo(
        title: String, 
        description: String?, 
        priority: Priority, 
        projectId: Long,
        createdBy: String,
        assignedTo: String? = null,
        dueDate: Instant?
    ): Todo {
        val now = Clock.System.now()
        val todo = Todo(
            id = nextTodoId,
            title = title,
            description = description,
            isCompleted = false,
            priority = priority,
            projectId = projectId,
            createdBy = createdBy,
            assignedTo = assignedTo,
            createdAt = now,
            updatedAt = now,
            dueDate = dueDate
        )
        
        todos[nextTodoId] = todo
        nextTodoId++
        return todo
    }
    
    /**
     * ID로 특정 Todo를 조회
     * @param id 조회할 Todo의 ID
     * @return 해당 Todo 객체, 없으면 null
     */
    fun findTodoById(id: Long): Todo? {
        return todos[id]
    }
    
    /**
     * 기존 Todo를 업데이트
     * @param id 업데이트할 Todo의 ID
     * @param title 새로운 제목 (null이면 기존값 유지)
     * @param description 새로운 설명 (null이면 기존값 유지)
     * @param isCompleted 새로운 완료 상태 (null이면 기존값 유지)
     * @param priority 새로운 우선순위 (null이면 기존값 유지)
     * @param assignedTo 새로운 할당자 ID (null이면 기존값 유지)
     * @param dueDate 새로운 마감일 (null이면 기존값 유지)
     * @return 업데이트된 Todo 객체, 해당 ID가 없으면 null
     */
    fun updateTodo(
        id: Long, 
        title: String? = null, 
        description: String? = null, 
        isCompleted: Boolean? = null, 
        priority: Priority? = null, 
        assignedTo: String? = null,
        dueDate: Instant? = null
    ): Todo? {
        val existingTodo = todos[id] ?: return null
        
        val updatedTodo = existingTodo.copy(
            title = title ?: existingTodo.title,
            description = description ?: existingTodo.description,
            isCompleted = isCompleted ?: existingTodo.isCompleted,
            priority = priority ?: existingTodo.priority,
            assignedTo = assignedTo ?: existingTodo.assignedTo,
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
    fun findAllTodos(filters: TodoFilters): List<Todo> {
        var result = todos.values.toList()
        
        // 프로젝트 필터링
        filters.projectId?.let { projectId ->
            result = result.filter { it.projectId == projectId }
        }
        
        // 할당자 필터링
        filters.assignedTo?.let { assignedTo ->
            result = result.filter { it.assignedTo == assignedTo }
        }
        
        // 생성자 필터링
        filters.createdBy?.let { createdBy ->
            result = result.filter { it.createdBy == createdBy }
        }
        
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
    fun deleteTodo(id: Long): Boolean {
        return todos.remove(id) != null
    }
    
    // ==================== Project 관련 메서드 ====================
    
    /**
     * 새로운 프로젝트를 생성하고 저장
     * @param name 프로젝트 이름
     * @param description 프로젝트 설명 (선택사항)
     * @param ownerId 프로젝트 소유자 ID
     * @param isPrivate 비공개 프로젝트 여부
     * @return 생성된 Project 객체
     */
    fun saveProject(name: String, description: String?, ownerId: String, isPrivate: Boolean): Project {
        val now = Clock.System.now()
        val project = Project(
            id = nextProjectId,
            name = name,
            description = description,
            ownerId = ownerId,
            isPrivate = isPrivate,
            memberCount = 1, // 소유자 포함
            createdAt = now,
            updatedAt = now
        )
        
        projects[nextProjectId] = project
        
        // 소유자를 프로젝트 멤버로 자동 추가
        val ownerMember = ProjectMember(
            id = nextMemberId,
            projectId = nextProjectId,
            userId = ownerId,
            role = ProjectRole.OWNER,
            joinedAt = now
        )
        projectMembers[nextMemberId] = ownerMember
        
        nextProjectId++
        nextMemberId++
        return project
    }
    
    /**
     * ID로 특정 프로젝트를 조회
     * @param id 조회할 프로젝트 ID
     * @return 해당 Project 객체, 없으면 null
     */
    fun findProjectById(id: Long): Project? {
        return projects[id]
    }
    
    /**
     * 사용자가 접근 가능한 프로젝트 목록을 조회
     * @param userId 사용자 ID
     * @return 사용자가 멤버인 프로젝트 목록
     */
    fun findProjectsByUserId(userId: String): List<Project> {
        val userProjectIds = projectMembers.values
            .filter { it.userId == userId }
            .map { it.projectId }
            .toSet()
        
        return projects.values.filter { it.id in userProjectIds }
    }
    
    /**
     * 프로젝트 정보를 업데이트
     * @param id 업데이트할 프로젝트 ID
     * @param name 새로운 이름 (null이면 기존값 유지)
     * @param description 새로운 설명 (null이면 기존값 유지)
     * @param isPrivate 새로운 공개 설정 (null이면 기존값 유지)
     * @return 업데이트된 Project 객체, 해당 ID가 없으면 null
     */
    fun updateProject(
        id: Long,
        name: String? = null,
        description: String? = null,
        isPrivate: Boolean? = null
    ): Project? {
        val existingProject = projects[id] ?: return null
        
        val updatedProject = existingProject.copy(
            name = name ?: existingProject.name,
            description = description ?: existingProject.description,
            isPrivate = isPrivate ?: existingProject.isPrivate,
            updatedAt = Clock.System.now()
        )
        
        projects[id] = updatedProject
        return updatedProject
    }
    
    /**
     * 프로젝트를 삭제 (관련된 Todo와 멤버도 함께 삭제)
     * @param id 삭제할 프로젝트 ID
     * @return 삭제 성공하면 true, 해당 ID가 없으면 false
     */
    fun deleteProject(id: Long): Boolean {
        val project = projects.remove(id) ?: return false
        
        // 프로젝트 관련 Todo들 삭제
        todos.values.removeAll { it.projectId == id }
        
        // 프로젝트 멤버들 삭제
        projectMembers.values.removeAll { it.projectId == id }
        
        return true
    }
    
    // ==================== ProjectMember 관련 메서드 ====================
    
    /**
     * 프로젝트에 새로운 멤버를 추가
     * @param projectId 프로젝트 ID
     * @param userId 사용자 ID
     * @param role 멤버 역할
     * @return 생성된 ProjectMember 객체
     */
    fun addProjectMember(projectId: Long, userId: String, role: ProjectRole): ProjectMember {
        val now = Clock.System.now()
        val member = ProjectMember(
            id = nextMemberId,
            projectId = projectId,
            userId = userId,
            role = role,
            joinedAt = now
        )
        
        projectMembers[nextMemberId] = member
        
        // 프로젝트 멤버 수 증가
        projects[projectId]?.let { project ->
            projects[projectId] = project.copy(
                memberCount = project.memberCount + 1,
                updatedAt = now
            )
        }
        
        nextMemberId++
        return member
    }
    
    /**
     * 프로젝트의 모든 멤버를 조회
     * @param projectId 프로젝트 ID
     * @return 프로젝트 멤버 목록
     */
    fun findProjectMembers(projectId: Long): List<ProjectMember> {
        return projectMembers.values.filter { it.projectId == projectId }
    }
    
    /**
     * 특정 사용자의 프로젝트 멤버십을 조회
     * @param projectId 프로젝트 ID
     * @param userId 사용자 ID
     * @return ProjectMember 객체, 없으면 null
     */
    fun findProjectMember(projectId: Long, userId: String): ProjectMember? {
        return projectMembers.values.find { 
            it.projectId == projectId && it.userId == userId 
        }
    }
    
    /**
     * 프로젝트 멤버의 역할을 업데이트
     * @param projectId 프로젝트 ID
     * @param userId 사용자 ID
     * @param newRole 새로운 역할
     * @return 업데이트된 ProjectMember 객체, 없으면 null
     */
    fun updateProjectMemberRole(projectId: Long, userId: String, newRole: ProjectRole): ProjectMember? {
        val member = findProjectMember(projectId, userId) ?: return null
        
        val updatedMember = member.copy(role = newRole)
        projectMembers[member.id] = updatedMember
        
        return updatedMember
    }
    
    /**
     * 프로젝트에서 멤버를 제거
     * @param projectId 프로젝트 ID
     * @param userId 사용자 ID
     * @return 제거 성공하면 true, 해당 멤버가 없으면 false
     */
    fun removeProjectMember(projectId: Long, userId: String): Boolean {
        val member = findProjectMember(projectId, userId) ?: return false
        
        projectMembers.remove(member.id)
        
        // 프로젝트 멤버 수 감소
        projects[projectId]?.let { project ->
            projects[projectId] = project.copy(
                memberCount = project.memberCount - 1,
                updatedAt = Clock.System.now()
            )
        }
        
        return true
    }
} 