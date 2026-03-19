import { useState } from 'react';
import type { useSkinScanner } from '@/hooks/useSkinScanner';
import type { SkinScanResult } from '@/types/skinScanner';

interface HomeScreenProps {
  scanner: ReturnType<typeof useSkinScanner>;
}

function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  const diffWeek = Math.floor(diffDay / 7);
  return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
}

function safetyColor(score: number): string {
  if (score >= 7) return 'var(--ss-good)';
  if (score >= 4) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

function compatibilityColor(score: number): string {
  if (score >= 70) return 'var(--ss-good)';
  if (score >= 40) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

function tierCount(scan: SkinScanResult) {
  return {
    hero: scan.ingredients.heroActives.length,
    supporting: scan.ingredients.supporting.length,
    base: scan.ingredients.baseFiller.length,
    watchOut: scan.ingredients.watchOut.length,
  };
}

export function HomeScreen({ scanner }: HomeScreenProps) {
  const { state, setScreen } = scanner;
  const profile = state.skinProfile;
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Count answered profile questions (6 total)
  const profileFields: (keyof typeof profile)[] = ['skinType', 'sensitivity', 'concerns', 'allergies', 'ageRange', 'routineComplexity'];
  const answeredCount = profileFields.filter(key => {
    const val = profile[key];
    if (Array.isArray(val)) return val.length > 0;
    return val !== null && val !== '';
  }).length;
  const totalQuestions = 6;
  const profileComplete = answeredCount === totalQuestions;

  return (
    <div>
      {/* Profile completeness card */}
      {!profileComplete && (
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            background: 'hsl(var(--ss-accent-soft))',
            border: '1px solid hsl(var(--ss-accent) / 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold" style={{ color: 'hsl(var(--ss-accent))' }}>
              Skin Profile
            </span>
            <span className="ss-font-mono text-[12px] font-bold" style={{ color: 'hsl(var(--ss-accent))' }}>
              {answeredCount}/{totalQuestions}
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-1.5 rounded-full mb-3"
            style={{ background: 'hsl(var(--ss-border))' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(answeredCount / totalQuestions) * 100}%`,
                background: 'hsl(var(--ss-accent))',
              }}
            />
          </div>

          <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
            Complete your profile for personalized compatibility scores.
          </p>

          <button
            type="button"
            onClick={() => setScreen('profile')}
            className="w-full py-2 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.97]"
            style={{
              background: 'hsl(var(--ss-accent))',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Complete Profile
          </button>
        </div>
      )}

      {profileComplete && (
        <div
          className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-4"
          style={{
            background: 'hsl(var(--ss-good) / 0.08)',
            border: '1px solid hsl(var(--ss-good) / 0.15)',
          }}
        >
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--ss-good))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          <span className="text-[11px] font-medium" style={{ color: 'hsl(var(--ss-good))' }}>
            Profile complete — scans are personalized to your skin.
          </span>
        </div>
      )}

      {/* Recent Scans */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Recent Scans
      </div>

      {state.scanHistory.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
          <svg
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: 'hsl(var(--ss-text-muted))' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7V4a2 2 0 0 1 2-2h3"/>
            <path d="M20 7V4a2 2 0 0 0-2-2h-3"/>
            <path d="M4 17v3a2 2 0 0 0 2 2h3"/>
            <path d="M20 17v3a2 2 0 0 1-2 2h-3"/>
            <line x1="7" y1="12" x2="17" y2="12"/>
          </svg>
          <p className="text-[13px] font-medium mb-1" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
            No scans yet
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Scan your first skincare product to see how it matches your skin.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {state.scanHistory.map((scan, index) => {
            const isExpanded = expandedId === index;
            const tiers = tierCount(scan);
            return (
              <button
                key={`${scan.scannedAt}-${index}`}
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : index)}
                className="w-full text-left rounded-xl overflow-hidden transition-all active:scale-[0.98]"
                style={{
                  background: 'hsl(var(--ss-surface))',
                  border: '1px solid hsl(var(--ss-border-soft))',
                  boxShadow: 'var(--ss-shadow-sm)',
                }}
              >
                {/* Main row */}
                <div className="flex items-center gap-3 p-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: 'hsl(var(--ss-text))' }}>
                      {scan.productName}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {scan.brand && (
                        <span className="text-[11px] truncate" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                          {scan.brand}
                        </span>
                      )}
                      <span className="text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                        {timeAgo(scan.scannedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Dual score badges */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div
                      className="ss-font-mono text-[11px] font-bold px-2 py-1 rounded-md"
                      style={{
                        background: `hsl(${safetyColor(scan.safetyScore)} / 0.12)`,
                        color: `hsl(${safetyColor(scan.safetyScore)})`,
                      }}
                    >
                      {scan.safetyScore}/10
                    </div>
                    <div
                      className="ss-font-mono text-[11px] font-bold px-2 py-1 rounded-md"
                      style={{
                        background: `hsl(${compatibilityColor(scan.compatibilityScore)} / 0.12)`,
                        color: `hsl(${compatibilityColor(scan.compatibilityScore)})`,
                      }}
                    >
                      {scan.compatibilityScore}/100
                    </div>
                  </div>

                  <svg
                    className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{
                      color: 'hsl(var(--ss-text-muted))',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5" style={{ borderTop: '1px solid hsl(var(--ss-border-soft))' }}>
                    <div className="pt-3">
                      {/* Verdict */}
                      <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                        {scan.verdict}
                      </p>

                      {/* Ingredient tier summary */}
                      <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                        Ingredient Breakdown
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        <TierBadge label="Hero" count={tiers.hero} color="var(--ss-accent)" />
                        <TierBadge label="Support" count={tiers.supporting} color="var(--ss-good)" />
                        <TierBadge label="Base" count={tiers.base} color="var(--ss-text-muted)" />
                        <TierBadge label="Watch" count={tiers.watchOut} color="var(--ss-danger)" />
                      </div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TierBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div
      className="rounded-lg py-1.5 text-center"
      style={{ background: `hsl(${color} / 0.08)` }}
    >
      <div className="ss-font-mono text-[14px] font-bold" style={{ color: `hsl(${color})` }}>
        {count}
      </div>
      <div className="text-[9px] font-medium" style={{ color: `hsl(${color})` }}>
        {label}
      </div>
    </div>
  );
}
