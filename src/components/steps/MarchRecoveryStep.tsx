import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { Timer } from '@/components/Timer';
import { StepWrapper } from '@/components/StepWrapper';
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
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [breathingDifficulty, setBreathingDifficulty] = useState(5);
  const [recoveryTime, setRecoveryTime] = useState<RecoveryTime | ''>('');
  const [noseBreathing, setNoseBreathing] = useState(5);

  const canProgress = timerCompleted && recoveryTime !== '';

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
    <div className="grid md:grid-cols-2 gap-6 h-full">
      <TutorialPanel
        title="60-Second March + Recovery"
        description="This test measures your cardiovascular fitness and recovery speed through high-knee marching in place."
        steps={[
          { instruction: 'Stand in place with space to lift your knees' },
          { instruction: 'When timer starts, march in place lifting knees to hip height' },
          { instruction: 'Maintain a steady, challenging pace for 60 seconds' },
          { instruction: 'When timer ends, note how quickly you recover' },
        ]}
        commonMistakes={[
          'Not lifting knees high enough',
          'Going too fast at the start and slowing down',
          'Holding your breath',
        ]}
        animationPlaceholder={<AnimationPlaceholder type="march" />}
      />

      <div className="bg-card rounded-xl border border-border p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="March + Recovery Test"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">60-Second March</h2>
              <p className="text-muted-foreground text-sm">
                March in place with high knees for 60 seconds
              </p>
            </div>

            {/* Timer */}
            <Timer
              duration={60}
              onComplete={() => setTimerCompleted(true)}
              size="md"
              className="py-2"
            />

            {timerCompleted && (
              <div className="space-y-6 animate-fade-in-up">
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
            )}

            {!timerCompleted && (
              <p className="text-center text-sm text-muted-foreground">
                Start the timer and march with high knees
              </p>
            )}
          </div>
        </StepWrapper>
      </div>
    </div>
  );
}
