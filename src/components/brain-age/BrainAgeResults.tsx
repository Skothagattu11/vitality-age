import { useState, useRef, useEffect, ReactNode } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface BrainAgeResultsProps {
  result: BrainAgeResult;
  data: BrainAgeData;
  onRetake: () => void;
}

const CARD_DESIGNS = ['Certificate', 'Passport'] as const;

export function BrainAgeResults({ result, data, onRetake }: BrainAgeResultsProps) {
  const navigate = useNavigate();
  const { brainAge, chronologicalAge, gap, domainScores, topDrivers, contextualNote } = result;
  const [showInsights, setShowInsights] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<number>(0);
  const [cardScale, setCardScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  // Offscreen capture ref — plain div, NO Framer Motion, always 400x400
  const captureRef = useRef<HTMLDivElement>(null);

  // Session tracking for Supabase persistence
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('entropy-brain-session-id');
  });
  const [responseSaved, setResponseSaved] = useState(false);

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

  // Track completion and save to Supabase on mount
  useEffect(() => {
    track('brain_age_complete', {
      brain_age: brainAge,
      chronological_age: chronologicalAge,
      gap,
      is_younger: isYounger,
    });

    const saveResponse = async () => {
      if (responseSaved) return;

      try {
        const { data: insertedData, error } = await supabase
          .from('brain_age_responses')
          .insert({
            brain_age: brainAge,
            chronological_age: chronologicalAge,
            gap: gap,
            domain_scores: JSON.parse(JSON.stringify(domainScores)) as Json,
            top_drivers: JSON.parse(JSON.stringify(topDrivers)) as Json,
            assessment_data: JSON.parse(JSON.stringify(data)) as Json,
          })
          .select('session_id')
          .single();

        if (error) {
          console.error('Failed to save brain age response:', error);
          return;
        }

        if (insertedData?.session_id) {
          setSessionId(insertedData.session_id);
          localStorage.setItem('entropy-brain-session-id', insertedData.session_id);
        }
        setResponseSaved(true);
      } catch (err) {
        console.error('Failed to save brain age response:', err);
      }
    };

    saveResponse();
  }, [brainAge, chronologicalAge, gap, domainScores, topDrivers, data, isYounger, responseSaved]);

  // Radar chart data
  const radarData = domainScores.map(d => ({
    domain: d.domain.replace('Processing Speed', 'Speed').replace('Executive Function', 'Executive').replace('Working Memory', 'Memory').replace('Cognitive Flexibility', 'Flexibility'),
    percentile: d.percentile,
    fullMark: 100,
  }));

  // Domain short labels for passport stamps
  const domainShortLabels: Record<string, string> = {
    'Processing Speed': 'Speed',
    'Executive Function': 'Exec',
    'Working Memory': 'Memory',
    'Attention': 'Attn',
    'Cognitive Flexibility': 'Flex',
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const serialNo = `EA-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(brainAge).padStart(2, '0')}${String(chronologicalAge).padStart(2, '0')}`;

  const clearanceLevel = actualGap >= 5 ? 'Superior' : actualGap >= 2 ? 'Advanced' : actualGap >= 0 ? 'Standard' : actualGap >= -3 ? 'Monitor' : 'Alert';

  // ═══════════════════════════════════════════════════════════════
  // Card content renderer — shared between visible card & offscreen capture
  // Uses ONLY absolute positioning, NO flex centering, NO transforms
  // ═══════════════════════════════════════════════════════════════

  const renderCertificate = (): ReactNode => (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #1a1030 0%, #2d1b69 50%, #1a1030 100%)', borderRadius: '16px' }} />
      <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', bottom: '8px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #7C3AED 100%)', borderRadius: '12px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', bottom: '12px', background: '#0f0a1e', borderRadius: '10px' }} />
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', background: '#FFFEF9', borderRadius: '6px' }} />

      <div style={{ position: 'absolute', top: 0, left: 0, width: '400px', height: '400px' }}>
        {/* Header row */}
        <div style={{ position: 'absolute', top: '32px', left: '36px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#7C3AED" style={{ position: 'absolute', left: 0, top: '2px' }}>
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
          <span style={{ position: 'absolute', left: '24px', top: 0, fontSize: '17px', fontWeight: 700, color: '#7C3AED', whiteSpace: 'nowrap' }}>Brain Age</span>
        </div>
        <div style={{ position: 'absolute', top: '34px', right: '36px', fontSize: '13px', fontWeight: 500, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
          {formattedDate}
        </div>

        {/* "BRAIN AGE" label */}
        <div style={{ position: 'absolute', top: '72px', left: 0, width: '400px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Brain Age
        </div>

        {/* Big number */}
        <div style={{ position: 'absolute', top: '92px', left: 0, width: '400px', textAlign: 'center', lineHeight: '1' }}>
          <span style={{
            fontSize: '100px', fontWeight: 800, letterSpacing: '-0.04em',
            color: isYounger ? '#22C55E' : isSame ? '#7C3AED' : '#F59E0B',
            textShadow: isYounger
              ? '0 2px 0 #1DA34B, 0 4px 0 #188A3F, 0 5px 6px rgba(34, 197, 94, 0.25)'
              : isSame
                ? '0 2px 0 #6D28D9, 0 4px 0 #5B21B6, 0 5px 6px rgba(124, 58, 237, 0.25)'
                : '0 2px 0 #E08A0A, 0 4px 0 #C77808, 0 5px 6px rgba(245, 158, 11, 0.25)',
          }}>
            {brainAge}
          </span>
        </div>

        {/* Gap text — no background, just colored text */}
        <div style={{
          position: 'absolute', top: '222px', left: 0, width: '400px', textAlign: 'center',
          fontSize: '18px', fontWeight: 700,
          color: isYounger ? '#16A34A' : isSame ? '#7C3AED' : '#D97706',
        }}>
          {gapText}
        </div>

        {/* Divider */}
        <div style={{ position: 'absolute', top: '280px', left: '130px', width: '140px', height: '1px', backgroundColor: '#E5E7EB' }} />

        {/* Actual age */}
        <div style={{ position: 'absolute', top: '296px', left: 0, width: '400px', textAlign: 'center', fontSize: '16px', color: '#6B7280' }}>
          Actual age: <span style={{ fontWeight: 700, color: '#374151' }}>{chronologicalAge}</span>
        </div>

        {/* Brand footer */}
        <div style={{ position: 'absolute', top: '348px', left: 0, width: '400px', textAlign: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#9CA3AF' }}>EntropyAge.com</span>
        </div>
      </div>
    </>
  );

  // forExport: nudges stamp text up by 6px to compensate for html2canvas
  // rendering fonts lower than the browser does
  const renderPassport = (forExport = false): ReactNode => {
    const stampOffset = forExport ? -6 : 0;
    return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#F5F0E8', borderRadius: '16px' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(139,90,43,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,90,43,0.03) 0%, transparent 50%)' }} />
      <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', bottom: '12px', border: '2px dashed rgba(139,90,43,0.2)', borderRadius: '4px' }} />
      <div style={{ position: 'absolute', top: '18px', left: '18px', right: '18px', bottom: '18px', border: '1px solid rgba(139,90,43,0.1)' }} />

      <div style={{ position: 'absolute', top: 0, left: 0, width: '400px', height: '400px' }}>
        {/* Header */}
        <div style={{ position: 'absolute', top: '28px', left: 0, width: '400px', textAlign: 'center' }}>
          <div style={{
            fontSize: '20px', fontWeight: 700, color: '#5C3A1E',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            fontFamily: '"Courier New", Courier, monospace',
          }}>
            Cognitive Clearance
          </div>
          <div style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '9px', color: 'rgba(92,58,30,0.35)',
            letterSpacing: '0.3em', marginTop: '3px',
          }}>
            NO. {serialNo}
          </div>
        </div>

        {/* Divider below header */}
        <div style={{ position: 'absolute', top: '66px', left: '24px', right: '24px', height: '2px', backgroundColor: 'rgba(139,90,43,0.15)' }} />

        {/* Stamp circle — shifted left to keep info within borders */}
        <div style={{
          position: 'absolute', left: '24px', top: '86px',
          width: '160px', height: '160px',
          border: '4px solid #8B2500', borderRadius: '50%',
          background: 'rgba(139,37,0,0.03)',
          boxSizing: 'border-box',
        }}>
          <div style={{
            position: 'absolute', top: '7px', left: '7px', right: '7px', bottom: '7px',
            border: '2px solid rgba(139,37,0,0.3)', borderRadius: '50%',
          }} />
          {/* "Brain Age" label inside stamp */}
          <div style={{
            position: 'absolute', top: `${24 + stampOffset}px`, left: 0, right: 0, textAlign: 'center',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '9px', fontWeight: 700, color: '#8B2500',
            letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            Brain Age
          </div>
          {/* Number */}
          <div style={{
            position: 'absolute', top: `${39 + stampOffset}px`, left: 0, right: 0, textAlign: 'center',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '54px', fontWeight: 800, color: '#8B2500',
            lineHeight: '1',
          }}>
            {brainAge}
          </div>
          {/* "Years" label */}
          <div style={{
            position: 'absolute', top: `${97 + stampOffset}px`, left: 0, right: 0, textAlign: 'center',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '12px', fontWeight: 700,
            color: 'rgba(139,37,0,0.7)',
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>
            Years
          </div>
        </div>

        {/* Info panel — within right dotted border (388px max) */}
        <div style={{ position: 'absolute', left: '202px', top: '100px' }}>
          {[
            { label: 'Actual', value: `${chronologicalAge} yrs` },
            { label: 'Status', value: gapText, color: isYounger ? '#16A34A' : isSame ? '#5C3A1E' : '#D97706' },
            { label: 'Date', value: formattedDate },
            { label: 'Class', value: clearanceLevel },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: '10px' }}>
              <span style={{
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '9px', fontWeight: 700,
                color: 'rgba(92,58,30,0.5)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                display: 'inline-block', width: '56px',
                verticalAlign: 'baseline',
              }}>
                {row.label}
              </span>
              <span style={{
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '14px', fontWeight: 700,
                color: row.color || '#5C3A1E',
                verticalAlign: 'baseline',
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Divider above domain stamps */}
        <div style={{ position: 'absolute', top: '268px', left: '24px', width: '352px', height: '1px', backgroundColor: 'rgba(139,90,43,0.15)' }} />

        {/* Domain stamps row — within dotted borders */}
        <div style={{ position: 'absolute', top: '282px', left: '16px', width: '368px', textAlign: 'center' }}>
          {domainScores.map((d) => (
            <div key={d.domain} style={{
              display: 'inline-block',
              padding: '6px 11px',
              border: '1.5px solid rgba(139,37,0,0.3)',
              borderRadius: '4px',
              background: 'rgba(139,37,0,0.02)',
              margin: '0 3px 5px',
              textAlign: 'center',
              verticalAlign: 'top',
            }}>
              <div style={{
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '8px', fontWeight: 700, color: 'rgba(139,37,0,0.6)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {domainShortLabels[d.domain] || d.domain}
              </div>
              <div style={{
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '17px', fontWeight: 700, color: '#8B2500',
              }}>
                {d.percentile}%
              </div>
            </div>
          ))}
        </div>

        {/* Brand footer — inside dotted border, bright */}
        <div style={{
          position: 'absolute', top: '362px', left: 0, width: '400px', textAlign: 'center',
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: '12px', fontWeight: 700, color: '#8B5A2B', letterSpacing: '0.12em',
        }}>
          EntropyAge.com
        </div>
      </div>
    </>
    );
  };

  const renderCardContent = (design: number, forExport = false): ReactNode => {
    return design === 0 ? renderCertificate() : renderPassport(forExport);
  };

  // ═══════════════════════════════════════════════════════════════
  // Capture from the OFFSCREEN plain div — zero Framer Motion interference
  // ═══════════════════════════════════════════════════════════════

  const captureCard = async (): Promise<string | null> => {
    if (!captureRef.current) return null;
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: null,
        scale: 2.5,
        useCORS: true,
        logging: false,
        width: 400,
        height: 400,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Failed to capture card:', error);
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

  return (
    <div className="min-h-screen py-8 px-4">
      {/* ═══ OFFSCREEN CAPTURE TARGET ═══
          Plain div, always 400x400, no transforms, no Framer Motion.
          html2canvas captures from HERE — pixel-perfect every time. */}
      <div
        ref={captureRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '400px',
          height: '400px',
          overflow: 'hidden',
          borderRadius: '16px',
          background: '#FFFFFF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          // No transform, no scale, no Framer Motion
        }}
      >
        {renderCardContent(selectedDesign, true)}
      </div>

      <motion.div
        className="max-w-md mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card Design Carousel with Swipe */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden touch-pan-y flex flex-col items-center"
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > 50) {
                setSelectedDesign(prev => (prev - 1 + CARD_DESIGNS.length) % CARD_DESIGNS.length);
              } else if (info.offset.x < -50) {
                setSelectedDesign(prev => (prev + 1) % CARD_DESIGNS.length);
              }
            }}
            className="cursor-grab active:cursor-grabbing"
            style={{
              width: `${400 * cardScale}px`,
              height: `${400 * cardScale}px`,
            }}
          >
            <motion.div
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
              transition={{ delay: 0.2, duration: 0.4 }}
              key={selectedDesign}
            >
              {renderCardContent(selectedDesign)}
            </motion.div>
          </motion.div>

          {/* Design selector dots */}
          <div className="flex justify-center gap-2 mt-4">
            {CARD_DESIGNS.map((design, index) => (
              <button
                key={design}
                onClick={() => setSelectedDesign(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  selectedDesign === index
                    ? "bg-secondary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Select ${design} design`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {CARD_DESIGNS[selectedDesign]} Style
          </p>
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
