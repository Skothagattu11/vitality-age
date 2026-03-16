import type { OnboardingStep } from '@/types/supplementStacker';

const STEPS: OnboardingStep[] = ['welcome', 'schedule', 'activity', 'supplements', 'stack-result'];

interface ProgressBarProps {
  currentStep: OnboardingStep;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <div className="flex gap-1 mb-7">
      {STEPS.map((step, i) => (
        <div
          key={step}
          className="flex-1 h-[3px] rounded-full transition-all duration-300"
          style={{
            background: i < currentIndex
              ? 'hsl(var(--ss-accent))'
              : i === currentIndex
                ? 'hsl(var(--ss-accent) / 0.5)'
                : 'hsl(var(--ss-border))',
          }}
        />
      ))}
    </div>
  );
}
