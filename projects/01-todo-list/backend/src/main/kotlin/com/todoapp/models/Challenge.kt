/**
 * 챌린지/게임화 시스템 관련 데이터 모델들
 */

import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.Serializable

/**
 * 사용자 게임 통계
 */
@Serializable
data class UserStats(
    val userId: String,
    val level: Int = 1,
    val experience: Long = 0L,
    val totalPoints: Long = 0L,
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val lastActiveDate: LocalDate? = null,
    val completedTodos: Int = 0,
    val createdTodos: Int = 0,
    val updatedAt: LocalDateTime
)

/**
 * 배지 타입
 */
@Serializable
enum class BadgeType {
    // 완료 관련 배지
    FIRST_TODO,           // 첫 번째 할일 완료
    TODO_MASTER_10,       // 10개 할일 완료
    TODO_MASTER_50,       // 50개 할일 완료
    TODO_MASTER_100,      // 100개 할일 완료
    
    // 연속 달성 배지
    STREAK_3,             // 3일 연속 달성
    STREAK_7,             // 일주일 연속 달성
    STREAK_30,            // 한달 연속 달성
    STREAK_100,           // 100일 연속 달성
    
    // 레벨 관련 배지
    LEVEL_UP_5,           // 레벨 5 달성
    LEVEL_UP_10,          // 레벨 10 달성
    LEVEL_UP_25,          // 레벨 25 달성
    
    // 특별 배지
    EARLY_BIRD,           // 오전 6시 이전 할일 완료
    NIGHT_OWL,            // 밤 10시 이후 할일 완료
    WEEKEND_WARRIOR,      // 주말에 할일 완료
    PROJECT_CREATOR,      // 첫 번째 프로젝트 생성
    TEAM_PLAYER,          // 팀 프로젝트에 멤버 초대
}

/**
 * 사용자 획득 배지
 */
@Serializable
data class UserBadge(
    val id: String,
    val userId: String,
    val badgeType: BadgeType,
    val earnedAt: LocalDateTime,
    val relatedData: String? = null // 배지 획득과 관련된 추가 정보
)

/**
 * 배지 정보 (메타데이터)
 */
@Serializable
data class BadgeInfo(
    val type: BadgeType,
    val name: String,
    val description: String,
    val icon: String,
    val rarity: BadgeRarity,
    val points: Int
)

/**
 * 배지 희귀도
 */
@Serializable
enum class BadgeRarity {
    COMMON,    // 일반
    RARE,      // 희귀
    EPIC,      // 에픽
    LEGENDARY  // 전설
}

/**
 * 일일 챌린지 타입
 */
@Serializable
enum class DailyChallengeType {
    COMPLETE_TODOS,        // X개의 할일 완료하기
    CREATE_TODOS,          // X개의 할일 생성하기
    COMPLETE_HIGH_PRIORITY, // 높은 우선순위 할일 X개 완료
    COMPLETE_BEFORE_TIME,  // 마감시간 전에 할일 완료
    CREATE_PROJECT,        // 새 프로젝트 생성
    INVITE_MEMBER,         // 팀 멤버 초대
    COMPLETE_ALL_TODAY     // 오늘의 모든 할일 완료
}

/**
 * 일일 챌린지
 */
@Serializable
data class DailyChallenge(
    val id: String,
    val type: DailyChallengeType,
    val title: String,
    val description: String,
    val targetValue: Int,
    val rewardPoints: Int,
    val date: LocalDate
)

/**
 * 사용자 일일 챌린지 진행상황
 */
@Serializable
data class UserDailyChallengeProgress(
    val id: String,
    val userId: String,
    val challengeId: String,
    val currentValue: Int = 0,
    val isCompleted: Boolean = false,
    val completedAt: LocalDateTime? = null
)

/**
 * 포인트 획득 이벤트
 */
@Serializable
data class PointEvent(
    val id: String,
    val userId: String,
    val eventType: PointEventType,
    val points: Int,
    val description: String,
    val relatedId: String? = null, // 관련 Todo ID, Project ID 등
    val createdAt: LocalDateTime
)

/**
 * 포인트 획득 이벤트 타입
 */
@Serializable
enum class PointEventType {
    TODO_COMPLETED,        // 할일 완료
    TODO_CREATED,          // 할일 생성
    PROJECT_CREATED,       // 프로젝트 생성
    MEMBER_INVITED,        // 멤버 초대
    BADGE_EARNED,          // 배지 획득
    DAILY_CHALLENGE_COMPLETED, // 일일 챌린지 완료
    STREAK_BONUS,          // 연속 달성 보너스
    LEVEL_UP_BONUS         // 레벨업 보너스
}

/**
 * 프로젝트 팀 통계 (랭킹용)
 */
@Serializable
data class TeamStats(
    val projectId: String,
    val userId: String,
    val weeklyPoints: Long = 0L,
    val monthlyPoints: Long = 0L,
    val weeklyCompletedTodos: Int = 0,
    val monthlyCompletedTodos: Int = 0,
    val updatedAt: LocalDateTime
)

/**
 * 레벨 시스템 설정
 */
object LevelSystem {
    // 레벨별 필요 경험치 (누적)
    private val LEVEL_THRESHOLDS = listOf(
        0L,      // 레벨 1
        100L,    // 레벨 2
        300L,    // 레벨 3
        600L,    // 레벨 4
        1000L,   // 레벨 5
        1500L,   // 레벨 6
        2100L,   // 레벨 7
        2800L,   // 레벨 8
        3600L,   // 레벨 9
        4500L,   // 레벨 10
        5500L,   // 레벨 11
        6600L,   // 레벨 12
        7800L,   // 레벨 13
        9100L,   // 레벨 14
        10500L,  // 레벨 15
        12000L,  // 레벨 16
        13600L,  // 레벨 17
        15300L,  // 레벨 18
        17100L,  // 레벨 19
        19000L,  // 레벨 20
        21000L,  // 레벨 21
        23100L,  // 레벨 22
        25300L,  // 레벨 23
        27600L,  // 레벨 24
        30000L   // 레벨 25
    )
    
    /**
     * 경험치로부터 레벨 계산
     */
    fun calculateLevel(experience: Long): Int {
        for (i in LEVEL_THRESHOLDS.indices.reversed()) {
            if (experience >= LEVEL_THRESHOLDS[i]) {
                return i + 1
            }
        }
        return 1
    }
    
    /**
     * 다음 레벨까지 필요한 경험치
     */
    fun expToNextLevel(experience: Long): Long {
        val currentLevel = calculateLevel(experience)
        if (currentLevel >= LEVEL_THRESHOLDS.size) {
            return 0L // 최대 레벨 달성
        }
        return LEVEL_THRESHOLDS[currentLevel] - experience
    }
    
    /**
     * 현재 레벨의 진행률 (0.0 ~ 1.0)
     */
    fun getLevelProgress(experience: Long): Double {
        val currentLevel = calculateLevel(experience)
        if (currentLevel >= LEVEL_THRESHOLDS.size) {
            return 1.0 // 최대 레벨
        }
        
        val currentLevelExp = if (currentLevel > 1) LEVEL_THRESHOLDS[currentLevel - 2] else 0L
        val nextLevelExp = LEVEL_THRESHOLDS[currentLevel - 1]
        val progressInLevel = experience - currentLevelExp
        val totalLevelExp = nextLevelExp - currentLevelExp
        
        return progressInLevel.toDouble() / totalLevelExp.toDouble()
    }
}

/**
 * 포인트 시스템 설정
 */
object PointSystem {
    // 액션별 기본 포인트
    const val TODO_COMPLETED = 10
    const val TODO_CREATED = 2
    const val PROJECT_CREATED = 20
    const val MEMBER_INVITED = 15
    const val DAILY_CHALLENGE_COMPLETED = 50
    
    // 우선순위별 보너스 포인트
    const val HIGH_PRIORITY_BONUS = 5
    const val MEDIUM_PRIORITY_BONUS = 3
    const val LOW_PRIORITY_BONUS = 1
    
    // 연속 달성 보너스 (일 수에 따라)
    fun getStreakBonus(streakDays: Int): Int {
        return when {
            streakDays >= 30 -> 50
            streakDays >= 14 -> 30
            streakDays >= 7 -> 20
            streakDays >= 3 -> 10
            else -> 0
        }
    }
    
    // 레벨업 보너스
    fun getLevelUpBonus(newLevel: Int): Int {
        return newLevel * 25
    }
} 