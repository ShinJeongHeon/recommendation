# Contract: Supabase Storage — profile-image 버킷

**Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

원격 전용 마이그레이션 1건(MCP `apply_migration`, 이름:
`profile_image_bucket`)으로 아래 전부를 적용한다. 적용 후 MCP `get_advisors`
(security)로 확인한다.

## 1. 버킷

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-image', 'profile-image', true,
  5242880,                                             -- 5MB (FR-002 서버측 강제)
  array['image/jpeg', 'image/png', 'image/webp']
);
```

- `public = true`: 공개 URL 읽기 허용(스펙 Assumption — 서명 URL 없음).
- 클라이언트 검증(FR-002)이 1차, 버킷 제약이 2차 방어선.

## 2. RLS 정책 (storage.objects)

공통 조건: `bucket_id = 'profile-image' and
(storage.foldername(name))[1] = (select auth.uid())::text`

| 정책 | 커맨드 | 절 | 목적 |
|------|--------|-----|------|
| `profile_image_insert_own` | INSERT | `to authenticated with check (공통 조건)` | 본인 폴더에만 업로드 (FR-010) |
| `profile_image_select_own` | SELECT | `to authenticated using (공통 조건)` | remove 등 본인 오브젝트 접근 |
| `profile_image_delete_own` | DELETE | `to authenticated using (공통 조건)` | 이전 파일 삭제 (FR-011) |

- UPDATE 정책 없음 — 업서트를 쓰지 않는다(교체 = 새 UUID INSERT + 이전 DELETE).
- anon 정책 없음 — 공개 버킷의 공개 URL 읽기는 RLS를 경유하지 않는다.
- `auth.uid()`는 `(select ...)` 래핑(성능·supabase 스킬 체크리스트 준수).

## 3. 경로·URL 계약

| 항목 | 값 |
|------|-----|
| 오브젝트 경로 | `<user_id>/<crypto.randomUUID()>.<jpg\|png\|webp>` |
| 공개 URL 앞부분 (환경변수) | `NEXT_PUBLIC_PROFILE_IMAGE_BASE_URL` = `https://<프로젝트 ref>.supabase.co/storage/v1/object/public/profile-image` (끝 슬래시 없음) |
| 공개 URL 뒷부분 (DB) | `profiles.image_path` = 오브젝트 경로 그대로 |
| 표시 URL | `${NEXT_PUBLIC_PROFILE_IMAGE_BASE_URL}/${image_path}` |

## 4. 환경변수 (.env.example에 추가 — FR-005)

```bash
# 프로필 이미지 공개 URL 앞부분 (…/storage/v1/object/public/profile-image, 끝 슬래시 없음)
NEXT_PUBLIC_PROFILE_IMAGE_BASE_URL=
```

실제 값은 사용자가 `.env.local`에 기입한다. 클라이언트 컴포넌트에서 읽으므로
`NEXT_PUBLIC_` 접두사가 필수다.
