package com.todoapp.routes

import com.todoapp.auth.JwtConfig
import com.todoapp.models.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

// UserStorage 인스턴스 (글로벌 인메모리 스토리지)
// 나중에 의존성 주입으로 개선 예정
private val userStorage = UserStorage()

/**
 * 인증 관련 라우트를 설정합니다
 */
fun Route.authRoutes() {
    route("/auth") {
        // 회원가입
        post("/register") {
            handleUserRegistration(call)
        }
        
        // 로그인
        post("/login") {
            handleUserLogin(call)
        }
        
        // 현재 사용자 정보 조회 (JWT 인증 필요)
        get("/me") {
            handleCurrentUserInfo(call)
        }
        
        // JWT 토큰 검증 (개발/테스트용)
        post("/verify") {
            handleTokenVerification(call)
        }
        
        // 인증 시스템 상태 확인
        get("/status") {
            handleAuthStatus(call)
        }
    }
}

/**
 * 토큰 검증 요청 데이터
 */
@Serializable
data class TokenVerificationRequest(
    val token: String
)

/**
 * 사용자 회원가입 처리
 */
private suspend fun handleUserRegistration(call: ApplicationCall) {
    try {
        val registrationRequest = call.receive<UserRegistrationRequest>()
        
        // 입력값 검증
        if (registrationRequest.email.isBlank()) {
            call.respond(
                HttpStatusCode.BadRequest,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "VALIDATION_ERROR",
                        message = "이메일은 필수입니다."
                    )
                )
            )
            return
        }
        
        if (registrationRequest.password.length < 6) {
            call.respond(
                HttpStatusCode.BadRequest,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "VALIDATION_ERROR",
                        message = "비밀번호는 최소 6자 이상이어야 합니다."
                    )
                )
            )
            return
        }
        
        if (registrationRequest.name.isBlank()) {
            call.respond(
                HttpStatusCode.BadRequest,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "VALIDATION_ERROR",
                        message = "이름은 필수입니다."
                    )
                )
            )
            return
        }
        
        // 사용자 생성
        val newUser = userStorage.createUser(
            email = registrationRequest.email,
            password = registrationRequest.password,
            name = registrationRequest.name
        )
        
        // JWT 토큰 생성
        val tokenResult = JwtConfig.generateToken(newUser)
        
        if (tokenResult.success && tokenResult.token != null) {
            // 성공 응답
            call.respond(
                HttpStatusCode.Created,
                LoginResponse(
                    token = tokenResult.token,
                    user = userStorage.toUserProfile(newUser)
                )
            )
            
            call.application.log.info("✅ 새 사용자 회원가입 성공: ${newUser.email}")
        } else {
            call.respond(
                HttpStatusCode.InternalServerError,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "TOKEN_GENERATION_ERROR",
                        message = "토큰 생성에 실패했습니다: ${tokenResult.error}"
                    )
                )
            )
        }
        
    } catch (e: IllegalArgumentException) {
        // 이메일 중복 등의 오류
        call.respond(
            HttpStatusCode.Conflict,
            ApiErrorResponse(
                success = false,
                error = ErrorDetails(
                    code = "EMAIL_ALREADY_EXISTS",
                    message = e.message ?: "이미 존재하는 이메일입니다."
                )
            )
        )
    } catch (e: Exception) {
        call.application.log.error("회원가입 오류: ${e.message}", e)
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
 * 사용자 로그인 처리
 */
private suspend fun handleUserLogin(call: ApplicationCall) {
    try {
        val loginRequest = call.receive<LoginRequest>()
        
        // 입력값 검증
        if (loginRequest.email.isBlank() || loginRequest.password.isBlank()) {
            call.respond(
                HttpStatusCode.BadRequest,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "VALIDATION_ERROR",
                        message = "이메일과 비밀번호는 필수입니다."
                    )
                )
            )
            return
        }
        
        // 사용자 인증
        val authenticatedUser = userStorage.authenticateUser(
            email = loginRequest.email,
            password = loginRequest.password
        )
        
        if (authenticatedUser != null) {
            // JWT 토큰 생성
            val tokenResult = JwtConfig.generateToken(authenticatedUser)
            
            if (tokenResult.success && tokenResult.token != null) {
                // 성공 응답
                call.respond(
                    HttpStatusCode.OK,
                    LoginResponse(
                        token = tokenResult.token,
                        user = userStorage.toUserProfile(authenticatedUser)
                    )
                )
                
                call.application.log.info("✅ 사용자 로그인 성공: ${authenticatedUser.email}")
            } else {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiErrorResponse(
                        success = false,
                        error = ErrorDetails(
                            code = "TOKEN_GENERATION_ERROR",
                            message = "토큰 생성에 실패했습니다: ${tokenResult.error}"
                        )
                    )
                )
            }
        } else {
            // 인증 실패
            call.respond(
                HttpStatusCode.Unauthorized,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "INVALID_CREDENTIALS",
                        message = "이메일 또는 비밀번호가 올바르지 않습니다."
                    )
                )
            )
        }
        
    } catch (e: Exception) {
        call.application.log.error("로그인 오류: ${e.message}", e)
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
 * 현재 사용자 정보 조회 처리 (JWT 인증 필요)
 */
private suspend fun handleCurrentUserInfo(call: ApplicationCall) {
    try {
        // Authorization 헤더에서 토큰 추출
        val authHeader = call.request.headers["Authorization"]
        val token = JwtConfig.extractTokenFromHeader(authHeader)
        
        if (token == null) {
            call.respond(
                HttpStatusCode.Unauthorized,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "MISSING_TOKEN",
                        message = "Authorization 헤더에 Bearer 토큰이 필요합니다."
                    )
                )
            )
            return
        }
        
        // 토큰 검증
        val tokenVerification = JwtConfig.verifyToken(token)
        
        if (tokenVerification.isFailure) {
            call.respond(
                HttpStatusCode.Unauthorized,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "INVALID_TOKEN",
                        message = "유효하지 않거나 만료된 토큰입니다."
                    )
                )
            )
            return
        }
        
        val tokenInfo = tokenVerification.getOrThrow()
        
        // 사용자 정보 조회
        val user = userStorage.findById(tokenInfo.userId)
        if (user == null) {
            call.respond(
                HttpStatusCode.NotFound,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "USER_NOT_FOUND",
                        message = "사용자를 찾을 수 없습니다."
                    )
                )
            )
            return
        }
        
        // 사용자 프로필 응답
        call.respond(
            HttpStatusCode.OK,
            ApiResponse(
                success = true,
                data = mapOf(
                    "user" to userStorage.toUserProfile(user),
                    "tokenInfo" to mapOf(
                        "expiresAt" to tokenInfo.expiresAt.epochSeconds,
                        "remainingTime" to JwtConfig.getTokenRemainingTime(tokenInfo)
                    )
                )
            )
        )
        
    } catch (e: Exception) {
        call.application.log.error("현재 사용자 정보 조회 오류: ${e.message}", e)
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
 * JWT 토큰 검증 처리 (개발/테스트용)
 */
private suspend fun handleTokenVerification(call: ApplicationCall) {
    try {
        val verificationRequest = call.receive<TokenVerificationRequest>()
        
        val tokenVerification = JwtConfig.verifyToken(verificationRequest.token)
        
        if (tokenVerification.isSuccess) {
            val tokenInfo = tokenVerification.getOrThrow()
            call.respond(
                HttpStatusCode.OK,
                ApiResponse(
                    success = true,
                    data = mapOf(
                        "valid" to true,
                        "tokenInfo" to tokenInfo,
                        "remainingTime" to JwtConfig.getTokenRemainingTime(tokenInfo),
                        "isExpired" to JwtConfig.isTokenExpired(tokenInfo)
                    )
                )
            )
        } else {
            call.respond(
                HttpStatusCode.BadRequest,
                ApiResponse(
                    success = false,
                    data = mapOf(
                        "valid" to false,
                        "error" to tokenVerification.exceptionOrNull()?.message
                    )
                )
            )
        }
        
    } catch (e: Exception) {
        call.application.log.error("토큰 검증 오류: ${e.message}", e)
        call.respond(
            HttpStatusCode.BadRequest,
            ApiErrorResponse(
                success = false,
                error = ErrorDetails(
                    code = "VERIFICATION_ERROR",
                    message = "토큰 검증 중 오류가 발생했습니다."
                )
            )
        )
    }
}

/**
 * 인증 시스템 상태 확인
 */
private suspend fun handleAuthStatus(call: ApplicationCall) {
    try {
        call.respond(
            HttpStatusCode.OK,
            ApiResponse(
                success = true,
                data = mapOf(
                    "authSystem" to "active",
                    "jwtConfig" to JwtConfig.getConfigInfo(),
                    "userCount" to userStorage.getUserCount(),
                    "endpoints" to listOf(
                        "POST /api/auth/register - 회원가입",
                        "POST /api/auth/login - 로그인",
                        "GET /api/auth/me - 현재 사용자 정보 (JWT 필요)",
                        "POST /api/auth/verify - 토큰 검증",
                        "GET /api/auth/status - 시스템 상태"
                    )
                )
            )
        )
    } catch (e: Exception) {
        call.respond(
            HttpStatusCode.InternalServerError,
            ApiErrorResponse(
                success = false,
                error = ErrorDetails(
                    code = "INTERNAL_ERROR",
                    message = "상태 확인 중 오류가 발생했습니다."
                )
            )
        )
    }
} 