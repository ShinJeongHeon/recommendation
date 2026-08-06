# Quickstart: 프로필 이미지 업로드 및 변경 — 검증 가이드

**Plan**: [plan.md](./plan.md) | **Contracts**: [contracts/](./contracts/)

## 사전 조건

1. 원격 마이그레이션 `profile_image_bucket` 적용 완료
   ([contracts/storage.md](./contracts/storage.md) — 버킷 + RLS 정책).
   확인: MCP `list_migrations`에 항목 존재, `get_advisors(security)` 경고 없음.
2. `food-recommend-app/.env.local`에 값 기입:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (기존)
   - `NEXT_PUBLIC_PROFILE_IMAGE_BASE_URL` (신규 — 형식은
     [contracts/storage.md](./contracts/storage.md) §3)
3. 구글 로그인 가능한 테스트 계정.

## 자동 검증 (헌법 V — 완료 판정 증거)

```bash
cd food-recommend-app
npm run typecheck   # tsc --noEmit — 에러 0
npm test            # vitest run — 노드(profile-image)·스토리북 프로젝트 전부 그린
```

## 수동 검증 시나리오

`cd food-recommend-app && npm run dev` 후 로그인 → 마이페이지.

| # | 시나리오 (스펙 매핑) | 절차 | 기대 결과 |
|---|----------------------|------|-----------|
| 1 | US1 최초 업로드 | 아바타 클릭 → 5MB 이하 JPG 선택 | 로딩 표시 후 아바타에 사진 표시(새로고침 불필요) |
| 2 | US1 저장 형태 | Supabase 대시보드에서 확인 | `profile-image/<내 user_id>/<uuid>.jpg` 오브젝트 존재, `profiles.image_path` = `<user_id>/<uuid>.jpg` |
| 3 | US2 변경 | 다른 PNG 선택 | 아바타 교체, `image_path` 갱신, 이전 오브젝트 삭제됨 |
| 4 | US3 지속 표시 | 새로고침·재로그인 | 같은 사진 유지 |
| 5 | FR-002 형식 | PDF 선택 | 업로드 미시작, "JPG·PNG·WebP…" 안내 |
| 6 | FR-002 용량 | 5MB 초과 이미지 선택 | 업로드 미시작, "5MB 이하…" 안내 |
| 7 | FR-009 실패 | 네트워크 오프라인 후 업로드 | 에러 문구, 기존 아바타 유지 |
| 8 | FR-006 폴백 | `image_path`를 존재하지 않는 경로로 수동 변경 | 기본 아이콘 표시(깨진 이미지 없음) |
| 9 | FR-010 소유권 | 다른 계정 user_id 폴더로 업로드 시도(콘솔에서 storage.upload 직접 호출) | RLS 거부 에러 |

## 성공 기준 확인

- SC-001: 시나리오 1이 아바타 클릭 → 파일 선택(→ 자동 업로드) 3회 이하
  인터랙션으로 완료되는지.
- SC-002: 시나리오 1 소요 10초 이내.
- SC-003: 시나리오 4에서 이미지 동일.
- SC-004: 시나리오 5~7에서 무반응·무한 로딩 없음.
