import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { TOTAL_STEPS } from '@/types/assessment';

interface ProgressHeaderProps {
  currentStep: number;
  onResetClick: () => void;
}

export default function ProgressHeader({ currentStep, onResetClick }: ProgressHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="w-full max-w-4xl mx-auto py-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-semibold gradient-text">Entropy Age</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetClick}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
        />
      </div>
    </header>
  );
}
