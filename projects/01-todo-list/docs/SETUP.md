# 🛠 설치 가이드

Todo List 앱의 개발 환경 설정을 위한 상세 가이드입니다.

## 📋 필수 요구사항

### 시스템 요구사항
- **운영체제**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **메모리**: 최소 4GB RAM (권장 8GB+)
- **디스크**: 최소 2GB 여유 공간

### 필수 소프트웨어

#### 1. Java Development Kit (JDK)
```bash
# 버전 확인
java -version

# 필요 버전: JDK 17 이상
# 권장: OpenJDK 17 또는 Oracle JDK 17
```

**설치 방법:**
- **macOS**: `brew install openjdk@17`
- **Windows**: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) 또는 [OpenJDK](https://adoptium.net/)
- **Linux**: `sudo apt install openjdk-17-jdk`

#### 2. Node.js
```bash
# 버전 확인
node --version
npm --version

# 필요 버전: Node.js 18+ (권장 18.18.0+)
```

**설치 방법:**
- **공식 웹사이트**: [nodejs.org](https://nodejs.org/)
- **nvm 사용** (권장):
  ```bash
  # nvm 설치 후
  nvm install 18
  nvm use 18
  ```

#### 3. pnpm (패키지 매니저)
```bash
# 설치
npm install -g pnpm

# 버전 확인
pnpm --version

# 필요 버전: 8.0.0+
```

#### 4. Git
```bash
# 버전 확인
git --version

# 필요 버전: 2.0+
```

## 🚀 프로젝트 설정

### 1. 저장소 클론
```bash
# HTTPS
git clone https://github.com/your-username/todo-app.git

# SSH (권장)
git clone git@github.com:your-username/todo-app.git

cd todo-app
```

### 2. 백엔드 설정 (Ktor)

#### 디렉토리 이동
```bash
cd backend
```

#### Gradle 권한 설정 (macOS/Linux)
```bash
chmod +x gradlew
```

#### 의존성 다운로드 및 빌드 테스트
```bash
# Unix/Linux/macOS
./gradlew build

# Windows
gradlew.bat build
```

#### 서버 실행
```bash
# 개발 서버 시작
./gradlew run

# 성공 시 출력:
# [main] INFO ktor.application - Responding at http://0.0.0.0:8080
```

#### 백엔드 테스트
```bash
# 새 터미널에서
curl http://localhost:8080/api/todos

# 예상 응답: []
```

### 3. 프론트엔드 설정 (Next.js)

#### 디렉토리 이동
```bash
# 루트 디렉토리에서
cd frontend
```

#### 의존성 설치
```bash
pnpm install
```

#### 개발 서버 실행
```bash
pnpm dev
```

#### 프론트엔드 접속
브라우저에서 http://localhost:3000 접속

## 🔧 개발 환경 설정

### IDE 설정

#### IntelliJ IDEA (백엔드)
1. **프로젝트 열기**: `backend` 폴더를 Gradle 프로젝트로 열기
2. **JDK 설정**: File → Project Structure → Project → SDK: JDK 17
3. **Kotlin 플러그인**: 기본 설치됨 (최신 버전 확인)
4. **코드 스타일**: Kotlin Official 스타일 적용

#### Visual Studio Code (프론트엔드)
**필수 확장 프로그램:**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

**설정 파일 (`.vscode/settings.json`):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### 환경 변수 설정

#### 백엔드 (application.conf)
```hocon
# backend/src/main/resources/application.conf
ktor {
    deployment {
        port = 8080
        port = ${?PORT}
    }
    application {
        modules = [ com.todoapp.ApplicationKt.module ]
    }
}
```

#### 프론트엔드 (.env.local)
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME="Todo List App"
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

## 🐛 문제 해결

### 자주 발생하는 문제들

#### 1. 포트 충돌
```bash
# 8080 포트 사용 중인 프로세스 확인
# macOS/Linux
lsof -i :8080

# Windows
netstat -ano | findstr :8080

# 프로세스 종료 후 재시작
```

#### 2. Gradle 빌드 실패
```bash
# Gradle Wrapper 재다운로드
./gradlew wrapper --gradle-version 8.4

# 캐시 정리
./gradlew clean
./gradlew build --refresh-dependencies
```

#### 3. pnpm 설치 오류
```bash
# 캐시 정리
pnpm store prune

# 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 4. CORS 오류
백엔드 CORS 설정 확인:
```kotlin
install(CORS) {
    allowHost("localhost:3000")
    allowHost("127.0.0.1:3000")
    allowHeader(HttpHeaders.ContentType)
    allowMethod(HttpMethod.Options)
    allowMethod(HttpMethod.Put)
    allowMethod(HttpMethod.Delete)
    allowMethod(HttpMethod.Patch)
}
```

### 성능 최적화

#### JVM 설정 (선택사항)
```bash
# backend/gradle.properties
org.gradle.jvmargs=-Xmx2g -XX:MaxMetaspaceSize=512m
```

#### Node.js 메모리 설정 (선택사항)
```bash
# frontend/package.json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
  }
}
```

## ✅ 설정 완료 확인

### 체크리스트
- [ ] JDK 17+ 설치 및 `java -version` 확인
- [ ] Node.js 18+ 설치 및 `node --version` 확인
- [ ] pnpm 설치 및 `pnpm --version` 확인
- [ ] 백엔드 서버 정상 실행 (http://localhost:8080)
- [ ] 프론트엔드 서버 정상 실행 (http://localhost:3000)
- [ ] API 통신 테스트 성공
- [ ] 개발 도구 설정 완료

### 다음 단계
설정이 완료되면 [개발 가이드](./DEVELOPMENT.md)를 참조하여 개발을 시작하세요.

## 🆘 추가 도움

### 공식 문서
- [Ktor 문서](https://ktor.io/docs/)
- [Next.js 문서](https://nextjs.org/docs)
- [Kotlin 문서](https://kotlinlang.org/docs/)

### 커뮤니티
- [Ktor GitHub](https://github.com/ktorio/ktor)
- [Next.js GitHub](https://github.com/vercel/next.js)

문제가 지속되면 [이슈 등록](../../issues)을 통해 도움을 요청하세요. 