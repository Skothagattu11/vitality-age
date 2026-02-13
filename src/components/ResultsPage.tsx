import { motion } from 'framer-motion';
import { Download, RotateCcw, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { track } from '@vercel/analytics';
import { Button } from '@/components/ui/button';
import { AssessmentResult, AssessmentData } from '@/types/assessment';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { ComingSoonCard } from './ComingSoonCard';
import { NotifyModal } from './NotifyModal';
import { AddToHomeScreen } from './AddToHomeScreen';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

const EXPLORE_TOOLS = [
  {
    id: 'metabolic',
    name: 'Metabolic Age',
    description: 'Energy usage and metabolic efficiency',
    fullDescription: 'Metabolic Age measures how efficiently your body converts food into energy and maintains cellular function. It reflects mitochondrial health, insulin sensitivity, and overall metabolic flexibility—key markers that influence how you age at a cellular level.',
  },
  {
    id: 'brain',
    name: 'Brain Age',
    description: 'Cognitive load and nervous system resilience',
    fullDescription: 'Brain Age assesses cognitive processing speed, memory retention, and nervous system adaptability. It evaluates how well your brain handles stress, learns new information, and maintains neuroplasticity over time.',
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular Age',
    description: 'Heart efficiency and recovery capacity',
    fullDescription: 'Cardiovascular Age evaluates your heart\'s pumping efficiency, arterial flexibility, and recovery capacity after exertion. These factors determine how well your cardiovascular system supports daily activities and responds to physical demands.',
  },
  {
    id: 'longevity',
    name: 'Longevity Age Index',
    description: 'Long-term resilience and aging trajectory',
    fullDescription: 'The Longevity Age Index combines multiple biomarkers and functional assessments to project your overall aging trajectory. It identifies patterns that correlate with healthy lifespan extension and resilience against age-related decline.',
  },
];

interface ResultsPageProps {
  result: AssessmentResult;
  data: AssessmentData;
  onRetake: () => void;
}

const CARD_DESIGNS = ['Certificate', 'Medal'] as const;
type CardDesign = typeof CARD_DESIGNS[number];

export function ResultsPage({ result, data, onRetake }: ResultsPageProps) {
  const { functionalAge, chronologicalAge, gap, topDrivers } = result;
  const [showInsights, setShowInsights] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<number>(0);
  const [cardScale, setCardScale] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate card scale based on container width
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const cardWidth = 400; // Fixed card width
        const scale = Math.min(containerWidth / cardWidth, 1);
        setCardScale(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Session tracking for responses
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('entropy-session-id');
  });
  const [responseSaved, setResponseSaved] = useState(false);

  // Track assessment completion and save to database on mount
  useEffect(() => {
    // Track assessment completion
    track('assessment_complete', {
      functional_age: functionalAge,
      chronological_age: chronologicalAge,
      gap: gap,
      is_younger: chronologicalAge > functionalAge,
    });

    const saveResponse = async () => {
      if (responseSaved) return;

      try {
        const { data: insertedData, error } = await supabase
          .from('assessment_responses')
          .insert({
            functional_age: functionalAge,
            chronological_age: chronologicalAge,
            gap: gap,
            top_drivers: JSON.parse(JSON.stringify(topDrivers)) as Json,
            assessment_data: JSON.parse(JSON.stringify(data)) as Json,
          })
          .select('session_id')
          .single();

        if (error) {
          console.error('Failed to save assessment response:', error);
          return;
        }

        if (insertedData?.session_id) {
          setSessionId(insertedData.session_id);
          localStorage.setItem('entropy-session-id', insertedData.session_id);
        }
        setResponseSaved(true);
      } catch (err) {
        console.error('Failed to save assessment response:', err);
      }
    };

    saveResponse();
  }, [functionalAge, chronologicalAge, gap, topDrivers, data, responseSaved]);

  // Explore tools state
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof EXPLORE_TOOLS[0] | null>(null);
  const [subscribedTools, setSubscribedTools] = useState<string[]>([]);

  // Load subscribed tools from database on mount
  useEffect(() => {
    const loadSubscriptions = async () => {
      const cached = localStorage.getItem('entropy-subscribed-tools');
      if (cached) {
        setSubscribedTools(JSON.parse(cached));
      }
    };
    loadSubscriptions();
  }, []);

  const handleViewMore = (tool: typeof EXPLORE_TOOLS[0]) => {
    setSelectedTool(tool);
    setNotifyModalOpen(true);
  };

  const handleSubscriptionSuccess = async (email: string) => {
    if (!selectedTool) return;
    
    // Update local state and cache
    const newSubscribed = [...subscribedTools, selectedTool.id];
    setSubscribedTools(newSubscribed);
    localStorage.setItem('entropy-subscribed-tools', JSON.stringify(newSubscribed));
    
    // Link email to the assessment response if we have a session
    if (sessionId) {
      try {
        await supabase
          .from('assessment_responses')
          .update({ email })
          .eq('session_id', sessionId);
      } catch (err) {
        console.error('Failed to link email to response:', err);
      }
    }
    
    setNotifyModalOpen(false);
    toast.success("✅ You'll be notified when this tool becomes available.");
  };
  
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

    // Store original scale
    const originalTransform = cardRef.current.style.transform;

    try {
      // Reset scale to 1 for capturing
      cardRef.current.style.transform = 'scale(1)';

      // Apply export-only adjustments for certificate design
      const certNumberContainer = cardRef.current.querySelector('.cert-number-container') as HTMLElement;
      const certBadgeContainer = cardRef.current.querySelector('.cert-badge-container') as HTMLElement;
      if (certNumberContainer) {
        certNumberContainer.style.marginBottom = '36px';
      }
      if (certBadgeContainer) {
        certBadgeContainer.style.marginTop = '8px';
      }

      // Apply export-only adjustments for medal design
      const medalTextContainer = cardRef.current.querySelector('.medal-text-container') as HTMLElement;
      const medalBioText = cardRef.current.querySelector('.medal-bio-text') as HTMLElement;
      if (medalTextContainer) {
        medalTextContainer.style.marginTop = '-24px';
      }
      if (medalBioText) {
        medalBioText.style.marginTop = '23px';
      }

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2.5,
        useCORS: true,
        logging: false,
        width: 400,
        height: 400,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 400,
        windowHeight: 400,
      });

      // Revert the certificate adjustments
      if (certNumberContainer) {
        certNumberContainer.style.marginBottom = '28px';
      }
      if (certBadgeContainer) {
        certBadgeContainer.style.marginTop = '0';
      }

      // Revert the medal adjustments
      if (medalTextContainer) {
        medalTextContainer.style.marginTop = '0';
      }
      if (medalBioText) {
        medalBioText.style.marginTop = '8px';
      }

      // Restore original scale
      cardRef.current.style.transform = originalTransform;

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Failed to capture card:', error);
      // Make sure to revert even on error
      if (cardRef.current) {
        cardRef.current.style.transform = originalTransform;
        const certNumberContainer = cardRef.current.querySelector('.cert-number-container') as HTMLElement;
        const certBadgeContainer = cardRef.current.querySelector('.cert-badge-container') as HTMLElement;
        if (certNumberContainer) {
          certNumberContainer.style.marginBottom = '28px';
        }
        if (certBadgeContainer) {
          certBadgeContainer.style.marginTop = '0';
        }
        const medalTextContainer = cardRef.current.querySelector('.medal-text-container') as HTMLElement;
        const medalBioText = cardRef.current.querySelector('.medal-bio-text') as HTMLElement;
        if (medalTextContainer) {
          medalTextContainer.style.marginTop = '0';
        }
        if (medalBioText) {
          medalBioText.style.marginTop = '8px';
        }
      }
      return null;
    }
  };

  const handleExport = async () => {
    track('button_click', { button: 'save_image', page: 'results', functional_age: functionalAge });
    setIsExporting(true);
    try {
      const imageData = await captureCard();
      if (imageData) {
        const link = document.createElement('a');
        link.download = `entropy-age-${functionalAge}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = imageData;
        link.click();
        track('action_complete', { action: 'export_image', functional_age: functionalAge });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    track('button_click', { button: 'share', page: 'results', functional_age: functionalAge });
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
        track('action_complete', { action: 'share', functional_age: functionalAge });
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
        {/* Card Design Carousel with Swipe */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden touch-pan-y flex flex-col items-center"
        >
          {/* Swipeable container */}
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
            {/* Shareable Card - Fixed size, scales to fit */}
            <motion.div
              ref={cardRef}
              id="results-card"
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
            {selectedDesign === 0 ? (
              /* Certificate Design */
              <>
                {/* Outer frame - dark elegant border */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, #2C3E50 0%, #1a252f 50%, #2C3E50 100%)',
                    borderRadius: '16px',
                  }}
                />

                {/* Frame bevel - gold/bronze accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    bottom: '8px',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 25%, #D4AF37 50%, #B8860B 75%, #D4AF37 100%)',
                    borderRadius: '12px',
                  }}
                />

                {/* Inner matting */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    right: '12px',
                    bottom: '12px',
                    background: '#1C2833',
                    borderRadius: '10px',
                  }}
                />

                {/* Content area - cream/off-white center */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    right: '20px',
                    bottom: '20px',
                    background: '#FFFEF9',
                    borderRadius: '6px',
                  }}
                />

                {/* Corner accents - top left */}
                <div
                  style={{
                    position: 'absolute',
                    top: '24px',
                    left: '24px',
                    width: '20px',
                    height: '20px',
                    borderTop: '2px solid #D4AF37',
                    borderLeft: '2px solid #D4AF37',
                  }}
                />
                {/* Corner accents - top right */}
                <div
                  style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    width: '20px',
                    height: '20px',
                    borderTop: '2px solid #D4AF37',
                    borderRight: '2px solid #D4AF37',
                  }}
                />
                {/* Corner accents - bottom left */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    width: '20px',
                    height: '20px',
                    borderBottom: '2px solid #D4AF37',
                    borderLeft: '2px solid #D4AF37',
                  }}
                />
                {/* Corner accents - bottom right */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    right: '24px',
                    width: '20px',
                    height: '20px',
                    borderBottom: '2px solid #D4AF37',
                    borderRight: '2px solid #D4AF37',
                  }}
                />

                {/* Card content */}
                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    padding: '32px 36px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Header row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {/* SVG sparkle icon for perfect alignment */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#00BCD4"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                      </svg>
                      <span
                        style={{
                          fontSize: '17px',
                          fontWeight: 700,
                          color: '#00BCD4',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Entropy Age
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#9CA3AF',
                      }}
                    >
                      {formattedDate}
                    </span>
                  </div>

                  {/* Main content */}
                  <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '-8px' }}>
                    {/* Label */}
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#9CA3AF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: '0px',
                      }}
                    >
                      Functional Age
                    </div>

                    {/* Big number with 3D effect */}
                    <div className="cert-number-container" style={{ marginBottom: '28px', paddingBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '100px',
                          fontWeight: 800,
                          color: isYounger ? '#22C55E' : isSame ? '#00BCD4' : '#F59E0B',
                          lineHeight: '1',
                          letterSpacing: '-0.04em',
                          textShadow: isYounger
                            ? '0 2px 0 #1DA34B, 0 4px 0 #188A3F, 0 6px 0 #147234, 0 8px 8px rgba(34, 197, 94, 0.3)'
                            : isSame
                              ? '0 2px 0 #00A5BD, 0 4px 0 #008FA3, 0 6px 0 #007889, 0 8px 8px rgba(0, 188, 212, 0.3)'
                              : '0 2px 0 #E08A0A, 0 4px 0 #C77808, 0 6px 0 #AE6707, 0 8px 8px rgba(245, 158, 11, 0.3)',
                          display: 'block',
                        }}
                      >
                        {functionalAge}
                      </span>
                    </div>

                    {/* Gap badge - polished pill with proper alignment */}
                    <div className="cert-badge-container" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          backgroundColor: isYounger ? 'rgba(34, 197, 94, 0.12)' : isSame ? 'rgba(0, 188, 212, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          border: `1.5px solid ${isYounger ? 'rgba(34, 197, 94, 0.3)' : isSame ? 'rgba(0, 188, 212, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        }}
                      >
                        {/* Arrow icon SVG for perfect alignment */}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={isYounger ? '#16A34A' : isSame ? '#0891B2' : '#D97706'}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ flexShrink: 0 }}
                        >
                          {isYounger ? (
                            /* Down arrow for younger (lower functional age) */
                            <path d="M12 5v14M5 12l7 7 7-7" />
                          ) : isSame ? (
                            /* Right arrow for same */
                            <path d="M5 12h14M13 5l7 7-7 7" />
                          ) : (
                            /* Up arrow for older (higher functional age) */
                            <path d="M12 19V5M5 12l7-7 7 7" />
                          )}
                        </svg>
                        <span
                          style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: isYounger ? '#16A34A' : isSame ? '#0891B2' : '#D97706',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {gapText}
                        </span>
                      </div>
                    </div>

                    {/* Actual age with divider */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {/* Centered divider line */}
                      <div
                        style={{
                          width: '140px',
                          height: '1px',
                          backgroundColor: '#E5E7EB',
                          marginBottom: '12px',
                        }}
                      />
                      {/* Actual age text */}
                      <div
                        style={{
                          fontSize: '16px',
                          color: '#6B7280',
                        }}
                      >
                        Actual age: <span style={{ fontWeight: 700, color: '#374151' }}>{chronologicalAge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#9CA3AF',
                        letterSpacing: '0.02em',
                      }}
                    >
                      EntropyAge.com
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* Medal Design - Clean & Premium */
              <>
                {/* Background - beige */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#F5F5DC',
                    borderRadius: '16px',
                  }}
                />

                {/* Card content */}
                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    padding: '24px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Header */}
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#8B4513',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                      }}
                    >
                      ✦ Entropy Age ✦
                    </span>
                  </div>

                  {/* Medal Container */}
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    {/* Two-stripe Ribbon */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        marginBottom: '-12px',
                        zIndex: 1,
                      }}
                    >
                      {/* Left ribbon stripe */}
                      <div
                        style={{
                          width: '16px',
                          height: '45px',
                          background: '#DC2626',
                          borderRadius: '0 0 3px 3px',
                        }}
                      />
                      {/* Right ribbon stripe */}
                      <div
                        style={{
                          width: '16px',
                          height: '45px',
                          background: '#DC2626',
                          borderRadius: '0 0 3px 3px',
                        }}
                      />
                    </div>

                    {/* Medal */}
                    <div
                      style={{
                        width: '180px',
                        height: '180px',
                        borderRadius: '50%',
                        background: '#daa520',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 2,
                        border: '4px solid #b8860b',
                      }}
                    >
                      {/* Inner circle - must be position:relative for text positioning */}
                      <div
                        style={{
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          background: '#fffef5',
                          border: '3px solid #daa520',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Text container - absolutely positioned within inner circle */}
                        <div
                          className="medal-text-container"
                          style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {/* Age number with 3D gold effect */}
                          <span
                            style={{
                              fontSize: '60px',
                              fontWeight: 800,
                              color: '#DAA520',
                              lineHeight: '1',
                              textShadow: '0 2px 0 #B8860B, 0 4px 0 #996515, 0 6px 0 #7A5210, 0 8px 8px rgba(218, 165, 32, 0.4)',
                            }}
                          >
                            {functionalAge}
                          </span>
                          <span
                            className="medal-bio-text"
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#A0522D',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginTop: '8px',
                            }}
                          >
                            Functional Age
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div style={{ textAlign: 'center' }}>
                    {/* Gap indicator */}
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: isYounger ? '#16A34A' : isSame ? '#0891B2' : '#B45309',
                        marginBottom: '6px',
                      }}
                    >
                      {isYounger ? '↓ ' : isSame ? '→ ' : '↑ '}{gapText}
                    </div>

                    {/* Actual age */}
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#5D4037',
                      }}
                    >
                      Actual age: <span style={{ fontWeight: 700, color: '#3E2723' }}>{chronologicalAge}</span>
                    </div>

                    {/* Date */}
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#8D6E63',
                        marginTop: '6px',
                      }}
                    >
                      {formattedDate}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#A1887F',
                      }}
                    >
                      EntropyAge.com
                    </span>
                  </div>
                </div>
              </>
            )}
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

        {/* Actions - Save, Share, Retake */}
        <motion.div
          className="flex flex-col gap-3 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
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

        {/* Explore Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-center text-foreground">Explore</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXPLORE_TOOLS.map((tool) => (
              <ComingSoonCard
                key={tool.id}
                tool={tool}
                isSubscribed={subscribedTools.includes(tool.id)}
                onViewMore={() => handleViewMore(tool)}
              />
            ))}
          </div>
        </motion.div>

        {/* Notify Modal */}
        <NotifyModal
          open={notifyModalOpen}
          onOpenChange={setNotifyModalOpen}
          toolId={selectedTool?.id || ''}
          toolName={selectedTool?.name || ''}
          toolDescription={selectedTool?.fullDescription || ''}
          sessionId={sessionId}
          onSuccess={handleSubscriptionSuccess}
        />

        {/* Add to Home Screen Prompt */}
        <AddToHomeScreen />
      </motion.div>
    </div>
  );
}
