import type { Metadata, Viewport } from "next";
import {
  Gowun_Batang,
  Inter,
  Nanum_Myeongjo,
  Nanum_Pen_Script,
  Playfair_Display,
  Sacramento,
} from "next/font/google";
import localFont from "next/font/local";

import { Toaster } from "@/components/ui/sonner";
import { invitation } from "@/config/invitation";
import { cn } from "@/lib/utils";

import "./globals.css";

const myeongjo = Nanum_Myeongjo({ weight: ["400", "700", "800"], subsets: ["latin"], variable: "--font-myeongjo" });
const batang = Gowun_Batang({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-batang", preload: false });
const inter = Inter({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ weight: ["400"], subsets: ["latin"], variable: "--font-playfair" });
// 칼리폰트 샤우팅체 (callifont.com 무료, 웹 임베딩 허용 / 파일 수정·재배포 금지 → 원본 TTF 그대로 사용)
const brush = localFont({
  src: "../fonts/CallifontShouting-Medium.ttf",
  weight: "400",
  variable: "--font-brush",
  // hide the cover text briefly instead of flashing a differently sized fallback
  display: "block",
  fallback: ["cursive"],
});
const signature = Sacramento({ weight: ["400"], subsets: ["latin"], variable: "--font-signature" });
const pen = Nanum_Pen_Script({ weight: ["400"], subsets: ["latin"], variable: "--font-pen", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(invitation.meta.siteUrl),
  title: invitation.meta.title,
  description: invitation.meta.description,
  openGraph: {
    type: "website",
    title: invitation.meta.title,
    description: invitation.meta.description,
    images: [{ url: invitation.meta.ogImage, width: 1200, height: 630 }],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: invitation.theme.heroBackground,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={cn(
        myeongjo.variable,
        batang.variable,
        inter.variable,
        playfair.variable,
        brush.variable,
        signature.variable,
        pen.variable,
      )}
    >
      <head>
        {/* Pretendard is not on Google Fonts; the dynamic-subset build only downloads the glyphs a page uses. */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
      </head>
      <body>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
