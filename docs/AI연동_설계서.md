# AI 연동 시스템 설계서

## 📋 개요

AI 넥서스 코퍼레이션의 에이전트들이 실제 AI를 통해 작업을 수행하는 시스템 설계

### 핵심 원칙
- **설계**: Claude (시스템 아키텍처, 프롬프트 설계)
- **실행**: Gemini API (실제 태스크 수행)
- **확장성**: 다른 AI 프로바이더 추가 가능한 구조

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Company Conductor                         │
│                      (CEO 오케스트레이터)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Provider Manager                          │
│         (프로바이더 관리 및 라우팅)                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Gemini    │  │   Claude    │  │    GPT      │             │
│  │  Provider   │  │  Provider   │  │  Provider   │             │
│  │  (Primary)  │  │  (Backup)   │  │  (Backup)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI-Powered Agents                            │
│              (실제 AI 기반 에이전트)                              │
├─────────────────────────────────────────────────────────────────┤
│  Backend Lead │ Frontend Lead │ QA Lead │ Security Lead │ ...  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 파일 구조

```
src/ai/
├── index.ts                    # AI 모듈 엔트리
├── types.ts                    # AI 관련 타입 정의
├── AIProviderManager.ts        # 프로바이더 관리자
│
├── providers/
│   ├── index.ts
│   ├── BaseProvider.ts         # 프로바이더 기본 클래스
│   ├── GeminiProvider.ts       # Google Gemini (Primary)
│   ├── ClaudeProvider.ts       # Anthropic Claude (Backup)
│   └── MockProvider.ts         # 테스트용 Mock
│
├── prompts/
│   ├── index.ts
│   ├── PromptBuilder.ts        # 프롬프트 빌더
│   ├── SystemPrompts.ts        # 시스템 프롬프트 템플릿
│   └── TaskPrompts.ts          # 태스크별 프롬프트
│
└── agents/
    ├── index.ts
    └── AIAgent.ts              # AI 기반 에이전트 클래스
```

---

## 🔌 인터페이스 설계

### 1. AI Provider Interface

```typescript
interface AIProvider {
  name: 'gemini' | 'claude' | 'gpt' | 'local'
  isConfigured: boolean

  // 기본 완성
  complete(messages: AIMessage[], options?: CompletionOptions): Promise<AIResult>

  // 스트리밍 (선택)
  stream?(messages: AIMessage[], onChunk: (chunk: string) => void): Promise<AIResult>

  // 헬스 체크
  healthCheck(): Promise<boolean>
}
```

### 2. AI Message Format

```typescript
interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIResult {
  content: string
  model: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
  finishReason: 'complete' | 'max_tokens' | 'error'
}
```

### 3. Completion Options

```typescript
interface CompletionOptions {
  model?: string           // 모델 지정
  temperature?: number     // 창의성 (0-1)
  maxTokens?: number       // 최대 토큰
  systemPrompt?: string    // 시스템 프롬프트
}
```

---

## 🎯 Gemini Provider 상세 설계

### API 연결 정보
- **Base URL**: `https://generativelanguage.googleapis.com/v1beta`
- **인증**: API Key (환경 변수)
- **Primary Model**: `gemini-1.5-pro` 또는 `gemini-1.5-flash`

### 클래스 구조

```typescript
class GeminiProvider extends BaseProvider {
  name = 'gemini'

  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(config: GeminiConfig) {
    // API 키 설정
    // 기본 모델 설정
  }

  async complete(messages: AIMessage[], options?: CompletionOptions): Promise<AIResult> {
    // 1. 메시지 포맷 변환 (Gemini 형식)
    // 2. API 호출
    // 3. 응답 파싱
    // 4. 결과 반환
  }

  private formatForGemini(messages: AIMessage[]): GeminiContent[] {
    // AIMessage → Gemini Content 변환
  }
}
```

### Gemini API 요청 형식

```typescript
// 요청
{
  contents: [
    {
      role: "user",
      parts: [{ text: "메시지 내용" }]
    }
  ],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4096,
  },
  systemInstruction: {
    parts: [{ text: "시스템 프롬프트" }]
  }
}

// 응답
{
  candidates: [{
    content: {
      parts: [{ text: "응답 내용" }],
      role: "model"
    },
    finishReason: "STOP"
  }],
  usageMetadata: {
    promptTokenCount: 100,
    candidatesTokenCount: 200
  }
}
```

---

## 🤖 AI Agent 설계

### AIAgent 클래스

```typescript
class AIAgent extends BaseAgent {
  private provider: AIProvider
  private promptBuilder: PromptBuilder

  constructor(config: AgentConfig, provider: AIProvider) {
    super(config)
    this.provider = provider
    this.promptBuilder = new PromptBuilder(config)
  }

  async execute(task: Task): Promise<Task> {
    // 1. 태스크 분석
    // 2. 프롬프트 생성
    // 3. AI 호출
    // 4. 결과 파싱
    // 5. 태스크 완료
  }

  async processMessage(message: Message): Promise<Message | null> {
    // 메시지 처리
  }
}
```

### 역할별 시스템 프롬프트

```typescript
const SYSTEM_PROMPTS = {
  'backend-lead': `
    당신은 AI 넥서스 코퍼레이션의 백엔드 리드입니다.
    역할:
    - API 설계 및 개발
    - 시스템 아키텍처 검토
    - 코드 리뷰
    - 팀 멘토링

    기술 스택: Node.js, Python, PostgreSQL, Redis

    응답 형식:
    - 명확하고 구조화된 답변
    - 코드 예시 포함
    - 모범 사례 제시
  `,

  'frontend-lead': `
    당신은 AI 넥서스 코퍼레이션의 프론트엔드 리드입니다.
    역할:
    - UI/UX 구현
    - 컴포넌트 설계
    - 성능 최적화
    - 접근성 보장

    기술 스택: React, TypeScript, Next.js, TailwindCSS
  `,

  // ... 각 역할별 프롬프트
}
```

---

## ⚙️ 환경 설정

### .env 파일

```env
# Gemini (Primary)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-pro

# Claude (Backup)
ANTHROPIC_API_KEY=your-anthropic-api-key
CLAUDE_MODEL=claude-3-sonnet

# OpenAI (Backup)
OPENAI_API_KEY=your-openai-api-key
GPT_MODEL=gpt-4

# 기본 설정
DEFAULT_AI_PROVIDER=gemini
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=4096
AI_TIMEOUT=60000
```

### Config 타입

```typescript
interface AIConfig {
  provider: 'gemini' | 'claude' | 'gpt'
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  timeout: number
  fallbackProviders: string[]
}
```

---

## 🔄 실행 흐름

### 태스크 실행 흐름

```
1. Conductor가 태스크 생성
         │
         ▼
2. TaskDistributor가 적합한 에이전트 선택
         │
         ▼
3. AIAgent가 태스크 수신
         │
         ▼
4. PromptBuilder가 프롬프트 생성
   - 시스템 프롬프트 (역할 정의)
   - 태스크 프롬프트 (작업 내용)
   - 컨텍스트 (이전 대화, 관련 정보)
         │
         ▼
5. GeminiProvider에 API 요청
         │
         ▼
6. 응답 수신 및 파싱
         │
         ▼
7. 태스크 결과 업데이트
         │
         ▼
8. Conductor에 완료 보고
```

### 에러 처리 및 폴백

```
GeminiProvider 호출
         │
    ┌────┴────┐
    │ 성공?   │
    └────┬────┘
         │
    Yes ─┼─ No
         │    │
         ▼    ▼
      결과  ClaudeProvider (폴백)
      반환        │
             ┌────┴────┐
             │ 성공?   │
             └────┬────┘
                  │
             Yes ─┼─ No
                  │    │
                  ▼    ▼
               결과  에러 반환
               반환
```

---

## 📊 모니터링 및 로깅

### AI 호출 로깅

```typescript
interface AICallLog {
  id: string
  timestamp: Date
  provider: string
  model: string
  agentId: string
  taskId?: string

  request: {
    messages: AIMessage[]
    options: CompletionOptions
  }

  response: {
    content: string
    usage: TokenUsage
    latencyMs: number
  }

  error?: string
}
```

### 메트릭스

- **API 호출 횟수**: 프로바이더별, 에이전트별
- **토큰 사용량**: 입력/출력 토큰
- **응답 시간**: 평균, P95, P99
- **성공률**: 프로바이더별
- **비용 추정**: 토큰 기반

---

## 🚀 구현 순서

### Phase 1: 기본 구조 (필수)
1. `src/ai/types.ts` - 타입 정의
2. `src/ai/providers/BaseProvider.ts` - 기본 클래스
3. `src/ai/providers/GeminiProvider.ts` - Gemini 구현
4. `.env.example` - 환경 변수 템플릿

### Phase 2: 프롬프트 시스템
5. `src/ai/prompts/SystemPrompts.ts` - 역할별 프롬프트
6. `src/ai/prompts/TaskPrompts.ts` - 태스크 프롬프트
7. `src/ai/prompts/PromptBuilder.ts` - 프롬프트 조합

### Phase 3: AI 에이전트
8. `src/ai/agents/AIAgent.ts` - AI 기반 에이전트
9. `src/ai/AIProviderManager.ts` - 프로바이더 관리
10. `src/ai/index.ts` - 모듈 익스포트

### Phase 4: 통합
11. Conductor 업데이트 - AI 에이전트 사용
12. 데모 스크립트 업데이트
13. 테스트 및 검증

---

## ✅ 완료 조건

- [ ] Gemini API 연결 성공
- [ ] 에이전트가 실제 AI로 태스크 수행
- [ ] 역할별 맞춤 응답 생성
- [ ] 에러 처리 및 폴백 동작
- [ ] 로깅 및 모니터링

---

*설계: Claude | 실행: Gemini*
