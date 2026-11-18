"use client";

export const MAX_QUANTITY = 10;

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  /** Accessible name, e.g. "Quantity" or "Quantity for Lace Theory — Sample 1". */
  label: string;
  size?: "md" | "sm";
};

export default function QuantityStepper({
  value,
  onChange,
  label,
  size = "md",
}: QuantityStepperProps) {
  const button = size === "md" ? "h-11 w-11 text-lg" : "h-9 w-9 text-base";

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center border border-foreground/15"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className={`${button} disabled:text-foreground/25`}
      >
        −
      </button>
      <span className="w-9 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(MAX_QUANTITY, value + 1))}
        disabled={value >= MAX_QUANTITY}
        className={`${button} disabled:text-foreground/25`}
      >
        +
      </button>
    </div>
  );
}
