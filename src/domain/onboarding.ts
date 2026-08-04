import type { Storage } from '../storage/local';
import type { TasteProfile } from './types';

// 온보딩 (FR-008) — 취향 문항 최대 3개, 응답 즉시 첫 추천

export interface OnboardingQuestion {
  id: 'excluded' | 'spicy' | 'preference';
  title: string;
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  { id: 'excluded', title: '못 먹거나 피하는 재료가 있나요?' },
  { id: 'spicy', title: '매운맛은 어느 정도까지 괜찮나요?' },
  { id: 'preference', title: '평소 어떤 스타일을 즐기세요?' },
];

export interface OnboardingAnswers {
  excludedIngredients: string[];
  spicyTolerance: number; // 0~3
  basePreferences: string[];
}

export function completeOnboarding(storage: Storage, answers: OnboardingAnswers, now: Date): TasteProfile {
  const profile: TasteProfile = {
    excludedIngredients: answers.excludedIngredients,
    spicyTolerance: answers.spicyTolerance,
    basePreferences: answers.basePreferences,
    createdAt: now.toISOString(),
    learned: {},
  };
  storage.saveProfile(profile);
  return profile;
}
