import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { StepWrapper } from '@/components/StepWrapper';
import { HowItWorksButton } from '@/components/HowItWorksButton';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OverheadReachResult, SkippedStep } from '@/types/assessment';
import { cn } from '@/lib/utils';

interface OverheadReachStepProps {
  onComplete: (result: OverheadReachResult) => void;
  onSkip: (data: SkippedStep) => void;
  onBack: () => void;
}

export function OverheadReachStep({ onComplete, onSkip, onBack }: OverheadReachStepProps) {
  const [result, setResult] = useState<OverheadReachResult | ''>('');

  const canProgress = result !== '';

  const handleNext = () => {
    if (!canProgress) return;
    onComplete(result as OverheadReachResult);
  };

  const options: { value: OverheadReachResult; label: string; desc: string }[] = [
    { 
      value: 'yes-easily', 
      label: 'Yes, easily', 
      desc: 'Full range with no tension' 
    },
    { 
      value: 'yes-with-effort', 
      label: 'Yes, with effort', 
      desc: 'Can reach but feels tight' 
    },
    { 
      value: 'compensate', 
      label: 'Only with compensation', 
      desc: 'Need to arch back or bend elbows' 
    },
    { 
      value: 'discomfort', 
      label: 'No, causes discomfort', 
      desc: 'Pain or significant restriction' 
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6 h-full">
      <TutorialPanel
        title="Overhead Reach"
        description="Test shoulder mobility by reaching overhead while keeping your back against a wall."
        steps={[
          { instruction: 'Stand with back against wall' },
          { instruction: 'Keep lower back touching the wall' },
          { instruction: 'Raise both arms overhead with straight elbows' },
        ]}
        animationPlaceholder={<AnimationPlaceholder type="overhead-reach" />}
      />

      <div className="bg-card rounded-xl border border-border p-4 md:p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="Overhead Reach"
        >
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg md:text-xl font-semibold">Overhead Reach</h2>
              <HowItWorksButton
                testName="Overhead Reach"
                measure="Shoulder and thoracic spine mobility when reaching overhead against a wall."
                relevance="Upper body mobility affects posture, breathing, and daily activities. Restricted overhead mobility is common with aging and sedentary lifestyles."
              />
            </div>

            <RadioGroup value={result} onValueChange={(v) => setResult(v as OverheadReachResult)}>
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
