export type ContentStatus =
  | 'Verified and current'
  | 'Historical or archived'
  | 'Requires administrative verification'
  | 'Temporarily unavailable';

export type ResourceType =
  | 'sermon'
  | 'article'
  | 'podcast'
  | 'confession'
  | 'pathway'
  | 'centre';

export type LifeTopic =
  | 'Faith'
  | 'Purpose'
  | 'Marriage and Relationships'
  | 'Family'
  | 'Business and Finances'
  | 'Prayer'
  | 'Wisdom'
  | 'Spiritual Growth';

export interface UnifiedResource {
  id: string;
  type: ResourceType;
  title: string;
  speakerOrAuthor: string;
  date: string;
  year: number | null;
  summary: string;
  fullText?: string;
  topics: LifeTopic[];
  categoryLabel: string;
  scriptures: string[];
  mediaUrl?: string;
  externalUrl: string;
  imageUrl?: string;
  fileSize?: string;
  duration?: string;
  isFree?: boolean;
  price?: string;
  status: ContentStatus;
  sourceSystem: 'E-Library API' | 'WordPress Archive' | 'Podcast RSS' | 'TCN Ministry Registry';
}

export interface SearchResultItem extends UnifiedResource {
  score: number;
  matchReasons: string[];
}

export interface SearchResponse {
  query: string;
  normalizedTerms: string[];
  detectedScriptures: string[];
  total: number;
  results: SearchResultItem[];
  suggestions: string[];
  availableFilters: {
    speakers: string[];
    years: number[];
    types: ResourceType[];
  };
}

export interface StreamStatus {
  audioStream: {
    name: string;
    isLive: boolean;
    status: ContentStatus;
    broadcastTitle?: string;
    embedUrl: string;
    externalUrl: string;
    scheduleNote: string;
    lastChecked: string;
  };
  videoStream: {
    name: string;
    isLive: boolean;
    status: ContentStatus;
    embedUrl: string;
    legacyWordPressUrl: string;
    youtubeChannelUrl: string;
    note: string;
    lastChecked: string;
  };
  covenantRadio: {
    name: string;
    isLive: boolean;
    status: ContentStatus;
    originalUrl: string;
    httpStatus: number;
    diagnosticNote: string;
    fallbackActionLabel: string;
  };
}

export interface ConfessionDocument {
  id: string;
  title: string;
  category: 'Annual & Prophetic' | 'Daily Declarations' | 'The Blood & Protection' | 'Conference & Fasting' | 'Prayer & Study';
  dateLabel: string;
  year: number;
  format: 'PDF' | 'DOCX' | 'Web Text';
  fileSize?: string;
  summary: string;
  scriptures: string[];
  url: string;
  inlineText?: string[];
  status: ContentStatus;
}

export interface ChurchCentre {
  id: string;
  name: string;
  region: 'Lagos' | 'Abuja' | 'Other Nigeria' | 'United Kingdom & Europe' | 'North America';
  city: string;
  venue: string;
  serviceTimes: string[];
  instagramUrl?: string;
  directionsQuery: string;
  status: ContentStatus;
}

export interface MinistryPathway {
  id: string;
  title: string;
  category: 'Spiritual Milestone' | 'Family & Marriage' | 'Community & Growth' | 'Ministry Service & Support';
  description: string;
  actionLabel: string;
  url: string;
  privacyNote: string;
  status: ContentStatus;
}

export interface ContentInventoryEntry {
  resourceType: string;
  sourceLocation: string;
  accessible: boolean;
  urlWorks: boolean;
  temporalState: 'Current' | 'Historical' | 'Mixed (2016–2026)';
  integrationMethod: string;
  adminVerificationRequired: boolean;
  status: ContentStatus;
  notes: string;
}

export interface FeaturedSeries {
  title: string;
  allUrl: string;
  messages: Array<{
    id: string;
    name: string;
    topic: string;
    description: string;
    bannerUrl?: string;
    created: string;
  }>;
}
