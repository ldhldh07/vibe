/**
 * AI 기반 Todo 세분화 시스템 관련 데이터 모델들
 */

import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.Serializable

/**
 * AI 목표 분해 요청
 */
@Serializable
data class AiGoalBreakdownRequest(
    val goalTitle: String,
    val goalDescription: String,
    val targetDate: LocalDate? = null,
    val availableHoursPerWeek: Int = 10,
    val currentSkillLevel: SkillLevel = SkillLevel.BEGINNER,
    val preferredLearningStyle: LearningStyle = LearningStyle.BALANCED,
    val additionalContext: String? = null
)

/**
 * 스킬 레벨
 */
@Serializable
enum class SkillLevel {
    COMPLETE_BEGINNER,  // 완전 초보
    BEGINNER,          // 초급
    INTERMEDIATE,      // 중급  
    ADVANCED,          // 고급
    EXPERT            // 전문가
}

/**
 * 학습 스타일
 */
@Serializable
enum class LearningStyle {
    THEORY_FOCUSED,    // 이론 중심
    PRACTICE_FOCUSED,  // 실습 중심
    BALANCED,          // 균형
    PROJECT_BASED,     // 프로젝트 기반
    FAST_TRACK        // 빠른 진행
}

/**
 * AI 생성 학습 계획
 */
@Serializable
data class AiLearningPlan(
    val id: String,
    val originalGoal: String,
    val totalEstimatedHours: Int,
    val estimatedWeeks: Int,
    val phases: List<LearningPhase>,
    val prerequisites: List<String> = emptyList(),
    val recommendedResources: List<ResourceRecommendation> = emptyList(),
    val createdAt: LocalDateTime,
    val createdBy: String
)

/**
 * 학습 단계
 */
@Serializable
data class LearningPhase(
    val id: String,
    val phaseNumber: Int,
    val title: String,
    val description: String,
    val estimatedHours: Int,
    val estimatedDays: Int,
    val difficulty: TaskDifficulty,
    val milestones: List<PhaseMilestone>,
    val dependencies: List<String> = emptyList(), // 다른 phase ID들
    val skills: List<String> = emptyList(),
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null
)

/**
 * 과제 난이도
 */
@Serializable
enum class TaskDifficulty {
    VERY_EASY,    // 매우 쉬움
    EASY,         // 쉬움
    MODERATE,     // 보통
    HARD,         // 어려움
    VERY_HARD     // 매우 어려움
}

/**
 * 단계별 마일스톤
 */
@Serializable
data class PhaseMilestone(
    val id: String,
    val title: String,
    val description: String,
    val estimatedHours: Float,
    val type: MilestoneType,
    val isCompleted: Boolean = false,
    val completedAt: LocalDateTime? = null,
    val order: Int
)

/**
 * 마일스톤 타입
 */
@Serializable
enum class MilestoneType {
    LEARNING,      // 학습
    PRACTICE,      // 연습
    PROJECT,       // 프로젝트
    REVIEW,        // 복습
    ASSESSMENT,    // 평가/테스트
    RESEARCH       // 조사
}

/**
 * 자료 추천
 */
@Serializable
data class ResourceRecommendation(
    val title: String,
    val type: ResourceType,
    val url: String? = null,
    val description: String,
    val difficulty: TaskDifficulty,
    val estimatedTime: String, // "2시간", "1주" 등
    val isRequired: Boolean = true,
    val phaseId: String? = null // 특정 단계와 연관
)

/**
 * 자료 타입
 */
@Serializable
enum class ResourceType {
    DOCUMENTATION,     // 공식 문서
    TUTORIAL,         // 튜토리얼
    VIDEO_COURSE,     // 영상 강의
    ARTICLE,          // 글/블로그
    BOOK,             // 책
    PRACTICE_SITE,    // 연습 사이트
    GITHUB_REPO,      // GitHub 저장소
    TOOL,             // 도구
    COMMUNITY         // 커뮤니티
}

/**
 * 사용자 진행 상황
 */
@Serializable
data class UserProgress(
    val id: String,
    val userId: String,
    val planId: String,
    val currentPhase: Int = 1,
    val completedPhases: List<String> = emptyList(),
    val completedMilestones: List<String> = emptyList(),
    val totalProgress: Float = 0.0f, // 0.0 ~ 1.0
    val startedAt: LocalDateTime,
    val lastActiveAt: LocalDateTime,
    val estimatedCompletionDate: LocalDate? = null,
    val actualHoursSpent: Float = 0.0f,
    val notes: String? = null
)

/**
 * 일일 학습 추천
 */
@Serializable
data class DailyRecommendation(
    val id: String,
    val userId: String,
    val date: LocalDate,
    val recommendedTasks: List<RecommendedTask>,
    val estimatedTotalTime: Int, // 분 단위
    val focusArea: String,
    val motivationalMessage: String,
    val generatedAt: LocalDateTime
)

/**
 * 추천 과제
 */
@Serializable
data class RecommendedTask(
    val id: String,
    val title: String,
    val description: String,
    val type: MilestoneType,
    val estimatedMinutes: Int,
    val priority: TaskPriority,
    val phaseId: String,
    val milestoneId: String? = null,
    val resources: List<String> = emptyList(),
    val isCompleted: Boolean = false
)

/**
 * 과제 우선순위
 */
@Serializable
enum class TaskPriority {
    LOW,       // 낮음
    MEDIUM,    // 보통
    HIGH,      // 높음
    CRITICAL   // 긴급
}

/**
 * AI 분석 리포트
 */
@Serializable
data class AiAnalysisReport(
    val id: String,
    val userId: String,
    val planId: String,
    val analysisDate: LocalDate,
    val progressAnalysis: ProgressAnalysis,
    val recommendations: List<AiRecommendation>,
    val predictedCompletion: LocalDate,
    val risksAndChallenges: List<String> = emptyList(),
    val strengths: List<String> = emptyList(),
    val generatedAt: LocalDateTime
)

/**
 * 진행 분석
 */
@Serializable
data class ProgressAnalysis(
    val overallScore: Float, // 0.0 ~ 1.0
    val paceRating: PaceRating,
    val consistencyScore: Float,
    val difficultyAdaptation: Float,
    val timeManagement: Float,
    val insights: List<String>
)

/**
 * 진행 속도 평가
 */
@Serializable
enum class PaceRating {
    TOO_SLOW,      // 너무 느림
    BEHIND,        // 늦음
    ON_TRACK,      // 정상
    AHEAD,         // 앞섬
    TOO_FAST       // 너무 빠름
}

/**
 * AI 추천사항
 */
@Serializable
data class AiRecommendation(
    val type: RecommendationType,
    val title: String,
    val description: String,
    val priority: TaskPriority,
    val actionRequired: Boolean = false,
    val estimatedImpact: ImpactLevel
)

/**
 * 추천 타입
 */
@Serializable
enum class RecommendationType {
    SCHEDULE_ADJUSTMENT,   // 일정 조정
    STUDY_METHOD,         // 학습 방법
    RESOURCE_ADDITION,    // 자료 추가
    BREAK_SUGGESTION,     // 휴식 제안
    REVIEW_NEEDED,        // 복습 필요
    PACE_CHANGE,          // 속도 조정
    DIFFICULTY_ADJUSTMENT, // 난이도 조정
    MOTIVATION_BOOST      // 동기부여
}

/**
 * 영향 수준
 */
@Serializable
enum class ImpactLevel {
    LOW,       // 낮음
    MEDIUM,    // 보통
    HIGH,      // 높음
    CRITICAL   // 매우 중요
}

/**
 * AI 프롬프트 템플릿
 */
object AiPromptTemplates {
    
    /**
     * 목표 분해를 위한 프롬프트 생성
     */
    fun createGoalBreakdownPrompt(request: AiGoalBreakdownRequest): String {
        return """
        다음 학습 목표를 달성 가능한 단계별 계획으로 분해해주세요:
        
        목표: ${request.goalTitle}
        설명: ${request.goalDescription}
        목표 기한: ${request.targetDate ?: "설정되지 않음"}
        주당 가용 시간: ${request.availableHoursPerWeek}시간
        현재 수준: ${request.currentSkillLevel}
        학습 스타일: ${request.preferredLearningStyle}
        추가 정보: ${request.additionalContext ?: "없음"}
        
        다음 형식으로 응답해주세요:
        1. 전체 계획 개요 (총 예상 기간, 필요 시간)
        2. 단계별 세부 계획 (각 단계별 목표, 소요 시간, 핵심 활동)
        3. 각 단계의 마일스톤 (구체적인 달성 목표)
        4. 추천 학습 자료
        5. 주의사항 및 팁
        
        한국어로 답변하고, 실제로 달성 가능한 현실적인 계획을 제시해주세요.
        """.trimIndent()
    }
    
    /**
     * 일일 추천을 위한 프롬프트
     */
    fun createDailyRecommendationPrompt(
        progress: UserProgress,
        plan: AiLearningPlan,
        availableTime: Int
    ): String {
        return """
        사용자의 학습 진행상황을 바탕으로 오늘의 학습 계획을 추천해주세요:
        
        현재 진행률: ${(progress.totalProgress * 100).toInt()}%
        현재 단계: ${progress.currentPhase}
        가용 시간: ${availableTime}분
        최근 활동: ${progress.lastActiveAt}
        
        오늘 집중해야 할 영역과 구체적인 과제를 추천해주세요.
        동기부여가 될 수 있는 메시지도 포함해주세요.
        """.trimIndent()
    }
    
    /**
     * 진행 분석을 위한 프롬프트
     */
    fun createAnalysisPrompt(
        progress: UserProgress,
        plan: AiLearningPlan,
        recentActivity: List<String>
    ): String {
        return """
        사용자의 학습 진행상황을 분석하고 개선사항을 제안해주세요:
        
        계획 대비 진행률: ${(progress.totalProgress * 100).toInt()}%
        실제 소요 시간: ${progress.actualHoursSpent}시간
        계획된 시간: ${plan.totalEstimatedHours}시간
        시작일: ${progress.startedAt}
        최근 활동: ${recentActivity.joinToString(", ")}
        
        다음을 분석해주세요:
        1. 진행 속도 평가
        2. 학습 패턴 분석
        3. 개선 추천사항
        4. 동기부여 방안
        """.trimIndent()
    }
} 