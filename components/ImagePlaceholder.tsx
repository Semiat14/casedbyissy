type ImagePlaceholderProps = {
  className?: string;
};

export default function ImagePlaceholder({ className = "" }: ImagePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center bg-blush text-xs uppercase tracking-[0.15em] text-foreground/50 ${className}`}
    >
      Image coming soon
    </div>
  );
}
