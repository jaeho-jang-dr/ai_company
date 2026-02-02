/**
 * AI Company - Mock Provider
 * 테스트용 Mock AI 프로바이더
 */

import {
  AIProviderType,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
  AIProviderConfig,
} from '../types'
import { BaseProvider } from './BaseProvider'

export interface MockResponse {
  pattern: RegExp | string
  response: string
}

export class MockProvider extends BaseProvider {
  readonly name: AIProviderType = 'mock'
  private responses: MockResponse[]
  private defaultResponse: string
  private simulateLatency: boolean
  private latencyMs: number

  constructor(config: AIProviderConfig & {
    responses?: MockResponse[]
    defaultResponse?: string
    simulateLatency?: boolean
    latencyMs?: number
  } = {}) {
    super(config)
    this.responses = config.responses || []
    this.defaultResponse = config.defaultResponse || '네, 알겠습니다. 해당 작업을 수행하겠습니다.'
    this.simulateLatency = config.simulateLatency ?? true
    this.latencyMs = config.latencyMs ?? 500
    this._isConfigured = true
  }

  async complete(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<AICompletionResult> {
    const startTime = Date.now()

    // Simulate network latency
    if (this.simulateLatency) {
      await this.delay(this.latencyMs + Math.random() * 200)
    }

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    const userContent = lastUserMessage?.content || ''

    // Find matching response
    let responseContent = this.defaultResponse

    for (const { pattern, response } of this.responses) {
      const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern
      if (regex.test(userContent)) {
        responseContent = response
        break
      }
    }

    // Generate mock response based on task type
    if (!responseContent || responseContent === this.defaultResponse) {
      responseContent = this.generateContextualResponse(userContent, options.systemPrompt)
    }

    const latencyMs = Date.now() - startTime

    return {
      content: responseContent,
      model: 'mock-model',
      usage: {
        inputTokens: Math.ceil(userContent.length / 4),
        outputTokens: Math.ceil(responseContent.length / 4),
        totalTokens: Math.ceil((userContent.length + responseContent.length) / 4),
      },
      finishReason: 'complete',
      latencyMs,
    }
  }

  async healthCheck(): Promise<boolean> {
    return true
  }

  /**
   * Add a mock response pattern
   */
  addResponse(pattern: RegExp | string, response: string): void {
    this.responses.push({ pattern, response })
  }

  /**
   * Clear all mock responses
   */
  clearResponses(): void {
    this.responses = []
  }

  private generateContextualResponse(userContent: string, systemPrompt?: string): string {
    const lowerContent = userContent.toLowerCase()

    // Feature development
    if (lowerContent.includes('feature') || lowerContent.includes('implement') || lowerContent.includes('개발')) {
      return `## 기능 구현 계획

1. **요구사항 분석**
   - 사용자 스토리 검토
   - 기술적 제약사항 확인

2. **설계**
   - 아키텍처 설계
   - API 인터페이스 정의
   - 데이터 모델 설계

3. **구현**
   - 코어 로직 개발
   - 단위 테스트 작성
   - 코드 리뷰

4. **검증**
   - 통합 테스트
   - 성능 테스트
   - 보안 검토

예상 결과물: 완전히 테스트된 기능 모듈`
    }

    // Code review
    if (lowerContent.includes('review') || lowerContent.includes('검토')) {
      return `## 코드 리뷰 결과

### ✅ 잘된 점
- 코드 구조가 명확합니다
- 함수 네이밍이 적절합니다
- 에러 처리가 잘 되어 있습니다

### ⚠️ 개선 필요
- 일부 함수가 너무 깁니다 (분리 권장)
- 주석이 부족한 부분이 있습니다
- 테스트 커버리지 확인 필요

### 💡 제안사항
- 유틸리티 함수 분리 고려
- 타입 정의 강화
- 로깅 추가 권장`
    }

    // Testing
    if (lowerContent.includes('test') || lowerContent.includes('테스트')) {
      return `## 테스트 계획

### 단위 테스트
- 각 함수별 테스트 케이스 작성
- 엣지 케이스 포함
- 목 데이터 활용

### 통합 테스트
- API 엔드포인트 테스트
- 데이터베이스 연동 테스트
- 외부 서비스 연동 테스트

### E2E 테스트
- 사용자 시나리오 기반 테스트
- 크로스 브라우저 테스트

예상 커버리지: 80% 이상`
    }

    // Bug fix
    if (lowerContent.includes('bug') || lowerContent.includes('fix') || lowerContent.includes('버그')) {
      return `## 버그 분석 및 해결

### 원인 분석
1. 로그 분석 완료
2. 재현 조건 확인
3. 근본 원인 파악

### 해결 방안
- 조건문 수정
- 예외 처리 추가
- 유효성 검증 강화

### 테스트
- 회귀 테스트 통과
- 관련 기능 영향 없음 확인

수정 완료되었습니다.`
    }

    // Design
    if (lowerContent.includes('design') || lowerContent.includes('디자인') || lowerContent.includes('ui')) {
      return `## 디자인 제안

### UI 컴포넌트
- 깔끔하고 직관적인 레이아웃
- 반응형 디자인 적용
- 접근성 고려

### 색상 팔레트
- Primary: #533483
- Secondary: #0f3460
- Accent: #ffd93d

### 타이포그래피
- 헤딩: Pretendard Bold
- 본문: Pretendard Regular

디자인 시안을 준비하겠습니다.`
    }

    // Default response
    return `## 작업 수행 결과

요청하신 작업을 분석하고 처리했습니다.

### 수행 내용
- 요구사항 검토 완료
- 필요한 작업 식별
- 실행 계획 수립

### 다음 단계
1. 상세 분석 진행
2. 구현 또는 수정
3. 검증 및 테스트

추가 지시사항이 있으시면 말씀해 주세요.`
  }
}

/**
 * Create a mock provider with default responses
 */
export function createMockProvider(): MockProvider {
  return new MockProvider({
    responses: [
      {
        pattern: /hello|안녕/i,
        response: '안녕하세요! AI 넥서스 코퍼레이션입니다. 무엇을 도와드릴까요?',
      },
      {
        pattern: /status|상태/i,
        response: '현재 시스템 상태: 정상 운영 중입니다. 모든 에이전트가 활성화되어 있습니다.',
      },
    ],
  })
}
