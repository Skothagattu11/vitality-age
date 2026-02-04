import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { Timer } from '@/components/Timer';
import { StepWrapper } from '@/components/StepWrapper';
import { HowItWorksButton } from '@/components/HowItWorksButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SitToStandResult, SkippedStep } from '@/types/assessment';

interface SitToStandStepProps {
  onComplete: (result: SitToStandResult) => void;
  onSkip: (data: SkippedStep) => void;
  onBack: () => void;
}

export function SitToStandStep({ onComplete, onSkip, onBack }: SitToStandStepProps) {
  const [reps, setReps] = useState<string>('');
  const [exertion, setExertion] = useState<number>(5);

  const canProgress = reps !== '' && parseInt(reps) >= 0;

  const handleNext = () => {
    if (!canProgress) return;
    onComplete({
      reps: parseInt(reps),
      perceivedExertion: exertion,
    });
  };

  const exertionLabels = ['None', 'Very Light', 'Light', 'Moderate', 'Somewhat Hard', 'Hard', 'Very Hard', 'Very Very Hard', 'Extremely Hard', 'Maximum'];

  return (
    <div className="grid md:grid-cols-2 gap-4 md:gap-6 h-full">
      {/* Tutorial Panel */}
      <TutorialPanel
        title="Sit-to-Stand Test"
        description="Count how many times you can stand up from a chair in 30 seconds."
        steps={[
          { instruction: 'Sit in a chair with arms crossed over chest' },
          { instruction: 'Stand up fully, then sit back down' },
          { instruction: 'Repeat as many times as you can in 30 seconds' },
        ]}
        animationPlaceholder={<AnimationPlaceholder type="sit-to-stand" />}
      />

      {/* Input Panel */}
      <div className="bg-card rounded-xl border border-border p-4 md:p-6 space-y-4">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="Sit-to-Stand Test"
        >
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg md:text-xl font-semibold">30-Second Chair Test</h2>
              <HowItWorksButton
                testName="Sit-to-Stand Test"
                measure="Number of complete sit-to-stand cycles in 30 seconds, measuring lower body strength and power."
                relevance="Lower body strength directly correlates with mobility, fall risk, and independence. Research shows this test strongly predicts functional age and longevity."
              />
            </div>

            {/* Timer */}
            <Timer
              duration={30}
              onComplete={() => {}}
              size="lg"
              className="py-4"
            />

            {/* Results input - always visible */}
            <div className="space-y-6">
              {/* Reps input */}
              <div className="space-y-2">
                <Label htmlFor="reps" className="text-base font-medium">
                  How many sit-to-stands did you complete?
                </Label>
                <Input
                  id="reps"
                  type="number"
                  min={0}
                  max={50}
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="Enter number of reps"
                  className="h-14 text-2xl text-center font-bold"
                />
              </div>

              {/* Exertion slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <Label className="text-base font-medium">
                    How hard did that feel? (0-10)
                  </Label>
                  <span className="text-2xl font-bold text-primary">{exertion}</span>
                </div>
                <Slider
                  value={[exertion]}
                  onValueChange={(v) => setExertion(v[0])}
                  max={10}
                  min={0}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>None</span>
                  <span>Maximum</span>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {exertionLabels[exertion]}
                </p>
              </div>
            </div>
          </div>
        </StepWrapper>
      </div>
    </div>
  );
}
