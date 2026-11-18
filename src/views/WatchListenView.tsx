import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Headphones,
  Play,
  Radio,
  Tv,
} from 'lucide-react';
import type { FeaturedSeries, StreamStatus, UnifiedResource } from '../types/platform.ts';

interface WatchListenViewProps {
  recentSermons: UnifiedResource[];
  recentVideos: UnifiedResource[];
  recentPodcasts: UnifiedResource[];
  featuredSeries: FeaturedSeries[];
  categories: Array<{ id: string; name: string; topic: string; description: string }>;
  onPlayAudio: (resource: UnifiedResource) => void;
  onOpenResource: (resource: UnifiedResource) => void;
}

export const WatchListenView: React.FC<WatchListenViewProps> = ({
  recentSermons,
  recentVideos,
  recentPodcasts,
  featuredSeries,
  categories,
  onPlayAudio,
  onOpenResource,
}) => {
  const [subTab, setSubTab] = useState<'sermons' | 'videos' | 'podcasts' | 'streams'>('sermons');
  const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
  const [loadingStreams, setLoadingStreams] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('recent');
  const [categoryMessages, setCategoryMessages] = useState<UnifiedResource[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);

  const [activeVideo, setActiveVideo] = useState<UnifiedResource | null>(null);
  const [showMixlrEmbed, setShowMixlrEmbed] = useState(false);
  const [showVideoEmbed, setShowVideoEmbed] = useState(false);

  useEffect(() => {
    fetch('/api/streams/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setStreamStatus(d);
      })
      .catch(() => {})
      .finally(() => setLoadingStreams(false));
  }, []);

  const handleCategoryChange = async (catId: string) => {
    setSelectedCategoryId(catId);
    if (catId === 'recent') {
      setCategoryMessages([]);
      return;
    }
    setLoadingCategory(true);
    try {
      const res = await fetch(`/api/elibrary/categories/${encodeURIComponent(catId)}`);
      if (res.ok) {
        const json = await res.json();
        setCategoryMessages(Array.isArray(json.messages) ? json.messages : []);
      }
    } catch {
      setCategoryMessages([]);
    } finally {
      setLoadingCategory(false);
    }
  };

  const displayedSermons = selectedCategoryId === 'recent' ? recentSermons : categoryMessages;
  const selectedInlineVideo = activeVideo || recentVideos[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E5E0D8] pb-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
            Watch &amp; Listen
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#181615] mt-1">
            Sermons, Videos, Podcasts &amp; Broadcasts
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[#5C5750]">
            Stream audio sermons reliably through our resilient player, watch official video services, or switch to a matching podcast/audio alternative whenever video embeds are restricted.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="https://elibrary.insightsforliving.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-semibold bg-white border border-[#D4CEC3] hover:border-[#1D3557] rounded-md text-[#181615]"
          >
            <span>Open E-Library Home</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSubTab('sermons')}
          className={`px-4 py-2.5 min-h-[44px] text-xs font-semibold rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            subTab === 'sermons'
              ? 'bg-[#1D3557] text-white'
              : 'bg-white border border-[#E5E0D8] text-[#4A453F] hover:border-[#1D3557]'
          }`}
        >
          E-Library Sermons
        </button>
        <button
          type="button"
          onClick={() => setSubTab('videos')}
          className={`px-4 py-2.5 min-h-[44px] text-xs font-semibold rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            subTab === 'videos'
              ? 'bg-[#1D3557] text-white'
              : 'bg-white border border-[#E5E0D8] text-[#4A453F] hover:border-[#1D3557]'
          }`}
        >
          Video Teachings
        </button>
        <button
          type="button"
          onClick={() => setSubTab('podcasts')}
          className={`px-4 py-2.5 min-h-[44px] text-xs font-semibold rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            subTab === 'podcasts'
              ? 'bg-[#1D3557] text-white'
              : 'bg-white border border-[#E5E0D8] text-[#4A453F] hover:border-[#1D3557]'
          }`}
        >
          Insights Podcasts
        </button>
        <button
          type="button"
          onClick={() => setSubTab('streams')}
          className={`px-4 py-2.5 min-h-[44px] text-xs font-semibold rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            subTab === 'streams'
              ? 'bg-[#1D3557] text-white'
              : 'bg-white border border-[#E5E0D8] text-[#4A453F] hover:border-[#1D3557]'
          }`}
        >
          Radio &amp; Livestreams
        </button>
      </div>

      {/* TAB 1: E-LIBRARY SERMONS */}
      {subTab === 'sermons' && (
        <div className="space-y-8">
          {/* Category Chips / Selector */}
          <div className="space-y-2.5">
            <label htmlFor="elib-category" className="block text-xs font-semibold uppercase tracking-wider text-[#6B655E]">
              Browse E-Library Series &amp; Conferences
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('recent')}
                className={`px-3.5 py-2 min-h-[40px] text-xs font-medium rounded-md cursor-pointer transition-colors ${
                  selectedCategoryId === 'recent'
                    ? 'bg-[#181615] text-white'
                    : 'bg-white border border-[#E5E0D8] text-[#4A453F] hover:border-[#181615]'
                }`}
              >
                Latest Teachings
              </button>
              {categories.slice(0, 14).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3.5 py-2 min-h-[40px] text-xs font-medium rounded-md cursor-pointer transition-colors ${
                    selectedCategoryId === cat.id
                      ? 'bg-[#181615] text-white'
                      : 'bg-white border border-[#E5E0D8] text-[#4A453F] hover:border-[#181615]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {loadingCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-[#EFECE6] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedSermons.map((sermon, idx) => {
                const fallbackPhotos = [
                  'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6402-1024x683.jpg',
                  'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6832-1024x683.jpg',
                  'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A5147-1024x683.jpg',
                  'https://insightsforliving.org/wp-content/uploads/2021/01/6Z7A2351-1024x683.jpg',
                ];
                const fallbackImg = fallbackPhotos[idx % fallbackPhotos.length];
                return (
                <div
                  key={sermon.id}
                  className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/9] bg-[#EFECE6] overflow-hidden">
                      <img
                        src={sermon.imageUrl || fallbackImg}
                        alt={sermon.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackImg;
                        }}
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-[#6B655E] mb-2">
                        <span>{sermon.isFree === false ? `Paid (${sermon.price})` : 'Free Audio'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{sermon.date || 'Archive'}</span>
                        {sermon.fileSize && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{sermon.fileSize}</span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenResource(sermon)}
                        className="text-left text-lg font-semibold text-[#181615] hover:text-[#1D3557] transition-colors line-clamp-2 cursor-pointer"
                      >
                        {sermon.title}
                      </button>
                      <p className="text-sm text-[#5C5750] mt-1">{sermon.speakerOrAuthor}</p>
                      <p className="text-xs text-[#6B655E] mt-2 line-clamp-2">{sermon.summary}</p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-[#F0ECE4] flex items-center justify-between gap-2">
                    {sermon.mediaUrl || sermon.fallbackMediaUrl ? (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(sermon)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Play Audio</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenResource(sermon)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3557] hover:underline cursor-pointer"
                      >
                        <span>Open Teaching</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenResource(sermon)}
                      className="text-xs font-medium text-[#5C5750] hover:text-[#181615] cursor-pointer"
                    >
                      Notes &amp; Alternatives →
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          )}

          {featuredSeries.length > 0 && (
            <div className="pt-6 border-t border-[#E5E0D8]">
              <h2 className="font-editorial text-2xl font-semibold text-[#181615] mb-4">
                Featured E-Library Collections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredSeries.map((series, idx) => {
                  const seriesPhotos = [
                    'https://insightsforliving.org/wp-content/uploads/2023/11/wofbec-banner.jpeg',
                    'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6402-1024x683.jpg',
                    'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6832-1024x683.jpg',
                    'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A5147-1024x683.jpg',
                    'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6991-1024x683.jpg',
                    'https://insightsforliving.org/wp-content/uploads/2021/01/6Z7A2351-1024x683.jpg',
                  ];
                  const fallbackBanner = seriesPhotos[idx % seriesPhotos.length];
                  return (
                    <button
                      key={series.title}
                      type="button"
                      onClick={() => {
                        if (series.categoryId) {
                          handleCategoryChange(series.categoryId);
                          window.scrollTo({ top: 180, behavior: 'smooth' });
                        }
                      }}
                      className="text-left bg-white border border-[#E5E0D8] hover:border-[#1D3557] rounded-lg overflow-hidden flex flex-col justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="aspect-[16/9] bg-[#EFECE6] overflow-hidden">
                          <img
                            src={series.messages[0]?.bannerUrl || fallbackBanner}
                            alt={series.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = fallbackBanner;
                            }}
                          />
                        </div>
                        <div className="p-5">
                          <p className="text-xs text-[#9A5B25] font-semibold uppercase tracking-wider">
                            Conference Collection
                          </p>
                          <h3 className="text-lg font-semibold text-[#181615] mt-1">{series.title}</h3>
                          <p className="text-sm text-[#5C5750] mt-1 line-clamp-2">
                            {series.messages[0]?.description || 'Load all teachings from this Covenant Nation conference collection.'}
                          </p>
                        </div>
                      </div>
                      <span className="px-5 pb-5 inline-flex items-center gap-1 text-xs font-semibold text-[#1D3557]">
                        <span>Browse Collection In-App →</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1B: VIDEO TEACHINGS WITH PRIVACY EMBED + AUDIO FALLBACK */}
      {subTab === 'videos' && (
        <div className="space-y-8">
          {selectedInlineVideo ? (
            <div className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden">
              <div className="aspect-video w-full bg-[#181615]">
                <iframe
                  key={selectedInlineVideo.id}
                  title={selectedInlineVideo.title}
                  src={selectedInlineVideo.videoEmbedUrl}
                  className="w-full h-full"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
                      Now Watching · {selectedInlineVideo.date || 'Recent Service'}
                    </p>
                    <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#181615] mt-1">
                      {selectedInlineVideo.title}
                    </h2>
                    <p className="text-sm text-[#5C5750] mt-1">{selectedInlineVideo.speakerOrAuthor}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {(selectedInlineVideo.mediaUrl || selectedInlineVideo.fallbackMediaUrl) && (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(selectedInlineVideo)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md cursor-pointer"
                      >
                        <Headphones className="w-4 h-4" aria-hidden="true" />
                        <span>Listen to Audio Alternative</span>
                      </button>
                    )}

                    <a
                      href={selectedInlineVideo.watchUrl || selectedInlineVideo.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] text-xs font-semibold text-[#181615] bg-[#F9F7F3] border border-[#D4CEC3] hover:bg-[#EFECE6] rounded-md"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 bg-[#F9F7F3] border border-[#E5E0D8] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5C5750]">
                  <p>
                    Video blocked on your network or browser? Switch to the Audio Alternative above, watch directly on YouTube, or browse all MP3 podcast episodes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubTab('podcasts')}
                    className="font-semibold text-[#1D3557] hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    Open Podcast Audio Feed →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white border border-[#E5E0D8] rounded-lg text-sm text-[#5C5750]">
              Video feed is refreshing. You can listen via Podcasts or open The Covenant Nation YouTube channel directly.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentVideos.map((vid) => {
              const isSelected = selectedInlineVideo?.id === vid.id;
              return (
                <article
                  key={vid.id}
                  className={`bg-white border rounded-lg overflow-hidden flex flex-col justify-between transition-colors ${
                    isSelected ? 'border-[#1D3557] ring-1 ring-[#1D3557]' : 'border-[#E5E0D8]'
                  }`}
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVideo(vid);
                        window.scrollTo({ top: 160, behavior: 'smooth' });
                      }}
                      className="block w-full aspect-video bg-[#181615] overflow-hidden cursor-pointer relative group"
                    >
                      <img
                        src={vid.imageUrl}
                        alt={vid.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                    </button>
                    <div className="p-5">
                      <p className="text-xs text-[#6B655E] tabular-nums mb-1.5">
                        {vid.date || 'Recent Broadcast'} · TCN Video
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenResource(vid)}
                        className="text-left text-base font-semibold text-[#181615] hover:text-[#1D3557] line-clamp-2 cursor-pointer"
                      >
                        {vid.title}
                      </button>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-[#F0ECE4] flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVideo(vid);
                        window.scrollTo({ top: 160, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isSelected ? 'Playing' : 'Watch Here'}</span>
                    </button>

                    {(vid.mediaUrl || vid.fallbackMediaUrl) ? (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(vid)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#9A5B25] hover:underline cursor-pointer"
                      >
                        <Headphones className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Audio Alt</span>
                      </button>
                    ) : (
                      <a
                        href={vid.watchUrl || vid.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#5C5750] hover:text-[#181615]"
                      >
                        <span>YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PODCASTS */}
      {subTab === 'podcasts' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-[#E5E0D8] rounded-xl p-6 sm:p-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
                Weekly &amp; Sunday Broadcast Feeds
              </p>
              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#181615]">
                Insights for Living Podcast
              </h2>
              <p className="text-sm sm:text-base text-[#5C5750] leading-relaxed">
                On the Insights for Living podcast, Pastor Poju Oyemade offers insightful, practical, pragmatic teaching based on God’s Word relevant to faith, relationships, career, and business. Connected live to both official RSS feeds (1,200+ episodes).
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="https://creators.spotify.com/pod/show/thecovenantnation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md"
                >
                  <span>Listen on Spotify / Anchor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://podcasts.apple.com/us/podcast/insightsforliving-by-the-covenant-nation/id1482283253"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-[#181615] bg-[#F9F7F3] border border-[#D4CEC3] hover:bg-[#EFECE6] rounded-md"
                >
                  <span>Subscribe on Apple Podcasts</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#E5E0D8] bg-[#181615]">
                <img
                  src="/assets/aistudio/Screenshot_20261118_105126_Chrome_32c56a99.jpg"
                  alt="Pastor Poju Oyemade hosting Insights for Living"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6B655E]">
              Latest Verified Episodes
            </h3>
            <div className="divide-y divide-[#E5E0D8] bg-white border border-[#E5E0D8] rounded-lg">
              {recentPodcasts.map((ep) => (
                <div
                  key={ep.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B655E] mb-1">
                      <span className="font-semibold text-[#9A5B25]">{ep.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{ep.date || 'Recent'}</span>
                      {ep.duration && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{ep.duration}</span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenResource(ep)}
                      className="text-left text-base sm:text-lg font-semibold text-[#181615] hover:text-[#1D3557] cursor-pointer"
                    >
                      {ep.title}
                    </button>
                    <p className="text-sm text-[#5C5750] mt-1 line-clamp-2">{ep.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ep.mediaUrl && (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(ep)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md cursor-pointer"
                      >
                        <Headphones className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Play Episode</span>
                      </button>
                    )}
                    <a
                      href={ep.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3.5 py-2 min-h-[40px] text-xs font-medium text-[#181615] border border-[#D4CEC3] rounded-md hover:bg-[#EFECE6]"
                    >
                      <span>Podcast Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COVENANT RADIO & LIVESTREAMS */}
      {subTab === 'streams' && (
        <div className="space-y-6">
          {loadingStreams ? (
            <div className="h-48 bg-[#EFECE6] rounded-lg animate-pulse" />
          ) : streamStatus ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 1. Audio Livestream (Mixlr) */}
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Headphones className="w-5 h-5 text-[#1D3557]" aria-hidden="true" />
                    <span className="text-xs font-semibold text-[#1D3557]">
                      {streamStatus.audioStream.isLive
                        ? 'LIVE BROADCAST ACTIVE'
                        : 'OFF AIR · VERIFIED SCHEDULE'}
                    </span>
                  </div>
                  <h2 className="font-editorial text-xl font-semibold text-[#181615]">
                    {streamStatus.audioStream.name}
                  </h2>
                  <p className="text-sm text-[#5C5750]">
                    {streamStatus.audioStream.isLive && streamStatus.audioStream.broadcastTitle
                      ? `Now streaming: ${streamStatus.audioStream.broadcastTitle}`
                      : 'No live broadcast is running on Mixlr at this moment. Verified weekly stream times:'}
                  </p>
                  <p className="text-xs text-[#6B655E] bg-[#F9F7F3] p-3 rounded border border-[#E5E0D8]">
                    {streamStatus.audioStream.scheduleNote}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMixlrEmbed(!showMixlrEmbed)}
                    className="w-full px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md cursor-pointer"
                  >
                    {showMixlrEmbed ? 'Hide Mixlr Player' : 'Open Mixlr Audio Player'}
                  </button>
                  <a
                    href={streamStatus.audioStream.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-[#181615] border border-[#D4CEC3] rounded-md hover:bg-[#EFECE6]"
                  >
                    <span>Open mixlr.com/covenant</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 2. Video Livestream */}
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Tv className="w-5 h-5 text-[#1D3557]" aria-hidden="true" />
                    <span className="text-xs font-semibold text-[#9A5B25]">
                      {streamStatus.videoStream.status}
                    </span>
                  </div>
                  <h2 className="font-editorial text-xl font-semibold text-[#181615]">
                    {streamStatus.videoStream.name}
                  </h2>
                  <p className="text-sm text-[#5C5750]">{streamStatus.videoStream.note}</p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {streamStatus.videoStream.embedUrl && (
                    <button
                      type="button"
                      onClick={() => setShowVideoEmbed(!showVideoEmbed)}
                      className="w-full px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md cursor-pointer"
                    >
                      {showVideoEmbed ? 'Hide Video Broadcast' : 'Load Video Broadcast'}
                    </button>
                  )}
                  <a
                    href={streamStatus.videoStream.youtubeChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-[#181615] border border-[#D4CEC3] rounded-md hover:bg-[#EFECE6]"
                  >
                    <span>Watch on TCN YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 3. Covenant Radio (Transparently Flagged HTTP 404) */}
              <div className="bg-[#EFECE6]/70 border border-[#D4CEC3] rounded-lg p-6 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Radio className="w-5 h-5 text-[#9A5B25]" aria-hidden="true" />
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#9A5B25]">
                      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{streamStatus.covenantRadio.status}</span>
                    </span>
                  </div>
                  <h2 className="font-editorial text-xl font-semibold text-[#181615]">
                    Covenant Radio
                  </h2>
                  <p className="text-sm text-[#4A453F]">
                    {streamStatus.covenantRadio.diagnosticNote}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubTab('podcasts')}
                    className="w-full px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-[#181615] hover:bg-[#2B2825] rounded-md cursor-pointer"
                  >
                    Listen to Recorded Teachings
                  </button>
                  <a
                    href={streamStatus.audioStream.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-[#181615] bg-white border border-[#D4CEC3] rounded-md hover:bg-[#F9F7F3]"
                  >
                    <span>Open Mixlr Audio Fallback</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : null}

          {showMixlrEmbed && streamStatus?.audioStream.embedUrl && (
            <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
              <p className="text-xs font-semibold text-[#6B655E] mb-3">
                The Covenant Nation Mixlr Audio Stream Embed
              </p>
              <iframe
                title="The Covenant Nation Mixlr Audio Livestream"
                src={streamStatus.audioStream.embedUrl}
                width="100%"
                height="180"
                className="rounded border border-[#E5E0D8]"
              />
            </div>
          )}

          {showVideoEmbed && streamStatus?.videoStream.embedUrl && (
            <div className="bg-white border border-[#E5E0D8] rounded-lg p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#6B655E]">
                  Video Broadcast (Privacy-Enhanced YouTube Stream)
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSubTab('videos')}
                    className="text-[#1D3557] hover:underline cursor-pointer"
                  >
                    Browse All Video Teachings →
                  </button>
                  <a
                    href={streamStatus.videoStream.watchUrl || streamStatus.videoStream.youtubeChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#9A5B25] hover:underline"
                  >
                    <span>Open Direct on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="aspect-video w-full max-w-3xl rounded overflow-hidden border border-[#E5E0D8] bg-[#181615]">
                <iframe
                  title="The Covenant Nation Video Broadcast"
                  src={streamStatus.videoStream.embedUrl}
                  className="w-full h-full"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="text-xs text-[#5C5750]">
                If the video frame is blocked by your browser or network firewall, use &ldquo;Open Direct on YouTube&rdquo; above or listen via Mixlr Audio / Recorded Podcasts.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
