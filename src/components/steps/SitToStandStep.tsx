import { useState } from 'react';
import { TutorialPanel } from '@/components/TutorialPanel';
import { AnimationPlaceholder } from '@/components/AnimationPlaceholder';
import { Timer } from '@/components/Timer';
import { StepWrapper } from '@/components/StepWrapper';
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
    <div className="grid md:grid-cols-2 gap-6 h-full">
      {/* Tutorial Panel */}
      <TutorialPanel
        title="Sit-to-Stand Test"
        description="This test measures your lower body strength and endurance by counting how many times you can stand up from a seated position in 30 seconds."
        steps={[
          { instruction: 'Sit in a chair with your feet flat on the floor', tip: 'Keep your arms crossed over your chest' },
          { instruction: 'When the timer starts, stand up fully then sit back down' },
          { instruction: 'Repeat as many times as you can in 30 seconds' },
          { instruction: 'Count each full stand-up as one rep' },
        ]}
        commonMistakes={[
          'Not standing up fully straight',
          'Using momentum or bouncing',
          'Not sitting all the way down',
        ]}
        animationPlaceholder={<AnimationPlaceholder type="sit-to-stand" />}
      />

      {/* Input Panel */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          onSkip={onSkip}
          canProgress={canProgress}
          testName="Sit-to-Stand Test"
        >
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">30-Second Chair Test</h2>
              <p className="text-muted-foreground text-sm">
                Use the timer as a guide, then enter your results below
              </p>
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
