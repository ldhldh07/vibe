#!/bin/bash

echo "🚀 백엔드 시작 중..."

# 이미 실행 중인 프로세스가 있으면 종료
pkill -f "todo-app.jar" 2>/dev/null

# JAR 파일이 없거나 소스가 더 최신이면 빌드
if [ ! -f "build/libs/todo-app.jar" ] || [ "src/main/kotlin/com/todoapp/Application.kt" -nt "build/libs/todo-app.jar" ]; then
    echo "📦 빌드 중..."
    ./gradlew build -q --daemon
fi

echo "✅ 백엔드 실행: http://localhost:8080"
echo "🔄 종료하려면 Ctrl+C를 누르세요"

# JAR 실행
java -jar build/libs/todo-app.jar 