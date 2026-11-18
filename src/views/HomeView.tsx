import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Headphones,
  MapPin,
  Play,
  Search,
} from 'lucide-react';
import {
  DAILY_INSIGHT_APPROVED,
  EXAMPLE_QUESTIONS,
  TOPIC_SHORTCUTS,
  VERIFIED_CONFESSIONS,
} from '../data/verifiedMinistryData.ts';
import type { FeaturedSeries, LifeTopic, UnifiedResource } from '../types/platform.ts';
import type { NavTab } from '../components/HeaderNav.tsx';

interface HomeViewProps {
  recentSermons: UnifiedResource[];
  recentArticles: UnifiedResource[];
  featuredSeries: FeaturedSeries[];
  loadingOverview: boolean;
  onSearchSubmit: (query: string) => void;
  onSelectTopic: (topic: LifeTopic) => void;
  onOpenResource: (resource: UnifiedResource) => void;
  onPlayAudio: (resource: UnifiedResource) => void;
  onNavigate: (tab: NavTab) => void;
}

const SERMON_FALLBACK_PHOTOS = [
  'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6402-1024x683.jpg',
  'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6832-1024x683.jpg',
  'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A5147-1024x683.jpg',
];

export const HomeView: React.FC<HomeViewProps> = ({
  recentSermons,
  loadingOverview,
  onSearchSubmit,
  onSelectTopic,
  onOpenResource,
  onPlayAudio,
  onNavigate,
}) => {
  const [heroSearch, setHeroSearch] = useState('');

  const handleSearchForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(heroSearch.trim() || 'How do I develop my faith?');
  };

  const primaryConfessions = VERIFIED_CONFESSIONS.slice(0, 4);

  return (
    <div className="divide-y divide-[#E5E0D8]">
      {/* 1. FIRST: CLEAR EDITORIAL HERO WITH SENIOR PASTOR & MINISTRY CREST */}
      <section aria-labelledby="hero-headline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/aistudio/Screenshot_20261118_105039_Chrome_2123710a.jpg"
                alt="The Covenant Nation Emblem"
                className="w-10 h-10 rounded-md object-cover border border-[#D4CEC3] shrink-0"
              />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A5B25]">
                THE WORD, IN REAL LIFE · The Covenant Nation
              </p>
            </div>

            <h1
              id="hero-headline"
              className="font-editorial text-3xl sm:text-5xl lg:text-[52px] font-semibold text-[#181615] leading-[1.08] tracking-tight"
            >
              YOUR LIFE HAS QUESTIONS. THE WORD HAS WISDOM.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[#4A453F] leading-relaxed max-w-xl">
              Discover biblical insights that help you understand your faith, make better decisions,
              strengthen relationships, navigate challenges and live with purpose.
            </p>

            <p className="mt-3 text-xs font-medium text-[#6B655E]">
              Discover. Understand. Apply. Grow. — Teachings by Pastor Poju Oyemade &amp; The Covenant Nation.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('home-search-input');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.focus();
                  } else {
                    onNavigate('discover');
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] text-sm font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>FIND AN INSIGHT FOR TODAY</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('watch')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] text-sm font-semibold text-[#181615] bg-white border border-[#D4CEC3] hover:bg-[#EFECE6] rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>EXPLORE TEACHINGS</span>
              </button>
            </div>
          </div>

          {/* Senior Pastor Photography Anchor */}
          <div className="lg:col-span-5">
            <figure className="relative h-full min-h-[280px] lg:min-h-[400px] rounded-xl overflow-hidden border border-[#E5E0D8] bg-[#181615]">
              <img
                src="/assets/aistudio/Screenshot_20261118_105126_Chrome_32c56a99.jpg"
                alt="Pastor Poju Oyemade, Senior Pastor of The Covenant Nation, teaching the Word"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5">
                <p className="text-sm font-semibold text-white">Pastor Poju Oyemade</p>
                <p className="text-xs text-white/80">Senior Pastor &amp; Founder, The Covenant Nation</p>
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* 2. SECOND: THE SEARCH EXPERIENCE */}
      <section aria-labelledby="search-heading" className="bg-white/75">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2
              id="search-heading"
              className="font-editorial text-2xl sm:text-4xl font-semibold text-[#181615]"
            >
              WHAT&apos;S ON YOUR HEART TODAY?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#5C5750]">
              Search a question, topic, scripture or teaching.
            </p>
          </div>

          <form onSubmit={handleSearchForm}>
            <label htmlFor="home-search-input" className="sr-only">
              Search a question, topic, scripture or teaching
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-white border border-[#D4CEC3] rounded-lg shadow-sm focus-within:border-[#1D3557]">
              <div className="flex items-center flex-1 gap-3 px-3">
                <Search className="w-5 h-5 text-[#6B655E] shrink-0" aria-hidden="true" />
                <input
                  id="home-search-input"
                  type="search"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Ask a life question, e.g. How do I overcome fear? or Romans 5:3"
                  className="w-full py-2.5 text-base text-[#181615] placeholder:text-[#8A837A] bg-transparent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 min-h-[44px] text-sm font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Find Insight
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {EXAMPLE_QUESTIONS.slice(0, 4).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onSearchSubmit(q)}
                className="px-3.5 py-2 min-h-[38px] text-xs sm:text-sm text-[#181615] bg-[#F9F7F3] border border-[#E5E0D8] hover:border-[#1D3557] hover:text-[#1D3557] rounded-md transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THIRD: EXPLORE BY TOPIC */}
      <section aria-labelledby="topics-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 id="topics-heading" className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181615]">
              Explore by Topic
            </h2>
            <p className="text-sm text-[#5C5750] mt-1">
              Practical biblical wisdom organised around everyday life.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('discover')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1D3557] hover:underline shrink-0 cursor-pointer"
          >
            <span>All topics</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {TOPIC_SHORTCUTS.map((item) => (
            <button
              key={item.topic}
              type="button"
              onClick={() => onSelectTopic(item.topic)}
              className="text-left p-4 sm:p-5 bg-white border border-[#E5E0D8] hover:border-[#1D3557] rounded-lg transition-colors flex flex-col justify-between gap-2 cursor-pointer"
            >
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#181615]">{item.topic}</h3>
                <p className="text-xs sm:text-sm text-[#5C5750] mt-1 line-clamp-2">{item.description}</p>
              </div>
              <span className="text-[11px] font-medium text-[#9A5B25]">{item.scripture}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. FOURTH: FEATURED TEACHINGS WITH MINISTRY PHOTOGRAPHY */}
      <section aria-labelledby="featured-heading" className="bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 id="featured-heading" className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181615]">
                Featured Teachings
              </h2>
              <p className="text-sm text-[#5C5750] mt-1">
                Recent sermons and messages ready to listen or study.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('watch')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#1D3557] hover:underline shrink-0 cursor-pointer"
            >
              <span>Watch &amp; Listen</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {loadingOverview ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 bg-[#EFECE6] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentSermons.slice(0, 3).map((sermon, idx) => (
                <article
                  key={sermon.id}
                  className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] bg-[#EFECE6] overflow-hidden">
                      <img
                        src={sermon.imageUrl || SERMON_FALLBACK_PHOTOS[idx % SERMON_FALLBACK_PHOTOS.length]}
                        alt={sermon.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            SERMON_FALLBACK_PHOTOS[idx % SERMON_FALLBACK_PHOTOS.length];
                        }}
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-[#6B655E] tabular-nums mb-1.5">
                        {sermon.speakerOrAuthor} · {sermon.date || 'Recent'}
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenResource(sermon)}
                        className="text-left text-lg font-semibold text-[#181615] hover:text-[#1D3557] transition-colors line-clamp-2 cursor-pointer"
                      >
                        {sermon.title}
                      </button>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-[#F0ECE4] flex items-center justify-between">
                    {sermon.mediaUrl || sermon.fallbackMediaUrl ? (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(sermon)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3557] hover:underline min-h-[36px] cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Listen{sermon.fileSize ? ` (${sermon.fileSize})` : ''}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-[#6B655E]">E-Library Teaching</span>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenResource(sermon)}
                      className="text-xs font-medium text-[#5C5750] hover:text-[#181615] cursor-pointer"
                    >
                      Open →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. FIFTH: DAILY INSIGHT */}
      <section aria-labelledby="daily-insight-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#EFECE6]/70 border border-[#E5E0D8] rounded-xl p-6 sm:p-8">
          <div className="lg:col-span-7 space-y-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
              Daily Insight · {DAILY_INSIGHT_APPROVED.scriptureReference}
            </p>
            <h2 id="daily-insight-heading" className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181615]">
              {DAILY_INSIGHT_APPROVED.title}
            </h2>
            <blockquote className="font-editorial italic text-lg text-[#2B2825] py-2.5 border-y border-[#D4CEC3]">
              {DAILY_INSIGHT_APPROVED.scriptureText}
            </blockquote>
            <p className="text-sm sm:text-base text-[#4A453F] leading-relaxed">
              {DAILY_INSIGHT_APPROVED.reflection}
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onSearchSubmit(DAILY_INSIGHT_APPROVED.relatedQuery)}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                <span>Explore Related Teachings</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#E5E0D8] bg-white">
              <img
                src="https://insightsforliving.org/wp-content/uploads/2022/09/IMG_1418-1024x683.jpg"
                alt="Worship gathering at The Covenant Nation"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    '/src/assets/images/pastor_teaching_study_1794994745648.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. SIXTH: CONFESSIONS AND GROWTH */}
      <section aria-labelledby="confessions-growth-heading" className="bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
                Speak &amp; Grow
              </p>
              <h2
                id="confessions-growth-heading"
                className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181615]"
              >
                Confessions &amp; Spiritual Growth
              </h2>
              <p className="text-sm text-[#5C5750] leading-relaxed">
                Read and download official Covenant Nation confessions, daily declarations, and the Bible Study Manual.
              </p>
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#E5E0D8] bg-[#EFECE6]">
                <img
                  src="https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6991-1024x683.jpg"
                  alt="Congregation in prayer and declaration at The Covenant Nation"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/src/assets/images/featured_worship_gathering_1794994745677.jpg';
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <div className="divide-y divide-[#E5E0D8] bg-white border border-[#E5E0D8] rounded-lg">
                {primaryConfessions.map((conf) => (
                  <div key={conf.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-[#6B655E]">
                        {conf.category} · {conf.format}
                      </p>
                      <h3 className="text-base font-semibold text-[#181615] truncate">{conf.title}</h3>
                    </div>
                    <a
                      href={conf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-[#1D3557] bg-[#F9F7F3] border border-[#E5E0D8] hover:border-[#1D3557] rounded-md shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Open</span>
                    </a>
                  </div>
                ))}
              </div>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onNavigate('grow')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D3557] hover:underline cursor-pointer"
                >
                  <span>Explore all 13 confessions &amp; manuals</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SEVENTH: CONNECT WITH THE MINISTRY */}
      <section aria-labelledby="connect-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#E5E0D8] bg-[#EFECE6]">
              <img
                src="https://insightsforliving.org/wp-content/uploads/2021/01/6Z7A2351-1024x683.jpg"
                alt="Warm church community worshipping together at The Covenant Nation"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    '/src/assets/images/community_fellowship_table_1794994747520.jpg';
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
                Connect With Us
              </p>
              <h2 id="connect-heading" className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181615] mt-1">
                Worship In Person or Join Online
              </h2>
              <p className="text-sm sm:text-base text-[#5C5750] mt-2 leading-relaxed">
                Find any of our 40 centres across Nigeria, the UK, Ireland, Canada, and New York, tune into broadcasts, or take your next step in fellowship.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <button
                type="button"
                onClick={() => onNavigate('connect')}
                className="text-left p-4 bg-white border border-[#E5E0D8] hover:border-[#1D3557] rounded-lg transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#1D3557] mb-2" aria-hidden="true" />
                <p className="text-sm font-semibold text-[#181615]">Church Centres</p>
                <p className="text-xs text-[#6B655E] mt-1">Service times &amp; directions</p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('watch')}
                className="text-left p-4 bg-white border border-[#E5E0D8] hover:border-[#1D3557] rounded-lg transition-colors cursor-pointer"
              >
                <Headphones className="w-4 h-4 text-[#1D3557] mb-2" aria-hidden="true" />
                <p className="text-sm font-semibold text-[#181615]">Podcasts &amp; Live</p>
                <p className="text-xs text-[#6B655E] mt-1">Mixlr, YouTube &amp; RSS</p>
              </button>

              <a
                href="https://insightsforliving.org/giving"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left p-4 bg-white border border-[#E5E0D8] hover:border-[#9A5B25] rounded-lg transition-colors block"
              >
                <BookOpen className="w-4 h-4 text-[#9A5B25] mb-2" aria-hidden="true" />
                <p className="text-sm font-semibold text-[#181615]">Giving</p>
                <p className="text-xs text-[#6B655E] mt-1">Support ministry outreach →</p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
