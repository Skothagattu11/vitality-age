import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { Timer } from '@/components/Timer';
import { StepWrapper } from '@/components/StepWrapper';
import { HowItWorksButton } from '@/components/HowItWorksButton';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MarchRecoveryResult, RecoveryTime, SkippedStep } from '@/types/assessment';
import { cn } from '@/lib/utils';

interface MarchRecoveryStepProps {
  onComplete: (result: MarchRecoveryResult) => void;
  onSkip: (data: SkippedStep) => void;
  onBack: () => void;
}

export function MarchRecoveryStep({ onComplete, onSkip, onBack }: MarchRecoveryStepProps) {
  const [breathingDifficulty, setBreathingDifficulty] = useState(5);
  const [recoveryTime, setRecoveryTime] = useState<RecoveryTime | ''>('');
  const [noseBreathing, setNoseBreathing] = useState(5);

  const canProgress = recoveryTime !== '';

  const handleNext = () => {
    if (!canProgress) return;
    onComplete({
      breathingDifficulty,
      recoveryTime: recoveryTime as RecoveryTime,
      noseBreathingComfort: noseBreathing,
    });
  };

  const recoveryOptions: { value: RecoveryTime; label: string }[] = [
    { value: '<30s', label: 'Less than 30 seconds' },
    { value: '30-60s', label: '30-60 seconds' },
    { value: '1-2m', label: '1-2 minutes' },
    { value: '>2m', label: 'More than 2 minutes' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6 h-full">
      <TutorialPanel
        title="60-Second March"
        description="March in place with high knees for 60 seconds, then note your recovery."
        steps={[
          { instruction: 'March in place lifting knees to hip height' },
          { instruction: 'Maintain a challenging pace for 60 seconds' },
          { instruction: 'Note how quickly your breathing returns to normal' },
        ]}
        animationPlaceholder={<AnimationPlaceholder type="march" />}
      />

      <div className="bg-card rounded-xl border border-border p-4 md:p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="March + Recovery Test"
        >
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-lg md:text-xl font-semibold">60-Second March</h2>
              <HowItWorksButton
                testName="March + Recovery Test"
                measure="Cardiovascular stress response and recovery time after 60 seconds of high-knee marching."
                relevance="Heart rate recovery is a powerful indicator of cardiovascular health and overall fitness. Faster recovery correlates with younger biological age."
              />
            </div>

            {/* Timer */}
            <Timer
              duration={60}
              onComplete={() => {}}
              size="md"
              className="py-2"
            />

            {/* Results input - always visible */}
            <div className="space-y-6">
              {/* Breathing difficulty */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <Label className="text-base font-medium">
                    How hard was breathing during?
                  </Label>
                  <span className="text-xl font-bold text-primary">{breathingDifficulty}/10</span>
                </div>
                <Slider
                  value={[breathingDifficulty]}
                  onValueChange={(v) => setBreathingDifficulty(v[0])}
                  max={10}
                  min={0}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Easy</span>
                  <span>Very Hard</span>
                </div>
              </div>

              {/* Recovery time */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  How long until breathing felt normal?
                </Label>
                <RadioGroup value={recoveryTime} onValueChange={(v) => setRecoveryTime(v as RecoveryTime)}>
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryOptions.map((option) => (
                      <Label
                        key={option.value}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm',
                          recoveryTime === option.value
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

              {/* Nose breathing */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <Label className="text-base font-medium">
                    Could you breathe through your nose?
                  </Label>
                  <span className="text-xl font-bold text-primary">{noseBreathing}/10</span>
                </div>
                <Slider
                  value={[noseBreathing]}
                  onValueChange={(v) => setNoseBreathing(v[0])}
                  max={10}
                  min={0}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not at all</span>
                  <span>Completely</span>
                </div>
              </div>
            </div>
          </div>
        </StepWrapper>
      </div>
    </div>
  );
}
