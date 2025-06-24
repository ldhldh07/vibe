/**
 * 바이브 코딩 스터디 시스템 관련 데이터 모델들
 */

import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.Serializable

/**
 * 스터디 그룹 (기존 Project 확장)
 */
@Serializable
data class StudyGroup(
    val id: String,
    val name: String,
    val description: String,
    val studyType: StudyType,
    val difficulty: StudyDifficulty,
    val language: ProgrammingLanguage,
    val mentorId: String, // 멘토 (그룹 리더)
    val maxMembers: Int = 10,
    val isPublic: Boolean = true,
    val tags: List<String> = emptyList(),
    val schedule: StudySchedule? = null,
    val members: List<StudyMember> = emptyList(),
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

/**
 * 스터디 타입
 */
@Serializable
enum class StudyType {
    ALGORITHM,          // 알고리즘 문제 해결
    WEB_FRONTEND,       // 웹 프론트엔드
    WEB_BACKEND,        // 웹 백엔드
    MOBILE_APP,         // 모바일 앱 개발
    DATA_SCIENCE,       // 데이터 사이언스
    SYSTEM_DESIGN,      // 시스템 설계
    CODE_REVIEW,        // 코드 리뷰 스터디
    PROJECT_BUILD,      // 프로젝트 제작
    INTERVIEW_PREP,     // 기술 면접 준비
    OPEN_SOURCE,        // 오픈소스 기여
    READING_GROUP       // 기술서적 읽기
}

/**
 * 스터디 난이도
 */
@Serializable
enum class StudyDifficulty {
    BEGINNER,    // 초급
    INTERMEDIATE, // 중급
    ADVANCED,    // 고급
    EXPERT       // 전문가
}

/**
 * 프로그래밍 언어
 */
@Serializable
enum class ProgrammingLanguage {
    JAVASCRIPT, TYPESCRIPT, PYTHON, JAVA, KOTLIN,
    REACT, VUE, ANGULAR, NODEJS, SPRING,
    CPP, C, CSHARP, GO, RUST, SWIFT,
    SQL, HTML_CSS, FLUTTER, REACT_NATIVE,
    MULTIPLE, OTHER
}

/**
 * 스터디 일정
 */
@Serializable
data class StudySchedule(
    val dayOfWeek: List<Int>, // 1=월요일, 7=일요일
    val startTime: String,    // "19:00"
    val duration: Int,        // 분 단위
    val timezone: String = "Asia/Seoul"
)

/**
 * 스터디 멤버 (기존 ProjectMember 확장)
 */
@Serializable
data class StudyMember(
    val userId: String,
    val role: StudyRole,
    val joinedAt: LocalDateTime,
    val isActive: Boolean = true,
    val studyStats: StudyMemberStats
)

/**
 * 스터디 역할
 */
@Serializable
enum class StudyRole {
    MENTOR,     // 멘토 (스터디 리더)
    MEMBER,     // 일반 멤버
    OBSERVER    // 관찰자 (읽기 전용)
}

/**
 * 스터디 멤버 통계
 */
@Serializable
data class StudyMemberStats(
    val totalProblems: Int = 0,
    val solvedProblems: Int = 0,
    val totalStudyTime: Long = 0L, // 분 단위
    val streakDays: Int = 0,
    val lastActiveDate: LocalDate? = null,
    val averageRating: Double = 0.0,
    val level: StudyLevel = StudyLevel.NEWBIE
)

/**
 * 스터디 레벨
 */
@Serializable
enum class StudyLevel {
    NEWBIE,      // 새내기
    LEARNER,     // 학습자
    CONTRIBUTOR, // 기여자
    MENTOR,      // 멘토
    EXPERT       // 전문가
}

/**
 * 코딩 문제/과제 (기존 Todo 확장)
 */
@Serializable
data class CodingProblem(
    val id: String,
    val studyGroupId: String,
    val title: String,
    val description: String,
    val problemType: ProblemType,
    val difficulty: ProblemDifficulty,
    val estimatedTime: Int, // 예상 소요 시간 (분)
    val tags: List<String> = emptyList(),
    val testCases: List<TestCase> = emptyList(),
    val hints: List<String> = emptyList(),
    val resources: List<StudyResource> = emptyList(),
    val dueDate: LocalDateTime? = null,
    val createdBy: String,
    val assignedTo: List<String> = emptyList(),
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

/**
 * 문제 타입
 */
@Serializable
enum class ProblemType {
    ALGORITHM,      // 알고리즘 문제
    CODING_TEST,    // 코딩 테스트
    PROJECT_TASK,   // 프로젝트 과제
    CODE_REVIEW,    // 코드 리뷰
    DEBUGGING,      // 디버깅 문제
    REFACTORING,    // 리팩토링 과제
    DESIGN_PATTERN, // 디자인 패턴 적용
    SYSTEM_DESIGN,  // 시스템 설계
    READING,        // 학습 자료 읽기
    RESEARCH        // 기술 조사
}

/**
 * 문제 난이도
 */
@Serializable
enum class ProblemDifficulty {
    EASY,   // 쉬움
    MEDIUM, // 보통
    HARD,   // 어려움
    EXPERT  // 전문가
}

/**
 * 테스트 케이스
 */
@Serializable
data class TestCase(
    val input: String,
    val expectedOutput: String,
    val explanation: String? = null
)

/**
 * 학습 자료
 */
@Serializable
data class StudyResource(
    val type: StudyResourceType,
    val title: String,
    val url: String,
    val description: String? = null
)

/**
 * 스터디 자료 타입 (Study 모듈용)
 */
@Serializable
enum class StudyResourceType {
    DOCUMENTATION, // 공식 문서
    TUTORIAL,      // 튜토리얼
    VIDEO,         // 영상
    ARTICLE,       // 글/블로그
    GITHUB,        // GitHub 저장소
    BOOK,          // 책
    TOOL,          // 도구/라이브러리
    COURSE         // 강의
}

/**
 * 코드 제출
 */
@Serializable
data class CodeSubmission(
    val id: String,
    val problemId: String,
    val userId: String,
    val language: ProgrammingLanguage,
    val code: String,
    val status: SubmissionStatus,
    val executionTime: Long? = null, // 실행 시간 (ms)
    val memoryUsage: Long? = null,   // 메모리 사용량 (bytes)
    val testResults: List<TestResult> = emptyList(),
    val feedback: String? = null,
    val submittedAt: LocalDateTime
)

/**
 * 제출 상태
 */
@Serializable
enum class SubmissionStatus {
    PENDING,    // 대기 중
    ACCEPTED,   // 통과
    REJECTED,   // 실패
    TIMEOUT,    // 시간 초과
    ERROR,      // 실행 오류
    REVIEW      // 리뷰 대기
}

/**
 * 테스트 결과
 */
@Serializable
data class TestResult(
    val testCaseIndex: Int,
    val passed: Boolean,
    val actualOutput: String,
    val error: String? = null
)

/**
 * 코드 리뷰
 */
@Serializable
data class CodeReview(
    val id: String,
    val submissionId: String,
    val reviewerId: String,
    val rating: Int, // 1-5점
    val comments: List<ReviewComment> = emptyList(),
    val overallFeedback: String,
    val suggestions: List<String> = emptyList(),
    val isApproved: Boolean = false,
    val createdAt: LocalDateTime
)

/**
 * 리뷰 댓글
 */
@Serializable
data class ReviewComment(
    val lineNumber: Int? = null,
    val comment: String,
    val type: CommentType,
    val createdAt: LocalDateTime
)

/**
 * 댓글 타입
 */
@Serializable
enum class CommentType {
    SUGGESTION,  // 제안
    QUESTION,    // 질문
    PRAISE,      // 칭찬
    ISSUE,       // 문제점
    GENERAL      // 일반 의견
}

/**
 * 스터디 세션
 */
@Serializable
data class StudySession(
    val id: String,
    val studyGroupId: String,
    val title: String,
    val description: String,
    val sessionType: SessionType,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val participants: List<String> = emptyList(),
    val agenda: List<String> = emptyList(),
    val materials: List<StudyResource> = emptyList(),
    val notes: String? = null,
    val recordings: List<String> = emptyList(), // 녹화 파일 URLs
    val createdBy: String,
    val createdAt: LocalDateTime
)

/**
 * 세션 타입
 */
@Serializable
enum class SessionType {
    REGULAR_MEETING,  // 정기 모임
    CODE_REVIEW,      // 코드 리뷰 세션
    PROBLEM_SOLVING,  // 문제 해결 세션
    PAIR_PROGRAMMING, // 페어 프로그래밍
    PRESENTATION,     // 발표
    DISCUSSION,       // 토론
    WORKSHOP,         // 워크샵
    RETROSPECTIVE     // 회고
}

/**
 * 질문답변
 */
@Serializable
data class StudyQuestion(
    val id: String,
    val studyGroupId: String,
    val authorId: String,
    val title: String,
    val content: String,
    val tags: List<String> = emptyList(),
    val language: ProgrammingLanguage? = null,
    val codeSnippet: String? = null,
    val status: QuestionStatus = QuestionStatus.OPEN,
    val answers: List<StudyAnswer> = emptyList(),
    val upvotes: Int = 0,
    val views: Int = 0,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

/**
 * 질문 상태
 */
@Serializable
enum class QuestionStatus {
    OPEN,     // 열림
    ANSWERED, // 답변됨
    RESOLVED, // 해결됨
    CLOSED    // 닫힘
}

/**
 * 답변
 */
@Serializable
data class StudyAnswer(
    val id: String,
    val questionId: String,
    val authorId: String,
    val content: String,
    val codeSnippet: String? = null,
    val isAccepted: Boolean = false,
    val upvotes: Int = 0,
    val createdAt: LocalDateTime
)

/**
 * 학습 통계
 */
@Serializable
data class LearningAnalytics(
    val userId: String,
    val studyGroupId: String,
    val period: AnalyticsPeriod,
    val problemsSolved: Int = 0,
    val totalStudyTime: Long = 0L, // 분 단위
    val languageBreakdown: Map<ProgrammingLanguage, Int> = emptyMap(),
    val difficultyBreakdown: Map<ProblemDifficulty, Int> = emptyMap(),
    val streakData: StreakData,
    val skillProgress: List<SkillProgress> = emptyList(),
    val generatedAt: LocalDateTime
)

/**
 * 분석 기간
 */
@Serializable
enum class AnalyticsPeriod {
    DAILY, WEEKLY, MONTHLY, YEARLY, ALL_TIME
}

/**
 * 연속 기록 데이터
 */
@Serializable
data class StreakData(
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val weeklyActivity: List<Int> = emptyList(), // 최근 7일 활동
    val monthlyActivity: List<Int> = emptyList() // 최근 30일 활동
)

/**
 * 스킬 진행도
 */
@Serializable
data class SkillProgress(
    val skill: String,
    val level: Int,
    val experience: Int,
    val nextLevelExp: Int
) 