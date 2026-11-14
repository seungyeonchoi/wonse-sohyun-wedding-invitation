# 원세 ♥ 소현 모바일 청첩장

Next.js 16 (App Router) + shadcn/ui + Tailwind CSS v4.
레이아웃은 moiitee "The First Track" 템플릿의 구조·치수·색상을 기준으로 재구현했습니다.

```bash
pnpm install
cp .env.example .env.local   # 선택: 카카오 키, 사이트 URL
pnpm dev
```

## 내용 바꾸기

모든 텍스트·날짜·장소·계좌·이미지 경로는 **`src/config/invitation.ts`** 한 파일에 있습니다.
아직 비어 있는 계좌(예금주/은행/계좌번호)는 템플릿 샘플 값이니 실제 정보로 바꿔주세요.

| 항목 | 위치 |
| --- | --- |
| 사진 | `public/photos/` — 웨딩 촬영본을 슬롯별 비율로 잘라 웹용(EXIF 제거)으로 넣어둠. 사진을 **같은 파일명으로 덮어쓰면** 이미지 캐시 때문에 예전 사진이 보일 수 있어요. 새 파일명을 쓰거나 `rm -rf .next/dev/cache/images .next/cache/images` 후 강력 새로고침 |
| 배경음악 | `public/audio/snowy.mp3` (스텔라장 - Snowy, 무음 제거·페이드·음량 정규화 후 128kbps). 곡을 바꾸면 config의 `bgm` 경로·제목·가수도 수정 |
| 손편지 스캔 | `handLetter.image` (투명 PNG, 347:307). 비우면 `handLetter.text`를 손글씨 폰트로 표시 |
| 하객 사진 이벤트 | `snap.uploadUrl` (구글 드라이브 업로드 폼 등) |

## 구조

- `src/components/invitation/*` — 섹션별 컴포넌트 (표지 → 초대글 → 손편지 → 폴라로이드 → 달력 → 갤러리 → 오시는 길 → 계좌 → 스냅 이벤트 → 마무리 사진 → 방명록 → 공유)
- 표지·손편지·폴라로이드는 원본처럼 **400px 아트보드** 좌표로 배치하고 `--u = 100cqw / 400`으로 화면 폭에 맞춰 스케일합니다 (`src/lib/artboard.ts`).
- `src/components/ui/*` — shadcn/ui (Accordion, Dialog, Drawer, Carousel, Sonner, Input…)

## 카카오 (지도·공유·내비)

Kakao Developers 앱 **원세 소현 청첩장 (ID 1648287)** 의 JavaScript 키를 `.env.local`의 `NEXT_PUBLIC_KAKAO_JS_KEY`에 넣어 둠.

- 카카오맵: 활성화됨 (이 앱이 계정의 일간 무료 쿼터 대상)
- 등록된 도메인: `http://localhost:3000` — **배포 도메인이 정해지면 두 곳에 추가**해야 지도와 카톡 공유가 동작합니다.
  1. 앱 → 플랫폼 키 → JavaScript 키 → JavaScript SDK 도메인
  2. 앱 → 제품 링크 관리 → 웹 도메인 (카톡 공유 메시지 링크용)
- 배포 환경 변수에도 `NEXT_PUBLIC_KAKAO_JS_KEY`, `NEXT_PUBLIC_SITE_URL`(배포 주소)을 넣어주세요.

## 방명록 저장소 ⚠️

`src/lib/guestbook-store.ts`는 **서버 메모리**에 저장합니다. 개발용으로는 충분하지만 서버 재시작 시 사라지고,
Vercel 같은 서버리스에선 인스턴스끼리 공유되지 않습니다. 배포 전 이 파일의 세 함수
(`listEntries`/`addEntry`/`deleteEntry`)를 Supabase·Postgres·Redis 등으로 교체하세요. API와 UI는 그대로 둬도 됩니다.

## 폰트

원본의 상용 폰트는 무료 폰트로 대체: Thesignature → Sacramento,
섹션 라벨 → Playfair Display, 손편지 → 나눔손글씨 펜. 본문은 원본과 같은 나눔명조, 표지는 Inter/Pretendard.
