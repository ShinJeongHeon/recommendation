# Data Model: 프로필 이미지 업로드 및 변경

**Date**: 2026-08-06 | **Plan**: [plan.md](./plan.md)

스키마 변경 없음 — 기존 컬럼 재사용 + 스토리지 오브젝트 규약 정의만 한다.

## profiles (기존 테이블 — 변경 없음)

| 필드 | 타입 | 제약 | 본 기능에서의 의미 |
|------|------|------|--------------------|
| `user_id` | uuid | PK, FK → auth.users.id | 소유자. 스토리지 폴더명과 동일 값 |
| `image_path` | text | nullable | **버킷명 이후 경로만** 저장 — `<user_id>/<uuid v4>.<확장자>`. `NULL` = 이미지 미설정(기본 아이콘 표시) |
| `name`, `created_at`, `updated_at` | — | 기존 그대로 | 본 기능에서 다루지 않음 |

**검증 규칙** (`image_path`에 쓰는 값):

- 선행 슬래시 없음, 버킷명(`profile-image`) 미포함.
- 형식: `^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$` — 첫 세그먼트는
  소유자 `user_id`, 둘째는 UUID v4 파일명. (DB CHECK로 강제하지 않고
  애플리케이션 규약으로 유지 — 스키마 변경 없음.)
- MIME → 확장자 매핑: `image/jpeg`→`jpg`, `image/png`→`png`,
  `image/webp`→`webp`.

## 프로필 이미지 파일 (storage.objects — `profile-image` 버킷)

| 속성 | 값 |
|------|-----|
| 버킷 | `profile-image` (public, `file_size_limit` 5MB, `allowed_mime_types` = image/jpeg·image/png·image/webp) |
| 경로(`name`) | `<user_id>/<uuid v4>.<확장자>` — `image_path`와 동일 문자열 |
| 소유권 | 첫 폴더명 = `auth.uid()` 를 RLS로 강제 ([contracts/storage.md](./contracts/storage.md)) |
| 개수 불변식 | 사용자당 유효 파일 1개가 목표. 교체 성공 시 이전 파일 삭제 시도 — 삭제 실패로 남은 고아 파일은 허용(참조는 항상 `image_path` 단일 값) |

## 상태 전이 (사용자 프로필 이미지)

```text
[미설정] image_path = NULL
    │  업로드 성공 (US1)
    ▼
[설정됨] image_path = P1  ── 표시 실패 시 UI는 기본 아이콘 폴백 (FR-006, 값은 유지)
    │  변경 성공 (US2): 새 파일 P2 업로드 → image_path = P2 → P1 삭제 시도
    ▼
[설정됨] image_path = P2   (삭제 기능 없음 — [설정됨] → [미설정] 전이는 범위 밖)
```

**전이 원자성**: `image_path` 갱신이 성공한 시점부터 새 이미지가 진실이다.
업로드 성공 + 갱신 실패 → 상태 불변(기존 값 유지), 새 파일은 고아로 남을 수
있다. 갱신 성공 + 이전 파일 삭제 실패 → 상태는 새 값, 이전 파일은 고아.
