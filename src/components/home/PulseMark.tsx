export default function PulseMark({ className = "size-2.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="8" cy="8" r="2.5" fill="currentColor" />
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}
