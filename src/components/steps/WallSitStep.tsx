import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { StepWrapper } from '@/components/StepWrapper';
import { HowItWorksButton } from '@/components/HowItWorksButton';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { WallSitResult, WallSitDuration, WallSitStopReason, SkippedStep } from '@/types/assessment';
import { cn } from '@/lib/utils';

interface WallSitStepProps {
  onComplete: (result: WallSitResult) => void;
  onSkip: (data: SkippedStep) => void;
  onBack: () => void;
}

export function WallSitStep({ onComplete, onSkip, onBack }: WallSitStepProps) {
  const [duration, setDuration] = useState<WallSitDuration | ''>('');
  const [stopReason, setStopReason] = useState<WallSitStopReason | ''>('');

  const canProgress = duration !== '' && stopReason !== '';

  const handleNext = () => {
    if (!canProgress) return;
    onComplete({
      duration: duration as WallSitDuration,
      stopReason: stopReason as WallSitStopReason,
    });
  };

  const durationOptions: { value: WallSitDuration; label: string }[] = [
    { value: '<30s', label: 'Less than 30 seconds' },
    { value: '30-60s', label: '30-60 seconds' },
    { value: '60-120s', label: '1-2 minutes' },
    { value: '2-3m', label: '2-3 minutes' },
    { value: '3m+', label: 'More than 3 minutes' },
  ];

  const stopReasonOptions: { value: WallSitStopReason; label: string }[] = [
    { value: 'muscle-pain', label: 'Muscle burn/fatigue' },
    { value: 'breathlessness', label: 'Breathlessness' },
    { value: 'joint-discomfort', label: 'Joint discomfort' },
    { value: 'mental-discomfort', label: 'Just wanted to stop' },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4 md:gap-6 h-full">
      <TutorialPanel
        title="Wall Sit Hold"
        description="Hold a seated position against a wall as long as you can."
        steps={[
          { instruction: 'Stand with back against wall, slide down to 90°' },
          { instruction: 'Keep back flat against the wall' },
          { instruction: 'Hold as long as you can' },
        ]}
        animationPlaceholder={<AnimationPlaceholder type="wall-sit" />}
      />

      <div className="bg-card rounded-xl border border-border p-4 md:p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="Wall Sit"
        >
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg md:text-xl font-semibold">Wall Sit Hold</h2>
              <HowItWorksButton
                testName="Wall Sit Hold"
                measure="Duration you can maintain a wall sit position, testing isometric leg endurance."
                relevance="Muscular endurance indicates how well your body sustains effort. Poor endurance correlates with accelerated aging and reduced daily function."
              />
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <Label className="text-base font-medium">How long did you hold?</Label>
              <RadioGroup value={duration} onValueChange={(v) => setDuration(v as WallSitDuration)}>
                <div className="space-y-2">
                  {durationOptions.map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                        duration === option.value
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

            {/* Stop reason */}
            <div className="space-y-3">
              <Label className="text-base font-medium">What made you stop?</Label>
              <RadioGroup value={stopReason} onValueChange={(v) => setStopReason(v as WallSitStopReason)}>
                <div className="grid grid-cols-2 gap-2">
                  {stopReasonOptions.map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm',
                        stopReason === option.value
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
