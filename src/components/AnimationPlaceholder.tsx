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

// Sit-to-Stand Animation - Side view with proper chair
function SitToStandAnimation() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {/* Chair - Side view with back, seat, and legs */}
      <g fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="3" strokeLinecap="round">
        {/* Chair back */}
        <line x1="55" y1="50" x2="55" y2="95" />
        {/* Chair seat */}
        <line x1="55" y1="95" x2="95" y2="95" />
        {/* Chair front leg */}
        <line x1="90" y1="95" x2="90" y2="138" />
        {/* Chair back leg */}
        <line x1="58" y1="95" x2="58" y2="138" />
        {/* Chair back support */}
        <line x1="55" y1="60" x2="65" y2="60" />
        <line x1="55" y1="75" x2="65" y2="75" />
      </g>

      {/* Person - Side view */}
      <g>
        {/* Head */}
        <motion.circle
          r="11"
          fill="hsl(var(--primary))"
          animate={{
            cx: [85, 100, 85],
            cy: [58, 28, 58],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />

        {/* Torso */}
        <motion.line
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          animate={{
            x1: [85, 100, 85],
            y1: [70, 40, 70],
            x2: [75, 100, 75],
            y2: [92, 78, 92],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />

        {/* Arms crossed on chest */}
        <motion.line
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{
            x1: [70, 88, 70],
            y1: [78, 52, 78],
            x2: [90, 112, 90],
            y2: [82, 56, 82],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />

        {/* Upper leg (thigh) */}
        <motion.line
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          animate={{
            x1: [75, 100, 75],
            y1: [92, 78, 92],
            x2: [105, 105, 105],
            y2: [95, 95, 95],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />

        {/* Lower leg (shin) */}
        <motion.line
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          animate={{
            x1: [105, 105, 105],
            y1: [95, 95, 95],
            x2: [105, 105, 105],
            y2: [138, 138, 138],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />

        {/* Foot */}
        <motion.line
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{
            x1: [105, 105, 105],
            y1: [138, 138, 138],
            x2: [118, 118, 118],
            y2: [138, 138, 138],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />
      </g>

      {/* Rep counter indicator */}
      <motion.text
        x="160"
        y="30"
        fontSize="14"
        fontWeight="bold"
        fill="hsl(var(--primary))"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        ×30s
      </motion.text>

      {/* Floor */}
      <line x1="30" y1="140" x2="170" y2="140" stroke="hsl(var(--border))" strokeWidth="2" />
    </svg>
  );
}

// Wall Sit Animation - Clean side view
function WallSitAnimation() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {/* Wall */}
      <rect x="135" y="15" width="10" height="125" fill="hsl(var(--muted))" />

      {/* Person in wall sit - simple, clean side view */}
      <motion.g
        animate={{ x: [-0.2, 0.2, -0.2] }}
        transition={{ duration: 0.12, repeat: Infinity }}
      >
        {/* Head */}
        <circle cx="120" cy="35" r="10" fill="hsl(var(--primary))" />

        {/* Back - straight against wall */}
        <line
          x1="120" y1="45"
          x2="120" y2="80"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Arms resting on thighs */}
        <line
          x1="118" y1="55"
          x2="95" y2="75"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Thigh - horizontal (parallel to ground) */}
        <line
          x1="120" y1="80"
          x2="75" y2="80"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Shin - vertical (perpendicular to thigh) */}
        <line
          x1="75" y1="80"
          x2="75" y2="130"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Foot */}
        <line
          x1="75" y1="130"
          x2="90" y2="130"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </motion.g>

      {/* 90° angle indicator at knee */}
      <path
        d="M75 80 L75 92 L87 92"
        stroke="hsl(var(--secondary))"
        strokeWidth="2"
        fill="none"
      />
      <text
        x="78"
        y="106"
        fontSize="11"
        fontWeight="500"
        fill="hsl(var(--secondary))"
      >
        90°
      </text>

      {/* Quad strain indicator */}
      <motion.g
        animate={{ opacity: [0.2, 0.7, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <circle cx="97" cy="80" r="3" fill="hsl(var(--warning))" />
      </motion.g>

      {/* Floor */}
      <line x1="40" y1="132" x2="160" y2="132" stroke="hsl(var(--border))" strokeWidth="2" />
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

// March Animation - Side view with proper high-knee marching
function MarchAnimation() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {/* Person marching - side view */}
      <g>
        {/* Head */}
        <circle cx="100" cy="28" r="11" fill="hsl(var(--primary))" />

        {/* Neck */}
        <line x1="100" y1="39" x2="100" y2="45" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />

        {/* Torso - slight forward lean */}
        <line x1="100" y1="45" x2="98" y2="78" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />

        {/* Shoulders */}
        <line x1="88" y1="50" x2="112" y2="50" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />

        {/* Left arm - swings opposite to right leg */}
        <motion.path
          d="M90 50 L80 65 L75 80"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: [
              "M90 50 L80 65 L75 80",
              "M90 50 L100 60 L110 55",
              "M90 50 L80 65 L75 80",
            ],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Right arm - swings opposite to left leg */}
        <motion.path
          d="M110 50 L120 60 L130 55"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: [
              "M110 50 L120 60 L130 55",
              "M110 50 L100 65 L95 80",
              "M110 50 L120 60 L130 55",
            ],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Left leg - lifts high (knee to hip height) */}
        <motion.path
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: [
              "M98 78 L95 105 L95 138", // standing
              "M98 78 L75 78 L70 100",   // knee raised to hip height
              "M98 78 L95 105 L95 138", // standing
            ],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Right leg - alternates with left */}
        <motion.path
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{
            d: [
              "M98 78 L120 78 L125 100", // knee raised to hip height
              "M98 78 L102 105 L102 138", // standing
              "M98 78 L120 78 L125 100", // knee raised
            ],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Left foot */}
        <motion.line
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{
            x1: [95, 70, 95],
            y1: [138, 100, 138],
            x2: [108, 75, 108],
            y2: [138, 105, 138],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Right foot */}
        <motion.line
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{
            x1: [125, 102, 125],
            y1: [100, 138, 100],
            x2: [130, 115, 130],
            y2: [105, 138, 105],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </g>

      {/* Hip height reference line */}
      <g>
        <line x1="40" y1="78" x2="60" y2="78" stroke="hsl(var(--secondary))" strokeWidth="2" strokeDasharray="4 3" />
        <motion.text
          x="42"
          y="72"
          fontSize="10"
          fontWeight="500"
          fill="hsl(var(--secondary))"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          Hip
        </motion.text>
      </g>

      {/* 60 second indicator */}
      <text x="150" y="25" fontSize="11" fontWeight="600" fill="hsl(var(--muted-foreground))">
        60s
      </text>

      {/* Floor */}
      <line x1="30" y1="140" x2="170" y2="140" stroke="hsl(var(--border))" strokeWidth="2" />
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

// Cross-Legged Animation - Animated transition from standing to cross-legged sit
function CrossLeggedAnimation() {
  const dur = 3;
  const ease = "easeInOut";
  const times = [0, 0.35, 0.65, 1]; // stand → lower → seated → stand

  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
      {/* Floor / mat */}
      <ellipse cx="100" cy="138" rx="55" ry="6" fill="hsl(var(--muted))" />

      {/* Head */}
      <motion.circle
        r="10"
        fill="hsl(var(--primary))"
        animate={{
          cx: [100, 100, 100, 100],
          cy: [18, 30, 40, 18],
        }}
        transition={{ duration: dur, repeat: Infinity, ease, times }}
      />

      {/* Torso */}
      <motion.line
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{
          x1: [100, 100, 100, 100],
          y1: [30, 42, 52, 30],
          x2: [100, 100, 100, 100],
          y2: [70, 82, 90, 70],
        }}
        transition={{ duration: dur, repeat: Infinity, ease, times }}
      />

      {/* Shoulders */}
      <motion.line
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{
          x1: [85, 85, 83, 85],
          y1: [36, 48, 58, 36],
          x2: [115, 115, 117, 115],
          y2: [36, 48, 58, 36],
        }}
        transition={{ duration: dur, repeat: Infinity, ease, times }}
      />

      {/* Left arm */}
      <motion.path
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{
          d: [
            "M85 36 L78 52 L78 65",      // standing: arms at sides
            "M85 48 L75 62 L70 78",       // lowering
            "M83 58 L72 74 L68 92",       // seated: hand on knee
            "M85 36 L78 52 L78 65",       // back to standing
          ],
        }}
        transition={{ duration: dur, repeat: Infinity, ease, times }}
      />

      {/* Right arm */}
      <motion.path
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{
          d: [
            "M115 36 L122 52 L122 65",
            "M115 48 L125 62 L130 78",
            "M117 58 L128 74 L132 92",
            "M115 36 L122 52 L122 65",
          ],
        }}
        transition={{ duration: dur, repeat: Infinity, ease, times }}
      />

      {/* Left leg — thigh→knee→shin with bent knee when seated */}
      <motion.path
        stroke="hsl(var(--primary))"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{
          d: [
            "M96 70 L96 100 L96 118 L96 132",              // standing: straight leg
            "M96 82 L110 95 L120 105 L128 112",             // lowering: knee bending outward
            "M96 90 L115 98 L125 108 L132 118",             // seated: thigh out, knee bent, shin tucked under
            "M96 70 L96 100 L96 118 L96 132",               // back to standing
          ],
        }}
        transition={{ duration: dur, repeat: Infinity, ease, times }}
      />

      {/* Right leg — thigh→knee→shin with bent knee when seated */}
      <motion.path
        stroke="hsl(var(--primary))"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{
          d: [
            "M104 70 L104 100 L104 118 L104 132",           // standing: straight leg
            "M104 82 L90 95 L80 105 L72 112",               // lowering: knee bending outward
            "M104 90 L85 98 L75 108 L68 118",               // seated: thigh out, knee bent, shin crosses over
            "M104 70 L104 100 L104 118 L104 132",            // back to standing
          ],
        }}
        transition={{ duration: dur, repeat: Infinity, ease, times }}
      />

      {/* Left foot */}
      <motion.ellipse
        fill="hsl(var(--primary))"
        animate={{
          cx: [96, 124, 133, 96],
          cy: [134, 113, 113, 134],
          rx: [5, 6, 7, 5],
          ry: [3, 4, 4, 3],
        }}
        transition={{ duration: dur, repeat: Infinity, ease, times }}
      />

      {/* Right foot */}
      <motion.ellipse
        fill="hsl(var(--primary))"
        animate={{
          cx: [104, 76, 67, 104],
          cy: [134, 113, 113, 134],
          rx: [5, 6, 7, 5],
          ry: [3, 4, 4, 3],
        }}
        transition={{ duration: dur, repeat: Infinity, ease, times }}
      />

      {/* Spine alignment indicator - visible when seated */}
      <motion.line
        x1="100" y1="38"
        x2="100" y2="90"
        stroke="hsl(var(--success))"
        strokeWidth="2"
        strokeDasharray="4 3"
        animate={{ opacity: [0, 0, 0.6, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease, times }}
      />
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
    'overhead-reach': 'Reach overhead with back flat',
    'cross-legged': 'Cross legs, sit tall with straight spine',
  };

  return (
    <div className={cn(
      'w-full h-full flex flex-col items-center justify-center gap-3 p-4',
      className
    )}>
      <div className="w-full max-w-[220px] aspect-[4/3]">
        {animations[type]}
      </div>
      <p className="text-xs text-muted-foreground text-center font-medium">
        {labels[type]}
      </p>
    </div>
  );
}
