import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AnimationType = 
  | 'sit-to-stand' 
  | 'wall-sit' 
  | 'balance' 
  | 'march' 
  | 'overhead-reach' 
  | 'cross-legged';

interface AnimationPlaceholderProps {
  type: AnimationType;
  className?: string;
}

// Sit-to-Stand Animation
function SitToStandAnimation() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {/* Chair */}
      <rect x="60" y="90" width="80" height="8" rx="2" fill="hsl(var(--muted))" />
      <rect x="65" y="98" width="8" height="40" rx="2" fill="hsl(var(--muted))" />
      <rect x="127" y="98" width="8" height="40" rx="2" fill="hsl(var(--muted))" />
      <rect x="130" y="60" width="8" height="40" rx="2" fill="hsl(var(--muted))" />
      
      {/* Animated Person */}
      <motion.g
        animate={{
          y: [0, -35, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Head */}
        <motion.circle 
          cx="100" 
          cy="55" 
          r="12" 
          fill="hsl(var(--primary))"
          animate={{
            cy: [55, 30, 55],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Body */}
        <motion.path
          d="M100 67 L100 95"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          animate={{
            d: ["M100 67 L100 95", "M100 42 L100 75", "M100 67 L100 95"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Arms crossed */}
        <motion.path
          d="M85 75 L115 75"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          animate={{
            d: ["M85 75 L115 75", "M85 55 L115 55", "M85 75 L115 75"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Legs */}
        <motion.path
          d="M100 95 L85 120 L85 140"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: ["M100 95 L85 120 L85 140", "M100 75 L95 105 L95 140", "M100 95 L85 120 L85 140"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M100 95 L115 120 L115 140"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: ["M100 95 L115 120 L115 140", "M100 75 L105 105 L105 140", "M100 95 L115 120 L115 140"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.g>
      
      {/* Floor */}
      <line x1="40" y1="140" x2="160" y2="140" stroke="hsl(var(--border))" strokeWidth="2" />
    </svg>
  );
}

// Wall Sit Animation
function WallSitAnimation() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {/* Wall */}
      <rect x="140" y="20" width="12" height="120" fill="hsl(var(--muted))" />
      
      {/* Person in wall sit position */}
      <motion.g
        animate={{
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Head */}
        <circle cx="115" cy="45" r="12" fill="hsl(var(--primary))" />
        
        {/* Body against wall */}
        <line x1="115" y1="57" x2="115" y2="85" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
        
        {/* Arms down */}
        <line x1="115" y1="65" x2="100" y2="80" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        <line x1="115" y1="65" x2="130" y2="80" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        
        {/* Thighs parallel to ground */}
        <line x1="115" y1="85" x2="85" y2="85" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
        
        {/* Shins vertical */}
        <line x1="85" y1="85" x2="85" y2="140" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
      
      {/* Shake effect for muscles */}
      <motion.g
        animate={{
          x: [-0.5, 0.5, -0.5],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
        }}
      >
        {/* Muscle burn indicators */}
        <motion.circle
          cx="100"
          cy="85"
          r="4"
          fill="hsl(var(--warning))"
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.g>
      
      {/* Floor */}
      <line x1="40" y1="140" x2="160" y2="140" stroke="hsl(var(--border))" strokeWidth="2" />
      
      {/* 90° angle indicator */}
      <path d="M85 85 L85 95 L95 95" stroke="hsl(var(--secondary))" strokeWidth="2" fill="none" />
      <text x="75" y="108" fontSize="10" fill="hsl(var(--secondary))">90°</text>
    </svg>
  );
}

// Balance Animation
function BalanceAnimation() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {/* Person balancing */}
      <motion.g
        animate={{
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "100px 140px" }}
      >
        {/* Head */}
        <motion.circle 
          cx="100" 
          cy="35" 
          r="12" 
          fill="hsl(var(--primary))"
        />
        
        {/* Body */}
        <line x1="100" y1="47" x2="100" y2="85" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
        
        {/* Arms out for balance */}
        <motion.line 
          x1="70" y1="60" x2="130" y2="60" 
          stroke="hsl(var(--primary))" 
          strokeWidth="5" 
          strokeLinecap="round"
        />
        
        {/* Standing leg */}
        <line x1="100" y1="85" x2="100" y2="140" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        
        {/* Lifted leg */}
        <motion.path
          d="M100 85 L120 95 L130 85"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: ["M100 85 L120 95 L130 85", "M100 85 L120 93 L132 88", "M100 85 L120 95 L130 85"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.g>
      
      {/* Balance point indicator */}
      <motion.circle
        cx="100"
        cy="140"
        r="6"
        fill="none"
        stroke="hsl(var(--secondary))"
        strokeWidth="2"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
      
      {/* Floor */}
      <line x1="40" y1="140" x2="160" y2="140" stroke="hsl(var(--border))" strokeWidth="2" />
    </svg>
  );
}

// March Animation
function MarchAnimation() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {/* Person marching */}
      <g>
        {/* Head */}
        <circle cx="100" cy="25" r="12" fill="hsl(var(--primary))" />
        
        {/* Body */}
        <line x1="100" y1="37" x2="100" y2="75" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
        
        {/* Arms swinging */}
        <motion.line 
          x1="100" y1="50" x2="80" y2="70" 
          stroke="hsl(var(--primary))" 
          strokeWidth="5" 
          strokeLinecap="round"
          animate={{
            x2: [80, 120, 80],
            y2: [70, 45, 70],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.line 
          x1="100" y1="50" x2="120" y2="45" 
          stroke="hsl(var(--primary))" 
          strokeWidth="5" 
          strokeLinecap="round"
          animate={{
            x2: [120, 80, 120],
            y2: [45, 70, 45],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Legs marching - Left */}
        <motion.path
          d="M100 75 L90 100 L90 140"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: [
              "M100 75 L90 100 L90 140",
              "M100 75 L85 85 L75 95",
              "M100 75 L90 100 L90 140",
            ],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Legs marching - Right */}
        <motion.path
          d="M100 75 L115 85 L125 95"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: [
              "M100 75 L115 85 L125 95",
              "M100 75 L110 100 L110 140",
              "M100 75 L115 85 L125 95",
            ],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </g>
      
      {/* Hip height indicator */}
      <motion.g
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      >
        <line x1="55" y1="75" x2="70" y2="75" stroke="hsl(var(--secondary))" strokeWidth="2" strokeDasharray="4 2" />
        <text x="45" y="78" fontSize="8" fill="hsl(var(--secondary))">Hip</text>
      </motion.g>
      
      {/* Floor */}
      <line x1="40" y1="140" x2="160" y2="140" stroke="hsl(var(--border))" strokeWidth="2" />
    </svg>
  );
}

// Overhead Reach Animation
function OverheadReachAnimation() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {/* Wall */}
      <rect x="130" y="10" width="12" height="130" fill="hsl(var(--muted))" />
      
      {/* Person reaching overhead */}
      <motion.g>
        {/* Head */}
        <circle cx="105" cy="50" r="12" fill="hsl(var(--primary))" />
        
        {/* Body against wall */}
        <line x1="105" y1="62" x2="105" y2="100" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
        
        {/* Arms reaching up */}
        <motion.path
          d="M105 70 L85 50 L85 30"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: [
              "M105 70 L85 50 L85 30",
              "M105 70 L95 40 L100 15",
              "M105 70 L85 50 L85 30",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M105 70 L125 50 L125 30"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: [
              "M105 70 L125 50 L125 30",
              "M105 70 L115 40 L110 15",
              "M105 70 L125 50 L125 30",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Legs */}
        <line x1="105" y1="100" x2="95" y2="140" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        <line x1="105" y1="100" x2="115" y2="140" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
      
      {/* Target on wall */}
      <motion.circle
        cx="136"
        cy="15"
        r="8"
        fill="none"
        stroke="hsl(var(--secondary))"
        strokeWidth="2"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      
      {/* Back flat indicator */}
      <motion.line
        x1="108"
        y1="62"
        x2="108"
        y2="100"
        stroke="hsl(var(--success))"
        strokeWidth="3"
        strokeDasharray="4 2"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Floor */}
      <line x1="40" y1="140" x2="160" y2="140" stroke="hsl(var(--border))" strokeWidth="2" />
    </svg>
  );
}

// Cross-Legged Animation
function CrossLeggedAnimation() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {/* Person sitting cross-legged */}
      <motion.g
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Head */}
        <circle cx="100" cy="40" r="12" fill="hsl(var(--primary))" />
        
        {/* Body - upright spine */}
        <line x1="100" y1="52" x2="100" y2="90" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
        
        {/* Arms resting on knees */}
        <path
          d="M100 70 L75 85 L70 100"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M100 70 L125 85 L130 100"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Cross-legged legs */}
        <path
          d="M100 90 L80 105 L60 110 L55 120"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M100 90 L120 105 L140 110 L145 120"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Feet crossing in front */}
        <ellipse cx="85" cy="120" rx="10" ry="6" fill="hsl(var(--primary))" />
        <ellipse cx="115" cy="118" rx="10" ry="6" fill="hsl(var(--primary))" />
      </motion.g>
      
      {/* Spine alignment indicator */}
      <motion.line
        x1="100"
        y1="38"
        x2="100"
        y2="90"
        stroke="hsl(var(--success))"
        strokeWidth="2"
        strokeDasharray="4 2"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Hip flexibility indicators */}
      <motion.g
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        <circle cx="70" cy="105" r="4" fill="hsl(var(--secondary))" opacity="0.6" />
        <circle cx="130" cy="105" r="4" fill="hsl(var(--secondary))" opacity="0.6" />
      </motion.g>
      
      {/* Floor/mat */}
      <rect x="45" y="125" width="110" height="4" rx="2" fill="hsl(var(--muted))" />
    </svg>
  );
}

export function AnimationPlaceholder({ type, className }: AnimationPlaceholderProps) {
  const animations: Record<AnimationType, React.ReactNode> = {
    'sit-to-stand': <SitToStandAnimation />,
    'wall-sit': <WallSitAnimation />,
    'balance': <BalanceAnimation />,
    'march': <MarchAnimation />,
    'overhead-reach': <OverheadReachAnimation />,
    'cross-legged': <CrossLeggedAnimation />,
  };

  const labels: Record<AnimationType, string> = {
    'sit-to-stand': 'Stand up fully, then sit back down',
    'wall-sit': 'Hold with thighs parallel to ground',
    'balance': 'Stand on one leg, arms out for balance',
    'march': 'Lift knees to hip height',
    'overhead-reach': 'Touch wall with back flat',
    'cross-legged': 'Sit with straight spine',
  };

  return (
    <div className={cn(
      'w-full h-full flex flex-col items-center justify-center gap-2 p-4',
      className
    )}>
      <div className="w-full max-w-[200px] aspect-[4/3]">
        {animations[type]}
      </div>
      <p className="text-xs text-muted-foreground text-center font-medium">
        {labels[type]}
      </p>
    </div>
  );
}
