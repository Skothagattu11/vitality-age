import type { SkinScannerScreen } from '@/types/skinScanner';

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const RoutineIcon = ({ active }: { active: boolean }) => (
  <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

interface BottomNavProps {
  currentScreen: SkinScannerScreen;
  onNavigate: (screen: SkinScannerScreen) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const tabs: { id: SkinScannerScreen; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: (a) => <HomeIcon active={a} /> },
    { id: 'routine', label: 'Routine', icon: (a) => <RoutineIcon active={a} /> },
    { id: 'profile', label: 'Profile', icon: (a) => <ProfileIcon active={a} /> },
  ];

  return (
    <nav className="ss-bottom-nav" style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            className="flex flex-col items-center gap-[3px] py-1.5 px-5 border-none bg-transparent cursor-pointer"
          >
            <span style={{ color: isActive ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-text-muted))' }}>
              {tab.icon(isActive)}
            </span>
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-text-muted))' }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
