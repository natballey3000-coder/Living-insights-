import React from 'react';
import { Compass, Home, PlayCircle, Sprout, Users } from 'lucide-react';
import type { NavTab } from './HeaderNav.tsx';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  hasPlayerOpen: boolean;
}

const MOBILE_TABS: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'discover', label: 'DISCOVER', icon: Compass },
  { id: 'watch', label: 'WATCH', icon: PlayCircle },
  { id: 'grow', label: 'GROW', icon: Sprout },
  { id: 'connect', label: 'CONNECT', icon: Users },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onNavigate }) => {
  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F9F7F3]/95 backdrop-blur-md border-t border-[#E5E0D8] pb-safe"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                isActive ? 'text-[#1D3557]' : 'text-[#6B655E] hover:text-[#181615]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} aria-hidden="true" />
              <span className="text-[10px] font-semibold tracking-wider whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
