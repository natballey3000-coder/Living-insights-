import React, { useMemo, useState } from 'react';
import { ExternalLink, MapPin, Navigation, Search, ShieldCheck } from 'lucide-react';
import { VERIFIED_CENTRES, VERIFIED_PATHWAYS } from '../data/verifiedMinistryData.ts';

const REGIONS = [
  'All Regions',
  'Lagos',
  'Abuja',
  'Other Nigeria',
  'United Kingdom & Europe',
  'North America',
] as const;

export const ConnectView: React.FC = () => {
  const [regionFilter, setRegionFilter] = useState<string>('All Regions');
  const [centreSearch, setCentreSearch] = useState('');
  const [pathwayFilter, setPathwayFilter] = useState<string>('All');

  const filteredCentres = useMemo(() => {
    const q = centreSearch.trim().toLowerCase();
    return VERIFIED_CENTRES.filter((ctr) => {
      const matchesRegion = regionFilter === 'All Regions' || ctr.region === regionFilter;
      const matchesQuery =
        !q ||
        ctr.name.toLowerCase().includes(q) ||
        ctr.city.toLowerCase().includes(q) ||
        ctr.venue.toLowerCase().includes(q);
      return matchesRegion && matchesQuery;
    });
  }, [regionFilter, centreSearch]);

  const filteredPathways = useMemo(() => {
    if (pathwayFilter === 'All') return VERIFIED_PATHWAYS;
    return VERIFIED_PATHWAYS.filter((p) => p.category === pathwayFilter);
  }, [pathwayFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Header with Sanctuary Photography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#E5E0D8] pb-8">
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/Screenshot_20261118_105039_Chrome_2123710a.jpg"
              alt="The Covenant Nation Crest"
              className="w-8 h-8 rounded object-cover border border-[#D4CEC3]"
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
              Connect with The Covenant Nation
            </p>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#181615]">
            Find a Church Centre, First-Timer Welcome &amp; Ministry Forms
          </h1>
          <p className="text-sm sm:text-base text-[#5C5750] leading-relaxed">
            Locate verified Sunday service venues across Nigeria, the UK, Ireland, Canada, and New York, or submit official pastoral requests directly.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="aspect-[16/10] rounded-xl overflow-hidden border border-[#E5E0D8] bg-[#EFECE6]">
            <img
              src="https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A5147-1024x683.jpg"
              alt="Sunday worship gathering at The Covenant Nation"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/src/assets/images/community_fellowship_table_1794994747520.jpg';
              }}
            />
          </div>
        </div>
      </div>

      {/* First-Time Visitor Orientation Strip */}
      <section
        aria-labelledby="first-timer-heading"
        className="bg-[#EFECE6]/70 border border-[#E5E0D8] rounded-xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
      >
        <div className="lg:col-span-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
            New to The Covenant Nation?
          </p>
          <h2 id="first-timer-heading" className="font-editorial text-2xl font-semibold text-[#181615]">
            Thank You for Worshipping With Us
          </h2>
          <p className="text-sm text-[#4A453F] leading-relaxed">
            “God setteth the solitary in families...” (Psalm 68:6). Whether you joined online or at one of our 40 centres, our Welcome Team would love to pray with you, answer your questions, and help you get settled in Foundation of Faith and Life Fellowships.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSc5emKhzXBSNkeCFQAmFPIIm02WylqbZtxcIfcUG6aTxbyoaQ/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md"
            >
              <span>First-Time Visitor Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://insightsforliving.org/first-timer/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] text-xs font-semibold text-[#181615] bg-white border border-[#D4CEC3] hover:bg-[#F9F7F3] rounded-md"
            >
              <span>First-Timer Guide</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#E5E0D8] bg-white">
            <img
              src="https://insightsforliving.org/wp-content/uploads/2021/01/6Z7A2348-1024x683.jpg"
              alt="Congregation welcoming visitors at The Covenant Nation"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/src/assets/images/featured_worship_gathering_1794994745677.jpg';
              }}
            />
          </div>
        </div>
      </section>

      {/* Church Centre Finder */}
      <section aria-labelledby="centres-heading" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 id="centres-heading" className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181615]">
              Church Centres &amp; Service Times
            </h2>
            <p className="text-sm text-[#5C5750] mt-1">
              Verified locations and service schedules sourced from The Covenant Nation Centres directory.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <label htmlFor="centre-search" className="sr-only">
              Search church centre by city, neighbourhood, or name
            </label>
            <Search className="w-4 h-4 text-[#6B655E] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="centre-search"
              type="search"
              value={centreSearch}
              onChange={(e) => setCentreSearch(e.target.value)}
              placeholder="Search city or centre (e.g. Iganmu, Abuja, London)"
              className="w-full pl-9 pr-4 py-2.5 min-h-[44px] text-sm bg-white border border-[#D4CEC3] rounded-md focus:outline-none focus:border-[#1D3557]"
            />
          </div>
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {REGIONS.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setRegionFilter(reg)}
              className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                regionFilter === reg
                  ? 'bg-[#1D3557] text-white'
                  : 'bg-white border border-[#E5E0D8] text-[#4A453F] hover:border-[#1D3557]'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        {filteredCentres.length === 0 ? (
          <div className="p-8 bg-white border border-[#E5E0D8] rounded-lg text-center">
            <p className="text-sm text-[#5C5750]">
              No church centres matched “{centreSearch}”. Try searching Lagos, Abuja, London, Birmingham, Toronto, or New York.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCentres.map((ctr) => (
              <article
                key={ctr.id}
                className="bg-white border border-[#E5E0D8] rounded-lg p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#6B655E]">
                    <span className="font-semibold text-[#9A5B25]">{ctr.region}</span>
                    <span>{ctr.city}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#181615] flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#1D3557] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{ctr.name}</span>
                  </h3>
                  <p className="text-sm text-[#5C5750] leading-relaxed">{ctr.venue}</p>
                  <div className="pt-1 space-y-1">
                    {ctr.serviceTimes.map((time) => (
                      <p key={time} className="text-xs font-medium text-[#181615] tabular-nums">
                        {time}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F0ECE4] flex items-center justify-between gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ctr.directionsQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3557] hover:underline min-h-[36px]"
                  >
                    <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Get Directions</span>
                  </a>
                  {ctr.instagramUrl && (
                    <a
                      href={ctr.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#6B655E] hover:text-[#181615]"
                    >
                      Instagram →
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Official Forms & Service Pathways */}
      <section aria-labelledby="forms-heading" className="pt-8 border-t border-[#E5E0D8] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 id="forms-heading" className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181615]">
              Official Forms &amp; Pastoral Pathways
            </h2>
            <p className="text-sm text-[#5C5750] mt-1">
              All original submission pathways are preserved directly so your requests reach the right ministry team securely.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Spiritual Milestone', 'Family & Marriage', 'Community & Growth', 'Ministry Service & Support'].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setPathwayFilter(cat)}
                className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  pathwayFilter === cat
                    ? 'bg-[#181615] text-white'
                    : 'bg-white border border-[#E5E0D8] text-[#4A453F] hover:border-[#181615]'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPathways.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#E5E0D8] rounded-lg p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-[#6B655E]">
                  <span className="font-semibold text-[#9A5B25]">{p.category}</span>
                  <span>{p.status}</span>
                </div>
                <h3 className="text-base font-semibold text-[#181615] mt-1.5">{p.title}</h3>
                <p className="text-sm text-[#5C5750] mt-1.5 leading-relaxed">{p.description}</p>
              </div>

              <div className="pt-3 border-t border-[#F0ECE4] space-y-2">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3557] hover:underline"
                >
                  <span>{p.actionLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[11px] text-[#6B655E] flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5C5750] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{p.privacyNote}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
