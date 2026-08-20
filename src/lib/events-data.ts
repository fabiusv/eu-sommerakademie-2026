// Frontend-only mock data + pure filtering/sorting logic for the Events discovery page.
// Nothing here talks to a network — `filterEvents` / `sortEvents` are the seam a real
// API/search backend can replace later without touching any presentation component.

export type EventCategory =
  | "Climate"
  | "Democracy"
  | "Civic Tech"
  | "Culture"
  | "Community"
  | "Education"
  | "Volunteering"
  | "Human Rights";

export type EventFormat =
  | "Event"
  | "Workshop"
  | "Meetup"
  | "Conference"
  | "Volunteer opportunity"
  | "Community gathering";

export type EventItem = {
  id: string;
  title: string;
  city: string;
  country: string;
  date: Date;
  category: EventCategory;
  format: EventFormat;
  language: string;
  organizer: string;
  free: boolean;
  accessible: boolean;
  online: boolean;
  europeWide?: boolean;
  interestScore: number;
  addedDaysAgo: number;
  featured?: boolean;
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Reference instant captured once at module load — every mock event date and every
// relative "When" filter reads off this same anchor, so today's/tomorrow's/this
// weekend's events always line up with whatever day the page actually loads on.
const NOW = new Date();

function daysFromNow(days: number, hour = 18, minute = 0): Date {
  const d = addDays(startOfDay(NOW), days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export const events: EventItem[] = [
  {
    id: "berlin-climate-assembly",
    title: "Berlin Climate Assembly",
    city: "Berlin",
    country: "Germany",
    date: daysFromNow(18, 10, 0),
    category: "Climate",
    format: "Conference",
    language: "English",
    organizer: "Civic Lab Berlin",
    free: true,
    accessible: true,
    online: false,
    interestScore: 980,
    addedDaysAgo: 6,
    featured: true,
  },
  {
    id: "berlin-open-data-night",
    title: "Open Data Night",
    city: "Berlin",
    country: "Germany",
    date: daysFromNow(2, 19, 0),
    category: "Civic Tech",
    format: "Meetup",
    language: "English",
    organizer: "Civic Lab Berlin",
    free: true,
    accessible: false,
    online: false,
    interestScore: 410,
    addedDaysAgo: 12,
  },
  {
    id: "berlin-neighbourhood-cleanup",
    title: "Neighbourhood Clean-Up & Repair Café",
    city: "Berlin",
    country: "Germany",
    date: daysFromNow(6, 11, 0),
    category: "Volunteering",
    format: "Volunteer opportunity",
    language: "German",
    organizer: "Civic Lab Berlin",
    free: true,
    accessible: true,
    online: false,
    interestScore: 260,
    addedDaysAgo: 3,
  },
  {
    id: "lisbon-open-cities-sprint",
    title: "Open Cities Design Sprint",
    city: "Lisbon",
    country: "Portugal",
    date: daysFromNow(9, 9, 30),
    category: "Civic Tech",
    format: "Workshop",
    language: "English",
    organizer: "Open Cities Initiative",
    free: false,
    accessible: true,
    online: false,
    interestScore: 540,
    addedDaysAgo: 9,
  },
  {
    id: "lisbon-housing-assembly",
    title: "Community Housing Assembly",
    city: "Lisbon",
    country: "Portugal",
    date: daysFromNow(24, 18, 30),
    category: "Democracy",
    format: "Community gathering",
    language: "Portuguese",
    organizer: "Open Cities Initiative",
    free: true,
    accessible: true,
    online: false,
    interestScore: 305,
    addedDaysAgo: 20,
  },
  {
    id: "lisbon-coastal-cleanup",
    title: "Coastal Clean-Up Lisbon",
    city: "Lisbon",
    country: "Portugal",
    date: daysFromNow(1, 8, 30),
    category: "Climate",
    format: "Volunteer opportunity",
    language: "Portuguese",
    organizer: "Open Cities Initiative",
    free: true,
    accessible: false,
    online: false,
    interestScore: 615,
    addedDaysAgo: 4,
  },
  {
    id: "vienna-culture-night",
    title: "Cross-Border Culture Night",
    city: "Vienna",
    country: "Austria",
    date: daysFromNow(33, 20, 0),
    category: "Culture",
    format: "Event",
    language: "German",
    organizer: "Climate Circle Vienna",
    free: false,
    accessible: true,
    online: false,
    interestScore: 720,
    addedDaysAgo: 15,
  },
  {
    id: "vienna-climate-circle",
    title: "Climate Circle Monthly Meetup",
    city: "Vienna",
    country: "Austria",
    date: daysFromNow(5, 18, 0),
    category: "Climate",
    format: "Meetup",
    language: "German",
    organizer: "Climate Circle Vienna",
    free: true,
    accessible: true,
    online: false,
    interestScore: 340,
    addedDaysAgo: 2,
  },
  {
    id: "vienna-schools-workshop",
    title: "Democracy in Schools Workshop",
    city: "Vienna",
    country: "Austria",
    date: daysFromNow(42, 14, 0),
    category: "Education",
    format: "Workshop",
    language: "German",
    organizer: "Climate Circle Vienna",
    free: true,
    accessible: true,
    online: false,
    interestScore: 190,
    addedDaysAgo: 27,
  },
  {
    id: "warsaw-youth-forum",
    title: "Youth Democracy Forum",
    city: "Warsaw",
    country: "Poland",
    date: daysFromNow(11, 10, 0),
    category: "Democracy",
    format: "Conference",
    language: "Polish",
    organizer: "Youth for Europe Network",
    free: true,
    accessible: true,
    online: false,
    interestScore: 860,
    addedDaysAgo: 18,
  },
  {
    id: "warsaw-mentor-circle",
    title: "Civic Mentor Circle",
    city: "Warsaw",
    country: "Poland",
    date: daysFromNow(3, 17, 0),
    category: "Community",
    format: "Meetup",
    language: "Polish",
    organizer: "Youth for Europe Network",
    free: true,
    accessible: false,
    online: false,
    interestScore: 175,
    addedDaysAgo: 5,
  },
  {
    id: "warsaw-election-literacy",
    title: "Election Literacy Volunteering Drive",
    city: "Warsaw",
    country: "Poland",
    date: daysFromNow(55, 9, 0),
    category: "Volunteering",
    format: "Volunteer opportunity",
    language: "Polish",
    organizer: "Youth for Europe Network",
    free: true,
    accessible: true,
    online: false,
    interestScore: 230,
    addedDaysAgo: 33,
  },
  {
    id: "barcelona-community-kitchen",
    title: "Community Kitchen Open Day",
    city: "Barcelona",
    country: "Spain",
    date: daysFromNow(0, 13, 0),
    category: "Community",
    format: "Community gathering",
    language: "Spanish",
    organizer: "Barcelona Community Kitchen Collective",
    free: true,
    accessible: true,
    online: false,
    interestScore: 480,
    addedDaysAgo: 1,
  },
  {
    id: "barcelona-civic-hack",
    title: "Civic Tech Hack Weekend",
    city: "Barcelona",
    country: "Spain",
    date: daysFromNow(6, 9, 0),
    category: "Civic Tech",
    format: "Workshop",
    language: "Spanish",
    organizer: "Barcelona Community Kitchen Collective",
    free: false,
    accessible: true,
    online: false,
    interestScore: 590,
    addedDaysAgo: 10,
  },
  {
    id: "barcelona-culture-market",
    title: "Migrant Culture Market",
    city: "Barcelona",
    country: "Spain",
    date: daysFromNow(48, 12, 0),
    category: "Culture",
    format: "Event",
    language: "Spanish",
    organizer: "Barcelona Community Kitchen Collective",
    free: true,
    accessible: true,
    online: false,
    interestScore: 410,
    addedDaysAgo: 24,
  },
  {
    id: "copenhagen-climate-lab",
    title: "Nordic Climate Policy Lab",
    city: "Copenhagen",
    country: "Denmark",
    date: daysFromNow(21, 9, 30),
    category: "Climate",
    format: "Conference",
    language: "English",
    organizer: "Copenhagen Climate Circle",
    free: false,
    accessible: true,
    online: false,
    interestScore: 505,
    addedDaysAgo: 14,
  },
  {
    id: "copenhagen-bike-education",
    title: "Cycling Democracy: Streets for People",
    city: "Copenhagen",
    country: "Denmark",
    date: daysFromNow(7, 16, 0),
    category: "Education",
    format: "Workshop",
    language: "Danish",
    organizer: "Copenhagen Climate Circle",
    free: true,
    accessible: true,
    online: false,
    interestScore: 265,
    addedDaysAgo: 8,
  },
  {
    id: "tallinn-digital-democracy",
    title: "Digital Democracy Lab",
    city: "Tallinn",
    country: "Estonia",
    date: daysFromNow(16, 10, 0),
    category: "Civic Tech",
    format: "Workshop",
    language: "Estonian",
    organizer: "Tallinn Digital Democracy Lab",
    free: true,
    accessible: false,
    online: false,
    interestScore: 350,
    addedDaysAgo: 19,
  },
  {
    id: "tallinn-youth-exchange",
    title: "Baltic Youth Exchange Kickoff",
    city: "Tallinn",
    country: "Estonia",
    date: daysFromNow(38, 11, 0),
    category: "Community",
    format: "Community gathering",
    language: "Estonian",
    organizer: "Tallinn Digital Democracy Lab",
    free: true,
    accessible: true,
    online: false,
    interestScore: 295,
    addedDaysAgo: 22,
  },
  {
    id: "athens-human-rights-clinic",
    title: "Human Rights Legal Clinic",
    city: "Athens",
    country: "Greece",
    date: daysFromNow(14, 17, 30),
    category: "Human Rights",
    format: "Workshop",
    language: "Greek",
    organizer: "Athens Human Rights Network",
    free: true,
    accessible: true,
    online: false,
    interestScore: 375,
    addedDaysAgo: 11,
  },
  {
    id: "athens-refugee-volunteering",
    title: "Refugee Welcome Volunteering Day",
    city: "Athens",
    country: "Greece",
    date: daysFromNow(4, 9, 0),
    category: "Volunteering",
    format: "Volunteer opportunity",
    language: "Greek",
    organizer: "Athens Human Rights Network",
    free: true,
    accessible: true,
    online: false,
    interestScore: 445,
    addedDaysAgo: 7,
  },
  {
    id: "online-civic-tech-demo",
    title: "Civic Tech Product Demo Night",
    city: "Online",
    country: "Europe",
    date: daysFromNow(3, 18, 0),
    category: "Civic Tech",
    format: "Meetup",
    language: "English",
    organizer: "Democratic Pulse Foundation",
    free: true,
    accessible: true,
    online: true,
    interestScore: 520,
    addedDaysAgo: 2,
  },
  {
    id: "online-human-rights-briefing",
    title: "Human Rights Policy Briefing",
    city: "Online",
    country: "Europe",
    date: daysFromNow(62, 17, 0),
    category: "Human Rights",
    format: "Conference",
    language: "English",
    organizer: "Democratic Pulse Foundation",
    free: true,
    accessible: true,
    online: true,
    interestScore: 300,
    addedDaysAgo: 30,
  },
  {
    id: "eu-youth-climate-relay",
    title: "EU Youth Climate Relay",
    city: "Multiple cities",
    country: "Europe",
    date: daysFromNow(70, 12, 0),
    category: "Climate",
    format: "Event",
    language: "Multilingual",
    organizer: "Democratic Pulse Foundation",
    free: true,
    accessible: true,
    online: false,
    europeWide: true,
    interestScore: 690,
    addedDaysAgo: 40,
  },
];

// ---------- Filter option vocab ----------

export type WhenId = "any" | "today" | "tomorrow" | "week" | "weekend" | "month" | "custom";

export const WHEN_OPTIONS: { id: WhenId; label: string; disabled?: boolean }[] = [
  { id: "any", label: "Any date" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "This week" },
  { id: "weekend", label: "This weekend" },
  { id: "month", label: "This month" },
  { id: "custom", label: "Custom date", disabled: true },
];

export type WhereId =
  | "anywhere"
  | "near-me"
  | "Berlin"
  | "Lisbon"
  | "Vienna"
  | "Warsaw"
  | "Barcelona"
  | "Copenhagen"
  | "Tallinn"
  | "Athens"
  | "europe-wide"
  | "online";

export const WHERE_OPTIONS: { id: WhereId; label: string; disabled?: boolean }[] = [
  { id: "anywhere", label: "Anywhere" },
  { id: "near-me", label: "Near me", disabled: true },
  { id: "Berlin", label: "Berlin" },
  { id: "Lisbon", label: "Lisbon" },
  { id: "Vienna", label: "Vienna" },
  { id: "Barcelona", label: "Barcelona" },
  { id: "Warsaw", label: "Warsaw" },
  { id: "Copenhagen", label: "Copenhagen" },
  { id: "Tallinn", label: "Tallinn" },
  { id: "Athens", label: "Athens" },
  { id: "europe-wide", label: "Europe-wide" },
  { id: "online", label: "Online" },
];

export type CategoryId = "all" | EventCategory;

export const CATEGORY_OPTIONS: { id: CategoryId; label: string }[] = [
  { id: "all", label: "All categories" },
  { id: "Climate", label: "Climate" },
  { id: "Democracy", label: "Democracy" },
  { id: "Civic Tech", label: "Civic Tech" },
  { id: "Culture", label: "Culture" },
  { id: "Community", label: "Community" },
  { id: "Education", label: "Education" },
  { id: "Volunteering", label: "Volunteering" },
  { id: "Human Rights", label: "Human Rights" },
];

export type FormatId = "any" | EventFormat | "Online";

export const FORMAT_OPTIONS: { id: FormatId; label: string }[] = [
  { id: "any", label: "Any format" },
  { id: "Event", label: "Event" },
  { id: "Workshop", label: "Workshop" },
  { id: "Meetup", label: "Meetup" },
  { id: "Conference", label: "Conference" },
  { id: "Volunteer opportunity", label: "Volunteer opportunity" },
  { id: "Community gathering", label: "Community gathering" },
  { id: "Online", label: "Online" },
];

export type LanguageId = "any" | string;

export const LANGUAGE_OPTIONS: { id: LanguageId; label: string }[] = [
  { id: "any", label: "Any language" },
  { id: "English", label: "English" },
  { id: "German", label: "German" },
  { id: "Portuguese", label: "Portuguese" },
  { id: "Polish", label: "Polish" },
  { id: "Spanish", label: "Spanish" },
  { id: "Danish", label: "Danish" },
  { id: "Estonian", label: "Estonian" },
  { id: "Greek", label: "Greek" },
  { id: "Multilingual", label: "Multilingual" },
];

export type SortId = "recommended" | "soonest" | "popular" | "recent";

export const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "soonest", label: "Soonest" },
  { id: "popular", label: "Most popular" },
  { id: "recent", label: "Recently added" },
];

export type EventFilters = {
  when: WhenId;
  where: WhereId;
  category: CategoryId;
  format: FormatId;
  language: LanguageId;
  free: boolean;
  accessible: boolean;
  online: boolean;
};

export const DEFAULT_FILTERS: EventFilters = {
  when: "any",
  where: "anywhere",
  category: "all",
  format: "any",
  language: "any",
  free: false,
  accessible: false,
  online: false,
};

function matchesWhen(date: Date, when: WhenId): boolean {
  if (when === "any" || when === "custom") return true;

  const today = startOfDay(NOW);
  const target = startOfDay(date);
  if (target < today) return false;

  if (when === "today") return isSameDay(target, today);
  if (when === "tomorrow") return isSameDay(target, addDays(today, 1));

  // Mon=1..Sun=7 so week/weekend math reads the same regardless of what day `today` is.
  const isoDay = today.getDay() === 0 ? 7 : today.getDay();

  if (when === "week") {
    const endOfWeek = addDays(today, 7 - isoDay);
    return target <= endOfWeek;
  }

  if (when === "weekend") {
    const saturday = addDays(today, 6 - isoDay);
    const sunday = addDays(saturday, 1);
    return isSameDay(target, saturday) || isSameDay(target, sunday);
  }

  // month
  return target.getFullYear() === today.getFullYear() && target.getMonth() === today.getMonth();
}

function matchesWhere(event: EventItem, where: WhereId): boolean {
  if (where === "anywhere" || where === "near-me") return true;
  if (where === "europe-wide") return Boolean(event.europeWide);
  if (where === "online") return event.online;
  return event.city === where;
}

function matchesFormat(event: EventItem, format: FormatId): boolean {
  if (format === "any") return true;
  if (format === "Online") return event.online;
  return event.format === format;
}

function matchesQuery(event: EventItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [event.title, event.city, event.country, event.category, event.organizer]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function filterEvents(list: EventItem[], filters: EventFilters, query: string): EventItem[] {
  return list.filter((event) => {
    if (!matchesQuery(event, query)) return false;
    if (!matchesWhen(event.date, filters.when)) return false;
    if (!matchesWhere(event, filters.where)) return false;
    if (filters.category !== "all" && event.category !== filters.category) return false;
    if (!matchesFormat(event, filters.format)) return false;
    if (filters.language !== "any" && event.language !== filters.language) return false;
    if (filters.free && !event.free) return false;
    if (filters.accessible && !event.accessible) return false;
    if (filters.online && !event.online) return false;
    return true;
  });
}

export function sortEvents(list: EventItem[], sort: SortId): EventItem[] {
  const sorted = [...list];
  if (sort === "soonest") {
    sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
  } else if (sort === "popular") {
    sorted.sort((a, b) => b.interestScore - a.interestScore);
  } else if (sort === "recent") {
    sorted.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
  }
  // "recommended" keeps curated array order as-is.
  return sorted;
}

export function formatEventDate(date: Date): string {
  const today = startOfDay(NOW);
  const target = startOfDay(date);
  if (isSameDay(target, today)) return "Today";
  if (isSameDay(target, addDays(today, 1))) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
