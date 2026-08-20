export type City = {
  rank: string;
  name: string;
  country: string;
  eventCount: number;
};

export const cities: City[] = [
  { rank: "01", name: "Berlin", country: "Germany", eventCount: 42 },
  { rank: "02", name: "Lisbon", country: "Portugal", eventCount: 28 },
  { rank: "03", name: "Warsaw", country: "Poland", eventCount: 24 },
  { rank: "04", name: "Vienna", country: "Austria", eventCount: 31 },
  { rank: "05", name: "Athens", country: "Greece", eventCount: 19 },
  { rank: "06", name: "Tallinn", country: "Estonia", eventCount: 15 },
  { rank: "07", name: "Copenhagen", country: "Denmark", eventCount: 22 },
  { rank: "08", name: "Barcelona", country: "Spain", eventCount: 27 },
];

export const stat = {
  headline: "500+ community-led events across 30 countries this year.",
  subtext:
    "Democratic Pulse connects people building a more open Europe — one event, one community, one initiative at a time.",
};

export type Event = {
  title: string;
  city: string;
  date: string;
  category: string;
};

export const events: Event[] = [
  { title: "Climate Assembly: Berlin Edition", city: "Berlin", date: "Sep 12", category: "Climate" },
  { title: "Open Cities Design Sprint", city: "Lisbon", date: "Sep 18", category: "Civic Tech" },
  { title: "Youth Democracy Forum", city: "Warsaw", date: "Sep 24", category: "Democracy" },
  { title: "Cross-Border Culture Night", city: "Vienna", date: "Oct 02", category: "Culture" },
  { title: "Civic Tech Meetup: Athens", city: "Athens", date: "Oct 09", category: "Civic Tech" },
  { title: "Baltic Youth Exchange Kickoff", city: "Tallinn", date: "Oct 15", category: "Youth" },
];

export type Community = {
  name: string;
  city: string;
  focus: string;
  members: string;
};

export const communities: Community[] = [
  { name: "Civic Lab Berlin", city: "Berlin", focus: "Civic Tech", members: "1,240 members" },
  { name: "Open Cities Initiative", city: "Lisbon", focus: "Urban Policy", members: "860 members" },
  { name: "Youth for Europe Network", city: "Warsaw", focus: "Youth Advocacy", members: "2,100 members" },
  { name: "Climate Circle Vienna", city: "Vienna", focus: "Climate Action", members: "640 members" },
];

export type Opportunity = {
  title: string;
  org: string;
  type: string;
  deadline: string;
};

export const opportunities: Opportunity[] = [
  { title: "European Civic Fellowship", org: "Democratic Pulse Foundation", type: "Fellowship", deadline: "Oct 30" },
  { title: "Local Democracy Micro-Grant", org: "Open Cities Initiative", type: "Grant", deadline: "Nov 15" },
  { title: "Youth Exchange Volunteer Program", org: "Youth for Europe Network", type: "Volunteering", deadline: "Rolling" },
  { title: "Community Organizer Residency", org: "Civic Lab Berlin", type: "Residency", deadline: "Dec 01" },
];
