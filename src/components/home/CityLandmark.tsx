import type { ReactNode } from "react";

type Block = { x: number; w: number; h: number };

const GROUND = 168;

// Low, evenly-lit background rooftops shared by every skyline — the per-city silhouette
// on top is what actually differentiates each mark.
function Blocks({ blocks, opacity = 0.55 }: { blocks: Block[]; opacity?: number }) {
  return (
    <>
      {blocks.map((b, i) => (
        <rect key={i} x={b.x} y={GROUND - b.h} width={b.w} height={b.h} fill="currentColor" opacity={opacity} />
      ))}
    </>
  );
}

const CITY_MARKS: Record<string, () => ReactNode> = {
  // Fernsehturm — tapering needle, sphere, antenna.
  Berlin: () => (
    <>
      <Blocks blocks={[{ x: 18, w: 46, h: 30 }, { x: 70, w: 34, h: 22 }, { x: 230, w: 52, h: 34 }, { x: 288, w: 26, h: 24 }]} />
      <polygon points="160,168 150,58 170,58" fill="currentColor" />
      <circle cx="160" cy="50" r="15" fill="currentColor" />
      <line x1="160" y1="35" x2="160" y2="16" stroke="currentColor" strokeWidth="3" />
    </>
  ),
  // Belém Tower — turret with crenellations — on a hillside terrace of pitched roofs.
  Lisbon: () => (
    <>
      <Blocks blocks={[{ x: 16, w: 40, h: 24 }, { x: 254, w: 30, h: 40 }, { x: 286, w: 28, h: 26 }]} />
      <polygon points="60,150 100,150 100,110 80,88 60,110" fill="currentColor" opacity={0.55} />
      <g fill="currentColor">
        <rect x="140" y="80" width="40" height="88" />
        <rect x="136" y="70" width="6" height="12" />
        <rect x="148" y="70" width="6" height="12" />
        <rect x="160" y="70" width="6" height="12" />
        <rect x="172" y="70" width="6" height="12" />
        <rect x="150" y="45" width="20" height="30" />
        <rect x="146" y="36" width="5" height="11" />
        <rect x="156" y="36" width="5" height="11" />
        <rect x="167" y="36" width="5" height="11" />
      </g>
    </>
  ),
  // Palace of Culture and Science — stacked, narrowing tiers with a thin spire.
  Warsaw: () => (
    <>
      <Blocks blocks={[{ x: 20, w: 50, h: 26 }, { x: 250, w: 30, h: 36 }, { x: 284, w: 30, h: 22 }]} />
      <g fill="currentColor">
        <rect x="126" y="120" width="68" height="48" />
        <rect x="138" y="88" width="44" height="34" />
        <rect x="148" y="60" width="24" height="30" />
        <rect x="155" y="34" width="10" height="28" />
        <line x1="160" y1="34" x2="160" y2="14" stroke="currentColor" strokeWidth="3" />
      </g>
    </>
  ),
  // Riesenrad — a great wheel with spokes, beside a small domed hall.
  Vienna: () => (
    <>
      <Blocks blocks={[{ x: 18, w: 44, h: 24 }, { x: 258, w: 46, h: 30 }]} />
      <g stroke="currentColor" strokeWidth="3" fill="none">
        <circle cx="110" cy="92" r="52" />
      </g>
      <g stroke="currentColor" strokeWidth="2">
        <line x1="110" y1="40" x2="110" y2="144" />
        <line x1="58" y1="92" x2="162" y2="92" />
        <line x1="73" y1="55" x2="147" y2="129" />
        <line x1="147" y1="55" x2="73" y2="129" />
      </g>
      <rect x="102" y="144" width="16" height="24" fill="currentColor" />
      <path d="M195 168v-26c0-14 11-25 25-25s25 11 25 25v26z" fill="currentColor" opacity={0.6} />
    </>
  ),
  // Parthenon — colonnade, entablature and pediment on a stepped platform.
  Athens: () => (
    <>
      <Blocks blocks={[{ x: 14, w: 46, h: 20 }, { x: 262, w: 44, h: 24 }]} />
      <g fill="currentColor">
        <polygon points="90,60 230,60 245,84 75,84" />
        <rect x="80" y="84" width="160" height="10" />
        {[92, 114, 136, 158, 180, 202, 224].map((x) => (
          <rect key={x} x={x} y="94" width="8" height="60" />
        ))}
        <rect x="72" y="154" width="176" height="8" />
        <rect x="64" y="162" width="192" height="6" />
      </g>
    </>
  ),
  // St. Olaf's spire above a huddle of steep-roofed medieval houses.
  Tallinn: () => (
    <>
      <g fill="currentColor" opacity={0.55}>
        <polygon points="30,168 30,128 55,110 80,128 80,168" />
        <polygon points="230,168 230,118 258,98 286,118 286,168" />
      </g>
      <g fill="currentColor">
        <polygon points="140,168 140,96 160,80 180,96 180,168" />
        <polygon points="150,44 160,20 170,44" />
        <rect x="158" y="12" width="4" height="10" />
        <circle cx="160" cy="10" r="3" />
      </g>
    </>
  ),
  // Crow-stepped harbour gables in a row, plus a slender twisted spire.
  Copenhagen: () => (
    <>
      <g fill="currentColor">
        {[
          { x: 26, w: 34, base: 96 },
          { x: 64, w: 34, base: 118 },
          { x: 102, w: 34, base: 84 },
        ].map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={GROUND - b.base} width={b.w} height={b.base} opacity={0.55} />
            <polygon
              points={`${b.x},${GROUND - b.base} ${b.x + 6},${GROUND - b.base - 10} ${b.x + b.w - 6},${GROUND - b.base - 10} ${b.x + b.w},${GROUND - b.base}`}
              opacity={0.55}
            />
          </g>
        ))}
      </g>
      <g fill="currentColor">
        <rect x="190" y="70" width="30" height="98" />
        <rect x="198" y="34" width="14" height="38" />
        <path d="M205 10 198 24h14z" />
        <line x1="205" y1="34" x2="196" y2="14" stroke="currentColor" strokeWidth="2" />
        <line x1="205" y1="34" x2="214" y2="14" stroke="currentColor" strokeWidth="2" />
      </g>
      <Blocks blocks={[{ x: 250, w: 50, h: 30 }]} />
    </>
  ),
  // Sagrada Família — clustered, uneven tapering spires above tight city blocks.
  Barcelona: () => (
    <>
      <Blocks blocks={[{ x: 16, w: 220, h: 22 }, { x: 250, w: 40, h: 20 }]} />
      <g fill="currentColor">
        <polygon points="140,168 140,70 148,50 156,70 156,168" />
        <polygon points="160,168 160,50 170,26 180,50 180,168" />
        <polygon points="184,168 184,66 192,46 200,66 200,168" />
        <circle cx="148" cy="46" r="4" />
        <circle cx="170" cy="22" r="4.5" />
        <circle cx="192" cy="42" r="4" />
      </g>
    </>
  ),
};

export default function CityLandmark({ city, className = "" }: { city: string; className?: string }) {
  const mark = CITY_MARKS[city];
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      {mark?.()}
    </svg>
  );
}
