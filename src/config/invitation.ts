/**
 * 청첩장에 들어가는 모든 콘텐츠는 이 파일 하나에서 관리합니다.
 * 이미지/음원은 public/ 아래에 넣고 경로만 바꿔주세요.
 */

import { describeWeddingDate } from "@/lib/wedding-date";

/** 예식 일시 (KST). 표지 시계·달력·D-day·공유 문구가 모두 이 값에서 만들어집니다. */
const WEDDING_DATE = "2027-02-27T15:00:00+09:00";
const VENUE = "상록회관 상록아트홀";
const HALL = "5층 아트홀";
const ADDRESS = "서울 강남구 언주로 508";

export type Person = {
  /** 성 */
  lastName: string;
  /** 이름 */
  firstName: string;
  /** 폴라로이드 서명에 쓰이는 영문 이름 */
  englishName: string;
};

export type Parent = {
  name: string;
  /** 고인일 경우 true → 이름 앞에 故 표시 */
  deceased?: boolean;
};

export type Account = {
  /** 신랑 / 아버님 / 어머님 … */
  role: string;
  holder: string;
  bank: string;
  number: string;
  kakaoPayUrl?: string;
};

export type GalleryPhoto = {
  src: string;
  /** 썸네일에서 보일 위치 (CSS object-position) */
  position?: string;
};

export type TransportItem = {
  kind: "parking" | "subway" | "bus" | "car" | "etc";
  title: string;
  /** 줄바꿈(\n) 그대로 표시됩니다 */
  description: string;
};

export const invitation = {
  meta: {
    title: "원세 ♥ 소현 결혼합니다",
    description: `${describeWeddingDate(WEDDING_DATE).fullKo}, ${VENUE} ${HALL}`,
    /** 배포 도메인 (카카오 공유/OG 이미지 절대경로에 사용) */
    // 직접 지정 > Vercel 프로덕션 도메인(자동 주입) > 로컬
    siteUrl:
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
    ogImage: "/photos/og.jpg",
  },

  theme: {
    /** 히어로(잠금화면) 배경 */
    heroBackground: "#6a1518",
    /** 히어로 시간/날짜 글자색 */
    heroText: "#e1e1e0",
    /** 섹션 라벨(INVITATION 등) 타원 색상 */
    label: "#810a0e",
  },

  groom: {
    lastName: "",
    firstName: "원세",
    englishName: "Wonse",
  } satisfies Person,
  bride: {
    lastName: "",
    firstName: "소현",
    englishName: "Sohyun",
  } satisfies Person,

  parents: {
    groom: {
      father: { name: "신진호" } as Parent,
      mother: { name: "백순금" } as Parent,
      relation: "아들",
    },
    bride: {
      father: { name: "박종한" } as Parent,
      mother: { name: "김기주" } as Parent,
      relation: "딸",
    },
  },

  date: WEDDING_DATE,

  /**
   * 배경음악. 표지 플레이어의 재생/정지·탐색 버튼이 이 파일을 재생하고,
   * title/artist는 휴대폰 잠금화면의 재생 정보에 표시됩니다.
   * autoplay: 페이지가 열리면 재생 (브라우저가 막으면 화면 첫 터치 때 시작)
   * undefined 로 두면 플레이어는 정지된 장식으로만 표시됩니다.
   */
  bgm: {
    src: "/audio/snowy.mp3",
    title: "Snowy",
    artist: "스텔라장 (Stella Jang)",
    autoplay: true,
  } as { src: string; title: string; artist: string; autoplay?: boolean } | undefined,

  hero: {
    photo: "/photos/main.jpg",
    playerTitle: "Now playing, Our story!",
  },

  greeting: {
    title: "초대합니다",
    paragraphs: [
      "평생을 함께하고 싶은 사람을 만났습니다",
      "",
      "사랑으로 시작된 저희의 인연을",
      "서로에 대한 믿음으로 지켜가겠습니다",
      "처음의 설렘을 잊지 않고",
      "서로 아끼며 예쁘게 살겠습니다",
      "",
      "저희가 하나 되는 소중한 날",
      "함께하시어 따뜻한 마음으로",
      "축복해 주시기를 바랍니다",
    ],
  },

  handLetter: {
    photos: ["/photos/strip-1.jpg", "/photos/strip-2.jpg", "/photos/strip-3.jpg"],
    /**
     * 손편지 스캔 이미지(투명 PNG 권장, 347:307 비율). 지정하면 아래 text 대신 이미지를 보여줍니다.
     */
    image: undefined as string | undefined,
    /** 문단은 빈 줄로 구분 */
    text: `저희 두 사람의 새로운 시작에
따뜻한 마음을 보내주시는 모든 분께
진심으로 감사드립니다

그 소중한 마음을 오래도록 간직하며
서로에게 든든한 사람이 되어
행복하게 살아가겠습니다`,
  },

  miniAlbum: {
    groomPhoto: "/photos/polaroid-groom.jpg",
    bridePhoto: "/photos/polaroid-bride.jpg",
  },

  calendar: {
    photo: "/photos/calendar.jpg",
    weddingDayNote: "Wedding Day!",
  },

  gallery: {
    title: "웨딩 갤러리",
    /** 처음에 보여줄 사진 수 (나머지는 '더 보기') */
    initialCount: 8,
    /**
     * 순서대로 큰 칸·작은 칸·중간 칸·작은 칸이 반복됩니다. 작은 칸(2·4·6…번째)은 가로로 잘리니
     * 얼굴 위치가 다르면 position(CSS object-position)으로 보이는 부분을 조정하세요. 기본값 "50% 30%".
     */
    photos: Array.from({ length: 30 }, (_, i): GalleryPhoto => ({
      src: `/photos/gallery/${String(i + 1).padStart(2, "0")}.jpg`,
      // 06: 바닥에 엎드린 사진이라 얼굴이 화면 아래쪽에 있음
      ...(i + 1 === 6 ? { position: "50% 60%" } : {}),
    })),
  },

  location: {
    venue: VENUE,
    hall: HALL,
    address: ADDRESS,
    /** 지도 마커 좌표 (언주로 508, OpenStreetMap 지오코딩) */
    lat: 37.5040593,
    lng: 127.0428569,
    /** 같은 이름의 장소가 여러 곳이라 주소로 검색합니다 */
    naverMapUrl: `https://map.naver.com/p/search/${encodeURIComponent(ADDRESS)}` as string | undefined,
    /** 출처: 상록아트홀 오시는 길 (srwedding.co.kr/page/location) */
    transport: [
      {
        kind: "parking",
        title: "주차안내",
        description:
          "상록회관 주차장 이용 가능 (동시 950대 주차)\n\n내비게이션에 \"서울상록회관\" 또는\n\"서울시 강남구 언주로 508\"을 입력해 주세요.",
      },
      {
        kind: "subway",
        title: "지하철",
        description: "🚊 2호선·수인분당선 선릉역 5번 출구\n도보 약 5분 소요\n\n선릉역 5번 출구에서 셔틀버스가 운행됩니다.",
      },
      {
        kind: "bus",
        title: "버스",
        description:
          "🚌 KT강남지사 정류장 하차\n간선버스: 141, 242, 361\n\n🚌 한국기술센터·상록회관 정류장 하차\n간선버스: 146, 341, 360, 740",
      },
    ] satisfies TransportItem[],
  },

  accounts: {
    title: "마음 전하실 곳",
    groom: [
      { role: "신랑", holder: "신원세", bank: "카카오뱅크", number: "3333-04-0692523" },
      { role: "아버님", holder: "신진호", bank: "하나은행", number: "244-910150-53907" },
      { role: "어머님", holder: "백순금", bank: "하나은행", number: "244-910174-68807" },
    ] satisfies Account[],
    bride: [
      { role: "신부", holder: "박소현", bank: "카카오뱅크", number: "3333-08-7057564" },
      { role: "어머님", holder: "김기주", bank: "부산은행", number: "010-9700-3484" },
    ] satisfies Account[],
  },

  closing: {
    image: "/photos/closing.jpg",
    text: "Wherever you are is the place I want to be.",
  },

  guestbook: {
    enabled: true,
    title: "방명록",
    /** 메인 화면에 미리 보여줄 개수 */
    previewCount: 3,
  },

  footer: {
    copyright: "Copyright © Wonse & Sohyun. All rights reserved.",
  },
};

export type Invitation = typeof invitation;
