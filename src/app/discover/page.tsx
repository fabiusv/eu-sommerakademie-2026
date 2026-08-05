import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { CategoryTileFlat, CommunityCard, CityTile } from "@/components/cards";
import { categories, communities, cities, regions } from "@/lib/data";

export const metadata = {
  title: "Discover Events — luma",
};

export default function DiscoverPage() {
  return (
    <>
      <NavBar variant="app" />
      <main className="flex-1">
        <div className="mx-auto max-w-[820px] px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="text-[28px] font-semibold text-white tracking-[0.4px]">Discover Events</h1>
          <p className="mt-2 text-[16px] leading-[24px] text-white/79 tracking-[-0.32px]">
            Explore popular events near you, browse by category, or check out some of the great
            community calendars.
          </p>

          <section className="mt-10">
            <h2 className="mb-4 text-[20px] font-semibold text-white tracking-[-0.46px]">
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {categories.map((category) => (
                <CategoryTileFlat key={category.slug} category={category} />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-[20px] font-semibold text-white tracking-[-0.46px]">
              Featured Calendars
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {communities.map((community) => (
                <CommunityCard key={community.title} community={community} showFollow />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-[20px] font-semibold text-white tracking-[-0.46px]">
              Explore Local Events
            </h2>
            <div className="flex flex-wrap gap-1 border-b border-white/8 pb-4">
              {regions.map((region, i) => (
                <button
                  key={region}
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-[14px] font-medium tracking-[-0.154px] transition-colors ${
                    i === 0 ? "bg-white/8 text-white" : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-2 sm:grid-cols-4">
              {cities.map((city) => (
                <CityTile key={city.name} city={city} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
