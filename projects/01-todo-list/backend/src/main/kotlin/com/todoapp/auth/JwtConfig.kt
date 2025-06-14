package com.todoapp.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTCreationException
import com.auth0.jwt.exceptions.JWTVerificationException
import com.auth0.jwt.interfaces.DecodedJWT
import com.todoapp.models.User
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import java.util.*
import kotlin.time.Duration.Companion.hours
import io.ktor.server.application.ApplicationCall

/**
 * JWT 토큰 관리를 위한 설정 클래스
 * 토큰 생성, 검증, 클레임 추출 기능을 제공합니다
 */
object JwtConfig {
    
    // JWT 설정 상수들
    private const val SECRET = "todo-app-jwt-secret-key-2024-secure-random-string-do-not-use-in-production"
    private const val ISSUER = "todo-app-server"
    private const val AUDIENCE = "todo-app-users"
    private val TOKEN_VALIDITY_HOURS = 1.hours // 1시간
    
    // JWT 알고리즘 및 검증기
    private val algorithm = Algorithm.HMAC256(SECRET)
    private val verifier: JWTVerifier = JWT.require(algorithm)
        .withIssuer(ISSUER)
        .withAudience(AUDIENCE)
        .build()
    
    /**
     * JWT 검증기를 반환합니다 (Ktor JWT 플러그인용)
     * @return JWT 검증기
     */
    fun getVerifier(): JWTVerifier = verifier
    
    /**
     * JWT 토큰 생성 결과를 담는 데이터 클래스
     */
    data class TokenResult(
        val success: Boolean,
        val token: String? = null,
        val expiresAt: Instant? = null,
        val error: String? = null
    )
    
    /**
     * 디코딩된 JWT 토큰 정보를 담는 데이터 클래스
     */
    data class TokenInfo(
        val userId: String,
        val email: String,
        val name: String,
        val issuedAt: Instant,
        val expiresAt: Instant
    )
    
    /**
     * 사용자 정보를 기반으로 JWT 토큰을 생성합니다
     * @param user 사용자 정보
     * @return 토큰 생성 결과
     */
    fun generateToken(user: User): TokenResult {
        return try {
            val now = Clock.System.now()
            val expiresAt = now.plus(TOKEN_VALIDITY_HOURS)
            
            val token = JWT.create()
                .withIssuer(ISSUER)
                .withAudience(AUDIENCE)
                .withSubject(user.id) // 사용자 ID를 subject로 설정
                .withClaim("userId", user.id)
                .withClaim("email", user.email)
                .withClaim("name", user.name)
                .withIssuedAt(Date.from(java.time.Instant.ofEpochSecond(now.epochSeconds)))
                .withExpiresAt(Date.from(java.time.Instant.ofEpochSecond(expiresAt.epochSeconds)))
                .sign(algorithm)
            
            TokenResult(
                success = true,
                token = token,
                expiresAt = expiresAt
            )
            
        } catch (e: JWTCreationException) {
            TokenResult(
                success = false,
                error = "JWT 토큰 생성 실패: ${e.message}"
            )
        } catch (e: Exception) {
            TokenResult(
                success = false,
                error = "예상치 못한 오류: ${e.message}"
            )
        }
    }
    
    /**
     * JWT 토큰을 검증하고 디코딩합니다
     * @param token JWT 토큰 문자열
     * @return 검증 결과 및 토큰 정보
     */
    fun verifyToken(token: String): Result<TokenInfo> {
        return try {
            val decodedJWT = verifier.verify(token)
            val tokenInfo = extractTokenInfo(decodedJWT)
            Result.success(tokenInfo)
            
        } catch (e: JWTVerificationException) {
            Result.failure(Exception("JWT 토큰 검증 실패: ${e.message}"))
        } catch (e: Exception) {
            Result.failure(Exception("토큰 처리 중 오류: ${e.message}"))
        }
    }
    
    /**
     * Authorization 헤더에서 Bearer 토큰을 추출합니다
     * @param authHeader Authorization 헤더 값
     * @return 추출된 토큰 (Bearer 접두사 제거)
     */
    fun extractTokenFromHeader(authHeader: String?): String? {
        if (authHeader.isNullOrBlank()) return null
        
        return if (authHeader.startsWith("Bearer ", ignoreCase = true)) {
            authHeader.substring(7).trim()
        } else {
            null
        }
    }
    
    /**
     * 디코딩된 JWT에서 토큰 정보를 추출합니다
     * @param decodedJWT 디코딩된 JWT
     * @return 토큰 정보
     */
    private fun extractTokenInfo(decodedJWT: DecodedJWT): TokenInfo {
        val userId = decodedJWT.getClaim("userId").asString()
            ?: throw IllegalArgumentException("userId 클레임이 없습니다")
        val email = decodedJWT.getClaim("email").asString()
            ?: throw IllegalArgumentException("email 클레임이 없습니다")
        val name = decodedJWT.getClaim("name").asString()
            ?: throw IllegalArgumentException("name 클레임이 없습니다")
        
        val issuedAt = decodedJWT.issuedAt?.let {
            Instant.fromEpochSeconds(it.time / 1000)
        } ?: throw IllegalArgumentException("issuedAt 클레임이 없습니다")
        
        val expiresAt = decodedJWT.expiresAt?.let {
            Instant.fromEpochSeconds(it.time / 1000)
        } ?: throw IllegalArgumentException("expiresAt 클레임이 없습니다")
        
        return TokenInfo(
            userId = userId,
            email = email,
            name = name,
            issuedAt = issuedAt,
            expiresAt = expiresAt
        )
    }
    
    /**
     * 토큰이 만료되었는지 확인합니다
     * @param tokenInfo 토큰 정보
     * @return 만료 여부
     */
    fun isTokenExpired(tokenInfo: TokenInfo): Boolean {
        val now = Clock.System.now()
        return now > tokenInfo.expiresAt
    }
    
    /**
     * 토큰의 남은 유효 시간을 계산합니다 (초 단위)
     * @param tokenInfo 토큰 정보
     * @return 남은 시간 (초), 만료된 경우 0
     */
    fun getTokenRemainingTime(tokenInfo: TokenInfo): Long {
        val now = Clock.System.now()
        val remaining = tokenInfo.expiresAt.epochSeconds - now.epochSeconds
        return if (remaining > 0) remaining else 0
    }
    
    /**
     * 개발용: 짧은 유효기간 토큰 생성 (테스트용)
     * @param user 사용자 정보
     * @param validityMinutes 유효 시간 (분 단위)
     * @return 토큰 생성 결과
     */
    fun generateShortLivedToken(user: User, validityMinutes: Int = 5): TokenResult {
        return try {
            val now = Clock.System.now()
            val expiresAt = now.plus(kotlin.time.Duration.parse("${validityMinutes}m"))
            
            val token = JWT.create()
                .withIssuer(ISSUER)
                .withAudience(AUDIENCE)
                .withSubject(user.id)
                .withClaim("userId", user.id)
                .withClaim("email", user.email)
                .withClaim("name", user.name)
                .withClaim("type", "short-lived") // 특별 표시
                .withIssuedAt(Date.from(java.time.Instant.ofEpochSecond(now.epochSeconds)))
                .withExpiresAt(Date.from(java.time.Instant.ofEpochSecond(expiresAt.epochSeconds)))
                .sign(algorithm)
            
            TokenResult(
                success = true,
                token = token,
                expiresAt = expiresAt
            )
            
        } catch (e: Exception) {
            TokenResult(
                success = false,
                error = "단기 토큰 생성 실패: ${e.message}"
            )
        }
    }
    
    /**
     * JWT 설정 정보를 반환합니다 (디버깅용)
     */
    fun getConfigInfo(): Map<String, Any> {
        return mapOf(
            "issuer" to ISSUER,
            "audience" to AUDIENCE,
            "algorithm" to "HS256",
            "validity" to "${TOKEN_VALIDITY_HOURS.inWholeHours}시간",
            "secretLength" to SECRET.length
        )
    }
}

/**
 * ApplicationCall에서 현재 사용자 ID를 추출하는 확장 함수
 */
fun ApplicationCall.getUserId(): String {
    val authHeader = request.headers["Authorization"]
    val token = JwtConfig.extractTokenFromHeader(authHeader)
        ?: throw IllegalArgumentException("Authorization 헤더가 없거나 잘못된 형식입니다")
    
    val tokenInfo = JwtConfig.verifyToken(token).getOrThrow()
    
    if (JwtConfig.isTokenExpired(tokenInfo)) {
        throw IllegalArgumentException("토큰이 만료되었습니다")
    }
    
    return tokenInfo.userId
} 