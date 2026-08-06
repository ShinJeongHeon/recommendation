// PreToolUse 훅 — .env 파일 접근(읽기·수정·삭제·검색·셸 명령) 차단. .env.example/sample/template만 허용.
let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input = {};
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const ti = input.tool_input || {};

  const EXAMPLE_RE = /\.env\.(example|sample|template)$/i;

  // 경로형 필드(file_path·path·glob 등): ".env"로 시작하는 파일명이면 차단 (.env* 글롭 포함 보수적 차단)
  const pathTargets = [ti.file_path, ti.notebook_path, ti.path, ti.glob].filter(
    (v) => typeof v === "string",
  );
  const isEnvPath = (p) => {
    const t = p.trim().replace(/\\/g, "/");
    return /(^|\/)\.env($|[.*])/.test(t) && !EXAMPLE_RE.test(t);
  };

  // 명령 문자열(Bash·PowerShell): ".env" 토큰이 구분자 뒤에 올 때만 매칭 — process.env 같은 오탐 방지
  const commands = [ti.command].filter((v) => typeof v === "string");
  const isEnvCommand = (c) => {
    const re = /(^|[\s"'`=([\\/])\.env(\.[A-Za-z0-9_.*-]+|\*)?(?=$|[\s"'`;|&)>])/g;
    let m;
    while ((m = re.exec(c))) {
      const token = `.env${m[2] || ""}`;
      if (!EXAMPLE_RE.test(token)) return true;
    }
    return false;
  };

  if (pathTargets.some(isEnvPath) || commands.some(isEnvCommand)) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason:
            ".env 파일 접근은 프로젝트 훅으로 차단되어 있습니다 (.env.example/sample/template만 허용). .env 값이 필요하면 사용자에게 직접 요청하세요.",
        },
      }),
    );
  }
  process.exit(0);
});
