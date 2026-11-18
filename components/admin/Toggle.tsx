"use client";

type ToggleProps = {
  /** Form field name; submitted as "on" when switched on (like a checkbox). */
  name: string;
  /** Submitted value when on; defaults to "on". */
  value?: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "md" | "sm";
};

/** An on/off switch: a real checkbox underneath, so it works with forms and screen readers. */
export default function Toggle({
  name,
  value,
  label,
  hint,
  checked,
  onChange,
  size = "md",
}: ToggleProps) {
  const track = size === "md" ? "h-7 w-12" : "h-6 w-10";
  const knob = size === "md" ? "h-5 w-5 peer-checked:translate-x-5" : "h-4 w-4 peer-checked:translate-x-4";

  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
      <span className="min-w-0">
        <span className={size === "md" ? "block" : "block text-sm"}>{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-foreground/60">{hint}</span>}
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`${track} rounded-full bg-foreground/20 transition-colors peer-checked:bg-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground`}
        />
        <span
          aria-hidden="true"
          className={`${knob} absolute left-1 rounded-full bg-white shadow transition-transform`}
        />
      </span>
    </label>
  );
}
