import { Sparkles, ArrowRight, Info, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Glow effect background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 md:w-80 h-60 md:h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-60 md:w-80 h-60 md:h-80 bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-6 relative z-10">
        <div className="max-w-lg w-full text-center space-y-8 animate-fade-in-up">
          {/* Logo / Title */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 animate-float">
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
          </div>

          {/* Value prop */}
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            10 minutes. 5 simple tests. See how your body recovers.
          </p>

          {/* CTAs */}
          <div className="space-y-4">
            <Button
              variant="hero"
              size="xl"
              onClick={onStart}
              className="w-full sm:w-auto animate-glow-pulse"
            >
              Start Assessment
              <ArrowRight className="w-5 h-5" />
            </Button>

            <div>
              <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-muted-foreground">
                    <Info className="w-4 h-4 mr-1" />
                    How it works
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>How Entropy Age Works</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      Entropy Age estimates your functional biological age through
                      5 simple at-home tests that measure:
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">1.</span>
                        <span><strong>Lower-body strength</strong> - Chair sit-to-stand test</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">2.</span>
                        <span><strong>Muscular endurance</strong> - Wall sit hold</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">3.</span>
                        <span><strong>Balance & proprioception</strong> - Single-leg balance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">4.</span>
                        <span><strong>Cardiovascular recovery</strong> - 60-second march</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">5.</span>
                        <span><strong>Mobility</strong> - Overhead reach & seated flexibility</span>
                      </li>
                    </ul>
                    <p>
                      Your answers are scored against age-adjusted benchmarks to
                      estimate how well your body functions compared to your
                      chronological age.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4">
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
          </div>
        </div>
      </main>

      {/* Disclaimer footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-xs text-muted-foreground max-w-md mx-auto flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          For educational purposes only. Not medical advice.
          Consult a healthcare provider for health concerns.
        </p>
      </footer>
    </div>
  );
}
