import { useCallback, useEffect, useState } from 'react';
import { Footer } from './components/Footer.tsx';
import { HeaderNav, type NavTab } from './components/HeaderNav.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { PersistentAudioPlayer } from './components/PersistentAudioPlayer.tsx';
import { ResourceDetailView } from './components/ResourceDetailView.tsx';
import { AboutView } from './views/AboutView.tsx';
import { ConnectView } from './views/ConnectView.tsx';
import { DiscoverView } from './views/DiscoverView.tsx';
import { GrowView } from './views/GrowView.tsx';
import { HomeView } from './views/HomeView.tsx';
import { WatchListenView } from './views/WatchListenView.tsx';
import type { FeaturedSeries, LifeTopic, UnifiedResource } from './types/platform.ts';

interface OverviewPayload {
  stats: {
    sermonsCount: number;
    videosCount?: number;
    articlesCount: number;
    podcastsCount: number;
    confessionsCount: number;
    centresCount: number;
    pathwaysCount: number;
  };
  lastIndexedAt: string;
  featuredSeries: FeaturedSeries[];
  categories: Array<{ id: string; name: string; topic: string; description: string }>;
  recentSermons: UnifiedResource[];
  recentVideos: UnifiedResource[];
  recentArticles: UnifiedResource[];
  recentPodcasts: UnifiedResource[];
  announcementsHtml: string;
  announcementsDate: string;
}

const VALID_TABS = new Set<NavTab>(['home', 'discover', 'watch', 'grow', 'connect', 'about']);

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab') as NavTab | null;
    if (t && VALID_TABS.has(t)) return t;
    if (params.get('q')) return 'discover';
    return 'home';
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });

  const [selectedTopic, setSelectedTopic] = useState<LifeTopic | 'all'>('all');
  const [selectedResource, setSelectedResource] = useState<UnifiedResource | null>(null);
  const [audioTrack, setAudioTrack] = useState<UnifiedResource | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [refreshingIndex, setRefreshingIndex] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/overview');
      if (res.ok) {
        const json = (await res.json()) as OverviewPayload;
        setOverview(json);
      }
    } catch {
      // Handled gracefully by empty fallback arrays
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const navigateTo = useCallback((tab: NavTab) => {
    setSelectedResource(null);
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchSubmit = useCallback((q: string) => {
    setSelectedResource(null);
    setSearchQuery(q);
    setSelectedTopic('all');
    setActiveTab('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectTopic = useCallback((topic: LifeTopic) => {
    setSelectedResource(null);
    setSearchQuery('');
    setSelectedTopic(topic);
    setActiveTab('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenResource = useCallback((res: UnifiedResource) => {
    setSelectedResource(res);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePlayAudio = useCallback(async (res: UnifiedResource) => {
    if (res.mediaUrl || res.fallbackMediaUrl) {
      setAudioTrack(res);
      return;
    }
    if (res.type === 'sermon' || res.type === 'podcast' || res.type === 'video') {
      try {
        const r = await fetch(`/api/resources/${encodeURIComponent(res.id)}`);
        if (r.ok) {
          const data = await r.json();
          if (data?.resource?.mediaUrl || data?.resource?.fallbackMediaUrl) {
            setAudioTrack(data.resource);
            return;
          }
        }
      } catch {
        // fallback to detail view
      }
    }
    setSelectedResource(res);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRefreshIndex = useCallback(async () => {
    setRefreshingIndex(true);
    try {
      await fetch('/api/index/refresh', { method: 'POST' });
      await loadOverview();
    } finally {
      setRefreshingIndex(false);
    }
  }, [loadOverview]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F3] text-[#181615] overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1D3557] focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      <HeaderNav
        activeTab={activeTab}
        onNavigate={navigateTo}
        onOpenSearch={() => navigateTo('discover')}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)}
      />

      <main id="main-content" className="flex-1">
        {selectedResource ? (
          <ResourceDetailView
            resource={selectedResource}
            onBack={() => setSelectedResource(null)}
            onPlayAudio={handlePlayAudio}
            onSelectRelated={handleOpenResource}
            onExploreTopic={(t) => handleSelectTopic(t as LifeTopic)}
          />
        ) : activeTab === 'home' ? (
          <HomeView
            recentSermons={overview?.recentSermons || []}
            recentArticles={overview?.recentArticles || []}
            featuredSeries={overview?.featuredSeries || []}
            loadingOverview={loadingOverview}
            onSearchSubmit={handleSearchSubmit}
            onSelectTopic={handleSelectTopic}
            onOpenResource={handleOpenResource}
            onPlayAudio={handlePlayAudio}
            onNavigate={navigateTo}
          />
        ) : activeTab === 'discover' ? (
          <DiscoverView
            initialQuery={searchQuery}
            initialTopic={selectedTopic}
            onOpenResource={handleOpenResource}
            onPlayAudio={handlePlayAudio}
          />
        ) : activeTab === 'watch' ? (
          <WatchListenView
            recentSermons={overview?.recentSermons || []}
            recentVideos={overview?.recentVideos || []}
            recentPodcasts={overview?.recentPodcasts || []}
            featuredSeries={overview?.featuredSeries || []}
            categories={overview?.categories || []}
            onPlayAudio={handlePlayAudio}
            onOpenResource={handleOpenResource}
          />
        ) : activeTab === 'grow' ? (
          <GrowView />
        ) : activeTab === 'connect' ? (
          <ConnectView />
        ) : (
          <AboutView
            stats={
              overview?.stats || {
                sermonsCount: 0,
                videosCount: 0,
                articlesCount: 0,
                podcastsCount: 0,
                confessionsCount: 13,
                centresCount: 40,
                pathwaysCount: 16,
              }
            }
            lastIndexedAt={overview?.lastIndexedAt || ''}
            announcementsHtml={overview?.announcementsHtml || ''}
            announcementsDate={overview?.announcementsDate || ''}
            onRefreshIndex={handleRefreshIndex}
            refreshing={refreshingIndex}
          />
        )}
      </main>

      <Footer onNavigate={navigateTo} hasPlayerOpen={Boolean(audioTrack)} />

      <PersistentAudioPlayer
        track={audioTrack}
        onClose={() => setAudioTrack(null)}
        onOpenDetail={handleOpenResource}
      />

      <MobileBottomNav
        activeTab={activeTab}
        onNavigate={navigateTo}
        hasPlayerOpen={Boolean(audioTrack)}
      />
    </div>
  );
}
