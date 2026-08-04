import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../../src/data/loader';
import { checkDisplay } from '../../src/domain/measurement/rules';

describe('US2 — 레시피 상세 데이터 계약 (수용 시나리오 1~3)', () => {
  const { recipes } = loadCatalog('dev');

  it('AS1: every recipe has rewritten steps and corrected 1-serving displays', () => {
    for (const r of recipes) {
      expect(r.steps.length, r.id).toBeGreaterThan(0);
      for (const ri of r.ingredients) {
        expect(checkDisplay(ri.display), `${r.id} — "${ri.display}"`).toEqual([]);
      }
    }
  });

  it('AS2: every recipe carries full source attribution (채널명·영상 제목·링크)', () => {
    for (const r of recipes) {
      expect(r.source.channel, r.id).not.toBe('');
      expect(r.source.videoTitle, r.id).not.toBe('');
      expect(r.source.url, r.id).toMatch(/^https?:\/\//);
    }
  });

  it('AS3: every recipe exposes 시간·난이도·설거지 태그·재료비·영양 태그', () => {
    for (const r of recipes) {
      expect(r.cookMinutes, r.id).toBeGreaterThan(0);
      expect(['easy', 'normal'], r.id).toContain(r.difficulty);
      expect(['minimal', 'normal'], r.id).toContain(r.dishwashTag);
      expect(r.estimatedCost, r.id).toBeGreaterThan(0);
      expect(r.nutritionTags.length, r.id).toBeGreaterThan(0);
    }
  });
});
