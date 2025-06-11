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
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import org.slf4j.event.Level
import com.todoapp.routes.todoRoutes
import com.todoapp.models.*
import com.todoapp.utils.FileUploadUtils

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    // 파일 업로드 디렉토리 초기화
    initializeFileUpload()
    
    configurePlugins()
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
                    """{"success": true, "data": {"message": "Todo API v1.0.0", "endpoints": ["GET /api/todos - Get all todos", "POST /api/todos - Create a new todo", "GET /api/todos/{id} - Get todo by ID", "DELETE /api/todos/{id} - Delete todo"]}}"""
                )
            }
            
            // Todo API 라우팅 등록
            todoRoutes()
        }
    }
} 