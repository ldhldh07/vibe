#!/bin/bash

echo "🔥 개발 모드로 백엔드 시작..."

# 기존 프로세스 종료
pkill -f "todo-app.jar" 2>/dev/null
pkill -f "gradle.*run" 2>/dev/null

# gradle daemon 사용해서 빠른 실행
echo "⚡ gradle 개발 서버 시작중..."
./gradlew run --daemon --quiet 