package com.todoapp.models

import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.*
import java.util.concurrent.ConcurrentHashMap

/**
 * 사용자 정보를 담는 데이터 클래스
 * 
 * @param id 사용자 고유 ID (UUID)
 * @param email 이메일 주소 (로그인 ID)
 * @param passwordHash 암호화된 비밀번호
 * @param name 사용자 이름
 * @param profileImageUrl 프로필 사진 URL (null이면 기본 아바타)
 * @param profileImageFileName 프로필 사진 원본 파일명
 * @param createdAt 계정 생성일시
 * @param updatedAt 정보 수정일시
 */
@Serializable
data class User(
    val id: String,
    val email: String,
    val passwordHash: String,
    val name: String,
    val profileImageUrl: String? = null,
    val profileImageFileName: String? = null,
    @Contextual val createdAt: Instant,
    @Contextual val updatedAt: Instant
)

/**
 * 회원가입 요청 데이터
 */
@Serializable
data class UserRegistrationRequest(
    val email: String,
    val password: String,
    val name: String
)

/**
 * 로그인 요청 데이터
 */
@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

/**
 * 로그인 응답 데이터
 */
@Serializable
data class LoginResponse(
    val token: String,
    val user: UserProfile
)

/**
 * 프로필 이미지 업로드 응답 데이터
 */
@Serializable
data class ProfileImageUploadResponse(
    val success: Boolean,
    val message: String,
    val imageUrl: String? = null
)

/**
 * 사용자 프로필 정보 (민감한 정보 제외)
 */
@Serializable
data class UserProfile(
    val id: String,
    val email: String,
    val name: String,
    val profileImageUrl: String? = null,
    @Contextual val createdAt: Instant
)

/**
 * 비밀번호 해싱 유틸리티 클래스
 * BCrypt 방식을 단순화한 해싱 구현
 */
object PasswordHasher {
    private val secureRandom = SecureRandom()
    
    /**
     * 비밀번호를 해싱합니다
     * @param password 평문 비밀번호
     * @return 솔트가 포함된 해싱된 비밀번호
     */
    fun hashPassword(password: String): String {
        val salt = generateSalt()
        val hash = hashWithSalt(password, salt)
        return "$salt:$hash"
    }
    
    /**
     * 비밀번호를 검증합니다
     * @param password 평문 비밀번호
     * @param hashedPassword 저장된 해싱된 비밀번호
     * @return 비밀번호 일치 여부
     */
    fun verifyPassword(password: String, hashedPassword: String): Boolean {
        val parts = hashedPassword.split(":")
        if (parts.size != 2) return false
        
        val salt = parts[0]
        val storedHash = parts[1]
        val inputHash = hashWithSalt(password, salt)
        
        return storedHash == inputHash
    }
    
    /**
     * 랜덤 솔트 생성
     */
    private fun generateSalt(): String {
        val salt = ByteArray(16)
        secureRandom.nextBytes(salt)
        return Base64.getEncoder().encodeToString(salt)
    }
    
    /**
     * 솔트를 사용하여 비밀번호 해싱
     */
    private fun hashWithSalt(password: String, salt: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val combined = password + salt
        val hashedBytes = digest.digest(combined.toByteArray())
        return Base64.getEncoder().encodeToString(hashedBytes)
    }
}

/**
 * 사용자 데이터 인메모리 스토리지
 * Thread-Safe 구현으로 동시성 문제 해결
 */
class UserStorage {
    // 사용자 데이터를 ID로 저장
    private val users = ConcurrentHashMap<String, User>()
    // 이메일 → ID 매핑 (빠른 이메일 검색용)
    private val emailToId = ConcurrentHashMap<String, String>()
    
    /**
     * 새 사용자를 생성합니다
     * @param email 이메일 주소
     * @param password 평문 비밀번호
     * @param name 사용자 이름
     * @return 생성된 사용자 정보
     * @throws IllegalArgumentException 이메일이 이미 존재하는 경우
     */
    fun createUser(email: String, password: String, name: String): User {
        if (emailExists(email)) {
            throw IllegalArgumentException("이미 존재하는 이메일입니다: $email")
        }
        
        val userId = UUID.randomUUID().toString()
        val hashedPassword = PasswordHasher.hashPassword(password)
        val now = Clock.System.now()
        
        val user = User(
            id = userId,
            email = email.lowercase().trim(),
            passwordHash = hashedPassword,
            name = name.trim(),
            profileImageUrl = null, // 기본값: 프로필 사진 없음
            profileImageFileName = null,
            createdAt = now,
            updatedAt = now
        )
        
        users[userId] = user
        emailToId[user.email] = userId
        
        return user
    }
    
    /**
     * 이메일로 사용자를 검색합니다
     * @param email 이메일 주소
     * @return 사용자 정보 (없으면 null)
     */
    fun findByEmail(email: String): User? {
        val normalizedEmail = email.lowercase().trim()
        val userId = emailToId[normalizedEmail]
        return userId?.let { users[it] }
    }
    
    /**
     * ID로 사용자를 검색합니다
     * @param id 사용자 ID
     * @return 사용자 정보 (없으면 null)
     */
    fun findById(id: String): User? {
        return users[id]
    }
    
    /**
     * 이메일 중복 여부를 확인합니다
     * @param email 확인할 이메일 주소
     * @return 중복 여부
     */
    fun emailExists(email: String): Boolean {
        val normalizedEmail = email.lowercase().trim()
        return emailToId.containsKey(normalizedEmail)
    }
    
    /**
     * 등록된 모든 사용자 수를 반환합니다
     * @return 사용자 수
     */
    fun getUserCount(): Int = users.size
    
    /**
     * 사용자 정보를 프로필 형태로 변환합니다 (민감한 정보 제외)
     * @param user 사용자 정보
     * @return 사용자 프로필
     */
    fun toUserProfile(user: User): UserProfile {
        return UserProfile(
            id = user.id,
            email = user.email,
            name = user.name,
            profileImageUrl = user.profileImageUrl,
            createdAt = user.createdAt
        )
    }
    
    /**
     * 사용자의 프로필 이미지를 업데이트합니다
     * @param userId 사용자 ID
     * @param imageUrl 이미지 URL
     * @param fileName 원본 파일명
     * @return 업데이트된 사용자 정보 (사용자가 없으면 null)
     */
    fun updateProfileImage(userId: String, imageUrl: String?, fileName: String?): User? {
        val currentUser = users[userId] ?: return null
        val now = Clock.System.now()
        
        val updatedUser = currentUser.copy(
            profileImageUrl = imageUrl,
            profileImageFileName = fileName,
            updatedAt = now
        )
        
        users[userId] = updatedUser
        return updatedUser
    }
    
    /**
     * 이메일과 비밀번호로 사용자 인증을 시도합니다
     * @param email 이메일 주소
     * @param password 평문 비밀번호
     * @return 인증된 사용자 정보 (실패 시 null)
     */
    fun authenticateUser(email: String, password: String): User? {
        val user = findByEmail(email) ?: return null
        return if (PasswordHasher.verifyPassword(password, user.passwordHash)) {
            user
        } else {
            null
        }
    }
} 