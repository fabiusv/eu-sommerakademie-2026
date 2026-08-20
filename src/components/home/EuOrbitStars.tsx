import type { CSSProperties } from "react";

const STAR_COUNT = 12;
const STAR_ANGLES = Array.from({ length: STAR_COUNT }, (_, i) => i * (360 / STAR_COUNT));

function EuStarIcon({ opacity }: { opacity: number }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="var(--color-eu-yellow)"
      style={{ opacity, filter: "drop-shadow(0 0 7px rgba(255, 204, 0, 0.55))" }}
      aria-hidden
    >
      <path d="M12 2l2.7 6.4 6.9.6-5.2 4.5 1.6 6.8L12 16.9l-6 3.4 1.6-6.8-5.2-4.5 6.9-.6z" />
    </svg>
  );
}

export default function EuOrbitStars() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      <div
        className="animate-orbit relative"
        style={{ "--eu-orbit-radius": "clamp(220px, 19vw, 320px)" } as CSSProperties}
      >
        {STAR_ANGLES.map((angle, i) => (
          <div
            key={angle}
            className="absolute top-0 left-0"
            style={{
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * var(--eu-orbit-radius)))`,
            }}
          >
            <div className="animate-orbit-counter">
              <EuStarIcon opacity={i % 2 === 0 ? 0.55 : 0.3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
