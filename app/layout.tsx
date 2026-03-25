import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Electron Dodge Game",
  description: "Phaser 기반 탄막 회피 게임",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-neutral-950 text-white antialiased">{children}</body>
    </html>
  );
}
