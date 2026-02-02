import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { StepWrapper } from '@/components/StepWrapper';
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
      desc: 'Full range with no tension or compensation' 
    },
    { 
      value: 'yes-with-effort', 
      label: 'Yes, with effort', 
      desc: 'Can reach overhead but feels tight' 
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
    <div className="grid md:grid-cols-2 gap-6 h-full">
      <TutorialPanel
        title="Overhead Reach"
        description="This mobility test assesses your shoulder and thoracic spine mobility by checking how well you can raise your arms overhead."
        steps={[
          { instruction: 'Stand with your back against a wall' },
          { instruction: 'Keep your lower back touching the wall' },
          { instruction: 'Raise both arms overhead, trying to touch the wall' },
          { instruction: 'Keep elbows straight throughout' },
        ]}
        commonMistakes={[
          'Arching the lower back off the wall',
          'Bending the elbows to get higher',
          'Shrugging shoulders up to ears',
        ]}
        animationPlaceholder={<AnimationPlaceholder type="overhead-reach" />}
      />

      <div className="bg-card rounded-xl border border-border p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="Overhead Reach"
        >
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Overhead Reach</h2>
              <p className="text-muted-foreground text-sm">
                Can you touch the wall overhead while keeping your back flat?
              </p>
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
