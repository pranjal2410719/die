import { useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Check,
  Clock,
  Ellipsis,
  Lock,
  Music,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import type { Course, ViewMode } from "../types";
import { avatars, fmtTime } from "../data";
import { MenuItem, PopMenu, courseIcons } from "./shared";

export interface CourseActions {
  start: (id: string) => void;
  complete: (id: string) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
  togglePlay: () => void;
  locked: (id: string) => void;
}

interface Props {
  course: Course;
  view: ViewMode;
  compact: boolean;
  playing: boolean;
  bleed?: boolean;
  actions: CourseActions;
}

const cardShadow =
  "shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_34px_-20px_rgba(0,0,0,0.16)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.03),0_26px_46px_-22px_rgba(0,0,0,0.24)]";

function Pill({ children, tone }: { children: ReactNode; tone: "mint" | "grey" | "white" }) {
  const cls =
    tone === "mint"
      ? "bg-mint text-emerald-950"
      : tone === "grey"
        ? "bg-neutral-100 text-neutral-600"
        : "bg-white text-neutral-900 shadow-[0_6px_14px_-8px_rgba(0,0,0,0.3)]";
  return (
    <span
      className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[12px] font-medium ${cls}`}
    >
      {children}
    </span>
  );
}

function RoundBtn({
  children,
  onClick,
  label,
  dark,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  label: string;
  dark?: boolean;
  active?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.86 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-[30px] w-[30px] place-items-center rounded-full text-[12px] transition-colors ${
        dark
          ? "bg-ink text-white"
          : active
            ? "bg-neutral-200 text-neutral-900"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      }`}
    >
      {children}
    </motion.button>
  );
}

function CardMenu({ course, actions, tone = "light" }: { course: Course; actions: CourseActions; tone?: "light" | "glass" }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const run = (fn: () => void) => () => {
    fn();
    close();
  };
  return (
    <>
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.86 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="More options"
        aria-expanded={open}
        className={`grid h-[30px] w-[30px] place-items-center rounded-full transition-colors ${
          tone === "glass"
            ? "bg-white/55 text-neutral-800 hover:bg-white/80"
            : open
              ? "bg-neutral-200 text-neutral-900"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
        }`}
      >
        <Ellipsis size={15} />
      </motion.button>
      <PopMenu anchorRef={ref} open={open} onClose={close}>
        {course.status !== "progress" && (
          <MenuItem icon={Play} label={course.status === "completed" ? "Watch again" : "Start course"} onClick={run(() => actions.start(course.id))} />
        )}
        {course.status === "progress" && (
          <MenuItem icon={Pause} label="Pause / resume" onClick={run(actions.togglePlay)} />
        )}
        {course.status !== "completed" && (
          <MenuItem icon={Check} label="Mark as completed" onClick={run(() => actions.complete(course.id))} />
        )}
        {course.status !== "upcoming" && (
          <MenuItem icon={RotateCcw} label="Move to upcoming" onClick={run(() => actions.reset(course.id))} />
        )}
        <div className="mx-2 my-1 h-px bg-neutral-100" />
        <MenuItem icon={Trash2} label="Remove course" danger onClick={run(() => actions.remove(course.id))} />
      </PopMenu>
    </>
  );
}

function StatusBadge({ course, actions }: { course: Course; actions: CourseActions }) {
  const Icon = courseIcons[course.icon];
  const [shake, setShake] = useState(false);
  if (course.status === "completed") {
    return (
      <motion.div
        initial={{ scale: 0.6, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ rotate: 12, scale: 1.08 }}
        transition={{ type: "spring", stiffness: 400, damping: 14 }}
        className="grid h-10 w-10 place-items-center rounded-full bg-mint text-emerald-900"
      >
        <Icon size={18} strokeWidth={2.4} />
      </motion.div>
    );
  }
  return (
    <button
      onClick={() => {
        setShake(true);
        setTimeout(() => setShake(false), 420);
        actions.locked(course.id);
      }}
      aria-label="Locked — click for details"
      className={`grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200 active:scale-90 ${
        shake ? "animate-shake" : ""
      }`}
    >
      <Lock size={15} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Watching (purple) card                                              */
/* ------------------------------------------------------------------ */

function PlayRing({ course, playing, onToggle, size = 88 }: { course: Course; playing: boolean; onToggle: () => void; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, course.seconds / course.duration);
  const inner = size * 0.66;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="5" strokeDasharray="1 9" strokeLinecap="round" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.max(pct, 0.02))}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      {playing && <span className="absolute inset-[14%] animate-ring rounded-full border-2 border-white" />}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={onToggle}
        aria-label={playing ? "Pause lesson" : "Play lesson"}
        className="absolute grid place-items-center rounded-full bg-ink text-white shadow-[0_14px_24px_-8px_rgba(0,0,0,0.55)]"
        style={{ width: inner, height: inner, left: (size - inner) / 2, top: (size - inner) / 2 }}
      >
        {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
      </motion.button>
    </div>
  );
}

function Notes({ playing }: { playing: boolean }) {
  return (
    <>
      <span className={`pointer-events-none absolute right-[112px] top-5 select-none text-white/90 animate-note ${playing ? "" : "note-paused"}`}>
        <Music size={20} />
      </span>
      <span
        className={`pointer-events-none absolute bottom-14 right-6 select-none text-white/90 animate-note ${playing ? "" : "note-paused"}`}
        style={{ animationDelay: "-1.2s" }}
      >
        <Volume2 size={18} />
      </span>
    </>
  );
}

function Crowd({ ring = "ring-[#e7cdfb]" }: { ring?: string }) {
  return (
    <div className="flex -space-x-2.5" title="3 classmates are watching">
      {[avatars.a1, avatars.a2, avatars.a3].map((a, i) => (
        <motion.img
          key={i}
          src={a}
          alt=""
          whileHover={{ y: -4, scale: 1.12, zIndex: 5 }}
          className={`relative h-9 w-9 rounded-full object-cover ring-[2.5px] ${ring}`}
        />
      ))}
    </div>
  );
}

function WatchTile({ course, playing, actions, compact, bleed }: { course: Course; playing: boolean; actions: CourseActions; compact: boolean; bleed?: boolean }) {
  return (
    <motion.div
      initial={{ rotate: -6 }}
      animate={{ rotate: -3.2 }}
      whileHover={{ rotate: -1.2, y: -5, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`relative z-10 rounded-[26px] bg-[#e7cdfb] p-5 shadow-[0_36px_46px_-26px_rgba(120,60,190,0.6),0_2px_0_rgba(255,255,255,0.5)_inset] ${bleed ? "-ml-6" : ""}`}
    >
      <div className="absolute right-3.5 top-3.5 z-10">
        <CardMenu course={course} actions={actions} tone="glass" />
      </div>
      <Notes playing={playing} />
      <h3 className="max-w-[58%] text-[22px] font-medium leading-[1.1] tracking-tight">{course.title}</h3>
      {!compact && (
        <p className="mt-3 max-w-[52%] text-[12px] leading-[1.45] text-neutral-600/80">{course.desc}</p>
      )}
      <div className="absolute right-6 top-1/2 -translate-y-[44%]">
        <PlayRing course={course} playing={playing} onToggle={actions.togglePlay} />
      </div>
      <div className="mt-6 flex items-end justify-between">
        <Pill tone="white">
          <Clock size={14} />
          {playing ? "Watching" : "Paused"} {fmtTime(course.seconds)}
        </Pill>
        <div className="mr-1">
          <Crowd />
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

export function CourseCard({ course, view, compact, playing, bleed, actions }: Props) {
  const isRow = view === "list";

  /* ---------- list rows ---------- */
  if (isRow) {
    const watching = course.status === "progress";
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={`flex items-center gap-4 rounded-[22px] p-3.5 pr-4 transition-shadow ${cardShadow} ${
          watching ? "bg-[#e7cdfb]" : "bg-white"
        }`}
      >
        {watching ? (
          <PlayRing course={course} playing={playing} onToggle={actions.togglePlay} size={56} />
        ) : (
          <StatusBadge course={course} actions={actions} />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-medium leading-tight tracking-tight">{course.title}</h3>
          {!compact && <p className="mt-0.5 truncate text-[12px] text-neutral-400">{course.desc}</p>}
        </div>
        <div className="hidden sm:block">
          {course.status === "completed" && (
            <Pill tone="mint">
              <Check size={12} strokeWidth={2.5} className="mr-1 inline" /> Completed
            </Pill>
          )}
          {course.status === "upcoming" && (
            <Pill tone="grey">
              Upcoming <Clock size={12} />
            </Pill>
          )}
          {watching && (
            <Pill tone="white">
              <Clock size={14} /> {fmtTime(course.seconds)}
            </Pill>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <CardMenu course={course} actions={actions} />
          {course.status === "upcoming" && (
            <RoundBtn label="Start course" dark onClick={() => actions.start(course.id)}>
              <Play size={12} fill="currentColor" className="ml-px" />
            </RoundBtn>
          )}
          {course.status !== "upcoming" && (
            <>
              <RoundBtn label="Move to upcoming" onClick={() => actions.reset(course.id)}>
                <X size={13} />
              </RoundBtn>
              <RoundBtn label="Mark as completed" dark={course.status === "completed"} onClick={() => actions.complete(course.id)}>
                <Check size={14} />
              </RoundBtn>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  /* ---------- tilted watching tile ---------- */
  if (course.status === "progress") {
    return <WatchTile course={course} playing={playing} actions={actions} compact={compact} bleed={bleed} />;
  }

  /* ---------- white tile ---------- */
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`relative rounded-[24px] bg-white transition-shadow ${cardShadow} ${compact ? "p-4" : "p-5"}`}
    >
      <div className="absolute right-3.5 top-3.5">
        <StatusBadge course={course} actions={actions} />
      </div>
      <h3 className="max-w-[74%] text-[21px] font-medium leading-[1.12] tracking-tight">{course.title}</h3>
      {!compact && (
        <p className="mt-3 max-w-[86%] text-[12px] leading-[1.5] text-neutral-400">{course.desc}</p>
      )}
      <div className={`flex items-center justify-between gap-2 ${compact ? "mt-4" : "mt-5"}`}>
        {course.status === "completed" ? (
          <Pill tone="mint">
            <Check size={12} strokeWidth={2.5} className="mr-1 inline" /> Completed
          </Pill>
        ) : (
          <Pill tone="grey">
            Upcoming <Clock size={12} />
          </Pill>
        )}
        <div className="flex items-center gap-1.5">
          <CardMenu course={course} actions={actions} />
          {course.status === "upcoming" && (
            <RoundBtn label="Start course" dark onClick={() => actions.start(course.id)}>
              <Play size={12} fill="currentColor" className="ml-px" />
            </RoundBtn>
          )}
          {course.status === "completed" && (
            <>
              <RoundBtn label="Move back to upcoming" onClick={() => actions.reset(course.id)}>
                <X size={13} />
              </RoundBtn>
              <RoundBtn label="Completed" dark onClick={() => actions.complete(course.id)}>
                <Check size={14} />
              </RoundBtn>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
