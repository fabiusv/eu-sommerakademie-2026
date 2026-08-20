export type SiteEntry = {
  name: string;
  image: string;
  avatar: string;
  by: string;
  pro?: boolean;
};

export const nominees: SiteEntry[] = [
  {
    name: "Noho",
    image: "/images/home/nominee-noho.png",
    avatar: "/images/home/avatar-eugene-morev.png",
    by: "Eugene Morev",
    pro: true,
  },
  {
    name: "La table de Joakim",
    image: "/images/home/nominee-la-table-de-joakim.png",
    avatar: "/images/home/avatar-cete-studio.png",
    by: "Cété Studio",
    pro: true,
  },
  {
    name: "L.I.S.A.",
    image: "/images/home/nominee-lisa.png",
    avatar: "/images/home/avatar-locomotive.png",
    by: "Locomotive",
    pro: true,
  },
];

export const winners: SiteEntry[] = [
  {
    name: "PX PUSH",
    image: "/images/home/winner-px-push.png",
    avatar: "/images/home/avatar-lewis-webber.png",
    by: "Lewis Webber",
    pro: true,
  },
  {
    name: "HAOQI.DESIGN",
    image: "/images/home/winner-haoqi-design.png",
    avatar: "/images/home/avatar-curiosity-wen.png",
    by: "curiosity-wen",
  },
  {
    name: "Mosby's Files",
    image: "/images/home/winner-mosbys-files.png",
    avatar: "/images/home/avatar-tubik.png",
    by: "Tubik",
    pro: true,
  },
  {
    name: "Revelatio Studio",
    image: "/images/home/winner-revelatio-studio.png",
    avatar: "/images/home/avatar-revelatio-studio.png",
    by: "Revelatio Studio",
    pro: true,
  },
  {
    name: "Studio K95",
    image: "/images/home/winner-studio-k95.png",
    avatar: "/images/home/avatar-studio-k95.png",
    by: "Studio K95",
  },
  {
    name: "NOTHIN'",
    image: "/images/home/winner-nothin.png",
    avatar: "/images/home/avatar-thomas-carre.png",
    by: "Thomas Carré",
    pro: true,
  },
];

export type Course = {
  title: string;
  image: string;
  instructor: string;
  score: string;
  progress: number;
};

export const courses: Course[] = [
  {
    title: "Learn UI Design with Figma from Scratch",
    image: "/images/home/course-figma-scratch.png",
    instructor: "Daniele Buffa",
    score: "4.9/5",
    progress: 98,
  },
  {
    title: "Nordic Design Intensive Course: Complete Branding",
    image: "/images/home/course-nordic-branding.png",
    instructor: "Hmmm Creative Studio",
    score: "5/5",
    progress: 100,
  },
  {
    title: "Innovative Web Design in Figma: A Step-by-Step Process",
    image: "/images/home/course-innovative-web-design.png",
    instructor: "Louis Paquet",
    score: "5/5",
    progress: 100,
  },
  {
    title: "Learn Figma from 0 to 100 (10 Courses)",
    image: "/images/home/course-figma-0-100.png",
    instructor: "Mirko Santangelo",
    score: "5/5",
    progress: 100,
  },
];

export type Collection = {
  title: string;
  image: string;
  avatars: string[];
  more: string;
};

export const collections: Collection[] = [
  {
    title: "Creative Spaces",
    image: "/images/home/collection-creative-spaces.png",
    avatars: [
      "/images/home/avatar-toni-aragones.png",
      "/images/home/avatar-juanjuan-huang.png",
      "/images/home/avatar-costantino-abitante.png",
    ],
    more: "+542",
  },
  {
    title: "WebGL / HTML5 Games",
    image: "/images/home/collection-webgl-html5-games.png",
    avatars: [
      "/images/home/avatar-kewei.png",
      "/images/home/avatar-cardboard-samurai.png",
      "/images/home/avatar-kewei.png",
    ],
    more: "+74",
  },
];

export type Creator = {
  name: string;
  avatar: string;
  background?: string;
  works: string;
  awards: string;
  website?: string;
};

export const creators: Creator[] = [
  {
    name: "jordan-taylor-1",
    avatar: "/images/home/creator-jordan-taylor.png",
    works: "00",
    awards: "0 awards",
  },
  {
    name: "Plastic Design",
    avatar: "/images/home/creator-plastic-design.png",
    background: "/images/home/creator-plastic-design-bg.png",
    works: "12",
    awards: "12 awards",
    website: "plastic.design",
  },
  {
    name: "FIFTYSEVEN",
    avatar: "/images/home/creator-fiftyseven.png",
    background: "/images/home/creator-fiftyseven-bg.png",
    works: "11",
    awards: "11 awards",
    website: "fiftyseven.co",
  },
];

export type DirectoryRow = {
  name: string;
  avatar: string;
  pro?: boolean;
  intl?: boolean;
  profile: string;
  awards: string;
  categories: string;
};

export const directoryRows: DirectoryRow[] = [
  {
    name: "&why",
    avatar: "/images/home/agency-why.png",
    intl: true,
    profile: "Agency",
    awards: "4",
    categories: "Web Design , Web Development , UX/UI , Interactive , Art Direction",
  },
  {
    name: "psychas.xyz",
    avatar: "/images/home/agency-psychas.png",
    pro: true,
    profile: "Freelance",
    awards: "0",
    categories: "Web Development",
  },
  {
    name: "DT Media Group",
    avatar: "/images/home/agency-dt-media-group.png",
    pro: true,
    profile: "Agency",
    awards: "0",
    categories: "Web Design , Web Development , Graphic Design",
  },
  {
    name: "studio leokawa",
    avatar: "/images/home/agency-studio-leokawa.png",
    pro: true,
    profile: "Studio",
    awards: "0",
    categories: "Web Design",
  },
];

export type BlogPost = {
  title: string;
  excerpt: string;
  image: string;
};

export const blogPosts: BlogPost[] = [
  {
    title: "Shopify vs WooCommerce: What's the better?",
    excerpt:
      "What's the best website builder for an e-commerce? In the world of eCommerce, choosing the right platform can mean the difference between success...",
    image: "/images/home/blog-shopify-vs-woo.png",
  },
  {
    title: "100 Best Free Fonts for Designers in 2025",
    excerpt:
      "Typography is currently playing a central role in web design, with progressive improvements like Variable Fonts, CSS Shapes, FlexBox",
    image: "/images/home/blog-100-fonts.png",
  },
  {
    title: "Trendy Gradients in Web Design",
    excerpt:
      "This year we have seen many multicolored gradients with vibrant color palettes and irregular shapes with blur and distortion effects. Gradients...",
    image: "/images/home/blog-trendy-gradients.png",
  },
  {
    title: "30 Great Websites with Parallax Scrolling",
    excerpt:
      "The parallax effect has been around for years in classic video games, but it became a trend in the web design world. This cool effect is...",
    image: "/images/home/blog-parallax-scrolling.png",
  },
];

export type Product = {
  title: string;
  image: string;
  by: string;
  price?: string;
};

export const products: Product[] = [
  {
    title: "Waida Studio Figma Bundle: 40 Full Website Designs",
    image: "/images/home/market-waida-figma-bundle.png",
    by: "Waida Studio",
    price: "49",
  },
  {
    title: "Brett Parker - Framer Portfolio Template",
    image: "/images/home/market-brett-parker-framer.png",
    by: "Virtù",
    price: "49",
  },
  {
    title: "Dumont — Portfolio Framer Template",
    image: "/images/home/market-dumont-framer.png",
    by: "Satto.studio",
    price: "79",
  },
  {
    title: "Swiper — Fintech SaaS Website Template",
    image: "/images/home/market-swiper-fintech.png",
    by: "Stefan",
  },
];
