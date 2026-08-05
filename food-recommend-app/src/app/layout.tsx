import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘의 집밥",
  description: "묻기 전에 먼저 고르는 저녁 추천",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-background-default text-text-default">
        {children}
      </body>
    </html>
  );
}
