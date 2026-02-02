/**
 * AI Company Configuration
 * 전체 조직 구조 및 에이전트 정의
 */

import {
  CompanyConfig,
  Department,
  Team,
  AgentConfig,
  AgentRole,
  DepartmentId,
  TeamId,
  Workflow,
} from '../types'
import { ROLE_PROMPTS } from '../ai/prompts/SystemPrompts'

// ============================================================
// COMPANY INFORMATION
// ============================================================

export const COMPANY_INFO = {
  name: 'AI Nexus Corporation',
  nameKr: 'AI 넥서스 코퍼레이션',
  mission: 'Empowering innovation through intelligent automation',
  missionKr: '지능형 자동화를 통한 혁신 실현',
  vision: 'A world where AI and humans collaborate seamlessly',
  visionKr: 'AI와 인간이 원활하게 협업하는 세계',
  values: [
    'Innovation First',
    'Quality Excellence',
    'Collaborative Intelligence',
    'Ethical AI',
    'Continuous Learning',
  ],
  founded: '2024',
  headquarters: 'Digital Space',
}

// ============================================================
// DEPARTMENTS
// ============================================================

export const DEPARTMENTS: Department[] = [
  {
    id: 'executive',
    name: 'Executive Office',
    nameKr: '경영진',
    description: 'Strategic leadership, company direction, finance, and legal affairs',
    head: 'ceo',
    teams: [
      'c-suite',
      'secretariat',
      'strategy',
      // Finance Teams (CFO 산하)
      'financial-planning',
      'accounting',
      'treasury',
      // Legal Teams (CEO 직속)
      'corporate-legal',
      'compliance',
      'intellectual-property',
      // Internal Audit (감사위원회/CEO 직속)
      'internal-audit',
    ],
    kpis: ['revenue-growth', 'market-share', 'employee-satisfaction', 'executive-efficiency', 'financial-health', 'legal-compliance'],
  },
  {
    id: 'planning',
    name: 'Planning',
    nameKr: '기획',
    description: 'Product planning, business planning, and data-driven decision making',
    head: 'cpo',
    teams: ['product-planning', 'business-planning', 'data-analytics'],
    kpis: ['product-market-fit', 'feature-adoption', 'business-opportunity-conversion', 'data-driven-decisions'],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    nameKr: '엔지니어링',
    description: 'Software development and technical infrastructure',
    head: 'cto',
    teams: ['backend', 'frontend', 'devops', 'security', 'architecture', 'data'],
    kpis: ['code-quality', 'deployment-frequency', 'bug-rate', 'uptime'],
  },
  {
    id: 'creative',
    name: 'Creative',
    nameKr: '크리에이티브',
    description: 'Design, content, and user experience',
    head: 'design-lead',
    teams: ['design', 'content', 'ux-research'],
    kpis: ['user-satisfaction', 'brand-consistency', 'content-engagement'],
  },
  {
    id: 'operations',
    name: 'Operations',
    nameKr: '운영',
    description: 'Project management, quality, support, and emergency response',
    head: 'coo',
    teams: ['project-management', 'quality-assurance', 'support', 'task-force'],
    kpis: ['on-time-delivery', 'customer-satisfaction', 'process-efficiency', 'emergency-response-time'],
  },
  {
    id: 'research',
    name: 'Research & Development',
    nameKr: '연구개발',
    description: 'AI research and innovation',
    head: 'research-lead',
    teams: ['ai-research', 'innovation'],
    kpis: ['patents-filed', 'research-publications', 'prototype-success'],
  },
  {
    id: 'sales',
    name: 'Sales & Marketing',
    nameKr: '영업/마케팅',
    description: 'Business growth and market expansion',
    head: 'cmo',
    teams: ['marketing', 'business-dev', 'pr-communications', 'customer-success'],
    kpis: ['revenue', 'lead-conversion', 'brand-awareness', 'media-coverage', 'share-of-voice', 'nrr', 'customer-retention'],
  },
  {
    id: 'hr',
    name: 'Human Resources',
    nameKr: '인사',
    description: 'Talent acquisition, HR operations, organization development, and learning',
    head: 'chro',
    teams: ['talent-acquisition', 'hr-operations', 'org-development', 'learning-development'],
    kpis: ['employee-engagement', 'turnover-rate', 'time-to-hire', 'training-completion', 'dei-metrics'],
  },
  {
    id: 'corporate-services',
    name: 'Corporate Services',
    nameKr: '경영지원',
    description: 'General affairs, procurement, and IT support for company operations',
    head: 'corporate-services-head',
    teams: ['general-affairs', 'procurement', 'it-support'],
    kpis: ['cost-efficiency', 'service-satisfaction', 'system-uptime', 'procurement-savings'],
  },
  {
    id: 'external-affairs',
    name: 'External Affairs',
    nameKr: '대외협력',
    description: 'Government relations, ESG, and corporate social responsibility',
    head: 'external-affairs-head',
    teams: ['government-relations', 'esg'],
    kpis: ['esg-score', 'stakeholder-engagement', 'policy-influence', 'csr-impact'],
  },
]

// ============================================================
// TEAMS & AGENTS
// ============================================================

export const TEAMS: Team[] = [
  // ========== EXECUTIVE DEPARTMENT ==========
  {
    id: 'c-suite',
    name: 'C-Suite',
    nameKr: '최고경영진',
    department: 'executive',
    description: 'Chief officers leading the organization',
    lead: 'ceo',
    responsibilities: [
      'Strategic decision making',
      'Company vision and direction',
      'Resource allocation',
      'Stakeholder management',
    ],
    tools: ['strategic-planning', 'analytics-dashboard', 'communication-hub'],
    workflows: ['executive-review', 'quarterly-planning'],
    agents: [
      {
        id: 'agent-ceo',
        role: 'ceo',
        name: 'Chief Executive Officer',
        nameKr: '최고경영자',
        team: 'c-suite',
        department: 'executive',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['decision-making', 'planning', 'communication'],
        skills: ['strategic-thinking', 'leadership', 'vision-setting', 'stakeholder-management'],
        systemPrompt: `You are the CEO of AI Nexus Corporation. Your role is to:
- Make strategic decisions for the company
- Set vision and direction
- Coordinate between departments
- Ensure alignment with company values
- Handle escalations and critical decisions`,
        temperature: 0.7,
      },
      {
        id: 'agent-cto',
        role: 'cto',
        name: 'Chief Technology Officer',
        nameKr: '최고기술책임자',
        team: 'c-suite',
        department: 'executive',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['coding', 'analysis', 'planning', 'decision-making'],
        skills: ['architecture-design', 'tech-strategy', 'team-leadership', 'innovation'],
        systemPrompt: `You are the CTO of AI Nexus Corporation. Your role is to:
- Lead technical strategy and architecture
- Oversee engineering teams
- Drive technological innovation
- Ensure code quality and best practices
- Make technical decisions`,
        temperature: 0.5,
      },
      {
        id: 'agent-coo',
        role: 'coo',
        name: 'Chief Operations Officer',
        nameKr: '최고운영책임자',
        team: 'c-suite',
        department: 'executive',
        provider: 'claude',
        capabilities: ['planning', 'analysis', 'decision-making'],
        skills: ['operations-management', 'process-optimization', 'resource-allocation'],
        systemPrompt: `You are the COO of AI Nexus Corporation. Your role is to:
- Oversee daily operations
- Optimize processes and workflows
- Manage resources efficiently
- Coordinate between departments
- Ensure operational excellence`,
        temperature: 0.5,
      },
      {
        id: 'agent-cfo',
        role: 'cfo',
        name: 'Chief Financial Officer',
        nameKr: '최고재무책임자',
        team: 'c-suite',
        department: 'executive',
        provider: 'claude',
        capabilities: ['analysis', 'planning', 'decision-making'],
        skills: ['financial-analysis', 'budgeting', 'forecasting', 'risk-management'],
        systemPrompt: `You are the CFO of AI Nexus Corporation. Your role is to:
- Manage company finances
- Budget allocation and tracking
- Financial forecasting
- Risk assessment
- Investment decisions`,
        temperature: 0.3,
      },
      {
        id: 'agent-cmo',
        role: 'cmo',
        name: 'Chief Marketing Officer',
        nameKr: '최고마케팅책임자',
        team: 'c-suite',
        department: 'executive',
        provider: 'claude',
        capabilities: ['creativity', 'communication', 'analysis', 'planning'],
        skills: ['marketing-strategy', 'brand-management', 'growth-hacking', 'market-analysis'],
        systemPrompt: `You are the CMO of AI Nexus Corporation. Your role is to:
- Lead marketing strategy
- Build and protect brand
- Drive customer acquisition
- Market research and analysis
- Growth initiatives`,
        temperature: 0.7,
      },
      {
        id: 'agent-cpo',
        role: 'cpo',
        name: 'Chief Product Officer',
        nameKr: '최고제품책임자',
        team: 'c-suite',
        department: 'executive',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['planning', 'analysis', 'decision-making', 'creativity', 'communication'],
        skills: ['product-strategy', 'product-vision', 'user-research', 'roadmap-planning', 'cross-functional-leadership'],
        systemPrompt: `You are the CPO of AI Nexus Corporation. Your role is to:
- Define product vision and strategy
- Lead the Planning department
- Ensure product-market fit
- Drive user-centric product decisions
- Coordinate product, design, and engineering alignment`,
        temperature: 0.6,
      },
    ],
  },
  // ============================================================
  // SECRETARIAT (비서실) - CEO 직속
  // ============================================================
  {
    id: 'secretariat',
    name: 'Executive Secretariat',
    nameKr: '비서실',
    department: 'executive',
    description: 'CEO direct support team - manages and coordinates all executive affairs',
    lead: 'chief-of-staff',
    responsibilities: [
      'CEO schedule and time management',
      'Executive communications management',
      'Strategic information gathering and briefing',
      'Administrative support and document management',
      'Cross-departmental coordination',
      'Crisis response and special projects',
      'VIP relations and protocol',
      'All business oversight and coordination',
    ],
    tools: [
      // Calendar & Scheduling
      'google-calendar',
      'outlook',
      'calendly',
      'cal-com',
      // Communication
      'slack',
      'microsoft-teams',
      'zoom',
      'gmail',
      // Documentation
      'notion',
      'evernote',
      'google-docs',
      'docusign',
      // Research
      'google-alerts',
      'feedly',
      'linkedin',
      'crunchbase',
      // Travel
      'concur',
      'expensify',
      'tripactions',
      // Project Management
      'asana',
      'monday',
      'trello',
    ],
    workflows: ['executive-support', 'crisis-response', 'vip-protocol', 'daily-briefing'],
    agents: [
      {
        id: 'agent-chief-of-staff',
        role: 'chief-of-staff',
        name: 'Chief of Staff',
        nameKr: '비서실장',
        team: 'secretariat',
        department: 'executive',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['planning', 'decision-making', 'communication', 'analysis', 'coordination'],
        skills: [
          'executive-support',
          'strategic-coordination',
          'crisis-management',
          'stakeholder-management',
          'team-leadership',
          'confidentiality',
          'delegation',
          'problem-solving',
        ],
        systemPrompt: `당신은 AI Nexus Corporation CEO 직속 비서실장입니다.

## 핵심 권한
- 전 부서 업무 현황 파악 및 조정 권한
- CEO 명의 지시사항 전달 권한
- 긴급 시 자원 재배치 요청 권한
- 모든 경영 정보 접근 권한

## 핵심 역할
- 비서실 전체 운영 총괄
- CEO 전략적 의사결정 지원
- 경영진/부서장 간 조율
- 전사 업무 흐름 관장 및 조절
- 위기 상황 1차 대응

## 업무 원칙
1. CEO의 시간과 에너지 보호 최우선
2. 객관적이고 균형 잡힌 정보 제공
3. 선제적 이슈 파악 및 대응
4. 절대적 기밀 유지`,
        temperature: 0.5,
      },
      {
        id: 'agent-schedule-secretary',
        role: 'schedule-secretary',
        name: 'Schedule Secretary',
        nameKr: '일정비서',
        team: 'secretariat',
        department: 'executive',
        provider: 'claude',
        capabilities: ['planning', 'coordination', 'communication', 'analysis'],
        skills: [
          'calendar-management',
          'meeting-coordination',
          'time-optimization',
          'travel-planning',
          'event-scheduling',
          'priority-management',
          'conflict-resolution',
        ],
        systemPrompt: `당신은 AI Nexus Corporation CEO 직속 일정비서입니다.

## 핵심 역할
- CEO 일정 및 시간 관리 전담
- 미팅/회의 조율 및 준비
- 출장/행사 일정 관리
- 시간 충돌 해결 및 우선순위 조정

## 일정 우선순위
1. 이사회/주주 (변경 불가)
2. 전략/경영진 회의 (제한적 조정)
3. 외부 VIP 미팅 (협의 필요)
4. 내부 보고 (유연)
5. CEO 집중 시간 (보호 필요)

## 업무 원칙
1. CEO 집중 시간 하루 최소 2시간 확보
2. 불필요한 미팅 최소화
3. 미팅 시간 엄수
4. 충분한 준비/이동 시간 확보`,
        temperature: 0.4,
      },
      {
        id: 'agent-communications-secretary',
        role: 'communications-secretary',
        name: 'Communications Secretary',
        nameKr: '커뮤니케이션비서',
        team: 'secretariat',
        department: 'executive',
        provider: 'claude',
        capabilities: ['communication', 'writing', 'analysis', 'coordination'],
        skills: [
          'business-writing',
          'email-management',
          'message-filtering',
          'vip-relations',
          'multilingual-communication',
          'diplomatic-communication',
          'correspondence-management',
        ],
        systemPrompt: `당신은 AI Nexus Corporation CEO 직속 커뮤니케이션비서입니다.

## 핵심 역할
- CEO 대내외 커뮤니케이션 관리
- 이메일/메시지 필터링 및 우선순위화
- 공식 서신/문서 작성
- VIP 관계 관리

## 우선순위 분류
- P1 (즉시): 이사회, 투자자, 정부
- P2 (1시간 내): 경영진, 핵심 파트너
- P3 (당일): 부서장, 주요 고객
- P4 (정기 보고): 일반 업무
- P5 (필터링): 스팸/불필요

## 업무 원칙
1. CEO 커뮤니케이션 이미지 보호
2. 신속하고 정확한 응대
3. 관계 히스토리 기반 대응
4. 기밀 정보 철저 관리`,
        temperature: 0.5,
      },
      {
        id: 'agent-research-secretary',
        role: 'research-secretary',
        name: 'Research Secretary',
        nameKr: '리서치비서',
        team: 'secretariat',
        department: 'executive',
        provider: 'claude',
        capabilities: ['research', 'analysis', 'writing', 'data-processing'],
        skills: [
          'information-gathering',
          'briefing-preparation',
          'market-monitoring',
          'competitor-analysis',
          'profile-research',
          'issue-analysis',
          'trend-tracking',
        ],
        systemPrompt: `당신은 AI Nexus Corporation CEO 직속 리서치비서입니다.

## 핵심 역할
- CEO 의사결정 지원을 위한 정보 수집
- 미팅/회의 사전 브리핑 준비
- 시장/산업/경쟁사 동향 모니터링
- 이슈 분석 및 요약

## Daily Intelligence Brief 구성
1. 오늘의 핵심 뉴스 (3-5개)
2. 경쟁사 동향
3. 산업 트렌드
4. CEO 관심 영역 업데이트
5. 오늘 미팅 관련 정보

## 미팅 브리핑 포함 사항
- 참석자 프로파일 (배경, 최근 동향)
- 과거 미팅 이력 및 관계
- 안건 분석 및 예상 질문
- 협상 포지션 분석

## 업무 원칙
1. 객관적이고 균형 잡힌 정보 제공
2. 핵심만 간결하게 전달
3. 출처 명확히 표기
4. CEO 관심사 선제 파악`,
        temperature: 0.4,
      },
      {
        id: 'agent-administrative-secretary',
        role: 'administrative-secretary',
        name: 'Administrative Secretary',
        nameKr: '행정비서',
        team: 'secretariat',
        department: 'executive',
        provider: 'claude',
        capabilities: ['documentation', 'planning', 'analysis', 'coordination'],
        skills: [
          'document-management',
          'approval-processing',
          'expense-management',
          'travel-booking',
          'meeting-support',
          'office-management',
          'record-keeping',
        ],
        systemPrompt: `당신은 AI Nexus Corporation CEO 직속 행정비서입니다.

## 핵심 역할
- CEO 관련 행정 업무 전담
- 문서/결재 관리
- 경비 정산 및 예산 관리
- 출장/숙소/차량 예약
- 회의 지원 및 회의록 관리

## 결재 프로세스
1. 결재 요청 접수
2. 문서 완결성 검토
3. 긴급도/중요도 분류
4. CEO 브리핑 자료 첨부
5. 결재 후 후속 조치 확인

## 일간 체크리스트
- 결재 대기 문서 확인
- 당일 경비 정산
- 사무실 환경 점검
- 내일 일정 준비사항 확인

## 업무 원칙
1. 정확성과 꼼꼼함
2. 기한 엄수
3. 비용 효율성
4. 체계적 기록 관리`,
        temperature: 0.3,
      },
      {
        id: 'agent-special-advisor',
        role: 'special-advisor',
        name: 'Special Advisor',
        nameKr: '특별보좌관',
        team: 'secretariat',
        department: 'executive',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['decision-making', 'planning', 'communication', 'coordination', 'creativity'],
        skills: [
          'special-projects',
          'crisis-response',
          'vip-protocol',
          'confidential-missions',
          'cross-functional-coordination',
          'problem-solving',
          'executive-representation',
        ],
        systemPrompt: `당신은 AI Nexus Corporation CEO 직속 특별보좌관입니다.

## 핵심 권한
- CEO 직접 위임 권한 행사
- 긴급 시 자원 동원 권한
- 전 부서 협조 요청 권한
- 기밀 정보 접근 권한

## 핵심 역할
- CEO 특별 지시사항 처리
- 긴급/돌발 상황 즉각 대응
- 특별 프로젝트 총괄
- VIP 의전 및 기밀 미팅 수행
- CEO 대리 업무 수행

## 업무 유형
- 긴급: 위기 상황, 돌발 이슈 → 즉시 대응
- 특명: CEO 직접 지시 → 최우선 처리
- 민감: 인사, 기밀 사안 → 비공개 처리
- 의전: VIP 방문, 행사 → 완벽 준비
- 개인: 개인 일정, 가족 → 세심하게

## 업무 원칙
1. CEO의 절대적 신뢰에 부응
2. 어떤 상황에서도 해결책 제시
3. 철저한 기밀 유지
4. 24시간 대응 태세
5. 유연하고 창의적인 문제 해결`,
        temperature: 0.6,
      },
    ],
  },
  {
    id: 'strategy',
    name: 'Strategy Team',
    nameKr: '전략팀',
    department: 'executive',
    description: 'Strategic planning and business analysis',
    lead: 'strategist',
    responsibilities: [
      'Market analysis',
      'Competitive intelligence',
      'Strategic planning',
      'Business modeling',
    ],
    tools: ['market-research', 'analytics', 'modeling-tools'],
    workflows: ['strategy-development', 'market-analysis'],
    agents: [
      {
        id: 'agent-strategist',
        role: 'strategist',
        name: 'Chief Strategist',
        nameKr: '수석 전략가',
        team: 'strategy',
        department: 'executive',
        provider: 'claude',
        capabilities: ['analysis', 'planning', 'research'],
        skills: ['strategic-analysis', 'market-research', 'business-modeling'],
      },
      {
        id: 'agent-analyst',
        role: 'analyst',
        name: 'Business Analyst',
        nameKr: '비즈니스 분석가',
        team: 'strategy',
        department: 'executive',
        provider: 'gemini',
        capabilities: ['analysis', 'data-processing', 'research'],
        skills: ['data-analysis', 'reporting', 'forecasting'],
      },
      {
        id: 'agent-advisor',
        role: 'advisor',
        name: 'Strategic Advisor',
        nameKr: '전략 고문',
        team: 'strategy',
        department: 'executive',
        provider: 'claude',
        capabilities: ['decision-making', 'analysis', 'communication'],
        skills: ['advisory', 'risk-assessment', 'opportunity-analysis'],
      },
    ],
  },

  // ========== PLANNING DEPARTMENT (CPO 산하) ==========
  // ============================================================
  // PRODUCT PLANNING TEAM (제품기획팀)
  // ============================================================
  {
    id: 'product-planning',
    name: 'Product Planning',
    nameKr: '제품기획팀',
    department: 'planning',
    description: 'Product strategy, requirements, and feature planning',
    lead: 'product-planning-lead',
    responsibilities: [
      'Product roadmap planning',
      'Feature specification',
      'Requirements gathering and analysis',
      'User story development',
      'Product release management',
      'Stakeholder communication',
    ],
    tools: [
      // Roadmap & Planning
      'productplan',
      'aha',
      'roadmunk',
      // Project Management
      'jira',
      'linear',
      'asana',
      // Documentation
      'notion',
      'confluence',
      'coda',
      // Prototyping
      'figma',
      'framer',
      'miro',
      // Analytics
      'amplitude',
      'mixpanel',
      'heap',
      // Communication
      'slack',
      'loom',
    ],
    workflows: ['product-discovery', 'feature-planning', 'release-management'],
    agents: [
      {
        id: 'agent-product-planning-lead',
        role: 'product-planning-lead',
        name: 'Product Planning Lead',
        nameKr: '제품기획팀장',
        team: 'product-planning',
        department: 'planning',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['planning', 'analysis', 'communication', 'decision-making', 'writing'],
        skills: [
          'product-strategy',
          'roadmap-planning',
          'stakeholder-management',
          'team-leadership',
          'agile-methodology',
          'okr-management',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 제품기획팀장입니다.
제품기획팀을 총괄하고 제품 전략 및 로드맵을 수립합니다.
PM과 기획자들을 멘토링하고 팀의 성과를 관리합니다.
이해관계자와의 커뮤니케이션을 통해 제품 방향성을 조율합니다.`,
        temperature: 0.6,
      },
      {
        id: 'agent-senior-pm',
        role: 'senior-product-manager',
        name: 'Senior Product Manager',
        nameKr: '시니어 프로덕트 매니저',
        team: 'product-planning',
        department: 'planning',
        provider: 'claude',
        capabilities: ['planning', 'analysis', 'writing', 'communication', 'research'],
        skills: [
          'product-discovery',
          'prd-writing',
          'user-research',
          'data-analysis',
          'sprint-planning',
          'ab-testing',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 시니어 프로덕트 매니저입니다.
핵심 제품 라인을 총괄하고 제품 전략을 수립합니다.
PRD 작성, 사용자 리서치, 데이터 분석을 수행합니다.
주니어 PM을 멘토링하고 복잡한 프로젝트를 리드합니다.`,
        temperature: 0.5,
      },
      {
        id: 'agent-pm',
        role: 'product-manager',
        name: 'Product Manager',
        nameKr: '프로덕트 매니저',
        team: 'product-planning',
        department: 'planning',
        provider: 'claude',
        capabilities: ['planning', 'writing', 'analysis', 'communication'],
        skills: [
          'feature-specification',
          'user-story-writing',
          'backlog-management',
          'project-management',
          'usability-testing',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 프로덕트 매니저입니다.
담당 제품/기능의 기획 및 관리를 수행합니다.
사용자 요구사항을 수집하고 기능 명세서를 작성합니다.
출시까지 프로젝트를 관리하고 이해관계자와 소통합니다.`,
        temperature: 0.5,
      },
      {
        id: 'agent-service-planner',
        role: 'service-planner',
        name: 'Service Planner',
        nameKr: '서비스기획자',
        team: 'product-planning',
        department: 'planning',
        provider: 'claude',
        capabilities: ['planning', 'writing', 'analysis', 'creativity'],
        skills: [
          'service-design',
          'customer-journey-mapping',
          'policy-design',
          'process-design',
          'service-blueprint',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 서비스기획자입니다.
서비스 전체 사용자 경험을 설계합니다.
서비스 정책 및 운영 규칙을 수립합니다.
고객 여정을 최적화하고 서비스 품질을 관리합니다.`,
        temperature: 0.5,
      },
      {
        id: 'agent-feature-planner',
        role: 'feature-planner',
        name: 'Feature Planner',
        nameKr: '기능기획자',
        team: 'product-planning',
        department: 'planning',
        provider: 'claude',
        capabilities: ['planning', 'writing', 'analysis', 'design'],
        skills: [
          'feature-specification',
          'wireframing',
          'screen-definition',
          'interaction-design',
          'qa-testing',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 기능기획자입니다.
개별 기능의 상세 기획을 수행합니다.
화면 정의서를 작성하고 UI/UX 팀과 협업합니다.
기능 QA 및 검수를 통해 품질을 보장합니다.`,
        temperature: 0.4,
      },
      {
        id: 'agent-requirements-analyst',
        role: 'requirements-analyst',
        name: 'Requirements Analyst',
        nameKr: '요구사항분석가',
        team: 'product-planning',
        department: 'planning',
        provider: 'claude',
        capabilities: ['analysis', 'writing', 'research', 'communication'],
        skills: [
          'requirements-gathering',
          'requirements-analysis',
          'stakeholder-interview',
          'use-case-modeling',
          'requirements-traceability',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 요구사항분석가입니다.
이해관계자의 요구사항을 수집하고 분석합니다.
요구사항을 명세화하고 추적성을 관리합니다.
요구사항 변경을 관리하고 문서화합니다.`,
        temperature: 0.4,
      },
    ],
  },
  // ============================================================
  // BUSINESS PLANNING TEAM (사업기획팀)
  // ============================================================
  {
    id: 'business-planning',
    name: 'Business Planning',
    nameKr: '사업기획팀',
    department: 'planning',
    description: 'Business strategy, market analysis, and opportunity development',
    lead: 'business-planning-lead',
    responsibilities: [
      'Business plan development',
      'Market research and analysis',
      'Competitive intelligence',
      'New business opportunity evaluation',
      'Go-to-market strategy',
      'Business case development',
    ],
    tools: [
      // Research
      'statista',
      'gartner',
      'nielsen',
      'similarweb',
      // Analysis
      'excel',
      'tableau',
      'power-bi',
      // Strategy
      'miro',
      'lucidchart',
      // Documentation
      'powerpoint',
      'notion',
      'confluence',
      // CRM & Intelligence
      'salesforce',
      'hubspot',
      'crunchbase',
    ],
    workflows: ['business-planning', 'market-analysis', 'opportunity-assessment'],
    agents: [
      {
        id: 'agent-business-planning-lead',
        role: 'business-planning-lead',
        name: 'Business Planning Lead',
        nameKr: '사업기획팀장',
        team: 'business-planning',
        department: 'planning',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['planning', 'analysis', 'decision-making', 'communication', 'research'],
        skills: [
          'business-strategy',
          'strategic-planning',
          'business-modeling',
          'financial-analysis',
          'team-leadership',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 사업기획팀장입니다.
신규 사업 기회를 발굴하고 평가합니다.
사업 전략을 수립하고 실행을 관리합니다.
비즈니스 모델을 설계하고 투자 의사결정을 지원합니다.`,
        temperature: 0.6,
      },
      {
        id: 'agent-business-model-architect',
        role: 'business-model-architect',
        name: 'Business Model Architect',
        nameKr: '비즈니스 모델 설계자',
        team: 'business-planning',
        department: 'planning',
        provider: 'claude',
        capabilities: ['planning', 'analysis', 'creativity', 'writing'],
        skills: [
          'business-model-canvas',
          'value-proposition-design',
          'revenue-modeling',
          'pricing-strategy',
          'innovation',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 비즈니스 모델 설계자입니다.
비즈니스 모델을 설계하고 혁신합니다.
수익 모델을 개발하고 가치 제안을 설계합니다.
비즈니스 모델의 검증 및 최적화를 수행합니다.`,
        temperature: 0.6,
      },
      {
        id: 'agent-market-research',
        role: 'market-research-analyst',
        name: 'Market Research Analyst',
        nameKr: '시장조사분석가',
        team: 'business-planning',
        department: 'planning',
        provider: 'claude',
        capabilities: ['research', 'analysis', 'writing', 'data-processing'],
        skills: [
          'market-sizing',
          'tam-sam-som',
          'survey-design',
          'qualitative-research',
          'quantitative-analysis',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 시장조사분석가입니다.
시장 규모 및 성장률을 분석합니다.
시장 트렌드를 조사하고 고객 세그먼트를 분석합니다.
시장 진입 전략 수립을 지원합니다.`,
        temperature: 0.4,
      },
      {
        id: 'agent-competitive-intel',
        role: 'competitive-intelligence-analyst',
        name: 'Competitive Intelligence Analyst',
        nameKr: '경쟁사분석가',
        team: 'business-planning',
        department: 'planning',
        provider: 'claude',
        capabilities: ['research', 'analysis', 'writing'],
        skills: [
          'competitive-analysis',
          'benchmarking',
          'competitor-profiling',
          'industry-monitoring',
          'swot-analysis',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 경쟁사분석가입니다.
경쟁사 동향을 모니터링하고 분석합니다.
벤치마킹을 수행하고 경쟁 우위를 분석합니다.
경쟁 전략을 제안하고 대응 방안을 수립합니다.`,
        temperature: 0.4,
      },
      {
        id: 'agent-opportunity-analyst',
        role: 'opportunity-analyst',
        name: 'Opportunity Analyst',
        nameKr: '사업기회분석가',
        team: 'business-planning',
        department: 'planning',
        provider: 'claude',
        capabilities: ['analysis', 'research', 'planning', 'writing'],
        skills: [
          'opportunity-assessment',
          'feasibility-study',
          'roi-analysis',
          'risk-assessment',
          'investment-analysis',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 사업기회분석가입니다.
신규 사업 기회를 발굴하고 평가합니다.
사업 타당성을 분석하고 투자 제안서를 작성합니다.
기회의 매력도, 적합도, 위험도를 종합 평가합니다.`,
        temperature: 0.4,
      },
      {
        id: 'agent-gtm-strategist',
        role: 'go-to-market-strategist',
        name: 'Go-to-Market Strategist',
        nameKr: 'GTM 전략가',
        team: 'business-planning',
        department: 'planning',
        provider: 'claude',
        capabilities: ['planning', 'analysis', 'communication', 'creativity'],
        skills: [
          'gtm-strategy',
          'launch-planning',
          'channel-strategy',
          'pricing-strategy',
          'market-positioning',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 GTM(Go-to-Market) 전략가입니다.
신제품/서비스의 시장 진입 전략을 수립합니다.
출시 계획을 수립하고 실행을 관리합니다.
채널 전략을 설계하고 초기 성장 전략을 수립합니다.`,
        temperature: 0.5,
      },
    ],
  },
  // ============================================================
  // DATA ANALYTICS TEAM (데이터분석팀)
  // ============================================================
  {
    id: 'data-analytics',
    name: 'Data Analytics',
    nameKr: '데이터분석팀',
    department: 'planning',
    description: 'Data-driven insights, product analytics, and experimentation',
    lead: 'analytics-lead',
    responsibilities: [
      'Product metrics definition and tracking',
      'User behavior analysis',
      'A/B testing and experimentation',
      'Data-driven insights generation',
      'Dashboard and reporting',
      'Analytics culture development',
    ],
    tools: [
      // Product Analytics
      'amplitude',
      'mixpanel',
      'heap',
      'google-analytics',
      // BI & Visualization
      'tableau',
      'looker',
      'metabase',
      'power-bi',
      // Data Warehouse
      'bigquery',
      'snowflake',
      'redshift',
      // A/B Testing
      'optimizely',
      'vwo',
      'launchdarkly',
      // Session Replay
      'hotjar',
      'fullstory',
      'logrocket',
      // Programming
      'python',
      'sql',
      'r',
      'jupyter',
    ],
    workflows: ['metrics-review', 'ab-testing', 'insights-reporting'],
    agents: [
      {
        id: 'agent-analytics-lead',
        role: 'analytics-lead',
        name: 'Analytics Lead',
        nameKr: '데이터분석팀장',
        team: 'data-analytics',
        department: 'planning',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['analysis', 'planning', 'communication', 'decision-making', 'data-processing'],
        skills: [
          'analytics-strategy',
          'team-leadership',
          'data-governance',
          'stakeholder-management',
          'bi-tools',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 데이터분석팀장입니다.
데이터 분석 전략을 수립하고 팀을 관리합니다.
데이터 기반 의사결정 문화를 구축합니다.
분석 인프라와 도구를 관리합니다.`,
        temperature: 0.5,
      },
      {
        id: 'agent-product-analyst',
        role: 'product-analyst',
        name: 'Product Analyst',
        nameKr: '제품분석가',
        team: 'data-analytics',
        department: 'planning',
        provider: 'claude',
        capabilities: ['analysis', 'data-processing', 'writing', 'research'],
        skills: [
          'product-analytics',
          'funnel-analysis',
          'cohort-analysis',
          'sql',
          'data-visualization',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 제품분석가입니다.
제품 성과 지표를 분석하고 트래킹합니다.
사용자 행동을 분석하고 제품 개선 인사이트를 도출합니다.
퍼널 분석, 코호트 분석을 수행합니다.`,
        temperature: 0.4,
      },
      {
        id: 'agent-user-behavior-analyst',
        role: 'user-behavior-analyst',
        name: 'User Behavior Analyst',
        nameKr: '사용자행동분석가',
        team: 'data-analytics',
        department: 'planning',
        provider: 'claude',
        capabilities: ['analysis', 'research', 'data-processing', 'writing'],
        skills: [
          'behavioral-analytics',
          'segmentation',
          'rfm-analysis',
          'churn-analysis',
          'session-analysis',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 사용자행동분석가입니다.
사용자 행동 패턴을 분석합니다.
세그먼트 분석과 개인화 전략을 지원합니다.
이탈 분석과 사용자 여정 분석을 수행합니다.`,
        temperature: 0.4,
      },
      {
        id: 'agent-ab-test-analyst',
        role: 'ab-test-analyst',
        name: 'A/B Test Analyst',
        nameKr: 'A/B 테스트 분석가',
        team: 'data-analytics',
        department: 'planning',
        provider: 'claude',
        capabilities: ['analysis', 'data-processing', 'research', 'writing'],
        skills: [
          'ab-testing',
          'statistical-analysis',
          'hypothesis-testing',
          'experiment-design',
          'power-analysis',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 A/B 테스트 분석가입니다.
A/B 테스트를 설계하고 분석합니다.
실험 문화를 구축하고 통계적 유의성을 검증합니다.
테스트 결과를 커뮤니케이션합니다.`,
        temperature: 0.3,
      },
      {
        id: 'agent-metrics-specialist',
        role: 'metrics-specialist',
        name: 'Metrics Specialist',
        nameKr: '지표전문가',
        team: 'data-analytics',
        department: 'planning',
        provider: 'claude',
        capabilities: ['analysis', 'planning', 'writing', 'communication'],
        skills: [
          'metrics-design',
          'kpi-definition',
          'dashboard-design',
          'data-dictionary',
          'goal-setting',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 지표전문가입니다.
비즈니스/제품 지표 체계를 설계합니다.
지표를 정의하고 표준화합니다.
대시보드를 설계하고 모니터링 체계를 구축합니다.`,
        temperature: 0.4,
      },
      {
        id: 'agent-insights-manager',
        role: 'insights-manager',
        name: 'Insights Manager',
        nameKr: '인사이트 매니저',
        team: 'data-analytics',
        department: 'planning',
        provider: 'claude',
        capabilities: ['analysis', 'communication', 'writing', 'creativity'],
        skills: [
          'data-storytelling',
          'insight-generation',
          'executive-reporting',
          'presentation',
          'knowledge-management',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 인사이트 매니저입니다.
데이터 인사이트를 종합하고 전달합니다.
분석 결과를 스토리텔링하고 액션 아이템을 도출합니다.
데이터 문화를 확산하고 지식을 관리합니다.`,
        temperature: 0.5,
      },
    ],
  },

  // ========== FINANCE TEAMS (CFO 산하) ==========
  {
    id: 'financial-planning',
    name: 'Financial Planning & Analysis',
    nameKr: '재무기획분석팀',
    department: 'executive',
    description: 'Financial planning, budgeting, and analysis',
    lead: 'finance-lead',
    responsibilities: [
      'Financial forecasting',
      'Budget planning and management',
      'Financial modeling',
      'Performance analysis',
      'Management reporting',
    ],
    tools: ['excel', 'power-bi', 'tableau', 'sap', 'anaplan', 'adaptive-insights'],
    workflows: ['budget-planning', 'financial-analysis', 'quarterly-reporting'],
    agents: [
      {
        id: 'agent-finance-lead',
        role: 'finance-lead',
        name: 'Finance Lead',
        nameKr: '재무팀장',
        team: 'financial-planning',
        department: 'executive',
        provider: 'gemini',
        capabilities: ['analysis', 'planning', 'decision-making', 'reporting'],
        skills: ['financial-planning', 'budgeting', 'forecasting', 'strategic-finance', 'team-leadership'],
        systemPrompt: ROLE_PROMPTS['finance-lead'],
        temperature: 0.3,
      },
      {
        id: 'agent-financial-analyst',
        role: 'financial-analyst',
        name: 'Financial Analyst',
        nameKr: '재무분석가',
        team: 'financial-planning',
        department: 'executive',
        provider: 'gemini',
        capabilities: ['analysis', 'data-processing', 'reporting', 'research'],
        skills: ['financial-modeling', 'variance-analysis', 'data-analysis', 'excel-advanced', 'sql'],
        systemPrompt: ROLE_PROMPTS['financial-analyst'],
        temperature: 0.2,
      },
      {
        id: 'agent-budget-analyst',
        role: 'budget-analyst',
        name: 'Budget Analyst',
        nameKr: '예산분석가',
        team: 'financial-planning',
        department: 'executive',
        provider: 'gemini',
        capabilities: ['analysis', 'planning', 'reporting'],
        skills: ['budget-management', 'cost-analysis', 'expense-tracking', 'forecasting'],
        systemPrompt: ROLE_PROMPTS['budget-analyst'],
        temperature: 0.2,
      },
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting Team',
    nameKr: '회계팀',
    department: 'executive',
    description: 'Financial accounting, reporting, and compliance',
    lead: 'accounting-lead',
    responsibilities: [
      'Financial statements preparation',
      'General ledger management',
      'Month-end close process',
      'Audit coordination',
      'Tax compliance',
    ],
    tools: ['quickbooks', 'xero', 'netsuite', 'oracle-financials', 'excel'],
    workflows: ['monthly-close', 'audit-preparation', 'financial-reporting'],
    agents: [
      {
        id: 'agent-accounting-lead',
        role: 'accounting-lead',
        name: 'Accounting Lead',
        nameKr: '회계팀장',
        team: 'accounting',
        department: 'executive',
        provider: 'gemini',
        capabilities: ['analysis', 'review', 'reporting', 'decision-making'],
        skills: ['gaap', 'ifrs', 'financial-reporting', 'audit-management', 'team-leadership'],
        systemPrompt: ROLE_PROMPTS['accounting-lead'],
        temperature: 0.2,
      },
      {
        id: 'agent-senior-accountant',
        role: 'senior-accountant',
        name: 'Senior Accountant',
        nameKr: '선임회계사',
        team: 'accounting',
        department: 'executive',
        provider: 'gemini',
        capabilities: ['analysis', 'review', 'reporting'],
        skills: ['journal-entries', 'reconciliation', 'financial-statements', 'tax-preparation'],
        systemPrompt: ROLE_PROMPTS['senior-accountant'],
        temperature: 0.2,
      },
      {
        id: 'agent-ap-ar-specialist',
        role: 'ap-ar-specialist',
        name: 'AP/AR Specialist',
        nameKr: '채권채무전문가',
        team: 'accounting',
        department: 'executive',
        provider: 'gemini',
        capabilities: ['data-processing', 'analysis', 'communication'],
        skills: ['accounts-payable', 'accounts-receivable', 'collections', 'vendor-management'],
        systemPrompt: ROLE_PROMPTS['ap-ar-specialist'],
        temperature: 0.3,
      },
    ],
  },
  {
    id: 'treasury',
    name: 'Treasury & Risk Team',
    nameKr: '자금리스크관리팀',
    department: 'executive',
    description: 'Cash management, investments, and risk management',
    lead: 'treasury-manager',
    responsibilities: [
      'Cash flow management',
      'Investment portfolio management',
      'Financial risk assessment',
      'Banking relationships',
      'Capital structure optimization',
    ],
    tools: ['kyriba', 'gtreasury', 'bloomberg-terminal', 'risk-analytics', 'excel'],
    workflows: ['cash-forecasting', 'investment-analysis', 'risk-assessment'],
    agents: [
      {
        id: 'agent-treasury-manager',
        role: 'treasury-manager',
        name: 'Treasury Manager',
        nameKr: '자금관리자',
        team: 'treasury',
        department: 'executive',
        provider: 'gemini',
        capabilities: ['analysis', 'planning', 'decision-making'],
        skills: ['cash-management', 'banking', 'liquidity-planning', 'fx-management'],
        systemPrompt: ROLE_PROMPTS['treasury-manager'],
        temperature: 0.3,
      },
      {
        id: 'agent-risk-analyst',
        role: 'risk-analyst',
        name: 'Risk Analyst',
        nameKr: '리스크분석가',
        team: 'treasury',
        department: 'executive',
        provider: 'gemini',
        capabilities: ['analysis', 'research', 'reporting'],
        skills: ['risk-modeling', 'scenario-analysis', 'market-risk', 'credit-risk'],
        systemPrompt: ROLE_PROMPTS['risk-analyst'],
        temperature: 0.2,
      },
      {
        id: 'agent-investment-analyst',
        role: 'investment-analyst',
        name: 'Investment Analyst',
        nameKr: '투자분석가',
        team: 'treasury',
        department: 'executive',
        provider: 'gemini',
        capabilities: ['analysis', 'research', 'reporting'],
        skills: ['investment-analysis', 'portfolio-management', 'valuation', 'due-diligence'],
        systemPrompt: ROLE_PROMPTS['investment-analyst'],
        temperature: 0.2,
      },
    ],
  },

  // ========== LEGAL TEAMS (CEO 직속) ==========
  {
    id: 'corporate-legal',
    name: 'Corporate Legal Team',
    nameKr: '기업법무팀',
    department: 'executive',
    description: 'Corporate legal affairs and contract management',
    lead: 'general-counsel',
    responsibilities: [
      'Corporate governance',
      'Contract drafting and review',
      'M&A legal support',
      'Litigation management',
      'Legal risk assessment',
    ],
    tools: ['docusign-clm', 'ironclad', 'westlaw', 'lexisnexis', 'clio'],
    workflows: ['contract-review', 'legal-review', 'litigation-management'],
    agents: [
      {
        id: 'agent-general-counsel',
        role: 'general-counsel',
        name: 'General Counsel',
        nameKr: '법무총괄',
        team: 'corporate-legal',
        department: 'executive',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['analysis', 'decision-making', 'communication', 'review'],
        skills: ['corporate-law', 'contract-law', 'litigation', 'legal-strategy', 'team-leadership'],
        systemPrompt: ROLE_PROMPTS['general-counsel'],
        temperature: 0.3,
      },
      {
        id: 'agent-corporate-lawyer',
        role: 'corporate-lawyer',
        name: 'Corporate Lawyer',
        nameKr: '기업법무변호사',
        team: 'corporate-legal',
        department: 'executive',
        provider: 'claude',
        capabilities: ['analysis', 'review', 'research', 'documentation'],
        skills: ['corporate-transactions', 'm&a', 'securities-law', 'corporate-governance'],
        systemPrompt: ROLE_PROMPTS['corporate-lawyer'],
        temperature: 0.3,
      },
      {
        id: 'agent-contract-specialist',
        role: 'contract-specialist',
        name: 'Contract Specialist',
        nameKr: '계약전문가',
        team: 'corporate-legal',
        department: 'executive',
        provider: 'claude',
        capabilities: ['review', 'documentation', 'analysis', 'communication'],
        skills: ['contract-drafting', 'contract-negotiation', 'vendor-agreements', 'nda'],
        systemPrompt: ROLE_PROMPTS['contract-specialist'],
        temperature: 0.3,
      },
    ],
  },
  {
    id: 'compliance',
    name: 'Compliance & Governance Team',
    nameKr: '컴플라이언스팀',
    department: 'executive',
    description: 'Regulatory compliance and corporate governance',
    lead: 'compliance-lead',
    responsibilities: [
      'Regulatory compliance monitoring',
      'Privacy and data protection',
      'Policy development',
      'Compliance training',
      'Audit support',
    ],
    tools: ['onetrust', 'trustarc', 'servicenow-grc', 'auditboard', 'workiva'],
    workflows: ['compliance-audit', 'policy-review', 'privacy-assessment'],
    agents: [
      {
        id: 'agent-compliance-lead',
        role: 'compliance-lead',
        name: 'Compliance Lead',
        nameKr: '컴플라이언스팀장',
        team: 'compliance',
        department: 'executive',
        provider: 'claude',
        capabilities: ['analysis', 'planning', 'review', 'communication'],
        skills: ['regulatory-compliance', 'risk-management', 'audit', 'policy-development'],
        systemPrompt: ROLE_PROMPTS['compliance-lead'],
        temperature: 0.3,
      },
      {
        id: 'agent-privacy-officer',
        role: 'privacy-officer',
        name: 'Privacy Officer',
        nameKr: '개인정보보호책임자',
        team: 'compliance',
        department: 'executive',
        provider: 'claude',
        capabilities: ['analysis', 'review', 'communication', 'planning'],
        skills: ['gdpr', 'ccpa', 'data-privacy', 'privacy-impact-assessment', 'data-governance'],
        systemPrompt: ROLE_PROMPTS['privacy-officer'],
        temperature: 0.3,
      },
      {
        id: 'agent-regulatory-specialist',
        role: 'regulatory-specialist',
        name: 'Regulatory Specialist',
        nameKr: '규제전문가',
        team: 'compliance',
        department: 'executive',
        provider: 'claude',
        capabilities: ['research', 'analysis', 'reporting'],
        skills: ['regulatory-analysis', 'licensing', 'government-relations', 'compliance-monitoring'],
        systemPrompt: ROLE_PROMPTS['regulatory-specialist'],
        temperature: 0.3,
      },
    ],
  },
  {
    id: 'intellectual-property',
    name: 'Intellectual Property Team',
    nameKr: '지식재산권팀',
    department: 'executive',
    description: 'IP protection, patents, and trademarks',
    lead: 'ip-counsel',
    responsibilities: [
      'Patent portfolio management',
      'Trademark protection',
      'IP strategy development',
      'Licensing agreements',
      'IP litigation support',
    ],
    tools: ['anaqua', 'cpa-global', 'google-patents', 'uspto-database', 'wipo', 'trademarknow'],
    workflows: ['patent-filing', 'trademark-registration', 'ip-review'],
    agents: [
      {
        id: 'agent-ip-counsel',
        role: 'ip-counsel',
        name: 'IP Counsel',
        nameKr: '지식재산권변호사',
        team: 'intellectual-property',
        department: 'executive',
        provider: 'claude',
        capabilities: ['analysis', 'review', 'planning', 'communication'],
        skills: ['patent-law', 'trademark-law', 'ip-strategy', 'licensing', 'ip-litigation'],
        systemPrompt: ROLE_PROMPTS['ip-counsel'],
        temperature: 0.3,
      },
      {
        id: 'agent-patent-analyst',
        role: 'patent-analyst',
        name: 'Patent Analyst',
        nameKr: '특허분석가',
        team: 'intellectual-property',
        department: 'executive',
        provider: 'claude',
        capabilities: ['research', 'analysis', 'documentation'],
        skills: ['patent-search', 'prior-art-analysis', 'patent-drafting', 'patent-prosecution'],
        systemPrompt: ROLE_PROMPTS['patent-analyst'],
        temperature: 0.2,
      },
      {
        id: 'agent-trademark-specialist',
        role: 'trademark-specialist',
        name: 'Trademark Specialist',
        nameKr: '상표전문가',
        team: 'intellectual-property',
        department: 'executive',
        provider: 'claude',
        capabilities: ['research', 'analysis', 'documentation', 'communication'],
        skills: ['trademark-search', 'trademark-registration', 'brand-protection', 'domain-management'],
        systemPrompt: ROLE_PROMPTS['trademark-specialist'],
        temperature: 0.3,
      },
    ],
  },

  // ========== ENGINEERING DEPARTMENT ==========
  {
    id: 'backend',
    name: 'Backend Team',
    nameKr: '백엔드팀',
    department: 'engineering',
    description: 'Server-side development and APIs',
    lead: 'backend-lead',
    responsibilities: [
      'API development',
      'Database management',
      'Server infrastructure',
      'Performance optimization',
    ],
    tools: ['nodejs', 'python', 'postgresql', 'redis', 'docker'],
    workflows: ['api-development', 'database-migration'],
    agents: [
      {
        id: 'agent-backend-lead',
        role: 'backend-lead',
        name: 'Backend Lead',
        nameKr: '백엔드 리드',
        team: 'backend',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'review', 'planning', 'analysis'],
        skills: ['system-design', 'api-design', 'team-leadership', 'code-review'],
        systemPrompt: `You are the Backend Lead. Your responsibilities:
- Lead backend development
- Design APIs and system architecture
- Code review and quality assurance
- Mentor team members
- Ensure scalability and performance`,
      },
      {
        id: 'agent-api-dev',
        role: 'api-developer',
        name: 'API Developer',
        nameKr: 'API 개발자',
        team: 'backend',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'testing'],
        skills: ['rest-api', 'graphql', 'authentication', 'documentation'],
      },
      {
        id: 'agent-db-engineer',
        role: 'database-engineer',
        name: 'Database Engineer',
        nameKr: '데이터베이스 엔지니어',
        team: 'backend',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'analysis', 'data-processing'],
        skills: ['sql', 'nosql', 'optimization', 'data-modeling'],
      },
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend Team',
    nameKr: '프론트엔드팀',
    department: 'engineering',
    description: 'User interface development',
    lead: 'frontend-lead',
    responsibilities: [
      'UI development',
      'User interactions',
      'Performance optimization',
      'Accessibility',
    ],
    tools: ['react', 'typescript', 'tailwindcss', 'nextjs', 'vite'],
    workflows: ['ui-development', 'component-library'],
    agents: [
      {
        id: 'agent-frontend-lead',
        role: 'frontend-lead',
        name: 'Frontend Lead',
        nameKr: '프론트엔드 리드',
        team: 'frontend',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'design', 'review', 'planning'],
        skills: ['react', 'typescript', 'performance', 'accessibility'],
      },
      {
        id: 'agent-ui-dev',
        role: 'ui-developer',
        name: 'UI Developer',
        nameKr: 'UI 개발자',
        team: 'frontend',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'design'],
        skills: ['react', 'css', 'animations', 'responsive-design'],
      },
      {
        id: 'agent-mobile-dev',
        role: 'mobile-developer',
        name: 'Mobile Developer',
        nameKr: '모바일 개발자',
        team: 'frontend',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'testing'],
        skills: ['react-native', 'flutter', 'ios', 'android'],
      },
    ],
  },
  {
    id: 'devops',
    name: 'DevOps Team',
    nameKr: 'DevOps팀',
    department: 'engineering',
    description: 'Infrastructure and deployment',
    lead: 'devops-lead',
    responsibilities: [
      'CI/CD pipelines',
      'Infrastructure management',
      'Monitoring and alerting',
      'Deployment automation',
    ],
    tools: ['kubernetes', 'terraform', 'github-actions', 'prometheus', 'grafana'],
    workflows: ['deployment-pipeline', 'infrastructure-setup'],
    agents: [
      {
        id: 'agent-devops-lead',
        role: 'devops-lead',
        name: 'DevOps Lead',
        nameKr: 'DevOps 리드',
        team: 'devops',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'deployment', 'planning'],
        skills: ['kubernetes', 'ci-cd', 'infrastructure-as-code', 'monitoring'],
      },
      {
        id: 'agent-sre',
        role: 'sre-engineer',
        name: 'SRE Engineer',
        nameKr: 'SRE 엔지니어',
        team: 'devops',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'analysis', 'deployment'],
        skills: ['reliability', 'incident-response', 'automation', 'observability'],
      },
      {
        id: 'agent-platform',
        role: 'platform-engineer',
        name: 'Platform Engineer',
        nameKr: '플랫폼 엔지니어',
        team: 'devops',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'deployment'],
        skills: ['cloud-platforms', 'containerization', 'networking'],
      },
    ],
  },
  {
    id: 'security',
    name: 'Security Team',
    nameKr: '보안팀',
    department: 'engineering',
    description: 'Security and compliance',
    lead: 'security-lead',
    responsibilities: [
      'Security audits',
      'Vulnerability management',
      'Compliance',
      'Incident response',
    ],
    tools: ['security-scanners', 'siem', 'vulnerability-tools'],
    workflows: ['security-audit', 'incident-response'],
    agents: [
      {
        id: 'agent-security-lead',
        role: 'security-lead',
        name: 'Security Lead',
        nameKr: '보안 리드',
        team: 'security',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['security', 'analysis', 'review'],
        skills: ['threat-modeling', 'penetration-testing', 'security-architecture'],
      },
      {
        id: 'agent-security-analyst',
        role: 'security-analyst',
        name: 'Security Analyst',
        nameKr: '보안 분석가',
        team: 'security',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['security', 'analysis'],
        skills: ['vulnerability-assessment', 'security-monitoring', 'forensics'],
      },
      {
        id: 'agent-compliance',
        role: 'compliance-officer',
        name: 'Compliance Officer',
        nameKr: '컴플라이언스 담당자',
        team: 'security',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['analysis', 'review', 'communication'],
        skills: ['gdpr', 'soc2', 'iso27001', 'policy-management'],
      },
    ],
  },
  {
    id: 'architecture',
    name: 'Architecture Team',
    nameKr: '아키텍처팀',
    department: 'engineering',
    description: 'System architecture and technical leadership',
    lead: 'chief-architect',
    responsibilities: [
      'System design',
      'Technical standards',
      'Architecture reviews',
      'Technology selection',
    ],
    tools: ['design-tools', 'documentation', 'modeling'],
    workflows: ['architecture-review', 'tech-decision'],
    agents: [
      {
        id: 'agent-chief-architect',
        role: 'chief-architect',
        name: 'Chief Architect',
        nameKr: '수석 아키텍트',
        team: 'architecture',
        department: 'engineering',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['coding', 'analysis', 'planning', 'decision-making'],
        skills: ['system-architecture', 'design-patterns', 'scalability', 'tech-strategy'],
      },
      {
        id: 'agent-solution-architect',
        role: 'solution-architect',
        name: 'Solution Architect',
        nameKr: '솔루션 아키텍트',
        team: 'architecture',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'analysis', 'planning'],
        skills: ['solution-design', 'integration', 'cloud-architecture'],
      },
      {
        id: 'agent-tech-lead',
        role: 'tech-lead',
        name: 'Tech Lead',
        nameKr: '테크 리드',
        team: 'architecture',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'review', 'planning'],
        skills: ['technical-leadership', 'mentoring', 'best-practices'],
      },
    ],
  },
  {
    id: 'data',
    name: 'Data Team',
    nameKr: '데이터팀',
    department: 'engineering',
    description: 'Data engineering and machine learning',
    lead: 'data-lead',
    responsibilities: [
      'Data pipelines',
      'ML model development',
      'Analytics infrastructure',
      'Data governance',
    ],
    tools: ['spark', 'airflow', 'tensorflow', 'pytorch', 'dbt'],
    workflows: ['data-pipeline', 'ml-training'],
    agents: [
      {
        id: 'agent-data-lead',
        role: 'data-lead',
        name: 'Data Lead',
        nameKr: '데이터 리드',
        team: 'data',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'analysis', 'data-processing', 'planning'],
        skills: ['data-architecture', 'ml-systems', 'analytics'],
      },
      {
        id: 'agent-data-engineer',
        role: 'data-engineer',
        name: 'Data Engineer',
        nameKr: '데이터 엔지니어',
        team: 'data',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'data-processing'],
        skills: ['etl', 'data-pipelines', 'sql', 'big-data'],
      },
      {
        id: 'agent-ml-engineer',
        role: 'ml-engineer',
        name: 'ML Engineer',
        nameKr: 'ML 엔지니어',
        team: 'data',
        department: 'engineering',
        provider: 'claude',
        capabilities: ['coding', 'analysis', 'data-processing'],
        skills: ['machine-learning', 'deep-learning', 'mlops'],
      },
    ],
  },

  // ========== CREATIVE DEPARTMENT ==========
  {
    id: 'design',
    name: 'Design Team',
    nameKr: '디자인팀',
    department: 'creative',
    description: 'Visual design and brand',
    lead: 'design-lead',
    responsibilities: [
      'UI design',
      'Brand identity',
      'Design system',
      'Visual assets',
    ],
    tools: ['figma', 'sketch', 'illustrator', 'photoshop'],
    workflows: ['design-sprint', 'brand-guidelines'],
    agents: [
      {
        id: 'agent-design-lead',
        role: 'design-lead',
        name: 'Design Lead',
        nameKr: '디자인 리드',
        team: 'design',
        department: 'creative',
        provider: 'claude',
        capabilities: ['design', 'creativity', 'planning', 'review'],
        skills: ['ui-design', 'design-systems', 'team-leadership'],
      },
      {
        id: 'agent-ui-designer',
        role: 'ui-designer',
        name: 'UI Designer',
        nameKr: 'UI 디자이너',
        team: 'design',
        department: 'creative',
        provider: 'claude',
        capabilities: ['design', 'creativity'],
        skills: ['interface-design', 'prototyping', 'visual-design'],
      },
      {
        id: 'agent-brand-designer',
        role: 'brand-designer',
        name: 'Brand Designer',
        nameKr: '브랜드 디자이너',
        team: 'design',
        department: 'creative',
        provider: 'claude',
        capabilities: ['design', 'creativity'],
        skills: ['brand-identity', 'logo-design', 'marketing-design'],
      },
    ],
  },
  {
    id: 'content',
    name: 'Content Team',
    nameKr: '콘텐츠팀',
    department: 'creative',
    description: 'Content creation and documentation',
    lead: 'content-lead',
    responsibilities: [
      'Content strategy',
      'Technical documentation',
      'Marketing copy',
      'Blog posts',
    ],
    tools: ['notion', 'contentful', 'grammarly'],
    workflows: ['content-creation', 'documentation'],
    agents: [
      {
        id: 'agent-content-lead',
        role: 'content-lead',
        name: 'Content Lead',
        nameKr: '콘텐츠 리드',
        team: 'content',
        department: 'creative',
        provider: 'claude',
        capabilities: ['writing', 'creativity', 'planning'],
        skills: ['content-strategy', 'editorial', 'storytelling'],
      },
      {
        id: 'agent-copywriter',
        role: 'copywriter',
        name: 'Copywriter',
        nameKr: '카피라이터',
        team: 'content',
        department: 'creative',
        provider: 'claude',
        capabilities: ['writing', 'creativity'],
        skills: ['marketing-copy', 'brand-voice', 'persuasion'],
      },
      {
        id: 'agent-tech-writer',
        role: 'technical-writer',
        name: 'Technical Writer',
        nameKr: '테크니컬 라이터',
        team: 'content',
        department: 'creative',
        provider: 'claude',
        capabilities: ['writing', 'analysis'],
        skills: ['documentation', 'api-docs', 'tutorials'],
      },
    ],
  },
  {
    id: 'ux-research',
    name: 'UX Research Team',
    nameKr: 'UX 리서치팀',
    department: 'creative',
    description: 'User experience research',
    lead: 'ux-lead',
    responsibilities: [
      'User research',
      'Usability testing',
      'User personas',
      'Journey mapping',
    ],
    tools: ['usertesting', 'hotjar', 'maze'],
    workflows: ['user-research', 'usability-testing'],
    agents: [
      {
        id: 'agent-ux-lead',
        role: 'ux-lead',
        name: 'UX Lead',
        nameKr: 'UX 리드',
        team: 'ux-research',
        department: 'creative',
        provider: 'claude',
        capabilities: ['research', 'analysis', 'planning'],
        skills: ['user-research', 'ux-strategy', 'design-thinking'],
      },
      {
        id: 'agent-ux-researcher',
        role: 'ux-researcher',
        name: 'UX Researcher',
        nameKr: 'UX 리서처',
        team: 'ux-research',
        department: 'creative',
        provider: 'claude',
        capabilities: ['research', 'analysis'],
        skills: ['qualitative-research', 'quantitative-research', 'interviews'],
      },
      {
        id: 'agent-usability',
        role: 'usability-analyst',
        name: 'Usability Analyst',
        nameKr: '사용성 분석가',
        team: 'ux-research',
        department: 'creative',
        provider: 'claude',
        capabilities: ['analysis', 'testing'],
        skills: ['usability-testing', 'heuristic-evaluation', 'accessibility'],
      },
    ],
  },

  // ========== OPERATIONS DEPARTMENT ==========
  {
    id: 'project-management',
    name: 'Project Management',
    nameKr: '프로젝트 관리팀',
    department: 'operations',
    description: 'Project coordination and delivery',
    lead: 'pm-lead',
    responsibilities: [
      'Project planning',
      'Sprint management',
      'Resource allocation',
      'Stakeholder communication',
    ],
    tools: ['jira', 'asana', 'linear', 'notion'],
    workflows: ['sprint-planning', 'project-delivery'],
    agents: [
      {
        id: 'agent-pm-lead',
        role: 'pm-lead',
        name: 'PM Lead',
        nameKr: 'PM 리드',
        team: 'project-management',
        department: 'operations',
        provider: 'claude',
        capabilities: ['planning', 'communication', 'analysis'],
        skills: ['project-management', 'agile', 'stakeholder-management'],
      },
      {
        id: 'agent-scrum-master',
        role: 'scrum-master',
        name: 'Scrum Master',
        nameKr: '스크럼 마스터',
        team: 'project-management',
        department: 'operations',
        provider: 'claude',
        capabilities: ['planning', 'communication'],
        skills: ['scrum', 'facilitation', 'team-coaching'],
      },
      {
        id: 'agent-coordinator',
        role: 'coordinator',
        name: 'Project Coordinator',
        nameKr: '프로젝트 코디네이터',
        team: 'project-management',
        department: 'operations',
        provider: 'claude',
        capabilities: ['planning', 'communication'],
        skills: ['coordination', 'scheduling', 'documentation'],
      },
    ],
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    nameKr: 'QA팀',
    department: 'operations',
    description: 'Testing and quality',
    lead: 'qa-lead',
    responsibilities: [
      'Test planning',
      'Quality gates',
      'Automation',
      'Bug tracking',
    ],
    tools: ['playwright', 'jest', 'cypress', 'selenium'],
    workflows: ['test-execution', 'quality-gates'],
    agents: [
      {
        id: 'agent-qa-lead',
        role: 'qa-lead',
        name: 'QA Lead',
        nameKr: 'QA 리드',
        team: 'quality-assurance',
        department: 'operations',
        provider: 'claude',
        capabilities: ['testing', 'analysis', 'planning'],
        skills: ['test-strategy', 'quality-management', 'automation'],
      },
      {
        id: 'agent-test-engineer',
        role: 'test-engineer',
        name: 'Test Engineer',
        nameKr: '테스트 엔지니어',
        team: 'quality-assurance',
        department: 'operations',
        provider: 'claude',
        capabilities: ['testing', 'coding'],
        skills: ['manual-testing', 'test-case-design', 'regression'],
      },
      {
        id: 'agent-automation',
        role: 'automation-engineer',
        name: 'Automation Engineer',
        nameKr: '자동화 엔지니어',
        team: 'quality-assurance',
        department: 'operations',
        provider: 'claude',
        capabilities: ['coding', 'testing'],
        skills: ['test-automation', 'ci-integration', 'performance-testing'],
      },
    ],
  },
  {
    id: 'support',
    name: 'Support Team',
    nameKr: '지원팀',
    department: 'operations',
    description: 'Customer and internal support',
    lead: 'support-lead',
    responsibilities: [
      'Customer support',
      'Issue resolution',
      'Knowledge base',
      'Onboarding',
    ],
    tools: ['zendesk', 'intercom', 'confluence'],
    workflows: ['ticket-resolution', 'onboarding'],
    agents: [
      {
        id: 'agent-support-lead',
        role: 'support-lead',
        name: 'Support Lead',
        nameKr: '지원 리드',
        team: 'support',
        department: 'operations',
        provider: 'claude',
        capabilities: ['communication', 'analysis', 'planning'],
        skills: ['customer-service', 'team-management', 'escalation'],
      },
      {
        id: 'agent-support',
        role: 'support-agent',
        name: 'Support Agent',
        nameKr: '지원 담당자',
        team: 'support',
        department: 'operations',
        provider: 'claude',
        capabilities: ['communication', 'analysis'],
        skills: ['troubleshooting', 'customer-communication', 'documentation'],
      },
      {
        id: 'agent-success',
        role: 'success-manager',
        name: 'Customer Success Manager',
        nameKr: '고객 성공 매니저',
        team: 'support',
        department: 'operations',
        provider: 'claude',
        capabilities: ['communication', 'planning'],
        skills: ['customer-success', 'relationship-management', 'churn-prevention'],
      },
    ],
  },
  // ============================================================
  // TASK FORCE (긴급 대응팀) - 대기 인력
  // ============================================================
  {
    id: 'task-force',
    name: 'Task Force',
    nameKr: '태스크포스',
    department: 'operations',
    description: 'Emergency response team for coding blockers, bugs, and data issues',
    lead: 'task-force-lead',
    responsibilities: [
      'Emergency debugging support',
      'Coding blocker resolution',
      'Data issue investigation',
      'Production incident support',
      'Development schedule recovery',
      'Quality gap filling',
    ],
    tools: [
      // Debugging
      'chrome-devtools',
      'vs-code-debugger',
      'sentry',
      'datadog',
      'new-relic',
      // Logging
      'elk-stack',
      'cloudwatch',
      'logrocket',
      // Profiling
      'py-spy',
      'async-profiler',
      'clinic-js',
      // Data
      'bigquery',
      'jupyter',
      'dbt',
      'great-expectations',
      // Collaboration
      'slack',
      'zoom',
      'screen-share',
      'git',
    ],
    workflows: ['emergency-deployment', 'bug-swarm', 'data-investigation', 'schedule-recovery'],
    agents: [
      {
        id: 'agent-task-force-lead',
        role: 'task-force-lead',
        name: 'Task Force Lead',
        nameKr: '태스크포스 팀장',
        team: 'task-force',
        department: 'operations',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['coordination', 'decision-making', 'analysis', 'communication', 'planning'],
        skills: [
          'emergency-response',
          'team-coordination',
          'resource-allocation',
          'incident-management',
          'problem-triage',
          'cross-team-communication',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 태스크포스 팀장입니다.

## 핵심 역할
- 긴급 대응팀 총괄 지휘
- 5분 내 상황 파악 및 투입 결정
- 팀원 배치 및 임무 할당
- 문제 해결 완료까지 모니터링

## 투입 기준
- Critical: 프로덕션 장애 → 전원 즉시 투입
- High: 코딩 블로커/데이터 이슈 → 전문가 투입
- Medium: 일정 지연/품질 이슈 → 상황별 투입

## 업무 원칙
1. 신속한 상황 파악과 결정
2. 문제 해결 완료까지 지원 유지
3. 기존 팀과 원활한 협업 조율
4. 모든 투입 이력 문서화`,
        temperature: 0.5,
      },
      {
        id: 'agent-senior-debugger',
        role: 'senior-debugger',
        name: 'Senior Debugger',
        nameKr: '시니어 디버거',
        team: 'task-force',
        department: 'operations',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['coding', 'analysis', 'testing', 'research'],
        skills: [
          'advanced-debugging',
          'log-analysis',
          'performance-profiling',
          'memory-analysis',
          'system-diagnosis',
          'root-cause-analysis',
          'hotfix-development',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 시니어 디버깅 전문가입니다.

## 핵심 역할
- 복잡한 버그 및 프로덕션 장애 해결
- 시스템 전반 문제 진단
- 디버깅 전략 수립 및 실행

## 전문 영역
- 로그 분석 (ELK, CloudWatch, Datadog)
- APM 트레이싱 (New Relic, Jaeger)
- 메모리/CPU 프로파일링
- 동시성/네트워크/DB 문제

## 긴급 대응 프로세스
1. 증상 파악 (1분)
2. 재현 시도 (2분)
3. 로그/메트릭 분석 (5분)
4. 가설 검증 (10분)
5. 핫픽스 개발 및 배포

## 업무 원칙: 증거 기반, 최소 변경, 재발 방지`,
        temperature: 0.3,
      },
      {
        id: 'agent-debugger',
        role: 'debugger',
        name: 'Debugger',
        nameKr: '디버거',
        team: 'task-force',
        department: 'operations',
        provider: 'claude',
        capabilities: ['coding', 'analysis', 'testing'],
        skills: [
          'bug-tracking',
          'log-analysis',
          'error-reproduction',
          'stack-trace-analysis',
          'test-case-creation',
          'debugging-tools',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 디버깅 전문가입니다.

## 핵심 역할
- 버그 재현 및 원인 분석
- 로그 및 에러 추적
- 핫픽스 개발 지원
- 테스트 케이스 작성

## 버그 분류
- P0 (크래시): 즉시 대응
- P1 (기능 불가): 1시간 내
- P2 (기능 오류): 4시간 내
- P3 (UI 이슈): 1일 내

## 업무 원칙
1. 재현 가능한 버그만 보고
2. 명확한 재현 단계 문서화
3. 해결 후 회귀 테스트
4. 근본 원인 분석`,
        temperature: 0.3,
      },
      {
        id: 'agent-coding-support-senior',
        role: 'coding-support-senior',
        name: 'Senior Coding Support',
        nameKr: '시니어 코딩지원',
        team: 'task-force',
        department: 'operations',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['coding', 'analysis', 'review', 'planning'],
        skills: [
          'full-stack-development',
          'pair-programming',
          'code-review',
          'architecture-consulting',
          'performance-optimization',
          'refactoring',
          'mentoring',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 시니어 코딩지원 전문가입니다.

## 핵심 역할
- 코딩 블로커 해결 지원
- 복잡한 기능 구현 지원
- 코드 리뷰 및 아키텍처 개선

## 지원 영역
- 백엔드: Node.js, Python, Java, Go
- 프론트엔드: React, Vue, TypeScript
- 인프라: Docker, K8s, CI/CD

## 지원 방식
| 상황 | 방법 |
|------|------|
| 구현 막힘 | 페어 프로그래밍 |
| 설계 고민 | 아키텍처 리뷰 |
| 성능 문제 | 최적화 코드 제공 |

## 업무 원칙: 낚시법 전수, 기존 스타일 존중`,
        temperature: 0.4,
      },
      {
        id: 'agent-coding-support',
        role: 'coding-support',
        name: 'Coding Support',
        nameKr: '코딩지원',
        team: 'task-force',
        department: 'operations',
        provider: 'claude',
        capabilities: ['coding', 'testing', 'documentation'],
        skills: [
          'javascript-typescript',
          'python',
          'react-development',
          'api-development',
          'unit-testing',
          'documentation',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 코딩지원 전문가입니다.

## 핵심 역할
- 개발 일정 지연 시 즉시 투입
- 기능 구현 및 테스트 코드 작성
- 기존 팀 개발 지원

## 투입 프로세스
1. 현재 상황 파악 (10분)
2. 코드베이스 이해 (30분)
3. 작업 수령 및 구현 (가변)
4. 코드 리뷰 및 인수인계

## 기술 스택
- JavaScript/TypeScript, Python
- React, Node.js, Express
- Git, Docker, VS Code

## 업무 원칙
1. 빠른 적응, 빠른 기여
2. 기존 코딩 컨벤션 준수
3. 테스트 필수 작성`,
        temperature: 0.4,
      },
      {
        id: 'agent-data-investigator-senior',
        role: 'data-investigator-senior',
        name: 'Senior Data Investigator',
        nameKr: '시니어 데이터조사관',
        team: 'task-force',
        department: 'operations',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['analysis', 'data-processing', 'research', 'writing'],
        skills: [
          'data-investigation',
          'pipeline-debugging',
          'data-quality-analysis',
          'sql-expert',
          'data-lineage-tracking',
          'anomaly-detection',
          'data-recovery',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 시니어 데이터 조사 전문가입니다.

## 핵심 역할
- 데이터 이상 현상 심층 조사
- 데이터 파이프라인 문제 해결
- 데이터 품질 및 정합성 확보

## 전문 영역
- 이상치/누락/중복 데이터 분석
- ETL 프로세스 진단
- 데이터 계보(Lineage) 추적
- 소스-타겟 정합성 검증

## 조사 도구
- SQL: BigQuery, Snowflake, PostgreSQL
- 프로파일링: Great Expectations, dbt
- 파이프라인: Airflow, Dagster
- 시각화: Jupyter, Tableau

## 업무 원칙: 증거 기반, 영향 범위 먼저 파악`,
        temperature: 0.4,
      },
      {
        id: 'agent-data-investigator',
        role: 'data-investigator',
        name: 'Data Investigator',
        nameKr: '데이터조사관',
        team: 'task-force',
        department: 'operations',
        provider: 'claude',
        capabilities: ['analysis', 'data-processing', 'writing'],
        skills: [
          'sql-querying',
          'data-extraction',
          'data-validation',
          'data-analysis',
          'report-writing',
          'spreadsheet',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 데이터 조사 전문가입니다.

## 핵심 역할
- 데이터 이슈 조사 및 분석
- 쿼리 작성 및 데이터 추출
- 데이터 정합성 검증
- 조사 리포트 작성

## 검증 체크리스트
- Null/빈값, 데이터 타입
- 범위 값, 유니크 제약
- 참조 무결성
- 비즈니스 규칙

## 기술 스택
- SQL (고급 쿼리, 윈도우 함수)
- Python pandas
- BI 도구 (Tableau, Looker)

## 업무 원칙
1. 정확한 쿼리로 정확한 답
2. 재현 가능한 분석
3. 신속한 결과 공유`,
        temperature: 0.4,
      },
    ],
  },

  // ========== RESEARCH DEPARTMENT ==========
  {
    id: 'ai-research',
    name: 'AI Research Team',
    nameKr: 'AI 연구팀',
    department: 'research',
    description: 'AI and ML research',
    lead: 'research-lead',
    responsibilities: [
      'AI research',
      'Model development',
      'Prompt engineering',
      'Benchmarking',
    ],
    tools: ['pytorch', 'transformers', 'langchain', 'llamaindex'],
    workflows: ['research-cycle', 'model-training'],
    agents: [
      {
        id: 'agent-research-lead',
        role: 'research-lead',
        name: 'Research Lead',
        nameKr: '연구 리드',
        team: 'ai-research',
        department: 'research',
        provider: 'claude',
        model: 'claude-opus-4',
        capabilities: ['research', 'analysis', 'coding', 'planning'],
        skills: ['ai-research', 'ml-systems', 'paper-writing'],
      },
      {
        id: 'agent-ai-scientist',
        role: 'ai-scientist',
        name: 'AI Scientist',
        nameKr: 'AI 과학자',
        team: 'ai-research',
        department: 'research',
        provider: 'claude',
        capabilities: ['research', 'analysis', 'coding'],
        skills: ['deep-learning', 'nlp', 'computer-vision'],
      },
      {
        id: 'agent-prompt-engineer',
        role: 'prompt-engineer',
        name: 'Prompt Engineer',
        nameKr: '프롬프트 엔지니어',
        team: 'ai-research',
        department: 'research',
        provider: 'claude',
        capabilities: ['research', 'writing', 'analysis'],
        skills: ['prompt-engineering', 'llm-optimization', 'evaluation'],
      },
    ],
  },
  {
    id: 'innovation',
    name: 'Innovation Team',
    nameKr: '혁신팀',
    department: 'research',
    description: 'Future technologies and prototyping',
    lead: 'innovation-lead',
    responsibilities: [
      'Technology scouting',
      'Prototyping',
      'POC development',
      'Trend analysis',
    ],
    tools: ['rapid-prototyping', 'experimentation'],
    workflows: ['innovation-sprint', 'poc-development'],
    agents: [
      {
        id: 'agent-innovation-lead',
        role: 'innovation-lead',
        name: 'Innovation Lead',
        nameKr: '혁신 리드',
        team: 'innovation',
        department: 'research',
        provider: 'claude',
        capabilities: ['research', 'creativity', 'planning'],
        skills: ['innovation-management', 'trend-analysis', 'design-thinking'],
      },
      {
        id: 'agent-futurist',
        role: 'futurist',
        name: 'Futurist',
        nameKr: '미래학자',
        team: 'innovation',
        department: 'research',
        provider: 'claude',
        capabilities: ['research', 'analysis', 'creativity'],
        skills: ['trend-forecasting', 'scenario-planning', 'emerging-tech'],
      },
      {
        id: 'agent-prototype',
        role: 'prototype-engineer',
        name: 'Prototype Engineer',
        nameKr: '프로토타입 엔지니어',
        team: 'innovation',
        department: 'research',
        provider: 'claude',
        capabilities: ['coding', 'creativity'],
        skills: ['rapid-prototyping', 'poc', 'experimentation'],
      },
    ],
  },

  // ========== SALES DEPARTMENT ==========
  {
    id: 'marketing',
    name: 'Marketing Team',
    nameKr: '마케팅팀',
    department: 'sales',
    description: 'Marketing and growth',
    lead: 'marketing-lead',
    responsibilities: [
      'Marketing campaigns',
      'Growth strategies',
      'SEO/SEM',
      'Analytics',
    ],
    tools: ['google-analytics', 'hubspot', 'mailchimp'],
    workflows: ['campaign-management', 'growth-hacking'],
    agents: [
      {
        id: 'agent-marketing-lead',
        role: 'marketing-lead',
        name: 'Marketing Lead',
        nameKr: '마케팅 리드',
        team: 'marketing',
        department: 'sales',
        provider: 'claude',
        capabilities: ['planning', 'creativity', 'analysis'],
        skills: ['marketing-strategy', 'campaign-management', 'analytics'],
      },
      {
        id: 'agent-growth',
        role: 'growth-hacker',
        name: 'Growth Hacker',
        nameKr: '그로스 해커',
        team: 'marketing',
        department: 'sales',
        provider: 'claude',
        capabilities: ['analysis', 'creativity', 'coding'],
        skills: ['growth-hacking', 'ab-testing', 'conversion-optimization'],
      },
      {
        id: 'agent-seo',
        role: 'seo-specialist',
        name: 'SEO Specialist',
        nameKr: 'SEO 전문가',
        team: 'marketing',
        department: 'sales',
        provider: 'claude',
        capabilities: ['analysis', 'writing'],
        skills: ['seo', 'sem', 'content-optimization'],
      },
    ],
  },
  {
    id: 'business-dev',
    name: 'Business Development',
    nameKr: '사업개발팀',
    department: 'sales',
    description: 'Business growth and partnerships',
    lead: 'bizdev-lead',
    responsibilities: [
      'Partnership development',
      'Sales strategy',
      'Market expansion',
      'Revenue growth',
    ],
    tools: ['salesforce', 'linkedin', 'crm'],
    workflows: ['sales-pipeline', 'partnership-development'],
    agents: [
      {
        id: 'agent-bizdev-lead',
        role: 'bizdev-lead',
        name: 'Business Development Lead',
        nameKr: '사업개발 리드',
        team: 'business-dev',
        department: 'sales',
        provider: 'claude',
        capabilities: ['communication', 'planning', 'analysis'],
        skills: ['business-development', 'negotiation', 'strategic-partnerships'],
      },
      {
        id: 'agent-partnership',
        role: 'partnership-manager',
        name: 'Partnership Manager',
        nameKr: '파트너십 매니저',
        team: 'business-dev',
        department: 'sales',
        provider: 'claude',
        capabilities: ['communication', 'planning'],
        skills: ['partnership-management', 'relationship-building', 'contracts'],
      },
      {
        id: 'agent-sales',
        role: 'sales-rep',
        name: 'Sales Representative',
        nameKr: '영업 담당자',
        team: 'business-dev',
        department: 'sales',
        provider: 'claude',
        capabilities: ['communication'],
        skills: ['sales', 'prospecting', 'closing'],
      },
    ],
  },
  // ============================================================
  // PR & COMMUNICATIONS TEAM
  // ============================================================
  {
    id: 'pr-communications',
    name: 'PR & Communications',
    nameKr: '홍보팀',
    department: 'sales',
    description: 'Public relations, media relations, and brand communications',
    lead: 'pr-lead',
    responsibilities: [
      'Corporate communications strategy',
      'Press releases and media relations',
      'Crisis communication management',
      'Product launch PR campaigns',
      'Brand reputation management',
      'Social media management',
      'Visual content creation',
      'Product page optimization',
    ],
    tools: [
      // PR & Media
      'meltwater',
      'cision',
      'newswire',
      'prowly',
      'muck-rack',
      // Social Media
      'hootsuite',
      'buffer',
      'sprout-social',
      'brand24',
      // Analytics
      'google-analytics',
      'hotjar',
      'microsoft-clarity',
      // Content Creation
      'canva',
      'adobe-creative-suite',
      'figma',
      'capcut',
      'premiere-pro',
      // Page Building
      'webflow',
      'unbounce',
      'optimizely',
      // CRM
      'hubspot',
      'salesforce',
    ],
    workflows: ['pr-campaign', 'product-launch-pr', 'crisis-communication', 'content-production'],
    agents: [
      {
        id: 'agent-pr-lead',
        role: 'pr-lead',
        name: 'PR Lead',
        nameKr: '홍보팀장',
        team: 'pr-communications',
        department: 'sales',
        provider: 'claude',
        capabilities: ['communication', 'planning', 'writing', 'analysis', 'decision-making'],
        skills: [
          'pr-strategy',
          'corporate-communications',
          'crisis-management',
          'media-relations',
          'brand-management',
          'stakeholder-communication',
          'message-development',
          'reputation-management',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 홍보팀장입니다.
기업 커뮤니케이션 전략을 총괄합니다.
브랜드 이미지와 평판을 관리합니다.
위기 커뮤니케이션을 선제적으로 대응합니다.
PR팀 전체 업무를 조율하고 성과를 관리합니다.`,
      },
      {
        id: 'agent-pr-specialist',
        role: 'pr-specialist',
        name: 'PR Specialist',
        nameKr: '홍보전문가',
        team: 'pr-communications',
        department: 'sales',
        provider: 'claude',
        capabilities: ['writing', 'communication', 'research', 'creativity'],
        skills: [
          'press-release-writing',
          'media-pitching',
          'story-development',
          'media-monitoring',
          'pr-campaign-execution',
          'journalist-relations',
          'event-coordination',
          'content-writing',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 홍보전문가입니다.
뉴스 가치가 있는 보도자료를 작성합니다.
미디어 아웃리치를 실행하고 관계를 구축합니다.
PR 캠페인을 기획하고 실행합니다.
언론 보도를 모니터링하고 분석합니다.`,
      },
      {
        id: 'agent-media-relations',
        role: 'media-relations-manager',
        name: 'Media Relations Manager',
        nameKr: '미디어 관계 매니저',
        team: 'pr-communications',
        department: 'sales',
        provider: 'claude',
        capabilities: ['communication', 'planning', 'research'],
        skills: [
          'journalist-networking',
          'media-database-management',
          'interview-coordination',
          'spokesperson-coaching',
          'media-training',
          'press-event-planning',
          'media-monitoring',
          'relationship-building',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 미디어 관계 매니저입니다.
언론사 및 기자 네트워크를 구축하고 관리합니다.
미디어 인터뷰와 출연을 조율합니다.
언론 문의에 신속하게 대응합니다.
스포크스퍼슨 미디어 트레이닝을 지원합니다.`,
      },
      {
        id: 'agent-product-page',
        role: 'product-page-specialist',
        name: 'Product Page Specialist',
        nameKr: '제품 상세페이지 전문가',
        team: 'pr-communications',
        department: 'sales',
        provider: 'claude',
        capabilities: ['writing', 'creativity', 'analysis', 'design'],
        skills: [
          'landing-page-optimization',
          'conversion-rate-optimization',
          'product-copywriting',
          'ab-testing',
          'ux-writing',
          'value-proposition-development',
          'cta-optimization',
          'page-analytics',
          'seo-optimization',
          'user-psychology',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 제품 상세페이지 전문가입니다.
제품/서비스 상세페이지를 기획하고 제작합니다.
랜딩 페이지 전환율을 최적화합니다.
설득력 있는 제품 설명 카피를 작성합니다.
A/B 테스트로 지속적인 개선을 수행합니다.
AIDA 모델을 활용한 구매 여정을 설계합니다.`,
      },
      {
        id: 'agent-social-media',
        role: 'social-media-manager',
        name: 'Social Media Manager',
        nameKr: '소셜 미디어 매니저',
        team: 'pr-communications',
        department: 'sales',
        provider: 'claude',
        capabilities: ['creativity', 'writing', 'analysis', 'communication'],
        skills: [
          'social-media-strategy',
          'content-calendar-management',
          'community-management',
          'influencer-relations',
          'social-advertising',
          'engagement-optimization',
          'trend-monitoring',
          'social-analytics',
          'ugc-curation',
          'viral-content-creation',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 소셜 미디어 매니저입니다.
소셜 미디어 전략을 수립하고 실행합니다.
채널별 콘텐츠를 기획하고 운영합니다.
커뮤니티를 관리하고 인게이지먼트를 높입니다.
소셜 미디어 광고 캠페인을 운영합니다.
트렌드를 파악하고 바이럴 콘텐츠를 기획합니다.`,
      },
      {
        id: 'agent-visual-content',
        role: 'visual-content-creator',
        name: 'Visual Content Creator',
        nameKr: '비주얼 콘텐츠 크리에이터',
        team: 'pr-communications',
        department: 'sales',
        provider: 'claude',
        capabilities: ['creativity', 'design', 'analysis'],
        skills: [
          'graphic-design',
          'video-production',
          'photo-editing',
          'motion-graphics',
          'brand-visual-identity',
          'social-media-graphics',
          'infographic-design',
          'thumbnail-optimization',
          'visual-storytelling',
          'ai-image-generation',
        ],
        systemPrompt: `당신은 AI Nexus Corporation의 비주얼 콘텐츠 크리에이터입니다.
홍보용 비주얼 콘텐츠를 제작합니다.
제품/서비스 사진 및 영상을 촬영하고 편집합니다.
소셜 미디어 그래픽을 디자인합니다.
브랜드 비주얼 가이드라인을 일관되게 적용합니다.
인포그래픽과 모션 그래픽을 제작합니다.`,
      },
    ],
  },

  // ============================================================
  // CUSTOMER SUCCESS TEAM (고객성공팀)
  // ============================================================
  {
    id: 'customer-success',
    name: 'Customer Success',
    nameKr: '고객성공',
    department: 'sales',
    description: 'Drive customer adoption, retention, and expansion through proactive success management',
    lead: 'customer-success-lead',
    responsibilities: [
      'customer-onboarding',
      'success-planning',
      'health-monitoring',
      'retention-management',
      'expansion-revenue',
      'customer-advocacy',
      'product-feedback',
      'renewal-management',
    ],
    tools: [
      'gainsight',
      'totango',
      'churnzero',
      'salesforce',
      'intercom',
      'zendesk',
      'mixpanel',
      'amplitude',
      'pendo',
    ],
    workflows: ['customer-onboarding', 'health-check', 'renewal-process', 'escalation'],
    agents: [
      {
        id: 'agent-cs-lead',
        role: 'customer-success-lead',
        name: 'Customer Success Lead',
        nameKr: '고객성공팀장',
        team: 'customer-success',
        department: 'sales',
        provider: 'claude',
        capabilities: ['planning', 'communication', 'analysis', 'decision-making', 'coordination'],
        skills: [
          'success-strategy',
          'team-leadership',
          'revenue-optimization',
          'executive-alignment',
          'process-design',
          'metrics-analysis',
          'stakeholder-management',
          'customer-lifecycle-management',
        ],
        systemPrompt: ROLE_PROMPTS['customer-success-lead'],
      },
      {
        id: 'agent-csm',
        role: 'customer-success-manager',
        name: 'Customer Success Manager',
        nameKr: '고객성공매니저',
        team: 'customer-success',
        department: 'sales',
        provider: 'claude',
        capabilities: ['communication', 'analysis', 'planning', 'coordination'],
        skills: [
          'relationship-management',
          'success-planning',
          'business-reviews',
          'product-adoption',
          'stakeholder-engagement',
          'health-scoring',
          'expansion-identification',
          'roi-analysis',
        ],
        systemPrompt: ROLE_PROMPTS['customer-success-manager'],
      },
      {
        id: 'agent-onboarding-specialist',
        role: 'onboarding-specialist',
        name: 'Onboarding Specialist',
        nameKr: '온보딩 전문가',
        team: 'customer-success',
        department: 'sales',
        provider: 'claude',
        capabilities: ['communication', 'planning', 'documentation', 'coordination'],
        skills: [
          'implementation-planning',
          'customer-training',
          'adoption-acceleration',
          'integration-support',
          'go-live-management',
          'documentation-creation',
          'milestone-tracking',
          'user-enablement',
        ],
        systemPrompt: ROLE_PROMPTS['onboarding-specialist'],
      },
      {
        id: 'agent-retention-specialist',
        role: 'retention-specialist',
        name: 'Retention Specialist',
        nameKr: '리텐션 전문가',
        team: 'customer-success',
        department: 'sales',
        provider: 'claude',
        capabilities: ['analysis', 'communication', 'planning'],
        skills: [
          'churn-prediction',
          'risk-mitigation',
          'save-strategies',
          'win-back-campaigns',
          'sentiment-analysis',
          'early-warning-systems',
          'intervention-planning',
          'retention-analytics',
        ],
        systemPrompt: ROLE_PROMPTS['retention-specialist'],
      },
    ],
  },

  // ============================================================
  // HR DEPARTMENT TEAMS (인사부)
  // ============================================================

  // Talent Acquisition Team (채용팀)
  {
    id: 'talent-acquisition',
    name: 'Talent Acquisition',
    nameKr: '채용',
    department: 'hr',
    description: 'Attract, evaluate, and secure top talent for organizational growth',
    lead: 'talent-acquisition-lead',
    responsibilities: [
      'recruitment-strategy',
      'sourcing',
      'candidate-screening',
      'interview-coordination',
      'offer-management',
      'employer-branding',
      'campus-recruiting',
      'diversity-hiring',
    ],
    tools: [
      'greenhouse',
      'lever',
      'workday-recruiting',
      'linkedin-recruiter',
      'indeed',
      'hired',
      'hirevue',
      'calendly',
      'docusign',
    ],
    workflows: ['job-requisition', 'candidate-pipeline', 'interview-process', 'offer-approval'],
    agents: [
      {
        id: 'agent-chro',
        role: 'chro',
        name: 'Chief Human Resources Officer',
        nameKr: '최고인사책임자',
        team: 'talent-acquisition',
        department: 'hr',
        provider: 'claude',
        capabilities: ['decision-making', 'planning', 'communication', 'coordination', 'analysis'],
        skills: [
          'hr-strategy',
          'organizational-development',
          'talent-management',
          'culture-leadership',
          'executive-advisory',
          'workforce-planning',
          'change-management',
          'dei-leadership',
          'compensation-strategy',
          'employee-relations',
        ],
        systemPrompt: ROLE_PROMPTS['chro'],
      },
      {
        id: 'agent-ta-lead',
        role: 'talent-acquisition-lead',
        name: 'Talent Acquisition Lead',
        nameKr: '채용팀장',
        team: 'talent-acquisition',
        department: 'hr',
        provider: 'claude',
        capabilities: ['planning', 'communication', 'coordination', 'analysis'],
        skills: [
          'recruitment-strategy',
          'team-leadership',
          'hiring-metrics',
          'process-optimization',
          'vendor-management',
          'employer-branding',
          'headcount-planning',
          'diversity-recruiting',
        ],
        systemPrompt: ROLE_PROMPTS['talent-acquisition-lead'],
      },
      {
        id: 'agent-senior-recruiter',
        role: 'senior-recruiter',
        name: 'Senior Recruiter',
        nameKr: '시니어 리크루터',
        team: 'talent-acquisition',
        department: 'hr',
        provider: 'claude',
        capabilities: ['communication', 'analysis', 'coordination'],
        skills: [
          'full-cycle-recruiting',
          'executive-search',
          'technical-recruiting',
          'salary-negotiation',
          'candidate-assessment',
          'pipeline-management',
          'offer-management',
          'reference-checking',
        ],
        systemPrompt: ROLE_PROMPTS['senior-recruiter'],
      },
      {
        id: 'agent-recruiter',
        role: 'recruiter',
        name: 'Recruiter',
        nameKr: '리크루터',
        team: 'talent-acquisition',
        department: 'hr',
        provider: 'claude',
        capabilities: ['communication', 'coordination', 'research'],
        skills: [
          'sourcing',
          'screening',
          'interview-scheduling',
          'candidate-experience',
          'ats-management',
          'job-posting',
          'social-recruiting',
          'campus-recruiting',
        ],
        systemPrompt: ROLE_PROMPTS['recruiter'],
      },
    ],
  },

  // HR Operations Team (인사관리팀)
  {
    id: 'hr-operations',
    name: 'HR Operations',
    nameKr: '인사관리',
    department: 'hr',
    description: 'Manage core HR processes, employee lifecycle, and HR systems',
    lead: 'hr-operations-lead',
    responsibilities: [
      'employee-records',
      'benefits-administration',
      'payroll-coordination',
      'policy-implementation',
      'hr-compliance',
      'employee-lifecycle',
      'hr-systems',
      'employee-relations',
    ],
    tools: [
      'workday',
      'bamboohr',
      'adp',
      'namely',
      'gusto',
      'rippling',
      'deel',
      'remote',
      'papaya-global',
    ],
    workflows: ['onboarding', 'offboarding', 'benefits-enrollment', 'leave-management'],
    agents: [
      {
        id: 'agent-hr-ops-lead',
        role: 'hr-operations-lead',
        name: 'HR Operations Lead',
        nameKr: '인사관리팀장',
        team: 'hr-operations',
        department: 'hr',
        provider: 'claude',
        capabilities: ['planning', 'coordination', 'analysis', 'documentation'],
        skills: [
          'hr-operations',
          'team-management',
          'process-improvement',
          'compliance-management',
          'vendor-management',
          'hris-administration',
          'policy-development',
          'employee-relations',
        ],
        systemPrompt: ROLE_PROMPTS['hr-operations-lead'],
      },
      {
        id: 'agent-hr-specialist',
        role: 'hr-specialist',
        name: 'HR Specialist',
        nameKr: 'HR 전문가',
        team: 'hr-operations',
        department: 'hr',
        provider: 'claude',
        capabilities: ['coordination', 'documentation', 'communication'],
        skills: [
          'employee-onboarding',
          'benefits-administration',
          'employee-records',
          'policy-compliance',
          'hr-inquiry-handling',
          'leave-management',
          'employment-verification',
          'hr-reporting',
        ],
        systemPrompt: ROLE_PROMPTS['hr-specialist'],
      },
      {
        id: 'agent-payroll-specialist',
        role: 'payroll-specialist',
        name: 'Payroll Specialist',
        nameKr: '급여 전문가',
        team: 'hr-operations',
        department: 'hr',
        provider: 'claude',
        capabilities: ['data-processing', 'analysis', 'documentation'],
        skills: [
          'payroll-processing',
          'tax-compliance',
          'benefits-deductions',
          'time-tracking',
          'payroll-reconciliation',
          'statutory-reporting',
          'payroll-systems',
          'compensation-analysis',
        ],
        systemPrompt: ROLE_PROMPTS['payroll-specialist'],
      },
    ],
  },

  // Organization Development Team (조직개발팀)
  {
    id: 'org-development',
    name: 'Organization Development',
    nameKr: '조직개발',
    department: 'hr',
    description: 'Drive organizational effectiveness, culture, and performance management',
    lead: 'org-dev-lead',
    responsibilities: [
      'org-design',
      'culture-development',
      'performance-management',
      'employee-engagement',
      'change-management',
      'succession-planning',
      'leadership-development',
      'dei-initiatives',
    ],
    tools: [
      'culture-amp',
      'lattice',
      '15five',
      'reflektive',
      'peakon',
      'glint',
      'officevibe',
      'quantumworkplace',
    ],
    workflows: ['performance-review', 'engagement-survey', 'org-restructure', 'culture-initiative'],
    agents: [
      {
        id: 'agent-org-dev-lead',
        role: 'org-dev-lead',
        name: 'Organization Development Lead',
        nameKr: '조직개발팀장',
        team: 'org-development',
        department: 'hr',
        provider: 'claude',
        capabilities: ['planning', 'analysis', 'communication', 'coordination'],
        skills: [
          'org-development',
          'change-management',
          'culture-strategy',
          'performance-systems',
          'engagement-strategy',
          'succession-planning',
          'leadership-development',
          'dei-strategy',
        ],
        systemPrompt: ROLE_PROMPTS['org-dev-lead'],
      },
      {
        id: 'agent-culture-specialist',
        role: 'culture-specialist',
        name: 'Culture Specialist',
        nameKr: '조직문화 전문가',
        team: 'org-development',
        department: 'hr',
        provider: 'claude',
        capabilities: ['communication', 'planning', 'creativity', 'analysis'],
        skills: [
          'culture-programs',
          'engagement-initiatives',
          'employee-experience',
          'recognition-programs',
          'dei-programs',
          'internal-communications',
          'culture-assessment',
          'values-alignment',
        ],
        systemPrompt: ROLE_PROMPTS['culture-specialist'],
      },
      {
        id: 'agent-performance-specialist',
        role: 'performance-specialist',
        name: 'Performance Specialist',
        nameKr: '성과관리 전문가',
        team: 'org-development',
        department: 'hr',
        provider: 'claude',
        capabilities: ['analysis', 'planning', 'documentation', 'communication'],
        skills: [
          'performance-management',
          'goal-setting-frameworks',
          'feedback-systems',
          'calibration-facilitation',
          'performance-analytics',
          'pip-management',
          'compensation-alignment',
          'talent-assessment',
        ],
        systemPrompt: ROLE_PROMPTS['performance-specialist'],
      },
    ],
  },

  // Learning & Development Team (교육개발팀)
  {
    id: 'learning-development',
    name: 'Learning & Development',
    nameKr: '교육개발',
    department: 'hr',
    description: 'Design and deliver learning experiences that develop employee capabilities',
    lead: 'learning-dev-lead',
    responsibilities: [
      'learning-strategy',
      'curriculum-design',
      'training-delivery',
      'leadership-programs',
      'skill-development',
      'compliance-training',
      'lms-management',
      'learning-analytics',
    ],
    tools: [
      'cornerstone',
      'docebo',
      'absorb-lms',
      'articulate',
      'linkedin-learning',
      'udemy-business',
      'skillsoft',
      'pluralsight',
      'coursera-business',
    ],
    workflows: ['training-needs-analysis', 'program-development', 'training-delivery', 'learning-evaluation'],
    agents: [
      {
        id: 'agent-ld-lead',
        role: 'learning-dev-lead',
        name: 'Learning & Development Lead',
        nameKr: '교육개발팀장',
        team: 'learning-development',
        department: 'hr',
        provider: 'claude',
        capabilities: ['planning', 'communication', 'creativity', 'analysis'],
        skills: [
          'learning-strategy',
          'program-management',
          'instructional-design',
          'leadership-development',
          'learning-technology',
          'roi-measurement',
          'vendor-management',
          'curriculum-architecture',
        ],
        systemPrompt: ROLE_PROMPTS['learning-dev-lead'],
      },
      {
        id: 'agent-training-specialist',
        role: 'training-specialist',
        name: 'Training Specialist',
        nameKr: '교육 전문가',
        team: 'learning-development',
        department: 'hr',
        provider: 'claude',
        capabilities: ['communication', 'creativity', 'documentation', 'coordination'],
        skills: [
          'training-delivery',
          'workshop-facilitation',
          'content-development',
          'virtual-training',
          'coaching',
          'assessment-design',
          'learning-reinforcement',
          'participant-engagement',
        ],
        systemPrompt: ROLE_PROMPTS['training-specialist'],
      },
      {
        id: 'agent-elearning-specialist',
        role: 'e-learning-specialist',
        name: 'E-Learning Specialist',
        nameKr: '이러닝 전문가',
        team: 'learning-development',
        department: 'hr',
        provider: 'claude',
        capabilities: ['creativity', 'design', 'documentation', 'coding'],
        skills: [
          'elearning-development',
          'lms-administration',
          'multimedia-production',
          'scorm-development',
          'interactive-design',
          'gamification',
          'microlearning',
          'learning-analytics',
        ],
        systemPrompt: ROLE_PROMPTS['e-learning-specialist'],
      },
    ],
  },

  // ============================================================
  // CORPORATE SERVICES DEPARTMENT TEAMS (경영지원부)
  // ============================================================

  // General Affairs Team (총무팀)
  {
    id: 'general-affairs',
    name: 'General Affairs',
    nameKr: '총무',
    department: 'corporate-services',
    description: 'Manage facilities, office operations, and administrative services',
    lead: 'general-affairs-lead',
    responsibilities: [
      'facilities-management',
      'office-operations',
      'asset-management',
      'vendor-coordination',
      'travel-management',
      'event-coordination',
      'safety-compliance',
      'administrative-support',
    ],
    tools: [
      'envoy',
      'robin',
      'spacewell',
      'officespace',
      'condeco',
      'sap-pm',
      'concur',
      'tripactions',
      'navan',
    ],
    workflows: ['facility-request', 'asset-procurement', 'travel-approval', 'event-planning'],
    agents: [
      {
        id: 'agent-corporate-services-head',
        role: 'corporate-services-head',
        name: 'Corporate Services Head',
        nameKr: '경영지원본부장',
        team: 'general-affairs',
        department: 'corporate-services',
        provider: 'claude',
        capabilities: ['decision-making', 'planning', 'coordination', 'communication'],
        skills: [
          'operations-strategy',
          'budget-management',
          'vendor-negotiations',
          'team-leadership',
          'cross-functional-coordination',
          'cost-optimization',
          'service-excellence',
          'risk-management',
        ],
        systemPrompt: ROLE_PROMPTS['corporate-services-head'],
      },
      {
        id: 'agent-ga-lead',
        role: 'general-affairs-lead',
        name: 'General Affairs Lead',
        nameKr: '총무팀장',
        team: 'general-affairs',
        department: 'corporate-services',
        provider: 'claude',
        capabilities: ['coordination', 'planning', 'communication'],
        skills: [
          'facilities-management',
          'office-administration',
          'vendor-management',
          'budget-control',
          'safety-compliance',
          'space-planning',
          'emergency-preparedness',
          'sustainability-initiatives',
        ],
        systemPrompt: ROLE_PROMPTS['general-affairs-lead'],
      },
      {
        id: 'agent-facilities-manager',
        role: 'facilities-manager',
        name: 'Facilities Manager',
        nameKr: '시설관리자',
        team: 'general-affairs',
        department: 'corporate-services',
        provider: 'claude',
        capabilities: ['coordination', 'planning', 'analysis'],
        skills: [
          'building-management',
          'maintenance-coordination',
          'space-optimization',
          'security-systems',
          'energy-management',
          'contractor-oversight',
          'health-safety',
          'sustainability',
        ],
        systemPrompt: ROLE_PROMPTS['facilities-manager'],
      },
      {
        id: 'agent-admin-specialist',
        role: 'admin-specialist',
        name: 'Administrative Specialist',
        nameKr: '행정 전문가',
        team: 'general-affairs',
        department: 'corporate-services',
        provider: 'claude',
        capabilities: ['coordination', 'documentation', 'communication'],
        skills: [
          'office-administration',
          'travel-coordination',
          'event-support',
          'document-management',
          'calendar-management',
          'expense-processing',
          'visitor-management',
          'supply-ordering',
        ],
        systemPrompt: ROLE_PROMPTS['admin-specialist'],
      },
    ],
  },

  // Procurement Team (구매팀)
  {
    id: 'procurement',
    name: 'Procurement',
    nameKr: '구매',
    department: 'corporate-services',
    description: 'Strategic sourcing and procurement of goods and services',
    lead: 'procurement-lead',
    responsibilities: [
      'strategic-sourcing',
      'vendor-selection',
      'contract-negotiation',
      'purchase-management',
      'supplier-evaluation',
      'cost-reduction',
      'procurement-compliance',
      'category-management',
    ],
    tools: [
      'coupa',
      'sap-ariba',
      'jaggaer',
      'gep',
      'procurify',
      'tradogram',
      'precoro',
      'kissflow-procurement',
    ],
    workflows: ['rfp-process', 'vendor-onboarding', 'purchase-requisition', 'contract-renewal'],
    agents: [
      {
        id: 'agent-procurement-lead',
        role: 'procurement-lead',
        name: 'Procurement Lead',
        nameKr: '구매팀장',
        team: 'procurement',
        department: 'corporate-services',
        provider: 'claude',
        capabilities: ['planning', 'analysis', 'communication', 'coordination'],
        skills: [
          'procurement-strategy',
          'category-management',
          'contract-negotiation',
          'supplier-management',
          'cost-analysis',
          'risk-mitigation',
          'compliance-oversight',
          'team-leadership',
        ],
        systemPrompt: ROLE_PROMPTS['procurement-lead'],
      },
      {
        id: 'agent-sourcing-specialist',
        role: 'sourcing-specialist',
        name: 'Sourcing Specialist',
        nameKr: '소싱 전문가',
        team: 'procurement',
        department: 'corporate-services',
        provider: 'claude',
        capabilities: ['analysis', 'research', 'communication'],
        skills: [
          'strategic-sourcing',
          'market-research',
          'supplier-identification',
          'rfp-management',
          'bid-evaluation',
          'price-benchmarking',
          'should-cost-analysis',
          'make-vs-buy-analysis',
        ],
        systemPrompt: ROLE_PROMPTS['sourcing-specialist'],
      },
      {
        id: 'agent-vendor-manager',
        role: 'vendor-manager',
        name: 'Vendor Manager',
        nameKr: '벤더 매니저',
        team: 'procurement',
        department: 'corporate-services',
        provider: 'claude',
        capabilities: ['communication', 'coordination', 'analysis'],
        skills: [
          'vendor-relations',
          'performance-management',
          'contract-administration',
          'sla-monitoring',
          'vendor-development',
          'issue-resolution',
          'risk-assessment',
          'vendor-scorecarding',
        ],
        systemPrompt: ROLE_PROMPTS['vendor-manager'],
      },
    ],
  },

  // IT Support Team (정보시스템팀)
  {
    id: 'it-support',
    name: 'IT Support',
    nameKr: '정보시스템',
    department: 'corporate-services',
    description: 'Provide IT infrastructure, support services, and system administration',
    lead: 'it-support-lead',
    responsibilities: [
      'it-infrastructure',
      'user-support',
      'system-administration',
      'network-management',
      'security-operations',
      'software-deployment',
      'backup-recovery',
      'it-asset-management',
    ],
    tools: [
      'servicenow',
      'jira-service-desk',
      'freshservice',
      'zendesk-it',
      'intune',
      'jamf',
      'sccm',
      'lansweeper',
      'datto',
      'okta',
    ],
    workflows: ['incident-management', 'service-request', 'change-management', 'asset-lifecycle'],
    agents: [
      {
        id: 'agent-it-support-lead',
        role: 'it-support-lead',
        name: 'IT Support Lead',
        nameKr: '정보시스템팀장',
        team: 'it-support',
        department: 'corporate-services',
        provider: 'claude',
        capabilities: ['planning', 'coordination', 'analysis', 'communication'],
        skills: [
          'it-service-management',
          'team-leadership',
          'infrastructure-planning',
          'vendor-management',
          'budget-management',
          'security-oversight',
          'disaster-recovery',
          'process-improvement',
        ],
        systemPrompt: ROLE_PROMPTS['it-support-lead'],
      },
      {
        id: 'agent-system-admin',
        role: 'system-admin',
        name: 'System Administrator',
        nameKr: '시스템 관리자',
        team: 'it-support',
        department: 'corporate-services',
        provider: 'claude',
        capabilities: ['coding', 'analysis', 'security', 'deployment'],
        skills: [
          'server-administration',
          'network-management',
          'cloud-infrastructure',
          'active-directory',
          'security-hardening',
          'backup-management',
          'monitoring-tools',
          'automation-scripting',
        ],
        systemPrompt: ROLE_PROMPTS['system-admin'],
      },
      {
        id: 'agent-helpdesk-specialist',
        role: 'helpdesk-specialist',
        name: 'Helpdesk Specialist',
        nameKr: '헬프데스크 전문가',
        team: 'it-support',
        department: 'corporate-services',
        provider: 'claude',
        capabilities: ['communication', 'coordination', 'analysis'],
        skills: [
          'ticket-management',
          'troubleshooting',
          'user-training',
          'software-support',
          'hardware-support',
          'remote-assistance',
          'knowledge-base',
          'customer-service',
        ],
        systemPrompt: ROLE_PROMPTS['helpdesk-specialist'],
      },
    ],
  },

  // ============================================================
  // INTERNAL AUDIT TEAM (내부감사팀)
  // ============================================================
  {
    id: 'internal-audit',
    name: 'Internal Audit',
    nameKr: '내부감사',
    department: 'executive',
    description: 'Provide independent assurance and consulting to improve operations',
    lead: 'internal-audit-lead',
    responsibilities: [
      'audit-planning',
      'risk-assessment',
      'control-evaluation',
      'compliance-audit',
      'operational-audit',
      'financial-audit',
      'it-audit',
      'investigation',
    ],
    tools: [
      'auditboard',
      'workiva',
      'galvanize',
      'teammate',
      'pentana',
      'ideagen',
      'caseware',
      'acl-analytics',
    ],
    workflows: ['annual-audit-plan', 'audit-execution', 'finding-remediation', 'audit-reporting'],
    agents: [
      {
        id: 'agent-internal-audit-lead',
        role: 'internal-audit-lead',
        name: 'Internal Audit Lead',
        nameKr: '내부감사팀장',
        team: 'internal-audit',
        department: 'executive',
        provider: 'claude',
        capabilities: ['analysis', 'planning', 'communication', 'decision-making'],
        skills: [
          'audit-strategy',
          'risk-based-auditing',
          'team-management',
          'stakeholder-communication',
          'quality-assurance',
          'audit-reporting',
          'regulatory-knowledge',
          'professional-standards',
        ],
        systemPrompt: ROLE_PROMPTS['internal-audit-lead'],
      },
      {
        id: 'agent-senior-auditor',
        role: 'senior-auditor',
        name: 'Senior Auditor',
        nameKr: '선임감사원',
        team: 'internal-audit',
        department: 'executive',
        provider: 'claude',
        capabilities: ['analysis', 'documentation', 'communication'],
        skills: [
          'audit-execution',
          'control-testing',
          'data-analytics',
          'finding-development',
          'workpaper-review',
          'interview-techniques',
          'root-cause-analysis',
          'remediation-validation',
        ],
        systemPrompt: ROLE_PROMPTS['senior-auditor'],
      },
      {
        id: 'agent-auditor',
        role: 'auditor',
        name: 'Auditor',
        nameKr: '감사원',
        team: 'internal-audit',
        department: 'executive',
        provider: 'claude',
        capabilities: ['analysis', 'documentation', 'research'],
        skills: [
          'audit-testing',
          'documentation',
          'sampling-techniques',
          'workpaper-preparation',
          'control-walkthroughs',
          'evidence-gathering',
          'process-mapping',
          'compliance-testing',
        ],
        systemPrompt: ROLE_PROMPTS['auditor'],
      },
    ],
  },

  // ============================================================
  // EXTERNAL AFFAIRS DEPARTMENT TEAMS (대외협력부)
  // ============================================================

  // Government Relations Team (대관팀)
  {
    id: 'government-relations',
    name: 'Government Relations',
    nameKr: '대관',
    department: 'external-affairs',
    description: 'Manage relationships with government bodies and influence policy',
    lead: 'government-relations-lead',
    responsibilities: [
      'policy-monitoring',
      'government-engagement',
      'regulatory-advocacy',
      'political-analysis',
      'lobbying',
      'public-affairs',
      'coalition-building',
      'compliance-advisory',
    ],
    tools: [
      'fiscalnote',
      'quorum',
      'bloomberg-government',
      'govtrack',
      'politico-pro',
      'lexisnexis-state-net',
    ],
    workflows: ['policy-tracking', 'advocacy-campaign', 'regulatory-response', 'stakeholder-engagement'],
    agents: [
      {
        id: 'agent-external-affairs-head',
        role: 'external-affairs-head',
        name: 'External Affairs Head',
        nameKr: '대외협력본부장',
        team: 'government-relations',
        department: 'external-affairs',
        provider: 'claude',
        capabilities: ['decision-making', 'planning', 'communication', 'coordination'],
        skills: [
          'public-affairs-strategy',
          'stakeholder-management',
          'crisis-communication',
          'executive-advisory',
          'coalition-leadership',
          'reputation-management',
          'media-relations',
          'cross-functional-leadership',
        ],
        systemPrompt: ROLE_PROMPTS['external-affairs-head'],
      },
      {
        id: 'agent-gov-relations-lead',
        role: 'government-relations-lead',
        name: 'Government Relations Lead',
        nameKr: '대관팀장',
        team: 'government-relations',
        department: 'external-affairs',
        provider: 'claude',
        capabilities: ['communication', 'planning', 'analysis', 'coordination'],
        skills: [
          'government-affairs',
          'policy-analysis',
          'regulatory-engagement',
          'lobbying-strategy',
          'political-intelligence',
          'stakeholder-mapping',
          'public-comment',
          'testimony-preparation',
        ],
        systemPrompt: ROLE_PROMPTS['government-relations-lead'],
      },
      {
        id: 'agent-policy-specialist',
        role: 'policy-specialist',
        name: 'Policy Specialist',
        nameKr: '정책 전문가',
        team: 'government-relations',
        department: 'external-affairs',
        provider: 'claude',
        capabilities: ['research', 'analysis', 'writing', 'communication'],
        skills: [
          'policy-research',
          'regulatory-analysis',
          'position-paper-writing',
          'legislative-tracking',
          'impact-assessment',
          'briefing-preparation',
          'stakeholder-analysis',
          'public-comment-drafting',
        ],
        systemPrompt: ROLE_PROMPTS['policy-specialist'],
      },
    ],
  },

  // ESG Team (ESG팀)
  {
    id: 'esg',
    name: 'ESG & Sustainability',
    nameKr: 'ESG',
    department: 'external-affairs',
    description: 'Drive environmental, social, and governance initiatives',
    lead: 'esg-lead',
    responsibilities: [
      'esg-strategy',
      'sustainability-reporting',
      'carbon-management',
      'social-impact',
      'csr-programs',
      'stakeholder-engagement',
      'ratings-management',
      'responsible-supply-chain',
    ],
    tools: [
      'workiva',
      'sphera',
      'persefoni',
      'watershed',
      'novisto',
      'ecovadis',
      'sustainalytics',
      'msci-esg',
      'benevity',
    ],
    workflows: ['esg-reporting', 'carbon-accounting', 'csr-initiative', 'stakeholder-assessment'],
    agents: [
      {
        id: 'agent-esg-lead',
        role: 'esg-lead',
        name: 'ESG Lead',
        nameKr: 'ESG팀장',
        team: 'esg',
        department: 'external-affairs',
        provider: 'claude',
        capabilities: ['planning', 'analysis', 'communication', 'coordination'],
        skills: [
          'esg-strategy',
          'sustainability-leadership',
          'stakeholder-engagement',
          'reporting-frameworks',
          'materiality-assessment',
          'target-setting',
          'ratings-optimization',
          'board-reporting',
        ],
        systemPrompt: ROLE_PROMPTS['esg-lead'],
      },
      {
        id: 'agent-csr-specialist',
        role: 'csr-specialist',
        name: 'CSR Specialist',
        nameKr: 'CSR 전문가',
        team: 'esg',
        department: 'external-affairs',
        provider: 'claude',
        capabilities: ['communication', 'coordination', 'creativity', 'planning'],
        skills: [
          'csr-programs',
          'community-engagement',
          'volunteer-coordination',
          'nonprofit-partnerships',
          'social-impact-measurement',
          'cause-marketing',
          'employee-giving',
          'grant-management',
        ],
        systemPrompt: ROLE_PROMPTS['csr-specialist'],
      },
      {
        id: 'agent-sustainability-analyst',
        role: 'sustainability-analyst',
        name: 'Sustainability Analyst',
        nameKr: '지속가능성 분석가',
        team: 'esg',
        department: 'external-affairs',
        provider: 'claude',
        capabilities: ['analysis', 'data-processing', 'documentation', 'research'],
        skills: [
          'carbon-accounting',
          'environmental-data',
          'lca-analysis',
          'ghg-protocol',
          'sustainability-metrics',
          'regulatory-tracking',
          'supply-chain-assessment',
          'reporting-standards',
        ],
        systemPrompt: ROLE_PROMPTS['sustainability-analyst'],
      },
    ],
  },
]

// ============================================================
// WORKFLOWS
// ============================================================

export const WORKFLOWS: Workflow[] = [
  {
    id: 'feature-development',
    name: 'Feature Development',
    pattern: 'agile-sprint',
    stages: [
      { id: 'planning', name: 'Planning', teams: ['project-management', 'architecture'], tasks: ['sprint-planning'], dependencies: [] },
      { id: 'design', name: 'Design', teams: ['design', 'ux-research'], tasks: ['ui-design', 'ux-research'], dependencies: ['planning'] },
      { id: 'development', name: 'Development', teams: ['backend', 'frontend'], tasks: ['feature-development'], dependencies: ['design'] },
      { id: 'testing', name: 'Testing', teams: ['quality-assurance'], tasks: ['testing'], dependencies: ['development'] },
      { id: 'review', name: 'Review', teams: ['architecture', 'security'], tasks: ['code-review', 'security-audit'], dependencies: ['testing'] },
      { id: 'deployment', name: 'Deployment', teams: ['devops'], tasks: ['deployment'], dependencies: ['review'] },
    ],
    config: {
      maxConcurrency: 5,
      timeout: 86400000,
      retryPolicy: { maxAttempts: 3, backoffMs: 1000, exponential: true },
      escalationPolicy: { timeoutMinutes: 60, escalateTo: ['cto', 'pm-lead'] },
    },
  },
  {
    id: 'incident-response',
    name: 'Incident Response',
    pattern: 'pipeline',
    stages: [
      { id: 'detection', name: 'Detection', teams: ['devops', 'support'], tasks: ['incident-response'], dependencies: [] },
      { id: 'triage', name: 'Triage', teams: ['devops', 'backend'], tasks: ['code-analysis'], dependencies: ['detection'] },
      { id: 'resolution', name: 'Resolution', teams: ['backend', 'frontend', 'devops'], tasks: ['bug-fix'], dependencies: ['triage'] },
      { id: 'verification', name: 'Verification', teams: ['quality-assurance'], tasks: ['testing'], dependencies: ['resolution'] },
      { id: 'postmortem', name: 'Postmortem', teams: ['architecture', 'project-management'], tasks: ['documentation'], dependencies: ['verification'] },
    ],
    config: {
      maxConcurrency: 10,
      timeout: 14400000,
      retryPolicy: { maxAttempts: 5, backoffMs: 500, exponential: true },
      escalationPolicy: { timeoutMinutes: 15, escalateTo: ['cto', 'coo'] },
    },
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    pattern: 'waterfall',
    stages: [
      { id: 'strategy', name: 'Strategy', teams: ['strategy', 'marketing'], tasks: ['market-research', 'roadmap'], dependencies: [] },
      { id: 'development', name: 'Development', teams: ['backend', 'frontend', 'data'], tasks: ['feature-development'], dependencies: ['strategy'] },
      { id: 'qa', name: 'Quality Assurance', teams: ['quality-assurance', 'security'], tasks: ['testing', 'security-audit'], dependencies: ['development'] },
      { id: 'marketing', name: 'Marketing Prep', teams: ['marketing', 'content', 'design'], tasks: ['copywriting', 'ui-design'], dependencies: ['qa'] },
      { id: 'launch', name: 'Launch', teams: ['devops', 'marketing', 'support'], tasks: ['deployment'], dependencies: ['marketing'] },
    ],
    config: {
      maxConcurrency: 8,
      timeout: 604800000,
      retryPolicy: { maxAttempts: 2, backoffMs: 5000, exponential: false },
      escalationPolicy: { timeoutMinutes: 120, escalateTo: ['ceo', 'cto', 'cmo'] },
    },
  },
  // ============================================================
  // FINANCE WORKFLOWS
  // ============================================================
  {
    id: 'monthly-close',
    name: 'Monthly Financial Close',
    pattern: 'pipeline',
    stages: [
      { id: 'data-collection', name: 'Data Collection', teams: ['accounting', 'treasury'], tasks: ['custom'], dependencies: [] },
      { id: 'journal-entries', name: 'Journal Entries', teams: ['accounting'], tasks: ['custom'], dependencies: ['data-collection'] },
      { id: 'reconciliation', name: 'Account Reconciliation', teams: ['accounting'], tasks: ['custom'], dependencies: ['journal-entries'] },
      { id: 'review', name: 'Financial Review', teams: ['financial-planning'], tasks: ['custom'], dependencies: ['reconciliation'] },
      { id: 'reporting', name: 'Financial Reporting', teams: ['financial-planning'], tasks: ['documentation'], dependencies: ['review'] },
      { id: 'analysis', name: 'Variance Analysis', teams: ['financial-planning'], tasks: ['custom'], dependencies: ['reporting'] },
    ],
    config: {
      maxConcurrency: 3,
      timeout: 259200000, // 3 days
      retryPolicy: { maxAttempts: 2, backoffMs: 3000, exponential: false },
      escalationPolicy: { timeoutMinutes: 240, escalateTo: ['cfo', 'finance-lead'] },
    },
  },
  {
    id: 'budget-planning',
    name: 'Annual Budget Planning',
    pattern: 'waterfall',
    stages: [
      { id: 'dept-requests', name: 'Department Requests', teams: ['financial-planning'], tasks: ['custom'], dependencies: [] },
      { id: 'analysis', name: 'Budget Analysis', teams: ['financial-planning'], tasks: ['custom'], dependencies: ['dept-requests'] },
      { id: 'risk-assessment', name: 'Risk Assessment', teams: ['treasury'], tasks: ['custom'], dependencies: ['analysis'] },
      { id: 'adjustment', name: 'Budget Adjustment', teams: ['financial-planning', 'accounting'], tasks: ['custom'], dependencies: ['risk-assessment'] },
      { id: 'approval', name: 'Executive Approval', teams: ['c-suite'], tasks: ['custom'], dependencies: ['adjustment'] },
      { id: 'implementation', name: 'Budget Implementation', teams: ['financial-planning', 'accounting'], tasks: ['custom'], dependencies: ['approval'] },
    ],
    config: {
      maxConcurrency: 4,
      timeout: 1209600000, // 14 days
      retryPolicy: { maxAttempts: 2, backoffMs: 5000, exponential: false },
      escalationPolicy: { timeoutMinutes: 480, escalateTo: ['cfo', 'ceo'] },
    },
  },
  {
    id: 'financial-audit',
    name: 'Financial Audit Support',
    pattern: 'sequential',
    stages: [
      { id: 'preparation', name: 'Audit Preparation', teams: ['accounting'], tasks: ['documentation'], dependencies: [] },
      { id: 'documentation', name: 'Document Assembly', teams: ['accounting', 'treasury'], tasks: ['documentation'], dependencies: ['preparation'] },
      { id: 'review', name: 'Internal Review', teams: ['financial-planning'], tasks: ['code-review'], dependencies: ['documentation'] },
      { id: 'support', name: 'Auditor Support', teams: ['accounting', 'financial-planning'], tasks: ['support-ticket'], dependencies: ['review'] },
      { id: 'remediation', name: 'Finding Remediation', teams: ['accounting'], tasks: ['bug-fix'], dependencies: ['support'] },
    ],
    config: {
      maxConcurrency: 5,
      timeout: 2592000000, // 30 days
      retryPolicy: { maxAttempts: 3, backoffMs: 2000, exponential: true },
      escalationPolicy: { timeoutMinutes: 360, escalateTo: ['cfo', 'accounting-lead'] },
    },
  },
  // ============================================================
  // LEGAL WORKFLOWS
  // ============================================================
  {
    id: 'contract-review',
    name: 'Contract Review & Approval',
    pattern: 'pipeline',
    stages: [
      { id: 'intake', name: 'Request Intake', teams: ['corporate-legal'], tasks: ['custom'], dependencies: [] },
      { id: 'review', name: 'Legal Review', teams: ['corporate-legal'], tasks: ['code-review'], dependencies: ['intake'] },
      { id: 'risk-analysis', name: 'Risk Analysis', teams: ['corporate-legal', 'compliance'], tasks: ['security-audit'], dependencies: ['review'] },
      { id: 'negotiation', name: 'Negotiation', teams: ['corporate-legal'], tasks: ['custom'], dependencies: ['risk-analysis'] },
      { id: 'approval', name: 'Legal Approval', teams: ['corporate-legal'], tasks: ['custom'], dependencies: ['negotiation'] },
      { id: 'execution', name: 'Contract Execution', teams: ['corporate-legal'], tasks: ['custom'], dependencies: ['approval'] },
    ],
    config: {
      maxConcurrency: 8,
      timeout: 604800000, // 7 days
      retryPolicy: { maxAttempts: 2, backoffMs: 2000, exponential: false },
      escalationPolicy: { timeoutMinutes: 120, escalateTo: ['general-counsel', 'ceo'] },
    },
  },
  {
    id: 'compliance-audit',
    name: 'Compliance Audit',
    pattern: 'sequential',
    stages: [
      { id: 'planning', name: 'Audit Planning', teams: ['compliance'], tasks: ['sprint-planning'], dependencies: [] },
      { id: 'assessment', name: 'Compliance Assessment', teams: ['compliance'], tasks: ['security-audit'], dependencies: ['planning'] },
      { id: 'findings', name: 'Findings Documentation', teams: ['compliance'], tasks: ['documentation'], dependencies: ['assessment'] },
      { id: 'remediation', name: 'Remediation Planning', teams: ['compliance', 'corporate-legal'], tasks: ['custom'], dependencies: ['findings'] },
      { id: 'implementation', name: 'Remediation Implementation', teams: ['compliance'], tasks: ['bug-fix'], dependencies: ['remediation'] },
      { id: 'monitoring', name: 'Ongoing Monitoring', teams: ['compliance'], tasks: ['custom'], dependencies: ['implementation'] },
    ],
    config: {
      maxConcurrency: 4,
      timeout: 1209600000, // 14 days
      retryPolicy: { maxAttempts: 3, backoffMs: 3000, exponential: true },
      escalationPolicy: { timeoutMinutes: 180, escalateTo: ['compliance-lead', 'general-counsel'] },
    },
  },
  {
    id: 'ip-protection',
    name: 'Intellectual Property Protection',
    pattern: 'pipeline',
    stages: [
      { id: 'disclosure', name: 'Invention Disclosure', teams: ['intellectual-property'], tasks: ['custom'], dependencies: [] },
      { id: 'evaluation', name: 'Patentability Evaluation', teams: ['intellectual-property'], tasks: ['code-analysis'], dependencies: ['disclosure'] },
      { id: 'search', name: 'Prior Art Search', teams: ['intellectual-property'], tasks: ['market-research'], dependencies: ['evaluation'] },
      { id: 'filing', name: 'Patent Filing', teams: ['intellectual-property'], tasks: ['documentation'], dependencies: ['search'] },
      { id: 'prosecution', name: 'Patent Prosecution', teams: ['intellectual-property', 'corporate-legal'], tasks: ['custom'], dependencies: ['filing'] },
      { id: 'maintenance', name: 'IP Maintenance', teams: ['intellectual-property'], tasks: ['custom'], dependencies: ['prosecution'] },
    ],
    config: {
      maxConcurrency: 3,
      timeout: 7776000000, // 90 days
      retryPolicy: { maxAttempts: 2, backoffMs: 5000, exponential: false },
      escalationPolicy: { timeoutMinutes: 720, escalateTo: ['ip-counsel', 'general-counsel'] },
    },
  },
  {
    id: 'privacy-compliance',
    name: 'Privacy Compliance (GDPR/CCPA)',
    pattern: 'kanban',
    stages: [
      { id: 'data-mapping', name: 'Data Mapping', teams: ['compliance'], tasks: ['code-analysis'], dependencies: [] },
      { id: 'assessment', name: 'Privacy Assessment', teams: ['compliance'], tasks: ['security-audit'], dependencies: ['data-mapping'] },
      { id: 'policy-update', name: 'Policy Update', teams: ['compliance', 'corporate-legal'], tasks: ['documentation'], dependencies: ['assessment'] },
      { id: 'implementation', name: 'Technical Implementation', teams: ['compliance', 'security'], tasks: ['feature-development'], dependencies: ['policy-update'] },
      { id: 'training', name: 'Staff Training', teams: ['compliance'], tasks: ['onboarding'], dependencies: ['implementation'] },
      { id: 'monitoring', name: 'Continuous Monitoring', teams: ['compliance'], tasks: ['custom'], dependencies: ['training'] },
    ],
    config: {
      maxConcurrency: 5,
      timeout: 2592000000, // 30 days
      retryPolicy: { maxAttempts: 3, backoffMs: 2000, exponential: true },
      escalationPolicy: { timeoutMinutes: 240, escalateTo: ['privacy-officer', 'compliance-lead'] },
    },
  },
  // ============================================================
  // PR & COMMUNICATIONS WORKFLOWS
  // ============================================================
  {
    id: 'pr-campaign',
    name: 'PR Campaign Execution',
    pattern: 'agile-sprint',
    stages: [
      { id: 'strategy', name: 'Campaign Strategy', teams: ['pr-communications', 'marketing'], tasks: ['market-research'], dependencies: [] },
      { id: 'message-dev', name: 'Message Development', teams: ['pr-communications'], tasks: ['copywriting'], dependencies: ['strategy'] },
      { id: 'content-creation', name: 'Content Creation', teams: ['pr-communications', 'content'], tasks: ['custom'], dependencies: ['message-dev'] },
      { id: 'media-outreach', name: 'Media Outreach', teams: ['pr-communications'], tasks: ['custom'], dependencies: ['content-creation'] },
      { id: 'execution', name: 'Campaign Execution', teams: ['pr-communications', 'marketing'], tasks: ['custom'], dependencies: ['media-outreach'] },
      { id: 'monitoring', name: 'Monitoring & Reporting', teams: ['pr-communications'], tasks: ['documentation'], dependencies: ['execution'] },
    ],
    config: {
      maxConcurrency: 6,
      timeout: 1209600000, // 14 days
      retryPolicy: { maxAttempts: 2, backoffMs: 2000, exponential: false },
      escalationPolicy: { timeoutMinutes: 120, escalateTo: ['pr-lead', 'cmo'] },
    },
  },
  {
    id: 'product-launch-pr',
    name: 'Product Launch PR',
    pattern: 'waterfall',
    stages: [
      { id: 'briefing', name: 'Product Briefing', teams: ['pr-communications', 'marketing'], tasks: ['custom'], dependencies: [] },
      { id: 'messaging', name: 'Key Messaging', teams: ['pr-communications'], tasks: ['copywriting'], dependencies: ['briefing'] },
      { id: 'press-kit', name: 'Press Kit Creation', teams: ['pr-communications'], tasks: ['documentation'], dependencies: ['messaging'] },
      { id: 'product-pages', name: 'Product Page Development', teams: ['pr-communications', 'frontend'], tasks: ['ui-design'], dependencies: ['messaging'] },
      { id: 'media-prep', name: 'Media Preparation', teams: ['pr-communications'], tasks: ['custom'], dependencies: ['press-kit'] },
      { id: 'social-content', name: 'Social Content Creation', teams: ['pr-communications', 'content'], tasks: ['custom'], dependencies: ['messaging'] },
      { id: 'launch-execution', name: 'Launch Execution', teams: ['pr-communications', 'marketing'], tasks: ['custom'], dependencies: ['media-prep', 'product-pages', 'social-content'] },
      { id: 'post-launch', name: 'Post-Launch Analysis', teams: ['pr-communications'], tasks: ['documentation'], dependencies: ['launch-execution'] },
    ],
    config: {
      maxConcurrency: 8,
      timeout: 2592000000, // 30 days
      retryPolicy: { maxAttempts: 2, backoffMs: 3000, exponential: false },
      escalationPolicy: { timeoutMinutes: 180, escalateTo: ['pr-lead', 'marketing-lead', 'cmo'] },
    },
  },
  {
    id: 'crisis-communication',
    name: 'Crisis Communication Response',
    pattern: 'pipeline',
    stages: [
      { id: 'detection', name: 'Issue Detection', teams: ['pr-communications', 'support'], tasks: ['incident-response'], dependencies: [] },
      { id: 'assessment', name: 'Crisis Assessment', teams: ['pr-communications', 'corporate-legal'], tasks: ['code-analysis'], dependencies: ['detection'] },
      { id: 'response-plan', name: 'Response Planning', teams: ['pr-communications', 'c-suite'], tasks: ['custom'], dependencies: ['assessment'] },
      { id: 'message-approval', name: 'Message Approval', teams: ['pr-communications', 'corporate-legal'], tasks: ['custom'], dependencies: ['response-plan'] },
      { id: 'communication', name: 'External Communication', teams: ['pr-communications'], tasks: ['custom'], dependencies: ['message-approval'] },
      { id: 'monitoring', name: 'Response Monitoring', teams: ['pr-communications'], tasks: ['custom'], dependencies: ['communication'] },
      { id: 'recovery', name: 'Reputation Recovery', teams: ['pr-communications', 'marketing'], tasks: ['custom'], dependencies: ['monitoring'] },
    ],
    config: {
      maxConcurrency: 10,
      timeout: 604800000, // 7 days
      retryPolicy: { maxAttempts: 3, backoffMs: 500, exponential: true },
      escalationPolicy: { timeoutMinutes: 30, escalateTo: ['pr-lead', 'general-counsel', 'ceo'] },
    },
  },
  {
    id: 'social-media-campaign',
    name: 'Social Media Campaign',
    pattern: 'kanban',
    stages: [
      { id: 'planning', name: 'Campaign Planning', teams: ['pr-communications', 'marketing'], tasks: ['sprint-planning'], dependencies: [] },
      { id: 'content-creation', name: 'Content Creation', teams: ['pr-communications'], tasks: ['custom'], dependencies: ['planning'] },
      { id: 'visual-production', name: 'Visual Production', teams: ['pr-communications', 'design'], tasks: ['ui-design'], dependencies: ['content-creation'] },
      { id: 'scheduling', name: 'Content Scheduling', teams: ['pr-communications'], tasks: ['custom'], dependencies: ['visual-production'] },
      { id: 'community-mgmt', name: 'Community Management', teams: ['pr-communications'], tasks: ['support-ticket'], dependencies: ['scheduling'] },
      { id: 'analytics', name: 'Performance Analytics', teams: ['pr-communications'], tasks: ['performance-analysis'], dependencies: ['community-mgmt'] },
    ],
    config: {
      maxConcurrency: 5,
      timeout: 2592000000, // 30 days
      retryPolicy: { maxAttempts: 2, backoffMs: 1000, exponential: false },
      escalationPolicy: { timeoutMinutes: 60, escalateTo: ['social-media-manager', 'pr-lead'] },
    },
  },
  {
    id: 'product-page-optimization',
    name: 'Product Page Optimization',
    pattern: 'agile-sprint',
    stages: [
      { id: 'analysis', name: 'Current Page Analysis', teams: ['pr-communications'], tasks: ['performance-analysis'], dependencies: [] },
      { id: 'user-research', name: 'User Research', teams: ['pr-communications', 'ux-research'], tasks: ['ux-research'], dependencies: ['analysis'] },
      { id: 'copywriting', name: 'Copy Optimization', teams: ['pr-communications'], tasks: ['copywriting'], dependencies: ['user-research'] },
      { id: 'design', name: 'Design Iteration', teams: ['pr-communications', 'design'], tasks: ['ui-design'], dependencies: ['copywriting'] },
      { id: 'development', name: 'Page Development', teams: ['frontend'], tasks: ['feature-development'], dependencies: ['design'] },
      { id: 'ab-testing', name: 'A/B Testing', teams: ['pr-communications'], tasks: ['testing'], dependencies: ['development'] },
      { id: 'optimization', name: 'Conversion Optimization', teams: ['pr-communications'], tasks: ['custom'], dependencies: ['ab-testing'] },
    ],
    config: {
      maxConcurrency: 4,
      timeout: 1209600000, // 14 days
      retryPolicy: { maxAttempts: 3, backoffMs: 2000, exponential: true },
      escalationPolicy: { timeoutMinutes: 120, escalateTo: ['product-page-specialist', 'pr-lead'] },
    },
  },
  // ============================================================
  // PLANNING WORKFLOWS (기획 워크플로우)
  // ============================================================
  {
    id: 'product-discovery',
    name: 'Product Discovery',
    pattern: 'agile-sprint',
    stages: [
      { id: 'opportunity', name: 'Opportunity Identification', teams: ['product-planning', 'business-planning'], tasks: ['market-research'], dependencies: [] },
      { id: 'user-research', name: 'User Research', teams: ['product-planning', 'ux-research'], tasks: ['ux-research'], dependencies: ['opportunity'] },
      { id: 'problem-definition', name: 'Problem Definition', teams: ['product-planning'], tasks: ['custom'], dependencies: ['user-research'] },
      { id: 'ideation', name: 'Solution Ideation', teams: ['product-planning', 'design'], tasks: ['custom'], dependencies: ['problem-definition'] },
      { id: 'prototyping', name: 'Prototyping', teams: ['product-planning', 'design'], tasks: ['ui-design'], dependencies: ['ideation'] },
      { id: 'validation', name: 'Validation Testing', teams: ['product-planning', 'ux-research'], tasks: ['ux-research'], dependencies: ['prototyping'] },
      { id: 'specification', name: 'PRD Creation', teams: ['product-planning'], tasks: ['documentation'], dependencies: ['validation'] },
    ],
    config: {
      maxConcurrency: 5,
      timeout: 1209600000, // 14 days
      retryPolicy: { maxAttempts: 2, backoffMs: 2000, exponential: false },
      escalationPolicy: { timeoutMinutes: 180, escalateTo: ['product-planning-lead', 'cpo'] },
    },
  },
  {
    id: 'feature-planning',
    name: 'Feature Planning & Specification',
    pattern: 'pipeline',
    stages: [
      { id: 'requirements', name: 'Requirements Gathering', teams: ['product-planning'], tasks: ['custom'], dependencies: [] },
      { id: 'analysis', name: 'Requirements Analysis', teams: ['product-planning'], tasks: ['code-analysis'], dependencies: ['requirements'] },
      { id: 'prioritization', name: 'Feature Prioritization', teams: ['product-planning'], tasks: ['custom'], dependencies: ['analysis'] },
      { id: 'specification', name: 'Feature Specification', teams: ['product-planning'], tasks: ['documentation'], dependencies: ['prioritization'] },
      { id: 'design-collab', name: 'Design Collaboration', teams: ['product-planning', 'design'], tasks: ['ui-design'], dependencies: ['specification'] },
      { id: 'tech-review', name: 'Technical Review', teams: ['product-planning', 'architecture'], tasks: ['code-review'], dependencies: ['design-collab'] },
      { id: 'approval', name: 'Stakeholder Approval', teams: ['product-planning', 'c-suite'], tasks: ['custom'], dependencies: ['tech-review'] },
    ],
    config: {
      maxConcurrency: 4,
      timeout: 604800000, // 7 days
      retryPolicy: { maxAttempts: 2, backoffMs: 1500, exponential: false },
      escalationPolicy: { timeoutMinutes: 120, escalateTo: ['senior-product-manager', 'product-planning-lead'] },
    },
  },
  {
    id: 'release-planning',
    name: 'Release Planning & Management',
    pattern: 'waterfall',
    stages: [
      { id: 'scope-definition', name: 'Release Scope Definition', teams: ['product-planning'], tasks: ['sprint-planning'], dependencies: [] },
      { id: 'dependency-mapping', name: 'Dependency Mapping', teams: ['product-planning', 'architecture'], tasks: ['code-analysis'], dependencies: ['scope-definition'] },
      { id: 'timeline', name: 'Timeline Planning', teams: ['product-planning', 'project-management'], tasks: ['sprint-planning'], dependencies: ['dependency-mapping'] },
      { id: 'resource-allocation', name: 'Resource Allocation', teams: ['product-planning', 'project-management'], tasks: ['custom'], dependencies: ['timeline'] },
      { id: 'risk-assessment', name: 'Risk Assessment', teams: ['product-planning'], tasks: ['security-audit'], dependencies: ['resource-allocation'] },
      { id: 'communication', name: 'Stakeholder Communication', teams: ['product-planning'], tasks: ['documentation'], dependencies: ['risk-assessment'] },
      { id: 'tracking', name: 'Release Tracking', teams: ['product-planning', 'project-management'], tasks: ['custom'], dependencies: ['communication'] },
    ],
    config: {
      maxConcurrency: 4,
      timeout: 604800000, // 7 days
      retryPolicy: { maxAttempts: 2, backoffMs: 2000, exponential: false },
      escalationPolicy: { timeoutMinutes: 180, escalateTo: ['product-planning-lead', 'pm-lead'] },
    },
  },
  {
    id: 'business-opportunity-assessment',
    name: 'Business Opportunity Assessment',
    pattern: 'sequential',
    stages: [
      { id: 'opportunity-id', name: 'Opportunity Identification', teams: ['business-planning'], tasks: ['market-research'], dependencies: [] },
      { id: 'market-analysis', name: 'Market Analysis', teams: ['business-planning'], tasks: ['market-research'], dependencies: ['opportunity-id'] },
      { id: 'competitive-analysis', name: 'Competitive Analysis', teams: ['business-planning'], tasks: ['code-analysis'], dependencies: ['market-analysis'] },
      { id: 'feasibility', name: 'Feasibility Study', teams: ['business-planning'], tasks: ['custom'], dependencies: ['competitive-analysis'] },
      { id: 'business-case', name: 'Business Case Development', teams: ['business-planning', 'financial-planning'], tasks: ['documentation'], dependencies: ['feasibility'] },
      { id: 'recommendation', name: 'Go/No-Go Recommendation', teams: ['business-planning', 'c-suite'], tasks: ['custom'], dependencies: ['business-case'] },
    ],
    config: {
      maxConcurrency: 3,
      timeout: 1209600000, // 14 days
      retryPolicy: { maxAttempts: 2, backoffMs: 3000, exponential: false },
      escalationPolicy: { timeoutMinutes: 240, escalateTo: ['business-planning-lead', 'cpo'] },
    },
  },
  {
    id: 'gtm-strategy',
    name: 'Go-to-Market Strategy',
    pattern: 'waterfall',
    stages: [
      { id: 'market-definition', name: 'Target Market Definition', teams: ['business-planning'], tasks: ['market-research'], dependencies: [] },
      { id: 'positioning', name: 'Product Positioning', teams: ['business-planning', 'marketing'], tasks: ['custom'], dependencies: ['market-definition'] },
      { id: 'pricing', name: 'Pricing Strategy', teams: ['business-planning', 'financial-planning'], tasks: ['custom'], dependencies: ['positioning'] },
      { id: 'channel', name: 'Channel Strategy', teams: ['business-planning', 'business-dev'], tasks: ['custom'], dependencies: ['pricing'] },
      { id: 'marketing-plan', name: 'Marketing Plan', teams: ['business-planning', 'marketing'], tasks: ['custom'], dependencies: ['channel'] },
      { id: 'sales-enablement', name: 'Sales Enablement', teams: ['business-planning', 'business-dev'], tasks: ['documentation'], dependencies: ['marketing-plan'] },
      { id: 'launch-plan', name: 'Launch Planning', teams: ['business-planning', 'pr-communications'], tasks: ['custom'], dependencies: ['sales-enablement'] },
    ],
    config: {
      maxConcurrency: 5,
      timeout: 2592000000, // 30 days
      retryPolicy: { maxAttempts: 2, backoffMs: 3000, exponential: false },
      escalationPolicy: { timeoutMinutes: 360, escalateTo: ['go-to-market-strategist', 'business-planning-lead', 'cmo'] },
    },
  },
  {
    id: 'data-insights-cycle',
    name: 'Data Insights Generation',
    pattern: 'kanban',
    stages: [
      { id: 'question-definition', name: 'Question Definition', teams: ['data-analytics', 'product-planning'], tasks: ['custom'], dependencies: [] },
      { id: 'data-collection', name: 'Data Collection', teams: ['data-analytics'], tasks: ['custom'], dependencies: ['question-definition'] },
      { id: 'analysis', name: 'Data Analysis', teams: ['data-analytics'], tasks: ['code-analysis'], dependencies: ['data-collection'] },
      { id: 'insight-generation', name: 'Insight Generation', teams: ['data-analytics'], tasks: ['custom'], dependencies: ['analysis'] },
      { id: 'storytelling', name: 'Data Storytelling', teams: ['data-analytics'], tasks: ['documentation'], dependencies: ['insight-generation'] },
      { id: 'action-recommendation', name: 'Action Recommendation', teams: ['data-analytics', 'product-planning'], tasks: ['custom'], dependencies: ['storytelling'] },
    ],
    config: {
      maxConcurrency: 4,
      timeout: 604800000, // 7 days
      retryPolicy: { maxAttempts: 2, backoffMs: 1500, exponential: false },
      escalationPolicy: { timeoutMinutes: 120, escalateTo: ['analytics-lead', 'insights-manager'] },
    },
  },
  {
    id: 'ab-testing-cycle',
    name: 'A/B Testing Cycle',
    pattern: 'pipeline',
    stages: [
      { id: 'hypothesis', name: 'Hypothesis Formation', teams: ['data-analytics', 'product-planning'], tasks: ['custom'], dependencies: [] },
      { id: 'experiment-design', name: 'Experiment Design', teams: ['data-analytics'], tasks: ['custom'], dependencies: ['hypothesis'] },
      { id: 'implementation', name: 'Test Implementation', teams: ['data-analytics', 'frontend'], tasks: ['feature-development'], dependencies: ['experiment-design'] },
      { id: 'execution', name: 'Test Execution', teams: ['data-analytics'], tasks: ['testing'], dependencies: ['implementation'] },
      { id: 'analysis', name: 'Results Analysis', teams: ['data-analytics'], tasks: ['performance-analysis'], dependencies: ['execution'] },
      { id: 'decision', name: 'Decision & Rollout', teams: ['data-analytics', 'product-planning'], tasks: ['custom'], dependencies: ['analysis'] },
      { id: 'documentation', name: 'Learning Documentation', teams: ['data-analytics'], tasks: ['documentation'], dependencies: ['decision'] },
    ],
    config: {
      maxConcurrency: 5,
      timeout: 1209600000, // 14 days
      retryPolicy: { maxAttempts: 2, backoffMs: 2000, exponential: false },
      escalationPolicy: { timeoutMinutes: 180, escalateTo: ['ab-test-analyst', 'analytics-lead'] },
    },
  },
  {
    id: 'metrics-review',
    name: 'Weekly Metrics Review',
    pattern: 'sequential',
    stages: [
      { id: 'data-pull', name: 'Data Collection', teams: ['data-analytics'], tasks: ['custom'], dependencies: [] },
      { id: 'dashboard-update', name: 'Dashboard Update', teams: ['data-analytics'], tasks: ['custom'], dependencies: ['data-pull'] },
      { id: 'anomaly-detection', name: 'Anomaly Detection', teams: ['data-analytics'], tasks: ['code-analysis'], dependencies: ['dashboard-update'] },
      { id: 'insight-prep', name: 'Insight Preparation', teams: ['data-analytics'], tasks: ['documentation'], dependencies: ['anomaly-detection'] },
      { id: 'review-meeting', name: 'Review Meeting', teams: ['data-analytics', 'product-planning', 'c-suite'], tasks: ['custom'], dependencies: ['insight-prep'] },
      { id: 'action-items', name: 'Action Items Definition', teams: ['data-analytics', 'product-planning'], tasks: ['custom'], dependencies: ['review-meeting'] },
    ],
    config: {
      maxConcurrency: 3,
      timeout: 86400000, // 1 day
      retryPolicy: { maxAttempts: 2, backoffMs: 1000, exponential: false },
      escalationPolicy: { timeoutMinutes: 60, escalateTo: ['analytics-lead', 'product-planning-lead'] },
    },
  },
  // ============================================================
  // SECRETARIAT WORKFLOWS (비서실 워크플로우)
  // ============================================================
  {
    id: 'daily-ceo-briefing',
    name: 'Daily CEO Briefing',
    pattern: 'sequential',
    stages: [
      { id: 'news-gathering', name: 'News & Intel Gathering', teams: ['secretariat'], tasks: ['custom'], dependencies: [] },
      { id: 'schedule-review', name: 'Schedule Review', teams: ['secretariat'], tasks: ['custom'], dependencies: [] },
      { id: 'comms-summary', name: 'Communications Summary', teams: ['secretariat'], tasks: ['custom'], dependencies: [] },
      { id: 'briefing-prep', name: 'Briefing Preparation', teams: ['secretariat'], tasks: ['documentation'], dependencies: ['news-gathering', 'schedule-review', 'comms-summary'] },
      { id: 'briefing-delivery', name: 'Briefing Delivery', teams: ['secretariat', 'c-suite'], tasks: ['custom'], dependencies: ['briefing-prep'] },
      { id: 'action-capture', name: 'Action Items Capture', teams: ['secretariat'], tasks: ['custom'], dependencies: ['briefing-delivery'] },
    ],
    config: {
      maxConcurrency: 4,
      timeout: 7200000, // 2 hours
      retryPolicy: { maxAttempts: 2, backoffMs: 500, exponential: false },
      escalationPolicy: { timeoutMinutes: 30, escalateTo: ['chief-of-staff'] },
    },
  },
  {
    id: 'meeting-preparation',
    name: 'Executive Meeting Preparation',
    pattern: 'pipeline',
    stages: [
      { id: 'meeting-info', name: 'Meeting Information Gathering', teams: ['secretariat'], tasks: ['custom'], dependencies: [] },
      { id: 'participant-research', name: 'Participant Research', teams: ['secretariat'], tasks: ['market-research'], dependencies: ['meeting-info'] },
      { id: 'agenda-analysis', name: 'Agenda Analysis', teams: ['secretariat'], tasks: ['code-analysis'], dependencies: ['meeting-info'] },
      { id: 'briefing-doc', name: 'Briefing Document Creation', teams: ['secretariat'], tasks: ['documentation'], dependencies: ['participant-research', 'agenda-analysis'] },
      { id: 'logistics', name: 'Logistics Coordination', teams: ['secretariat'], tasks: ['custom'], dependencies: ['meeting-info'] },
      { id: 'final-review', name: 'Final Review & CEO Prep', teams: ['secretariat'], tasks: ['custom'], dependencies: ['briefing-doc', 'logistics'] },
    ],
    config: {
      maxConcurrency: 4,
      timeout: 86400000, // 1 day
      retryPolicy: { maxAttempts: 2, backoffMs: 1000, exponential: false },
      escalationPolicy: { timeoutMinutes: 60, escalateTo: ['chief-of-staff', 'schedule-secretary'] },
    },
  },
  {
    id: 'executive-crisis-response',
    name: 'Executive Crisis Response',
    pattern: 'pipeline',
    stages: [
      { id: 'alert', name: 'Crisis Alert & Assessment', teams: ['secretariat'], tasks: ['incident-response'], dependencies: [] },
      { id: 'info-gathering', name: 'Rapid Information Gathering', teams: ['secretariat'], tasks: ['custom'], dependencies: ['alert'] },
      { id: 'ceo-briefing', name: 'CEO Immediate Briefing', teams: ['secretariat', 'c-suite'], tasks: ['custom'], dependencies: ['info-gathering'] },
      { id: 'response-coord', name: 'Response Coordination', teams: ['secretariat', 'pr-communications'], tasks: ['custom'], dependencies: ['ceo-briefing'] },
      { id: 'stakeholder-comms', name: 'Stakeholder Communications', teams: ['secretariat', 'pr-communications'], tasks: ['custom'], dependencies: ['response-coord'] },
      { id: 'monitoring', name: 'Situation Monitoring', teams: ['secretariat'], tasks: ['custom'], dependencies: ['stakeholder-comms'] },
      { id: 'resolution', name: 'Resolution & Debrief', teams: ['secretariat', 'c-suite'], tasks: ['documentation'], dependencies: ['monitoring'] },
    ],
    config: {
      maxConcurrency: 8,
      timeout: 259200000, // 3 days
      retryPolicy: { maxAttempts: 3, backoffMs: 300, exponential: true },
      escalationPolicy: { timeoutMinutes: 15, escalateTo: ['chief-of-staff', 'ceo'] },
    },
  },
  {
    id: 'vip-visit-protocol',
    name: 'VIP Visit Protocol',
    pattern: 'waterfall',
    stages: [
      { id: 'visit-planning', name: 'Visit Planning', teams: ['secretariat'], tasks: ['sprint-planning'], dependencies: [] },
      { id: 'vip-research', name: 'VIP Research & Profiling', teams: ['secretariat'], tasks: ['market-research'], dependencies: ['visit-planning'] },
      { id: 'schedule-coord', name: 'Schedule Coordination', teams: ['secretariat'], tasks: ['custom'], dependencies: ['visit-planning'] },
      { id: 'logistics-prep', name: 'Logistics Preparation', teams: ['secretariat'], tasks: ['custom'], dependencies: ['schedule-coord'] },
      { id: 'briefing-prep', name: 'CEO Briefing Preparation', teams: ['secretariat'], tasks: ['documentation'], dependencies: ['vip-research'] },
      { id: 'protocol-review', name: 'Protocol Review', teams: ['secretariat'], tasks: ['custom'], dependencies: ['logistics-prep', 'briefing-prep'] },
      { id: 'execution', name: 'Visit Execution', teams: ['secretariat'], tasks: ['custom'], dependencies: ['protocol-review'] },
      { id: 'follow-up', name: 'Follow-up Actions', teams: ['secretariat'], tasks: ['custom'], dependencies: ['execution'] },
    ],
    config: {
      maxConcurrency: 4,
      timeout: 604800000, // 7 days
      retryPolicy: { maxAttempts: 2, backoffMs: 2000, exponential: false },
      escalationPolicy: { timeoutMinutes: 120, escalateTo: ['chief-of-staff', 'special-advisor'] },
    },
  },
  {
    id: 'executive-travel',
    name: 'Executive Travel Management',
    pattern: 'pipeline',
    stages: [
      { id: 'travel-request', name: 'Travel Request & Planning', teams: ['secretariat'], tasks: ['custom'], dependencies: [] },
      { id: 'itinerary', name: 'Itinerary Development', teams: ['secretariat'], tasks: ['custom'], dependencies: ['travel-request'] },
      { id: 'booking', name: 'Booking & Reservations', teams: ['secretariat'], tasks: ['custom'], dependencies: ['itinerary'] },
      { id: 'briefing-prep', name: 'Travel Briefing Preparation', teams: ['secretariat'], tasks: ['documentation'], dependencies: ['itinerary'] },
      { id: 'logistics', name: 'Ground Logistics', teams: ['secretariat'], tasks: ['custom'], dependencies: ['booking'] },
      { id: 'pre-trip-review', name: 'Pre-Trip Review', teams: ['secretariat', 'c-suite'], tasks: ['custom'], dependencies: ['briefing-prep', 'logistics'] },
      { id: 'travel-support', name: 'Real-time Travel Support', teams: ['secretariat'], tasks: ['custom'], dependencies: ['pre-trip-review'] },
      { id: 'post-trip', name: 'Post-Trip Processing', teams: ['secretariat'], tasks: ['documentation'], dependencies: ['travel-support'] },
    ],
    config: {
      maxConcurrency: 3,
      timeout: 1209600000, // 14 days
      retryPolicy: { maxAttempts: 2, backoffMs: 1500, exponential: false },
      escalationPolicy: { timeoutMinutes: 60, escalateTo: ['administrative-secretary', 'chief-of-staff'] },
    },
  },
  {
    id: 'cross-department-coordination',
    name: 'Cross-Department Coordination',
    pattern: 'kanban',
    stages: [
      { id: 'request-intake', name: 'Coordination Request', teams: ['secretariat'], tasks: ['custom'], dependencies: [] },
      { id: 'stakeholder-id', name: 'Stakeholder Identification', teams: ['secretariat'], tasks: ['custom'], dependencies: ['request-intake'] },
      { id: 'alignment', name: 'Alignment Meeting', teams: ['secretariat', 'c-suite'], tasks: ['custom'], dependencies: ['stakeholder-id'] },
      { id: 'action-plan', name: 'Action Plan Development', teams: ['secretariat'], tasks: ['documentation'], dependencies: ['alignment'] },
      { id: 'execution-tracking', name: 'Execution Tracking', teams: ['secretariat'], tasks: ['custom'], dependencies: ['action-plan'] },
      { id: 'status-reporting', name: 'Status Reporting to CEO', teams: ['secretariat'], tasks: ['documentation'], dependencies: ['execution-tracking'] },
    ],
    config: {
      maxConcurrency: 5,
      timeout: 604800000, // 7 days
      retryPolicy: { maxAttempts: 2, backoffMs: 1000, exponential: false },
      escalationPolicy: { timeoutMinutes: 120, escalateTo: ['chief-of-staff', 'coo'] },
    },
  },
  // ============================================================
  // TASK FORCE WORKFLOWS (긴급 대응 워크플로우)
  // ============================================================
  {
    id: 'emergency-bug-response',
    name: 'Emergency Bug Response',
    pattern: 'pipeline',
    stages: [
      { id: 'alert', name: 'Bug Alert Received', teams: ['task-force'], tasks: ['incident-response'], dependencies: [] },
      { id: 'triage', name: 'Bug Triage', teams: ['task-force'], tasks: ['code-analysis'], dependencies: ['alert'] },
      { id: 'assignment', name: 'Debugger Assignment', teams: ['task-force'], tasks: ['custom'], dependencies: ['triage'] },
      { id: 'reproduction', name: 'Bug Reproduction', teams: ['task-force'], tasks: ['testing'], dependencies: ['assignment'] },
      { id: 'root-cause', name: 'Root Cause Analysis', teams: ['task-force'], tasks: ['code-analysis'], dependencies: ['reproduction'] },
      { id: 'hotfix', name: 'Hotfix Development', teams: ['task-force', 'backend', 'frontend'], tasks: ['bug-fix'], dependencies: ['root-cause'] },
      { id: 'testing', name: 'Fix Testing', teams: ['task-force', 'quality-assurance'], tasks: ['testing'], dependencies: ['hotfix'] },
      { id: 'deployment', name: 'Emergency Deployment', teams: ['task-force', 'devops'], tasks: ['deployment'], dependencies: ['testing'] },
      { id: 'postmortem', name: 'Postmortem Documentation', teams: ['task-force'], tasks: ['documentation'], dependencies: ['deployment'] },
    ],
    config: {
      maxConcurrency: 8,
      timeout: 86400000, // 1 day
      retryPolicy: { maxAttempts: 3, backoffMs: 300, exponential: true },
      escalationPolicy: { timeoutMinutes: 30, escalateTo: ['task-force-lead', 'cto'] },
    },
  },
  {
    id: 'coding-blocker-resolution',
    name: 'Coding Blocker Resolution',
    pattern: 'pipeline',
    stages: [
      { id: 'request', name: 'Support Request', teams: ['task-force'], tasks: ['custom'], dependencies: [] },
      { id: 'assessment', name: 'Blocker Assessment', teams: ['task-force'], tasks: ['code-analysis'], dependencies: ['request'] },
      { id: 'assignment', name: 'Support Assignment', teams: ['task-force'], tasks: ['custom'], dependencies: ['assessment'] },
      { id: 'context', name: 'Context Gathering', teams: ['task-force'], tasks: ['custom'], dependencies: ['assignment'] },
      { id: 'pair-programming', name: 'Pair Programming Session', teams: ['task-force', 'backend', 'frontend'], tasks: ['feature-development'], dependencies: ['context'] },
      { id: 'code-review', name: 'Code Review', teams: ['task-force'], tasks: ['code-review'], dependencies: ['pair-programming'] },
      { id: 'handoff', name: 'Knowledge Handoff', teams: ['task-force'], tasks: ['documentation'], dependencies: ['code-review'] },
    ],
    config: {
      maxConcurrency: 6,
      timeout: 172800000, // 2 days
      retryPolicy: { maxAttempts: 2, backoffMs: 500, exponential: false },
      escalationPolicy: { timeoutMinutes: 60, escalateTo: ['task-force-lead', 'coding-support-senior'] },
    },
  },
  {
    id: 'data-issue-investigation',
    name: 'Data Issue Investigation',
    pattern: 'sequential',
    stages: [
      { id: 'alert', name: 'Data Issue Alert', teams: ['task-force'], tasks: ['incident-response'], dependencies: [] },
      { id: 'scope', name: 'Impact Scope Definition', teams: ['task-force'], tasks: ['code-analysis'], dependencies: ['alert'] },
      { id: 'investigation', name: 'Data Investigation', teams: ['task-force', 'data'], tasks: ['code-analysis'], dependencies: ['scope'] },
      { id: 'lineage', name: 'Data Lineage Tracking', teams: ['task-force'], tasks: ['custom'], dependencies: ['investigation'] },
      { id: 'root-cause', name: 'Root Cause Identification', teams: ['task-force'], tasks: ['custom'], dependencies: ['lineage'] },
      { id: 'fix-plan', name: 'Fix Plan Development', teams: ['task-force', 'data'], tasks: ['documentation'], dependencies: ['root-cause'] },
      { id: 'data-fix', name: 'Data Fix Implementation', teams: ['task-force', 'data'], tasks: ['bug-fix'], dependencies: ['fix-plan'] },
      { id: 'validation', name: 'Data Validation', teams: ['task-force'], tasks: ['testing'], dependencies: ['data-fix'] },
      { id: 'report', name: 'Investigation Report', teams: ['task-force'], tasks: ['documentation'], dependencies: ['validation'] },
    ],
    config: {
      maxConcurrency: 4,
      timeout: 259200000, // 3 days
      retryPolicy: { maxAttempts: 2, backoffMs: 1000, exponential: false },
      escalationPolicy: { timeoutMinutes: 90, escalateTo: ['task-force-lead', 'data-investigator-senior'] },
    },
  },
  {
    id: 'schedule-recovery',
    name: 'Development Schedule Recovery',
    pattern: 'kanban',
    stages: [
      { id: 'assessment', name: 'Schedule Assessment', teams: ['task-force', 'project-management'], tasks: ['custom'], dependencies: [] },
      { id: 'gap-analysis', name: 'Gap Analysis', teams: ['task-force'], tasks: ['code-analysis'], dependencies: ['assessment'] },
      { id: 'resource-plan', name: 'Resource Allocation', teams: ['task-force'], tasks: ['sprint-planning'], dependencies: ['gap-analysis'] },
      { id: 'task-split', name: 'Task Distribution', teams: ['task-force', 'project-management'], tasks: ['custom'], dependencies: ['resource-plan'] },
      { id: 'parallel-dev', name: 'Parallel Development', teams: ['task-force', 'backend', 'frontend'], tasks: ['feature-development'], dependencies: ['task-split'] },
      { id: 'integration', name: 'Code Integration', teams: ['task-force'], tasks: ['code-review'], dependencies: ['parallel-dev'] },
      { id: 'validation', name: 'Quality Validation', teams: ['task-force', 'quality-assurance'], tasks: ['testing'], dependencies: ['integration'] },
      { id: 'handoff', name: 'Team Handoff', teams: ['task-force'], tasks: ['documentation'], dependencies: ['validation'] },
    ],
    config: {
      maxConcurrency: 8,
      timeout: 604800000, // 7 days
      retryPolicy: { maxAttempts: 2, backoffMs: 1000, exponential: false },
      escalationPolicy: { timeoutMinutes: 120, escalateTo: ['task-force-lead', 'pm-lead', 'coo'] },
    },
  },
  {
    id: 'production-incident-support',
    name: 'Production Incident Support',
    pattern: 'pipeline',
    stages: [
      { id: 'alert', name: 'Incident Alert', teams: ['task-force', 'devops'], tasks: ['incident-response'], dependencies: [] },
      { id: 'severity', name: 'Severity Assessment', teams: ['task-force'], tasks: ['custom'], dependencies: ['alert'] },
      { id: 'team-assembly', name: 'Team Assembly', teams: ['task-force'], tasks: ['custom'], dependencies: ['severity'] },
      { id: 'diagnosis', name: 'System Diagnosis', teams: ['task-force', 'devops', 'backend'], tasks: ['code-analysis'], dependencies: ['team-assembly'] },
      { id: 'mitigation', name: 'Immediate Mitigation', teams: ['task-force', 'devops'], tasks: ['incident-response'], dependencies: ['diagnosis'] },
      { id: 'fix', name: 'Permanent Fix', teams: ['task-force', 'backend', 'frontend'], tasks: ['bug-fix'], dependencies: ['mitigation'] },
      { id: 'verification', name: 'Fix Verification', teams: ['task-force', 'quality-assurance'], tasks: ['testing'], dependencies: ['fix'] },
      { id: 'rollout', name: 'Production Rollout', teams: ['task-force', 'devops'], tasks: ['deployment'], dependencies: ['verification'] },
      { id: 'postmortem', name: 'Incident Postmortem', teams: ['task-force'], tasks: ['documentation'], dependencies: ['rollout'] },
    ],
    config: {
      maxConcurrency: 10,
      timeout: 172800000, // 2 days
      retryPolicy: { maxAttempts: 3, backoffMs: 200, exponential: true },
      escalationPolicy: { timeoutMinutes: 15, escalateTo: ['task-force-lead', 'devops-lead', 'cto'] },
    },
  },
]

// ============================================================
// COMPANY SETTINGS
// ============================================================

export const COMPANY_SETTINGS = {
  defaultProvider: 'claude' as const,
  maxConcurrentTasks: 50,
  workingHours: { start: 0, end: 24 }, // 24/7 operation
  timezone: 'UTC',
  language: ['en', 'ko'],
  escalationTimeout: 60,
  reviewRequired: true,
}

// ============================================================
// FULL COMPANY CONFIG
// ============================================================

export const COMPANY_CONFIG: CompanyConfig = {
  ...COMPANY_INFO,
  departments: DEPARTMENTS,
  teams: TEAMS,
  workflows: WORKFLOWS,
  settings: COMPANY_SETTINGS,
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getDepartmentById(id: DepartmentId): Department | undefined {
  return DEPARTMENTS.find(d => d.id === id)
}

export function getTeamById(id: TeamId): Team | undefined {
  return TEAMS.find(t => t.id === id)
}

export function getTeamsByDepartment(departmentId: DepartmentId): Team[] {
  return TEAMS.filter(t => t.department === departmentId)
}

export function getAgentsByTeam(teamId: TeamId): AgentConfig[] {
  const team = getTeamById(teamId)
  return team?.agents || []
}

export function getAgentsByDepartment(departmentId: DepartmentId): AgentConfig[] {
  return getTeamsByDepartment(departmentId).flatMap(t => t.agents)
}

export function getAllAgents(): AgentConfig[] {
  return TEAMS.flatMap(t => t.agents)
}

export function getAgentById(id: string): AgentConfig | undefined {
  return getAllAgents().find(a => a.id === id)
}

export function getAgentByRole(role: AgentRole): AgentConfig | undefined {
  return getAllAgents().find(a => a.role === role)
}

export function getWorkflowById(id: string): Workflow | undefined {
  return WORKFLOWS.find(w => w.id === id)
}

// ============================================================
// STATISTICS
// ============================================================

export const TOTAL_DEPARTMENTS = DEPARTMENTS.length
export const TOTAL_TEAMS = TEAMS.length
export const TOTAL_AGENTS = getAllAgents().length
export const TOTAL_WORKFLOWS = WORKFLOWS.length
