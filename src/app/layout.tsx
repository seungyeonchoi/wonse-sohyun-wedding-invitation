import type { Metadata, Viewport } from "next";
import {
  Gowun_Batang,
  Inter,
  Nanum_Myeongjo,
  Nanum_Pen_Script,
  Playfair_Display,
  Sacramento,
} from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { ZoomLock } from "@/components/zoom-lock";
import { invitation } from "@/config/invitation";
import { cn } from "@/lib/utils";

import "./globals.css";

const myeongjo = Nanum_Myeongjo({ weight: ["400", "700", "800"], subsets: ["latin"], variable: "--font-myeongjo" });
const batang = Gowun_Batang({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-batang", preload: false });
const inter = Inter({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ weight: ["400"], subsets: ["latin"], variable: "--font-playfair" });
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
  // 확대 금지 (iOS Safari는 이 값을 무시하므로 ZoomLock 컴포넌트가 따로 막아요)
  maximumScale: 1,
  userScalable: false,
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
        <ZoomLock />
      </body>
    </html>
  );
}
