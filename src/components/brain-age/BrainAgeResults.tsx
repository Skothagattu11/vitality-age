import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, TrendingUp, TrendingDown, Minus, ChevronDown, Share2 } from 'lucide-react';
import { track } from '@vercel/analytics';
import { Button } from '@/components/ui/button';
import { BrainAgeResult, BrainAgeData } from '@/types/brainAge';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface BrainAgeResultsProps {
  result: BrainAgeResult;
  data: BrainAgeData;
  onRetake: () => void;
}

export function BrainAgeResults({ result, data, onRetake }: BrainAgeResultsProps) {
  const navigate = useNavigate();
  const { brainAge, chronologicalAge, gap, domainScores, topDrivers, contextualNote } = result;
  const [showInsights, setShowInsights] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cardScale, setCardScale] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const actualGap = chronologicalAge - brainAge;
  const isYounger = actualGap > 0;
  const isSame = actualGap === 0;
  const gapText = isSame
    ? 'On track'
    : isYounger
      ? `${actualGap}yr younger`
      : `${Math.abs(actualGap)}yr older`;

  // Scale card to fit container
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scale = Math.min(containerWidth / 400, 1);
        setCardScale(scale);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Track completion
  useEffect(() => {
    track('brain_age_complete', {
      brain_age: brainAge,
      chronological_age: chronologicalAge,
      gap,
      is_younger: isYounger,
    });
  }, [brainAge, chronologicalAge, gap, isYounger]);

  // Radar chart data
  const radarData = domainScores.map(d => ({
    domain: d.domain.replace('Processing Speed', 'Speed').replace('Executive Function', 'Executive').replace('Working Memory', 'Memory').replace('Cognitive Flexibility', 'Flexibility'),
    percentile: d.percentile,
    fullMark: 100,
  }));

  const captureCard = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    const originalTransform = cardRef.current.style.transform;
    try {
      cardRef.current.style.transform = 'scale(1)';
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2.5,
        useCORS: true,
        logging: false,
        width: 400,
        height: 400,
      });
      cardRef.current.style.transform = originalTransform;
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Failed to capture card:', error);
      if (cardRef.current) cardRef.current.style.transform = originalTransform;
      return null;
    }
  };

  const handleExport = async () => {
    track('button_click', { button: 'save_brain_age_image', page: 'results' });
    setIsExporting(true);
    try {
      const imageData = await captureCard();
      if (imageData) {
        const link = document.createElement('a');
        link.download = `brain-age-${brainAge}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = imageData;
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    track('button_click', { button: 'share_brain_age', page: 'results' });
    setIsExporting(true);
    try {
      const imageData = await captureCard();
      if (imageData && navigator.share) {
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], 'brain-age-results.png', { type: 'image/png' });
        await navigator.share({
          title: 'My Brain Age Results',
          text: `My brain age is ${brainAge}! (${gapText} than my actual age of ${chronologicalAge})`,
          files: [file],
        });
      } else if (imageData) {
        handleExport();
      }
    } catch {
      handleExport();
    } finally {
      setIsExporting(false);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        className="max-w-md mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Share Card */}
        <div ref={containerRef} className="relative w-full overflow-hidden flex flex-col items-center">
          <div
            style={{
              width: `${400 * cardScale}px`,
              height: `${400 * cardScale}px`,
            }}
          >
            <motion.div
              ref={cardRef}
              className="relative overflow-hidden rounded-2xl"
              style={{
                width: '400px',
                height: '400px',
                background: '#FFFFFF',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transform: `scale(${cardScale})`,
                transformOrigin: 'top left',
              }}
              initial={{ opacity: 0, scale: 0.95 * cardScale }}
              animate={{ opacity: 1, scale: cardScale }}
              transition={{ delay: 0.2 }}
            >
              {/* Violet-themed card */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #1a1030 0%, #2d1b69 50%, #1a1030 100%)', borderRadius: '16px' }} />
              <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', bottom: '8px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #7C3AED 100%)', borderRadius: '12px', opacity: 0.3 }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', bottom: '12px', background: '#0f0a1e', borderRadius: '10px' }} />
              <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', background: '#FFFEF9', borderRadius: '6px' }} />

              <div style={{ position: 'relative', height: '100%', padding: '32px 36px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#7C3AED">
                      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                    </svg>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: '#7C3AED' }}>Brain Age</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#9CA3AF' }}>{formattedDate}</span>
                </div>

                {/* Number */}
                <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '-8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    Brain Age
                  </div>
                  <div style={{ marginBottom: '28px', paddingBottom: '4px' }}>
                    <span style={{
                      fontSize: '100px', fontWeight: 800, lineHeight: '1', letterSpacing: '-0.04em', display: 'block',
                      color: isYounger ? '#22C55E' : isSame ? '#7C3AED' : '#F59E0B',
                      textShadow: isYounger
                        ? '0 2px 0 #1DA34B, 0 4px 0 #188A3F, 0 6px 0 #147234, 0 8px 8px rgba(34, 197, 94, 0.3)'
                        : isSame
                          ? '0 2px 0 #6D28D9, 0 4px 0 #5B21B6, 0 6px 0 #4C1D95, 0 8px 8px rgba(124, 58, 237, 0.3)'
                          : '0 2px 0 #E08A0A, 0 4px 0 #C77808, 0 6px 0 #AE6707, 0 8px 8px rgba(245, 158, 11, 0.3)',
                    }}>
                      {brainAge}
                    </span>
                  </div>

                  {/* Gap badge */}
                  <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px',
                      backgroundColor: isYounger ? 'rgba(34, 197, 94, 0.12)' : isSame ? 'rgba(124, 58, 237, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                      border: `1.5px solid ${isYounger ? 'rgba(34, 197, 94, 0.3)' : isSame ? 'rgba(124, 58, 237, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: isYounger ? '#16A34A' : isSame ? '#7C3AED' : '#D97706' }}>
                        {gapText}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '140px', height: '1px', backgroundColor: '#E5E7EB', marginBottom: '12px' }} />
                    <div style={{ fontSize: '16px', color: '#6B7280' }}>
                      Actual age: <span style={{ fontWeight: 700, color: '#374151' }}>{chronologicalAge}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#9CA3AF' }}>EntropyAge.com</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <h3 className="text-sm font-semibold text-center mb-2">Cognitive Profile</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Percentile"
                dataKey="percentile"
                stroke="#7C3AED"
                fill="#7C3AED"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Contextual note */}
        {contextualNote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-300"
          >
            {contextualNote}
          </motion.div>
        )}

        {/* Areas to Improve */}
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
                    <h3 className="font-medium">Key Drivers</h3>
                    <p className="text-sm text-muted-foreground">
                      {topDrivers.filter(d => d.impact === 'negative').length} areas to improve
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
                        <p className="text-sm text-muted-foreground mt-1">{driver.suggestion}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* How it's calculated */}
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
                  Brain Age uses age-adjusted cognitive norms across 5 game-based assessments,
                  each weighted by its correlation with real-world cognitive health.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Lightning Tap: Processing speed (20%)</li>
                  <li>Color Clash: Executive function (25%)</li>
                  <li>Memory Matrix: Working memory (25%)</li>
                  <li>Focus Filter: Attention (15%)</li>
                  <li>Trail Switch: Cognitive flexibility (15%)</li>
                </ul>
                <p className="text-xs pt-2 border-t border-border">
                  <strong>Note:</strong> This is an educational estimate, not a clinical assessment.
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
          transition={{ delay: 0.65 }}
        >
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExport} disabled={isExporting} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Saving...' : 'Save Image'}
            </Button>
            <Button variant="outline" onClick={handleShare} disabled={isExporting} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              {isExporting ? 'Sharing...' : 'Share'}
            </Button>
          </div>
          <Button variant="hero" onClick={onRetake} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Assessment
          </Button>
        </motion.div>

        {/* Cross-promotion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center space-y-2"
        >
          <p className="text-sm text-muted-foreground">Want a full picture?</p>
          <button
            type="button"
            onClick={() => navigate('/functional-age')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Also try: Functional Age Assessment
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
