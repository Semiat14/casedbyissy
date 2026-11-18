type FormMessageProps = {
  status: "success" | "error";
  children: React.ReactNode;
  className?: string;
};

/** A short success or error banner. Screen readers announce it when it appears. */
export default function FormMessage({ status, children, className = "" }: FormMessageProps) {
  const styles =
    status === "success"
      ? "border-emerald-800/20 bg-emerald-50 text-emerald-900"
      : "border-red-800/20 bg-red-50 text-red-900";

  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={`border px-4 py-3 text-sm leading-relaxed ${styles} ${className}`}
    >
      {status === "success" ? "✓ " : ""}
      {children}
    </p>
  );
}
