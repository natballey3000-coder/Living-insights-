import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ExternalLink,
  Headphones,
  Share2,
} from 'lucide-react';
import type { UnifiedResource } from '../types/platform.ts';

interface ResourceDetailViewProps {
  resource: UnifiedResource;
  onBack: () => void;
  onPlayAudio: (resource: UnifiedResource) => void;
  onSelectRelated: (resource: UnifiedResource) => void;
  onExploreTopic: (topic: string) => void;
}

export const ResourceDetailView: React.FC<ResourceDetailViewProps> = ({
  resource,
  onBack,
  onPlayAudio,
  onSelectRelated,
  onExploreTopic,
}) => {
  const [related, setRelated] = useState<UnifiedResource[]>([]);
  const [fullItem, setFullItem] = useState<UnifiedResource>(resource);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setFullItem(resource);
    setLoadingRelated(true);

    fetch(`/api/resources/${encodeURIComponent(resource.id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (data.resource) setFullItem(data.resource);
        if (Array.isArray(data.related)) setRelated(data.related);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingRelated(false);
      });

    return () => {
      active = false;
    };
  }, [resource.id]);

  const handleShare = async () => {
    const shareUrl = fullItem.externalUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: fullItem.title,
          text: fullItem.summary,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    try {
      await navigator.clipboard.writeText(`${fullItem.title} — ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard failure
    }
  };

  const isHtmlArticle = fullItem.type === 'article' && fullItem.fullText && fullItem.fullText.includes('<');

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#5C5750] hover:text-[#181615] min-h-[44px] mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Back to results</span>
      </button>

      {/* Editorial Header */}
      <header className="border-b border-[#E5E0D8] pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B655E] mb-3">
          <span className="uppercase tracking-wider font-semibold text-[#9A5B25]">
            {fullItem.categoryLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{fullItem.date || 'Archived Resource'}</span>
          <span aria-hidden="true">·</span>
          <span>{fullItem.status}</span>
        </div>

        <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#181615] leading-tight">
          {fullItem.title}
        </h1>

        <p className="mt-4 text-base text-[#5C5750]">
          By <span className="font-medium text-[#181615]">{fullItem.speakerOrAuthor}</span>
          {fullItem.fileSize ? ` · ${fullItem.fileSize}` : ''}
          {fullItem.duration ? ` · ${fullItem.duration}` : ''}
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {(fullItem.mediaUrl || fullItem.fallbackMediaUrl) && (
            <button
              type="button"
              onClick={() => onPlayAudio(fullItem)}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md transition-colors cursor-pointer"
            >
              <Headphones className="w-4 h-4" aria-hidden="true" />
              <span>{fullItem.type === 'video' ? 'Listen to Audio Alternative' : 'Listen to Teaching'}</span>
            </button>
          )}

          {fullItem.watchUrl && (
            <a
              href={fullItem.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-[#181615] bg-white border border-[#D4CEC3] hover:bg-[#EFECE6] rounded-md transition-colors"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          )}

          {(!fullItem.watchUrl || fullItem.altExternalUrl) && (
            <a
              href={fullItem.altExternalUrl || fullItem.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-medium text-[#181615] bg-white border border-[#D4CEC3] hover:bg-[#EFECE6] rounded-md transition-colors"
            >
              <span>{fullItem.altExternalUrl ? 'Open Alternative Source' : 'Open Source Portal'}</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-medium text-[#5C5750] hover:text-[#181615] hover:bg-[#EFECE6] rounded-md transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#1D3557]" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Body + Margin Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-8 border-b border-[#E5E0D8]">
        <div className="lg:col-span-8">
          {isHtmlArticle ? (
            <div
              className="editorial-prose reading-measure text-[16px] text-[#2B2825]"
              dangerouslySetInnerHTML={{ __html: fullItem.fullText || '' }}
            />
          ) : (
            <div className="reading-measure space-y-5 text-[16px] text-[#2B2825]">
              {fullItem.videoEmbedUrl && (
                <div className="mb-6 space-y-2">
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-[#E5E0D8] bg-[#181615]">
                    <iframe
                      title={fullItem.title}
                      src={fullItem.videoEmbedUrl}
                      className="w-full h-full"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-xs text-[#6B655E]">
                    Streamed via privacy-enhanced player. If blocked on your network, use{' '}
                    <a
                      href={fullItem.watchUrl || fullItem.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1D3557] font-semibold hover:underline"
                    >
                      Watch on YouTube
                    </a>{' '}
                    or click &ldquo;Listen to Audio Alternative&rdquo; above.
                  </p>
                </div>
              )}

              {!fullItem.videoEmbedUrl && fullItem.imageUrl && (
                <div className="mb-6 rounded-lg overflow-hidden border border-[#E5E0D8] bg-[#EFECE6] max-w-md">
                  <img
                    src={fullItem.imageUrl}
                    alt={fullItem.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="text-lg leading-relaxed text-[#181615]">{fullItem.summary}</p>
              {fullItem.fullText && fullItem.fullText !== fullItem.summary && (
                <div className="whitespace-pre-line leading-relaxed text-[#433F3A]">{fullItem.fullText}</div>
              )}
              {fullItem.type === 'sermon' && (
                <div className="p-5 bg-[#EFECE6]/70 border border-[#E5E0D8] rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-[#181615]">Reliable Audio &amp; Alternative Sources</p>
                  <p className="text-sm text-[#5C5750]">
                    Audio is delivered through our same-origin stream relay with automatic E-Library refresh and podcast mirror fallback so playback stays consistent even when direct S3 or E-Library links are restricted.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Margin Notes: Topics, Scriptures, Source Verification */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-5 bg-white border border-[#E5E0D8] rounded-lg space-y-4">
            <div>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#6B655E] mb-2">
                Biblical Subjects
              </h2>
              <div className="flex flex-wrap gap-2">
                {fullItem.topics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => onExploreTopic(topic)}
                    className="text-xs font-medium text-[#1D3557] bg-[#F9F7F3] border border-[#E5E0D8] hover:border-[#1D3557] px-3 py-1.5 rounded transition-colors cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {fullItem.scriptures.length > 0 && (
              <div className="pt-4 border-t border-[#E5E0D8]">
                <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#6B655E] mb-2">
                  Scripture References
                </h2>
                <ul className="space-y-1 text-sm text-[#181615]">
                  {fullItem.scriptures.map((sc) => (
                    <li key={sc} className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#9A5B25] shrink-0" aria-hidden="true" />
                      <span>{sc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-[#E5E0D8] text-xs text-[#6B655E] space-y-1">
              <p>
                <span className="font-semibold text-[#181615]">Source:</span> {fullItem.sourceSystem}
              </p>
              <p>
                <span className="font-semibold text-[#181615]">Verification:</span> {fullItem.status}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* DISCOVER -> UNDERSTAND -> APPLY -> GROW Next Steps */}
      <section className="pt-8" aria-labelledby="next-steps-heading">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
            Understand · Apply · Grow
          </p>
          <h2 id="next-steps-heading" className="font-editorial text-2xl font-semibold text-[#181615] mt-1">
            Continue Your Study & Application
          </h2>
          <p className="text-sm text-[#5C5750] mt-1">
            Related teachings, articles, declarations, and practical ministry pathways connected to this message.
          </p>
        </div>

        {loadingRelated ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-[#EFECE6] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onSelectRelated(rel)}
                className="text-left p-5 bg-white border border-[#E5E0D8] hover:border-[#1D3557] rounded-lg transition-colors flex flex-col justify-between gap-3 cursor-pointer"
              >
                <div>
                  <p className="text-xs text-[#6B655E] mb-1.5">
                    {rel.categoryLabel}
                    {rel.date ? ` · ${rel.date.slice(0, 4)}` : ''}
                  </p>
                  <h3 className="text-base font-semibold text-[#181615] line-clamp-2">{rel.title}</h3>
                  <p className="text-sm text-[#5C5750] line-clamp-2 mt-1.5">{rel.summary}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D3557]">
                  <span>Open resource</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </article>
  );
};
