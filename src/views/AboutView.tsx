import React from 'react';
import { ExternalLink, Mail, Phone, RefreshCw } from 'lucide-react';
import { CONTENT_INVENTORY, MINISTRY_INFO } from '../data/verifiedMinistryData.ts';

interface AboutViewProps {
  stats: {
    sermonsCount: number;
    articlesCount: number;
    podcastsCount: number;
    confessionsCount: number;
    centresCount: number;
    pathwaysCount: number;
  };
  lastIndexedAt: string;
  announcementsHtml: string;
  announcementsDate: string;
  onRefreshIndex: () => void;
  refreshing: boolean;
}

export const AboutView: React.FC<AboutViewProps> = ({
  stats,
  lastIndexedAt,
  announcementsHtml,
  announcementsDate,
  onRefreshIndex,
  refreshing,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Header & Vision */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-[#E5E0D8] pb-10">
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Screenshot_20261118_105039_Chrome_2123710a.jpg"
              alt="The Covenant Nation Crest"
              className="w-11 h-11 rounded-md object-cover border border-[#D4CEC3]"
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
              About The Covenant Nation
            </p>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#181615]">
            Teaching Christians Who They Are in Christ Jesus
          </h1>
          <p className="text-base text-[#4A453F] leading-relaxed reading-measure">
            {MINISTRY_INFO.aboutChurch}
          </p>
          <blockquote className="p-5 bg-[#EFECE6]/70 border border-[#E5E0D8] rounded-lg font-editorial text-lg text-[#181615]">
            “{MINISTRY_INFO.visionStatement}”
          </blockquote>
          <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#E5E0D8] bg-[#EFECE6]">
            <img
              src="https://insightsforliving.org/wp-content/uploads/2022/09/IMG_1418-1024x683.jpg"
              alt="The Covenant Nation sanctuary gathering"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/src/assets/images/featured_worship_gathering_1794994745677.jpg';
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden">
            <div className="aspect-[4/3] bg-[#181615] overflow-hidden">
              <img
                src="/assets/aistudio/Screenshot_20261118_105126_Chrome_32c56a99.jpg"
                alt="Pastor Poju Oyemade, Senior Pastor of The Covenant Nation"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="p-6 space-y-3">
              <h2 className="font-editorial text-xl font-semibold text-[#181615]">
                Pastor Poju Oyemade
              </h2>
              <p className="text-sm text-[#5C5750] leading-relaxed">
                {MINISTRY_INFO.pastorPojuBio}
              </p>
              <div className="pt-2 flex flex-wrap gap-3 text-xs font-semibold text-[#1D3557]">
                <a
                  href="https://insightsforliving.org/about/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <span>Original About Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://insightsforliving.org/giving"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#9A5B25] hover:underline"
                >
                  <span>Giving &amp; Partnership</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Services & Generational Ministries */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-[#E5E0D8] pb-10">
        <div className="space-y-4">
          <h2 className="font-editorial text-2xl font-semibold text-[#181615]">
            Weekly Broadcast &amp; Prayer Rhythm
          </h2>
          <div className="divide-y divide-[#E5E0D8] bg-white border border-[#E5E0D8] rounded-lg">
            {MINISTRY_INFO.weeklySchedules.map((sch) => (
              <div key={sch.title} className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#181615]">{sch.title}</p>
                  <span className="text-xs font-medium text-[#1D3557] tabular-nums">{sch.time}</span>
                </div>
                <p className="text-xs text-[#6B655E]">{sch.channel}</p>
              </div>
            ))}
          </div>

          {announcementsHtml && (
            <div className="p-5 bg-[#EFECE6]/60 border border-[#E5E0D8] rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6B655E]">
                <span className="font-semibold uppercase tracking-wider text-[#9A5B25]">
                  Latest WordPress Announcements
                </span>
                {announcementsDate && <span className="tabular-nums">Updated {announcementsDate}</span>}
              </div>
              <div
                className="editorial-prose text-xs sm:text-sm text-[#4A453F] max-h-48 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: announcementsHtml }}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-editorial text-2xl font-semibold text-[#181615]">
            Next Generation &amp; Community Outreach
          </h2>
          <div className="space-y-3">
            {MINISTRY_INFO.youthAndFamily.map((yg) => (
              <a
                key={yg.name}
                href={yg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white border border-[#E5E0D8] hover:border-[#1D3557] rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#181615]">{yg.name}</p>
                  <span className="text-xs text-[#9A5B25] font-medium">{yg.audience}</span>
                </div>
                <p className="text-xs text-[#5C5750] mt-1">{yg.description}</p>
              </a>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {MINISTRY_INFO.outreachInitiatives.map((out) => (
                <a
                  key={out.name}
                  href={out.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white border border-[#E5E0D8] hover:border-[#1D3557] rounded-lg transition-colors"
                >
                  <p className="text-sm font-semibold text-[#181615]">{out.name}</p>
                  <p className="text-xs text-[#5C5750] mt-1">{out.summary}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Desks & TV Schedule Note */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-[#E5E0D8] pb-10">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-editorial text-2xl font-semibold text-[#181615]">
            Ministry Information Desks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MINISTRY_INFO.contactDesks.emails.map((item) => (
              <a
                key={item.email}
                href={`mailto:${item.email}`}
                className="p-4 bg-white border border-[#E5E0D8] hover:border-[#1D3557] rounded-lg flex items-start gap-3"
              >
                <Mail className="w-4 h-4 text-[#1D3557] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#181615]">{item.label}</p>
                  <p className="text-xs text-[#5C5750] truncate">{item.email}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-editorial text-2xl font-semibold text-[#181615]">
            Helplines &amp; TV Broadcasts
          </h2>
          <div className="p-5 bg-white border border-[#E5E0D8] rounded-lg space-y-3">
            <div className="space-y-1.5">
              {MINISTRY_INFO.contactDesks.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 text-sm font-medium text-[#181615] hover:text-[#1D3557] tabular-nums"
                >
                  <Phone className="w-4 h-4 text-[#9A5B25]" aria-hidden="true" />
                  <span>{phone}</span>
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-[#E5E0D8] text-xs text-[#5C5750] space-y-1.5">
              <p className="font-semibold text-[#9A5B25]">TV Schedules (Requires Administrative Verification)</p>
              <p>{MINISTRY_INFO.tvSchedulesNote}</p>
              <a
                href="https://insightsforliving.org/tv-schedules/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#1D3557] font-semibold hover:underline"
              >
                <span>View Original TV Schedules Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Content Inventory & Editorial Maintenance Audit */}
      <section aria-labelledby="inventory-heading" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
              Editorial Governance &amp; Content Inventory
            </p>
            <h2 id="inventory-heading" className="font-editorial text-2xl font-semibold text-[#181615] mt-1">
              Connected Ministry Sources &amp; Verification Status
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5750] mt-1 tabular-nums">
              Indexed: {stats.sermonsCount} E-Library sermons · {stats.articlesCount} WordPress articles ·{' '}
              {stats.podcastsCount} podcast episodes · {stats.confessionsCount} confessions · {stats.centresCount} centres
              {lastIndexedAt ? ` · Updated ${new Date(lastIndexedAt).toLocaleString()}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onRefreshIndex}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] text-xs font-semibold bg-white border border-[#D4CEC3] hover:border-[#1D3557] rounded-md text-[#181615] cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{refreshing ? 'Refreshing Index...' : 'Refresh Live Index'}</span>
          </button>
        </div>

        <div className="overflow-x-auto bg-white border border-[#E5E0D8] rounded-lg">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D8] bg-[#F9F7F3] text-xs font-semibold text-[#5C5750]">
                <th className="py-3 px-4">Resource Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Temporal State</th>
                <th className="py-3 px-4">Integration &amp; Verification Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {CONTENT_INVENTORY.map((row) => (
                <tr key={row.resourceType} className="align-top">
                  <td className="py-3.5 px-4 font-semibold text-[#181615] whitespace-nowrap">
                    {row.resourceType}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#1D3557]">
                    {row.status}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-[#5C5750]">{row.temporalState}</td>
                  <td className="py-3.5 px-4 text-[#4A453F] min-w-[260px]">
                    <p>{row.notes}</p>
                    <p className="text-[11px] text-[#6B655E] mt-1 break-all">{row.sourceLocation}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
