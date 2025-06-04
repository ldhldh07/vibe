package com.todoapp.routes

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.http.*
import com.todoapp.service.TodoService
import com.todoapp.models.*

/**
 * Todo API 라우팅을 설정하는 Ktor 확장 함수
 * RESTful API 엔드포인트를 정의하고 TodoService와 연결
 */
fun Route.todoRoutes(todoService: TodoService = TodoService()) {
    route("/todos") {
        // POST /api/todos - Todo 생성
        post {
            try {
                val request = call.receive<CreateTodoRequest>()
                val todo = todoService.createTodo(request)
                call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = todo))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest(e.message ?: "잘못된 요청입니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // GET /api/todos/{id} - 특정 Todo 조회
        get("/{id}") {
            try {
                val id = call.parameters["id"]?.toLongOrNull()
                    ?: return@get call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 ID입니다"))
                
                val todo = todoService.getTodoById(id)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = todo))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.NotFound, ApiErrorResponse.notFound(e.message ?: "Todo를 찾을 수 없습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // GET /api/todos - Todo 목록 조회
        get {
            try {
                val completed = call.request.queryParameters["completed"]?.toBooleanStrictOrNull()
                val priority = call.request.queryParameters["priority"]?.let { Priority.fromString(it) }
                val sort = call.request.queryParameters["sort"]?.let { TodoSortField.valueOf(it.uppercase()) } ?: TodoSortField.CREATED_AT
                val order = call.request.queryParameters["order"]?.let { SortOrder.valueOf(it.uppercase()) } ?: SortOrder.DESC
                
                val filters = TodoFilters(completed, priority, sort, order)
                val todos = todoService.getAllTodos(filters)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = todos))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
        
        // DELETE /api/todos/{id} - Todo 삭제
        delete("/{id}") {
            try {
                val id = call.parameters["id"]?.toLongOrNull()
                    ?: return@delete call.respond(HttpStatusCode.BadRequest, ApiErrorResponse.badRequest("유효하지 않은 ID입니다"))
                
                todoService.deleteTodo(id)
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = "Todo가 성공적으로 삭제되었습니다"))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.NotFound, ApiErrorResponse.notFound(e.message ?: "Todo를 찾을 수 없습니다"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiErrorResponse.internalError("서버 오류가 발생했습니다"))
            }
        }
    }
} 