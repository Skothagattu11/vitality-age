import { useState } from 'react';
import type { OnboardingStep } from '@/types/supplementStacker';
import type { useSupplementStacker } from '@/hooks/useSupplementStacker';
import { generateICS, downloadICS } from '@/utils/icsGenerator';
import { ProgressBar } from './ProgressBar';
import { WelcomeStep } from './WelcomeStep';
import { ScheduleStep } from './ScheduleStep';
import { ActivityStep } from './ActivityStep';
import { SupplementsStep } from './SupplementsStep';
import { StackResultStep } from './StackResultStep';
import { ReminderPromptModal } from '../modals/ReminderPromptModal';
import { SignupModal } from '../modals/SignupModal';

const STEP_ORDER: OnboardingStep[] = ['welcome', 'schedule', 'activity', 'supplements', 'stack-result'];

interface OnboardingWizardProps {
  stacker: ReturnType<typeof useSupplementStacker>;
}

export function OnboardingWizard({ stacker }: OnboardingWizardProps) {
  const {
    state,
    updateSchedule,
    updateActivity,
    toggleSupplement,
    removeSupplement,
    setSelectedStack,
    generateStacks,
    completeOnboarding,
    setOnboardingStep,
    setReminderMethod,
    setHasAccount,
  } = stacker;

  const [showReminder, setShowReminder] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const currentIndex = STEP_ORDER.indexOf(state.currentOnboardingStep);

  const goNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      const nextStep = STEP_ORDER[nextIndex];
      if (nextStep === 'stack-result') {
        generateStacks();
      }
      setOnboardingStep(nextStep);
    }
  };

  const goBack = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setOnboardingStep(STEP_ORDER[prevIndex]);
    }
  };

  const handleSaveStack = () => {
    setShowReminder(true);
  };

  const handleReminderCreateAccount = () => {
    setShowReminder(false);
    setShowSignup(true);
  };

  const handleReminderSkip = () => {
    setShowReminder(false);
    completeOnboarding();
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
    setHasAccount(true);
    const selectedStack = state.stackOptions.find(o => o.id === state.selectedStackOption);
    if (selectedStack) {
      const ics = generateICS(selectedStack, state.schedule);
      downloadICS(ics, `supplement-stack-${state.selectedStackOption}.ics`);
    }
    completeOnboarding();
  };

  const handleSignupSkip = () => {
    setShowSignup(false);
    completeOnboarding();
  };

  const handleSignInSuccess = () => {
    setShowSignIn(false);
    setHasAccount(true);
    // Returning user — skip onboarding and go straight to app
    completeOnboarding();
  };

  const renderStep = () => {
    switch (state.currentOnboardingStep) {
      case 'welcome':
        return <WelcomeStep onNext={goNext} />;
      case 'schedule':
        return (
          <ScheduleStep
            schedule={state.schedule}
            onUpdate={updateSchedule}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 'activity':
        return (
          <ActivityStep
            activity={state.activity}
            onUpdate={updateActivity}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 'supplements':
        return (
          <SupplementsStep
            supplements={state.supplements}
            onToggle={toggleSupplement}
            onRemove={removeSupplement}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 'stack-result':
        return (
          <StackResultStep
            stackOptions={state.stackOptions}
            interactions={state.interactions}
            selectedOption={state.selectedStackOption}
            onSelectOption={setSelectedStack}
            onComplete={handleSaveStack}
            onBack={goBack}
          />
        );
      default:
        return <WelcomeStep onNext={goNext} />;
    }
  };

  return (
    <div className="flex flex-col min-h-dvh p-5">
      {/* Top bar with sign-in for returning users */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1" />
        {!state.hasAccount && (
          <button
            type="button"
            onClick={() => setShowSignIn(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.95]"
            style={{
              background: 'hsl(var(--ss-surface))',
              border: '1px solid hsl(var(--ss-border))',
              color: 'hsl(var(--ss-accent))',
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>
            </svg>
            Sign In
          </button>
        )}
      </div>

      {state.currentOnboardingStep !== 'welcome' && (
        <ProgressBar currentStep={state.currentOnboardingStep} />
      )}
      {renderStep()}

      {/* Account gate modals */}
      <ReminderPromptModal
        open={showReminder}
        onSelectMethod={setReminderMethod}
        onCreateAccount={handleReminderCreateAccount}
        onSkip={handleReminderSkip}
      />
      <SignupModal
        open={showSignup}
        onSuccess={handleSignupSuccess}
        onSkip={handleSignupSkip}
        onClose={() => setShowSignup(false)}
      />

      {/* Sign-in modal for returning users */}
      <SignupModal
        open={showSignIn}
        onSuccess={handleSignInSuccess}
        onSkip={() => setShowSignIn(false)}
        onClose={() => setShowSignIn(false)}
      />
    </div>
  );
}
