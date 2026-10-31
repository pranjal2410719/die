export type CourseStatus = "completed" | "progress" | "upcoming";

export type CourseIconKey =
  | "cross"
  | "brain"
  | "pill"
  | "heart"
  | "stethoscope"
  | "shield"
  | "book"
  | "flask";

export interface Course {
  id: string;
  title: string;
  desc: string;
  status: CourseStatus;
  icon: CourseIconKey;
  /** seconds watched so far */
  seconds: number;
  /** total length in seconds (demo scale) */
  duration: number;
}

export type EventColor = "blue" | "lavender" | "yellow" | "green";
export type EventType = "webinar" | "lesson" | "task";

export interface EventItem {
  id: string;
  type: EventType;
  color: EventColor;
  date: string;
  text: string;
  time?: string;
  reminder?: boolean;
  floating?: boolean;
}

export type TabKey = "plan" | "team" | "progress" | "inbox" | "settings";
export type ViewMode = "path" | "list" | "grid";
export type StatFilter = "all" | "completed" | "upcoming";

export interface Settings {
  compact: boolean;
  confetti: boolean;
  autoplay: boolean;
  showEvents: boolean;
}

export type BoardKind = "text" | "sticky" | "emoji";

export interface BoardItem {
  id: string;
  kind: BoardKind;
  x: number; // percent of board width
  y: number; // percent of board height
  text: string;
  color: string;
  rotate: number;
}

export interface ToastMsg {
  id: number;
  text: string;
  emoji?: string;
  actionLabel?: string;
  onAction?: () => void;
}
