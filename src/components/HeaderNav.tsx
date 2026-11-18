import React from 'react';
import { Menu, Search, X } from 'lucide-react';

export type NavTab = 'home' | 'discover' | 'watch' | 'grow' | 'connect' | 'about';

interface HeaderNavProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenSearch: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

const NAV_ITEMS: Array<{ id: NavTab; label: string }> = [
  { id: 'discover', label: 'DISCOVER' },
  { id: 'watch', label: 'WATCH & LISTEN' },
  { id: 'grow', label: 'GROW' },
  { id: 'connect', label: 'CONNECT' },
  { id: 'about', label: 'ABOUT' },
];

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onNavigate,
  onOpenSearch,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#F9F7F3]/95 backdrop-blur-md border-b border-[#E5E0D8]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 md:h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        {/* Zone 1: Single-line Brand Wordmark with TCN Crest */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 sm:gap-2.5 font-editorial text-base sm:text-lg md:text-xl font-semibold tracking-tight text-[#181615] min-w-0 shrink cursor-pointer text-left hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/aistudio/Screenshot_20261118_105039_Chrome_2123710a.jpg"
            alt="The Covenant Nation Crest"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded object-cover border border-[#D4CEC3] shrink-0"
          />
          <span className="truncate">Insights for Living</span>
        </button>

        {/* Zone 2: Exact 5 Main Navigation Destinations */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`text-xs font-semibold tracking-[0.08em] py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#1D3557] border-[#1D3557]'
                    : 'text-[#5C5750] border-transparent hover:text-[#181615] hover:border-[#D4CEC3]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Always-Visible Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#152844] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden inline-flex items-center justify-center min-h-[40px] min-w-[40px] px-2 bg-white border border-[#D4CEC3] text-[#181615] hover:bg-[#EFECE6] rounded-md transition-colors shrink-0 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Menu Drawer for About, Giving & Quick Links */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E0D8] bg-[#F9F7F3] px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                onToggleMobileMenu();
              }}
              className={`w-full text-left px-3 py-3 min-h-[44px] text-sm font-medium rounded-md transition-colors flex items-center justify-between ${
                activeTab === item.id
                  ? 'bg-[#EFECE6] text-[#1D3557] font-semibold'
                  : 'text-[#181615] hover:bg-[#EFECE6]/60'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2 mt-2 border-t border-[#E5E0D8] flex items-center justify-between px-3 py-2">
            <a
              href="https://insightsforliving.org/giving"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#9A5B25] underline underline-offset-4"
            >
              Give to The Covenant Nation
            </a>
            <a
              href="https://elibrary.insightsforliving.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#5C5750] underline underline-offset-4"
            >
              E-Library Portal
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
