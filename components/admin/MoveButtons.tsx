"use client";

import { useFormStatus } from "react-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

type MoveButtonsProps = {
  /** Server Actions with id and direction already bound. */
  moveUp: () => Promise<void>;
  moveDown: () => Promise<void>;
  isFirst: boolean;
  isLast: boolean;
  /** What's being moved, for screen readers, e.g. "Lace Theory". */
  itemLabel: string;
};

/** Up/down reorder buttons, each a tiny form so they work even before JavaScript loads. */
export default function MoveButtons({ moveUp, moveDown, isFirst, isLast, itemLabel }: MoveButtonsProps) {
  return (
    <div className="flex shrink-0 gap-1">
      <form action={moveUp}>
        <MoveButton disabled={isFirst} label={`Move ${itemLabel} up`}>
          <ChevronUp size={20} strokeWidth={1.5} />
        </MoveButton>
      </form>
      <form action={moveDown}>
        <MoveButton disabled={isLast} label={`Move ${itemLabel} down`}>
          <ChevronDown size={20} strokeWidth={1.5} />
        </MoveButton>
      </form>
    </div>
  );
}

function MoveButton({
  disabled,
  label,
  children,
}: {
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center border border-foreground/15 transition-colors hover:border-foreground/50 disabled:border-foreground/5 disabled:text-foreground/20 disabled:hover:border-foreground/5"
    >
      {children}
    </button>
  );
}
