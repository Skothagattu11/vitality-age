import { useState } from 'react';
import { StepWrapper } from '@/components/StepWrapper';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { IntegrationResult, EnergyLevel, CoordinationLevel } from '@/types/assessment';
import { cn } from '@/lib/utils';
import { Battery, Zap, Activity } from 'lucide-react';

interface IntegrationStepProps {
  onComplete: (result: IntegrationResult) => void;
  onBack: () => void;
}

export function IntegrationStep({ onComplete, onBack }: IntegrationStepProps) {
  const [energy, setEnergy] = useState<EnergyLevel | ''>('');
  const [coordination, setCoordination] = useState<CoordinationLevel | ''>('');

  const canProgress = energy !== '' && coordination !== '';

  const handleNext = () => {
    if (!canProgress) return;
    onComplete({
      energyLevel: energy as EnergyLevel,
      coordinationLevel: coordination as CoordinationLevel,
    });
  };

  const energyOptions: { value: EnergyLevel; label: string; icon: React.ReactNode }[] = [
    { value: 'energized', label: 'Energized', icon: <Zap className="w-4 h-4 text-success" /> },
    { value: 'neutral', label: 'Neutral', icon: <Battery className="w-4 h-4 text-muted-foreground" /> },
    { value: 'slightly-drained', label: 'Slightly drained', icon: <Battery className="w-4 h-4 text-warning" /> },
    { value: 'very-drained', label: 'Very drained', icon: <Battery className="w-4 h-4 text-destructive" /> },
  ];

  const coordinationOptions: { value: CoordinationLevel; label: string; desc: string }[] = [
    { value: 'coordinated', label: 'Coordinated', desc: 'Movements felt smooth and controlled' },
    { value: 'functional-but-stiff', label: 'Functional but stiff', desc: 'Got the job done, but felt restricted' },
    { value: 'disconnected', label: 'Disconnected', desc: 'Felt clumsy or out of sync' },
    { value: 'fragile', label: 'Fragile', desc: 'Had to be very careful with movements' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl border border-border p-6">
        <StepWrapper
          onNext={handleNext}
          onBack={onBack}
          canProgress={canProgress}
          testName="Integration"
          showSkip={false}
        >
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">How Do You Feel?</h2>
              <p className="text-muted-foreground text-sm">
                After completing the physical tests, check in with your body
              </p>
            </div>

            {/* Energy level */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Overall energy level right now</Label>
              <RadioGroup value={energy} onValueChange={(v) => setEnergy(v as EnergyLevel)}>
                <div className="grid grid-cols-2 gap-2">
                  {energyOptions.map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                        energy === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <RadioGroupItem value={option.value} className="sr-only" />
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Coordination */}
            <div className="space-y-3">
              <Label className="text-base font-medium">How did your body coordinate?</Label>
              <RadioGroup value={coordination} onValueChange={(v) => setCoordination(v as CoordinationLevel)}>
                <div className="space-y-2">
                  {coordinationOptions.map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all',
                        coordination === option.value
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
          </div>
        </StepWrapper>
      </div>
    </div>
  );
}
