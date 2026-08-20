import type { EventCategory } from "@/lib/events-data";
import { CategoryIcon } from "./icons";

// Soft bloom positions cards rotate through, borrowed from the same idea as the
// homepage's UpcomingEvents glow — kept in white/blue here (not gold) so yellow stays
// reserved for the one Featured card, per the brand's "yellow is rare" rule.
const GLOW_POSITIONS = ["85% 12%", "12% 85%", "88% 88%", "10% 12%", "80% 78%", "18% 20%", "50% 10%", "50% 90%"];

function glowStyle(index: number, featured: boolean) {
  // Yellow and navy are near-complementary — any translucent gold wash over this
  // gradient desaturates into a muddy olive rather than reading as an accent. So the
  // featured card's glow stays the same cool white tone as every other card; yellow is
  // reserved for the opaque badge pill and arrow button instead (small, deliberate, per
  // the brand's "yellow is rare" rule), not smeared across the background.
  const pos = featured ? "18% 90%" : GLOW_POSITIONS[index % GLOW_POSITIONS.length];
  return {
    backgroundImage: `radial-gradient(120% 120% at ${pos}, color-mix(in srgb, white 20%, transparent) 0%, transparent 55%)`,
  };
}

export default function EventArt({
  category,
  index,
  featured = false,
  className = "",
}: {
  category: EventCategory;
  index: number;
  featured?: boolean;
  className?: string;
}) {
  // `className` is expected to carry the positioning (both call sites pass `absolute
  // inset-0`) — no `relative` baked in here, since Tailwind resolves conflicting
  // position utilities by generation order, not by string order, and `relative` would
  // otherwise win and collapse this to a zero-height flex child.
  return (
    <div className={`overflow-hidden bg-gradient-to-br from-[#00194f] to-eu-blue ${className}`}>
      {/* Glow lives in its own layer — an inline `background-image` here would silently
          overwrite the `bg-gradient-to-br` class above, since inline styles always win
          over stylesheet rules on the same property regardless of specificity. */}
      <div className="absolute inset-0" style={glowStyle(index, featured)} />
      <CategoryIcon
        category={category}
        className={`absolute -right-6 -bottom-6 text-white/15 transition-transform duration-500 ease-out group-hover:scale-105 ${
          featured ? "size-40 lg:size-56" : "size-32"
        }`}
      />
      <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-black/20 to-transparent" />
    </div>
  );
}
