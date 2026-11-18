import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CONTENT_INVENTORY,
  MINISTRY_INFO,
  VERIFIED_CENTRES,
  VERIFIED_CONFESSIONS,
  VERIFIED_PATHWAYS,
} from './src/data/verifiedMinistryData.ts';
import type {
  FeaturedSeries,
  LifeTopic,
  ResourceType,
  SearchResponse,
  SearchResultItem,
  StreamStatus,
  UnifiedResource,
} from './src/types/platform.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const WP_BASE = 'https://insightsforliving.org/wp-json/wp/v2';
const ELIB_BASE = 'https://api.elibrary.insightsforliving.org/v1';
const PODCAST_FEEDS = [
  {
    name: 'Insightsforliving by The Covenant Nation',
    rssUrl: 'https://anchor.fm/s/e967fa4/podcast/rss',
    showUrl: 'https://creators.spotify.com/pod/show/thecovenantnation',
    appleUrl: 'https://podcasts.apple.com/us/podcast/insightsforliving-by-the-covenant-nation/id1482283253',
  },
  {
    name: 'Insights By The Covenant Nation',
    rssUrl: 'https://anchor.fm/s/d8d51d98/podcast/rss',
    showUrl: 'https://creators.spotify.com/pod/show/covenantnation',
    appleUrl: 'https://podcasts.apple.com/us/podcast/insights-by-the-covenant-nation/id1684351542',
  },
];

// --- Text & Scripture Utilities ---

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<\/(p|div|h[1-6]|li|br|tr)>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

const SCRIPTURE_REGEX =
  /\b(?:(?:1|2|3|I|II|III)\s+)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\s+\d+(?::\d+(?:[–-]\d+)?)?\b/gi;

function extractScriptures(text: string): string[] {
  const matches = text.match(SCRIPTURE_REGEX) || [];
  return [...new Set(matches.map((m) => m.trim()))].slice(0, 8);
}

const TOPIC_KEYWORDS: Record<LifeTopic, string[]> = {
  Faith: ['faith', 'believe', 'belief', 'confession', 'word of faith', 'confidence', 'trust', 'hope', 'doubt', 'fear', 'overcome', 'grace'],
  Purpose: ['purpose', 'calling', 'destiny', 'vision', 'assignment', 'plan', 'direction', 'identity', 'christ', 'righteousness', 'covenant', 'calling'],
  'Marriage and Relationships': ['marriage', 'married', 'spouse', 'husband', 'wife', 'relationship', 'relationships', 'single', 'singles', 'pre-marital', 'love', 'wedding', 'counselling'],
  Family: ['family', 'children', 'child', 'parent', 'parenting', 'teen', 'teenager', 'youth', 'household', 'home', 'dedication'],
  'Business and Finances': ['business', 'finance', 'finances', 'financial', 'money', 'wealth', 'prosperity', 'trade', 'career', 'work', 'marketplace', 'entrepreneur', 'capital', 'stewardship', 'abundance', 'seed'],
  Prayer: ['prayer', 'pray', 'praying', 'intercession', 'supplication', 'fasting', 'importunity', 'spirit', 'meditation', 'worship', 'altar'],
  Wisdom: ['wisdom', 'wise', 'understanding', 'knowledge', 'counsel', 'decision', 'decisions', 'discernment', 'mind', 'thinking', 'renew', 'thought'],
  'Spiritual Growth': ['growth', 'grow', 'maturity', 'mature', 'disciple', 'foundation', 'scripture', 'bible', 'word', 'spirit', 'holiness', 'character', 'prepare'],
};

function classifyTopics(text: string): LifeTopic[] {
  const lower = text.toLowerCase();
  const matched: LifeTopic[] = [];
  for (const [topic, kws] of Object.entries(TOPIC_KEYWORDS) as Array<[LifeTopic, string[]]>) {
    if (kws.some((kw) => lower.includes(kw))) {
      matched.push(topic);
    }
  }
  return matched.length > 0 ? matched.slice(0, 3) : ['Spiritual Growth'];
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'how', 'what', 'when', 'where', 'why', 'who', 'which', 'can', 'could',
  'should', 'would', 'will', 'shall', 'may', 'might', 'about', 'into', 'through', 'my', 'me',
  'i', 'we', 'our', 'you', 'your', 'they', 'their', 'it', 'its', 'this', 'that', 'these',
  'those', 'there', 'here', 'say', 'says', 'tell', 'bible', 'christian', 'christians', 'gods',
  'mean', 'means', 'feel', 'feeling', 'life', 'everyday', 'things', 'difficult', 'help', 'need',
]);

const SYNONYM_MAP: Record<string, string[]> = {
  fear: ['afraid', 'anxiety', 'anxious', 'worry', 'panic', 'courage', 'peace', 'confidence', 'boldness'],
  afraid: ['fear', 'courage', 'peace', 'trust'],
  anxiety: ['fear', 'peace', 'worry', 'mind', 'rest'],
  business: ['trade', 'work', 'career', 'enterprise', 'marketplace', 'capital', 'entrepreneur', 'stewardship'],
  finances: ['money', 'wealth', 'prosperity', 'provision', 'abundance', 'stewardship', 'blessing', 'giving'],
  finance: ['money', 'wealth', 'prosperity', 'provision', 'stewardship'],
  money: ['finances', 'wealth', 'prosperity', 'provision', 'stewardship'],
  marriage: ['spouse', 'husband', 'wife', 'relationship', 'love', 'unity', 'counselling', 'pre-marital'],
  relationships: ['marriage', 'love', 'unity', 'friendship', 'family', 'singles'],
  relationship: ['marriage', 'love', 'unity', 'singles'],
  identity: ['christ', 'righteousness', 'covenant', 'new creation', 'sonship', 'beloved', 'inheritance'],
  prayer: ['pray', 'praying', 'intercession', 'supplication', 'importunity', 'fasting', 'meditation'],
  pray: ['prayer', 'intercession', 'supplication', 'meditation'],
  faith: ['believe', 'confidence', 'trust', 'confession', 'word', 'hope', 'patience'],
  confidence: ['faith', 'boldness', 'assurance', 'trust', 'courage'],
  purpose: ['calling', 'destiny', 'vision', 'plan', 'assignment', 'direction'],
  wisdom: ['understanding', 'counsel', 'discernment', 'mind', 'thinking', 'decisions'],
  healing: ['health', 'blood', 'wholeness', 'recovery', 'restoration'],
  difficult: ['trials', 'perseverance', 'patience', 'endurance', 'overcome', 'overcomer', 'victory'],
  trials: ['difficult', 'perseverance', 'endurance', 'faith', 'overcome'],
  strength: ['power', 'grace', 'endurance', 'spirit', 'might'],
  decisions: ['wisdom', 'guidance', 'direction', 'spirit', 'counsel'],
  work: ['business', 'career', 'diligence', 'marketplace', 'stewardship'],
  family: ['children', 'home', 'household', 'marriage', 'parenting'],
};

function tokenizeQuery(query: string): { terms: string[]; expanded: string[]; scriptures: string[] } {
  const scriptures = extractScriptures(query);
  const cleaned = query
    .toLowerCase()
    .replace(/[^\w\s:]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  const expanded = new Set<string>(cleaned);
  for (const term of cleaned) {
    const syns = SYNONYM_MAP[term];
    if (syns) {
      syns.forEach((s) => expanded.add(s));
    }
  }
  return {
    terms: [...new Set(cleaned)],
    expanded: [...expanded],
    scriptures,
  };
}

// --- XML RSS Helper ---
function extractTag(block: string, tag: string): string {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
  const m1 = block.match(cdataRegex);
  if (m1) return m1[1].trim();
  const plainRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m2 = block.match(plainRegex);
  return m2 ? decodeHtmlEntities(m2[1].trim()) : '';
}

// --- In-Memory Cache & Content Index ---

interface CachedStore {
  resources: UnifiedResource[];
  featuredSeries: FeaturedSeries[];
  categories: Array<{ id: string; name: string; topic: string; description: string }>;
  speakers: Array<{ id: string; name: string; title: string; image?: string }>;
  announcementsHtml: string;
  announcementsDate: string;
  lastIndexedAt: string;
  stats: {
    sermonsCount: number;
    articlesCount: number;
    podcastsCount: number;
    confessionsCount: number;
    centresCount: number;
    pathwaysCount: number;
  };
}

let store: CachedStore = {
  resources: [],
  featuredSeries: [],
  categories: [],
  speakers: [],
  announcementsHtml: '',
  announcementsDate: '',
  lastIndexedAt: '',
  stats: {
    sermonsCount: 0,
    articlesCount: 0,
    podcastsCount: 0,
    confessionsCount: VERIFIED_CONFESSIONS.length,
    centresCount: VERIFIED_CENTRES.length,
    pathwaysCount: VERIFIED_PATHWAYS.length,
  },
};

let lastFetchTimestamp = 0;
let indexingPromise: Promise<void> | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000;

async function fetchJsonSafe<T>(url: string, timeoutMs = 12000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTextSafe(url: string, timeoutMs = 12000): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function mapElibMessage(m: any): UnifiedResource {
  const title = (m.topic || 'Ministry Teaching').replace(/_/g, ' ').trim();
  const desc = (m.description || '').replace(/\r\n/g, ' · ').trim();
  const when = m.when || m.created || '';
  const year = when ? new Date(when).getFullYear() : null;
  const combined = `${title} ${desc}`;
  return {
    id: `sermon-${m.id}`,
    type: 'sermon',
    title,
    speakerOrAuthor: m.speaker_name || 'Pastor Poju Oyemade',
    date: when ? when.slice(0, 10) : '',
    year: year && !Number.isNaN(year) ? year : null,
    summary: desc || `${title} — Teaching from The Covenant Nation E-Library.`,
    fullText: desc,
    topics: classifyTopics(combined),
    categoryLabel: m.is_free === false ? `E-Library Message (${m.price || 'Paid'})` : 'E-Library Audio Teaching',
    scriptures: extractScriptures(combined),
    mediaUrl: m.file_url || undefined,
    externalUrl: `https://elibrary.insightsforliving.org/message/${m.id}`,
    imageUrl: m.image_url || undefined,
    fileSize: m.size || undefined,
    isFree: m.is_free !== false,
    price: m.price ? String(m.price) : '0',
    status: 'Verified and current',
    sourceSystem: 'E-Library API',
  };
}

async function ingestAllContent(): Promise<void> {
  const allResources: UnifiedResource[] = [];

  // 1. E-Library Messages (first 3 pages x 50 = 150 latest teachings)
  const sermonPages = await Promise.all([
    fetchJsonSafe<any>(`${ELIB_BASE}/messages/?pageNumber=1&pageSize=50`),
    fetchJsonSafe<any>(`${ELIB_BASE}/messages/?pageNumber=2&pageSize=50`),
    fetchJsonSafe<any>(`${ELIB_BASE}/messages/?pageNumber=3&pageSize=50`),
  ]);

  const seenSermons = new Set<string>();
  let sermonsCount = 0;
  for (const page of sermonPages) {
    if (page?.data && Array.isArray(page.data)) {
      for (const m of page.data) {
        if (m.id && !seenSermons.has(m.id)) {
          seenSermons.add(m.id);
          allResources.push(mapElibMessage(m));
          sermonsCount++;
        }
      }
    }
  }

  // 2. E-Library Featured, Categories, Speakers
  const [featuredRes, catsRes, speakersRes] = await Promise.all([
    fetchJsonSafe<any>(`${ELIB_BASE}/messages/featured`),
    fetchJsonSafe<any>(`${ELIB_BASE}/categories/?pageNumber=1&pageSize=50`),
    fetchJsonSafe<any>(`${ELIB_BASE}/speakers/?pageNumber=1&pageSize=50`),
  ]);

  const featuredSeries: FeaturedSeries[] = Array.isArray(featuredRes?.data)
    ? featuredRes.data.map((group: any) => ({
        title: group.title || 'Featured Series',
        allUrl: group.all ? `https://elibrary.insightsforliving.org${group.all}` : 'https://elibrary.insightsforliving.org/',
        messages: Array.isArray(group.messages)
          ? group.messages.map((item: any) => ({
              id: item.id,
              name: item.name || item.topic || 'Series',
              topic: item.topic || item.name || '',
              description: (item.description || '').replace(/\r\n/g, ' ').trim(),
              bannerUrl: item.banner_url || undefined,
              created: item.created || '',
            }))
          : [],
      }))
    : [];

  const categories = Array.isArray(catsRes?.data)
    ? catsRes.data.map((c: any) => ({
        id: c.id,
        name: c.name || 'Series',
        topic: c.topic || '',
        description: (c.description || '').trim(),
      }))
    : [];

  const speakers = Array.isArray(speakersRes?.data)
    ? speakersRes.data.map((s: any) => ({
        id: String(s.id).trim(),
        name: `${s.title ? s.title + ' ' : ''}${s.name}`.trim(),
        title: s.title || '',
        image: s.image || undefined,
      }))
    : [];

  // 3. WordPress Posts (all pages, 100 per page)
  let articlesCount = 0;
  try {
    const firstRes = await fetch(`${WP_BASE}/posts?per_page=100&page=1&_fields=id,date,slug,link,title,content,excerpt,categories`);
    if (firstRes.ok) {
      const totalPages = Math.min(Number(firstRes.headers.get('x-wp-totalpages')) || 1, 5);
      const firstPosts = (await firstRes.json()) as any[];
      const restPages = await Promise.all(
        Array.from({ length: Math.max(0, totalPages - 1) }, (_, idx) =>
          fetchJsonSafe<any[]>(
            `${WP_BASE}/posts?per_page=100&page=${idx + 2}&_fields=id,date,slug,link,title,content,excerpt,categories`
          )
        )
      );
      const allPosts = [...firstPosts, ...restPages.flatMap((p) => p || [])];
      for (const post of allPosts) {
        const title = decodeHtmlEntities(post.title?.rendered || 'Untitled Article');
        const cleanBody = stripHtml(post.content?.rendered || '');
        const cleanExcerpt = stripHtml(post.excerpt?.rendered || '') || cleanBody.slice(0, 220);
        const dateStr = (post.date || '').slice(0, 10);
        const year = dateStr ? new Date(dateStr).getFullYear() : null;
        const combined = `${title} ${cleanBody}`;
        allResources.push({
          id: `article-${post.id}`,
          type: 'article',
          title,
          speakerOrAuthor: 'Insights for Living Editorial · The Covenant Nation',
          date: dateStr,
          year: year && !Number.isNaN(year) ? year : null,
          summary: cleanExcerpt.length > 210 ? `${cleanExcerpt.slice(0, 207)}...` : cleanExcerpt,
          fullText: sanitizeHtml(post.content?.rendered || ''),
          topics: classifyTopics(combined),
          categoryLabel: 'WordPress Article Archive',
          scriptures: extractScriptures(combined),
          externalUrl: post.link || `https://insightsforliving.org/?p=${post.id}`,
          status: year && year >= 2023 ? 'Verified and current' : 'Historical or archived',
          sourceSystem: 'WordPress Archive',
        });
        articlesCount++;
      }
    }
  } catch {
    // Keep going gracefully if WP is momentarily unreachable
  }

  // 4. Podcast RSS Feeds (first 40 episodes per feed for fast unified indexing)
  let podcastsCount = 0;
  for (const feed of PODCAST_FEEDS) {
    const xml = await fetchTextSafe(feed.rssUrl, 12000);
    if (!xml) continue;
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 45);
    for (let i = 0; i < itemMatches.length; i++) {
      const block = itemMatches[i][1];
      const title = extractTag(block, 'title');
      if (!title) continue;
      const rawDesc = extractTag(block, 'description');
      const cleanDesc = stripHtml(rawDesc);
      const link = extractTag(block, 'link') || feed.showUrl;
      const pubDate = extractTag(block, 'pubDate');
      const parsedDate = pubDate ? new Date(pubDate) : null;
      const isoDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString().slice(0, 10) : '';
      const year = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : null;
      const duration = extractTag(block, 'itunes:duration');
      const encMatch = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
      const mediaUrl = encMatch ? decodeHtmlEntities(encMatch[1]) : undefined;
      const guid = extractTag(block, 'guid') || `${i}`;
      const combined = `${title} ${cleanDesc}`;
      const speakerMatch = cleanDesc.match(/By\s+(Pastor\s+[A-Za-z\s.'’]+)/i);

      allResources.push({
        id: `podcast-${Buffer.from(guid).toString('base64url').slice(0, 18)}-${i}`,
        type: 'podcast',
        title,
        speakerOrAuthor: speakerMatch ? speakerMatch[1].trim() : 'Pastor Poju Oyemade · The Covenant Nation',
        date: isoDate,
        year,
        summary: cleanDesc.slice(0, 220) || `${title} — ${feed.name}`,
        fullText: cleanDesc,
        topics: classifyTopics(combined),
        categoryLabel: feed.name,
        scriptures: extractScriptures(combined),
        mediaUrl,
        externalUrl: link,
        duration: duration || undefined,
        isFree: true,
        status: 'Verified and current',
        sourceSystem: 'Podcast RSS',
      });
      podcastsCount++;
    }
  }

  // 5. Confessions, Pathways & Centres into Unified Index
  for (const c of VERIFIED_CONFESSIONS) {
    const combined = `${c.title} ${c.summary} ${(c.inlineText || []).join(' ')} ${c.scriptures.join(' ')}`;
    allResources.push({
      id: c.id,
      type: 'confession',
      title: c.title,
      speakerOrAuthor: 'The Covenant Nation',
      date: `${c.year}-01-01`,
      year: c.year,
      summary: c.summary,
      fullText: c.inlineText ? c.inlineText.join('\n\n') : c.summary,
      topics: classifyTopics(combined),
      categoryLabel: `${c.category} (${c.format})`,
      scriptures: c.scriptures,
      externalUrl: c.url,
      fileSize: c.fileSize,
      isFree: true,
      status: c.status,
      sourceSystem: 'TCN Ministry Registry',
    });
  }

  for (const p of VERIFIED_PATHWAYS) {
    const combined = `${p.title} ${p.description} ${p.category}`;
    allResources.push({
      id: p.id,
      type: 'pathway',
      title: p.title,
      speakerOrAuthor: 'The Covenant Nation Ministry Desk',
      date: '2026-01-01',
      year: 2026,
      summary: p.description,
      topics: classifyTopics(combined),
      categoryLabel: p.category,
      scriptures: [],
      externalUrl: p.url,
      status: p.status,
      sourceSystem: 'TCN Ministry Registry',
    });
  }

  for (const ctr of VERIFIED_CENTRES) {
    allResources.push({
      id: ctr.id,
      type: 'centre',
      title: ctr.name,
      speakerOrAuthor: `${ctr.city} · ${ctr.region}`,
      date: '2026-06-01',
      year: 2026,
      summary: `${ctr.venue} Services: ${ctr.serviceTimes.join(' · ')}`,
      topics: ['Spiritual Growth'],
      categoryLabel: `Church Centre (${ctr.region})`,
      scriptures: [],
      externalUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ctr.directionsQuery)}`,
      status: ctr.status,
      sourceSystem: 'TCN Ministry Registry',
    });
  }

  // 6. Announcements page
  const annRes = await fetchJsonSafe<any[]>(`${WP_BASE}/pages?slug=announcement`);
  const annHtml = annRes?.[0]?.content?.rendered ? sanitizeHtml(annRes[0].content.rendered) : '';
  const annDate = annRes?.[0]?.modified ? annRes[0].modified.slice(0, 10) : '';

  store = {
    resources: allResources,
    featuredSeries,
    categories,
    speakers,
    announcementsHtml: annHtml,
    announcementsDate: annDate,
    lastIndexedAt: new Date().toISOString(),
    stats: {
      sermonsCount,
      articlesCount,
      podcastsCount,
      confessionsCount: VERIFIED_CONFESSIONS.length,
      centresCount: VERIFIED_CENTRES.length,
      pathwaysCount: VERIFIED_PATHWAYS.length,
    },
  };
  lastFetchTimestamp = Date.now();
}

async function ensureIndexFresh(force = false): Promise<void> {
  const isStale = Date.now() - lastFetchTimestamp > CACHE_TTL_MS || store.resources.length === 0;
  if (!force && !isStale) return;
  if (!indexingPromise) {
    indexingPromise = ingestAllContent().finally(() => {
      indexingPromise = null;
    });
  }
  await indexingPromise;
}

// --- Search Ranking Engine ---

function scoreResource(
  res: UnifiedResource,
  rawQuery: string,
  terms: string[],
  expanded: string[],
  detectedScriptures: string[]
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const titleLower = res.title.toLowerCase();
  const summaryLower = res.summary.toLowerCase();
  const fullLower = (res.fullText ? stripHtml(res.fullText) : '').toLowerCase();
  const speakerLower = res.speakerOrAuthor.toLowerCase();
  const topicsLower = res.topics.map((t) => t.toLowerCase());
  const rawLower = rawQuery.toLowerCase().trim();

  if (rawLower && titleLower.includes(rawLower)) {
    score += 40;
    reasons.push(`Exact phrase match in title`);
  }

  const matchedTitleTerms: string[] = [];
  const matchedBodyTerms: string[] = [];
  const matchedSynonyms: string[] = [];

  for (const term of terms) {
    if (titleLower.includes(term)) {
      score += 18;
      matchedTitleTerms.push(term);
    } else if (speakerLower.includes(term)) {
      score += 12;
      reasons.push(`Matches speaker/author “${res.speakerOrAuthor}”`);
    } else if (summaryLower.includes(term)) {
      score += 10;
      matchedBodyTerms.push(term);
    } else if (fullLower.includes(term)) {
      score += 6;
      matchedBodyTerms.push(term);
    }
  }

  for (const syn of expanded) {
    if (terms.includes(syn)) continue;
    if (titleLower.includes(syn)) {
      score += 7;
      matchedSynonyms.push(syn);
    } else if (summaryLower.includes(syn) || fullLower.includes(syn)) {
      score += 3;
      matchedSynonyms.push(syn);
    }
  }

  // Topic alignment bonus
  for (const topic of topicsLower) {
    if (terms.some((t) => topic.includes(t)) || expanded.some((e) => topic.includes(e))) {
      score += 6;
    }
  }

  // Scripture match bonus
  for (const sc of detectedScriptures) {
    const scLower = sc.toLowerCase();
    if (res.scriptures.some((s) => s.toLowerCase().includes(scLower)) || fullLower.includes(scLower)) {
      score += 25;
      reasons.push(`References ${sc}`);
    }
  }

  if (matchedTitleTerms.length > 0) {
    reasons.push(`Title matches “${[...new Set(matchedTitleTerms)].slice(0, 3).join(', ')}”`);
  }
  if (matchedBodyTerms.length > 0) {
    reasons.push(`Content discusses “${[...new Set(matchedBodyTerms)].slice(0, 3).join(', ')}”`);
  }
  if (matchedSynonyms.length > 0 && matchedTitleTerms.length === 0) {
    reasons.push(`Related biblical theme: ${[...new Set(matchedSynonyms)].slice(0, 3).join(', ')}`);
  }

  // Slight recency boost when score > 0
  if (score > 0 && res.year) {
    score += Math.max(0, (res.year - 2016) * 0.35);
  }

  return { score, reasons: [...new Set(reasons)].slice(0, 3) };
}

// --- Express App Setup ---

async function createApp() {
  const app = express();
  app.use(express.json());

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Warm up index asynchronously on startup
  ensureIndexFresh().catch((err) => console.error('Initial index error:', err));

  // Health & Index Stats
  app.get('/api/overview', async (_req, res) => {
    await ensureIndexFresh();
    const recentSermons = store.resources.filter((r) => r.type === 'sermon').slice(0, 6);
    const recentArticles = store.resources.filter((r) => r.type === 'article').slice(0, 6);
    const recentPodcasts = store.resources.filter((r) => r.type === 'podcast').slice(0, 8);
    res.json({
      stats: store.stats,
      lastIndexedAt: store.lastIndexedAt,
      featuredSeries: store.featuredSeries,
      categories: store.categories,
      speakers: store.speakers,
      recentSermons,
      recentArticles,
      recentPodcasts,
      announcementsHtml: store.announcementsHtml,
      announcementsDate: store.announcementsDate,
      ministryInfo: MINISTRY_INFO,
      confessions: VERIFIED_CONFESSIONS,
      centres: VERIFIED_CENTRES,
      pathways: VERIFIED_PATHWAYS,
      inventory: CONTENT_INVENTORY,
    });
  });

  // Refresh Search Index
  app.post('/api/index/refresh', async (_req, res) => {
    await ensureIndexFresh(true);
    res.json({
      ok: true,
      lastIndexedAt: store.lastIndexedAt,
      stats: store.stats,
    });
  });

  // Live Verification of Radio, Audio Mixlr, & Video Stream
  app.get('/api/streams/status', async (_req, res) => {
    const now = new Date().toISOString();
    const [mixlrData, elibStream, radioCheck] = await Promise.all([
      fetchJsonSafe<any>('https://api.mixlr.com/users/5449585', 7000),
      fetchJsonSafe<any>(`${ELIB_BASE}/misc/stream`, 7000),
      fetch('https://insightsforliving.org/radio/', { method: 'HEAD' }).catch(() => null),
    ]);

    const radioStatus = radioCheck ? radioCheck.status : 0;
    const isMixlrLive = Boolean(mixlrData?.is_live);
    const streamUrl = elibStream?.data?.stream || '';

    const payload: StreamStatus = {
      audioStream: {
        name: 'The Covenant Nation Audio Livestream (Mixlr)',
        isLive: isMixlrLive,
        status: 'Verified and current',
        broadcastTitle: mixlrData?.current_broadcast?.title || undefined,
        embedUrl: 'https://mixlr.com/users/5449585/embed',
        externalUrl: 'https://mixlr.com/covenant',
        scheduleNote: 'Daily Morning Prayers 5:00 AM WAT · Midweek 6:45 PM WAT · Sundays 8:00 AM & 10:30 AM WAT',
        lastChecked: now,
      },
      videoStream: {
        name: 'Covenant Nation Video Broadcast',
        isLive: false,
        status: streamUrl ? 'Requires administrative verification' : 'Temporarily unavailable',
        embedUrl: streamUrl,
        legacyWordPressUrl: 'https://insightsforliving.org/livestream/',
        youtubeChannelUrl: 'https://www.youtube.com/c/CovenantChristianCentreNG',
        note: streamUrl
          ? 'Video stream endpoint retrieved from E-Library API (/misc/stream). Live status requires service-hour verification; legacy WordPress /livestream/ embeds a 2018 broadcast.'
          : 'No active video stream endpoint returned.',
        lastChecked: now,
      },
      covenantRadio: {
        name: 'Covenant Radio (insightsforliving.org/radio/)',
        isLive: false,
        status: radioStatus === 200 ? 'Verified and current' : 'Temporarily unavailable',
        originalUrl: 'https://insightsforliving.org/radio/',
        httpStatus: radioStatus,
        diagnosticNote:
          radioStatus === 200
            ? 'Covenant Radio endpoint responded normally.'
            : `Original destination insightsforliving.org/radio/ returned HTTP ${radioStatus || 'error'}. Flagged for administrative resolution instead of rendering a broken player.`,
        fallbackActionLabel: 'Listen via Verified Mixlr Audio Stream or Recorded Teachings',
      },
    };
    res.json(payload);
  });

  // Intelligent Search Endpoint
  app.get('/api/search', async (req, res) => {
    await ensureIndexFresh();
    const query = String(req.query.q || '').trim();
    const typeFilter = String(req.query.type || 'all');
    const topicFilter = String(req.query.topic || 'all');
    const speakerFilter = String(req.query.speaker || 'all');
    const yearFilter = req.query.year ? Number(req.query.year) : null;

    const { terms, expanded, scriptures } = tokenizeQuery(query);

    // If there is a meaningful query, also query E-Library live search API for deep historical sermon coverage
    let upstreamSermons: UnifiedResource[] = [];
    if (terms.length > 0 && (typeFilter === 'all' || typeFilter === 'sermon')) {
      const primaryKeyword = terms.slice(0, 2).join(' ');
      const upstream = await fetchJsonSafe<any>(
        `${ELIB_BASE}/search/?pageNumber=1&pageSize=12&keyword=${encodeURIComponent(primaryKeyword)}`,
        6000
      );
      if (Array.isArray(upstream?.data)) {
        upstreamSermons = upstream.data.map(mapElibMessage);
      }
    }

    // Merge local indexed resources + upstream search hits without duplicates
    const combinedPoolMap = new Map<string, UnifiedResource>();
    for (const r of store.resources) combinedPoolMap.set(r.id, r);
    for (const u of upstreamSermons) {
      if (!combinedPoolMap.has(u.id)) combinedPoolMap.set(u.id, u);
    }

    let pool = [...combinedPoolMap.values()];

    // Apply facet filters
    if (typeFilter !== 'all') {
      pool = pool.filter((r) => r.type === (typeFilter as ResourceType));
    }
    if (topicFilter !== 'all') {
      pool = pool.filter((r) => r.topics.some((t) => t.toLowerCase() === topicFilter.toLowerCase()));
    }
    if (speakerFilter !== 'all') {
      pool = pool.filter((r) => r.speakerOrAuthor.toLowerCase().includes(speakerFilter.toLowerCase()));
    }
    if (yearFilter && !Number.isNaN(yearFilter)) {
      pool = pool.filter((r) => r.year === yearFilter);
    }

    let ranked: SearchResultItem[] = [];

    if (!query) {
      ranked = pool.slice(0, 48).map((r) => ({
        ...r,
        score: 1,
        matchReasons: [
          topicFilter !== 'all' ? `Curated under topic “${topicFilter}”` : `Verified ${r.categoryLabel}`,
        ],
      }));
    } else {
      for (const item of pool) {
        const { score, reasons } = scoreResource(item, query, terms, expanded, scriptures);
        if (score > 0) {
          ranked.push({
            ...item,
            score,
            matchReasons: reasons.length > 0 ? reasons : [`Relevant to your search for “${query}”`],
          });
        }
      }
      ranked.sort((a, b) => b.score - a.score);
    }

    const speakers = [...new Set(pool.map((r) => r.speakerOrAuthor).filter(Boolean))].slice(0, 20);
    const years = [...new Set(pool.map((r) => r.year).filter((y): y is number => Boolean(y)))].sort((a, b) => b - a);
    const types = [...new Set(pool.map((r) => r.type))];

    const suggestions =
      ranked.length === 0
        ? [
            'How do I develop my faith?',
            'How do I overcome fear?',
            'What does the Bible say about business?',
            'Prayer and fasting',
            'Marriage and relationships',
          ]
        : [];

    const response: SearchResponse = {
      query,
      normalizedTerms: terms,
      detectedScriptures: scriptures,
      total: ranked.length,
      results: ranked.slice(0, 60),
      suggestions,
      availableFilters: { speakers, years, types },
    };

    res.json(response);
  });

  // Resource Detail + Related Resources (DISCOVER -> UNDERSTAND -> APPLY -> GROW)
  app.get('/api/resources/:id', async (req, res) => {
    await ensureIndexFresh();
    const id = req.params.id;
    let item = store.resources.find((r) => r.id === id);

    // Fallback: fetch directly from E-Library if sermon-uuid
    if (!item && id.startsWith('sermon-')) {
      const elibId = id.replace('sermon-', '');
      const single = await fetchJsonSafe<any>(`${ELIB_BASE}/messages/${encodeURIComponent(elibId)}`);
      if (single?.data) {
        item = mapElibMessage(single.data);
      }
    }

    if (!item) {
      res.status(404).json({ error: 'Resource not found in verified archive.' });
      return;
    }

    // Find genuine related resources across different formats sharing topic or scripture
    const primaryTopic = item.topics[0];
    const related = store.resources
      .filter(
        (candidate) =>
          candidate.id !== item!.id &&
          (candidate.topics.includes(primaryTopic) ||
            candidate.scriptures.some((s) => item!.scriptures.includes(s)))
      )
      .slice(0, 12);

    // Ensure a balanced mix (sermon, article, podcast, confession, pathway)
    const picked: UnifiedResource[] = [];
    for (const desiredType of ['sermon', 'article', 'podcast', 'confession', 'pathway'] as ResourceType[]) {
      const found = related.find((r) => r.type === desiredType && !picked.some((p) => p.id === r.id));
      if (found) picked.push(found);
    }
    for (const r of related) {
      if (picked.length >= 6) break;
      if (!picked.some((p) => p.id === r.id)) picked.push(r);
    }

    res.json({
      resource: item,
      related: picked,
    });
  });

  // E-Library Category Messages (enriched with signed audio/image URLs)
  app.get('/api/elibrary/categories/:id', async (req, res) => {
    await ensureIndexFresh();
    const id = req.params.id;
    const data = await fetchJsonSafe<any>(
      `${ELIB_BASE}/categories/${encodeURIComponent(id)}/messages?pageNumber=1&pageSize=18`
    );
    const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.messages) ? data.data.messages : [];
    const enriched = await Promise.all(
      rawList.map(async (m: any) => {
        const cached = store.resources.find((r) => r.id === `sermon-${m.id}`);
        if (cached && cached.mediaUrl) return cached;
        if (m.file_url) return mapElibMessage(m);
        const detail = await fetchJsonSafe<any>(`${ELIB_BASE}/messages/${encodeURIComponent(m.id)}`, 5000);
        return detail?.data ? mapElibMessage(detail.data) : mapElibMessage(m);
      })
    );
    res.json({
      messages: enriched,
    });
  });

  // SEO: robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  // SEO: sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const routes = ['/', '/?tab=discover', '/?tab=watch', '/?tab=grow', '/?tab=connect', '/?tab=about'];
    const urlsXml = routes
      .map(
        (r) => `  <url>\n    <loc>${baseUrl}${r.replace(/&/g, '&amp;')}</loc>\n    <changefreq>daily</changefreq>\n  </url>`
      )
      .join('\n');
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>`
    );
  });

  // Vite Dev Middleware or Static Production Build
  const distDir = path.resolve(__dirname, 'dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Insights for Living server running on http://0.0.0.0:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
