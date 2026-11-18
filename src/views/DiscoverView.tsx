import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Filter,
  Play,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { EXAMPLE_QUESTIONS, TOPIC_SHORTCUTS } from '../data/verifiedMinistryData.ts';
import type { LifeTopic, ResourceType, SearchResponse, UnifiedResource } from '../types/platform.ts';

interface DiscoverViewProps {
  initialQuery: string;
  initialTopic: LifeTopic | 'all';
  onOpenResource: (resource: UnifiedResource) => void;
  onPlayAudio: (resource: UnifiedResource) => void;
}

const TYPE_TABS: Array<{ id: ResourceType | 'all'; label: string }> = [
  { id: 'all', label: 'All Resources' },
  { id: 'sermon', label: 'Sermons' },
  { id: 'video', label: 'Videos' },
  { id: 'article', label: 'Articles' },
  { id: 'podcast', label: 'Podcasts' },
  { id: 'confession', label: 'Confessions' },
  { id: 'pathway', label: 'Pathways' },
  { id: 'centre', label: 'Centres' },
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  initialQuery,
  initialTopic,
  onOpenResource,
  onPlayAudio,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<LifeTopic | 'all'>(initialTopic);
  const [speakerFilter, setSpeakerFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingIndex, setRefreshingIndex] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
    setSubmittedQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setTopicFilter(initialTopic);
  }, [initialTopic]);

  const runSearch = async (
    qVal: string,
    tVal: ResourceType | 'all',
    topVal: LifeTopic | 'all',
    spVal: string,
    yrVal: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (qVal.trim()) params.set('q', qVal.trim());
      if (tVal !== 'all') params.set('type', tVal);
      if (topVal !== 'all') params.set('topic', topVal);
      if (spVal !== 'all') params.set('speaker', spVal);
      if (yrVal !== 'all') params.set('year', yrVal);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search request failed.');
      const json = (await res.json()) as SearchResponse;
      setData(json);
    } catch {
      setError('Unable to reach the search index right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(submittedQuery, typeFilter, topicFilter, speakerFilter, yearFilter);
  }, [submittedQuery, typeFilter, topicFilter, speakerFilter, yearFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(query);
  };

  const handleRefreshIndex = async () => {
    setRefreshingIndex(true);
    try {
      await fetch('/api/index/refresh', { method: 'POST' });
      await runSearch(submittedQuery, typeFilter, topicFilter, speakerFilter, yearFilter);
    } finally {
      setRefreshingIndex(false);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setSubmittedQuery('');
    setTypeFilter('all');
    setTopicFilter('all');
    setSpeakerFilter('all');
    setYearFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Search Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
          Search &amp; Discovery Engine
        </p>
        <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#181615] mt-1">
          WHAT&apos;S ON YOUR HEART TODAY?
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#5C5750]">
          Search a question, topic, scripture or teaching across sermons, 215+ archived articles, podcasts, confessions, and ministry pathways.
        </p>
      </div>

      {/* Prominent Search Box */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-white border border-[#D4CEC3] rounded-lg focus-within:border-[#1D3557]">
          <div className="flex items-center flex-1 gap-3 px-3">
            <Search className="w-5 h-5 text-[#6B655E] shrink-0" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search a question, topic, scripture or teaching"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a life question, e.g. How do I develop my faith? or Romans 5:3"
              className="w-full py-2.5 text-base text-[#181615] placeholder:text-[#8A837A] bg-transparent focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSubmittedQuery('');
                }}
                aria-label="Clear search text"
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-[#6B655E] hover:text-[#181615] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 min-h-[44px] text-sm font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Search Archive
          </button>
        </div>
      </form>

      {/* Quick Questions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[#6B655E]">Try:</span>
        {EXAMPLE_QUESTIONS.slice(0, 4).map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setQuery(q);
              setSubmittedQuery(q);
            }}
            className="text-xs px-3 py-1.5 min-h-[36px] bg-white border border-[#E5E0D8] hover:border-[#1D3557] rounded text-[#4A453F] cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Resource Type Tabs & Filter Toggle */}
      <div className="mt-6 pt-5 border-t border-[#E5E0D8] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                typeFilter === tab.id
                  ? 'bg-[#1D3557] text-white'
                  : 'bg-white border border-[#E5E0D8] text-[#4A453F] hover:border-[#1D3557]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold bg-white border border-[#E5E0D8] hover:border-[#1D3557] rounded-md text-[#181615] cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Topic, Speaker &amp; Date Filters</span>
          </button>

          <button
            type="button"
            onClick={handleRefreshIndex}
            disabled={refreshingIndex}
            title="Refresh live content index from WordPress, E-Library, and Podcast feeds"
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-[#5C5750] hover:text-[#181615] bg-white border border-[#E5E0D8] rounded-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshingIndex ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">Refresh Index</span>
          </button>
        </div>
      </div>

      {/* Expandable Facet Filters */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white border border-[#E5E0D8] rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="topic-select" className="block text-xs font-semibold text-[#5C5750] mb-1.5">
              Life Topic
            </label>
            <select
              id="topic-select"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value as LifeTopic | 'all')}
              className="w-full px-3 py-2 min-h-[42px] text-sm bg-[#F9F7F3] border border-[#D4CEC3] rounded-md"
            >
              <option value="all">All Topics</option>
              {TOPIC_SHORTCUTS.map((t) => (
                <option key={t.topic} value={t.topic}>
                  {t.topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="speaker-select" className="block text-xs font-semibold text-[#5C5750] mb-1.5">
              Speaker / Source
            </label>
            <select
              id="speaker-select"
              value={speakerFilter}
              onChange={(e) => setSpeakerFilter(e.target.value)}
              className="w-full px-3 py-2 min-h-[42px] text-sm bg-[#F9F7F3] border border-[#D4CEC3] rounded-md"
            >
              <option value="all">All Speakers &amp; Authors</option>
              {(data?.availableFilters.speakers || []).map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="year-select" className="block text-xs font-semibold text-[#5C5750] mb-1.5">
              Publication Year
            </label>
            <select
              id="year-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 min-h-[42px] text-sm bg-[#F9F7F3] border border-[#D4CEC3] rounded-md"
            >
              <option value="all">All Years (2016–2026)</option>
              {(data?.availableFilters.years || []).map((yr) => (
                <option key={yr} value={String(yr)}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Summary */}
      {(submittedQuery || typeFilter !== 'all' || topicFilter !== 'all' || speakerFilter !== 'all' || yearFilter !== 'all') && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5750]">
          <p>
            {data ? (
              <>
                Showing <span className="font-semibold text-[#181615] tabular-nums">{data.total}</span>{' '}
                verified result{data.total === 1 ? '' : 's'}
                {submittedQuery ? ` for “${submittedQuery}”` : ''}
                {topicFilter !== 'all' ? ` · Topic: ${topicFilter}` : ''}
                {data.detectedScriptures.length > 0
                  ? ` · Scripture detected: ${data.detectedScriptures.join(', ')}`
                  : ''}
              </>
            ) : (
              'Searching...'
            )}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-[#1D3557] hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Results List */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-[#EFECE6] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-white border border-[#E5E0D8] rounded-lg text-sm text-[#181615]">
            <p>{error}</p>
          </div>
        ) : data && data.results.length === 0 ? (
          <div className="p-8 bg-white border border-[#E5E0D8] rounded-lg text-center space-y-4">
            <h2 className="font-editorial text-2xl font-semibold text-[#181615]">
              No direct matches found for “{submittedQuery}”
            </h2>
            <p className="text-sm text-[#5C5750] max-w-lg mx-auto">
              We searched our indexed sermons, articles, podcasts, and confessions and did not find an exact match. Try broadening your question or exploring one of these common topics:
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {data.suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setQuery(sug);
                    setSubmittedQuery(sug);
                    setTypeFilter('all');
                    setTopicFilter('all');
                  }}
                  className="px-4 py-2 min-h-[40px] text-xs font-semibold bg-[#F9F7F3] border border-[#D4CEC3] hover:border-[#1D3557] rounded-md cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {(data?.results || []).map((item) => (
              <article
                key={item.id}
                className="p-5 sm:p-6 bg-white border border-[#E5E0D8] hover:border-[#C5BEB2] rounded-lg transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B655E]">
                      <span className="font-semibold uppercase tracking-wider text-[#9A5B25]">
                        {item.categoryLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.speakerOrAuthor}</span>
                      {item.date && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{item.date}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{item.topics[0]}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenResource(item)}
                      className="text-left font-editorial text-xl sm:text-2xl font-semibold text-[#181615] hover:text-[#1D3557] transition-colors block cursor-pointer"
                    >
                      {item.title}
                    </button>

                    <p className="text-sm text-[#4A453F] leading-relaxed line-clamp-2 max-w-3xl">
                      {item.summary}
                    </p>

                    {item.matchReasons.length > 0 && (
                      <p className="text-xs text-[#5C5750] pt-1">
                        <span className="font-semibold text-[#1D3557]">Why this matches:</span>{' '}
                        {item.matchReasons.join(' · ')}
                      </p>
                    )}

                    {item.scriptures.length > 0 && (
                      <p className="text-xs text-[#6B655E] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#9A5B25] shrink-0" aria-hidden="true" />
                        <span>Scriptures: {item.scriptures.slice(0, 4).join(', ')}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    {(item.mediaUrl || item.fallbackMediaUrl) && (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(item)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{item.type === 'video' ? 'Audio Alt' : 'Listen'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenResource(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-semibold text-[#181615] bg-[#F9F7F3] border border-[#D4CEC3] hover:bg-[#EFECE6] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <span>Open Teaching</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
