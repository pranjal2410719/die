import { useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { GripHorizontal, X } from "lucide-react";
import type { BoardItem } from "../types";

interface Props {
  items: BoardItem[];
  boardRef: RefObject<HTMLDivElement | null>;
  onChange: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

function Item({
  item,
  boardRef,
  z,
  onFront,
  onChange,
  onRemove,
}: {
  item: BoardItem;
  boardRef: RefObject<HTMLDivElement | null>;
  z: number;
  onFront: () => void;
  onChange: (text: string) => void;
  onRemove: () => void;
}) {
  const controls = useDragControls();
  const isEmoji = item.kind === "emoji";

  const handle = (cls: string) => (
    <div
      onPointerDown={(e) => controls.start(e)}
      className={`flex cursor-grab touch-none items-center gap-1 active:cursor-grabbing ${cls}`}
      aria-label="Drag"
    >
      <GripHorizontal size={14} />
    </div>
  );

  const removeBtn = (
    <button
      onClick={onRemove}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label="Delete"
      className="grid h-6 w-6 place-items-center rounded-full bg-ink text-white opacity-0 shadow-md transition hover:scale-110 focus:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
    >
      <X size={12} />
    </button>
  );

  return (
    <motion.div
      drag
      dragControls={controls}
      dragListener={isEmoji}
      dragMomentum={false}
      dragElastic={0.04}
      dragConstraints={boardRef}
      initial={{ scale: 0.2, opacity: 0, rotate: item.rotate - 24 }}
      animate={{ scale: 1, opacity: 1, rotate: item.rotate }}
      exit={{ scale: 0.2, opacity: 0, transition: { duration: 0.18 } }}
      whileDrag={{ scale: 1.07, rotate: item.rotate + 2 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      onPointerDown={onFront}
      style={{ left: `${item.x}%`, top: `${item.y}%`, zIndex: z }}
      className="group pointer-events-auto absolute"
    >
      {item.kind === "emoji" && (
        <div
          onDoubleClick={onRemove}
          className="relative cursor-grab touch-none select-none text-[58px] leading-none drop-shadow-[0_14px_14px_rgba(0,0,0,0.25)] active:cursor-grabbing"
        >
          {item.text}
          <div className="absolute -right-2 -top-2">{removeBtn}</div>
        </div>
      )}

      {item.kind === "text" && (
        <div className="relative rounded-2xl border-2 border-dashed border-transparent px-3 py-2 transition focus-within:border-ink/40 hover:border-ink/25">
          <div className="absolute -top-3.5 left-3 flex items-center gap-1.5 rounded-full bg-ink px-2 py-1 text-white opacity-0 shadow-md transition focus-within:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100">
            {handle("")}
            <span className="text-[10px] font-medium uppercase tracking-wider">Text</span>
          </div>
          <div className="absolute -right-3 -top-3">{removeBtn}</div>
          <input
            autoFocus={!item.text}
            value={item.text}
            onChange={(e) => onChange(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Type something…"
            size={Math.max(12, item.text.length + 1)}
            aria-label="Text box"
            className="bg-transparent text-[30px] font-medium leading-tight tracking-tight text-ink outline-none placeholder:text-neutral-400"
          />
        </div>
      )}

      {item.kind === "sticky" && (
        <div
          className="relative w-[188px] rounded-[6px] rounded-br-[34px] shadow-[0_26px_30px_-14px_rgba(0,0,0,0.38),0_2px_0_rgba(255,255,255,0.45)_inset]"
          style={{ backgroundColor: item.color }}
        >
          <div className="flex h-8 items-center justify-between px-2.5 text-ink/50">
            {handle("flex-1 py-2")}
            {removeBtn}
          </div>
          <textarea
            autoFocus={!item.text}
            value={item.text}
            onChange={(e) => onChange(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Write a note…"
            aria-label="Sticky note"
            rows={5}
            className="block h-[132px] w-full resize-none bg-transparent px-4 pb-4 text-[22px] leading-[1.15] text-ink/85 outline-none placeholder:text-ink/35"
            style={{ fontFamily: '"Caveat", "Comic Sans MS", cursive' }}
          />
        </div>
      )}
    </motion.div>
  );
}

export function Board({ items, boardRef, onChange, onRemove }: Props) {
  const [zs, setZs] = useState<Record<string, number>>({});
  const counter = useRef(10);
  const front = (id: string) => {
    counter.current += 1;
    setZs((z) => ({ ...z, [id]: counter.current }));
  };

  return (
    <div ref={boardRef} className="pointer-events-none absolute inset-0 z-30">
      <AnimatePresence>
        {items.map((it) => (
          <Item
            key={it.id}
            item={it}
            boardRef={boardRef}
            z={zs[it.id] ?? 1}
            onFront={() => front(it.id)}
            onChange={(t) => onChange(it.id, t)}
            onRemove={() => onRemove(it.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
