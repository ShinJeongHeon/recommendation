@AGENTS.md

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
