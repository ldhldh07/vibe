package com.todoapp.models

import kotlinx.serialization.Serializable

/**
 * 성공적인 API 응답을 위한 데이터 클래스
 * @param T 응답 데이터의 타입
 * @property success 요청 성공 여부 (항상 true)
 * @property data 실제 응답 데이터
 * @property count 목록 데이터의 경우 총 개수 (선택적)
 */
@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T,
    val count: Int? = null
) {
    companion object {
        /**
         * 성공 응답을 생성하는 편의 메소드
         */
        fun <T> success(data: T, count: Int? = null): ApiResponse<T> {
            return ApiResponse(success = true, data = data, count = count)
        }
    }
}

/**
 * 에러 API 응답을 위한 데이터 클래스
 * @property success 요청 성공 여부 (항상 false)
 * @property error 에러 상세 정보
 */
@Serializable
data class ApiErrorResponse(
    val success: Boolean,
    val error: ErrorDetails
) {
    companion object {
        /**
         * 잘못된 요청(400) 에러 응답 생성
         */
        fun badRequest(message: String): ApiErrorResponse {
            return ApiErrorResponse(
                success = false,
                error = ErrorDetails(
                    code = "VALIDATION_ERROR",
                    message = message
                )
            )
        }
        
        /**
         * 찾을 수 없음(404) 에러 응답 생성
         */
        fun notFound(message: String): ApiErrorResponse {
            return ApiErrorResponse(
                success = false,
                error = ErrorDetails(
                    code = "NOT_FOUND",
                    message = message
                )
            )
        }
        
        /**
         * 서버 내부 오류(500) 에러 응답 생성
         */
        fun internalError(message: String): ApiErrorResponse {
            return ApiErrorResponse(
                success = false,
                error = ErrorDetails(
                    code = "INTERNAL_ERROR",
                    message = message
                )
            )
        }
    }
}

/**
 * 에러 상세 정보를 담는 데이터 클래스
 * @property code 에러 코드 (예: VALIDATION_ERROR, NOT_FOUND)
 * @property message 사용자에게 표시할 에러 메시지
 * @property details 추가적인 에러 상세 정보 (선택적)
 */
@Serializable
data class ErrorDetails(
    val code: String,
    val message: String,
    val details: Map<String, String>? = null
) 