import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { useBrainAge } from '@/hooks/useBrainAge';
import { calculateBrainAgeResults } from '@/utils/brainAgeScoring';
import { BRAIN_AGE_TOTAL_STEPS, BrainAgeProfile } from '@/types/brainAge';
import { cn } from '@/lib/utils';

// Step names for analytics
const STEP_NAMES = [
  'landing',
  'setup',
  'lightning-tap',
  'color-clash',
  'memory-matrix',
  'focus-filter',
  'trail-switch',
  'results',
];

// Lazy load components
const AnimatedStepWrapper = lazy(() => import('@/components/AnimatedStepWrapper'));
const BrainAgeLanding = lazy(() => import('@/components/brain-age/BrainAgeLanding').then(m => ({ default: m.BrainAgeLanding })));
const BrainAgeSetup = lazy(() => import('@/components/brain-age/BrainAgeSetup').then(m => ({ default: m.BrainAgeSetup })));
const BrainAgeResults = lazy(() => import('@/components/brain-age/BrainAgeResults').then(m => ({ default: m.BrainAgeResults })));
const LightningTap = lazy(() => import('@/components/brain-age/games/LightningTap').then(m => ({ default: m.LightningTap })));
const ColorClash = lazy(() => import('@/components/brain-age/games/ColorClash').then(m => ({ default: m.ColorClash })));
const MemoryMatrix = lazy(() => import('@/components/brain-age/games/MemoryMatrix').then(m => ({ default: m.MemoryMatrix })));
const FocusFilter = lazy(() => import('@/components/brain-age/games/FocusFilter').then(m => ({ default: m.FocusFilter })));
const TrailSwitch = lazy(() => import('@/components/brain-age/games/TrailSwitch').then(m => ({ default: m.TrailSwitch })));

// Prefetch functions
const prefetchSetup = () => {
  import('@/components/AnimatedStepWrapper');
  import('@/components/brain-age/BrainAgeSetup');
  import('framer-motion');
};

const prefetchFirstGames = () => {
  import('@/components/brain-age/games/LightningTap');
  import('@/components/brain-age/games/ColorClash');
};

const prefetchRemainingGames = () => {
  import('@/components/brain-age/games/MemoryMatrix');
  import('@/components/brain-age/games/FocusFilter');
  import('@/components/brain-age/games/TrailSwitch');
};

const prefetchResults = () => {
  import('@/components/brain-age/BrainAgeResults');
  import('recharts');
  import('html2canvas');
};

// Loading fallback
const StepLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Progress header for brain age (violet accent)
function BrainAgeProgressHeader({ currentStep, onResetClick }: { currentStep: number; onResetClick: () => void }) {
  const stepLabels = ['Setup', 'Lightning Tap', 'Color Clash', 'Memory Matrix', 'Focus Filter', 'Trail Switch', 'Results'];
  const adjustedStep = currentStep - 1; // steps 1-7 map to labels 0-6
  const progress = (currentStep / (BRAIN_AGE_TOTAL_STEPS - 1)) * 100;

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="w-full max-w-4xl mx-auto py-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-semibold text-secondary">Brain Age</h1>
          <button
            type="button"
            onClick={onResetClick}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
            Reset
          </button>
        </div>
        {/* Mobile progress bar */}
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium">{stepLabels[adjustedStep] || `Step ${adjustedStep + 1}`}</span>
          <span className="text-muted-foreground">{currentStep} / {BRAIN_AGE_TOTAL_STEPS - 1}</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-400 ease-out"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: 'linear-gradient(90deg, hsl(262 83% 58%), hsl(189 100% 50%))',
            }}
          />
        </div>
      </div>
    </header>
  );
}

// Reset dialog
function SimpleResetDialog({ show, onCancel, onConfirm }: { show: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-card border border-border rounded-xl shadow-medium p-6 max-w-sm w-full animate-scale-in">
        <h3 className="font-semibold text-lg mb-2">Reset Assessment?</h3>
        <p className="text-muted-foreground text-sm mb-6">
          This will clear all your progress and start over. Your game results will be lost.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 px-4 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 px-4 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export function BrainAgeAssessment() {
  const {
    data,
    updateData,
    goToStep,
    nextStep,
    prevStep,
    reset,
  } = useBrainAge();

  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Track step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const stepName = STEP_NAMES[data.currentStep] || `step-${data.currentStep}`;
    track('brain_age_step_view', { step: data.currentStep, step_name: stepName });
  }, [data.currentStep]);

  // Predictive prefetching
  useEffect(() => {
    const schedulePreload = (fn: () => void, delay = 1000) => {
      if ('requestIdleCallback' in window) {
        setTimeout(() => requestIdleCallback(fn), delay);
      } else {
        setTimeout(fn, delay);
      }
    };

    switch (data.currentStep) {
      case 0:
        schedulePreload(prefetchSetup, 500);
        break;
      case 1:
        schedulePreload(prefetchFirstGames, 1000);
        break;
      case 3:
        schedulePreload(prefetchRemainingGames, 500);
        break;
      case 6:
        schedulePreload(prefetchResults, 500);
        break;
    }
  }, [data.currentStep]);

  const handleReset = () => {
    reset();
    setShowResetConfirm(false);
    navigate('/');
  };

  // Calculate results at step 7
  const results = data.currentStep === 7 ? calculateBrainAgeResults(data) : null;

  const renderStepContent = () => {
    switch (data.currentStep) {
      case 0:
        return (
          <BrainAgeLanding
            onStart={() => goToStep(1)}
            onBack={() => navigate('/')}
          />
        );

      case 1:
        return (
          <BrainAgeSetup
            onComplete={(profile: BrainAgeProfile) => {
              updateData('profile', profile);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 2:
        return (
          <LightningTap
            onComplete={(result) => {
              updateData('lightningTap', result);
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('lightningTap', skipData);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 3:
        return (
          <ColorClash
            onComplete={(result) => {
              updateData('colorClash', result);
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('colorClash', skipData);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 4:
        return (
          <MemoryMatrix
            onComplete={(result) => {
              updateData('memoryMatrix', result);
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('memoryMatrix', skipData);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 5:
        return (
          <FocusFilter
            onComplete={(result) => {
              updateData('focusFilter', result);
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('focusFilter', skipData);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 6:
        return (
          <TrailSwitch
            onComplete={(result) => {
              updateData('trailSwitch', result);
              updateData('completedAt', new Date().toISOString());
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('trailSwitch', skipData);
              updateData('completedAt', new Date().toISOString());
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 7:
        if (results) {
          return (
            <BrainAgeResults
              result={results}
              data={data}
              onRetake={handleReset}
            />
          );
        }
        return null;

      default:
        return null;
    }
  };

  const showProgress = data.currentStep > 0 && data.currentStep < 7;

  return (
    <div className="min-h-screen bg-background">
      {showProgress && (
        <BrainAgeProgressHeader
          currentStep={data.currentStep}
          onResetClick={() => setShowResetConfirm(true)}
        />
      )}

      <main className={cn(
        "w-full max-w-5xl mx-auto px-4",
        showProgress && "py-6"
      )}>
        {data.currentStep === 0 ? (
          <Suspense fallback={<StepLoader />}>
            <BrainAgeLanding
              onStart={() => goToStep(1)}
              onBack={() => navigate('/')}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<StepLoader />}>
            <AnimatedStepWrapper stepKey={data.currentStep}>
              {renderStepContent()}
            </AnimatedStepWrapper>
          </Suspense>
        )}
      </main>

      <SimpleResetDialog
        show={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}
