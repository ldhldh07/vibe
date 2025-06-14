import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "📝 Todo List - 할 일 관리",
  description: "효율적인 할 일 관리를 위한 Todo 애플리케이션입니다. 우선순위 설정, 마감일 관리, 완료 상태 추적이 가능합니다.",
  keywords: ["todo", "할일", "업무관리", "생산성", "태스크", "일정관리"],
  authors: [{ name: "Todo App Developer" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "📝 Todo List - 할 일 관리",
    description: "효율적인 할 일 관리를 위한 Todo 애플리케이션",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "📝 Todo List - 할 일 관리",
    description: "효율적인 할 일 관리를 위한 Todo 애플리케이션",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* YouTube Player API 스크립트 */}
        <script 
          src="https://www.youtube.com/iframe_api" 
          async
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-16`}
      >
        {/* 상단 네비게이션 바 */}
        <Navbar />
        {children}
      </body>
    </html>
  );
}
