import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Archive,
  Bell,
  BellRing,
  CalendarDays,
  Check,
  CheckCheck,
  Flame,
  Mail,
  MailCheck,
  MailOpen,
  Minimize2,
  PlayCircle,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Course, Settings } from "../types";
import { inboxMessages, teamMembers } from "../data";

export type InboxMsg = (typeof inboxMessages)[number];

function Shell({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="soft-scroll px-5 pb-10 pt-6 sm:px-8 lg:h-full lg:overflow-y-auto lg:pb-36 lg:pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 lg:mb-8">
        <h1 className="flex items-center gap-3 text-[32px] font-medium leading-none tracking-tight sm:text-[40px]">
          {title}
          {Icon && (
            <motion.span
              animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 5 }}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-neutral-200/70 text-neutral-800"
            >
              <Icon size={20} />
            </motion.span>
          )}
        </h1>
        {action}
      </div>
      {children}
    </section>
  );
}

const card = "rounded-[26px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_34px_-22px_rgba(0,0,0,0.18)]";

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

export function TeamView({ toast }: { toast: (t: string, icon?: any) => void }) {
  const [following, setFollowing] = useState<Set<string>>(new Set(["t1"]));
  const [nudged, setNudged] = useState<Set<string>>(new Set());
  const tones = ["bg-sky", "bg-lilac", "bg-sun", "bg-mint", "bg-blush/60", "bg-neutral-200"];

  const toggle = (id: string, name: string) => {
    setFollowing((s) => {
      const n = new Set(s);
      if (n.has(id)) {
        n.delete(id);
        toast(`Unfollowed ${name}`, UserMinus);
      } else {
        n.add(id);
        toast(`Following ${name}`, UserPlus);
      }
      return n;
    });
  };

  const avg = Math.round(teamMembers.reduce((a, m) => a + m.progress, 0) / teamMembers.length);

  return (
    <Shell
      title="My Team"
      icon={Users}
      action={
        <span className="rounded-full bg-white px-4 py-2 text-[13px] text-neutral-600 shadow-sm">
          {teamMembers.length} members · avg <b className="text-ink">{avg}%</b>
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {teamMembers.map((m, i) => {
          const f = following.has(m.id);
          const n = nudged.has(m.id);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24, delay: i * 0.06 }}
              whileHover={{ y: -5 }}
              className={`${card} p-5`}
            >
              <div className="flex items-center gap-3.5">
                {m.img ? (
                  <img src={m.img} alt={m.name} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <span className={`grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br text-[17px] font-semibold text-white ${m.hue}`}>
                    {m.initials}
                  </span>
                )}
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[17px] font-medium">{m.name}</p>
                  <p className="text-[12px] text-neutral-400">{m.role}</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-[11.5px] text-neutral-500">
                  <span>Course progress</span>
                  <span className="font-medium text-ink">{m.progress}%</span>
                </div>
                <div className={`h-2.5 overflow-hidden rounded-full ${tones[i % tones.length]}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.progress}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-ink"
                  />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => toggle(m.id, m.name)}
                  className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-full text-[12.5px] font-medium transition-colors ${
                    f ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200" : "bg-ink text-white hover:bg-neutral-800"
                  }`}
                >
                  {f ? <UserCheck size={14} /> : <UserPlus size={14} />}
                  {f ? "Following" : "Follow"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85, rotate: -15 }}
                  onClick={() => {
                    setNudged((s) => new Set(s).add(m.id));
                    toast(`Nudged ${m.name.split(" ")[0]} to keep going`, Bell);
                  }}
                  disabled={n}
                  aria-label={`Nudge ${m.name}`}
                  className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
                    n ? "bg-mint text-emerald-800" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {n ? <Check size={15} /> : <Bell size={15} />}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ProgressView({ courses }: { courses: Course[] }) {
  const [mounted, setMounted] = useState(false);
  const [mins, setMins] = useState([35, 50, 20, 65, 45, 80, 30]);
  const [goal, setGoal] = useState(45);
  const [sel, setSel] = useState(6);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const total = courses.length || 1;
  const done = courses.filter((c) => c.status === "completed").length;
  const prog = courses.filter((c) => c.status === "progress").length;
  const up = courses.filter((c) => c.status === "upcoming").length;
  const pct = Math.round((done / total) * 100);

  const R = 74;
  const C = 2 * Math.PI * R;
  const segs = [
    { n: done, color: "#7fd186", label: "Completed" },
    { n: prog, color: "#c58ff3", label: "Watching" },
    { n: up, color: "#e2e2e2", label: "Upcoming" },
  ];
  let acc = 0;

  const hit = mins.filter((m) => m >= goal).length;
  const totalMin = mins.reduce((a, b) => a + b, 0);
  const MAX = 120;

  return (
    <Shell title="My Progress" icon={TrendingUp}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_1fr]">
        {/* ring */}
        <div className={`${card} flex flex-col items-center p-6`}>
          <div className="relative h-[190px] w-[190px]">
            <svg viewBox="0 0 190 190" className="-rotate-90">
              <circle cx="95" cy="95" r={R} fill="none" stroke="#f1f1f1" strokeWidth="18" />
              {segs.map((s) => {
                const len = (s.n / total) * C;
                const off = acc;
                acc += len;
                return (
                  <circle
                    key={s.label}
                    cx="95"
                    cy="95"
                    r={R}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="18"
                    strokeDasharray={`${mounted ? Math.max(0, len - 3) : 0} ${C}`}
                    strokeDashoffset={-off}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 1s cubic-bezier(.22,1,.36,1), stroke-dashoffset 1s" }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-[44px] font-medium leading-none tracking-tight">{pct}%</p>
                <p className="mt-1 text-[12px] text-neutral-400">of plan completed</p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
            {segs.map((s) => (
              <div key={s.label} className="rounded-2xl bg-neutral-50 py-2.5">
                <p className="text-[18px] font-medium leading-none">{s.n}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[10.5px] text-neutral-500">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* streak + goal */}
        <div className="flex flex-col gap-5">
          <div className={`${card} flex items-center justify-between gap-4 bg-gradient-to-br from-[#fdeeb1] to-[#fbd9a6] p-6`}>
            <div>
              <p className="flex items-center gap-2 text-[13px] text-amber-900/70">
                <Flame size={16} className="text-orange-500" /> Learning streak
              </p>
              <p className="mt-1 text-[40px] font-medium leading-none tracking-tight">7 days</p>
              <p className="mt-2 text-[12px] text-amber-900/70">
                {totalMin} min this week · goal hit {hit}/7 days
              </p>
            </div>
            <div className="flex flex-col items-end gap-2.5">
              <div className="flex gap-1.5">
                {days.map((d, i) => (
                  <motion.span
                    key={d}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 400, damping: 16 }}
                    title={`${d}: ${mins[i]} min`}
                    className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold ${
                      mins[i] >= goal ? "bg-ink text-white" : "bg-white/70 text-amber-900/60"
                    }`}
                  >
                    {d[0]}
                  </motion.span>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setMins((m) => m.map((v, i) => (i === 6 ? Math.min(MAX, v + 10) : v)));
                  setSel(6);
                }}
                className="flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-medium text-white transition hover:bg-neutral-800"
              >
                <Plus size={14} /> Log 10 min today
              </motion.button>
            </div>
          </div>

          <div className={`${card} p-6`}>
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-medium">Daily goal</p>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-[12px] font-medium tabular-nums">{goal} min</span>
            </div>
            <input
              type="range"
              min={15}
              max={110}
              step={5}
              value={goal}
              onChange={(e) => setGoal(+e.target.value)}
              aria-label="Daily goal in minutes"
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-black"
            />
          </div>
        </div>
      </div>

      {/* weekly bars */}
      <div className={`${card} mt-5 p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[15px] font-medium">This week</p>
          <p className="text-[12px] text-neutral-400">
            {days[sel]} · <b className="text-ink">{mins[sel]} min</b>
          </p>
        </div>
        <div className="relative h-[190px]">
          <div
            className="absolute inset-x-0 z-10 border-t-2 border-dashed border-emerald-400/70 transition-all duration-500"
            style={{ bottom: `calc(${(goal / MAX) * 100}% + 24px)` }}
          >
            <span className="absolute -top-2.5 right-0 rounded-full bg-emerald-100 px-2 text-[10px] font-medium text-emerald-800">goal</span>
          </div>
          <div className="absolute inset-0 flex items-end gap-3">
            {mins.map((m, i) => (
              <button
                key={i}
                onClick={() => setSel(i)}
                aria-label={`${days[i]}: ${m} minutes`}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="relative flex w-full flex-1 items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(m / MAX) * 100}%` }}
                    transition={{ type: "spring", stiffness: 140, damping: 18, delay: i * 0.05 }}
                    className={`relative w-full rounded-t-2xl rounded-b-lg transition-colors ${
                      sel === i ? "bg-ink" : m >= goal ? "bg-[#9be0a1] group-hover:bg-[#7fd186]" : "bg-[#e3d3f7] group-hover:bg-[#d3b9f3]"
                    }`}
                  >
                    {sel === i && (
                      <motion.span
                        layoutId="bar-tip"
                        className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-medium text-white"
                      >
                        {m}m
                      </motion.span>
                    )}
                  </motion.div>
                </div>
                <span className={`text-[11px] ${sel === i ? "font-semibold text-ink" : "text-neutral-400"}`}>{days[i]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Inbox                                                               */
/* ------------------------------------------------------------------ */

export function InboxView({
  messages,
  setMessages,
  toast,
}: {
  messages: InboxMsg[];
  setMessages: (fn: (m: InboxMsg[]) => InboxMsg[]) => void;
  toast: (t: string, icon?: any) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unread = messages.filter((m) => m.unread).length;
  const shown = useMemo(() => (tab === "unread" ? messages.filter((m) => m.unread) : messages), [messages, tab]);

  const patch = (id: string, p: Partial<InboxMsg>) =>
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...p } : m)));

  return (
    <Shell
      title="Inbox"
      icon={Mail}
      action={
        <button
          onClick={() => {
            setMessages((ms) => ms.map((m) => ({ ...m, unread: false })));
            toast("Everything marked as read", CheckCheck);
          }}
          disabled={unread === 0}
          className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium shadow-sm transition hover:bg-neutral-50 active:scale-95 disabled:opacity-40"
        >
          <CheckCheck size={15} /> Mark all read
        </button>
      }
    >
      <div className="mb-5 inline-flex rounded-full bg-neutral-200/60 p-1">
        {(["all", "unread"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative rounded-full px-5 py-2 text-[13px] font-medium capitalize transition-colors ${tab === t ? "text-white" : "text-neutral-600"}`}
          >
            {tab === t && (
              <motion.span layoutId="inbox-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
            )}
            <span className="relative">
              {t}
              {t === "unread" && unread > 0 ? ` (${unread})` : ""}
            </span>
          </button>
        ))}
      </div>

      <div className="flex max-w-3xl flex-col gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((m) => {
            const isOpen = open === m.id;
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className={`${card} overflow-hidden`}
              >
                <button
                  onClick={() => {
                    setOpen(isOpen ? null : m.id);
                    if (m.unread) patch(m.id, { unread: false });
                  }}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-[16px] font-semibold ${m.color}`}>
                    {m.from[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={`truncate text-[15px] ${m.unread ? "font-semibold" : "font-medium text-neutral-700"}`}>{m.subject}</span>
                      {m.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-ink" />}
                    </span>
                    <span className="block truncate text-[12.5px] text-neutral-400">
                      {m.from} — {m.preview}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11.5px] text-neutral-400">{m.time}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pl-[84px]">
                        <p className="text-[13.5px] leading-relaxed text-neutral-600">{m.body}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              patch(m.id, { unread: true });
                              setOpen(null);
                            }}
                            className="flex h-9 items-center gap-2 rounded-full bg-neutral-100 px-4 text-[12.5px] transition hover:bg-neutral-200 active:scale-95"
                          >
                            <MailOpen size={14} /> Mark unread
                          </button>
                          <button
                            onClick={() => {
                              const copy = m;
                              setMessages((ms) => ms.filter((x) => x.id !== m.id));
                              toast("Message archived", Archive);
                              void copy;
                            }}
                            className="flex h-9 items-center gap-2 rounded-full bg-neutral-100 px-4 text-[12.5px] transition hover:bg-neutral-200 active:scale-95"
                          >
                            <Archive size={14} /> Archive
                          </button>
                          <button
                            onClick={() => {
                              setMessages((ms) => ms.filter((x) => x.id !== m.id));
                              toast("Message deleted", Trash2);
                            }}
                            className="flex h-9 items-center gap-2 rounded-full bg-rose-50 px-4 text-[12.5px] text-rose-600 transition hover:bg-rose-100 active:scale-95"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {shown.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center rounded-[26px] border-2 border-dashed border-neutral-300 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-sky-700 shadow-sm">
              <MailCheck size={26} />
            </span>
            <p className="mt-3 text-[18px] font-medium text-neutral-800">Inbox zero</p>
            <p className="text-[13px] text-neutral-500">Nothing to read right now.</p>
          </motion.div>
        )}
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition-colors duration-300 ${on ? "bg-ink" : "bg-neutral-300"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        whileTap={{ width: 28 }}
        className={`block h-6 w-6 rounded-full bg-white shadow ${on ? "ml-auto" : ""}`}
      />
    </button>
  );
}

export function SettingsView({
  settings,
  setSettings,
  onReset,
}: {
  settings: Settings;
  setSettings: (s: Settings) => void;
  onReset: () => void;
}) {
  const rows: { key: keyof Settings; title: string; desc: string; icon: LucideIcon; tone: string; iconColor: string }[] = [
    { key: "compact", title: "Compact cards", desc: "Hide descriptions to fit more courses on screen.", icon: Minimize2, tone: "bg-sky", iconColor: "text-sky-800" },
    { key: "confetti", title: "Celebrate completions", desc: "Fire a burst of confetti when you finish a course.", icon: Sparkles, tone: "bg-mint", iconColor: "text-emerald-800" },
    { key: "autoplay", title: "Auto-play next course", desc: "Start the next upcoming course as soon as one is finished.", icon: PlayCircle, tone: "bg-lilac", iconColor: "text-indigo-800" },
    { key: "showEvents", title: "Show My Events panel", desc: "Keep your upcoming webinars, lessons and tasks in view.", icon: CalendarDays, tone: "bg-sun", iconColor: "text-amber-800" },
  ];
  return (
    <Shell title="Settings" icon={SlidersHorizontal}>
      <div className="flex max-w-2xl flex-col gap-3.5">
        {rows.map((r, i) => (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 24 }}
            className={`${card} flex items-center gap-4 p-4 pr-5`}
          >
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${r.tone} ${r.iconColor}`}>
              <r.icon size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15.5px] font-medium">{r.title}</p>
              <p className="text-[12.5px] leading-snug text-neutral-400">{r.desc}</p>
            </div>
            <Switch on={settings[r.key]} label={r.title} onChange={(v) => setSettings({ ...settings, [r.key]: v })} />
          </motion.div>
        ))}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="mt-3 flex h-12 items-center justify-center gap-2 self-start rounded-full border-2 border-dashed border-neutral-300 px-6 text-[13.5px] font-medium text-neutral-600 transition hover:border-neutral-500 hover:bg-white hover:text-ink"
        >
          <RotateCcw size={15} /> Reset demo data
        </motion.button>
        <p className="flex items-center gap-2 text-[12px] text-neutral-400">
          <BellRing size={13} /> Tip: drag the floating task card, or use the dock below to drop notes on the board.
        </p>
      </div>
    </Shell>
  );
}
