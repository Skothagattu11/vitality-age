import { motion } from 'framer-motion';
import { Download, RotateCcw, TrendingUp, TrendingDown, Minus, ChevronDown, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssessmentResult, AssessmentData } from '@/types/assessment';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

interface ResultsPageProps {
  result: AssessmentResult;
  data: AssessmentData;
  onRetake: () => void;
}

export function ResultsPage({ result, data, onRetake }: ResultsPageProps) {
  const { functionalAge, chronologicalAge, gap, topDrivers } = result;
  const [showInsights, setShowInsights] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const isYounger = gap < 0;
  const isSame = gap === 0;
  const gapText = isSame 
    ? 'On track' 
    : isYounger 
      ? `${Math.abs(gap)}yr younger` 
      : `${gap}yr older`;

  const captureCard = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Failed to capture card:', error);
      return null;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const imageData = await captureCard();
      if (imageData) {
        const link = document.createElement('a');
        link.download = `entropy-age-${functionalAge}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = imageData;
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsExporting(true);
    try {
      const imageData = await captureCard();
      if (imageData && navigator.share) {
        // Convert base64 to blob for sharing
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], 'entropy-age-results.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My Entropy Age Results',
          text: `My functional biological age is ${functionalAge}! (${gapText} than my actual age of ${chronologicalAge})`,
          files: [file],
        });
      } else if (imageData) {
        // Fallback: download the image
        handleExport();
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to download
      handleExport();
    } finally {
      setIsExporting(false);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        className="max-w-md mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Shareable Card - Screenshot-friendly */}
        <motion.div
          ref={cardRef}
          id="results-card"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted border border-border shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className={cn(
              "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30",
              isYounger ? "bg-success" : isSame ? "bg-primary" : "bg-warning"
            )} />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20 bg-secondary" />
          </div>

          <div className="relative p-6 space-y-6">
            {/* Header with branding */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold gradient-text">Entropy Age</span>
              </div>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>

            {/* Main age display */}
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">Your Functional Biological Age</p>
              <motion.div
                className="relative inline-block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <span className={cn(
                  "text-7xl font-bold",
                  isYounger ? "text-success" : isSame ? "text-primary" : "text-warning"
                )}>
                  {functionalAge}
                </span>
                <span className="text-2xl text-muted-foreground ml-1">yrs</span>
              </motion.div>
            </div>

            {/* Comparison row */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Actual Age</p>
                <p className="text-xl font-semibold">{chronologicalAge}</p>
              </div>
              
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                isYounger ? "bg-success/15 text-success" : 
                isSame ? "bg-primary/15 text-primary" : 
                "bg-warning/15 text-warning"
              )}>
                {isYounger ? (
                  <TrendingDown className="w-4 h-4" />
                ) : isSame ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {gapText}
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Functional</p>
                <p className="text-xl font-semibold">{functionalAge}</p>
              </div>
            </div>

            {/* Footer branding */}
            <div className="flex items-center justify-center pt-4 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                Entropy Lifestyle • Functional Age Assessment
              </span>
            </div>
          </div>
        </motion.div>

        {/* Areas to Improve - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Collapsible open={showInsights} onOpenChange={setShowInsights}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Areas to Improve</h3>
                    <p className="text-sm text-muted-foreground">
                      {topDrivers.filter(d => d.impact === 'negative').length} areas identified
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-200",
                  showInsights && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="mt-3 space-y-3">
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
                    transition={{ delay: index * 0.1 }}
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
                        <h4 className="font-medium">{driver.tag}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {driver.suggestion}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* How it's calculated - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium">How is this calculated?</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-4 bg-muted/30 rounded-xl space-y-3 text-sm text-muted-foreground">
                <p>
                  Entropy Age uses a weighted scoring model based on your performance in 
                  functional movement tests compared to age-adjusted benchmarks.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Sit-to-Stand: Lower-body strength & power</li>
                  <li>Wall Sit: Muscular endurance</li>
                  <li>Balance: Proprioception & stability</li>
                  <li>March Recovery: Cardiovascular fitness</li>
                  <li>Mobility: Joint range of motion</li>
                </ul>
                <p className="text-xs pt-2 border-t border-border">
                  <strong>Note:</strong> This is an educational estimate, not a medical assessment.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col gap-3 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Saving...' : 'Save Image'}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={isExporting}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isExporting ? 'Sharing...' : 'Share'}
            </Button>
          </div>
          <Button
            variant="hero"
            onClick={onRetake}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Assessment
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
