import { useState } from 'react';
import { StepWrapper } from '@/components/StepWrapper';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RecoveryContextResult, MorningStiffness, PostWorkoutSoreness } from '@/types/assessment';
import { cn } from '@/lib/utils';
import { Sun, Dumbbell } from 'lucide-react';

interface RecoveryContextStepProps {
  onComplete: (result: RecoveryContextResult) => void;
  onBack: () => void;
}

export function RecoveryContextStep({ onComplete, onBack }: RecoveryContextStepProps) {
  const [stiffness, setStiffness] = useState<MorningStiffness | ''>('');
  const [soreness, setSoreness] = useState<PostWorkoutSoreness | ''>('');

  const canProgress = stiffness !== '' && soreness !== '';

  const handleNext = () => {
    if (!canProgress) return;
    onComplete({
      morningStiffness: stiffness as MorningStiffness,
      postWorkoutSoreness: soreness as PostWorkoutSoreness,
    });
  };

  const stiffnessOptions: { value: MorningStiffness; label: string }[] = [
    { value: 'none', label: 'None – I wake up feeling loose' },
    { value: '<5m', label: 'Less than 5 minutes' },
    { value: '5-15m', label: '5-15 minutes' },
    { value: '>15m', label: 'More than 15 minutes' },
  ];

  const sorenessOptions: { value: PostWorkoutSoreness; label: string }[] = [
    { value: '<24h', label: 'Less than 24 hours' },
    { value: '1-2d', label: '1-2 days' },
    { value: '3+d', label: '3 or more days' },
    { value: 'avoid-workouts', label: 'I avoid hard workouts' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl border border-border p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          canProgress={canProgress}
          testName="Recovery Context"
          showSkip={false}
          nextLabel="See Results"
        >
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Recovery Context</h2>
              <p className="text-muted-foreground text-sm">
                A few questions about how your body typically recovers
              </p>
            </div>

            {/* Morning stiffness */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-warning" />
                <Label className="text-base font-medium">
                  How long does morning stiffness typically last?
                </Label>
              </div>
              <RadioGroup value={stiffness} onValueChange={(v) => setStiffness(v as MorningStiffness)}>
                <div className="space-y-2">
                  {stiffnessOptions.map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                        stiffness === option.value
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

            {/* Post-workout soreness */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-secondary" />
                <Label className="text-base font-medium">
                  How long does muscle soreness last after a hard workout?
                </Label>
              </div>
              <RadioGroup value={soreness} onValueChange={(v) => setSoreness(v as PostWorkoutSoreness)}>
                <div className="space-y-2">
                  {sorenessOptions.map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                        soreness === option.value
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
          </div>
        </StepWrapper>
      </div>
    </div>
  );
}
