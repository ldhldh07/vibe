package com.todoapp.routes

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.http.*
import com.todoapp.service.ProjectService
import com.todoapp.models.*
import com.todoapp.auth.getUserId

/**
 * 프로젝트 관리 API 라우팅을 설정하는 Ktor 확장 함수
 * 프로젝트 CRUD 및 멤버 관리 RESTful API 엔드포인트를 정의
 */
fun Route.projectRoutes(projectService: ProjectService = ProjectService()) {
    route("/projects") {
        
        // ==================== 프로젝트 관리 ====================
        
        // POST /api/projects - 프로젝트 생성
        post {
            try {
                val userId = call.getUserId()
                val request = call.receive<CreateProjectRequest>()
                val project = projectService.createProject(request, userId)
                call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = project))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "잘못된 요청입니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // GET /api/projects - 사용자의 프로젝트 목록 조회
        get {
            try {
                val userId = call.getUserId()
                val projects = projectService.getUserProjects(userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = projects))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // GET /api/projects/{id} - 특정 프로젝트 조회
        get("/{id}") {
            try {
                val userId = call.getUserId()
                val projectId = call.parameters["id"]?.toLongOrNull()
                    ?: return@get call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 프로젝트 ID입니다"))
                
                val project = projectService.getProjectById(projectId, userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = project))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "프로젝트를 찾을 수 없거나 권한이 없습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // PUT /api/projects/{id} - 프로젝트 정보 업데이트
        put("/{id}") {
            try {
                val userId = call.getUserId()
                val projectId = call.parameters["id"]?.toLongOrNull()
                    ?: return@put call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 프로젝트 ID입니다"))
                
                val request = call.receive<UpdateProjectRequest>()
                val updatedProject = projectService.updateProject(projectId, request, userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = updatedProject))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "잘못된 요청이거나 권한이 없습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // DELETE /api/projects/{id} - 프로젝트 삭제 (OWNER만 가능)
        delete("/{id}") {
            try {
                val userId = call.getUserId()
                val projectId = call.parameters["id"]?.toLongOrNull()
                    ?: return@delete call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 프로젝트 ID입니다"))
                
                projectService.deleteProject(projectId, userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = "프로젝트가 성공적으로 삭제되었습니다"))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "프로젝트를 삭제할 권한이 없습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // ==================== 멤버 관리 ====================
        
        // GET /api/projects/{id}/members - 프로젝트 멤버 목록 조회
        get("/{id}/members") {
            try {
                val userId = call.getUserId()
                val projectId = call.parameters["id"]?.toLongOrNull()
                    ?: return@get call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 프로젝트 ID입니다"))
                
                val members = projectService.getProjectMembers(projectId, userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = members))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "프로젝트를 찾을 수 없거나 권한이 없습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // POST /api/projects/{id}/members - 프로젝트에 멤버 초대
        post("/{id}/members") {
            try {
                val userId = call.getUserId()
                val projectId = call.parameters["id"]?.toLongOrNull()
                    ?: return@post call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 프로젝트 ID입니다"))
                
                val request = call.receive<InviteMemberRequest>()
                val member = projectService.inviteMember(projectId, request, userId)
                call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = member))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "멤버 초대에 실패했습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // PUT /api/projects/{id}/members/{userId}/role - 멤버 역할 변경
        put("/{id}/members/{userId}/role") {
            try {
                val requesterId = call.getUserId()
                val projectId = call.parameters["id"]?.toLongOrNull()
                    ?: return@put call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 프로젝트 ID입니다"))
                
                val targetUserId = call.parameters["userId"]?.toLongOrNull()
                    ?: return@put call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 사용자 ID입니다"))
                
                val request = call.receive<UpdateMemberRoleRequest>()
                val updatedMember = projectService.updateMemberRole(projectId, targetUserId, request.role, requesterId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = updatedMember))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "멤버 역할 변경에 실패했습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // DELETE /api/projects/{id}/members/{userId} - 프로젝트에서 멤버 제거
        delete("/{id}/members/{userId}") {
            try {
                val requesterId = call.getUserId()
                val projectId = call.parameters["id"]?.toLongOrNull()
                    ?: return@delete call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 프로젝트 ID입니다"))
                
                val targetUserId = call.parameters["userId"]?.toLongOrNull()
                    ?: return@delete call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 사용자 ID입니다"))
                
                projectService.removeMember(projectId, targetUserId, requesterId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = "멤버가 성공적으로 제거되었습니다"))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "멤버 제거에 실패했습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // POST /api/projects/{id}/leave - 프로젝트 탈퇴 (자기 자신 제거)
        post("/{id}/leave") {
            try {
                val userId = call.getUserId()
                val projectId = call.parameters["id"]?.toLongOrNull()
                    ?: return@post call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 프로젝트 ID입니다"))
                
                projectService.removeMember(projectId, userId, userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = "프로젝트에서 성공적으로 탈퇴했습니다"))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "프로젝트 탈퇴에 실패했습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
    }
} 