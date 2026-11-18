import React, { useState } from 'react';
import { BookOpen, Check, Download, ExternalLink, FileText, Share2 } from 'lucide-react';
import { VERIFIED_CONFESSIONS, VERIFIED_PATHWAYS } from '../data/verifiedMinistryData.ts';
import type { ConfessionDocument } from '../types/platform.ts';

const CONFESSION_CATEGORIES = [
  'All',
  'Annual & Prophetic',
  'Daily Declarations',
  'The Blood & Protection',
  'Conference & Fasting',
  'Prayer & Study',
] as const;

export const GrowView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedConfessionId, setExpandedConfessionId] = useState<string | null>('conf-songs-sword');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredConfessions =
    selectedCategory === 'All'
      ? VERIFIED_CONFESSIONS
      : VERIFIED_CONFESSIONS.filter((c) => c.category === selectedCategory);

  const growthPathways = VERIFIED_PATHWAYS.filter(
    (p) => p.category === 'Community & Growth' || p.category === 'Family & Marriage'
  );

  const handleShareConfession = async (conf: ConfessionDocument) => {
    const text = conf.inlineText ? conf.inlineText.join('\n\n') : `${conf.title}: ${conf.summary}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: conf.title, text, url: conf.url });
        return;
      } catch {
        // Fallback
      }
    }
    try {
      await navigator.clipboard.writeText(`${conf.title}\n\n${text}\n\nSource: ${conf.url}`);
      setCopiedId(conf.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Header with Ministry Photography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#E5E0D8] pb-8">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
            Grow in the Word
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#181615] mt-1">
            Confessions, Declarations &amp; Discipleship Resources
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[#5C5750] leading-relaxed">
            Original Covenant Nation confession documents, daily faith declarations, Bible study manuals, and structured learning classes preserved in full integrity.
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="aspect-[16/10] rounded-xl overflow-hidden border border-[#E5E0D8] bg-[#EFECE6]">
            <img
              src="https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6832-1024x683.jpg"
              alt="Believers studying the Word and praying together at The Covenant Nation"
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

      {/* Confessions Section */}
      <section aria-labelledby="confessions-list-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 id="confessions-list-heading" className="font-editorial text-2xl font-semibold text-[#181615]">
            Confessions &amp; Declarations Archive
          </h2>
          <a
            href="https://insightsforliving.org/downloads/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3557] hover:underline"
          >
            <span>Original TCN Downloads Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CONFESSION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1D3557] text-white'
                  : 'bg-white border border-[#E5E0D8] text-[#4A453F] hover:border-[#1D3557]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Confessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredConfessions.map((conf) => {
            const isExpanded = expandedConfessionId === conf.id;
            return (
              <article
                key={conf.id}
                className="bg-white border border-[#E5E0D8] rounded-lg p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B655E]">
                    <span className="font-semibold text-[#9A5B25]">{conf.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{conf.dateLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {conf.format}
                      {conf.fileSize ? ` (${conf.fileSize})` : ''}
                    </span>
                  </div>

                  <h3 className="font-editorial text-xl font-semibold text-[#181615]">{conf.title}</h3>
                  <p className="text-sm text-[#5C5750] leading-relaxed">{conf.summary}</p>

                  {conf.scriptures.length > 0 && (
                    <p className="text-xs text-[#6B655E] flex items-center gap-1.5 pt-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#9A5B25] shrink-0" aria-hidden="true" />
                      <span>Scriptures: {conf.scriptures.join(', ')}</span>
                    </p>
                  )}

                  {conf.inlineText && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedConfessionId(isExpanded ? null : conf.id)}
                        className="text-xs font-semibold text-[#1D3557] hover:underline cursor-pointer"
                      >
                        {isExpanded ? 'Hide Confession Text' : 'Read Full Confession Text'}
                      </button>
                      {isExpanded && (
                        <div className="mt-3 p-4 bg-[#F9F7F3] border border-[#E5E0D8] rounded-md space-y-3 text-sm text-[#2B2825] leading-relaxed">
                          {conf.inlineText.map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#F0ECE4] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={conf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md transition-colors"
                    >
                      {conf.format === 'Web Text' ? (
                        <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>
                        {conf.format === 'Web Text' ? 'View Original Page' : `Download ${conf.format}`}
                      </span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleShareConfession(conf)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-[#5C5750] hover:text-[#181615] border border-[#D4CEC3] rounded-md cursor-pointer"
                    >
                      {copiedId === conf.id ? (
                        <Check className="w-3.5 h-3.5 text-[#1D3557]" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === conf.id ? 'Copied' : 'Share'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-[#6B655E]">{conf.status}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Foundation of Faith, Bible Study Manual & Family Growth */}
      <section aria-labelledby="discipleship-heading" className="pt-8 border-t border-[#E5E0D8] space-y-6">
        <div>
          <h2 id="discipleship-heading" className="font-editorial text-2xl font-semibold text-[#181615]">
            Bible Study, Foundation of Faith &amp; Family Learning
          </h2>
          <p className="text-sm text-[#5C5750] mt-1">
            Structured discipleship programmes and verified study manuals from The Covenant Nation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {growthPathways.map((item) => {
            const imgMap: Record<string, string> = {
              'path-premarital': 'https://insightsforliving.org/wp-content/uploads/2026/05/Premarital-Counselling-.png',
              'path-marriage-enrichment': 'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6991-1024x683.jpg',
              'path-bible-manual': 'https://insightsforliving.org/wp-content/uploads/2025/07/vantage-point.jpg',
              'path-fof': 'https://insightsforliving.org/wp-content/uploads/2021/06/6Z7A6402-1024x683.jpg',
              'path-first-timer': 'https://insightsforliving.org/wp-content/uploads/2021/01/6Z7A2351-1024x683.jpg',
              'path-community-groups': 'https://insightsforliving.org/wp-content/uploads/2021/01/6Z7A2348-1024x683.jpg',
            };
            const cardImg = imgMap[item.id];
            return (
              <div
                key={item.id}
                className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {cardImg && (
                    <div className="aspect-[16/9] bg-[#EFECE6] overflow-hidden">
                      <img
                        src={cardImg}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            '/src/assets/images/pastor_teaching_study_1794994745648.jpg';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs font-semibold text-[#9A5B25]">{item.category}</p>
                    <h3 className="text-lg font-semibold text-[#181615] mt-1">{item.title}</h3>
                    <p className="text-sm text-[#5C5750] mt-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-3 border-t border-[#F0ECE4] space-y-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3557] hover:underline"
                  >
                    <span>{item.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-[11px] text-[#6B655E]">{item.privacyNote}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
