import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  ALargeSmall,
  Brain,
  Check,
  Flame,
  Heart,
  MessageCircle,
  NotebookPen,
  Pill,
  Plus,
  Send,
  Sparkles,
  Star,
  StickyNote,
  ThumbsUp,
  Trophy,
  Type,
  type LucideIcon,
} from "lucide-react";
import { avatars } from "../data";
import { useOutside } from "./shared";

export const fonts = [
  { key: "outfit", name: "Outfit", tag: "Rounded & friendly", css: '"Outfit", ui-sans-serif, system-ui, sans-serif' },
  { key: "fraunces", name: "Fraunces", tag: "Editorial serif", css: '"Fraunces", Georgia, serif' },
  { key: "grotesk", name: "Space Grotesk", tag: "Technical", css: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif' },
  { key: "caveat", name: "Caveat", tag: "Handwritten", css: '"Caveat", "Comic Sans MS", cursive' },
] as const;
export type FontKey = (typeof fonts)[number]["key"];

type ToolKey = "text" | "font" | "sticky" | "event" | "chat" | "emoji" | "add";

const tools: { key: ToolKey; label: string; icon: LucideIcon; bg: string; fg?: string }[] = [
  { key: "text", label: "Text box", icon: Type, bg: "#d2c5fb" },
  { key: "font", label: "Typography", icon: ALargeSmall, bg: "#e4e2fb" },
  { key: "sticky", label: "Sticky note", icon: StickyNote, bg: "#f7a9c0" },
  { key: "event", label: "New event", icon: NotebookPen, bg: "#fbe7a2" },
  { key: "chat", label: "Comments", icon: MessageCircle, bg: "#e8c8f7" },
  { key: "emoji", label: "Stickers", icon: Sparkles, bg: "#bdeec1" },
  { key: "add", label: "New course", icon: Plus, bg: "#3b3b3e", fg: "#fff" },
];

export const stickers: { key: string; label: string; icon: LucideIcon; bg: string; fg: string }[] = [
  { key: "heart", label: "Heart", icon: Heart, bg: "from-rose-500 to-pink-600", fg: "text-white" },
  { key: "flame", label: "Fire", icon: Flame, bg: "from-amber-500 to-orange-600", fg: "text-white" },
  { key: "sparkles", label: "Sparkles", icon: Sparkles, bg: "from-amber-300 to-yellow-500", fg: "text-amber-950" },
  { key: "trophy", label: "Trophy", icon: Trophy, bg: "from-yellow-400 to-amber-600", fg: "text-white" },
  { key: "thumbs-up", label: "Thumbs Up", icon: ThumbsUp, bg: "from-emerald-400 to-teal-600", fg: "text-white" },
  { key: "star", label: "Star", icon: Star, bg: "from-violet-500 to-indigo-600", fg: "text-white" },
  { key: "brain", label: "Brain", icon: Brain, bg: "from-purple-500 to-fuchsia-600", fg: "text-white" },
  { key: "pill", label: "Medicine", icon: Pill, bg: "from-sky-400 to-blue-600", fg: "text-white" },
];

interface Msg {
  id: number;
  me: boolean;
  name?: string;
  img?: string;
  text: string;
}

const replies = [
  "Love that idea! Want to jam on it after Pharmacology?",
  "Good catch — I'll add it to the shared notes.",
  "Nice progress! You're ahead of the whole group!",
  "Haha, yes! Let's sync before the 12:30 webinar.",
  "Pinned a sticky note on the board for that.",
];

/* ------------------------------------------------------------------ */
/* A single circular tool with macOS-style magnification               */
/* ------------------------------------------------------------------ */

function DockButton({
  tool,
  index,
  mouseX,
  active,
  hideTip,
  onClick,
}: {
  tool: (typeof tools)[number];
  index: number;
  mouseX: MotionValue<number>;
  active: boolean;
  hideTip: boolean;
  onClick: (el: HTMLElement) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const dist = useTransform(mouseX, (v) => {
    const r = wrap.current?.getBoundingClientRect();
    return r ? v - (r.left + r.width / 2) : 9999;
  });
  const raw = useTransform(dist, [-120, -52, 0, 52, 120], [1, 1.14, 1.42, 1.14, 1]);
  const scale = useSpring(raw, { stiffness: 420, damping: 24, mass: 0.35 });
  const lift = useTransform(scale, (s) => -(s - 1) * 10);
  const Icon = tool.icon;

  return (
    <motion.div
      ref={wrap}
      className="relative"
      initial={{ y: 36, opacity: 0, scale: 0.4 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.45 + index * 0.06 }}
    >
      <AnimatePresence>
        {hover && !hideTip && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.14 }}
            className="pointer-events-none absolute bottom-full left-1/2 mb-7 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[11.5px] font-medium text-ink shadow-[0_10px_20px_-8px_rgba(0,0,0,0.5)]"
          >
            {tool.label}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.button
        aria-label={tool.label}
        aria-pressed={tool.key === "font" || tool.key === "chat" || tool.key === "emoji" ? active : undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={(e) => onClick(e.currentTarget)}
        whileTap={{ scale: 0.85 }}
        style={{ scale, y: lift, backgroundColor: tool.bg, color: tool.fg ?? "#17171a", transformOrigin: "50% 100%" }}
        className={`relative grid h-[38px] w-[38px] place-items-center rounded-full shadow-[inset_0_-2px_0_rgba(0,0,0,0.08),0_6px_14px_-6px_rgba(0,0,0,0.6)] outline-none transition-[box-shadow] ${
          active ? "ring-2 ring-white ring-offset-2 ring-offset-ink" : ""
        }`}
      >
        <Icon size={17} strokeWidth={2} />
      </motion.button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Popover shell                                                       */
/* ------------------------------------------------------------------ */

function PopShell({ children, width = 320 }: { children: ReactNode; width?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      style={{ width: `min(${width}px, calc(100vw - 2rem))`, transformOrigin: "50% 100%" }}
      className="pointer-events-auto absolute bottom-[88px] left-1/2 z-10 -translate-x-1/2 rounded-[28px] bg-white p-4 text-ink shadow-[0_40px_70px_-20px_rgba(0,0,0,0.5)] ring-1 ring-black/5"
    >
      {children}
      {/* little pointer */}
      <span className="absolute -bottom-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[4px] bg-white" />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Dock                                                                */
/* ------------------------------------------------------------------ */

interface Props {
  font: FontKey;
  setFont: (f: FontKey) => void;
  onText: () => void;
  onSticky: () => void;
  onEvent: () => void;
  onCourse: () => void;
  onEmoji: (emoji: string, x: number, y: number) => void;
}

export function Dock({ font, setFont, onText, onSticky, onEvent, onCourse, onEmoji }: Props) {
  const mouseX = useMotionValue(Infinity);
  const [active, setActive] = useState<ToolKey | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useOutside(root, () => setActive(null), active !== null);

  /* chat state lives here so it survives closing the popover */
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, me: false, name: "Maya", img: avatars.a3, text: "Just finished the anatomy quiz — tough one!" },
    { id: 2, me: false, name: "Jonas", img: avatars.a1, text: "Same! Pharmacology next?" },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const replyIdx = useRef(0);
  const chatEnd = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing, active]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMsgs((m) => [...m, { id: Date.now(), me: true, text }]);
    timers.current.push(
      window.setTimeout(() => setTyping(true), 500),
      window.setTimeout(() => {
        setTyping(false);
        const i = replyIdx.current++ % replies.length;
        const from = i % 2 === 0 ? { name: "Maya", img: avatars.a3 } : { name: "Jonas", img: avatars.a1 };
        setMsgs((m) => [...m, { id: Date.now() + 1, me: false, ...from, text: replies[i] }]);
      }, 1700),
    );
  };

  const press = (key: ToolKey, el: HTMLElement) => {
    switch (key) {
      case "text":
        setActive(null);
        onText();
        break;
      case "sticky":
        setActive(null);
        onSticky();
        break;
      case "event":
        setActive(null);
        onEvent();
        break;
      case "add":
        setActive(null);
        onCourse();
        break;
      case "font":
      case "chat":
      case "emoji":
        setActive((a) => (a === key ? null : key));
        void el;
        break;
    }
  };

  return (
    <div ref={root} className="pointer-events-none absolute bottom-0 left-1/2 z-40 -translate-x-1/2">
      {/* ---------- popovers ---------- */}
      <AnimatePresence mode="wait">
        {active === "font" && (
          <PopShell key="font" width={300}>
            <p className="mb-3 flex items-center gap-2 text-[15px] font-medium">
              <ALargeSmall size={17} /> Typography
            </p>
            <div className="flex flex-col gap-1.5">
              {fonts.map((f) => {
                const on = f.key === font;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFont(f.key)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.98] ${
                      on ? "bg-ink text-white" : "bg-neutral-100 hover:bg-neutral-200/80"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[20px] leading-none ${
                        on ? "bg-white/15" : "bg-white"
                      }`}
                      style={{ fontFamily: f.css }}
                    >
                      Aa
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[14px] font-medium" style={{ fontFamily: f.css }}>
                        {f.name}
                      </span>
                      <span className={`text-[11.5px] ${on ? "text-white/60" : "text-neutral-500"}`}>{f.tag}</span>
                    </span>
                    {on && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </PopShell>
        )}

        {active === "chat" && (
          <PopShell key="chat" width={340}>
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-[15px] font-medium">
                <MessageCircle size={17} /> Comments
              </p>
              <div className="flex -space-x-2">
                {[avatars.a3, avatars.a1, avatars.a2].map((a, i) => (
                  <img key={i} src={a} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-white" />
                ))}
              </div>
            </div>
            <div className="soft-scroll flex h-[210px] flex-col gap-2.5 overflow-y-auto rounded-2xl bg-neutral-100 p-3">
              {msgs.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex items-end gap-2 ${m.me ? "justify-end" : ""}`}
                >
                  {!m.me && <img src={m.img} alt={m.name} className="h-6 w-6 rounded-full object-cover" />}
                  <span
                    className={`max-w-[78%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug ${
                      m.me ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-white shadow-sm"
                    }`}
                  >
                    {m.text}
                  </span>
                </motion.div>
              ))}
              {typing && (
                <div className="flex items-end gap-2">
                  <img src={avatars.a3} alt="" className="h-6 w-6 rounded-full object-cover" />
                  <span className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-3 py-2.5 shadow-sm">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-neutral-400"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                      />
                    ))}
                  </span>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <form onSubmit={send} className="mt-3 flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a comment…"
                aria-label="Write a comment"
                className="h-10 min-w-0 flex-1 rounded-full bg-neutral-100 px-4 text-[13px] outline-none transition placeholder:text-neutral-400 focus:bg-white focus:shadow-[0_0_0_2px_#0a0a0b]"
              />
              <motion.button
                whileTap={{ scale: 0.86 }}
                type="submit"
                disabled={!draft.trim()}
                aria-label="Send"
                className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition disabled:opacity-30"
              >
                <Send size={15} />
              </motion.button>
            </form>
          </PopShell>
        )}

        {active === "emoji" && (
          <PopShell key="emoji" width={292}>
            <p className="mb-3 flex items-center gap-2 text-[15px] font-medium">
              <Sparkles size={17} /> Stickers & Badges
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              {stickers.map((s) => (
                <motion.button
                  key={s.key}
                  whileHover={{ scale: 1.15, rotate: -4 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={(ev) => {
                    const r = ev.currentTarget.getBoundingClientRect();
                    onEmoji(s.key, r.left + r.width / 2, r.top + r.height / 2);
                  }}
                  aria-label={`Add ${s.label} badge`}
                  className={`flex h-[56px] items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm transition-all ${s.bg}`}
                >
                  <s.icon size={26} className={s.fg} />
                </motion.button>
              ))}
            </div>
            <p className="mt-3 text-center text-[11.5px] text-neutral-400">
              Drop stickers onto the board — drag them anywhere.
            </p>
          </PopShell>
        )}
      </AnimatePresence>

      {/* ---------- the notched dock ---------- */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.15 }}
        className="relative origin-bottom scale-[0.72] sm:scale-100"
        style={{ width: 480, height: 64 }}
        role="toolbar"
        aria-label="Board tools"
      >
        {/* Body: inclined, filleted shoulders rising out of the frame edge */}
        <svg
          width="480"
          height="64"
          viewBox="0 0 480 64"
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-visible text-ink"
          style={{ filter: "drop-shadow(0 -7px 12px rgba(0,0,0,0.16))" }}
        >
          <path
            fill="currentColor"
            d="M0,56 C30,56 43.3,48.3 50,36 L62,14 C66.8,5.2 70,0 80,0 L400,0 C410,0 413.2,5.2 418,14 L430,36 C436.7,48.3 450,56 480,56 L480,64 L0,64 Z"
          />
          {/* subtle top highlight */}
          <path
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1"
            d="M62,14 C66.8,5.2 70,0.5 80,0.5 L400,0.5 C410,0.5 413.2,5.2 418,14"
          />
        </svg>

        <div
          className="pointer-events-auto absolute inset-x-0 top-[9px] flex items-center justify-center gap-[10px]"
          onMouseMove={(e) => mouseX.set(e.clientX)}
          onMouseLeave={() => mouseX.set(Infinity)}
        >
          {tools.map((t, i) => (
            <DockButton
              key={t.key}
              tool={t}
              index={i}
              mouseX={mouseX}
              active={active === t.key}
              hideTip={active !== null}
              onClick={(el) => press(t.key, el)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
