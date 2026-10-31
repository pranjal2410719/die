import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { AudioLines, CalendarPlus, Check, GraduationCap, Pin } from "lucide-react";
import type { CourseIconKey, EventColor, EventType } from "../types";
import { defaultColorFor, eventTone } from "../data";
import { Modal, courseIcons, fieldCls } from "./shared";

/* ------------------------------------------------------------------ */
/* Add course                                                          */
/* ------------------------------------------------------------------ */

function CourseForm({
  onSubmit,
}: {
  onSubmit: (d: { title: string; desc: string; icon: CourseIconKey; duration: number }) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState<CourseIconKey>("book");
  const [mins, setMins] = useState(10);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      desc: desc.trim() || "A new course added to your learning plan.",
      icon,
      duration: mins * 60,
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-neutral-500">Course title</span>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Emergency Medicine Basics"
          maxLength={60}
          className={fieldCls}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-neutral-500">Short description</span>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="What will you learn?"
          rows={3}
          maxLength={120}
          className={`${fieldCls} resize-none`}
        />
      </label>

      <div>
        <span className="mb-2 block text-[12px] font-medium text-neutral-500">Icon</span>
        <div className="grid grid-cols-8 gap-1.5">
          {(Object.keys(courseIcons) as CourseIconKey[]).map((k) => {
            const I = courseIcons[k];
            const on = icon === k;
            return (
              <motion.button
                type="button"
                key={k}
                whileTap={{ scale: 0.86 }}
                onClick={() => setIcon(k)}
                aria-label={k}
                aria-pressed={on}
                className={`grid aspect-square place-items-center rounded-2xl transition-colors ${
                  on ? "bg-ink text-white" : "bg-neutral-100 text-neutral-600 hover:bg-mint"
                }`}
              >
                <I size={17} />
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-[12px] font-medium text-neutral-500">Length</span>
        <div className="flex gap-2">
          {[5, 10, 15, 30].map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMins(m)}
              className={`h-10 flex-1 rounded-full text-[13px] font-medium transition-colors ${
                mins === m ? "bg-ink text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={!title.trim()}
        className="mt-1 h-12 rounded-full bg-ink text-[14px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-30"
      >
        Add to my plan
      </motion.button>
    </form>
  );
}

export function AddCourseModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: { title: string; desc: string; icon: CourseIconKey; duration: number }) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="New course" icon={GraduationCap}>
      <CourseForm onSubmit={onSubmit} />
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* New event                                                           */
/* ------------------------------------------------------------------ */

const typeOpts: { key: EventType; label: string; icon: typeof Pin }[] = [
  { key: "webinar", label: "Webinar", icon: AudioLines },
  { key: "lesson", label: "Lesson", icon: AudioLines },
  { key: "task", label: "Task", icon: Pin },
];

function tomorrowISO() {
  const d = new Date(Date.now() + 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function EventForm({
  onSubmit,
}: {
  onSubmit: (d: { type: EventType; color: EventColor; text: string; date: string; time?: string }) => void;
}) {
  const [type, setType] = useState<EventType>("task");
  const [color, setColor] = useState<EventColor>("yellow");
  const [text, setText] = useState("");
  const [date, setDate] = useState(tomorrowISO());
  const [time, setTime] = useState("12:30");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ type, color, text: text.trim(), date, time: type === "webinar" ? time : undefined });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <span className="mb-2 block text-[12px] font-medium text-neutral-500">Type</span>
        <div className="flex gap-2">
          {typeOpts.map((t) => {
            const on = type === t.key;
            return (
              <button
                type="button"
                key={t.key}
                onClick={() => {
                  setType(t.key);
                  setColor(defaultColorFor[t.key]);
                }}
                aria-pressed={on}
                className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-colors ${
                  on ? "bg-ink text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-neutral-500">What's happening?</span>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the event…"
          rows={3}
          maxLength={160}
          className={`${fieldCls} resize-none`}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-neutral-500">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls} />
        </label>
        <label className={`block transition-opacity ${type === "webinar" ? "" : "pointer-events-none opacity-35"}`}>
          <span className="mb-1.5 block text-[12px] font-medium text-neutral-500">Start time</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldCls} />
        </label>
      </div>

      <div>
        <span className="mb-2 block text-[12px] font-medium text-neutral-500">Colour</span>
        <div className="flex gap-3">
          {(Object.keys(eventTone) as EventColor[]).map((c) => (
            <motion.button
              type="button"
              key={c}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setColor(c)}
              aria-label={eventTone[c].label}
              aria-pressed={color === c}
              className={`grid h-9 w-9 place-items-center rounded-full ${eventTone[c].bg} ${
                color === c ? "ring-2 ring-ink ring-offset-2" : ""
              }`}
            >
              {color === c && <Check size={14} />}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={!text.trim()}
        className="mt-1 h-12 rounded-full bg-ink text-[14px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-30"
      >
        Add event
      </motion.button>
    </form>
  );
}

export function NewEventModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: { type: EventType; color: EventColor; text: string; date: string; time?: string }) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="New event" icon={CalendarPlus}>
      <EventForm onSubmit={onSubmit} />
    </Modal>
  );
}
