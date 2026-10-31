import type { RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AudioLines, BellRing, CalendarDays, Clock, Pin, PinOff, Plus, X, type LucideIcon } from "lucide-react";
import type { EventItem, EventType } from "../types";
import { avatars, eventTone } from "../data";

const typeMeta: Record<EventType, { label: string; icon: LucideIcon }> = {
  webinar: { label: "Webinar", icon: AudioLines },
  lesson: { label: "Lesson", icon: AudioLines },
  task: { label: "Task", icon: Pin },
};

interface CardProps {
  ev: EventItem;
  onRemove: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onToggleFloat: (id: string) => void;
}

function EventCard({ ev, onRemove, onToggleReminder, onToggleFloat }: CardProps) {
  const tone = eventTone[ev.color];
  const meta = typeMeta[ev.type];
  const Icon = meta.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      whileHover={{ y: -3 }}
      className={`group relative rounded-[24px] p-2.5 shadow-[0_18px_30px_-22px_rgba(0,0,0,0.35)] ${tone.bg}`}
    >
      <div className="flex items-center justify-between px-2 pb-2 pt-1.5">
        <div className="flex items-center gap-2 text-[12px] font-medium">
          {ev.type === "webinar" ? (
            <img src={avatars.a1} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-white/70" />
          ) : ev.type === "task" ? (
            <button
              onClick={() => onToggleFloat(ev.id)}
              title="Pull out as a floating card"
              aria-label="Pull out as a floating card"
              className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-white/60 active:scale-90"
            >
              <Icon size={15} />
            </button>
          ) : (
            <span className="grid h-7 w-7 place-items-center">
              <Icon size={16} />
            </span>
          )}
          {meta.label}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onRemove(ev.id)}
            aria-label="Remove event"
            className="grid h-6 w-6 place-items-center rounded-full bg-white/60 text-neutral-700 opacity-0 transition hover:bg-white focus:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
          >
            <X size={12} />
          </button>
          <span className="text-[12px] font-semibold tabular-nums">{ev.date}</span>
        </div>
      </div>
      <div className={`rounded-[18px] px-3.5 py-3 text-[12px] leading-[1.5] text-neutral-800 ${tone.inner}`}>{ev.text}</div>
      {ev.time && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onToggleReminder(ev.id)}
          className={`mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-full text-[12px] font-medium shadow-[0_8px_16px_-10px_rgba(0,0,0,0.35)] transition-colors ${
            ev.reminder ? "bg-ink text-white" : "bg-white text-neutral-900 hover:bg-white/80"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={ev.reminder ? "on" : "off"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              {ev.reminder ? <BellRing size={14} /> : <Clock size={14} />}
              {ev.reminder ? `Reminder set for ${ev.time}` : `Start at ${ev.time}`}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

interface PanelProps {
  events: EventItem[];
  floatingOn: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onToggleFloat: (id: string) => void;
}

export function EventsPanel({ events, floatingOn, onAdd, onRemove, onToggleReminder, onToggleFloat }: PanelProps) {
  const list = events.filter((e) => !(floatingOn && e.floating));
  return (
    <aside className="soft-scroll relative bg-[#eeeeee] px-5 pb-10 pt-6 sm:px-8 lg:h-full lg:overflow-y-auto lg:px-6 lg:pb-44 lg:pt-8">
      <div className="mb-6 flex items-center justify-between lg:mb-7">
        <h2 className="flex items-center gap-3 text-[30px] font-medium leading-none tracking-tight sm:text-[34px]">
          My Events
          <motion.span
            animate={{ rotate: [0, 8, -8, 4, 0], y: [0, -2, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 4 }}
            className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-800 shadow-sm"
          >
            <CalendarDays size={18} />
          </motion.span>
        </h2>
        <motion.button
          whileHover={{ rotate: 90, scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          onClick={onAdd}
          aria-label="Add event"
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-neutral-800 shadow-[0_8px_16px_-10px_rgba(0,0,0,0.4)]"
        >
          <Plus size={17} />
        </motion.button>
      </div>

      <div className="flex flex-col gap-3.5">
        <AnimatePresence mode="popLayout" initial={true}>
          {list.map((ev) => (
            <EventCard key={ev.id} ev={ev} onRemove={onRemove} onToggleReminder={onToggleReminder} onToggleFloat={onToggleFloat} />
          ))}
        </AnimatePresence>

        <motion.button
          layout
          onClick={onAdd}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          className="group flex h-[150px] flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed border-neutral-300 text-[13px] text-neutral-400 transition-colors hover:border-neutral-400 hover:bg-white/60 hover:text-neutral-700"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/80 transition group-hover:rotate-90">
            <Plus size={16} />
          </span>
          Drop a new event here
        </motion.button>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Floating, tilted + draggable card that breaks out of the frame      */
/* ------------------------------------------------------------------ */

export function FloatingEvent({
  ev,
  onDock,
  constraintsRef,
}: {
  ev: EventItem;
  onDock: (id: string) => void;
  constraintsRef: RefObject<HTMLElement | null>;
}) {
  const tone = eventTone[ev.color];
  const meta = typeMeta[ev.type];
  const Icon = meta.icon;
  return (
    <motion.div
      key={ev.id}
      drag
      dragMomentum={false}
      dragConstraints={constraintsRef}
      dragElastic={0.08}
      initial={{ opacity: 0, y: 80, rotate: -14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate: -5, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.9 }}
      whileHover={{ rotate: -2, scale: 1.03 }}
      whileDrag={{ rotate: -3, scale: 1.07, cursor: "grabbing" }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={`group absolute bottom-8 right-6 lg:right-8 z-[36] w-[310px] cursor-grab touch-none rounded-[26px] p-3 ${tone.bg} shadow-[0_34px_50px_-22px_rgba(30,110,50,0.55),0_0_0_1px_rgba(255,255,255,0.5)_inset]`}
    >
      <div className="flex items-center justify-between px-2 pb-2 pt-1">
        <div className="flex items-center gap-2 text-[12px] font-medium">
          <Icon size={15} />
          {meta.label}
        </div>
        <div className="flex items-center gap-2">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDock(ev.id)}
            aria-label="Dock into the list"
            title="Dock into the list"
            className="flex h-6 items-center gap-1 rounded-full bg-white/70 px-2 text-[11px] opacity-0 transition hover:bg-white focus:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
          >
            <PinOff size={11} /> Dock
          </button>
          <span className="text-[12px] font-semibold tabular-nums">{ev.date}</span>
        </div>
      </div>
      <div className={`rounded-[18px] px-3.5 py-3 text-[12px] leading-[1.5] text-neutral-800 ${tone.inner}`}>{ev.text}</div>
    </motion.div>
  );
}
