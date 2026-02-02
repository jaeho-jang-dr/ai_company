/**
 * AI Nexus Corporation - 회사 상태 확인 스크립트
 * 다른 프로젝트에서도 호출 가능
 */

import * as fs from 'fs';
import * as path from 'path';

const COMPANY_ROOT = 'D:/Projects/ai_company';

interface CompanyStatus {
  lastDirective: string;
  pendingReminders: string[];
  budgetSummary: string;
  employeeCount: { human: number; ai: number };
}

function getLastDirective(): string {
  const logPath = path.join(COMPANY_ROOT, 'docs/executive/CEO_지시사항_기록부.md');
  try {
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n');
    const dirLines = lines.filter(l => l.includes('DIR-2026-'));
    return dirLines[dirLines.length - 1] || '없음';
  } catch {
    return '기록부 없음';
  }
}

function getReminders(): string[] {
  const reminderPath = path.join(COMPANY_ROOT, 'docs/executive/CEO_알림_및_리마인더.md');
  try {
    const content = fs.readFileSync(reminderPath, 'utf-8');
    const reminders: string[] = [];
    if (content.includes('2026-03-04')) {
      reminders.push('3월 4일: Gemini Pro 갱신 확인');
    }
    return reminders;
  } catch {
    return [];
  }
}

function printStatus(): void {
  console.log(`
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        AI Nexus Corporation 현황                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   CEO: 장재호 (비상근)                                                              │
│   인간 직원: 26명 | AI 에이전트: 148명                                              │
│   부서: 10개 | 팀: 41개                                                             │
│                                                                                     │
│   2026년 예산: 매출 ₩12,000M / 비용 ₩13,304M / 손익 -₩1,304M                       │
│                                                                                     │
│   최근 지시: ${getLastDirective().substring(0, 60)}...
│                                                                                     │
│   예정 알림: ${getReminders().join(', ') || '없음'}
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
  `);
}

printStatus();
