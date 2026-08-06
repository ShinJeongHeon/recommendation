@AGENTS.md

# Supabase 접근 규칙 (BFF)

- 모든 Supabase API 호출(DB 쿼리·Storage·RPC 등)은 Next.js BFF를 통해서만 구현한다: Route Handler(`src/app/api/**`), 서버 컴포넌트, 서버 액션에서 `src/lib/supabase/server.ts` 클라이언트를 사용.
- 클라이언트 컴포넌트에서 브라우저 Supabase 클라이언트를 만들지 않는다(현재 브라우저 클라이언트 파일 자체가 없다). 필요한 데이터는 `fetch('/api/...')`로 BFF를 경유한다.
- 인증도 BFF 경유: 소셜 로그인 시작은 `/api/auth/login?provider=...`(서버에서 `signInWithOAuth` 후 `data.url`로 303), 콜백은 `auth/callback` Route Handler, 세션 갱신은 `src/proxy.ts`(@supabase/ssr)가 담당한다.
- 새 BFF 엔드포인트는 요청 검증(인증 확인 포함) 후 Supabase를 호출하고, Supabase 에러를 그대로 노출하지 않고 적절한 HTTP 상태코드로 매핑한다.

# 디자인 SSOT

- 스토리북이 디자인 SSOT다.
- 모든 UI 작업 시 `src/foundation/`, `src/ui/`의 컴포넌트와 스토리를 재사용한다.
- 스토리에 없는 UI가 필요하면 컴포넌트+스토리부터 추가한 후 사용한다.

# 반응형

- 페이지 컨테이너는 `max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8`, 1280px 초과분은 좌우 여백.
- 카드 목록은 반응형 그리드로 확장한다: 홈 `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, 냉장고 1→md 2→lg 3열, 마이 lg 2열.
- 브레이크포인트는 md(768)/lg(1024)만 사용.
- 읽기 페이지(상세류)는 본문 `max-w-[768px]` 중앙, 인증류는 `max-w-[400px]` 중앙.
- 탭바는 전 브레이크포인트에서 하단 고정.
