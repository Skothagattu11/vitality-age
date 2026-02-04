import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { StepWrapper } from '@/components/StepWrapper';
import { HowItWorksButton } from '@/components/HowItWorksButton';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BalanceResult, BalanceDuration, BalanceEndReason, SkippedStep } from '@/types/assessment';
import { cn } from '@/lib/utils';

interface BalanceStepProps {
  onComplete: (result: BalanceResult) => void;
  onSkip: (data: SkippedStep) => void;
  onBack: () => void;
}

export function BalanceStep({ onComplete, onSkip, onBack }: BalanceStepProps) {
  const [bestTime, setBestTime] = useState<BalanceDuration | ''>('');
  const [endReason, setEndReason] = useState<BalanceEndReason | ''>('');

  const canProgress = bestTime !== '' && endReason !== '';

  const handleNext = () => {
    if (!canProgress) return;
    onComplete({
      bestTime: bestTime as BalanceDuration,
      endReason: endReason as BalanceEndReason,
    });
  };

  const durationOptions: { value: BalanceDuration; label: string }[] = [
    { value: '<10s', label: 'Less than 10 seconds' },
    { value: '10-20s', label: '10-20 seconds' },
    { value: '20-40s', label: '20-40 seconds' },
    { value: '40-60s', label: '40-60 seconds' },
    { value: '60s+', label: 'More than 60 seconds' },
  ];

  const endReasonOptions: { value: BalanceEndReason; label: string }[] = [
    { value: 'ankle-wobble', label: 'Ankle wobble' },
    { value: 'hip-instability', label: 'Hip shift/instability' },
    { value: 'loss-of-focus', label: 'Lost focus' },
    { value: 'stopped-intentionally', label: 'Stopped on purpose' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6 h-full">
      <TutorialPanel
        title="Single-Leg Balance"
        description="Stand on one leg as long as you can, up to 60 seconds."
        steps={[
          { instruction: 'Stand on one leg near a wall for safety' },
          { instruction: 'Hold as long as you can (up to 60s)' },
          { instruction: 'Try both legs and report your best time' },
        ]}
        animationPlaceholder={<AnimationPlaceholder type="balance" />}
      />

      <div className="bg-card rounded-xl border border-border p-4 md:p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="Balance Test"
        >
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg md:text-xl font-semibold">Single-Leg Balance</h2>
              <HowItWorksButton
                testName="Single-Leg Balance"
                measure="Duration you can stand on one leg, assessing proprioception and vestibular function."
                relevance="Balance ability is one of the strongest predictors of fall risk and mortality. Studies show it declines predictably with age, making it a key functional age marker."
              />
            </div>

            {/* Best time */}
            <div className="space-y-3">
              <Label className="text-base font-medium">What was your best time?</Label>
              <RadioGroup value={bestTime} onValueChange={(v) => setBestTime(v as BalanceDuration)}>
                <div className="space-y-2">
                  {durationOptions.map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                        bestTime === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="font-medium">{option.label}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* End reason */}
            <div className="space-y-3">
              <Label className="text-base font-medium">What ended your balance?</Label>
              <RadioGroup value={endReason} onValueChange={(v) => setEndReason(v as BalanceEndReason)}>
                <div className="grid grid-cols-2 gap-2">
                  {endReasonOptions.map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm',
                        endReason === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <RadioGroupItem value={option.value} />
                      <span>{option.label}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>
        </StepWrapper>
      </div>
    </div>
  );
}
