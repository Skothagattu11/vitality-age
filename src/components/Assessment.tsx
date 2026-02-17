import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { LandingPage } from '@/components/LandingPage';
import { useAssessment } from '@/hooks/useAssessment';
import { calculateResults } from '@/utils/scoring';
import { TOTAL_STEPS, UserProfile } from '@/types/assessment';
import { cn } from '@/lib/utils';

// Step names for analytics
const STEP_NAMES = [
  'landing',
  'setup',
  'sit-to-stand',
  'wall-sit',
  'balance',
  'march-recovery',
  'overhead-reach',
  'cross-legged',
  'integration',
  'recovery-context',
  'results',
];

// Lazy load components that use Radix/heavy deps - not needed for landing
const ProgressHeader = lazy(() => import('@/components/ProgressHeader'));

// Lazy load framer-motion wrapped components
const AnimatedStepWrapper = lazy(() => import('@/components/AnimatedStepWrapper'));

// Lazy load step components
const SetupPage = lazy(() => import('@/components/SetupPage').then(m => ({ default: m.SetupPage })));
const ResultsPage = lazy(() => import('@/components/ResultsPage').then(m => ({ default: m.ResultsPage })));
const SitToStandStep = lazy(() => import('@/components/steps/SitToStandStep').then(m => ({ default: m.SitToStandStep })));
const WallSitStep = lazy(() => import('@/components/steps/WallSitStep').then(m => ({ default: m.WallSitStep })));
const BalanceStep = lazy(() => import('@/components/steps/BalanceStep').then(m => ({ default: m.BalanceStep })));
const MarchRecoveryStep = lazy(() => import('@/components/steps/MarchRecoveryStep').then(m => ({ default: m.MarchRecoveryStep })));
const OverheadReachStep = lazy(() => import('@/components/steps/OverheadReachStep').then(m => ({ default: m.OverheadReachStep })));
const CrossLeggedStep = lazy(() => import('@/components/steps/CrossLeggedStep').then(m => ({ default: m.CrossLeggedStep })));
const IntegrationStep = lazy(() => import('@/components/steps/IntegrationStep').then(m => ({ default: m.IntegrationStep })));
const RecoveryContextStep = lazy(() => import('@/components/steps/RecoveryContextStep').then(m => ({ default: m.RecoveryContextStep })));

// Prefetch functions - call these to load components in background
const prefetchSetupPage = () => {
  import('@/components/AnimatedStepWrapper');
  import('@/components/SetupPage');
  import('framer-motion');
};

const prefetchFirstSteps = () => {
  import('@/components/steps/SitToStandStep');
  import('@/components/steps/WallSitStep');
  import('@/components/steps/BalanceStep');
};

const prefetchRemainingSteps = () => {
  import('@/components/steps/MarchRecoveryStep');
  import('@/components/steps/OverheadReachStep');
  import('@/components/steps/CrossLeggedStep');
  import('@/components/steps/IntegrationStep');
  import('@/components/steps/RecoveryContextStep');
};

const prefetchResultsPage = () => {
  import('@/components/ResultsPage');
  import('html2canvas');
};

// Loading fallback for lazy components
const StepLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Simple CSS-based modals - no Radix dependencies
function SimpleOnboardingTooltip({ show, onDismiss }: { show: boolean; onDismiss: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-8 md:max-w-sm z-50 animate-fade-in-up">
      <div className="bg-card border border-border rounded-xl shadow-medium p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-lg">💡</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Welcome to the Assessment!</h3>
            <p className="text-sm text-muted-foreground">
              On desktop, you'll see tutorial instructions on the left. On mobile, tap
              the tutorial card at the top to expand instructions for each test.
            </p>
            <button
              onClick={onDismiss}
              className="mt-2 -ml-2 px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
            >
              Got it →
            </button>
          </div>
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground p-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function SimpleResetDialog({ show, onCancel, onConfirm }: { show: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-card border border-border rounded-xl shadow-medium p-6 max-w-sm w-full animate-scale-in">
        <h3 className="font-semibold text-lg mb-2">Reset Assessment?</h3>
        <p className="text-muted-foreground text-sm mb-6">
          This will clear all your progress and start over. Your previous results will be lost.
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

export function Assessment() {
  const {
    data,
    updateData,
    goToStep,
    nextStep,
    prevStep,
    reset,
    progress,
    hasSeenOnboarding,
    markOnboardingSeen,
  } = useAssessment();

  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Check if user clicked start button before React loaded
  useEffect(() => {
    if ((window as any).__userClickedStart && data.currentStep === 0) {
      goToStep(1);
      delete (window as any).__userClickedStart;
    }
  }, [goToStep, data.currentStep]);

  // Track step changes and scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track page/step view
    const stepName = STEP_NAMES[data.currentStep] || `step-${data.currentStep}`;
    track('step_view', {
      step: data.currentStep,
      step_name: stepName,
    });
  }, [data.currentStep]);

  // Predictive prefetching - load next components while user is on current step
  useEffect(() => {
    // Use requestIdleCallback for non-blocking prefetch, fallback to setTimeout
    const schedulePreload = (fn: () => void, delay = 1000) => {
      if ('requestIdleCallback' in window) {
        setTimeout(() => requestIdleCallback(fn), delay);
      } else {
        setTimeout(fn, delay);
      }
    };

    switch (data.currentStep) {
      case 0: // On Landing Page - preload SetupPage + framer-motion
        schedulePreload(prefetchSetupPage, 500);
        break;
      case 1: // On SetupPage (form) - user takes time here, preload first steps
        schedulePreload(prefetchFirstSteps, 1000);
        break;
      case 3: // On WallSit - preload remaining steps
        schedulePreload(prefetchRemainingSteps, 500);
        break;
      case 7: // On CrossLegged - preload Results page
        schedulePreload(prefetchResultsPage, 500);
        break;
    }
  }, [data.currentStep]);

  // Show onboarding tooltip on first visit when starting assessment
  useEffect(() => {
    if (data.currentStep === 1 && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [data.currentStep, hasSeenOnboarding]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    markOnboardingSeen();
  };

  const handleReset = () => {
    reset();
    setShowResetConfirm(false);
    navigate('/');
  };

  // Calculate results when on the results step (step 10)
  const results = data.currentStep === 10 ? calculateResults(data) : null;

  // Render current step content (without wrapper)
  const renderStepContent = () => {
    switch (data.currentStep) {
      case 1:
        return (
          <SetupPage
            onComplete={(profile: UserProfile) => {
              updateData('userProfile', profile);
              nextStep();
            }}
            onBack={() => navigate('/')}
          />
        );

      case 2:
        return (
          <SitToStandStep
            onComplete={(result) => {
              updateData('sitToStand', result);
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('sitToStand', skipData);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 3:
        return (
          <WallSitStep
            onComplete={(result) => {
              updateData('wallSit', result);
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('wallSit', skipData);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 4:
        return (
          <BalanceStep
            onComplete={(result) => {
              updateData('balance', result);
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('balance', skipData);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 5:
        return (
          <MarchRecoveryStep
            onComplete={(result) => {
              updateData('marchRecovery', result);
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('marchRecovery', skipData);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 6:
        return (
          <OverheadReachStep
            onComplete={(result) => {
              updateData('overheadReach', result);
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('overheadReach', skipData);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 7:
        return (
          <CrossLeggedStep
            onComplete={(result) => {
              updateData('crossLegged', result);
              nextStep();
            }}
            onSkip={(skipData) => {
              updateData('crossLegged', skipData);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 8:
        return (
          <IntegrationStep
            onComplete={(result) => {
              updateData('integration', result);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 9:
        return (
          <RecoveryContextStep
            onComplete={(result) => {
              updateData('recoveryContext', result);
              updateData('completedAt', new Date().toISOString());
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 10:
        if (results) {
          return (
            <ResultsPage
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

  const showProgress = data.currentStep > 0 && data.currentStep < 10;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress - lazy loaded */}
      {showProgress && (
        <Suspense fallback={null}>
          <ProgressHeader
            currentStep={data.currentStep}
            onResetClick={() => setShowResetConfirm(true)}
          />
        </Suspense>
      )}

      {/* Main content */}
      <main className={cn(
        "w-full max-w-5xl mx-auto px-4",
        showProgress && "py-6"
      )}>
        {/* Landing page renders immediately without any wrapper */}
        {data.currentStep === 0 ? (
          <LandingPage onStart={() => goToStep(1)} onBack={() => navigate('/')} />
        ) : (
          /* Other steps use lazy-loaded animated wrapper */
          <Suspense fallback={<StepLoader />}>
            <AnimatedStepWrapper stepKey={data.currentStep}>
              {renderStepContent()}
            </AnimatedStepWrapper>
          </Suspense>
        )}
      </main>

      {/* Modals - use simple CSS versions (framer-motion will be loaded by now anyway) */}
      <SimpleOnboardingTooltip show={showOnboarding} onDismiss={dismissOnboarding} />
      <SimpleResetDialog
        show={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}
