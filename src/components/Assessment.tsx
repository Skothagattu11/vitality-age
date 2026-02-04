import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingPage } from '@/components/LandingPage';
import { SetupPage } from '@/components/SetupPage';
import { ResultsPage } from '@/components/ResultsPage';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { SitToStandStep } from '@/components/steps/SitToStandStep';
import { WallSitStep } from '@/components/steps/WallSitStep';
import { BalanceStep } from '@/components/steps/BalanceStep';
import { MarchRecoveryStep } from '@/components/steps/MarchRecoveryStep';
import { OverheadReachStep } from '@/components/steps/OverheadReachStep';
import { CrossLeggedStep } from '@/components/steps/CrossLeggedStep';
import { IntegrationStep } from '@/components/steps/IntegrationStep';
import { RecoveryContextStep } from '@/components/steps/RecoveryContextStep';
import { useAssessment } from '@/hooks/useAssessment';
import { calculateResults } from '@/utils/scoring';
import { TOTAL_STEPS, UserProfile } from '@/types/assessment';
import { cn } from '@/lib/utils';

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

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  };

  // Calculate results when on the results step (step 10)
  const results = data.currentStep === 10 ? calculateResults(data) : null;

  // Render current step
  const renderStep = () => {
    switch (data.currentStep) {
      case 0:
        return <LandingPage onStart={() => goToStep(1)} />;
      
      case 1:
        return (
          <SetupPage
            onComplete={(profile: UserProfile) => {
              updateData('userProfile', profile);
              nextStep();
            }}
            onBack={() => goToStep(0)}
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
        return <LandingPage onStart={() => goToStep(1)} />;
    }
  };

  const showProgress = data.currentStep > 0 && data.currentStep < 10;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress */}
      {showProgress && (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container max-w-4xl mx-auto py-4 px-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-semibold gradient-text">Entropy Age</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
            <ProgressIndicator
              currentStep={data.currentStep}
              totalSteps={TOTAL_STEPS}
            />
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={cn(
        "container max-w-5xl mx-auto",
        showProgress && "py-6 px-4"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={data.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Onboarding tooltip */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-8 md:max-w-sm z-50"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <div className="bg-card border border-border rounded-xl shadow-medium p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Welcome to the Assessment!</h3>
                  <p className="text-sm text-muted-foreground">
                    On desktop, you'll see tutorial instructions on the left. On mobile, tap 
                    the tutorial card at the top to expand instructions for each test.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissOnboarding}
                    className="mt-2 -ml-2"
                  >
                    Got it
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <button
                  onClick={dismissOnboarding}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset confirmation dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card border border-border rounded-xl shadow-medium p-6 max-w-sm w-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <h3 className="font-semibold text-lg mb-2">Reset Assessment?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                This will clear all your progress and start over. Your previous results 
                will be lost.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
