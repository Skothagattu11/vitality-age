import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { StepWrapper } from '@/components/StepWrapper';
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
    <div className="grid md:grid-cols-2 gap-6 h-full">
      <TutorialPanel
        title="Single-Leg Balance"
        description="This test assesses your proprioception and balance control by timing how long you can stand on one leg with eyes open."
        steps={[
          { instruction: 'Stand on one leg (your choice)', tip: 'Near a wall for safety if needed' },
          { instruction: 'Lift the other foot off the ground' },
          { instruction: 'Arms can be out for balance or at your sides' },
          { instruction: 'Hold as long as you can, up to 60 seconds' },
          { instruction: 'Try both legs and report your best time' },
        ]}
        commonMistakes={[
          'Touching the standing leg with your foot',
          'Hopping or shifting the standing foot',
          'Gripping the floor with your toes',
        ]}
        animationPlaceholder={<AnimationPlaceholder type="balance" />}
      />

      <div className="bg-card rounded-xl border border-border p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="Balance Test"
        >
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Single-Leg Balance</h2>
              <p className="text-muted-foreground text-sm">
                Try both legs and report your best time
              </p>
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
