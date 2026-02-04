import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { StepWrapper } from '@/components/StepWrapper';
import { HowItWorksButton } from '@/components/HowItWorksButton';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CrossLeggedResult, SkippedStep } from '@/types/assessment';
import { cn } from '@/lib/utils';

interface CrossLeggedStepProps {
  onComplete: (result: CrossLeggedResult) => void;
  onSkip: (data: SkippedStep) => void;
  onBack: () => void;
}

export function CrossLeggedStep({ onComplete, onSkip, onBack }: CrossLeggedStepProps) {
  const [result, setResult] = useState<CrossLeggedResult | ''>('');

  const canProgress = result !== '';

  const handleNext = () => {
    if (!canProgress) return;
    onComplete(result as CrossLeggedResult);
  };

  const options: { value: CrossLeggedResult; label: string; desc: string }[] = [
    { 
      value: 'yes-relaxed', 
      label: 'Yes, relaxed', 
      desc: 'Comfortable with good posture' 
    },
    { 
      value: 'yes-stiff', 
      label: 'Yes, but stiff', 
      desc: 'Feels tight in hips' 
    },
    { 
      value: 'only-briefly', 
      label: 'Only briefly', 
      desc: 'Uncomfortable after a few seconds' 
    },
    { 
      value: 'not-at-all', 
      label: 'Not really', 
      desc: 'Cannot get into position' 
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6 h-full">
      <TutorialPanel
        title="Cross-Legged Sit"
        description="Test hip mobility by sitting cross-legged on the floor."
        steps={[
          { instruction: 'Sit on the floor with legs crossed' },
          { instruction: 'Try to keep your back straight' },
          { instruction: 'Notice how your hips feel in this position' },
        ]}
        animationPlaceholder={<AnimationPlaceholder type="cross-legged" />}
      />

      <div className="bg-card rounded-xl border border-border p-4 md:p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="Cross-Legged Sit"
        >
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg md:text-xl font-semibold">Cross-Legged Sit</h2>
              <HowItWorksButton
                testName="Cross-Legged Sit"
                measure="Hip flexibility and ability to comfortably sit cross-legged on the floor."
                relevance="Hip mobility affects lower back health, gait, and the ability to get up from the floor—a key predictor of longevity and independence."
              />
            </div>

            <RadioGroup value={result} onValueChange={(v) => setResult(v as CrossLeggedResult)}>
              <div className="space-y-3">
                {options.map((option) => (
                  <Label
                    key={option.value}
                    className={cn(
                      'flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all',
                      result === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={option.value} />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground ml-7 mt-1">
                      {option.desc}
                    </span>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        </StepWrapper>
      </div>
    </div>
  );
}
