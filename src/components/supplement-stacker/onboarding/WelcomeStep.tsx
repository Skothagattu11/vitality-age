interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ss-accent-bg">
          <svg className="w-8 h-8" style={{ color: 'hsl(var(--ss-accent))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.5 1.5 3 3L3 15l-1.5-1.5a4.243 4.243 0 0 1 0-6L7.5 1.5a4.243 4.243 0 0 1 6 0z" transform="translate(3 3) scale(0.85)"/>
            <path d="M8 8l4 4" transform="translate(3 3) scale(0.85)"/>
          </svg>
        </div>

        <h1 className="ss-heading text-2xl mb-2">Build Your Stack</h1>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          Tell us about your schedule, activity, and supplements. We'll build a science-backed timing plan in under 3 minutes.
        </p>

        {/* Features */}
        <div className="text-left mt-8 space-y-3 w-full max-w-xs">
          {[
            { icon: '\u23F0', text: 'Personalized to your wake/sleep cycle' },
            { icon: '\u26A1', text: 'Optimized for maximum absorption' },
            { icon: '\uD83D\uDCC5', text: 'Export to your calendar app' },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <span className="text-base">{f.icon}</span>
              <span className="text-sm" style={{ color: 'hsl(var(--ss-text-secondary))' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
          style={{ background: 'hsl(var(--ss-accent))' }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
