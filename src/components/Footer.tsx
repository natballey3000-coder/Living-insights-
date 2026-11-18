import React from 'react';
import type { NavTab } from './HeaderNav.tsx';

interface FooterProps {
  onNavigate: (tab: NavTab) => void;
  hasPlayerOpen: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, hasPlayerOpen }) => {
  return (
    <footer
      className={`border-t border-[#E5E0D8] bg-[#EFECE6]/60 ${
        hasPlayerOpen ? 'pb-40 lg:pb-24' : 'pb-20 lg:pb-10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/Screenshot_20261118_105039_Chrome_2123710a.jpg"
                alt="The Covenant Nation Crest"
                className="w-9 h-9 rounded object-cover border border-[#D4CEC3] shrink-0"
              />
              <p className="font-editorial text-xl font-semibold text-[#181615]">Insights for Living</p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5B25]">
              The Word, In Real Life
            </p>
            <p className="text-sm text-[#5C5750] leading-relaxed">
              The everyday Christian understanding platform of The Covenant Nation, founded by Pastor Poju Oyemade.
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#181615]">
              Explore Platform
            </h2>
            <ul className="space-y-2 text-sm text-[#5C5750]">
              <li>
                <button type="button" onClick={() => onNavigate('discover')} className="hover:text-[#181615] cursor-pointer">
                  Discover Teachings &amp; Search
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('watch')} className="hover:text-[#181615] cursor-pointer">
                  Watch &amp; Listen (E-Library &amp; Podcasts)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('grow')} className="hover:text-[#181615] cursor-pointer">
                  Confessions &amp; Growth Resources
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('connect')} className="hover:text-[#181615] cursor-pointer">
                  Church Centres &amp; Forms
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#181615]">
              Ministry Destinations
            </h2>
            <ul className="space-y-2 text-sm text-[#5C5750]">
              <li>
                <a
                  href="https://elibrary.insightsforliving.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#181615]"
                >
                  The Covenant Nation E-Library
                </a>
              </li>
              <li>
                <a
                  href="https://insightsforliving.org/giving"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#181615] font-medium text-[#9A5B25]"
                >
                  Giving &amp; Partnership
                </a>
              </li>
              <li>
                <a
                  href="https://insightsforliving.org/covenant-christian-centre-uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#181615]"
                >
                  Covenant UK
                </a>
              </li>
              <li>
                <a
                  href="https://insightsforliving.org/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#181615]"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#181615]">
              Stay Connected
            </h2>
            <ul className="space-y-2 text-sm text-[#5C5750]">
              <li>
                <a
                  href="https://www.youtube.com/c/CovenantChristianCentreNG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#181615]"
                >
                  YouTube Channel
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/covenantccentre/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#181615]"
                >
                  Instagram (@covenantccentre)
                </a>
              </li>
              <li>
                <a
                  href="https://mixlr.com/covenant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#181615]"
                >
                  Mixlr Audio Stream
                </a>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('about')} className="hover:text-[#181615] cursor-pointer">
                  Content Verification &amp; Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#DFD9CE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6B655E]">
          <p>© {new Date().getFullYear()} The Covenant Nation · Insights for Living. All original teachings preserved.</p>
          <p>Creative Strategy &amp; Digital Experience by Speedflight Digital Agency.</p>
        </div>
      </div>
    </footer>
  );
};
