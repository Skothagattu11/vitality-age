import { Sparkles, ArrowRight, Info, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lazy, Suspense } from 'react';

// Lazy load the Dialog - not needed for initial render
const LandingHowItWorks = lazy(() => import('@/components/LandingHowItWorks'));

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Glow effect background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-60 md:w-80 h-60 md:h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-60 md:w-80 h-60 md:h-80 bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-6 relative z-10">
        <article className="max-w-lg w-full text-center space-y-8 animate-fade-in-up">
          {/* Logo / Title */}
          <header className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 animate-float" aria-hidden="true">
              <Sparkles className="w-8 h-8 text-primary" />
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

          {/* CTAs */}
          <nav className="space-y-4" aria-label="Get started">
            <Button
              variant="hero"
              size="xl"
              onClick={onStart}
              className="w-full sm:w-auto animate-glow-pulse"
              aria-label="Start the functional biological age assessment"
            >
              Start Assessment
              <ArrowRight className="w-5 h-5" />
            </Button>

            <Suspense fallback={
              <Button variant="link" className="text-muted-foreground">
                <Info className="w-4 h-4 mr-1" />
                How it works
              </Button>
            }>
              <LandingHowItWorks />
            </Suspense>
          </nav>

          {/* Features */}
          <section aria-label="Key features" className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: '10 min', subtext: 'Quick assessment' },
              { label: 'No equipment', subtext: 'Just a chair & wall' },
              { label: 'Private', subtext: 'Data stays local' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.subtext}</p>
              </div>
            ))}
          </section>
        </article>
      </main>

      {/* Disclaimer footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-xs text-muted-foreground max-w-md mx-auto flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" aria-hidden="true" />
          For educational purposes only. Not medical advice.
          Consult a healthcare provider for health concerns.
        </p>
        <p className="text-xs text-muted-foreground mt-2">© 2026 Entropy Age. All rights reserved.</p>
      </footer>
    </div>
  );
}
