import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { BrainAgeProfile, CaffeineStatus, TimeOfDay } from '@/types/brainAge';
import { cn } from '@/lib/utils';

interface BrainAgeSetupProps {
  onComplete: (profile: BrainAgeProfile) => void;
  onBack: () => void;
}

function detectTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: 'Morning (5am-12pm)',
  afternoon: 'Afternoon (12-5pm)',
  evening: 'Evening (5-9pm)',
  night: 'Night (9pm-5am)',
};

export function BrainAgeSetup({ onComplete, onBack }: BrainAgeSetupProps) {
  const [age, setAge] = useState<string>('');
  const [sleepHours, setSleepHours] = useState<number[]>([7]);
  const [caffeine, setCaffeine] = useState<CaffeineStatus | ''>('');
  const [timeOfDay] = useState<TimeOfDay>(detectTimeOfDay);

  const isValid = age && parseInt(age) >= 18 && parseInt(age) <= 100;

  const handleSubmit = () => {
    if (!isValid) return;
    onComplete({
      age: parseInt(age),
      sleepHours: sleepHours[0],
      caffeineStatus: caffeine || 'none',
      timeOfDay,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-lg mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Quick Setup</h1>
            <p className="text-muted-foreground">
              A few details to calibrate your brain age results
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="brain-age-input" className="text-base">
                Your age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="brain-age-input"
                type="number"
                min={18}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="h-12 text-lg"
              />
            </div>

            {/* Sleep hours */}
            <div className="space-y-3">
              <Label className="text-base">
                Hours of sleep last night
              </Label>
              <div className="space-y-2">
                <Slider
                  value={sleepHours}
                  onValueChange={setSleepHours}
                  min={0}
                  max={12}
                  step={0.5}
                  className="py-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0 hrs</span>
                  <span className="font-semibold text-foreground">{sleepHours[0]} hrs</span>
                  <span>12 hrs</span>
                </div>
              </div>
              {sleepHours[0] < 6 && (
                <p className="text-xs text-amber-500">
                  Sleep deprivation can temporarily affect cognitive performance. We'll note this in your results.
                </p>
              )}
            </div>

            {/* Caffeine */}
            <div className="space-y-3">
              <Label className="text-base">
                Caffeine today
              </Label>
              <RadioGroup value={caffeine} onValueChange={(v) => setCaffeine(v as CaffeineStatus)}>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'none' as const, label: 'None' },
                    { value: 'light' as const, label: '1-2 cups' },
                    { value: 'moderate' as const, label: '3-4 cups' },
                    { value: 'heavy' as const, label: '5+ cups' },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all text-sm',
                        caffeine === option.value
                          ? 'border-secondary bg-secondary/5'
                          : 'border-border hover:border-secondary/50'
                      )}
                    >
                      <RadioGroupItem value={option.value} className="sr-only" />
                      <span className="font-medium">{option.label}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Time of day — auto-detected badge */}
            <div className="space-y-2">
              <Label className="text-base">Time of day</Label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
                  {TIME_LABELS[timeOfDay]}
                </span>
                <span className="text-xs text-muted-foreground">(auto-detected)</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={!isValid}
              className="flex-[2]"
            >
              Begin Games
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
