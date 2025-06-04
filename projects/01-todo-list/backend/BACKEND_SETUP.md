# 🚀 Todo List Backend 실행 가이드

## 📋 목차
- [필수 요구사항](#필수-요구사항)
- [백엔드 서버 실행 방법](#백엔드-서버-실행-방법)
- [문제 해결](#문제-해결)
- [API 엔드포인트 확인](#api-엔드포인트-확인)

## 🔧 필수 요구사항

- **Java**: 17 이상
- **Gradle**: 8.14.1 (프로젝트에 포함된 Gradle Wrapper 사용 권장)

## 🚀 백엔드 서버 실행 방법

### ⚠️ 중요: Gradle run 방식의 문제점

**❌ 사용하지 말아야 할 방법:**
```bash
./gradlew run
```
- macOS 환경에서 프로세스 관리 문제로 SIGTERM(exit code 143) 오류 발생
- 약 83% 빌드 후 강제 종료되는 현상

### ✅ 권장하는 정확한 실행 방법

#### 1단계: 프로젝트 디렉토리로 이동
```bash
cd projects/01-todo-list/backend
```

#### 2단계: JAR 파일 빌드
```bash
./gradlew buildFatJar
```

#### 3단계: JAR 파일 직접 실행
```bash
# 포그라운드 실행 (개발용)
java -jar build/libs/todo-app.jar

# 또는 백그라운드 실행 (테스트용)
java -jar build/libs/todo-app.jar &
```

### 🎯 성공적인 실행 확인

서버가 정상적으로 시작되면 다음과 같은 로그가 출력됩니다:

```
INFO ktor.application -- Application started in 0.165 seconds.
INFO ktor.application -- Responding at http://0.0.0.0:8080
```

## 🔍 문제 해결

### 자주 발생하는 문제들

#### 1. "Unable to access jarfile" 오류
```bash
Error: Unable to access jarfile build/libs/todo-app.jar
```

**해결방법:**
- 현재 디렉토리가 `projects/01-todo-list/backend`인지 확인
- JAR 파일이 존재하는지 확인: `ls -la build/libs/`
- 다시 빌드: `./gradlew buildFatJar`

#### 2. 포트 8080 이미 사용 중
```bash
Address already in use
```

**해결방법:**
```bash
# 포트 8080 사용 프로세스 확인
lsof -i :8080

# 프로세스 종료 (PID는 위 명령어 결과 참조)
kill -9 <PID>
```

#### 3. SIGTERM 오류 (Gradle run 사용 시)
```bash
Process 'command './gradlew'' finished with non-zero exit value 143
```

**해결방법:**
- Gradle run 대신 JAR 직접 실행 방식 사용
- 위의 [권장하는 정확한 실행 방법](#-권장하는-정확한-실행-방법) 참조

## 🌐 API 엔드포인트 확인

### Health Check
```bash
curl http://localhost:8080/health
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": 1749034788828
  }
}
```

### 메인 엔드포인트
```bash
curl http://localhost:8080/
```

### Todo API
```bash
# 모든 Todo 조회
curl http://localhost:8080/api/todos

# 새 Todo 생성
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트 할일","priority":"MEDIUM"}'
```

## 📝 서버 종료 방법

### 포그라운드 실행 시
- `Ctrl + C` 또는 `Cmd + C`

### 백그라운드 실행 시
```bash
# Java 프로세스 찾기
ps aux | grep java | grep todo-app

# PID로 종료
kill <PID>

# 또는 강제 종료
pkill -f todo-app.jar
```

## 🏗️ 개발 환경 설정

### JVM 메모리 설정 (이미 적용됨)
`build.gradle.kts`에 다음 설정이 포함되어 있습니다:

```kotlin
tasks.withType<JavaExec> {
    jvmArgs("-Xmx512m", "-Xms128m", "-XX:+UseG1GC")
}
```

### 로그 레벨 조정
필요 시 `src/main/resources/logback.xml`에서 로그 레벨을 조정할 수 있습니다.

---

## 🔄 자동화 스크립트 (선택사항)

프로젝트 루트에 `start-backend.sh` 스크립트를 생성하여 실행을 자동화할 수 있습니다:

```bash
#!/bin/bash
cd projects/01-todo-list/backend
./gradlew buildFatJar
java -jar build/libs/todo-app.jar
```

**사용법:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

---

💡 **추가 문의사항이 있으시면 프로젝트 이슈를 생성해주세요!** 