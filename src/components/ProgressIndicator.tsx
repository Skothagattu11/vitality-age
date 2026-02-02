import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const stepLabels = [
  'Setup',
  'Sit-to-Stand',
  'Wall Sit',
  'Balance',
  'March',
  'Overhead',
  'Cross-Legged',
  'Integration',
  'Recovery',
  'Results',
];

export function ProgressIndicator({ currentStep, totalSteps, className }: ProgressIndicatorProps) {
  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: Simple bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium">{stepLabels[currentStep] || `Step ${currentStep + 1}`}</span>
          <span className="text-muted-foreground">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Desktop: Dots with labels */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute left-0 right-0 h-0.5 bg-border top-4" />
          
          {/* Progress line */}
          <motion.div
            className="absolute left-0 h-0.5 top-4"
            style={{
              background: 'var(--gradient-primary)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* Steps */}
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div
                key={index}
                className="relative flex flex-col items-center z-10"
              >
                <motion.div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-300',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary text-primary-foreground shadow-glow',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </motion.div>
                
                <span
                  className={cn(
                    'absolute top-10 text-xs whitespace-nowrap transition-colors duration-300',
                    (isCompleted || isCurrent) ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {stepLabels[index] || `Step ${index + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
