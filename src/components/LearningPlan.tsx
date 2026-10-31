import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlignJustify,
  Award,
  Calendar,
  CheckCircle2,
  CheckCheck,
  GitBranch,
  LayoutGrid,
  MessageSquare,
  Minus,
  Plus,
  Search,
  SearchX,
  Timer,
  Unlock,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Course, StatFilter, ViewMode } from "../types";
import { notifications } from "../data";
import { CourseCard, type CourseActions } from "./CourseCard";
import BellButton from "@/components/kokonutui/bell-button";

interface Props {
  courses: Course[];
  view: ViewMode;
  setView: (v: ViewMode) => void;
  filter: StatFilter;
  setFilter: (f: StatFilter) => void;
  zoom: number;
  setZoom: (z: number) => void;
  compact: boolean;
  playing: boolean;
  actions: CourseActions;
  onAdd: () => void;
  toast: (text: string, icon?: any) => void;
}

/* ------------------------------------------------------------------ */
/* Animated counter                                                    */
/* ------------------------------------------------------------------ */

function Counter({ value }: { value: number }) {
  return (
    <span className="relative inline-flex h-[36px] overflow-hidden text-[30px] font-medium leading-[36px] tracking-tight">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -26, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Stat({
  label,
  value,
  tone,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "sky" | "mint" | "dash";
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
}) {
  const toneCls =
    tone === "sky"
      ? "bg-sky"
      : tone === "mint"
        ? "bg-mint"
        : "border-2 border-dashed border-neutral-300 bg-transparent";
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: active && tone !== "sky" ? 1.04 : 1 }}
      aria-pressed={active}
      className={`group relative flex h-[78px] flex-1 flex-col items-center justify-center rounded-[20px] transition-shadow ${toneCls} ${
        active && tone !== "sky" ? "shadow-[0_0_0_2px_#0a0a0b,0_14px_24px_-14px_rgba(0,0,0,0.4)]" : ""
      }`}
    >
      {Icon && (
        <motion.span
          className="absolute -right-1 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"
          initial={{ rotate: 12 }}
          whileHover={{ rotate: [12, -16, 16, -8, 12], scale: 1.15 }}
          animate={active ? { y: [0, -4, 0] } : {}}
        >
          <Icon size={13} />
        </motion.span>
      )}
      <Counter value={value} />
      <span className="text-[11px] text-neutral-500">{label}</span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Left rail                                                           */
/* ------------------------------------------------------------------ */

const viewOptions: { key: ViewMode; icon: typeof GitBranch; label: string }[] = [
  { key: "path", icon: GitBranch, label: "Path view" },
  { key: "list", icon: AlignJustify, label: "List view" },
  { key: "grid", icon: LayoutGrid, label: "Grid view" },
];

function getNotifIcon(type: string) {
  switch (type) {
    case "completed":
      return (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 size={17} />
        </div>
      );
    case "webinar":
      return (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700">
          <Calendar size={17} />
        </div>
      );
    case "comment":
      return (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-purple-100 text-purple-700">
          <MessageSquare size={17} />
        </div>
      );
    case "unlock":
      return (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
          <Unlock size={17} />
        </div>
      );
    case "badge":
    default:
      return (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
          <Award size={17} />
        </div>
      );
  }
}

function NotificationPopover({
  anchorRef,
  open,
  onClose,
  unread,
  read,
  readOne,
  markAll,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  unread: number;
  read: Set<string>;
  readOne: (id: string) => void;
  markAll: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const a = anchorRef.current;
    if (!a) return;
    const r = a.getBoundingClientRect();
    const width = 340;

    // On desktop, pop up to the right of the rail, bottom aligned with the zoom capsule
    // On mobile, pop up near the left edge
    const isDesktop = window.innerWidth >= 1024;
    let left = isDesktop ? r.right + 14 : Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
    left = Math.min(Math.max(12, left), window.innerWidth - width - 12);

    // Bottom aligned near the bottom of the screen / rail
    const bottom = Math.max(16, window.innerHeight - (r.bottom + 120));

    setPos({ left, bottom });
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent | PointerEvent) => {
      const a = anchorRef.current;
      const m = ref.current;
      if (m && m.contains(e.target as Node)) return;
      if (a && a.contains(e.target as Node)) return;
      onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", down);
    window.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", key);
    };
  }, [open, onClose, anchorRef]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && pos && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-label="Notifications"
          style={{
            position: "fixed",
            left: pos.left,
            bottom: pos.bottom,
            width: 340,
            maxWidth: "calc(100vw - 32px)",
          }}
          initial={{ opacity: 0, scale: 0.92, y: 12, x: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: "spring", stiffness: 450, damping: 32 }}
          className="z-[80] rounded-[26px] bg-white p-3.5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 px-2 pb-2 pt-1">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold text-neutral-900">Notifications</p>
              {unread > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="rounded-full px-2.5 py-1 text-[12px] font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-7 w-7 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="mt-2 flex max-h-[360px] flex-col gap-1 overflow-y-auto soft-scroll pr-0.5">
            {notifications.map((n) => {
              const isRead = read.has(n.id) || unread === 0;
              return (
                <button
                  key={n.id}
                  onClick={() => readOne(n.id)}
                  className="flex w-full items-start gap-3 rounded-2xl p-2.5 text-left transition hover:bg-neutral-100/80 active:scale-[0.98]"
                >
                  {getNotifIcon(n.type)}
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[13px] leading-snug ${
                        isRead ? "text-neutral-500" : "font-medium text-neutral-900"
                      }`}
                    >
                      {n.title}
                    </span>
                    <span className="text-[11px] text-neutral-400">{n.time}</span>
                  </span>
                  {!isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {unread > 0 && (
            <p className="px-2 pt-2 pb-0.5 text-center text-[11.5px] text-neutral-400">
              + {Math.max(0, unread - notifications.filter((n) => !read.has(n.id)).length)} older notifications
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Rail({
  view,
  setView,
  zoom,
  setZoom,
  toast,
}: {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  zoom: number;
  setZoom: (z: number) => void;
  toast: (text: string, icon?: any) => void;
}) {
  const bellRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(29);
  const [read, setRead] = useState<Set<string>>(new Set());
  const closeBell = useCallback(() => setOpen(false), []);

  const markAll = () => {
    setRead(new Set(notifications.map((n) => n.id)));
    setUnread(0);
    toast("All notifications marked as read", CheckCheck);
  };
  const readOne = (id: string) => {
    if (read.has(id)) return;
    setRead(new Set(read).add(id));
    setUnread((u) => Math.max(0, u - 1));
  };

  const step = (d: number) => setZoom(Math.round(Math.min(1.3, Math.max(0.8, zoom + d)) * 10) / 10);

  return (
    <aside className="flex shrink-0 items-center justify-between gap-3 lg:w-[46px] lg:flex-col lg:items-center lg:justify-between lg:pb-5">
      {/* view switcher */}
      <div className="flex gap-1 rounded-full bg-neutral-200/60 p-1 lg:flex-col" role="tablist" aria-label="Layout">
        {viewOptions.map((o) => {
          const active = o.key === view;
          return (
            <button
              key={o.key}
              role="tab"
              aria-selected={active}
              aria-label={o.label}
              title={o.label}
              onClick={() => setView(o.key)}
              className={`relative grid h-9 w-9 place-items-center rounded-full transition-colors ${
                active ? "text-white" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="view-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-ink shadow-[0_10px_18px_-8px_rgba(0,0,0,0.6)]"
                />
              )}
              <o.icon size={15} className="relative" />
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 lg:flex-col">
        {/* notifications */}
        <div className="relative" ref={bellRef}>
          <BellButton
            variant="icon"
            count={unread}
            subscribed={open}
            onClick={() => setOpen((o) => !o)}
            className="h-10 w-10 border-none bg-transparent hover:bg-neutral-200/70 text-neutral-800"
          />
          {unread > 0 && (
            <span className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-mint px-1.5 text-[10px] font-semibold leading-[15px] text-emerald-900 shadow-sm">
              {unread}
            </span>
          )}
        </div>

        <NotificationPopover
          anchorRef={bellRef}
          open={open}
          onClose={closeBell}
          unread={unread}
          read={read}
          readOne={readOne}
          markAll={markAll}
        />

        {/* zoom */}
        <div className="flex items-center gap-0.5 rounded-full bg-neutral-200/60 p-1 lg:flex-col">
          <button
            onClick={() => step(0.1)}
            disabled={zoom >= 1.3}
            aria-label="Zoom in"
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-600 transition hover:bg-white hover:text-neutral-900 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Plus size={15} />
          </button>
          <button
            onClick={() => setZoom(1.1)}
            title="Reset zoom"
            aria-label="Reset zoom"
            className="h-5 min-w-[34px] rounded-full text-[10px] font-medium text-neutral-500 tabular-nums transition hover:bg-white hover:text-neutral-900"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => step(-0.1)}
            disabled={zoom <= 0.8}
            aria-label="Zoom out"
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-600 transition hover:bg-white hover:text-neutral-900 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Minus size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

interface Geo {
  w: number;
  h: number;
  cx: number;
  pts: { id: string; x: number; y: number; done: boolean }[];
}

export function LearningPlan({
  courses,
  view,
  setView,
  filter,
  setFilter,
  zoom,
  setZoom,
  compact,
  playing,
  actions,
  onAdd,
  toast,
}: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses the search field
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const counts = useMemo(
    () => ({
      total: courses.length,
      completed: courses.filter((c) => c.status === "completed").length,
      upcoming: courses.filter((c) => c.status === "upcoming").length,
    }),
    [courses],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (filter === "completed" && c.status !== "completed") return false;
      if (filter === "upcoming" && c.status !== "upcoming") return false;
      if (q && !(c.title + " " + c.desc).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [courses, filter, query]);

  /* ---- zoom wrapper measurement ---- */
  const innerRef = useRef<HTMLDivElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const [innerH, setInnerH] = useState<number | null>(null);
  const [contW, setContW] = useState(800);

  useLayoutEffect(() => {
    const el = innerRef.current;
    const c = contRef.current;
    if (!el || !c) return;
    const ro = new ResizeObserver(() => {
      setInnerH(el.offsetHeight);
      setContW(c.offsetWidth);
    });
    ro.observe(el);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const wide = contW >= 620;
  const showPath = view === "path" && wide && list.length > 1;

  /* ---- connector geometry ---- */
  const cardEls = useRef(new Map<string, HTMLElement>());
  const setCardRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) cardEls.current.set(id, el);
    else cardEls.current.delete(id);
  };
  const [geo, setGeo] = useState<Geo | null>(null);
  const lastKey = useRef("");

  const measure = useCallback(() => {
    const c = contRef.current;
    if (!c || !showPath) {
      if (lastKey.current !== "") {
        lastKey.current = "";
        setGeo(null);
      }
      return;
    }
    const pts: Geo["pts"] = [];
    list.forEach((course, i) => {
      const el = cardEls.current.get(course.id);
      if (!el) return;
      const left = i % 2 === 0;
      pts.push({
        id: course.id,
        x: left ? el.offsetLeft + el.offsetWidth : el.offsetLeft,
        y: Math.round(el.offsetTop + el.offsetHeight / 2),
        done: course.status === "completed",
      });
    });
    const key = `${c.offsetWidth}|${c.offsetHeight}|${pts.map((p) => `${p.id}:${p.x},${p.y},${p.done}`).join(";")}`;
    if (key === lastKey.current) return;
    lastKey.current = key;
    setGeo({ w: c.offsetWidth, h: c.offsetHeight, cx: c.offsetWidth / 2, pts });
  }, [list, showPath]);

  useLayoutEffect(() => {
    measure();
    const c = contRef.current;
    if (!c) return;
    let raf = 0;
    const sched = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    const ro = new ResizeObserver(sched);
    ro.observe(c);
    cardEls.current.forEach((el) => ro.observe(el));
    const settle = setTimeout(measure, 700);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [measure, view, wide, zoom, compact]);

  /* ---- render helpers ---- */
  const bleed = view === "path" && wide;
  const renderCard = (c: Course, i: number) => (
    <motion.div
      key={c.id}
      ref={setCardRef(c.id)}
      layout="position"
      className={view === "grid" && c.status === "progress" ? "sm:col-span-2" : undefined}
      initial={{ opacity: 0, y: 26 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 240, damping: 26, delay: Math.min(i, 8) * 0.06 },
      }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
    >
      <CourseCard course={c} view={view} compact={compact} playing={playing} bleed={bleed} actions={actions} />
    </motion.div>
  );

  const stats = (
    <div className={`flex gap-3 ${view === "path" && wide ? "" : "max-w-[440px]"}`}>
      <Stat label="Total" value={counts.total} tone="sky" active={filter === "all"} onClick={() => setFilter("all")} />
      <Stat
        label="Completed"
        value={counts.completed}
        tone="mint"
        icon={Award}
        active={filter === "completed"}
        onClick={() => setFilter(filter === "completed" ? "all" : "completed")}
      />
      <Stat
        label="Upcoming"
        value={counts.upcoming}
        tone="dash"
        active={filter === "upcoming"}
        onClick={() => setFilter(filter === "upcoming" ? "all" : "upcoming")}
      />
    </div>
  );

  const empty = list.length === 0 && (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 flex flex-col items-center rounded-[28px] border-2 border-dashed border-neutral-300 px-6 py-14 text-center"
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-neutral-500">
        <SearchX size={24} />
      </span>
      <p className="mt-4 text-[20px] font-medium">Nothing here yet</p>
      <p className="mt-1 max-w-xs text-[13px] text-neutral-500">
        No courses match your search or filter. Clear them, or add a brand-new course.
      </p>
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => {
            setQuery("");
            setFilter("all");
          }}
          className="rounded-full bg-neutral-100 px-4 py-2 text-[13px] font-medium transition hover:bg-neutral-200 active:scale-95"
        >
          Clear filters
        </button>
        <button
          onClick={onAdd}
          className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white transition hover:bg-neutral-800 active:scale-95"
        >
          Add course
        </button>
      </div>
    </motion.div>
  );

  const left = list.filter((_, i) => i % 2 === 0);
  const right = list.filter((_, i) => i % 2 === 1);
  const indexOf = (c: Course) => list.indexOf(c);

  return (
    <section className="relative flex min-h-0 flex-col px-5 pt-6 sm:px-8 lg:h-full lg:pt-8">
      {/* title + search */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 pb-5 lg:pb-7">
        <h1 className="flex items-center gap-3 text-[32px] font-medium leading-none tracking-tight sm:text-[40px]">
          My Learning Plan
          <motion.button
            onClick={() => toast("Study sprint time — 25 minutes of focus!", Timer)}
            animate={{ rotate: [0, -12, 12, -8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 6 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-800 transition hover:bg-amber-200"
            aria-label="Start a focus timer"
          >
            <Timer size={17} />
          </motion.button>
        </h1>

        <label
          className={`relative flex h-12 w-full items-center gap-3 rounded-full px-5 transition-all duration-300 sm:w-[270px] ${
            focused ? "bg-white shadow-[0_0_0_2px_#0a0a0b] sm:w-[320px]" : "bg-neutral-200/60 hover:bg-neutral-200/90"
          }`}
        >
          <Search size={17} className="shrink-0 text-neutral-700" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Escape" && (setQuery(""), searchRef.current?.blur())}
            placeholder="Search"
            aria-label="Search courses"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-neutral-400"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid h-6 w-6 place-items-center rounded-full bg-neutral-200 text-neutral-600 transition hover:bg-neutral-300"
            >
              <X size={12} />
            </button>
          ) : (
            !focused && <kbd className="rounded-md bg-white/80 px-1.5 text-[11px] text-neutral-400">/</kbd>
          )}
        </label>
      </div>

      {/* rail + content */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-10">
        <Rail view={view} setView={setView} zoom={zoom} setZoom={setZoom} toast={toast} />

        <div className="soft-scroll relative min-w-0 flex-1 lg:-ml-8 lg:overflow-y-auto lg:pb-32 lg:pl-8 lg:pr-2 lg:pt-4 lg:-mt-4">
          <div style={{ height: innerH ? innerH * zoom : undefined }}>
            <div
              ref={innerRef}
              style={{
                width: `${100 / zoom}%`,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                transition: "transform .35s cubic-bezier(.22,1,.36,1), width .35s cubic-bezier(.22,1,.36,1)",
              }}
            >
              <div ref={contRef} className="relative pb-4">
                <div key={`${view}-${wide}`}>
                {view === "path" && wide ? (
                  <div className="grid grid-cols-2 items-start gap-x-10 xl:gap-x-14 max-w-[1240px]">
                    <div className="flex flex-col gap-6">
                      <AnimatePresence mode="popLayout">
                        {left.map((c) => renderCard(c, indexOf(c)))}
                      </AnimatePresence>
                    </div>
                    <div className="flex flex-col gap-6">
                      {stats}
                      <AnimatePresence mode="popLayout">
                        {right.map((c) => renderCard(c, indexOf(c)))}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : view === "grid" ? (
                  <>
                    {stats}
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 max-w-[1600px]">
                      <AnimatePresence mode="popLayout">{list.map((c, i) => renderCard(c, i))}</AnimatePresence>
                    </div>
                  </>
                ) : (
                  <>
                    {stats}
                    <div className="mt-6 flex flex-col gap-4 max-w-[1200px]">
                      <AnimatePresence mode="popLayout">{list.map((c, i) => renderCard(c, i))}</AnimatePresence>
                    </div>
                  </>
                )}

                {empty}
                </div>

                {/* dotted connectors */}
                {geo && showPath && (
                  <motion.svg
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    width={geo.w}
                    height={geo.h}
                    className="pointer-events-none absolute left-0 top-0 z-20"
                  >
                    <path
                      d={
                        `M${geo.cx},${geo.pts[0].y} V${geo.pts[geo.pts.length - 1].y} ` +
                        geo.pts.map((p) => `M${p.x},${p.y} H${geo.cx}`).join(" ")
                      }
                      fill="none"
                      stroke="#7ccb82"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      className="animate-flow"
                      style={{ strokeDasharray: "0.1 6" }}
                    />
                    {geo.pts.map((p) => (
                      <g key={p.id}>
                        <circle cx={p.x} cy={p.y} r="6.5" fill="#f7f7f7" />
                        <circle cx={p.x} cy={p.y} r="4" fill={p.done ? "#6fc676" : "#a9dcad"} />
                      </g>
                    ))}
                  </motion.svg>
                )}
              </div>
            </div>
          </div>

          {/* add-course ghost at the end */}
          {list.length > 0 && (
            <motion.button
              onClick={onAdd}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-2 flex w-full max-w-[440px] items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-neutral-300 py-4 text-[13px] font-medium text-neutral-500 transition hover:border-neutral-400 hover:bg-white hover:text-neutral-900"
            >
              <Plus size={15} /> Add a course
            </motion.button>
          )}
        </div>
      </div>

    </section>
  );
}
