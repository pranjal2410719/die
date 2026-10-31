import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Brain,
  Cross,
  FlaskConical,
  HeartPulse,
  Pill,
  ShieldCheck,
  Stethoscope,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CourseIconKey, ToastMsg } from "../types";

export const courseIcons: Record<CourseIconKey, LucideIcon> = {
  cross: Cross,
  brain: Brain,
  pill: Pill,
  heart: HeartPulse,
  stethoscope: Stethoscope,
  shield: ShieldCheck,
  book: BookOpen,
  flask: FlaskConical,
};

export function useOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  active = true,
) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOutside();
    };
    document.addEventListener("pointerdown", handler);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", handler);
      document.removeEventListener("keydown", key);
    };
  }, [ref, onOutside, active]);
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  emoji,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  emoji?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/35 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 36, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.45)]"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[24px] font-medium tracking-tight">
                {title} {emoji}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 transition hover:bg-neutral-200 active:scale-90"
              >
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const fieldCls =
  "w-full rounded-2xl border border-transparent bg-neutral-100 px-4 py-3 text-[14px] outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white";

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

export function ToastHost({
  toasts,
  dismiss,
}: {
  toasts: ToastMsg[];
  dismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-2.5 pl-4 pr-3 text-[13px] text-white shadow-[0_14px_30px_-10px_rgba(0,0,0,0.5)]"
          >
            {t.emoji && <span className="text-[16px] leading-none">{t.emoji}</span>}
            <span>{t.text}</span>
            {t.actionLabel && (
              <button
                onClick={() => {
                  t.onAction?.();
                  dismiss(t.id);
                }}
                className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium transition hover:bg-white/25"
              >
                {t.actionLabel}
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="grid h-6 w-6 place-items-center rounded-full text-white/60 transition hover:bg-white/15 hover:text-white"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Emoji / confetti bursts                                             */
/* ------------------------------------------------------------------ */

export interface BurstData {
  id: number;
  emojis: string[];
  x: number;
  y: number;
}

function Particle({ emoji, i }: { emoji: string; i: number }) {
  const cfg = useMemo(() => {
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 2.1;
    const dist = 140 + Math.random() * 260;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      r: (Math.random() - 0.5) * 240,
      s: 0.9 + Math.random() * 0.9,
      d: 1.1 + Math.random() * 0.9,
      delay: i * 0.012,
    };
  }, [i]);
  return (
    <motion.span
      className="absolute left-0 top-0 text-[26px] leading-none"
      initial={{ x: 0, y: 0, opacity: 1, scale: 0.3, rotate: 0 }}
      animate={{
        x: cfg.x,
        y: [0, cfg.y, cfg.y + 90],
        opacity: [1, 1, 0],
        scale: cfg.s,
        rotate: cfg.r,
      }}
      transition={{ duration: cfg.d, delay: cfg.delay, ease: "easeOut", times: [0, 0.6, 1] }}
    >
      {emoji}
    </motion.span>
  );
}

export function BurstLayer({ bursts }: { bursts: BurstData[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {bursts.map((b) => (
        <div key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 22 }).map((_, i) => (
            <Particle key={i} i={i} emoji={b.emojis[i % b.emojis.length]} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Portal popover menu (never clipped by scroll containers)            */
/* ------------------------------------------------------------------ */

export function PopMenu({
  anchorRef,
  open,
  onClose,
  children,
  width = 214,
  align = "right",
}: {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  align?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const a = anchorRef.current;
    const m = ref.current;
    if (!a || !m) return;
    const r = a.getBoundingClientRect();
    const h = m.offsetHeight;
    let top = r.bottom + 8;
    let up = false;
    if (top + h > window.innerHeight - 8) {
      top = Math.max(8, r.top - h - 8);
      up = true;
    }
    const rawLeft = align === "left" ? r.left : r.right - width;
    const left = Math.min(Math.max(8, rawLeft), window.innerWidth - width - 8);
    setPos({ top, left, up });
  }, [open, anchorRef, width, align]);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const close = () => onClose();
    document.addEventListener("pointerdown", down);
    window.addEventListener("keydown", key);
    window.addEventListener("resize", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [open, onClose, anchorRef]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="menu"
          style={{
            position: "fixed",
            top: pos?.top ?? -9999,
            left: pos?.left ?? -9999,
            width,
            transformOrigin: `${pos?.up ? "bottom" : "top"} ${align}`,
          }}
          initial={{ opacity: 0, scale: 0.9, y: pos?.up ? 6 : -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 480, damping: 32 }}
          className="z-[70] rounded-[20px] bg-white p-1.5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13px] transition active:scale-[0.97] ${
        danger ? "text-rose-600 hover:bg-rose-50" : "text-neutral-800 hover:bg-neutral-100"
      }`}
    >
      <Icon size={15} className={danger ? "text-rose-500" : "text-neutral-500"} />
      {label}
    </button>
  );
}
