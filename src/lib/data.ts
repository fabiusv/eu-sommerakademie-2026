import {
  imgAvatarForBlackHatUsa,
  imgAvatarForSaoPauloClimateWeek2026,
  imgAvatarForCoinfestAsia,
  imgAvatarForTechWeekGrandRapids,
  imgAvatarForOpenClawMeetups,
  imgAvatarForReadingRhythmsGlobal,
  imgAvatarForBuildClub,
  imgAvatarForDesignBuddies,
  imgAvatarForCursorCommunity,
  imgAvatarForGoogleDeepMind,
  imgTechIconPng,
  imgFoodIconPng,
  imgAiIconPng,
  imgArtsIconPng,
  imgClimateIconPng,
  imgFitnessIconPng,
  imgWellnessIconPng,
  imgBtcIconPng,
} from "@/assets/home";
import {
  imgBackground as cityIcon0,
  imgBackground1 as cityIcon1,
  imgBackground2 as cityIcon2,
  imgBackground3 as cityIcon3,
  imgBackground4 as cityIcon4,
  imgBackground5 as cityIcon5,
  imgBackground6 as cityIcon6,
  imgBackground7 as cityIcon7,
  imgBackground8 as cityIcon8,
  imgBackground9 as cityIcon9,
  imgBackground10 as cityIcon10,
  imgBackground11 as cityIcon11,
  imgBackground12 as cityIcon12,
  imgBackground13 as cityIcon13,
  imgBackground14 as cityIcon14,
  imgBackground15 as cityIcon15,
  imgBackground16 as cityIcon16,
  imgBackground17 as cityIcon17,
  imgBackground18 as cityIcon18,
  imgBackground19 as cityIcon19,
  imgBackground20 as cityIcon20,
  imgBackground21 as cityIcon21,
  imgBackground22 as cityIcon22,
  imgBackground23 as cityIcon23,
  imgBackground24 as cityIcon24,
  imgBackground25 as cityIcon25,
} from "@/assets/discover";

export type Category = {
  slug: string;
  label: string;
  icon: string;
  color: string;
  count: string;
  href: string;
};

export const categories: Category[] = [
  { slug: "tech", label: "Tech", icon: imgTechIconPng, color: "#b68a1b", count: "4K Events", href: "/discover" },
  { slug: "food-drink", label: "Food & Drink", icon: imgFoodIconPng, color: "#c48324", count: "539 Events", href: "/discover" },
  { slug: "ai", label: "AI", icon: imgAiIconPng, color: "#e95f9f", count: "3K Events", href: "/discover" },
  { slug: "arts-culture", label: "Arts & Culture", icon: imgArtsIconPng, color: "#859a23", count: "2K Events", href: "/discover/arts-culture" },
  { slug: "climate", label: "Climate", icon: imgClimateIconPng, color: "#6e9e31", count: "651 Events", href: "/discover" },
  { slug: "fitness", label: "Fitness", icon: imgFitnessIconPng, color: "#e36f47", count: "2K Events", href: "/discover" },
  { slug: "wellness", label: "Wellness", icon: imgWellnessIconPng, color: "#00a8cc", count: "1K Events", href: "/discover" },
  { slug: "crypto", label: "Crypto", icon: imgBtcIconPng, color: "#a37de6", count: "545 Events", href: "/discover" },
];

export type UpcomingEvent = {
  avatar: string;
  title: string;
  dates: string;
  location: string;
  gradient: [string, string];
};

export const upcomingEvents: UpcomingEvent[] = [
  {
    avatar: imgAvatarForBlackHatUsa,
    title: "Black Hat USA",
    dates: "8/1 - 8/6",
    location: "Las Vegas",
    gradient: ["#00a4ea", "#00a5e6"],
  },
  {
    avatar: imgAvatarForSaoPauloClimateWeek2026,
    title: "São Paulo Climate Week 2026",
    dates: "8/3 - 8/7",
    location: "São Paulo",
    gradient: ["#b18c19", "#ac8e18"],
  },
  {
    avatar: imgAvatarForCoinfestAsia,
    title: "Coinfest Asia",
    dates: "8/19 - 8/20",
    location: "Badung Regency",
    gradient: ["#1a93fa", "#578ef8"],
  },
  {
    avatar: imgAvatarForTechWeekGrandRapids,
    title: "Tech Week Grand Rapids",
    dates: "9/14 - 9/19",
    location: "Grand Rapids",
    gradient: ["#00aab2", "#c38423"],
  },
];

export type Community = {
  avatar: string;
  title: string;
  description: string;
  background?: string;
};

export const communities: Community[] = [
  {
    avatar: imgAvatarForOpenClawMeetups,
    title: "OpenClaw Meetups",
    description: "Discover community meetups for OpenClaw around the world.",
    background: "#00a8d1",
  },
  {
    avatar: imgAvatarForReadingRhythmsGlobal,
    title: "Reading Rhythms Global",
    description: "Not a book club. A reading party. Read with friends to live music & poetry.",
    background: "#d2d4d7",
  },
  {
    avatar: imgAvatarForBuildClub,
    title: "Build Club",
    description: "The most collaborative AI community in the world (50+ chapters).",
    background: "#6e8af5",
  },
  {
    avatar: imgAvatarForDesignBuddies,
    title: "Design Buddies",
    description: "Events for all creatives across SF/LA, online, and the world!",
    background: "#ef5d8b",
  },
  {
    avatar: imgAvatarForCursorCommunity,
    title: "Cursor Community",
    description: "Cursor community meetups, hackathons, workshops taking place worldwide.",
    background: "#d2d4d7",
  },
  {
    avatar: imgAvatarForGoogleDeepMind,
    title: "Google DeepMind",
    description: "Connect with the Google DeepMind Developer Experience team.",
    background: "#3392fa",
  },
];

export type City = {
  name: string;
  color: string;
  count: string;
  icon: string;
};

const cityIcons = [
  cityIcon0, cityIcon1, cityIcon2, cityIcon3, cityIcon4, cityIcon5, cityIcon6, cityIcon7,
  cityIcon8, cityIcon9, cityIcon10, cityIcon11, cityIcon12, cityIcon13, cityIcon14, cityIcon15,
  cityIcon16, cityIcon17, cityIcon18, cityIcon19, cityIcon20, cityIcon21, cityIcon22, cityIcon23,
  cityIcon24, cityIcon25,
];

const rawCities: Omit<City, "icon">[] = [
  { name: "Amsterdam", color: "#de475e", count: "29 Events" },
  { name: "Barcelona", color: "#1e72be", count: "21 Events" },
  { name: "Berlin", color: "#47b4d6", count: "43 Events" },
  { name: "Brussels", color: "#2c7ac0", count: "6 Events" },
  { name: "Budapest", color: "#e49e57", count: "6 Events" },
  { name: "Copenhagen", color: "#d59469", count: "23 Events" },
  { name: "Dublin", color: "#f5a55d", count: "10 Events" },
  { name: "Frankfurt", color: "#c94726", count: "15 Events" },
  { name: "Geneva", color: "#147cb8", count: "6 Events" },
  { name: "Hamburg", color: "#3c78cb", count: "20 Events" },
  { name: "Helsinki", color: "#07a395", count: "13 Events" },
  { name: "Istanbul", color: "#fc6707", count: "10 Events" },
  { name: "Lausanne", color: "#8fb017", count: "1 Event" },
  { name: "Lisbon", color: "#df7440", count: "15 Events" },
  { name: "London", color: "#e89800", count: "49 Events" },
  { name: "Madrid", color: "#c2bc4f", count: "3 Events" },
  { name: "Milan", color: "#916a4a", count: "2 Events" },
  { name: "Munich", color: "#eaad3b", count: "15 Events" },
  { name: "Oslo", color: "#e6a865", count: "10 Events" },
  { name: "Paris", color: "#ce8f5c", count: "18 Events" },
  { name: "Prague", color: "#7a51f5", count: "11 Events" },
  { name: "Rome", color: "#e37a3f", count: "4 Events" },
  { name: "Stockholm", color: "#3e6bf0", count: "12 Events" },
  { name: "Vienna", color: "#a54bbd", count: "12 Events" },
  { name: "Warsaw", color: "#69a9db", count: "13 Events" },
  { name: "Zurich", color: "#40c991", count: "17 Events" },
];

export const cities: City[] = rawCities.map((city, i) => ({ ...city, icon: cityIcons[i] }));

export const regions = ["Europe", "Asia & Pacific", "Africa", "North America", "South America"];
