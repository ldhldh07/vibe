package com.todoapp.models

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

/**
 * 프로젝트 멤버 역할 열거형
 * 프로젝트 내에서 사용자의 권한을 정의
 */
@Serializable
enum class ProjectRole(val displayName: String, val level: Int) {
    VIEWER("뷰어", 1),      // 읽기 전용
    MEMBER("멤버", 2),      // Todo 생성/수정/완료
    ADMIN("관리자", 3),     // 멤버 관리, 프로젝트 설정
    OWNER("소유자", 4);     // 모든 권한, 프로젝트 삭제

    /**
     * 특정 역할보다 높은 권한을 가지는지 확인
     */
    fun hasHigherPermissionThan(other: ProjectRole): Boolean {
        return this.level > other.level
    }

    /**
     * 특정 역할 이상의 권한을 가지는지 확인
     */
    fun hasPermissionOf(required: ProjectRole): Boolean {
        return this.level >= required.level
    }

    companion object {
        /**
         * 문자열로부터 ProjectRole 값을 찾아 반환
         */
        fun fromString(value: String): ProjectRole {
            return values().find { 
                it.name.equals(value, ignoreCase = true) 
            } ?: MEMBER
        }
    }
}

/**
 * 프로젝트 메인 엔티티
 * Todo들을 그룹화하는 워크스페이스 역할
 */
@Serializable
data class Project(
    val id: Long,                           // 고유 식별자
    val name: String,                       // 프로젝트 이름 (1-100자)
    val description: String? = null,        // 프로젝트 설명 (선택사항, 최대 500자)
    val ownerId: Long,                      // 프로젝트 소유자 ID
    val isPrivate: Boolean = false,         // 비공개 프로젝트 여부
    val createdAt: Instant,                 // 생성 시간
    val updatedAt: Instant,                 // 수정 시간
    val memberCount: Int = 1,               // 멤버 수 (캐시용)
    val todoCount: Int = 0                  // Todo 수 (캐시용)
) {
    /**
     * 프로젝트가 개인 프로젝트인지 확인
     * 개인 프로젝트는 멤버가 소유자 1명뿐인 프로젝트
     */
    fun isPersonalProject(): Boolean {
        return memberCount == 1
    }

    /**
     * 프로젝트 이름 유효성 검증
     */
    fun validateName(): Boolean {
        return name.isNotBlank() && name.length <= 100
    }
}

/**
 * 프로젝트 멤버 엔티티
 * 프로젝트와 사용자 간의 멤버십 관계를 나타냄
 */
@Serializable
data class ProjectMember(
    val id: Long,                           // 고유 식별자
    val projectId: Long,                    // 프로젝트 ID
    val userId: Long,                       // 사용자 ID
    val role: ProjectRole,                  // 멤버 역할
    val joinedAt: Instant,                  // 참여 시간
    val invitedBy: Long? = null,           // 초대한 사용자 ID (선택사항)
    val isActive: Boolean = true            // 활성 상태 (탈퇴 시 false)
) {
    /**
     * 특정 작업에 대한 권한이 있는지 확인
     */
    fun canPerformAction(requiredRole: ProjectRole): Boolean {
        return isActive && role.hasPermissionOf(requiredRole)
    }

    /**
     * 다른 멤버를 관리할 수 있는지 확인
     */
    fun canManageMember(targetMember: ProjectMember): Boolean {
        return isActive && 
               role.hasHigherPermissionThan(targetMember.role) &&
               role.hasPermissionOf(ProjectRole.ADMIN)
    }
}

/**
 * 프로젝트 생성 요청 DTO
 */
@Serializable
data class CreateProjectRequest(
    val name: String,                       // 필수: 프로젝트 이름
    val description: String? = null,        // 선택: 프로젝트 설명
    val isPrivate: Boolean = false          // 선택: 비공개 여부 (기본값: 공개)
) {
    /**
     * 요청 데이터 유효성 검증
     */
    fun validate() {
        require(name.isNotBlank()) { "프로젝트 이름은 필수입니다" }
        require(name.length <= 100) { "프로젝트 이름은 100자를 초과할 수 없습니다" }
        
        description?.let { desc ->
            require(desc.length <= 500) { "프로젝트 설명은 500자를 초과할 수 없습니다" }
        }

        // XSS 방지를 위한 기본적인 HTML 태그 검증
        require(!name.contains("<script>", ignoreCase = true)) { "프로젝트 이름에 허용되지 않는 문자가 포함되어 있습니다" }
        description?.let { desc ->
            require(!desc.contains("<script>", ignoreCase = true)) { "프로젝트 설명에 허용되지 않는 문자가 포함되어 있습니다" }
        }
    }
}

/**
 * 프로젝트 수정 요청 DTO
 */
@Serializable
data class UpdateProjectRequest(
    val name: String? = null,               // 선택: 새로운 프로젝트 이름
    val description: String? = null,        // 선택: 새로운 프로젝트 설명
    val isPrivate: Boolean? = null          // 선택: 새로운 비공개 설정
) {
    /**
     * 수정 요청이 비어있는지 확인
     */
    fun isEmpty(): Boolean {
        return name == null && description == null && isPrivate == null
    }

    /**
     * 요청 데이터 유효성 검증
     */
    fun validate() {
        name?.let { n ->
            require(n.isNotBlank()) { "프로젝트 이름은 비어있을 수 없습니다" }
            require(n.length <= 100) { "프로젝트 이름은 100자를 초과할 수 없습니다" }
            require(!n.contains("<script>", ignoreCase = true)) { "프로젝트 이름에 허용되지 않는 문자가 포함되어 있습니다" }
        }

        description?.let { desc ->
            require(desc.length <= 500) { "프로젝트 설명은 500자를 초과할 수 없습니다" }
            require(!desc.contains("<script>", ignoreCase = true)) { "프로젝트 설명에 허용되지 않는 문자가 포함되어 있습니다" }
        }
    }
}

/**
 * 멤버 초대 요청 DTO
 */
@Serializable
data class InviteMemberRequest(
    val email: String,                      // 초대할 사용자 이메일
    val role: ProjectRole = ProjectRole.MEMBER // 부여할 역할 (기본값: 멤버)
) {
    /**
     * 요청 데이터 유효성 검증
     */
    fun validate() {
        require(email.isNotBlank()) { "이메일은 필수입니다" }
        require(email.contains("@") && email.contains(".")) { "올바른 이메일 형식이 아닙니다" }
        require(role != ProjectRole.OWNER) { "소유자 역할은 직접 부여할 수 없습니다" }
    }
}

/**
 * 멤버 역할 변경 요청 DTO
 */
@Serializable
data class UpdateMemberRoleRequest(
    val role: ProjectRole                   // 새로운 역할
) {
    /**
     * 요청 데이터 유효성 검증
     */
    fun validate() {
        require(role != ProjectRole.OWNER) { "소유자 역할은 직접 부여할 수 없습니다" }
    }
}

/**
 * 프로젝트 멤버 정보 응답 DTO
 * 사용자 정보와 함께 반환되는 확장된 멤버 정보
 */
@Serializable
data class ProjectMemberInfo(
    val id: Long,                           // 멤버 ID
    val projectId: Long,                    // 프로젝트 ID
    val userId: Long,                       // 사용자 ID
    val userEmail: String,                  // 사용자 이메일
    val userName: String,                   // 사용자 이름
    val role: ProjectRole,                  // 멤버 역할
    val joinedAt: Instant,                  // 참여 시간
    val invitedBy: Long? = null,           // 초대한 사용자 ID
    val isActive: Boolean = true            // 활성 상태
)

/**
 * 프로젝트 상세 정보 응답 DTO
 * 프로젝트 정보와 현재 사용자의 역할 정보를 포함
 */
@Serializable
data class ProjectDetailInfo(
    val project: Project,                   // 프로젝트 기본 정보
    val currentUserRole: ProjectRole,       // 현재 사용자의 역할
    val members: List<ProjectMemberInfo>? = null, // 멤버 목록 (권한에 따라 선택적)
    val recentActivity: List<String>? = null // 최근 활동 (추후 구현)
) 