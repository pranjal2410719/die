import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  BellOff,
  Calendar,
  GraduationCap,
  Lock,
  Pause,
  Play,
  RotateCcw,
  StickyNote,
  Trash2,
  Trophy,
  Type,
} from "lucide-react";
import type {
  BoardItem,
  Course,
  CourseIconKey,
  EventColor,
  EventItem,
  EventType,
  Settings,
  StatFilter,
  TabKey,
  ToastMsg,
  ViewMode,
} from "./types";
import { formatEventDate, initialCourses, initialEvents, inboxMessages } from "./data";
import { TopBar } from "./components/TopBar";
import { LearningPlan } from "./components/LearningPlan";
import { EventsPanel, FloatingEvent } from "./components/EventsPanel";
import { Dock, fonts, type FontKey } from "./components/Dock";
import { Board } from "./components/Board";
import { InboxView, ProgressView, SettingsView, TeamView, type InboxMsg } from "./components/Views";
import { AddCourseModal, NewEventModal } from "./components/Modals";
import { BurstLayer, ToastHost, type BurstData } from "./components/shared";
import type { CourseActions } from "./components/CourseCard";

const stickyColors = ["#ffd3e1", "#fff0a6", "#cdeeff", "#d3f6d6", "#ead6fc"];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function useMedia(query: string) {
  const [m, setM] = useState(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : true));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const h = () => setM(mq.matches);
    mq.addEventListener("change", h);
    h();
    return () => mq.removeEventListener("change", h);
  }, [query]);
  return m;
}

export default function App() {
  const [tab, setTab] = useState<TabKey>("plan");
  const [view, setView] = useState<ViewMode>("path");
  const [filter, setFilter] = useState<StatFilter>("all");
  const [zoom, setZoom] = useState(1.1);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [playing, setPlaying] = useState(true);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [inbox, setInbox] = useState<InboxMsg[]>(inboxMessages);
  const [settings, setSettings] = useState<Settings>({
    compact: false,
    confetti: true,
    autoplay: false,
    showEvents: true,
  });
  const [font, setFont] = useState<FontKey>("outfit");
  const [courseModal, setCourseModal] = useState(false);
  const [eventModal, setEventModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [bursts, setBursts] = useState<BurstData[]>([]);

  const isLg = useMedia("(min-width: 1024px)");
  const pageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(100);
  const lastPtr = useRef({ x: 640, y: 420 });

  /* ---------------------------------------------------------------- */
  /* plumbing                                                          */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const h = (e: PointerEvent) => {
      lastPtr.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointerdown", h, true);
    return () => window.removeEventListener("pointerdown", h, true);
  }, []);

  useEffect(() => {
    const f = fonts.find((x) => x.key === font);
    if (f) document.documentElement.style.setProperty("--app-font", f.css);
  }, [font]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const pushToast = useCallback(
    (m: Omit<ToastMsg, "id">) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-1), { ...m, id }]);
      window.setTimeout(() => dismiss(id), m.actionLabel ? 6000 : 3200);
    },
    [dismiss],
  );
  const toast = useCallback((text: string, icon?: any) => pushToast({ text, icon }), [pushToast]);

  const fire = useCallback((_emojis?: any, x?: number, y?: number) => {
    const id = ++idRef.current;
    const p = lastPtr.current;
    const actualX = typeof _emojis === "number" ? _emojis : x ?? p.x;
    const actualY = typeof x === "number" ? x : y ?? p.y;
    setBursts((b) => [...b, { id, x: actualX, y: actualY }]);
    window.setTimeout(() => setBursts((b) => b.filter((z) => z.id !== id)), 2600);
  }, []);

  /* ---------------------------------------------------------------- */
  /* watch timer                                                       */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setCourses((cs) =>
        cs.map((c) => (c.status === "progress" ? { ...c, seconds: Math.min(c.duration, c.seconds + 1) } : c)),
      );
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);

  /* ---------------------------------------------------------------- */
  /* course actions                                                    */
  /* ---------------------------------------------------------------- */

  const complete = (id: string) => {
    const c = courses.find((x) => x.id === id);
    if (!c || c.status === "completed") return;
    let next = courses.map((x) => (x.id === id ? { ...x, status: "completed" as const, seconds: x.duration } : x));
    let followUp = "";
    if (c.status === "progress") {
      const nx = settings.autoplay ? next.find((x) => x.status === "upcoming") : undefined;
      if (nx) {
        next = next.map((x) => (x.id === nx.id ? { ...x, status: "progress" as const } : x));
        setPlaying(true);
        followUp = ` · now playing “${nx.title}”`;
      } else setPlaying(false);
    }
    setCourses(next);
    if (settings.confetti) fire();
    toast(`“${c.title}” completed${followUp}`, Trophy);
  };

  // finishing the video by itself
  useEffect(() => {
    const p = courses.find((c) => c.status === "progress");
    if (p && p.seconds >= p.duration) complete(p.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  const actions: CourseActions = {
    start: (id) => {
      const c = courses.find((x) => x.id === id);
      if (!c) return;
      setCourses((cs) =>
        cs.map((x) =>
          x.id === id
            ? { ...x, status: "progress", seconds: x.status === "completed" ? 0 : x.seconds }
            : x.status === "progress"
              ? { ...x, status: "upcoming" }
              : x,
        ),
      );
      setPlaying(true);
      toast(`Now watching “${c.title}”`, Play);
    },
    complete,
    reset: (id) => {
      const c = courses.find((x) => x.id === id);
      if (!c) return;
      if (c.status === "progress") setPlaying(false);
      setCourses((cs) => cs.map((x) => (x.id === id ? { ...x, status: "upcoming", seconds: 0 } : x)));
      toast(`“${c.title}” moved back to upcoming`, RotateCcw);
    },
    remove: (id) => {
      const idx = courses.findIndex((x) => x.id === id);
      const c = courses[idx];
      if (!c) return;
      if (c.status === "progress") setPlaying(false);
      setCourses((cs) => cs.filter((x) => x.id !== id));
      pushToast({
        text: `Removed “${c.title}”`,
        icon: Trash2,
        actionLabel: "Undo",
        onAction: () =>
          setCourses((cs) => {
            const n = [...cs];
            n.splice(Math.min(idx, n.length), 0, c);
            return n;
          }),
      });
    },
    togglePlay: () => {
      if (!courses.some((c) => c.status === "progress")) return;
      setPlaying((p) => {
        toast(p ? "Paused" : "Playing", p ? Pause : Play);
        return !p;
      });
    },
    locked: (id) => {
      const c = courses.find((x) => x.id === id);
      if (!c) return;
      pushToast({
        text: `“${c.title}” is locked until you start it`,
        icon: Lock,
        actionLabel: "Start now",
        onAction: () => actions.start(id),
      });
    },
  };

  const addCourse = (d: { title: string; desc: string; icon: CourseIconKey; duration: number }) => {
    setCourses((cs) => [
      ...cs,
      { id: `c${++idRef.current}`, title: d.title, desc: d.desc, icon: d.icon, status: "upcoming", seconds: 0, duration: d.duration },
    ]);
    setCourseModal(false);
    setTab("plan");
    setFilter("all");
    toast(`“${d.title}” added to upcoming`, GraduationCap);
  };

  /* ---------------------------------------------------------------- */
  /* events                                                            */
  /* ---------------------------------------------------------------- */

  const addEvent = (d: { type: EventType; color: EventColor; text: string; date: string; time?: string }) => {
    setEvents((es) => [
      { id: `e${++idRef.current}`, type: d.type, color: d.color, text: d.text, date: formatEventDate(d.date), time: d.time },
      ...es,
    ]);
    setEventModal(false);
    setSettings((s) => ({ ...s, showEvents: true }));
    toast("Event added to My Events", Calendar);
  };

  const removeEvent = (id: string) => {
    const idx = events.findIndex((e) => e.id === id);
    const ev = events[idx];
    if (!ev) return;
    setEvents((es) => es.filter((e) => e.id !== id));
    pushToast({
      text: "Event removed",
      icon: Trash2,
      actionLabel: "Undo",
      onAction: () =>
        setEvents((es) => {
          const n = [...es];
          n.splice(Math.min(idx, n.length), 0, ev);
          return n;
        }),
    });
  };

  const toggleReminder = (id: string) => {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    setEvents((es) => es.map((e) => (e.id === id ? { ...e, reminder: !e.reminder } : e)));
    toast(ev.reminder ? "Reminder cancelled" : `We'll remind you at ${ev.time}`, ev.reminder ? BellOff : Bell);
  };

  const toggleFloat = (id: string) => {
    setEvents((es) => es.map((e) => (e.id === id ? { ...e, floating: !e.floating } : { ...e, floating: false })));
  };

  /* ---------------------------------------------------------------- */
  /* board                                                             */
  /* ---------------------------------------------------------------- */

  const addBoard = (kind: BoardItem["kind"], text = "") => {
    const item: BoardItem = {
      id: `b${++idRef.current}`,
      kind,
      text,
      x: rand(22, 48),
      y: rand(26, 50),
      color: kind === "sticky" ? stickyColors[Math.floor(Math.random() * stickyColors.length)] : "",
      rotate: kind === "text" ? rand(-2, 2) : rand(-6, 6),
    };
    setBoard((b) => [...b, item]);
  };

  const resetAll = () => {
    setCourses(initialCourses);
    setEvents(initialEvents);
    setBoard([]);
    setInbox(inboxMessages);
    setFilter("all");
    setView("path");
    setZoom(1.1);
    setPlaying(true);
    toast("Demo data restored", RotateCcw);
  };

  /* ---------------------------------------------------------------- */
  /* render                                                            */
  /* ---------------------------------------------------------------- */

  const floating = events.find((e) => e.floating);
  const showFloating = isLg && settings.showEvents && floating;
  const eventsOn = settings.showEvents;

  return (
    <div
      ref={pageRef}
      className="relative flex h-screen h-dvh w-screen w-full flex-col overflow-hidden bg-ink"
    >
      <div className="relative flex h-full w-full flex-col px-1.5 pb-1.5 sm:px-2.5 sm:pb-2.5">
        <TopBar tab={tab} setTab={setTab} unreadInbox={inbox.filter((m) => m.unread).length} toast={toast} />

        <main
          className={`soft-scroll relative min-h-0 flex-1 overflow-y-auto rounded-[28px] sm:rounded-[32px] bg-[#f7f7f7] pb-28 lg:grid lg:overflow-hidden lg:pb-0 ${
            eventsOn
              ? "lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1fr)_420px]"
              : "lg:grid-cols-1"
          }`}
        >
          <div className="relative min-h-0 lg:h-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="lg:h-full"
              >
                {tab === "plan" && (
                  <LearningPlan
                    courses={courses}
                    view={view}
                    setView={setView}
                    filter={filter}
                    setFilter={setFilter}
                    zoom={zoom}
                    setZoom={setZoom}
                    compact={settings.compact}
                    playing={playing}
                    actions={actions}
                    onAdd={() => setCourseModal(true)}
                    toast={toast}
                  />
                )}
                {tab === "team" && <TeamView toast={toast} />}
                {tab === "progress" && <ProgressView courses={courses} />}
                {tab === "inbox" && <InboxView messages={inbox} setMessages={setInbox} toast={toast} />}
                {tab === "settings" && <SettingsView settings={settings} setSettings={setSettings} onReset={resetAll} />}
              </motion.div>
            </AnimatePresence>
            <div
              className={`pointer-events-none absolute bottom-0 right-0 z-10 hidden h-24 bg-gradient-to-t from-[#f7f7f7] via-[#f7f7f7]/85 to-transparent lg:block ${
                tab === "plan" ? "left-[92px]" : "left-0"
              }`}
            />
          </div>

          {eventsOn && (
            <div className="relative min-h-0 lg:h-full">
              <EventsPanel
                events={events}
                floatingOn={isLg}
                onAdd={() => setEventModal(true)}
                onRemove={removeEvent}
                onToggleReminder={toggleReminder}
                onToggleFloat={toggleFloat}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-28 bg-gradient-to-t from-[#eeeeee] via-[#eeeeee]/85 to-transparent lg:block" />
            </div>
          )}
        </main>

        {/* things that live on top of the frame */}
        <Board
          items={board}
          boardRef={boardRef}
          onChange={(id, text) => setBoard((b) => b.map((x) => (x.id === id ? { ...x, text } : x)))}
          onRemove={(id) => setBoard((b) => b.filter((x) => x.id !== id))}
        />

        <AnimatePresence>
          {showFloating && floating && (
            <FloatingEvent key={floating.id} ev={floating} onDock={toggleFloat} constraintsRef={pageRef} />
          )}
        </AnimatePresence>

        <Dock
          font={font}
          setFont={(f) => {
            setFont(f);
            toast(`Typeface: ${fonts.find((x) => x.key === f)?.name}`, Type);
          }}
          onText={() => {
            addBoard("text");
            toast("Text box added — drag it by its handle", Type);
          }}
          onSticky={() => {
            addBoard("sticky");
            toast("Sticky note added to the board", StickyNote);
          }}
          onEvent={() => setEventModal(true)}
          onCourse={() => setCourseModal(true)}
          onEmoji={(stickerKey, x, y) => {
            addBoard("emoji", stickerKey);
            fire(x, y);
          }}
        />
      </div>

      <AddCourseModal open={courseModal} onClose={() => setCourseModal(false)} onSubmit={addCourse} />
      <NewEventModal open={eventModal} onClose={() => setEventModal(false)} onSubmit={addEvent} />
      <BurstLayer bursts={bursts} />
      <ToastHost toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
