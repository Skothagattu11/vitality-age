import { motion } from 'framer-motion';

// ─── Premium Design System ──────────────────────────────────
const FC = '#00BCD4';     // Primary cyan
const FC2 = '#7C3AED';    // Secondary violet
const BW = 6;             // Body stroke width (premium thick)
const LW = 5;             // Limb stroke width
const HR = 15;            // Head radius
const JR = 4;             // Joint dot radius

const rev = (d = 2.5) => ({
  duration: d,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut' as const,
});

const breathe = (d = 3) => ({
  duration: d,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut' as const,
});

// ─── Shared SVG Defs (gradient, glow, background) ──────────
function Defs({ id = 'a' }: { id?: string }) {
  return (
    <defs>
      <linearGradient id={`hg-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={FC} />
        <stop offset="100%" stopColor={FC2} />
      </linearGradient>
      <radialGradient id={`bg-${id}`}>
        <stop offset="0%" stopColor={FC} stopOpacity={0.08} />
        <stop offset="60%" stopColor={FC} stopOpacity={0.03} />
        <stop offset="100%" stopColor={FC} stopOpacity={0} />
      </radialGradient>
      <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood floodColor={FC} floodOpacity="0.25" />
        <feComposite in2="blur" operator="in" result="softGlow" />
        <feMerge>
          <feMergeNode in="softGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// Joint dot helper
function Joint({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={JR} fill={FC} opacity={0.45} />;
}

// Animated joint dot
function AJoint({ cxK, cyK, t }: { cxK: number[]; cyK: number[]; t: object }) {
  return (
    <motion.circle
      r={JR} fill={FC} opacity={0.45}
      animate={{ cx: cxK, cy: cyK }}
      transition={t}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. SIT-TO-STAND
// Side view, person faces left. Chair on right.
// Arms crossed over chest → full stand → controlled sit.
// ═══════════════════════════════════════════════════════════════
export function SitToStandAnim() {
  const t = rev(2.2);
  const id = 'sts';
  return (
    <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
      <Defs id={id} />
      <circle cx={100} cy={135} r={90} fill={`url(#bg-${id})`} />

      {/* Floor */}
      <line x1={15} y1={235} x2={185} y2={235} stroke="currentColor" strokeWidth={1.5} opacity={0.12} />
      {/* Chair */}
      <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" opacity={0.2}>
        <line x1={108} y1={152} x2={158} y2={152} />
        <line x1={158} y1={95} x2={158} y2={152} />
        <line x1={108} y1={152} x2={108} y2={235} />
        <line x1={158} y1={152} x2={158} y2={235} />
      </g>

      <g filter={`url(#glow-${id})`}>
        {/* Head */}
        <motion.circle
          r={HR} fill={`url(#hg-${id})`} fillOpacity={0.2}
          stroke={FC} strokeWidth={3}
          animate={{ cx: [104, 80], cy: [72, 36] }}
          transition={t}
        />
        {/* Spine */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{ x1: [107, 82], y1: [88, 53], x2: [135, 84], y2: [148, 126] }}
          transition={t}
        />
        {/* Thigh */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{ x1: [135, 84], y1: [148, 126], x2: [90, 80], y2: [155, 180] }}
          transition={t}
        />
        {/* Shin */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{ x1: [90, 80], y1: [155, 180], x2: [88, 78], y2: [232, 232] }}
          transition={t}
        />
        {/* Foot */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [88, 78], y1: [232, 232], x2: [72, 62], y2: [232, 232] }}
          transition={t}
        />
        {/* Upper arm (crossed) */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [110, 84], y1: [96, 62], x2: [96, 74], y2: [116, 80] }}
          transition={t}
        />
        {/* Forearm (crossed) */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [96, 74], y1: [116, 80], x2: [116, 88], y2: [96, 62] }}
          transition={t}
        />
      </g>

      {/* Joint dots */}
      <g>
        <AJoint cxK={[107, 82]} cyK={[88, 53]} t={t} />
        <AJoint cxK={[135, 84]} cyK={[148, 126]} t={t} />
        <AJoint cxK={[90, 80]} cyK={[155, 180]} t={t} />
        <AJoint cxK={[88, 78]} cyK={[232, 232]} t={t} />
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. WALL SIT
// Side view, facing left. Wall on right.
// 90° hold: thighs parallel, shins vertical, back flat.
// ═══════════════════════════════════════════════════════════════
export function WallSitAnim() {
  const t = breathe(3);
  const id = 'ws';
  return (
    <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
      <Defs id={id} />
      <circle cx={120} cy={140} r={85} fill={`url(#bg-${id})`} />

      {/* Floor */}
      <line x1={15} y1={235} x2={185} y2={235} stroke="currentColor" strokeWidth={1.5} opacity={0.12} />
      {/* Wall */}
      <line x1={160} y1={20} x2={160} y2={235} stroke="currentColor" strokeWidth={3} opacity={0.15} />
      {/* 90° angle indicator */}
      <path d="M 118 140 L 118 152 L 108 152" stroke={FC} strokeWidth={1.5} opacity={0.3} fill="none" />

      <g filter={`url(#glow-${id})`}>
        {/* Head */}
        <motion.circle
          r={HR} fill={`url(#hg-${id})`} fillOpacity={0.2}
          stroke={FC} strokeWidth={3}
          animate={{ cx: [152, 152], cy: [50, 48] }}
          transition={t}
        />
        {/* Spine (back flat on wall) */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{ x1: [152, 152], y1: [66, 64], x2: [152, 152], y2: [138, 138] }}
          transition={t}
        />
        {/* Thigh (PARALLEL to floor) */}
        <line x1={152} y1={138} x2={108} y2={142} stroke={FC} strokeWidth={BW} strokeLinecap="round" />
        {/* Shin (VERTICAL) */}
        <line x1={108} y1={142} x2={108} y2={232} stroke={FC} strokeWidth={BW} strokeLinecap="round" />
        {/* Foot */}
        <line x1={108} y1={232} x2={90} y2={232} stroke={FC} strokeWidth={LW} strokeLinecap="round" />
        {/* Upper arm */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [150, 150], y1: [76, 74], x2: [142, 142], y2: [108, 106] }}
          transition={t}
        />
        {/* Forearm */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [142, 142], y1: [108, 106], x2: [140, 140], y2: [136, 134] }}
          transition={t}
        />
      </g>

      {/* Joint dots */}
      <Joint cx={152} cy={138} />
      <Joint cx={108} cy={142} />
      <Joint cx={108} cy={232} />
      <AJoint cxK={[150, 150]} cyK={[76, 74]} t={t} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. SINGLE-LEG BALANCE
// Front view. Right leg standing, left raised to mid-calf.
// Arms relaxed at sides. Subtle wobble.
// ═══════════════════════════════════════════════════════════════
export function BalanceAnim() {
  const t = rev(2.5);
  const id = 'bal';
  return (
    <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
      <Defs id={id} />
      <circle cx={100} cy={130} r={90} fill={`url(#bg-${id})`} />

      {/* Floor */}
      <line x1={15} y1={235} x2={185} y2={235} stroke="currentColor" strokeWidth={1.5} opacity={0.12} />
      {/* Wall hint */}
      <line x1={170} y1={80} x2={170} y2={235} stroke="currentColor" strokeWidth={1.5} opacity={0.1} strokeDasharray="6 4" />

      <g filter={`url(#glow-${id})`}>
        {/* Head */}
        <motion.circle
          r={HR} fill={`url(#hg-${id})`} fillOpacity={0.2}
          stroke={FC} strokeWidth={3}
          animate={{ cx: [98, 102], cy: [36, 36] }}
          transition={t}
        />
        {/* Shoulder line */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [76, 80], y1: [62, 62], x2: [120, 124], y2: [62, 62] }}
          transition={t}
        />
        {/* Spine */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{ x1: [98, 102], y1: [53, 53], x2: [98, 102], y2: [126, 126] }}
          transition={t}
        />
        {/* Hip line */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [86, 90], y1: [130, 130], x2: [110, 114], y2: [130, 130] }}
          transition={t}
        />
        {/* Left arm */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [76, 80], y1: [62, 62], x2: [70, 74], y2: [96, 96] }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [70, 74], y1: [96, 96], x2: [68, 72], y2: [126, 126] }}
          transition={t}
        />
        {/* Right arm */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [120, 124], y1: [62, 62], x2: [126, 130], y2: [96, 96] }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [126, 130], y1: [96, 96], x2: [128, 132], y2: [126, 126] }}
          transition={t}
        />
        {/* Right leg STANDING */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{ x1: [110, 114], y1: [130, 130], x2: [113, 117], y2: [180, 180] }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{ x1: [113, 117], y1: [180, 180], x2: [115, 119], y2: [232, 232] }}
          transition={t}
        />
        {/* Right foot */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [115, 119], y1: [232, 232], x2: [128, 132], y2: [232, 232] }}
          transition={t}
        />
        {/* Left leg RAISED */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{ x1: [86, 90], y1: [130, 130], x2: [82, 86], y2: [152, 152] }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{ x1: [82, 86], y1: [152, 152], x2: [76, 80], y2: [168, 168] }}
          transition={t}
        />
      </g>

      {/* Joint dots */}
      <AJoint cxK={[98, 102]} cyK={[126, 126]} t={t} />
      <AJoint cxK={[113, 117]} cyK={[180, 180]} t={t} />
      <AJoint cxK={[82, 86]} cyK={[152, 152]} t={t} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. HIGH-KNEE MARCH
// Front view. Alternating high knees with contralateral arm swing.
// Thigh reaches hip height on each step.
// ═══════════════════════════════════════════════════════════════
export function MarchAnim() {
  const t = {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut' as const,
    times: [0, 0.25, 0.5, 0.75, 1],
  };
  const id = 'mch';
  return (
    <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
      <Defs id={id} />
      <circle cx={100} cy={130} r={90} fill={`url(#bg-${id})`} />

      {/* Floor */}
      <line x1={15} y1={235} x2={185} y2={235} stroke="currentColor" strokeWidth={1.5} opacity={0.12} />
      {/* Hip-height reference */}
      <line x1={60} y1={128} x2={140} y2={128} stroke={FC} strokeWidth={1} opacity={0.12} strokeDasharray="4 3" />

      <g filter={`url(#glow-${id})`}>
        {/* Head */}
        <motion.circle
          r={HR} fill={`url(#hg-${id})`} fillOpacity={0.2}
          stroke={FC} strokeWidth={3}
          animate={{ cx: [100, 100, 100, 100, 100], cy: [33, 36, 33, 36, 33] }}
          transition={t}
        />
        {/* Shoulder line */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{
            x1: [78, 78, 78, 78, 78], y1: [59, 62, 59, 62, 59],
            x2: [122, 122, 122, 122, 122], y2: [59, 62, 59, 62, 59],
          }}
          transition={t}
        />
        {/* Spine */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{
            x1: [100, 100, 100, 100, 100], y1: [50, 53, 50, 53, 50],
            x2: [100, 100, 100, 100, 100], y2: [124, 128, 124, 128, 124],
          }}
          transition={t}
        />
        {/* Hip line */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{
            x1: [88, 88, 88, 88, 88], y1: [128, 132, 128, 132, 128],
            x2: [112, 112, 112, 112, 112], y2: [128, 132, 128, 132, 128],
          }}
          transition={t}
        />

        {/* LEFT ARM */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{
            x1: [78, 78, 78, 78, 78], y1: [59, 62, 59, 62, 59],
            x2: [62, 72, 82, 72, 62], y2: [42, 94, 94, 94, 42],
          }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{
            x1: [62, 72, 82, 72, 62], y1: [42, 94, 94, 94, 42],
            x2: [52, 70, 80, 70, 52], y2: [28, 124, 124, 124, 28],
          }}
          transition={t}
        />
        {/* RIGHT ARM */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{
            x1: [122, 122, 122, 122, 122], y1: [59, 62, 59, 62, 59],
            x2: [118, 128, 138, 128, 118], y2: [94, 94, 42, 94, 94],
          }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{
            x1: [118, 128, 138, 128, 118], y1: [94, 94, 42, 94, 94],
            x2: [120, 130, 148, 130, 120], y2: [124, 124, 28, 124, 124],
          }}
          transition={t}
        />

        {/* LEFT LEG */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{
            x1: [88, 88, 88, 88, 88], y1: [128, 132, 128, 132, 128],
            x2: [84, 84, 78, 84, 84], y2: [180, 180, 128, 180, 180],
          }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{
            x1: [84, 84, 78, 84, 84], y1: [180, 180, 128, 180, 180],
            x2: [82, 82, 86, 82, 82], y2: [232, 232, 158, 232, 232],
          }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{
            x1: [82, 82, 86, 82, 82], y1: [232, 232, 158, 232, 232],
            x2: [70, 70, 78, 70, 70], y2: [232, 232, 158, 232, 232],
          }}
          transition={t}
        />

        {/* RIGHT LEG */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{
            x1: [112, 112, 112, 112, 112], y1: [128, 132, 128, 132, 128],
            x2: [120, 116, 116, 116, 120], y2: [128, 180, 180, 180, 128],
          }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{
            x1: [120, 116, 116, 116, 120], y1: [128, 180, 180, 180, 128],
            x2: [112, 118, 118, 118, 112], y2: [158, 232, 232, 232, 158],
          }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{
            x1: [112, 118, 118, 118, 112], y1: [158, 232, 232, 232, 158],
            x2: [124, 130, 130, 130, 124], y2: [158, 232, 232, 232, 158],
          }}
          transition={t}
        />
      </g>

      {/* Joint dots (animated on raised knee) */}
      <motion.circle
        r={JR} fill={FC} opacity={0.45}
        animate={{ cx: [120, 116, 116, 116, 120], cy: [128, 180, 180, 180, 128] }}
        transition={t}
      />
      <motion.circle
        r={JR} fill={FC} opacity={0.45}
        animate={{ cx: [84, 84, 78, 84, 84], cy: [180, 180, 128, 180, 180] }}
        transition={t}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. OVERHEAD REACH
// Side view, facing left. Wall on right.
// Arms rise from sides to overhead. Back stays flat on wall.
// ═══════════════════════════════════════════════════════════════
export function OverheadReachAnim() {
  const t = rev(3);
  const id = 'ohr';
  return (
    <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
      <Defs id={id} />
      <circle cx={120} cy={130} r={85} fill={`url(#bg-${id})`} />

      {/* Floor */}
      <line x1={15} y1={235} x2={185} y2={235} stroke="currentColor" strokeWidth={1.5} opacity={0.12} />
      {/* Wall */}
      <line x1={160} y1={10} x2={160} y2={235} stroke="currentColor" strokeWidth={3} opacity={0.15} />

      <g filter={`url(#glow-${id})`}>
        {/* Head */}
        <circle cx={152} cy={38} r={HR} fill={`url(#hg-${id})`} fillOpacity={0.2} stroke={FC} strokeWidth={3} />
        {/* Spine (flat on wall) */}
        <line x1={152} y1={55} x2={152} y2={128} stroke={FC} strokeWidth={BW} strokeLinecap="round" />
        {/* Thigh */}
        <line x1={152} y1={128} x2={140} y2={180} stroke={FC} strokeWidth={BW} strokeLinecap="round" />
        {/* Shin */}
        <line x1={140} y1={180} x2={138} y2={232} stroke={FC} strokeWidth={BW} strokeLinecap="round" />
        {/* Foot */}
        <line x1={138} y1={232} x2={120} y2={232} stroke={FC} strokeWidth={LW} strokeLinecap="round" />

        {/* Upper arm (animated) */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [150, 150], y1: [66, 66], x2: [142, 152], y2: [100, 36] }}
          transition={t}
        />
        {/* Forearm (animated) */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [142, 152], y1: [100, 36], x2: [140, 152], y2: [130, 12] }}
          transition={t}
        />
      </g>

      {/* Wall contact markers */}
      <g opacity={0.25}>
        <line x1={157} y1={70} x2={165} y2={70} stroke={FC} strokeWidth={2} />
        <line x1={157} y1={95} x2={165} y2={95} stroke={FC} strokeWidth={2} />
        <line x1={157} y1={120} x2={165} y2={120} stroke={FC} strokeWidth={2} />
      </g>

      {/* Joint dots */}
      <Joint cx={152} cy={128} />
      <Joint cx={140} cy={180} />
      <AJoint cxK={[142, 152]} cyK={[100, 36]} t={t} />
      <AJoint cxK={[140, 152]} cyK={[130, 12]} t={t} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. CROSS-LEGGED FLOOR SIT
// Front view. Legs crossed (shins form X), spine upright.
// Hands on knees. Subtle breathing.
// ═══════════════════════════════════════════════════════════════
export function CrossLeggedAnim() {
  const t = breathe(3.5);
  const id = 'cl';
  return (
    <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
      <Defs id={id} />
      <circle cx={100} cy={130} r={85} fill={`url(#bg-${id})`} />

      {/* Floor */}
      <line x1={15} y1={198} x2={185} y2={198} stroke="currentColor" strokeWidth={1.5} opacity={0.12} />

      <g filter={`url(#glow-${id})`}>
        {/* Head */}
        <motion.circle
          r={HR} fill={`url(#hg-${id})`} fillOpacity={0.2}
          stroke={FC} strokeWidth={3}
          animate={{ cx: [100, 100], cy: [58, 56] }}
          transition={t}
        />
        {/* Shoulder line */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [76, 76], y1: [86, 84], x2: [124, 124], y2: [86, 84] }}
          transition={t}
        />
        {/* Spine (UPRIGHT) */}
        <motion.line
          stroke={FC} strokeWidth={BW} strokeLinecap="round"
          animate={{ x1: [100, 100], y1: [74, 72], x2: [100, 100], y2: [155, 155] }}
          transition={t}
        />
        {/* Left arm */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [76, 76], y1: [86, 84], x2: [66, 66], y2: [120, 118] }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [66, 66], y1: [120, 118], x2: [54, 54], y2: [152, 152] }}
          transition={t}
        />
        {/* Right arm */}
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [124, 124], y1: [86, 84], x2: [134, 134], y2: [120, 118] }}
          transition={t}
        />
        <motion.line
          stroke={FC} strokeWidth={LW} strokeLinecap="round"
          animate={{ x1: [134, 134], y1: [120, 118], x2: [146, 146], y2: [152, 152] }}
          transition={t}
        />
        {/* Hip line */}
        <line x1={88} y1={158} x2={112} y2={158} stroke={FC} strokeWidth={LW} strokeLinecap="round" />
        {/* Left thigh */}
        <line x1={88} y1={158} x2={52} y2={172} stroke={FC} strokeWidth={BW} strokeLinecap="round" />
        {/* Left shin (crossed under right) */}
        <line x1={52} y1={172} x2={125} y2={190} stroke={FC} strokeWidth={BW} strokeLinecap="round" />
        {/* Right thigh */}
        <line x1={112} y1={158} x2={148} y2={172} stroke={FC} strokeWidth={BW} strokeLinecap="round" />
        {/* Right shin (crossed under left) */}
        <line x1={148} y1={172} x2={75} y2={190} stroke={FC} strokeWidth={BW} strokeLinecap="round" />
      </g>

      {/* Joint dots */}
      <Joint cx={100} cy={155} />
      <Joint cx={52} cy={172} />
      <Joint cx={148} cy={172} />
      <AJoint cxK={[76, 76]} cyK={[86, 84]} t={t} />
      <AJoint cxK={[124, 124]} cyK={[86, 84]} t={t} />
    </svg>
  );
}
