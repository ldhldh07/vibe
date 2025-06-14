package com.todoapp

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.plugins.partialcontent.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import org.slf4j.event.Level
import com.todoapp.routes.todoRoutes
import com.todoapp.routes.profileRoutes
import com.todoapp.routes.authRoutes
import com.todoapp.routes.projectRoutes
import com.todoapp.models.*
import com.todoapp.utils.FileUploadUtils
import com.todoapp.auth.JwtConfig

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    // 파일 업로드 디렉토리 초기화
    initializeFileUpload()
    
    configurePlugins()
    configureAuthentication()
    configureRouting()
}

/**
 * 파일 업로드 시스템을 초기화합니다
 */
fun Application.initializeFileUpload() {
    try {
        val initialized = FileUploadUtils.initializeUploadDirectories()
        if (initialized) {
            log.info("✅ 파일 업로드 시스템 초기화 완료")
        } else {
            log.error("❌ 파일 업로드 시스템 초기화 실패")
        }
    } catch (e: Exception) {
        log.error("❌ 파일 업로드 시스템 초기화 중 오류 발생: ${e.message}")
    }
}

/**
 * JWT 인증 시스템을 설정합니다
 */
fun Application.configureAuthentication() {
    install(Authentication) {
        jwt("auth-jwt") {
            // JWT 검증기 설정
            verifier(JwtConfig.getVerifier())
            
            // JWT 설정 정보
            realm = "Todo App JWT Realm"
            
            // JWT 토큰 검증 및 Principal 생성
            validate { credential ->
                try {
                    // JWT payload에서 사용자 정보 추출
                    val userId = credential.payload.getClaim("userId").asString()
                    val email = credential.payload.getClaim("email").asString()
                    
                    if (userId != null && email != null) {
                        // JWTPrincipal 반환 (Ktor 표준)
                        JWTPrincipal(credential.payload)
                    } else {
                        this@configureAuthentication.log.warn("JWT 토큰에 필수 클레임이 누락됨: userId=$userId, email=$email")
                        null
                    }
                } catch (e: Exception) {
                    this@configureAuthentication.log.error("JWT Principal 생성 실패: ${e.message}")
                    null
                }
            }
            
            // 인증 실패시 응답
            challenge { _, _ ->
                call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiErrorResponse(
                        success = false,
                        error = ErrorDetails(
                            code = "AUTHENTICATION_REQUIRED",
                            message = "유효한 JWT 토큰이 필요합니다."
                        )
                    )
                )
            }
        }
    }
    
    log.info("✅ JWT 인증 시스템 설정 완료")
}

fun Application.configurePlugins() {
    // JSON Content Negotiation
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
        })
    }
    
    // CORS Configuration
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.AccessControlAllowOrigin)
        allowHeader(HttpHeaders.AccessControlAllowHeaders)
        
        // Allow Next.js development server
        allowHost("localhost:3000")
        allowHost("127.0.0.1:3000")
        
        // Allow any origin in development (remove in production)
        anyHost()
        
        allowCredentials = true
        allowNonSimpleContentTypes = true
    }
    
    // Default Headers
    install(DefaultHeaders) {
        header("X-Engine", "Ktor")
        header("X-API-Version", "1.0.0")
    }
    
    // Partial Content (파일 다운로드 지원)
    install(PartialContent)
    
    // Auto Head Response (HEAD 요청 자동 처리)
    install(AutoHeadResponse)
    
    // Status Pages (Error Handling)
    install(StatusPages) {
        exception<IllegalArgumentException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "VALIDATION_ERROR",
                        message = cause.message ?: "Invalid request data"
                    )
                )
            )
        }
        
        exception<NoSuchElementException> { call, cause ->
            call.respond(
                HttpStatusCode.NotFound,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "NOT_FOUND",
                        message = cause.message ?: "Resource not found"
                    )
                )
            )
        }
        
        exception<Throwable> { call, cause ->
            this@configurePlugins.log.error("Unhandled exception", cause)
            call.respond(
                HttpStatusCode.InternalServerError,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "INTERNAL_ERROR",
                        message = "An unexpected error occurred"
                    )
                )
            )
        }
        
        status(HttpStatusCode.NotFound) { call, status ->
            call.respond(
                status,
                ApiErrorResponse(
                    success = false,
                    error = ErrorDetails(
                        code = "NOT_FOUND",
                        message = "The requested resource was not found"
                    )
                )
            )
        }
    }
}

fun Application.configureRouting() {
    routing {
        // Health check endpoint
        get("/") {
            call.respond(
                ApiResponse(
                    success = true,
                    data = mapOf(
                        "message" to "Todo API Server",
                        "version" to "1.0.0",
                        "status" to "running"
                    )
                )
            )
        }
        
        get("/health") {
            call.respond(
                HttpStatusCode.OK,
                """{"success": true, "data": {"status": "healthy", "timestamp": ${System.currentTimeMillis()}}}"""
            )
        }
        
        // API routes
        route("/api") {
            get("/") {
                call.respond(
                    HttpStatusCode.OK,
                    """{"success": true, "data": {"message": "Todo API v1.0.0 with JWT Authentication", "endpoints": ["POST /api/auth/register - 회원가입", "POST /api/auth/login - 로그인", "GET /api/auth/me - 현재 사용자 (JWT)", "GET /api/todos - 모든 할일 (JWT)", "POST /api/todos - 할일 생성 (JWT)", "POST /api/users/profile/upload - 프로필 이미지 업로드 (JWT)"]}}"""
                )
            }
            
            // 🔓 공개 API (인증 불필요)
            authRoutes()
            
            // 🔐 보호된 API (JWT 인증 필요)
            authenticate("auth-jwt") {
                // Todo API 라우팅 등록 (인증 필요)
                todoRoutes()
                
                // Project API 라우팅 등록 (인증 필요)
                projectRoutes()
                
                // 프로필 API 라우팅 등록 (인증 필요)
                profileRoutes()
            }
        }
    }
} 