import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { track } from '@vercel/analytics';

// Lazy load NotifyModal — only needed when user clicks "Notify Me"
const NotifyModal = lazy(() => import('@/components/NotifyModal').then(m => ({ default: m.NotifyModal })));

// Inline SVG icons — clean, recognizable, consistent stroke weight
const ActivityIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>
  </svg>
);

const BrainIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);

const HeartPulseIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
  </svg>
);

const FlameIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const WindIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
  </svg>
);

const MoonIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

const StretchIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="4" r="1"/><path d="m18 7-3 5"/><path d="m14 12-4 5"/><path d="m6 12 4-2"/><path d="m4 17 5-2.5"/><path d="m8 22 2-5"/>
  </svg>
);

const RadarIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const LockIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
  </svg>
);

const BellIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>
  </svg>
);

interface AssessmentItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
  status: 'active' | 'new' | 'coming-soon';
  route: string;
  accentColor: 'cyan' | 'violet';
}

const assessments: AssessmentItem[] = [
  {
    id: 'functional-age',
    title: 'Functional Age',
    subtitle: 'Body Performance',
    description: '5 at-home physical tests to estimate how your body is really aging — no equipment needed.',
    duration: '10 min',
    icon: <ActivityIcon />,
    status: 'active',
    route: '/functional-age',
    accentColor: 'cyan',
  },
  {
    id: 'brain-age',
    title: 'Brain Age',
    subtitle: 'Cognitive Sharpness',
    description: '5 quick cognitive games testing reaction time, memory, focus and flexibility — under 5 minutes.',
    duration: '5 min',
    icon: <BrainIcon />,
    status: 'new',
    route: '/brain-age',
    accentColor: 'violet',
  },
  {
    id: 'cardiovascular-age',
    title: 'Cardiovascular Age',
    subtitle: 'Heart & Recovery',
    description: 'Resting heart rate, step test recovery, and breathlessness scale to estimate your heart\'s age.',
    duration: '12 min',
    icon: <HeartPulseIcon />,
    status: 'coming-soon',
    route: '#',
    accentColor: 'cyan',
  },
  {
    id: 'metabolic-age',
    title: 'Metabolic Age',
    subtitle: 'Energy & Metabolism',
    description: 'Waist-hip ratio, activity level, energy patterns and BMR proxies to gauge metabolic efficiency.',
    duration: '8 min',
    icon: <FlameIcon />,
    status: 'coming-soon',
    route: '#',
    accentColor: 'violet',
  },
  {
    id: 'mobility-age',
    title: 'Mobility Age',
    subtitle: 'Flexibility & Range',
    description: 'Sit-and-reach, shoulder mobility, deep squat and balance tests for your flexibility age.',
    duration: '8 min',
    icon: <StretchIcon />,
    status: 'coming-soon',
    route: '#',
    accentColor: 'cyan',
  },
  {
    id: 'respiratory-age',
    title: 'Respiratory Age',
    subtitle: 'Lung Efficiency',
    description: 'BOLT score, sustained exhale and recovery tests to measure your respiratory capacity.',
    duration: '6 min',
    icon: <WindIcon />,
    status: 'coming-soon',
    route: '#',
    accentColor: 'violet',
  },
  {
    id: 'sleep-age',
    title: 'Sleep Age',
    subtitle: 'Rest & Recovery',
    description: 'Sleep latency, wake frequency, schedule consistency and restfulness to score your sleep health.',
    duration: '5 min',
    icon: <MoonIcon />,
    status: 'coming-soon',
    route: '#',
    accentColor: 'cyan',
  },
  {
    id: 'longevity-age-index',
    title: 'Longevity Index',
    subtitle: 'The Full Picture',
    description: 'A composite score across all your ages — see how your entire body is aging in one number.',
    duration: '2 min',
    icon: <RadarIcon />,
    status: 'coming-soon',
    route: '#',
    accentColor: 'violet',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function StatusBadge({ status }: { status: AssessmentItem['status'] }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-primary/12 text-primary border border-primary/20">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Live
      </span>
    );
  }
  if (status === 'new') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-secondary/12 text-secondary border border-secondary/20">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
        New
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-muted text-muted-foreground border border-border">
      <LockIcon />
      Soon
    </span>
  );
}

function AssessmentCard({ assessment, isSubscribed, onNotifyClick }: {
  assessment: AssessmentItem;
  isSubscribed: boolean;
  onNotifyClick: (assessment: AssessmentItem) => void;
}) {
  const navigate = useNavigate();
  const isAvailable = assessment.status !== 'coming-soon';
  const isComingSoon = assessment.status === 'coming-soon';

  const handleClick = () => {
    if (!isAvailable) return;
    track('hub_card_click', { assessment: assessment.id, status: assessment.status });
    navigate(assessment.route);
  };

  const accentClasses = assessment.accentColor === 'cyan'
    ? {
        iconBg: 'bg-primary/10',
        iconText: 'text-primary',
        hoverShadow: 'hover:shadow-glow',
        ringColor: 'ring-primary/30',
      }
    : {
        iconBg: 'bg-secondary/10',
        iconText: 'text-secondary',
        hoverShadow: 'hover:shadow-glow-violet',
        ringColor: 'ring-secondary/30',
      };

  // Available cards are clickable buttons
  if (isAvailable) {
    return (
      <motion.div variants={cardVariants} className="h-full">
        <button
          type="button"
          onClick={handleClick}
          className={`
            group relative w-full h-full text-left rounded-2xl border p-5 sm:p-6 transition-all duration-300 outline-none
            focus-visible:ring-2 ${accentClasses.ringColor}
            bg-card border-border/60 ${accentClasses.hoverShadow} hover:border-primary/30 hover:-translate-y-1 cursor-pointer active:scale-[0.98]
          `}
          aria-label={`Start ${assessment.title} assessment`}
        >
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: assessment.accentColor === 'cyan'
                ? 'radial-gradient(circle at 30% 20%, hsl(189 100% 50% / 0.04), transparent 60%)'
                : 'radial-gradient(circle at 30% 20%, hsl(262 83% 58% / 0.04), transparent 60%)',
            }}
          />

          <div className="relative flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${accentClasses.iconBg} ${accentClasses.iconText} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                {assessment.icon}
              </div>
              <StatusBadge status={assessment.status} />
            </div>

            <div className="mb-3">
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {assessment.title}
              </h3>
              <p className="text-sm mt-0.5 text-muted-foreground">
                {assessment.subtitle}
              </p>
            </div>

            <p className="text-sm leading-relaxed flex-1 text-muted-foreground">
              {assessment.description}
            </p>

            <div className="flex items-center justify-between pt-4 mt-auto">
              <span className="text-xs font-medium text-muted-foreground">
                ~{assessment.duration}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${accentClasses.iconText} opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                Start
                <ArrowRightIcon />
              </span>
            </div>
          </div>
        </button>
      </motion.div>
    );
  }

  // Coming-soon cards are divs with a "Notify Me" button
  return (
    <motion.div variants={cardVariants} className="h-full">
      <div className="relative w-full h-full text-left rounded-2xl border p-5 sm:p-6 bg-muted/40 border-border/40 opacity-75">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${accentClasses.iconBg} ${accentClasses.iconText} flex items-center justify-center opacity-60`}>
              {assessment.icon}
            </div>
            <StatusBadge status={assessment.status} />
          </div>

          <div className="mb-3">
            <h3 className="text-lg font-bold tracking-tight text-muted-foreground">
              {assessment.title}
            </h3>
            <p className="text-sm mt-0.5 text-muted-foreground/60">
              {assessment.subtitle}
            </p>
          </div>

          <p className="text-sm leading-relaxed flex-1 text-muted-foreground/50">
            {assessment.description}
          </p>

          <div className="flex items-center justify-between pt-4 mt-auto">
            <span className="text-xs font-medium text-muted-foreground/50">
              ~{assessment.duration}
            </span>
            {isSubscribed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <CheckIcon />
                We'll notify you
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNotifyClick(assessment);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors active:scale-[0.97]"
              >
                <BellIcon />
                Notify Me
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HubPage() {
  const activeCount = assessments.filter(a => a.status !== 'coming-soon').length;
  const totalCount = assessments.length;

  // Track which tools user has subscribed to (persisted in localStorage)
  const [subscribedTools, setSubscribedTools] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('entropy-age-subscriptions');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Modal state
  const [notifyModal, setNotifyModal] = useState<{ open: boolean; tool: AssessmentItem | null }>({
    open: false,
    tool: null,
  });

  const handleNotifyClick = (assessment: AssessmentItem) => {
    track('notify_click', { assessment: assessment.id });
    setNotifyModal({ open: true, tool: assessment });
  };

  const handleNotifySuccess = (email: string) => {
    if (notifyModal.tool) {
      const updated = new Set(subscribedTools);
      updated.add(notifyModal.tool.id);
      setSubscribedTools(updated);
      try {
        localStorage.setItem('entropy-age-subscriptions', JSON.stringify([...updated]));
      } catch {}
      track('notify_subscribed', { assessment: notifyModal.tool.id, email });
    }
    setNotifyModal({ open: false, tool: null });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-72 md:w-96 h-72 md:h-96 bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-60 md:w-80 h-60 md:h-80 bg-secondary/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 right-1/4 w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-16 relative z-10">
        {/* Header */}
        <motion.header
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5 animate-float" aria-hidden="true">
            <SparklesIcon />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            <span className="gradient-text">Entropy Age</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto">
            Discover your biological age across multiple dimensions.
            <span className="block text-sm mt-2 text-muted-foreground/70">
              {activeCount} of {totalCount} assessments available
            </span>
          </p>
        </motion.header>

        {/* Assessment grid — equal height cards via grid stretch */}
        <motion.div
          className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 auto-rows-fr"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              isSubscribed={subscribedTools.has(assessment.id)}
              onNotifyClick={handleNotifyClick}
            />
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          className="mt-10 sm:mt-14 text-sm text-muted-foreground/60 text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          All assessments are private — your data never leaves your device.
        </motion.p>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-xs text-muted-foreground max-w-md mx-auto flex items-center justify-center gap-1">
          <ShieldIcon />
          For educational purposes only. Not medical advice.
          Consult a healthcare provider for health concerns.
        </p>
        <p className="text-xs text-muted-foreground mt-2">&copy; 2026 Entropy Age. All rights reserved.</p>
      </footer>

      {/* Notify modal — lazy loaded, only rendered when needed */}
      {notifyModal.tool && (
        <Suspense fallback={null}>
          <NotifyModal
            open={notifyModal.open}
            onOpenChange={(open) => {
              if (!open) setNotifyModal({ open: false, tool: null });
            }}
            toolId={notifyModal.tool.id}
            toolName={notifyModal.tool.title}
            toolDescription={notifyModal.tool.description}
            onSuccess={handleNotifySuccess}
          />
        </Suspense>
      )}
    </div>
  );
}
