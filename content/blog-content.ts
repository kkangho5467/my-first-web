export type HomePost = {
  title: string;
  desc: string;
  meta: string;
  accent: string;
};

export type HobbyItem = {
  title: string;
  desc: string;
};

export type MockPost = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
};

export const homePosts: HomePost[] = [
  {
    title: "아직 완성되지 않은 화면을 좋아하는 이유",
    desc: "완성보다 과정에서 발견되는 감정과 디테일을 메인 페이지의 리듬으로 정리했습니다.",
    meta: "디자인 노트 · 2일 전",
    accent: "from-rose-400/30 to-red-500/20",
  },
  {
    title: "강호로그 첫 주, 하루한줄이 만든 변화",
    desc: "짧은 기록이 누적되면서 콘텐츠 기획과 실행 속도가 어떻게 바뀌었는지 돌아봅니다.",
    meta: "에세이 · 4일 전",
    accent: "from-amber-300/35 to-orange-400/20",
  },
  {
    title: "스포츠 채널 썸네일에서 배운 시선 고정법",
    desc: "강한 대비, 시선 흐름, 타이틀 배치를 블로그 카드 컴포지션에 적용한 실험 기록입니다.",
    meta: "프로젝트 · 1주 전",
    accent: "from-sky-300/35 to-cyan-500/20",
  },
];

export const dailyLines: string[] = [
  "오늘의 한 줄: 작은 기록이 결국 큰 흐름을 만든다.",
  "디자인은 보기 좋은 것보다 읽히는 리듬이 먼저다.",
  "지금의 취향은 다음 프로젝트의 콘셉트가 된다.",
];

export const hobbyItems: HobbyItem[] = [
  {
    title: "축구",
    desc: "경기 장면과 팬 문화에서 색감, 구도, 에너지의 힌트를 얻습니다.",
  },
  {
    title: "음악 감상",
    desc: "플레이리스트의 분위기에 맞춰 글의 톤과 페이지 리듬을 잡습니다.",
  },
  {
    title: "영화 시청",
    desc: "영화의 장면 전환과 타이포 연출을 블로그 콘텐츠 구성에 참고합니다.",
  },
];

export const goals: string[] = [
  "주 2회 블로그 글 발행",
  "월 1회 프로젝트 회고 정리",
  "상반기 안에 개인 브랜딩 페이지 완성",
];

export const mockPosts: MockPost[] = [
  {
    id: "post-001",
    title: "React Server Components를 이해하는 가장 쉬운 방법",
    date: "2026-03-31",
    excerpt: "RSC가 기존 CSR/SSR과 어떻게 다른지, 블로그 프로젝트 관점에서 핵심만 정리했습니다.",
  },
  {
    id: "post-002",
    title: "Tailwind로 카드 UI를 빠르게 만드는 패턴 4가지",
    date: "2026-03-29",
    excerpt: "자주 쓰는 카드 레이아웃을 재사용 가능한 클래스 조합으로 정리해 개발 속도를 높이는 방법을 다룹니다.",
  },
  {
    id: "post-003",
    title: "블로그 검색 성능 개선: 디바운스 적용기",
    date: "2026-03-27",
    excerpt: "사용자 입력마다 필터링하지 않고 디바운스를 적용해 체감 성능을 개선한 과정을 공유합니다.",
  },
  {
    id: "post-004",
    title: "페이지네이션 유틸 함수 설계 체크리스트",
    date: "2026-03-25",
    excerpt: "목록 페이지에서 자주 발생하는 경계 조건을 고려해 안전한 페이지네이션 로직을 만드는 방법입니다.",
  },
  {
    id: "post-005",
    title: "Next.js App Router 폴더 구조 실전 가이드",
    date: "2026-03-23",
    excerpt: "레이아웃, 페이지, 컴포넌트, 유틸 파일을 어떻게 나누면 유지보수가 쉬운지 실제 예시로 설명합니다.",
  },
];

export function getMockPostById(id: string): MockPost | undefined {
  return mockPosts.find((post) => post.id === id);
}
