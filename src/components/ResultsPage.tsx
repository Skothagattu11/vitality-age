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
  
  // Calculate the actual difference correctly
  const actualGap = chronologicalAge - functionalAge;
  const isYounger = actualGap > 0;
  const isSame = actualGap === 0;
  const gapText = isSame 
    ? 'On track' 
    : isYounger 
      ? `${actualGap}yr younger` 
      : `${Math.abs(actualGap)}yr older`;

  const captureCard = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    try {
      // LinkedIn recommended size: 1200x627 (1.91:1 ratio)
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2.5, // Results in ~1200px width
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
        {/* Shareable Card - Screenshot-friendly, LinkedIn size (1.91:1 ratio) */}
        <motion.div
          ref={cardRef}
          id="results-card"
          className="relative overflow-hidden rounded-2xl bg-white border border-border shadow-lg"
          style={{ aspectRatio: '1.91 / 1', width: '100%', maxWidth: '480px' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {/* Subtle gradient background */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(250,248,255,1) 50%, rgba(255,252,245,1) 100%)'
            }}
          />

          <div className="relative h-full flex flex-col justify-between p-5">
            {/* Header with branding */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: '#00BCD4' }} />
                <span className="font-semibold" style={{ color: '#00BCD4' }}>Entropy Age</span>
              </div>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>{formattedDate}</span>
            </div>

            {/* Main age display */}
            <div className="text-center flex-1 flex flex-col justify-center">
              <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Your Functional Biological Age</p>
              <motion.div
                className="relative inline-block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <span 
                  className="text-6xl font-bold"
                  style={{ color: isYounger ? '#22C55E' : isSame ? '#00BCD4' : '#F59E0B' }}
                >
                  {functionalAge}
                </span>
                <span className="text-xl ml-1" style={{ color: '#9CA3AF' }}>yrs</span>
              </motion.div>
            </div>

            {/* Comparison row */}
            <div className="flex items-center justify-center gap-6 mb-3">
              <div className="text-center">
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Actual Age</p>
                <p className="text-lg font-semibold" style={{ color: '#374151' }}>{chronologicalAge}</p>
              </div>
              
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: isYounger ? 'rgba(34,197,94,0.15)' : isSame ? 'rgba(0,188,212,0.15)' : 'rgba(245,158,11,0.15)',
                  color: isYounger ? '#22C55E' : isSame ? '#00BCD4' : '#F59E0B'
                }}
              >
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
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Functional</p>
                <p className="text-lg font-semibold" style={{ color: '#374151' }}>{functionalAge}</p>
              </div>
            </div>

            {/* Footer branding */}
            <div className="flex items-center justify-center pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>
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
