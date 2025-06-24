plugins {
    kotlin("jvm") version "1.9.20"
    kotlin("plugin.serialization") version "1.9.20"
    id("io.ktor.plugin") version "2.3.6"
    application
}

group = "com.todoapp"
version = "1.0.0"

application {
    mainClass.set("com.todoapp.ApplicationKt")
    
    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf(
        "-Dio.ktor.development=$isDevelopment",
        "-Xmx512m",  // 최대 힙 메모리 512MB로 설정
        "-Xms128m",  // 초기 힙 메모리 128MB로 설정
        "-XX:+UseG1GC",  // G1 가비지 컬렉터 사용
        "-XX:MaxGCPauseMillis=200",  // GC 일시정지 시간 최대 200ms
        "-Dfile.encoding=UTF-8",  // 파일 인코딩 UTF-8로 고정
        "-Djava.net.preferIPv4Stack=true"  // IPv4 우선 사용
    )
}

repositories {
    mavenCentral()
}

dependencies {
    // Ktor Server Core
    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-netty-jvm")
    
    // Content Negotiation & Serialization
    implementation("io.ktor:ktor-server-content-negotiation-jvm")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm")
    
    // CORS Support
    implementation("io.ktor:ktor-server-cors-jvm")
    
    // Status Pages (Error Handling)
    implementation("io.ktor:ktor-server-status-pages-jvm")
    
    // Call Logging
    implementation("io.ktor:ktor-server-call-logging-jvm")
    
    // Default Headers
    implementation("io.ktor:ktor-server-default-headers-jvm")
    
    // Validation
    implementation("io.ktor:ktor-server-request-validation-jvm")
    
    // Authentication & JWT
    implementation("io.ktor:ktor-server-auth-jvm")
    implementation("io.ktor:ktor-server-auth-jwt-jvm")
    implementation("com.auth0:java-jwt:4.4.0")
    
    // File Upload & Serving
    implementation("io.ktor:ktor-server-partial-content-jvm")
    implementation("io.ktor:ktor-server-auto-head-response-jvm")
    
    // Kotlinx DateTime for ISO 8601 support
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.5.0")
    
    // Ktor Client for HTTP requests (AI API calls)
    implementation("io.ktor:ktor-client-core-jvm")
    implementation("io.ktor:ktor-client-cio-jvm")
    implementation("io.ktor:ktor-client-content-negotiation-jvm")
    
    // Logging
    implementation("ch.qos.logback:logback-classic:1.4.14")
    
    // Testing
    testImplementation("io.ktor:ktor-server-tests-jvm")
    testImplementation("io.ktor:ktor-client-content-negotiation-jvm")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:1.9.20")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.1")
    testImplementation("org.assertj:assertj-core:3.24.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
}

tasks.test {
    useJUnitPlatform()
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-Xjsr305=strict",
            "-opt-in=kotlin.RequiresOptIn"
        )
    }
}

// Fat JAR configuration for deployment
ktor {
    fatJar {
        archiveFileName.set("todo-app.jar")
    }
    
    docker {
        jreVersion.set(JavaVersion.VERSION_17)
        localImageName.set("todo-app")
        imageTag.set("latest")
        
        portMappings.set(listOf(
            io.ktor.plugin.features.DockerPortMapping(
                80,
                8080,
                io.ktor.plugin.features.DockerPortMappingProtocol.TCP
            )
        ))
    }
}

// Development configuration
tasks.register("dev") {
    group = "application"
    description = "Run the application in development mode"
    doFirst {
        project.ext.set("development", true)
    }
    finalizedBy("run")
}

// Custom task for API documentation
tasks.register("docs") {
    group = "documentation"
    description = "Generate API documentation"
    doLast {
        println("API documentation available at: ../docs/API.md")
        println("Server will be running at: http://localhost:8080")
        println("Test endpoint: curl http://localhost:8080/api/todos")
    }
} 