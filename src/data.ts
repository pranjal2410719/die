import type { Course, EventItem, EventColor, EventType } from "./types";
import avatarUser from "./assets/avatar-user.png";
import avatar1 from "./assets/avatar-1.png";
import avatar2 from "./assets/avatar-2.png";
import avatar3 from "./assets/avatar-3.png";

export const avatars = { user: avatarUser, a1: avatar1, a2: avatar2, a3: avatar3 };

export const initialCourses: Course[] = [
  {
    id: "c1",
    title: "Medical Terminology",
    desc: "Learn basic medical language for effective communication.",
    status: "completed",
    icon: "cross",
    seconds: 600,
    duration: 600,
  },
  {
    id: "c2",
    title: "Anatomy and Physiology",
    desc: "Understand the structure and function of the human body.",
    status: "completed",
    icon: "brain",
    seconds: 900,
    duration: 900,
  },
  {
    id: "c3",
    title: "Pharmacology Basics",
    desc: "Learn basic medical language for effective communication.",
    status: "progress",
    icon: "pill",
    seconds: 30,
    duration: 600,
  },
  {
    id: "c4",
    title: "Medical Ethics and Professionalism",
    desc: "Understand ethical principles and professionalism in healthcare.",
    status: "upcoming",
    icon: "shield",
    seconds: 0,
    duration: 720,
  },
  {
    id: "c5",
    title: "Disease Pathophysiology",
    desc: "Study the cellular and molecular basis of common diseases.",
    status: "upcoming",
    icon: "flask",
    seconds: 0,
    duration: 840,
  },
  {
    id: "c6",
    title: "Healthcare Delivery Systems",
    desc: "Explore how health policy shapes the way patients receive care.",
    status: "upcoming",
    icon: "book",
    seconds: 0,
    duration: 660,
  },
  {
    id: "c7",
    title: "Clinical Communication",
    desc: "Practice empathy, active listening and clear patient dialogue.",
    status: "upcoming",
    icon: "heart",
    seconds: 0,
    duration: 540,
  },
  {
    id: "c8",
    title: "Patient Safety Essentials",
    desc: "Recognise risk, prevent errors and build a culture of safety.",
    status: "upcoming",
    icon: "stethoscope",
    seconds: 0,
    duration: 780,
  },
];

export const initialEvents: EventItem[] = [
  {
    id: "e1",
    type: "webinar",
    color: "blue",
    date: "Tu, 25.03",
    text: "Understanding medical research, critical appraisal skills, and applying evidence-based guidelines in practice",
    time: "12:30",
  },
  {
    id: "e2",
    type: "lesson",
    color: "lavender",
    date: "We, 26.03",
    text: "Overview of healthcare delivery systems, health policy, and their impact on patient care.",
  },
  {
    id: "e3",
    type: "task",
    color: "yellow",
    date: "Th, 27.03",
    text: "Examination of major global health issues, including infectious diseases, non-communicable diseases, and healthcare disparities.",
  },
  {
    id: "e4",
    type: "task",
    color: "green",
    date: "Fr, 28.03",
    text: "Importance of teamwork and communication among healthcare professionals for optimal patient outcomes.",
    floating: true,
  },
];

export const eventTone: Record<
  EventColor,
  { bg: string; inner: string; dot: string; label: string }
> = {
  blue: { bg: "bg-[#d7eefa]", inner: "bg-white/45", dot: "#7cc6ea", label: "Blue" },
  lavender: { bg: "bg-[#e5cdf9]", inner: "bg-white/35", dot: "#c192ef", label: "Lilac" },
  yellow: { bg: "bg-[#fdeeb1]", inner: "bg-white/40", dot: "#f2cd54", label: "Sun" },
  green: { bg: "bg-[#c9f1cb]", inner: "bg-white/45", dot: "#7fd186", label: "Mint" },
};

export const defaultColorFor: Record<EventType, EventColor> = {
  webinar: "blue",
  lesson: "lavender",
  task: "yellow",
};

export interface NotificationItem {
  id: string;
  type: "completed" | "webinar" | "comment" | "unlock" | "badge";
  title: string;
  time: string;
}

export const notifications: NotificationItem[] = [
  { id: "n1", type: "completed", title: "Anatomy and Physiology completed", time: "2m ago" },
  { id: "n2", type: "webinar", title: "Webinar starts tomorrow at 12:30", time: "1h ago" },
  { id: "n3", type: "comment", title: "Maya commented on Pharmacology Basics", time: "3h ago" },
  { id: "n4", type: "unlock", title: "New module unlocked: Clinical Communication", time: "Yesterday" },
  { id: "n5", type: "badge", title: "You earned the 7-day streak badge", time: "Yesterday" },
];

export const teamMembers = [
  { id: "t1", name: "Maya Collins", role: "Clinical Lead", progress: 82, img: avatars.a3 },
  { id: "t2", name: "Jonas Weber", role: "Pharmacist", progress: 64, img: avatars.a1 },
  { id: "t3", name: "Priya Nair", role: "Nurse Educator", progress: 91, img: avatars.a2 },
  { id: "t4", name: "Leo Martins", role: "Resident", progress: 47, initials: "LM", hue: "from-sky-300 to-blue-400" },
  { id: "t5", name: "Amara Okafor", role: "Public Health", progress: 73, initials: "AO", hue: "from-amber-300 to-orange-400" },
  { id: "t6", name: "Sven Lindqvist", role: "Surgeon", progress: 35, initials: "SL", hue: "from-emerald-300 to-teal-400" },
] as {
  id: string;
  name: string;
  role: string;
  progress: number;
  img?: string;
  initials?: string;
  hue?: string;
}[];

export const inboxMessages = [
  {
    id: "m1",
    from: "Dr. Elena Ruiz",
    subject: "Great work on Anatomy!",
    preview: "Your final assessment score was outstanding…",
    body: "Your final assessment score was outstanding — 96%. Keep the momentum going into Pharmacology and let me know if you want extra practice cases.",
    time: "09:41",
    unread: true,
    color: "bg-[#d7eefa]",
  },
  {
    id: "m2",
    from: "Learning Team",
    subject: "Webinar reminder",
    preview: "Evidence-based guidelines live session on Tuesday…",
    body: "Don't forget the live session on evidence-based guidelines this Tuesday at 12:30. Recordings will be available afterwards in your plan.",
    time: "Yesterday",
    unread: true,
    color: "bg-[#e5cdf9]",
  },
  {
    id: "m3",
    from: "Maya Collins",
    subject: "Study group on Friday?",
    preview: "Want to go through the ethics case studies together…",
    body: "Want to go through the ethics case studies together on Friday afternoon? I'll bring snacks and my annotated notes.",
    time: "Mon",
    unread: false,
    color: "bg-[#fdeeb1]",
  },
  {
    id: "m4",
    from: "Dei Certificates",
    subject: "Your certificate is ready",
    preview: "Medical Terminology — certificate of completion…",
    body: "Your certificate of completion for Medical Terminology is ready to download from your profile page.",
    time: "Sun",
    unread: false,
    color: "bg-[#c9f1cb]",
  },
];

export function formatEventDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return "Soon";
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${days[d.getDay()]}, ${dd}.${mm}`;
}

export function fmtTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
