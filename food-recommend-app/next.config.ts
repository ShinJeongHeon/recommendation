import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 리포 루트에 레거시 Vite lockfile이 있어 워크스페이스 루트 자동 추론이 리포 루트로 어긋남 — 앱 디렉토리로 고정
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
