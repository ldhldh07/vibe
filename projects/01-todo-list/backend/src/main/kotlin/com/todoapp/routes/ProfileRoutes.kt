package com.todoapp.routes

import com.todoapp.models.*
import com.todoapp.utils.FileUploadUtils
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.io.File

// UserStorage 인스턴스 (글로벌 인메모리 스토리지)
private val userStorage = UserStorage()

/**
 * 프로필 관련 라우트를 설정합니다
 */
fun Route.profileRoutes() {
    route("/users") {
        // 프로필 이미지 업로드
        post("/profile/upload") {
            handleProfileImageUpload(call)
        }
        
        // 프로필 이미지 조회
        get("/profile/image/{userId}") {
            handleProfileImageGet(call)
        }
        
        // 프로필 이미지 삭제
        delete("/profile/image") {
            handleProfileImageDelete(call)
        }
        
        // 사용자 프로필 정보 조회
        get("/profile/{userId}") {
            handleUserProfileGet(call)
        }
    }
}

/**
 * 프로필 이미지 업로드 처리
 */
private suspend fun handleProfileImageUpload(call: ApplicationCall) {
    try {
        // 임시로 userId를 쿼리 파라미터에서 받음 (나중에 JWT에서 추출)
        val userId = call.request.queryParameters["userId"]
        if (userId.isNullOrBlank()) {
            call.respond(
                HttpStatusCode.BadRequest,
                ProfileImageUploadResponse(
                    success = false,
                    message = "사용자 ID가 필요합니다."
                )
            )
            return
        }
        
        // 사용자 존재 확인
        val user = userStorage.findById(userId)
        if (user == null) {
            call.respond(
                HttpStatusCode.NotFound,
                ProfileImageUploadResponse(
                    success = false,
                    message = "존재하지 않는 사용자입니다."
                )
            )
            return
        }
        
        // 멀티파트 데이터 처리
        val multipartData = call.receiveMultipart()
        var fileItem: PartData.FileItem? = null
        
        multipartData.forEachPart { part ->
            when (part) {
                is PartData.FileItem -> {
                    if (part.name == "image" || part.name == "file") {
                        fileItem = part
                    }
                }
                is PartData.FormItem -> {
                    // 추가 폼 데이터가 있다면 여기서 처리
                }
                is PartData.BinaryItem -> {
                    // 바이너리 데이터 처리 (필요시)
                }
                is PartData.BinaryChannelItem -> {
                    // 바이너리 채널 데이터 처리 (필요시)
                }
            }
            part.dispose()
        }
        
        // 파일이 없는 경우
        if (fileItem == null) {
            call.respond(
                HttpStatusCode.BadRequest,
                ProfileImageUploadResponse(
                    success = false,
                    message = "업로드할 이미지 파일이 없습니다."
                )
            )
            return
        }
        
        // 파일 저장
        val uploadResult = FileUploadUtils.saveProfileImage(fileItem!!, userId)
        
        if (uploadResult.success) {
            // User 스토리지에 프로필 이미지 정보 업데이트
            val updatedUser = userStorage.updateProfileImage(
                userId = userId,
                imageUrl = uploadResult.fileUrl,
                fileName = uploadResult.fileName
            )
            
            if (updatedUser != null) {
                call.respond(
                    HttpStatusCode.OK,
                    ProfileImageUploadResponse(
                        success = true,
                        message = "프로필 이미지 업로드 성공",
                        imageUrl = uploadResult.fileUrl
                    )
                )
            } else {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ProfileImageUploadResponse(
                        success = false,
                        message = "사용자 정보 업데이트 실패"
                    )
                )
            }
        } else {
            call.respond(
                HttpStatusCode.BadRequest,
                ProfileImageUploadResponse(
                    success = false,
                    message = uploadResult.message
                )
            )
        }
        
    } catch (e: Exception) {
        call.application.log.error("프로필 이미지 업로드 오류: ${e.message}", e)
        call.respond(
            HttpStatusCode.InternalServerError,
            ProfileImageUploadResponse(
                success = false,
                message = "서버 오류가 발생했습니다: ${e.message}"
            )
        )
    }
}

/**
 * 프로필 이미지 조회 처리
 */
private suspend fun handleProfileImageGet(call: ApplicationCall) {
    try {
        val userId = call.parameters["userId"]
        if (userId.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "사용자 ID가 필요합니다.")
            return
        }
        
        // 사용자 존재 확인
        val user = userStorage.findById(userId)
        if (user == null) {
            call.respond(HttpStatusCode.NotFound, "존재하지 않는 사용자입니다.")
            return
        }
        
        // 프로필 이미지 파일 찾기
        val profileImageFile = FileUploadUtils.findUserProfileImage(userId)
        
        if (profileImageFile != null && profileImageFile.exists()) {
            // 파일 MIME 타입 결정
            val mimeType = FileUploadUtils.getMimeType(profileImageFile.name)
            
            // Content-Type 헤더 설정
            call.response.header("Content-Type", mimeType)
            
            // 파일 응답
            call.respondFile(profileImageFile)
        } else {
            // 기본 프로필 이미지가 있다면 여기서 제공
            // 현재는 404 응답
            call.respond(
                HttpStatusCode.NotFound,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "IMAGE_NOT_FOUND",
                        message = "프로필 이미지를 찾을 수 없습니다."
                    )
                )
            )
        }
        
    } catch (e: Exception) {
        call.application.log.error("프로필 이미지 조회 오류: ${e.message}", e)
        call.respond(HttpStatusCode.InternalServerError, "서버 오류가 발생했습니다.")
    }
}

/**
 * 프로필 이미지 삭제 처리
 */
private suspend fun handleProfileImageDelete(call: ApplicationCall) {
    try {
        // 임시로 userId를 쿼리 파라미터에서 받음 (나중에 JWT에서 추출)
        val userId = call.request.queryParameters["userId"]
        if (userId.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "사용자 ID가 필요합니다.")
            return
        }
        
        // 사용자 존재 확인
        val user = userStorage.findById(userId)
        if (user == null) {
            call.respond(HttpStatusCode.NotFound, "존재하지 않는 사용자입니다.")
            return
        }
        
        // 파일 시스템에서 이미지 삭제
        val deleted = FileUploadUtils.deleteUserProfileImage(userId)
        
        if (deleted) {
            // User 스토리지에서 프로필 이미지 정보 제거
            userStorage.updateProfileImage(
                userId = userId,
                imageUrl = null,
                fileName = null
            )
            
            call.respond(
                HttpStatusCode.OK,
                ApiResponse(
                    success = true,
                    data = mapOf("message" to "프로필 이미지가 삭제되었습니다.")
                )
            )
        } else {
            call.respond(
                HttpStatusCode.NotFound,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "IMAGE_NOT_FOUND",
                        message = "삭제할 프로필 이미지를 찾을 수 없습니다."
                    )
                )
            )
        }
        
    } catch (e: Exception) {
        call.application.log.error("프로필 이미지 삭제 오류: ${e.message}", e)
        call.respond(
            HttpStatusCode.InternalServerError,
            ApiErrorResponse(
                success = false,
                error = ErrorDetails(
                    code = "INTERNAL_ERROR",
                    message = "서버 오류가 발생했습니다."
                )
            )
        )
    }
}

/**
 * 사용자 프로필 정보 조회 처리
 */
private suspend fun handleUserProfileGet(call: ApplicationCall) {
    try {
        val userId = call.parameters["userId"]
        if (userId.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "사용자 ID가 필요합니다.")
            return
        }
        
        val user = userStorage.findById(userId)
        if (user == null) {
            call.respond(
                HttpStatusCode.NotFound,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "USER_NOT_FOUND",
                        message = "존재하지 않는 사용자입니다."
                    )
                )
            )
            return
        }
        
        val userProfile = userStorage.toUserProfile(user)
        call.respond(
            HttpStatusCode.OK,
            ApiResponse(
                success = true,
                data = userProfile
            )
        )
        
    } catch (e: Exception) {
        call.application.log.error("사용자 프로필 조회 오류: ${e.message}", e)
        call.respond(
            HttpStatusCode.InternalServerError,
            ApiErrorResponse(
                success = false,
                error = ErrorDetails(
                    code = "INTERNAL_ERROR",
                    message = "서버 오류가 발생했습니다."
                )
            )
        )
    }
}

/**
 * 테스트용 임시 사용자 생성 함수
 * (실제 사용 시에는 회원가입 API를 통해 생성)
 */
fun createTestUser(): String {
    return try {
        val testUser = userStorage.createUser(
            email = "test@example.com",
            password = "testpassword123",
            name = "테스트 사용자"
        )
        testUser.id
    } catch (e: Exception) {
        // 이미 존재하는 경우 기존 사용자 반환
        userStorage.findByEmail("test@example.com")?.id ?: ""
    }
} 