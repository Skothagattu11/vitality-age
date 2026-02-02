import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { StepWrapper } from '@/components/StepWrapper';
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
      desc: 'Can sit comfortably with good posture' 
    },
    { 
      value: 'yes-stiff', 
      label: 'Yes, but stiff', 
      desc: 'Can do it but feels tight in hips' 
    },
    { 
      value: 'only-briefly', 
      label: 'Only briefly', 
      desc: 'Uncomfortable after a few seconds' 
    },
    { 
      value: 'not-at-all', 
      label: 'Not really', 
      desc: 'Cannot get into position comfortably' 
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 h-full">
      <TutorialPanel
        title="Cross-Legged Sit"
        description="This test assesses your hip mobility and flexibility by checking how comfortably you can sit cross-legged on the floor."
        steps={[
          { instruction: 'Sit on the floor with legs crossed' },
          { instruction: 'Try to keep your back straight' },
          { instruction: 'Notice how your hips feel in this position' },
          { instruction: 'Hold for a few seconds to assess comfort' },
        ]}
        commonMistakes={[
          'Rounding the lower back too much',
          'Forcing the position through pain',
          'Not allowing time to settle into position',
        ]}
        animationPlaceholder={<AnimationPlaceholder type="cross-legged" />}
      />

      <div className="bg-card rounded-xl border border-border p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="Cross-Legged Sit"
        >
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Cross-Legged Sit</h2>
              <p className="text-muted-foreground text-sm">
                How comfortable can you sit cross-legged on the floor?
              </p>
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
