package com.todoapp.service

import com.todoapp.storage.InMemoryStorage
import com.todoapp.models.*

/**
 * 프로젝트 관리 비즈니스 로직을 담당하는 서비스 클래스
 * 프로젝트 생성, 수정, 삭제 및 멤버 관리 기능을 제공
 * 역할 기반 권한 검증을 통해 보안을 보장
 */
class ProjectService(
    /**
     * 프로젝트 데이터 저장을 위한 저장소
     * 기본값으로 새로운 InMemoryStorage 인스턴스 생성
     */
    private val storage: InMemoryStorage = InMemoryStorage()
) {
    
    // ==================== 프로젝트 관리 ====================
    
    /**
     * 새로운 프로젝트를 생성
     * @param request 프로젝트 생성 요청 데이터
     * @param ownerId 프로젝트 소유자 ID
     * @return 생성된 Project 객체
     * @throws IllegalArgumentException 유효하지 않은 요청 데이터
     */
    fun createProject(request: CreateProjectRequest, ownerId: String): Project {
        // 요청 데이터 유효성 검증
        request.validate()
        
        // 프로젝트 생성 (소유자 자동 추가됨)
        return storage.saveProject(
            name = request.name,
            description = request.description,
            ownerId = ownerId,
            isPrivate = request.isPrivate ?: false
        )
    }
    
    /**
     * 사용자가 접근 가능한 프로젝트 목록을 조회
     * @param userId 사용자 ID
     * @return 사용자가 멤버인 프로젝트 목록
     */
    fun getUserProjects(userId: String): List<Project> {
        return storage.findProjectsByUserId(userId)
    }
    
    /**
     * ID로 특정 프로젝트를 조회 (권한 검증 포함)
     * @param projectId 조회할 프로젝트 ID
     * @param userId 요청한 사용자 ID
     * @return 해당 Project 객체
     * @throws IllegalArgumentException 프로젝트가 존재하지 않거나 권한 없음
     */
    fun getProjectById(projectId: Long, userId: String): Project {
        require(projectId > 0) { "프로젝트 ID는 양수여야 합니다" }
        
        val project = storage.findProjectById(projectId)
            ?: throw IllegalArgumentException("프로젝트 ID $projectId 를 찾을 수 없습니다")
        
        // 프로젝트 접근 권한 확인
        val membership = storage.findProjectMember(projectId, userId)
            ?: throw IllegalArgumentException("프로젝트에 대한 접근 권한이 없습니다")
        
        return project
    }
    
    /**
     * 프로젝트 정보를 업데이트
     * @param projectId 업데이트할 프로젝트 ID
     * @param request 프로젝트 업데이트 요청 데이터
     * @param userId 요청한 사용자 ID
     * @return 업데이트된 Project 객체
     * @throws IllegalArgumentException 프로젝트가 존재하지 않거나 권한 없음
     */
    fun updateProject(projectId: Long, request: UpdateProjectRequest, userId: String): Project {
        require(projectId > 0) { "프로젝트 ID는 양수여야 합니다" }
        require(!request.isEmpty()) { "업데이트할 데이터가 없습니다" }
        
        // 요청 데이터 유효성 검증
        request.validate()
        
        // 프로젝트 존재 및 권한 확인
        val project = getProjectById(projectId, userId)
        val membership = storage.findProjectMember(projectId, userId)!!
        
        // ADMIN 이상의 권한 필요
        if (!membership.role.canManageProject()) {
            throw IllegalArgumentException("프로젝트 수정 권한이 없습니다")
        }
        
        // 저장소에서 업데이트
        return storage.updateProject(
            id = projectId,
            name = request.name,
            description = request.description,
            isPrivate = request.isPrivate
        ) ?: throw IllegalArgumentException("프로젝트 ID $projectId 를 찾을 수 없습니다")
    }
    
    /**
     * 프로젝트를 삭제 (OWNER만 가능)
     * @param projectId 삭제할 프로젝트 ID
     * @param userId 요청한 사용자 ID
     * @throws IllegalArgumentException 프로젝트가 존재하지 않거나 권한 없음
     */
    fun deleteProject(projectId: Long, userId: String) {
        require(projectId > 0) { "프로젝트 ID는 양수여야 합니다" }
        
        // 프로젝트 존재 및 권한 확인
        val project = getProjectById(projectId, userId)
        val membership = storage.findProjectMember(projectId, userId)!!
        
        // OWNER만 삭제 가능
        if (membership.role != ProjectRole.OWNER) {
            throw IllegalArgumentException("프로젝트 삭제는 소유자만 가능합니다")
        }
        
        val deleted = storage.deleteProject(projectId)
        if (!deleted) {
            throw IllegalArgumentException("프로젝트 ID $projectId 를 찾을 수 없습니다")
        }
    }
    
    // ==================== 멤버 관리 ====================
    
    /**
     * 프로젝트의 모든 멤버를 조회
     * @param projectId 프로젝트 ID
     * @param userId 요청한 사용자 ID
     * @return 프로젝트 멤버 목록
     * @throws IllegalArgumentException 프로젝트가 존재하지 않거나 권한 없음
     */
    fun getProjectMembers(projectId: Long, userId: String): List<ProjectMember> {
        // 프로젝트 접근 권한 확인
        getProjectById(projectId, userId)
        
        return storage.findProjectMembers(projectId)
    }
    
    /**
     * 프로젝트에 새로운 멤버를 초대
     * @param projectId 프로젝트 ID
     * @param request 멤버 초대 요청 데이터
     * @param inviterId 초대하는 사용자 ID
     * @return 생성된 ProjectMember 객체
     * @throws IllegalArgumentException 권한 없음 또는 이미 멤버인 경우
     */
    fun inviteMember(projectId: Long, request: InviteMemberRequest, inviterId: String): ProjectMember {
        // 요청 데이터 유효성 검증
        request.validate()
        
        // 프로젝트 존재 및 권한 확인
        val project = getProjectById(projectId, inviterId)
        val inviterMembership = storage.findProjectMember(projectId, inviterId)!!
        
        // ADMIN 이상의 권한 필요
        if (!inviterMembership.role.canInviteMembers()) {
            throw IllegalArgumentException("멤버 초대 권한이 없습니다")
        }
        
        // 이미 멤버인지 확인
        val existingMember = storage.findProjectMember(projectId, request.userId)
        if (existingMember != null) {
            throw IllegalArgumentException("이미 프로젝트 멤버입니다")
        }
        
        // 초대자보다 높은 권한은 부여할 수 없음
        val requestedRole = request.role ?: ProjectRole.MEMBER
        if (requestedRole.level > inviterMembership.role.level) {
            throw IllegalArgumentException("자신보다 높은 권한을 부여할 수 없습니다")
        }
        
        // 멤버 추가
        return storage.addProjectMember(projectId, request.userId, requestedRole)
    }
    
    /**
     * 프로젝트 멤버의 역할을 변경
     * @param projectId 프로젝트 ID
     * @param targetUserId 역할을 변경할 사용자 ID
     * @param newRole 새로운 역할
     * @param requesterId 요청한 사용자 ID
     * @return 업데이트된 ProjectMember 객체
     * @throws IllegalArgumentException 권한 없음 또는 유효하지 않은 역할 변경
     */
    fun updateMemberRole(projectId: Long, targetUserId: String, newRole: ProjectRole, requesterId: String): ProjectMember {
        // 프로젝트 존재 및 권한 확인
        val project = getProjectById(projectId, requesterId)
        val requesterMembership = storage.findProjectMember(projectId, requesterId)!!
        val targetMembership = storage.findProjectMember(projectId, targetUserId)
            ?: throw IllegalArgumentException("대상 사용자가 프로젝트 멤버가 아닙니다")
        
        // ADMIN 이상의 권한 필요
        if (!requesterMembership.role.canManageMembers()) {
            throw IllegalArgumentException("멤버 역할 변경 권한이 없습니다")
        }
        
        // 자신보다 높은 권한의 멤버는 변경할 수 없음
        if (targetMembership.role.level > requesterMembership.role.level) {
            throw IllegalArgumentException("자신보다 높은 권한의 멤버는 변경할 수 없습니다")
        }
        
        // 자신보다 높은 권한으로 변경할 수 없음
        if (newRole.level > requesterMembership.role.level) {
            throw IllegalArgumentException("자신보다 높은 권한으로 변경할 수 없습니다")
        }
        
        // OWNER 역할은 변경할 수 없음
        if (targetMembership.role == ProjectRole.OWNER) {
            throw IllegalArgumentException("소유자의 역할은 변경할 수 없습니다")
        }
        
        return storage.updateProjectMemberRole(projectId, targetUserId, newRole)
            ?: throw IllegalArgumentException("멤버 역할 업데이트에 실패했습니다")
    }
    
    /**
     * 프로젝트에서 멤버를 제거
     * @param projectId 프로젝트 ID
     * @param targetUserId 제거할 사용자 ID
     * @param requesterId 요청한 사용자 ID
     * @throws IllegalArgumentException 권한 없음 또는 소유자 제거 시도
     */
    fun removeMember(projectId: Long, targetUserId: String, requesterId: String) {
        // 프로젝트 존재 및 권한 확인
        val project = getProjectById(projectId, requesterId)
        val requesterMembership = storage.findProjectMember(projectId, requesterId)!!
        val targetMembership = storage.findProjectMember(projectId, targetUserId)
            ?: throw IllegalArgumentException("대상 사용자가 프로젝트 멤버가 아닙니다")
        
        // 소유자는 제거할 수 없음
        if (targetMembership.role == ProjectRole.OWNER) {
            throw IllegalArgumentException("프로젝트 소유자는 제거할 수 없습니다")
        }
        
        // 자기 자신을 제거하는 경우 (탈퇴)
        if (targetUserId == requesterId) {
            // 소유자는 자기 자신을 제거할 수 없음
            if (requesterMembership.role == ProjectRole.OWNER) {
                throw IllegalArgumentException("프로젝트 소유자는 탈퇴할 수 없습니다")
            }
        } else {
            // 다른 멤버를 제거하는 경우 - ADMIN 이상의 권한 필요
            if (!requesterMembership.role.canManageMembers()) {
                throw IllegalArgumentException("멤버 제거 권한이 없습니다")
            }
            
            // 자신보다 높은 권한의 멤버는 제거할 수 없음
            if (targetMembership.role.level > requesterMembership.role.level) {
                throw IllegalArgumentException("자신보다 높은 권한의 멤버는 제거할 수 없습니다")
            }
        }
        
        val removed = storage.removeProjectMember(projectId, targetUserId)
        if (!removed) {
            throw IllegalArgumentException("멤버 제거에 실패했습니다")
        }
    }
} 