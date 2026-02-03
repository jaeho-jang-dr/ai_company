> **주의: 이 문서의 모든 내용은 가상의 AI 회사 시뮬레이션입니다 (FICTIONAL)**

# AI Nexus Corporation 스킬 활성화 보고서

## 보고 일시
- **활성화 일시**: 2026년 2월 3일 18:30
- **보고자**: Conductor (AI 비서실장)
- **승인자**: CEO 장재호

---

## 스킬 활성화 현황

### 총괄
| 항목 | 수량 | 상태 |
|------|------|------|
| **활성화된 스킬** | 20개 | ✅ Active |
| **대기 중 스킬** | 92개 | ⏳ Pending |
| **출처** | 퀀텀점프클럽 | GitHub |

---

## 부서별 스킬 배정

### 1. 크리에이티브 부서 (Creative) - 7개 스킬

| 스킬명 | 팀 | 담당자 | 용도 |
|--------|-----|--------|------|
| card-news-generator | Design | UI Designer | 인스타그램 카드뉴스 생성 |
| card-news-generator-v2 | Design | UI Designer | 배경이미지 카드뉴스 생성 |
| midjourney-cardnews-bg | Design | Brand Designer | 미드저니 배경 프롬프트 |
| design-prompt-generator-v2 | Design | Design Lead | AI 디자인 프롬프트 생성 |
| frontend-design | Design | UI Designer | 프론트엔드 디자인 |
| landing-page-guide | Content | Content Lead | 랜딩페이지 가이드 |
| landing-page-guide-v2 | Content | Content Lead | 고급 랜딩페이지 제작 |

### 2. 엔지니어링 부서 (Engineering) - 8개 스킬

| 스킬명 | 팀 | 담당자 | 용도 |
|--------|-----|--------|------|
| flutter-init | Frontend | Mobile Developer | Flutter 프로젝트 자동 생성 |
| nextjs15-init | Frontend | Frontend Lead | Next.js 15 프로젝트 생성 |
| codex | Backend | Backend Lead | OpenAI Codex 코드 분석 |
| codex-claude-loop | Architecture | Chief Architect | 이중 AI 검증 루프 |
| codex-claude-cursor-loop | Architecture | Tech Lead | 3중 AI 엔지니어링 |
| code-changelog | DevOps | DevOps Lead | 코드 변경사항 문서화 |
| code-prompt-coach | Architecture | Solution Architect | 프롬프트 품질 분석 |
| gemini-logo-remover | Data | Data Engineer | 워터마크 제거 |

### 3. 운영 부서 (Operations) - 3개 스킬

| 스킬명 | 팀 | 담당자 | 용도 |
|--------|-----|--------|------|
| workthrough | PM | PM Lead | 개발 작업 자동 문서화 |
| workthrough-v2 | PM | Coordinator | 문서화 + 웹 서비스 |
| web-to-markdown | Support | Support Agent | 웹페이지 마크다운 변환 |

### 4. 연구개발 부서 (R&D) - 2개 스킬

| 스킬명 | 팀 | 담당자 | 용도 |
|--------|-----|--------|------|
| prompt-enhancer | AI Research | Prompt Engineer | 프롬프트 품질 향상 |
| meta-prompt-generator | AI Research | AI Scientist | 메타 프롬프트 생성 |

---

## 스킬 상세 목록 (20개)

```
┌────┬──────────────────────────────┬────────────────────────────────────────────┐
│ No │ 스킬명                        │ 설명                                        │
├────┼──────────────────────────────┼────────────────────────────────────────────┤
│  1 │ card-news-generator          │ 인스타그램 카드뉴스 자동 생성                │
│  2 │ card-news-generator-v2       │ 배경 이미지 지원 카드뉴스 생성               │
│  3 │ code-changelog               │ 코드 변경사항 자동 문서화                    │
│  4 │ code-prompt-coach            │ 프롬프트 품질 분석 및 코칭                   │
│  5 │ codex                        │ OpenAI Codex 기반 코드 분석                  │
│  6 │ codex-claude-cursor-loop     │ 3중 AI (Codex+Claude+Cursor) 검증           │
│  7 │ codex-claude-loop            │ 이중 AI (Codex+Claude) 검증 루프             │
│  8 │ design-prompt-generator-v2   │ AI 디자인 프롬프트 자동 생성                 │
│  9 │ flutter-init                 │ Flutter 프로젝트 자동 초기화                 │
│ 10 │ frontend-design              │ 프론트엔드 디자인 가이드                     │
│ 11 │ gemini-logo-remover          │ Gemini 워터마크 제거                         │
│ 12 │ landing-page-guide           │ 랜딩페이지 제작 가이드                       │
│ 13 │ landing-page-guide-v2        │ 고급 랜딩페이지 가이드                       │
│ 14 │ meta-prompt-generator        │ 메타 프롬프트 자동 생성                      │
│ 15 │ midjourney-cardnews-bg       │ 미드저니 배경 프롬프트 생성                  │
│ 16 │ nextjs15-init                │ Next.js 15 프로젝트 초기화                   │
│ 17 │ prompt-enhancer              │ 프롬프트 품질 향상 도구                      │
│ 18 │ web-to-markdown              │ 웹페이지 → 마크다운 변환                     │
│ 19 │ workthrough                  │ 개발 작업 자동 문서화                        │
│ 20 │ workthrough-v2               │ 문서화 + VitePress 웹 서비스                 │
└────┴──────────────────────────────┴────────────────────────────────────────────┘
```

---

## 스킬 사용 가이드

### 호출 방법

각 스킬은 다음과 같이 호출할 수 있습니다:

```
/[스킬명]

예시:
/card-news-generator    → 카드뉴스 생성
/flutter-init           → Flutter 프로젝트 생성
/workthrough           → 작업 문서화
```

### 한국어 호출 (자연어)

```
"카드 뉴스 만들어줘"           → card-news-generator 활성화
"플러터 프로젝트 만들어줘"      → flutter-init 활성화
"작업 내용 정리해줘"           → workthrough 활성화
"프롬프트 개선해줘"            → prompt-enhancer 활성화
```

---

## 출처 및 라이선스

| 항목 | 내용 |
|------|------|
| **컬렉션명** | 퀀텀점프 20스킬 |
| **저자** | 정상욱 (퀀텀점프클럽) |
| **Repository** | https://github.com/bear2u/my-skills |
| **라이선스** | MIT |

---

## 향후 계획

### 대기 중인 스킬 (92개)
- **출처**: 특이점빌더스 강의
- **상태**: 강의 수강 후 추가 예정
- **예상 추가 시기**: 미정

---

## 승인

| 구분 | 성명 | 일시 |
|------|------|------|
| **작성** | Conductor (AI) | 2026-02-03 18:30 |
| **보고** | 비서실 | 2026-02-03 18:30 |
| **승인** | CEO 장재호 | - |

---

*AI Nexus Corporation 비서실*
