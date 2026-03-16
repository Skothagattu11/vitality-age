import type { AppScreen } from '@/types/supplementStacker';

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const StackIcon = ({ active }: { active: boolean }) => (
  <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2z"/><path d="M12 22v-6.5"/><path d="m22 8.5-10 7-10-7"/><path d="m2 15.5 10-7 10 7" stroke={active ? 'none' : 'currentColor'}/>
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const tabs: { id: AppScreen; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: (a) => <HomeIcon active={a} /> },
    { id: 'stack', label: 'Stack', icon: (a) => <StackIcon active={a} /> },
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
