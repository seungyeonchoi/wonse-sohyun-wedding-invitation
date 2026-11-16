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

| 항목 | 위치 |
| --- | --- |
| 사진 | `public/photos/` — 웨딩 촬영본을 슬롯별 비율로 잘라 웹용(EXIF 제거)으로 넣어둠. 사진을 **같은 파일명으로 덮어쓰면** 이미지 캐시 때문에 예전 사진이 보일 수 있어요. 새 파일명을 쓰거나 `rm -rf .next/dev/cache/images .next/cache/images` 후 강력 새로고침 |
| 배경음악 | `public/audio/snowy.mp3` (스텔라장 - Snowy, 무음 제거·페이드·음량 정규화 후 128kbps). 곡을 바꾸면 config의 `bgm` 경로·제목·가수도 수정 |
| 손편지 스캔 | `handLetter.image` (투명 PNG, 347:307). 비우면 `handLetter.text`를 손글씨 폰트로 표시 |

## 구조

- `src/components/invitation/*` — 섹션별 컴포넌트 (표지 → 초대글 → 손편지 → 폴라로이드 → 달력 → 갤러리 → 오시는 길 → 계좌 → 마무리 사진 → 방명록 → 공유)
- 표지·손편지·폴라로이드는 원본처럼 **400px 아트보드** 좌표로 배치하고 `--u = 100cqw / 400`으로 화면 폭에 맞춰 스케일합니다 (`src/lib/artboard.ts`).
- `src/components/ui/*` — shadcn/ui (Accordion, Dialog, Drawer, Carousel, Sonner, Input…)

## 카카오 (지도·공유·내비)

Kakao Developers 앱 **원세 소현 청첩장 (ID 1648287)** 의 JavaScript 키를 `.env.local`의 `NEXT_PUBLIC_KAKAO_JS_KEY`에 넣어 둠.

- 카카오맵: 활성화됨 (이 앱이 계정의 일간 무료 쿼터 대상). 배포 주소(`https://wonse-sohyun-wedding-invitation.vercel.app`)에서도 지도가 뜨는 것 확인.
- 도메인은 **두 곳 모두**에 배포 주소가 있어야 합니다.
  1. 앱 → 플랫폼 키 → JavaScript 키 → JavaScript SDK 도메인 (지도·공유 SDK)
  2. 앱 → 제품 링크 관리 → 웹 도메인 (카톡 공유 메시지의 링크·버튼)
- 배포 주소는 `NEXT_PUBLIC_SITE_URL`이 없으면 Vercel 프로덕션 도메인을 자동으로 씁니다. 커스텀 도메인을 붙이면 이 값과 위 두 곳을 같이 바꿔주세요.

**카카오톡 공유 카드** (`src/components/invitation/share.tsx`, 설정은 `invitation.share`)

- 위치 템플릿: 정사각 사진(`public/photos/share.jpg`, 갤러리 06번) + "청첩장 보기" 버튼 + 카카오가 붙이는 "위치 보기"(카톡 안에서 지도). 좋아요·댓글 같은 숫자는 표시하지 않음.
- 링크를 그냥 붙여넣을 때의 미리보기(OG)도 같은 사진·제목·설명을 씁니다. 버튼·지도는 공유 버튼으로 보낼 때만 붙습니다.
- 카카오는 이미지와 미리보기를 캐시합니다. 사진을 바꾸면 파일 이름을 바꾸고, [공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 배포 주소의 캐시를 지워주세요.

## 저장소 (Supabase)

방명록·갤러리 좋아요·푸터 하트·타임캡슐은 Supabase **numugas 프로젝트의 `wedding` 스키마**에 저장합니다 (다른 앱과 같은 프로젝트라 스키마로 분리).
스키마는 `supabase/migrations/20261115000000_wedding_invitation.sql` 하나에 있습니다.

- 테이블은 Data API에 노출하지 않고, 서버(`src/lib/supabase.ts`)가 `public.wedding_*` 함수만 호출합니다.
- 방명록 비밀번호와 타임캡슐 열쇠는 DB 안에서 bcrypt로 검사합니다. 같은 프로젝트의 공개 anon 키를 가진 사람도 비밀번호 해시를 읽거나 남의 글을 지우거나 타임캡슐을 열 수 없습니다.
- 환경 변수: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (서버 전용). 로컬은 `.env.local`, 배포는 Vercel 프로젝트 환경 변수.
- 무료 프로젝트는 7일간 요청이 없으면 일시정지되므로 `vercel.json`의 크론이 매일 `/api/keepalive`를 호출합니다.

타임캡슐 열쇠 정하기 (Supabase SQL Editor에서 한 번):

```sql
update wedding.capsule_settings set key_hash = extensions.crypt('두 사람만 아는 열쇠', extensions.gen_salt('bf'));
```

## 이스터에그

| 어디서 | 무엇을 하면 | 일어나는 일 |
| --- | --- | --- |
| 표지 | 페이지를 열면 | 잠금화면 알림처럼 예식 일정 → 최근 방명록 3개가 내려옴 (탭하면 해당 섹션으로 이동) |
| 표지 시계 | 탭 | 4초간 지금 시각으로 바뀜 |
| 표지 | 음악 재생 중 | 눈이 내림 (Snowy) |
| 표지 음파 막대 | 5번 연속 탭 | 페이지 전체에 눈 (다시 5번 → 그침) |
| 표지 AirPlay 아이콘 | 탭 | "식장 스피커에 연결될 예정" 토스트 |
| 휴대폰 잠금화면 | 음악 켠 채 잠금 | 곡 정보 아래 `원세 ♥ 소현 · 2027.02.27` |
| 섹션 라벨 | 스크롤 | 타원이 펜으로 그려짐 |
| 네컷 필름 | 탭 | 한 장씩 플래시 터지며 다시 찍힘 |
| 손편지 | 스크롤 | 한 줄씩 써짐 |
| 폴라로이드 | 스크롤 / 탭 | 어린 시절 사진이 먼저 보이다가 결혼사진으로 바뀜 (탭하면 다시) |
| 달력 27일 | 탭 | 하트 + "내 캘린더에 저장(.ics) / 구글 캘린더" 버튼 |
| D-day 문구 | 시간이 지나면 | 당일엔 "예식까지 N시간 M분", 예식 중엔 "진행 중", 이후엔 "부부가 된 지 N일째" (플레이어 제목도 `Track 2. Married life`) |
| 지도 | — | 두 사람 사진 마커 |
| 갤러리 뷰어 | 더블탭 / 하트 버튼 | 좋아요, 가장 많이 받은 3장에 "하객 Pick" 배지 |
| 방명록 아래 | 편지 넣기 | 1주년 타임캡슐. 여는 날짜·열쇠는 DB(`wedding.capsule_settings`)가 검사 |
| 푸터 하트 | 탭 / 10번 | 모든 하객 누적 카운트 / 숨은 메시지 |
| 개발자도구 콘솔 | 열기 | ASCII 하트와 인사말 |
| 키보드 | ↑↑↓↓←→←→BA | 하트가 쏟아짐 |
| 터미널 | `curl <사이트 주소>` | 텍스트 청첩장 (`/invitation.txt`, `?plain`이면 색 없음) |
| 응답 헤더 | 네트워크 탭 | `X-Wedding: Wonse <3 Sohyun; …` |

## 폰트

원본의 상용 폰트는 무료 폰트로 대체: Thesignature → Sacramento,
섹션 라벨 → Playfair Display, 손편지 → 나눔손글씨 펜. 본문은 원본과 같은 나눔명조, 표지는 Inter/Pretendard.
