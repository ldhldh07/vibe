package com.todoapp.models

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

/**
 * Todo 우선순위 열거형
 * 할 일의 중요도를 나타내는 세 가지 단계
 */
@Serializable
enum class Priority(val displayName: String, val value: Int) {
    LOW("낮음", 1),
    MEDIUM("보통", 2), 
    HIGH("높음", 3);
    
    companion object {
        /**
         * 문자열로부터 Priority 값을 찾아 반환
         * @param value 우선순위 문자열 (대소문자 무관)
         * @return 해당하는 Priority 값, 없으면 MEDIUM
         */
        fun fromString(value: String): Priority {
            return values().find { 
                it.name.equals(value, ignoreCase = true) 
            } ?: MEDIUM
        }
    }
}

/**
 * Todo 메인 엔티티
 * 데이터베이스에 저장되는 완전한 Todo 객체
 */
@Serializable
data class Todo(
    val id: Long,                           // 고유 식별자
    val title: String,                      // Todo 제목 (1-255자)
    val description: String? = null,        // Todo 설명 (선택사항, 최대 1000자)
    val isCompleted: Boolean = false,       // 완료 상태
    val priority: Priority = Priority.MEDIUM, // 우선순위 (기본값: 보통)
    val projectId: Long,                    // 소속 프로젝트 ID
    val createdBy: String,                  // 생성자 사용자 ID
    val assignedTo: String? = null,         // 할당된 사용자 ID (선택사항)
    val createdAt: Instant,                 // 생성 시간 (ISO 8601)
    val updatedAt: Instant,                 // 수정 시간 (ISO 8601)
    val dueDate: Instant? = null           // 마감일 (선택사항, ISO 8601)
) {
    /**
     * Todo가 마감일을 넘겼는지 확인
     * @return 현재 시간이 마감일을 넘었으면 true
     */
    fun isOverdue(): Boolean {
        return dueDate?.let { due ->
            kotlinx.datetime.Clock.System.now() > due
        } ?: false
    }
    
    /**
     * Todo의 완료 여부와 마감 상태를 종합한 상태 반환
     * @return Todo의 현재 상태
     */
    fun getStatus(): TodoStatus {
        return when {
            isCompleted -> TodoStatus.COMPLETED
            isOverdue() -> TodoStatus.OVERDUE
            else -> TodoStatus.PENDING
        }
    }

    /**
     * Todo가 특정 사용자에게 할당되었는지 확인
     * @param userId 확인할 사용자 ID
     * @return 할당되었으면 true
     */
    fun isAssignedTo(userId: String): Boolean {
        return assignedTo == userId
    }

    /**
     * Todo가 특정 사용자에 의해 생성되었는지 확인
     * @param userId 확인할 사용자 ID
     * @return 생성자가 맞으면 true
     */
    fun isCreatedBy(userId: String): Boolean {
        return createdBy == userId
    }

    /**
     * Todo가 할당되지 않은 상태인지 확인
     * @return 할당되지 않았으면 true
     */
    fun isUnassigned(): Boolean {
        return assignedTo == null
    }
}

/**
 * Todo 상태 열거형
 * Todo의 현재 상태를 나타냄
 */
@Serializable
enum class TodoStatus(val displayName: String) {
    PENDING("진행중"),
    COMPLETED("완료"),
    OVERDUE("기한초과")
}

/**
 * Todo 생성 요청 DTO
 * 새로운 Todo를 생성할 때 클라이언트에서 전송하는 데이터
 */
@Serializable
data class CreateTodoRequest(
    val title: String,                      // 필수: Todo 제목
    val description: String? = null,        // 선택: Todo 설명
    val priority: Priority? = null,         // 선택: 우선순위 (기본값은 서비스에서 MEDIUM 설정)
    val projectId: Long,                    // 필수: 프로젝트 ID
    val assignedTo: String? = null,         // 선택: 할당할 사용자 ID
    val dueDate: Instant? = null           // 선택: 마감일
) {
    /**
     * 요청 데이터 유효성 검증
     * @throws IllegalArgumentException 유효하지 않은 데이터가 있을 경우
     */
    fun validate() {
        require(title.isNotBlank()) { "제목은 필수입니다" }
        require(title.length <= 255) { "제목은 255자를 초과할 수 없습니다" }
        
        description?.let { desc ->
            require(desc.length <= 1000) { "설명은 1000자를 초과할 수 없습니다" }
        }
        
        // XSS 방지를 위한 기본적인 HTML 태그 검증
        require(!title.contains("<script>", ignoreCase = true)) { "제목에 허용되지 않는 문자가 포함되어 있습니다" }
        description?.let { desc ->
            require(!desc.contains("<script>", ignoreCase = true)) { "설명에 허용되지 않는 문자가 포함되어 있습니다" }
        }
        
        // 마감일이 과거가 아닌지 확인
        dueDate?.let { due ->
            require(due > kotlinx.datetime.Clock.System.now()) { "마감일은 현재 시간보다 이후여야 합니다" }
        }
    }
}

/**
 * Todo 수정 요청 DTO
 * 기존 Todo를 수정할 때 클라이언트에서 전송하는 데이터
 * 모든 필드가 선택사항이므로 부분 업데이트 가능
 */
@Serializable
data class UpdateTodoRequest(
    val title: String? = null,              // 선택: 새로운 제목
    val description: String? = null,        // 선택: 새로운 설명
    val isCompleted: Boolean? = null,       // 선택: 완료 상태 변경
    val priority: Priority? = null,         // 선택: 새로운 우선순위
    val assignedTo: String? = null,         // 선택: 새로운 할당자 ID
    val dueDate: Instant? = null           // 선택: 새로운 마감일
) {
    /**
     * 수정 요청이 비어있는지 확인
     * @return 모든 필드가 null이면 true
     */
    fun isEmpty(): Boolean {
        return title == null && description == null && isCompleted == null && 
               priority == null && assignedTo == null && dueDate == null
    }
    
    /**
     * 요청 데이터 유효성 검증
     * @throws IllegalArgumentException 유효하지 않은 데이터가 있을 경우
     */
    fun validate() {
        title?.let { t ->
            require(t.isNotBlank()) { "제목은 비어있을 수 없습니다" }
            require(t.length <= 255) { "제목은 255자를 초과할 수 없습니다" }
            require(!t.contains("<script>", ignoreCase = true)) { "제목에 허용되지 않는 문자가 포함되어 있습니다" }
        }
        
        description?.let { desc ->
            require(desc.length <= 1000) { "설명은 1000자를 초과할 수 없습니다" }
            require(!desc.contains("<script>", ignoreCase = true)) { "설명에 허용되지 않는 문자가 포함되어 있습니다" }
        }
        
        // 마감일 검증 (완료된 Todo가 아닌 경우만)
        if (isCompleted != true) {
            dueDate?.let { due ->
                require(due > kotlinx.datetime.Clock.System.now()) { "마감일은 현재 시간보다 이후여야 합니다" }
            }
        }
    }
}

/**
 * Todo 목록 조회를 위한 필터 DTO
 * 클라이언트에서 Todo 목록을 필터링하고 정렬할 때 사용
 */
@Serializable
data class TodoFilters(
    val completed: Boolean? = null,         // 완료 상태 필터 (null이면 전체)
    val priority: Priority? = null,         // 우선순위 필터 (null이면 전체)
    val projectId: Long? = null,            // 프로젝트 필터 (null이면 전체)
    val assignedTo: String? = null,         // 할당자 필터 (null이면 전체)
    val createdBy: String? = null,          // 생성자 필터 (null이면 전체)
    val sort: TodoSortField = TodoSortField.CREATED_AT, // 정렬 기준
    val order: SortOrder = SortOrder.DESC   // 정렬 순서
)

/**
 * Todo 정렬 필드 열거형
 */
@Serializable
enum class TodoSortField {
    CREATED_AT,     // 생성일
    UPDATED_AT,     // 수정일
    PRIORITY,       // 우선순위
    DUE_DATE,       // 마감일
    TITLE           // 제목 (알파벳순)
}

/**
 * 정렬 순서 열거형
 */
@Serializable
enum class SortOrder {
    ASC,    // 오름차순
    DESC    // 내림차순
} 