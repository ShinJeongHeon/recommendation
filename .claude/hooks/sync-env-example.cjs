// Stop 훅 — 턴이 끝날 때마다 실행.
// 1) .env* 파일과 코드(process.env.X / import.meta.env.X)에서 환경변수 키를 모아
//    각 패키지의 .env.example에 없는 키를 자리표시자(KEY=)로 추가한다. 값은 절대 쓰지 않는다.
// 2) src 코드에 시크릿·엔드포인트가 하드코딩돼 있으면 systemMessage로 경고한다.
const fs = require("fs");
const path = require("path");

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", "dist", "build", "out",
  "storybook-static", "coverage", ".claude", "public", "images", "patches",
]);
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const EXAMPLE_RE = /^\.env\.(example|sample|template)$/i;
const ENVFILE_RE = /^\.env(\..+)?$/;
// 런타임이 제공하는 내장 키는 .env.example 대상에서 제외
const BUILTIN_KEYS = new Set(["NODE_ENV", "MODE", "DEV", "PROD", "SSR", "BASE_URL", "TZ", "CI"]);

const SECRET_PATTERNS = [
  [/[a-z0-9]{16,}\.supabase\.co/, "Supabase 프로젝트 URL"],
  [/sb_(?:publishable|secret)_[A-Za-z0-9_-]{10,}/, "Supabase API 키"],
  [/eyJ[A-Za-z0-9_-]{30,}\.eyJ[A-Za-z0-9_-]{10,}/, "JWT 토큰"],
  [/\bsk-[A-Za-z0-9_-]{20,}/, "시크릿 키(sk-)"],
  [/AIza[0-9A-Za-z_-]{35}/, "Google API 키"],
  [/AKIA[0-9A-Z]{16}/, "AWS Access Key"],
];

function listDir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function* walkCode(dir) {
  for (const e of listDir(dir)) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) yield* walkCode(path.join(dir, e.name));
    } else if (CODE_EXT.has(path.extname(e.name))) {
      yield path.join(dir, e.name);
    }
  }
}

function parseEnvKeys(file) {
  const keys = [];
  try {
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
      if (m) keys.push(m[1]);
    }
  } catch {}
  return keys;
}

// 패키지 루트 = 저장소 루트 + package.json이 있는 1단계 하위 디렉터리
const pkgDirs = [ROOT];
for (const e of listDir(ROOT)) {
  if (e.isDirectory() && !SKIP_DIRS.has(e.name) && fs.existsSync(path.join(ROOT, e.name, "package.json"))) {
    pkgDirs.push(path.join(ROOT, e.name));
  }
}

const addedByPkg = [];
const hardcoded = [];

for (const pkg of pkgDirs) {
  const keys = new Set();

  for (const e of listDir(pkg)) {
    if (e.isFile() && ENVFILE_RE.test(e.name) && !EXAMPLE_RE.test(e.name)) {
      parseEnvKeys(path.join(pkg, e.name)).forEach((k) => keys.add(k));
    }
  }

  const srcDir = path.join(pkg, "src");
  if (fs.existsSync(srcDir)) {
    for (const file of walkCode(srcDir)) {
      let text;
      try {
        text = fs.readFileSync(file, "utf8");
      } catch {
        continue;
      }
      const keyRe = /(?:process\.env|import\.meta\.env)\.([A-Z][A-Z0-9_]*)/g;
      let m;
      while ((m = keyRe.exec(text))) {
        if (!BUILTIN_KEYS.has(m[1])) keys.add(m[1]);
      }
      const lines = text.split(/\r?\n/);
      lines.forEach((line, i) => {
        for (const [re, label] of SECRET_PATTERNS) {
          if (re.test(line)) {
            hardcoded.push(`${path.relative(ROOT, file)}:${i + 1} — ${label}`);
            break;
          }
        }
      });
    }
  }

  if (keys.size === 0) continue;

  const exampleFile = path.join(pkg, ".env.example");
  const existing = new Set(fs.existsSync(exampleFile) ? parseEnvKeys(exampleFile) : []);
  const missing = [...keys].filter((k) => !existing.has(k)).sort();
  if (missing.length === 0) continue;

  let content = fs.existsSync(exampleFile) ? fs.readFileSync(exampleFile, "utf8") : "# 환경변수 템플릿 — 실제 값은 .env.local에 넣으세요 (이 파일에 시크릿 금지)\n";
  if (!content.endsWith("\n")) content += "\n";
  content += missing.map((k) => `${k}=`).join("\n") + "\n";
  fs.writeFileSync(exampleFile, content, "utf8");
  addedByPkg.push(`${path.relative(ROOT, exampleFile) || ".env.example"}: ${missing.join(", ")}`);
}

const messages = [];
if (addedByPkg.length) messages.push(`.env.example 키 추가 → ${addedByPkg.join(" / ")}`);
if (hardcoded.length) {
  const shown = hardcoded.slice(0, 8);
  messages.push(
    `⚠ 하드코딩된 환경설정 의심 값 ${hardcoded.length}건: ${shown.join(" · ")}${hardcoded.length > 8 ? " 외" : ""} — 환경변수로 옮기세요`,
  );
}
if (messages.length) console.log(JSON.stringify({ systemMessage: messages.join(" | ") }));
