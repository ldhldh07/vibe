package com.todoapp.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*

fun Route.aiRoutes() {
    route("/ai") {
        /**
         * 🤖 OpenAI API 직접 테스트 
         * POST /api/ai/chat
         */
        post("/chat") {
            try {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString()
                    ?: return@post call.respond(HttpStatusCode.Unauthorized, 
                        mapOf("error" to "인증이 필요합니다"))
                
                val openAiApiKey = System.getenv("OPENAI_API_KEY")
                if (openAiApiKey == null) {
                    return@post call.respond(HttpStatusCode.BadRequest, ChatResponse(
                        success = false,
                        question = "",
                        answer = "",
                        userId = userId,
                        model = "",
                        error = "OpenAI API 키가 설정되지 않았습니다"
                    ))
                }
                
                val requestBody = call.receive<ChatRequest>()
                
                // HTTP 클라이언트 생성
                val httpClient = HttpClient(CIO) {
                    install(ContentNegotiation) {
                        json(Json {
                            ignoreUnknownKeys = true
                            isLenient = true
                        })
                    }
                }
                
                // OpenAI API 요청
                val openAiRequest = OpenAiRequest(
                    model = "gpt-4o-mini",
                    messages = listOf(
                        OpenAiMessage(role = "system", content = "당신은 친근한 학습 도우미입니다."),
                        OpenAiMessage(role = "user", content = requestBody.message)
                    ),
                    max_tokens = 200,
                    temperature = 0.7
                )
                
                println("🚀 OpenAI API 호출 시작...")
                println("📝 사용자 질문: ${requestBody.message}")
                
                val response = httpClient.post("https://api.openai.com/v1/chat/completions") {
                    header("Authorization", "Bearer $openAiApiKey")
                    header("Content-Type", "application/json")
                    setBody(openAiRequest)
                }
                
                val responseText = response.body<String>()
                println("🔍 OpenAI API 응답: $responseText")
                
                httpClient.close()
                
                // JSON 파싱 및 오류 처리
                val aiAnswer = try {
                    val jsonResponse = Json.parseToJsonElement(responseText).jsonObject
                    
                    // 오류 응답 체크
                    val errorObject = jsonResponse["error"]?.jsonObject
                    if (errorObject != null) {
                        val errorType = errorObject["type"]?.jsonPrimitive?.content
                        val errorMessage = errorObject["message"]?.jsonPrimitive?.content ?: "알 수 없는 오류"
                        
                        println("❌ OpenAI API 오류 감지: $errorType - $errorMessage")
                        
                        // 할당량 초과나 키 문제 시 데모 응답 반환
                        if (errorType == "insufficient_quota" || errorType == "invalid_api_key" || 
                            errorMessage.contains("quota") || errorMessage.contains("billing")) {
                            getDemoResponse(requestBody.message)
                        } else {
                            "OpenAI API 오류: $errorMessage"
                        }
                    } else {
                        // 정상 응답 파싱
                        val choices = jsonResponse["choices"]?.jsonArray
                        choices?.firstOrNull()?.jsonObject?.get("message")?.jsonObject?.get("content")?.jsonPrimitive?.content
                            ?: "AI 응답을 파싱하지 못했습니다"
                    }
                } catch (e: Exception) {
                    println("❌ JSON 파싱 실패: ${e.message}")
                    // 파싱 실패 시에도 데모 응답 시도
                    if (responseText.contains("quota") || responseText.contains("billing")) {
                        getDemoResponse(requestBody.message)
                    } else {
                        "응답 처리 중 오류가 발생했습니다: ${e.message}"
                    }
                }
                
                println("✅ AI 응답 받음: $aiAnswer")
                
                call.respond(HttpStatusCode.OK, ChatResponse(
                    success = true,
                    question = requestBody.message,
                    answer = aiAnswer,
                    userId = userId,
                    model = "gpt-4o-mini"
                ))
                
            } catch (e: Exception) {
                println("❌ OpenAI API 오류: ${e.message}")
                call.respond(HttpStatusCode.InternalServerError, ChatResponse(
                    success = false,
                    question = "",
                    answer = "",
                    userId = "",
                    model = "",
                    error = "OpenAI API 호출 실패: ${e.message}"
                ))
            }
        }
    }
}

/**
 * 🎭 데모 응답 생성 함수 
 * OpenAI API 할당량 초과 시 사용
 */
fun getDemoResponse(question: String): String {
    return when {
        question.contains("react", ignoreCase = true) || question.contains("리액트", ignoreCase = true) -> {
            """🚀 **React 학습 가이드** (데모 모드)

📚 **기초 단계 (2-3주)**
• HTML/CSS/JavaScript 기초 완료 필수
• Create React App으로 프로젝트 시작
• 컴포넌트와 JSX 문법 익히기
• Props와 State 개념 이해

⚡ **실전 단계 (4-6주)**  
• Hooks (useState, useEffect) 마스터
• 이벤트 처리와 폼 다루기
• API 연동 (fetch, axios)
• 상태 관리 (Context API → Redux)

🎯 **프로젝트 단계 (6-8주)**
• Todo List, 영화 검색 앱 제작
• React Router로 SPA 구현
• 컴포넌트 라이브러리 활용
• 배포 (Vercel, Netlify)

💡 **추천 학습 순서**: 공식 문서 → 실습 프로젝트 → 커뮤니티 참여
🔗 **유용한 자료**: React 공식 문서, 벨로퍼트 모던 리액트"""
        }
        question.contains("javascript", ignoreCase = true) || question.contains("자바스크립트", ignoreCase = true) -> {
            """⚡ **JavaScript - 웹의 핵심 언어** (데모 모드)

🌟 **한 줄 요약**: 브라우저와 서버에서 동작하는 동적이고 유연한 프로그래밍 언어로, 웹 개발의 필수 요소입니다.

💻 **주요 특징**:
• 인터프리터 언어 (즉시 실행)
• 동적 타이핑 (변수 타입 자동 결정)  
• 객체 지향 + 함수형 프로그래밍
• 이벤트 기반 비동기 처리

🚀 **활용 분야**:
• 프론트엔드: React, Vue, Angular
• 백엔드: Node.js, Express
• 모바일: React Native
• 데스크톱: Electron"""
        }
        question.contains("node", ignoreCase = true) || question.contains("nodejs", ignoreCase = true) -> {
            """🟢 **Node.js 학습 3단계** (데모 모드)

**1단계 - 기초**: JavaScript ES6+ 문법 완료 → Node.js 설치 → npm/yarn 패키지 관리 학습

**2단계 - 핵심**: Express.js 프레임워크 → REST API 개발 → 데이터베이스 연동 (MongoDB/MySQL)

**3단계 - 실전**: JWT 인증 시스템 → 파일 업로드 → 실시간 통신 (Socket.io) → 배포 (AWS/Heroku)"""
        }
        question.contains("python", ignoreCase = true) || question.contains("파이썬", ignoreCase = true) -> {
            """🐍 **Python - 쉽고 강력한 언어** (데모 모드)

**특징**: 가독성이 좋고 배우기 쉬운 문법, 풍부한 라이브러리 생태계를 가진 다목적 프로그래밍 언어

**추천 학습법**:
• 기초: 변수, 제어문, 함수 → 자료구조 (리스트, 딕셔너리)
• 응용: 객체지향 프로그래밍 → 파일 처리 → 라이브러리 활용
• 특화: 웹개발(Django/Flask), 데이터분석(Pandas), AI(TensorFlow)

**프로젝트 아이디어**: 계산기 → 텍스트 게임 → 웹 크롤러 → 데이터 시각화"""
        }
        question.contains("학습", ignoreCase = true) || question.contains("공부", ignoreCase = true) -> {
            """📖 **효과적인 프로그래밍 학습법** (데모 모드)

🎯 **핵심 원칙**:
• 이론 30% : 실습 70% 비율 유지
• 작은 프로젝트부터 시작해서 점진적 확장
• 매일 조금씩이라도 꾸준히 코딩
• 막히면 구글링보다 공식 문서 먼저

⚡ **실습 중심 로드맵**:
1. 문법 익히기 (1-2주)
2. 미니 프로젝트 (2-3주) 
3. 실전 프로젝트 (4-8주)
4. 코드 리뷰 & 리팩토링 (지속)

💡 **추천**: 개인 블로그에 학습 내용 정리하며 성장 기록 남기기"""
        }
        else -> {
            """🤖 **AI 학습 도우미** (데모 모드)

안녕하세요! 현재 OpenAI API 할당량이 초과되어 데모 모드로 동작하고 있습니다.

💬 **질문 예시**:
• "React 학습 방법 알려줘"
• "JavaScript를 설명해줘" 
• "Node.js 공부법 3줄 요약"
• "Python 특징이 뭐야?"

🔧 **시스템 상태**:
✅ 백엔드 서버: 정상 연결
✅ 인증 시스템: 정상 동작  
⚠️ OpenAI API: 할당량 초과 (데모 모드)

더 구체적인 질문을 해주시면 관련된 학습 가이드를 제공해드릴게요!"""
        }
    }
}

@Serializable
data class ChatRequest(
    val message: String
)

@Serializable
data class OpenAiRequest(
    val model: String,
    val messages: List<OpenAiMessage>,
    val max_tokens: Int,
    val temperature: Double
)

@Serializable
data class OpenAiMessage(
    val role: String,
    val content: String
)

@Serializable
data class OpenAiResponse(
    val choices: List<OpenAiChoice>
)

@Serializable
data class OpenAiChoice(
    val message: OpenAiMessage
)

@Serializable
data class ChatResponse(
    val success: Boolean,
    val question: String,
    val answer: String,
    val userId: String,
    val model: String,
    val error: String? = null
) 