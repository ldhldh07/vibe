package com.todoapp.utils

import io.ktor.http.content.*
import io.ktor.server.application.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.datetime.Clock
import java.io.File
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.*

/**
 * 파일 업로드 관련 유틸리티 클래스
 * 프로필 이미지 업로드, 검증, 저장을 담당합니다
 */
object FileUploadUtils {
    
    // 업로드 기본 설정
    private const val UPLOAD_DIR = "uploads"
    private const val PROFILE_DIR = "profiles"
    private const val MAX_FILE_SIZE = 5 * 1024 * 1024L // 5MB
    
    // 허용되는 이미지 확장자
    private val ALLOWED_EXTENSIONS = setOf("jpg", "jpeg", "png", "gif")
    private val ALLOWED_MIME_TYPES = setOf(
        "image/jpeg", 
        "image/png", 
        "image/gif"
    )
    
    /**
     * 파일 업로드 결과를 담는 데이터 클래스
     */
    data class UploadResult(
        val success: Boolean,
        val message: String,
        val filePath: String? = null,
        val fileName: String? = null,
        val fileUrl: String? = null
    )
    
    /**
     * 업로드 디렉토리를 초기화합니다
     * 필요한 폴더들을 생성합니다
     */
    fun initializeUploadDirectories(): Boolean {
        return try {
            val uploadPath = Paths.get(UPLOAD_DIR)
            val profilePath = Paths.get(UPLOAD_DIR, PROFILE_DIR)
            
            // 디렉토리가 없으면 생성
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath)
                println("✅ 업로드 디렉토리 생성: $uploadPath")
            }
            
            if (!Files.exists(profilePath)) {
                Files.createDirectories(profilePath)
                println("✅ 프로필 이미지 디렉토리 생성: $profilePath")
            }
            
            true
        } catch (e: Exception) {
            println("❌ 업로드 디렉토리 초기화 실패: ${e.message}")
            false
        }
    }
    
    /**
     * 이미지 파일의 유효성을 검증합니다
     * @param fileItem 업로드된 파일 아이템
     * @return 검증 결과
     */
    fun validateImageFile(fileItem: PartData.FileItem): UploadResult {
        // 파일명 검증
        val originalFileName = fileItem.originalFileName
        if (originalFileName.isNullOrBlank()) {
            return UploadResult(
                success = false,
                message = "파일명이 없습니다."
            )
        }
        
        // 확장자 검증
        val extension = originalFileName.substringAfterLast('.', "").lowercase()
        if (extension !in ALLOWED_EXTENSIONS) {
            return UploadResult(
                success = false,
                message = "허용되지 않는 파일 형식입니다. (허용: ${ALLOWED_EXTENSIONS.joinToString(", ")})"
            )
        }
        
        // MIME 타입 검증
        val contentType = fileItem.contentType?.toString()
        if (contentType !in ALLOWED_MIME_TYPES) {
            return UploadResult(
                success = false,
                message = "허용되지 않는 파일 타입입니다."
            )
        }
        
        return UploadResult(
            success = true,
            message = "파일 검증 성공"
        )
    }
    
    /**
     * 프로필 이미지를 저장합니다
     * @param fileItem 업로드된 파일 아이템
     * @param userId 사용자 ID
     * @return 업로드 결과
     */
    suspend fun saveProfileImage(fileItem: PartData.FileItem, userId: String): UploadResult {
        // 파일 검증
        val validation = validateImageFile(fileItem)
        if (!validation.success) {
            return validation
        }
        
        return try {
            val originalFileName = fileItem.originalFileName!!
            val extension = originalFileName.substringAfterLast('.', "").lowercase()
            val timestamp = Clock.System.now().epochSeconds
            
            // 새 파일명 생성: userId_timestamp.extension
            val newFileName = "${userId}_${timestamp}.${extension}"
            val filePath = Paths.get(UPLOAD_DIR, PROFILE_DIR, newFileName)
            
            // 파일 크기 검증 및 저장
            withContext(Dispatchers.IO) {
                var totalBytes = 0L
                
                fileItem.streamProvider().use { input ->
                    Files.newOutputStream(filePath).use { output ->
                        val buffer = ByteArray(8192)
                        var bytesRead: Int
                        
                        while (input.read(buffer).also { bytesRead = it } != -1) {
                            totalBytes += bytesRead
                            
                            // 파일 크기 제한 검증
                            if (totalBytes > MAX_FILE_SIZE) {
                                // 임시 파일 삭제
                                Files.deleteIfExists(filePath)
                                throw IllegalArgumentException("파일 크기가 너무 큽니다. (최대 ${MAX_FILE_SIZE / 1024 / 1024}MB)")
                            }
                            
                            output.write(buffer, 0, bytesRead)
                        }
                    }
                }
                
                println("✅ 프로필 이미지 저장 성공: $filePath (${totalBytes}bytes)")
            }
            
            // 기존 프로필 이미지 삭제 (선택사항)
            deleteOldProfileImages(userId, newFileName)
            
            UploadResult(
                success = true,
                message = "프로필 이미지 업로드 성공",
                filePath = filePath.toString(),
                fileName = originalFileName,
                fileUrl = "/api/users/profile/image/$userId"
            )
            
        } catch (e: Exception) {
            println("❌ 프로필 이미지 저장 실패: ${e.message}")
            UploadResult(
                success = false,
                message = "파일 저장 중 오류가 발생했습니다: ${e.message}"
            )
        }
    }
    
    /**
     * 사용자의 기존 프로필 이미지들을 삭제합니다 (새 이미지 제외)
     * @param userId 사용자 ID
     * @param excludeFileName 삭제하지 않을 파일명
     */
    private fun deleteOldProfileImages(userId: String, excludeFileName: String) {
        try {
            val profileDir = Paths.get(UPLOAD_DIR, PROFILE_DIR).toFile()
            if (!profileDir.exists()) return
            
            profileDir.listFiles { _, name ->
                name.startsWith("${userId}_") && name != excludeFileName
            }?.forEach { oldFile ->
                if (oldFile.delete()) {
                    println("🗑️ 기존 프로필 이미지 삭제: ${oldFile.name}")
                }
            }
        } catch (e: Exception) {
            println("⚠️ 기존 프로필 이미지 삭제 중 오류: ${e.message}")
        }
    }
    
    /**
     * 사용자의 프로필 이미지 파일을 찾습니다
     * @param userId 사용자 ID
     * @return 프로필 이미지 파일 (없으면 null)
     */
    fun findUserProfileImage(userId: String): File? {
        return try {
            val profileDir = Paths.get(UPLOAD_DIR, PROFILE_DIR).toFile()
            if (!profileDir.exists()) return null
            
            profileDir.listFiles { _, name ->
                name.startsWith("${userId}_")
            }?.maxByOrNull { it.lastModified() } // 가장 최근 파일
            
        } catch (e: Exception) {
            println("❌ 프로필 이미지 검색 실패: ${e.message}")
            null
        }
    }
    
    /**
     * 사용자의 프로필 이미지를 삭제합니다
     * @param userId 사용자 ID
     * @return 삭제 성공 여부
     */
    fun deleteUserProfileImage(userId: String): Boolean {
        return try {
            val profileImage = findUserProfileImage(userId)
            if (profileImage != null && profileImage.exists()) {
                val deleted = profileImage.delete()
                if (deleted) {
                    println("🗑️ 프로필 이미지 삭제 성공: ${profileImage.name}")
                }
                deleted
            } else {
                false
            }
        } catch (e: Exception) {
            println("❌ 프로필 이미지 삭제 실패: ${e.message}")
            false
        }
    }
    
    /**
     * 업로드 디렉토리의 전체 크기를 계산합니다 (모니터링용)
     * @return 디렉토리 크기 (바이트)
     */
    fun getUploadDirectorySize(): Long {
        return try {
            val uploadDir = Paths.get(UPLOAD_DIR).toFile()
            if (!uploadDir.exists()) return 0L
            
            uploadDir.walkTopDown()
                .filter { it.isFile }
                .map { it.length() }
                .sum()
        } catch (e: Exception) {
            0L
        }
    }
    
    /**
     * 파일 확장자로부터 MIME 타입을 추정합니다
     * @param fileName 파일명
     * @return MIME 타입
     */
    fun getMimeType(fileName: String): String {
        val extension = fileName.substringAfterLast('.', "").lowercase()
        return when (extension) {
            "jpg", "jpeg" -> "image/jpeg"
            "png" -> "image/png"
            "gif" -> "image/gif"
            else -> "application/octet-stream"
        }
    }
} 