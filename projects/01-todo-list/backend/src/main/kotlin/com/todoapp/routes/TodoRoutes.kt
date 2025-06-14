package com.todoapp.routes

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.http.*
import com.todoapp.service.TodoService
import com.todoapp.models.*
import com.todoapp.auth.getUserId

/**
 * 협업 Todo API 라우팅을 설정하는 Ktor 확장 함수
 * 프로젝트 기반 권한 검증이 포함된 RESTful API 엔드포인트를 정의
 */
fun Route.todoRoutes(todoService: TodoService = TodoService()) {
    route("/todos") {
        // POST /api/todos - Todo 생성 (프로젝트 기반)
        post {
            try {
                val userId = call.getUserId()
                val request = call.receive<CreateTodoRequest>()
                val todo = todoService.createTodo(request, userId)
                call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = todo))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "잘못된 요청입니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // GET /api/todos/{id} - 특정 Todo 조회 (권한 검증)
        get("/{id}") {
            try {
                val userId = call.getUserId()
                val id = call.parameters["id"]?.toLongOrNull()
                    ?: return@get call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 ID입니다"))
                
                val todo = todoService.getTodoById(id, userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = todo))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.NotFound, ApiErrorResponse.notFound(e.message ?: "Todo를 찾을 수 없습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // PUT /api/todos/{id} - Todo 업데이트 (권한 검증)
        put("/{id}") {
            try {
                val userId = call.getUserId()
                val id = call.parameters["id"]?.toLongOrNull()
                    ?: return@put call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 ID입니다"))
                
                val request = call.receive<UpdateTodoRequest>()
                val updatedTodo = todoService.updateTodo(id, request, userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = updatedTodo))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "잘못된 요청입니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // GET /api/todos - Todo 목록 조회 (사용자 접근 가능한 프로젝트만)
        get {
            try {
                val userId = call.getUserId()
                val completed = call.request.queryParameters["completed"]?.toBooleanStrictOrNull()
                val priority = call.request.queryParameters["priority"]?.let { Priority.fromString(it) }
                val projectId = call.request.queryParameters["projectId"]?.toLongOrNull()
                val assignedTo = call.request.queryParameters["assignedTo"]
                val createdBy = call.request.queryParameters["createdBy"]
                val sort = call.request.queryParameters["sort"]?.let { TodoSortField.valueOf(it.uppercase()) } ?: TodoSortField.CREATED_AT
                val order = call.request.queryParameters["order"]?.let { SortOrder.valueOf(it.uppercase()) } ?: SortOrder.DESC
                
                val filters = TodoFilters(completed, priority, projectId, assignedTo, createdBy, sort, order)
                val todos = todoService.getAllTodos(filters, userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = todos))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // DELETE /api/todos/{id} - Todo 삭제 (권한 검증)
        delete("/{id}") {
            try {
                val userId = call.getUserId()
                val id = call.parameters["id"]?.toLongOrNull()
                    ?: return@delete call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 ID입니다"))
                
                todoService.deleteTodo(id, userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = "Todo가 성공적으로 삭제되었습니다"))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "권한이 없거나 Todo를 찾을 수 없습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // GET /api/todos/project/{projectId} - 특정 프로젝트의 Todo 목록 조회
        get("/project/{projectId}") {
            try {
                val userId = call.getUserId()
                val projectId = call.parameters["projectId"]?.toLongOrNull()
                    ?: return@get call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 프로젝트 ID입니다"))
                
                val completed = call.request.queryParameters["completed"]?.toBooleanStrictOrNull()
                val priority = call.request.queryParameters["priority"]?.let { Priority.fromString(it) }
                val assignedTo = call.request.queryParameters["assignedTo"]
                val createdBy = call.request.queryParameters["createdBy"]
                val sort = call.request.queryParameters["sort"]?.let { TodoSortField.valueOf(it.uppercase()) } ?: TodoSortField.CREATED_AT
                val order = call.request.queryParameters["order"]?.let { SortOrder.valueOf(it.uppercase()) } ?: SortOrder.DESC
                
                val filters = TodoFilters(completed, priority, null, assignedTo, createdBy, sort, order)
                val todos = todoService.getTodosByProject(projectId, filters, userId)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = todos))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "잘못된 요청입니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
    }
} 