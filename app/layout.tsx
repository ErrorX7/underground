import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Underground",
  description: "个人演出档案馆",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen overflow-hidden">
          <div className="archive-noise" />
          {children}
        </div>
      </body>
    </html>
  );
}
