import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { UserProfile, FitnessLevel, Sex, InjuryArea } from '@/types/assessment';
import { cn } from '@/lib/utils';

interface SetupPageProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

export function SetupPage({ onComplete, onBack }: SetupPageProps) {
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<Sex | ''>('');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | ''>('');
  const [injuries, setInjuries] = useState<InjuryArea[]>([]);
  const [hasEquipment, setHasEquipment] = useState(false);

  const isValid = 
    age && 
    parseInt(age) >= 18 && 
    parseInt(age) <= 100 && 
    fitnessLevel && 
    hasEquipment;

  const handleInjuryToggle = (injury: InjuryArea) => {
    if (injury === 'none') {
      setInjuries(['none']);
    } else {
      setInjuries(prev => {
        const filtered = prev.filter(i => i !== 'none');
        if (filtered.includes(injury)) {
          return filtered.filter(i => i !== injury);
        }
        return [...filtered, injury];
      });
    }
  };

  const handleSubmit = () => {
    if (!isValid) return;
    
    onComplete({
      chronologicalAge: parseInt(age),
      sex: sex || undefined,
      fitnessLevel: fitnessLevel as FitnessLevel,
      injuries: injuries.length === 0 ? ['none'] : injuries,
      hasEquipment,
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
            <h1 className="text-2xl font-bold">Let's Get Started</h1>
            <p className="text-muted-foreground">
              Quick setup to personalize your assessment
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-base">
                Your chronological age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                min={18}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="h-12 text-lg"
              />
            </div>

            {/* Sex */}
            <div className="space-y-3">
              <Label className="text-base">
                Sex at birth <span className="text-muted-foreground text-sm">(optional)</span>
              </Label>
              <RadioGroup value={sex} onValueChange={(v) => setSex(v as Sex)}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'prefer-not-to-say', label: 'Skip' },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all',
                        sex === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <RadioGroupItem value={option.value} className="sr-only" />
                      <span className="font-medium">{option.label}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Fitness Level */}
            <div className="space-y-3">
              <Label className="text-base">
                Current fitness level <span className="text-destructive">*</span>
              </Label>
              <RadioGroup value={fitnessLevel} onValueChange={(v) => setFitnessLevel(v as FitnessLevel)}>
                <div className="space-y-2">
                  {[
                    { 
                      value: 'beginner', 
                      label: 'Beginner', 
                      desc: 'New to exercise or returning after a long break' 
                    },
                    { 
                      value: 'intermediate', 
                      label: 'Intermediate', 
                      desc: 'Exercise 2-4 times per week regularly' 
                    },
                    { 
                      value: 'advanced', 
                      label: 'Advanced', 
                      desc: 'Train 5+ times per week, athletic background' 
                    },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all',
                        fitnessLevel === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <RadioGroupItem value={option.value} className="sr-only" />
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.desc}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Injuries */}
            <div className="space-y-3">
              <Label className="text-base">
                Any current limitations?
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'knees' as InjuryArea, label: 'Knee issues' },
                  { value: 'hips' as InjuryArea, label: 'Hip issues' },
                  { value: 'back' as InjuryArea, label: 'Back issues' },
                  { value: 'shoulders' as InjuryArea, label: 'Shoulder issues' },
                  { value: 'none' as InjuryArea, label: 'None' },
                ].map((option) => (
                  <Label
                    key={option.value}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                      injuries.includes(option.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Checkbox
                      checked={injuries.includes(option.value)}
                      onCheckedChange={() => handleInjuryToggle(option.value)}
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </Label>
                ))}
              </div>
            </div>

            {/* Equipment confirmation */}
            <div className="space-y-3">
              <Label
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  hasEquipment
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Checkbox
                  checked={hasEquipment}
                  onCheckedChange={(checked) => setHasEquipment(checked as boolean)}
                />
                <div>
                  <span className="font-medium">I have a chair and a wall available</span>
                  <span className="block text-sm text-muted-foreground">
                    Required for the assessment
                  </span>
                </div>
              </Label>
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
              Begin Tests
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
