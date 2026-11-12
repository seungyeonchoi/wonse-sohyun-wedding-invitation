"use client";

import type { ReactNode } from "react";

import { KAKAO_JS_KEY, loadKakaoSdk } from "@/lib/kakao";

const NaverIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
    <rect width="16" height="16" rx="3" fill="#fff" />
    <path d="M8 2.2a4 4 0 0 0-4 4c0 3 4 6.6 4 6.6s4-3.6 4-6.6a4 4 0 0 0-4-4Z" fill="#03c75a" />
    <path d="M6.4 4.4h1.1l1.2 1.9V4.4h1v3.5H8.6L7.4 6v1.9h-1Z" fill="#fff" />
    <rect x="2" y="13.4" width="12" height="1.4" rx=".7" fill="#4e5cff" />
  </svg>
);

const KakaoNaviIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
    <rect width="16" height="16" rx="3" fill="#fee500" />
    <path d="M8 2.6 13.4 8 8 13.4 2.6 8Z" fill="#1f6cff" />
    <path d="M6.4 9.6V7.8c0-.4.3-.7.7-.7h2.1M8.4 5.9l1.3 1.2-1.3 1.2" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TmapIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
    <rect width="16" height="16" rx="3" fill="#fff" />
    <defs>
      <linearGradient id="tmap" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ff3d6e" />
        <stop offset=".5" stopColor="#7b5cff" />
        <stop offset="1" stopColor="#13c4ff" />
      </linearGradient>
    </defs>
    <path d="M3.2 3.4h9.6v2.4H9.3v7H6.7v-7H3.2Z" fill="url(#tmap)" />
  </svg>
);

function Item({ href, onClick, icon, children }: { href: string; onClick?: (e: React.MouseEvent) => void; icon: ReactNode; children: ReactNode }) {
  return (
    <a
      href={href}
      onClick={onClick}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] border-line-strong text-[14px] leading-[21px] not-last:border-r"
    >
      {icon}
      <span>{children}</span>
    </a>
  );
}

export function NavLinks({ name, lat, lng, naverMapUrl }: { name: string; lat: number; lng: number; naverMapUrl?: string }) {
  const q = encodeURIComponent(name);
  const kakaoMapUrl = `https://map.kakao.com/link/to/${q},${lat},${lng}`;

  return (
    <nav aria-label="길찾기" className="flex border-t border-line-strong bg-paper-deep px-1 py-3">
      <Item href={naverMapUrl ?? `https://map.naver.com/p/search/${q}`} icon={<NaverIcon />}>
        네이버 지도
      </Item>
      <Item
        href={kakaoMapUrl}
        icon={<KakaoNaviIcon />}
        onClick={async (e) => {
          if (!KAKAO_JS_KEY) return;
          e.preventDefault();
          const Kakao = await loadKakaoSdk().catch(() => null);
          if (Kakao?.Navi) Kakao.Navi.start({ name, x: lng, y: lat, coordType: "wgs84" });
          else window.open(kakaoMapUrl, "_blank", "noreferrer");
        }}
      >
        카카오내비
      </Item>
      <Item href={`tmap://route?goalname=${q}&goalx=${lng}&goaly=${lat}`} icon={<TmapIcon />}>
        티맵
      </Item>
    </nav>
  );
}
