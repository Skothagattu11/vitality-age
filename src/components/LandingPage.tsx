import { lazy, Suspense } from 'react';
import { track } from '@vercel/analytics';

// Lazy load the Dialog - not needed for initial render
const LandingHowItWorks = lazy(() => import('@/components/LandingHowItWorks'));

interface LandingPageProps {
  onStart: () => void;
  onBack?: () => void;
}

// Inline SVG icons to avoid lucide-react bundle
const SparklesIcon = () => (
  <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
  </svg>
);

export function LandingPage({ onStart, onBack }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Glow effect background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-60 md:w-80 h-60 md:h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-60 md:w-80 h-60 md:h-80 bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      {/* Back link */}
      {onBack && (
        <div className="relative z-10 p-4 sm:p-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon />
            Back to assessments
          </button>
        </div>
      )}

      <main className="flex-1 flex items-center justify-center px-4 py-6 relative z-10">
        <article className="max-w-lg w-full text-center space-y-8 animate-fade-in-up">
          {/* Logo / Title */}
          <header className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 animate-float" aria-hidden="true">
              <SparklesIcon />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="gradient-text">Entropy Age</span>
            </h1>

            <p className="text-xl md:text-2xl font-medium text-foreground/90">
              Functional Biological Age
              <span className="block text-lg text-muted-foreground mt-1">
                (No Bloodwork)
              </span>
            </p>
          </header>

          {/* Value prop */}
          <section aria-label="About Entropy Age">
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Your chronological age is just a number. Entropy Age estimates your functional biological age through 5 simple at-home tests in 10 minutes — see how your body is really aging.
            </p>
          </section>

          {/* CTAs - Native button, no Radix dependency */}
          <nav className="space-y-4" aria-label="Get started">
            <button
              type="button"
              onClick={() => {
                track('button_click', { button: 'start_assessment', page: 'landing' });
                onStart();
              }}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-14 px-10 text-lg font-semibold text-primary-foreground bg-primary rounded-xl shadow-glow hover:shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] animate-glow-pulse touch-manipulation"
              aria-label="Start the functional biological age assessment"
            >
              Start Assessment
              <ArrowRightIcon />
            </button>

            <Suspense fallback={
              <button className="inline-flex items-center text-muted-foreground hover:underline">
                <InfoIcon />
                How it works
              </button>
            }>
              <LandingHowItWorks />
            </Suspense>
          </nav>

          {/* Features */}
          <section aria-label="Key features" className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="font-semibold text-foreground">10 min</p>
              <p className="text-xs text-muted-foreground">Quick assessment</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">No equipment</p>
              <p className="text-xs text-muted-foreground">Just a chair & wall</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Private</p>
              <p className="text-xs text-muted-foreground">Data stays local</p>
            </div>
          </section>
        </article>
      </main>

      {/* Disclaimer footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-xs text-muted-foreground max-w-md mx-auto flex items-center justify-center gap-1">
          <ShieldIcon />
          For educational purposes only. Not medical advice.
          Consult a healthcare provider for health concerns.
        </p>
        <p className="text-xs text-muted-foreground mt-2">© 2026 Entropy Age. All rights reserved.</p>
      </footer>
    </div>
  );
}
