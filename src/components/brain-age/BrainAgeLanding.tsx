import { track } from '@vercel/analytics';

interface BrainAgeLandingProps {
  onStart: () => void;
  onBack: () => void;
}

const BrainIcon = () => (
  <svg className="w-8 h-8 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
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

const GAMES = [
  { name: 'Lightning Tap', desc: 'Processing speed' },
  { name: 'Color Clash', desc: 'Executive function' },
  { name: 'Memory Matrix', desc: 'Working memory' },
  { name: 'Focus Filter', desc: 'Attention' },
  { name: 'Trail Switch', desc: 'Cognitive flexibility' },
];

export function BrainAgeLanding({ onStart, onBack }: BrainAgeLandingProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Background orbs — violet accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-60 md:w-80 h-60 md:h-80 bg-secondary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-60 md:w-80 h-60 md:h-80 bg-primary/15 rounded-full blur-[100px]" />
      </div>

      {/* Back link */}
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

      <main className="flex-1 flex items-center justify-center px-4 py-6 relative z-10">
        <article className="max-w-lg w-full text-center space-y-8 animate-fade-in-up">
          {/* Title */}
          <header className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 mb-4 animate-float" aria-hidden="true">
              <BrainIcon />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="gradient-text">Brain Age</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-foreground/90">
              Cognitive Sharpness Assessment
            </p>
          </header>

          {/* Game list preview */}
          <section className="glass-card rounded-2xl p-6 sm:p-8 text-left space-y-4" aria-label="Games overview">
            <p className="text-muted-foreground leading-relaxed">
              5 quick games testing your cognitive abilities across multiple dimensions:
            </p>
            <ul className="space-y-3 text-sm">
              {GAMES.map((game, i) => (
                <li key={game.name} className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-secondary">{i + 1}</span>
                  </span>
                  <span>
                    <span className="font-medium text-foreground">{game.name}</span>
                    {' — '}
                    {game.desc}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <nav className="space-y-4" aria-label="Start assessment">
            <button
              type="button"
              onClick={() => {
                track('button_click', { button: 'start_brain_age', page: 'landing' });
                onStart();
              }}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-14 px-10 text-lg font-semibold text-secondary-foreground bg-secondary rounded-xl shadow-glow-violet hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] touch-manipulation"
              aria-label="Start the brain age assessment"
            >
              Start Assessment
              <ArrowRightIcon />
            </button>
          </nav>

          {/* Features */}
          <section aria-label="Key features" className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="font-semibold text-foreground">&lt; 5 min</p>
              <p className="text-xs text-muted-foreground">Quick games</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">5 games</p>
              <p className="text-xs text-muted-foreground">Cognitive domains</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Private</p>
              <p className="text-xs text-muted-foreground">Data stays local</p>
            </div>
          </section>
        </article>
      </main>

      <footer className="p-6 text-center relative z-10">
        <p className="text-xs text-muted-foreground max-w-md mx-auto flex items-center justify-center gap-1">
          <ShieldIcon />
          For educational purposes only. Not medical advice.
        </p>
        <p className="text-xs text-muted-foreground mt-2">&copy; 2026 Entropy Age. All rights reserved.</p>
      </footer>
    </div>
  );
}
