"use client";

/**
 * Lazy loaders for Kakao's browser SDKs. Both need the JavaScript app key from
 * https://developers.kakao.com (register the site domain under Web platform).
 */

export const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Kakao?: any;
    kakao?: any;
  }
}

const scripts = new Map<string, Promise<void>>();

function loadScript(src: string) {
  let p = scripts.get(src);
  if (!p) {
    p = new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () => {
        scripts.delete(src);
        reject(new Error(`Failed to load ${src}`));
      };
      document.head.appendChild(el);
    });
    scripts.set(src, p);
  }
  return p;
}

/** Kakao JavaScript SDK (share, navi). Resolves to `window.Kakao`, initialised. */
export async function loadKakaoSdk() {
  if (!KAKAO_JS_KEY) return null;
  await loadScript("https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js");
  const Kakao = window.Kakao;
  if (!Kakao) return null;
  if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);
  return Kakao;
}

/** Kakao Maps SDK. Resolves to `window.kakao.maps` once ready. */
export async function loadKakaoMaps() {
  if (!KAKAO_JS_KEY) return null;
  await loadScript(`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`);
  const kakao = window.kakao;
  if (!kakao?.maps) return null;
  await new Promise<void>((resolve) => kakao.maps.load(resolve));
  return kakao.maps;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
