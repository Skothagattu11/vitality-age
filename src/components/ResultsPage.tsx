import { motion } from 'framer-motion';
import { Download, RotateCcw, TrendingUp, TrendingDown, Minus, Info, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssessmentResult, AssessmentData } from '@/types/assessment';
import { exportResults } from '@/utils/scoring';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ResultsPageProps {
  result: AssessmentResult;
  data: AssessmentData;
  onRetake: () => void;
}

export function ResultsPage({ result, data, onRetake }: ResultsPageProps) {
  const { functionalAge, chronologicalAge, gap, topDrivers } = result;
  
  const isYounger = gap < 0;
  const isSame = gap === 0;
  const gapText = isSame 
    ? 'Right on track!' 
    : isYounger 
      ? `${Math.abs(gap)} years younger` 
      : `${gap} years older`;

  const handleExport = () => {
    const jsonData = exportResults(data, result);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entropy-age-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        className="max-w-2xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.h1 
            className="text-3xl font-bold"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Your Results
          </motion.h1>
          <p className="text-muted-foreground">
            Based on your functional movement assessment
          </p>
        </div>

        {/* Age comparison cards */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Chronological Age */}
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Chronological Age</p>
            <p className="text-4xl font-bold">{chronologicalAge}</p>
            <p className="text-xs text-muted-foreground mt-1">years old</p>
          </div>

          {/* Functional Age */}
          <div className={cn(
            "rounded-xl p-6 text-center relative overflow-hidden",
            isYounger ? "bg-success/10 border-2 border-success" : 
            isSame ? "bg-primary/10 border-2 border-primary" :
            "bg-warning/10 border-2 border-warning"
          )}>
            <div className="absolute inset-0 opacity-20">
              <div className={cn(
                "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl",
                isYounger ? "bg-success" : isSame ? "bg-primary" : "bg-warning"
              )} />
            </div>
            <p className="text-sm text-muted-foreground mb-2 relative">Functional Age</p>
            <motion.p 
              className="text-5xl font-bold relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              {functionalAge}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-1 relative">years old</p>
          </div>
        </motion.div>

        {/* Gap indicator */}
        <motion.div
          className={cn(
            "flex items-center justify-center gap-3 py-4 px-6 rounded-xl",
            isYounger ? "bg-success/10" : isSame ? "bg-muted" : "bg-warning/10"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {isYounger ? (
            <TrendingDown className="w-6 h-6 text-success" />
          ) : isSame ? (
            <Minus className="w-6 h-6 text-muted-foreground" />
          ) : (
            <TrendingUp className="w-6 h-6 text-warning" />
          )}
          <span className={cn(
            "text-lg font-semibold",
            isYounger ? "text-success" : isSame ? "text-foreground" : "text-warning"
          )}>
            {gapText}
          </span>
        </motion.div>

        {/* Narrative */}
        <motion.div
          className="bg-card rounded-xl border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-muted-foreground leading-relaxed">
            {isYounger ? (
              <>
                Great news! Your body is functioning like someone <strong>{Math.abs(gap)} years younger</strong> than your chronological age. 
                Your movement quality, recovery capacity, and physical resilience are above average for your age group.
              </>
            ) : isSame ? (
              <>
                Your functional age matches your chronological age. This means your body is performing 
                as expected for someone your age. There's always room for improvement!
              </>
            ) : (
              <>
                Your body is showing signs of functioning like someone <strong>{gap} years older</strong> than your chronological age. 
                The good news? With targeted work on the areas below, you can improve your functional age.
              </>
            )}
          </p>
        </motion.div>

        {/* Top drivers */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Key Insights
          </h2>

          <div className="space-y-3">
            {topDrivers.map((driver, index) => (
              <motion.div
                key={driver.tag}
                className={cn(
                  "p-4 rounded-xl border-2",
                  driver.impact === 'positive' ? "border-success/30 bg-success/5" :
                  driver.impact === 'negative' ? "border-warning/30 bg-warning/5" :
                  "border-border bg-muted/30"
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    driver.impact === 'positive' ? "bg-success/20" :
                    driver.impact === 'negative' ? "bg-warning/20" :
                    "bg-muted"
                  )}>
                    {driver.impact === 'positive' ? (
                      <TrendingDown className="w-4 h-4 text-success" />
                    ) : driver.impact === 'negative' ? (
                      <TrendingUp className="w-4 h-4 text-warning" />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{driver.tag}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {driver.suggestion}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Method accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Accordion type="single" collapsible className="bg-card rounded-xl border border-border">
            <AccordionItem value="method" className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="text-sm font-medium">How is this calculated?</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Entropy Age uses a weighted scoring model based on your performance in 
                    functional movement tests compared to age-adjusted benchmarks.
                  </p>
                  <p>
                    Each test contributes points that can increase or decrease your functional age:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Sit-to-Stand: Lower-body strength & power</li>
                    <li>Wall Sit: Muscular endurance</li>
                    <li>Balance: Proprioception & stability</li>
                    <li>March Recovery: Cardiovascular fitness</li>
                    <li>Mobility: Joint range of motion</li>
                  </ul>
                  <p className="text-xs mt-4 pt-3 border-t border-border">
                    <strong>Note:</strong> This is an educational estimate, not a medical assessment. 
                    For health concerns, consult a healthcare professional.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Results
          </Button>
          <Button
            variant="hero"
            onClick={onRetake}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Assessment
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
