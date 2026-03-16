import type { UserActivity } from '@/types/supplementStacker';

const WORK_TYPES = ['9-to-5 office', 'Remote / hybrid', 'Shift work', 'Freelance / flexible', 'Student'];
const SPORTS = ['Morning gym', 'Evening gym', 'Running', 'Yoga / Pilates', 'Sports (team)', 'Swimming', 'Cycling', 'None'];

interface ActivityStepProps {
  activity: UserActivity;
  onUpdate: (activity: UserActivity) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ActivityStep({ activity, onUpdate, onNext, onBack }: ActivityStepProps) {
  const toggleSport = (sport: string) => {
    const sports = activity.sports.includes(sport)
      ? activity.sports.filter(s => s !== sport)
      : [...activity.sports, sport];
    onUpdate({ ...activity, sports });
  };

  const canProceed = activity.workType !== '' && activity.sports.length > 0;

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--ss-accent))' }}>
          Step 2 of 4
        </div>
        <h2 className="ss-heading text-xl mb-1">Activity & Lifestyle</h2>
        <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          Your activity level affects when to take certain supplements.
        </p>
      </div>

      <div className="flex-1 mt-4 space-y-5">
        {/* Work type */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Work Schedule
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WORK_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onUpdate({ ...activity, workType: type })}
                className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all active:scale-[0.95]"
                style={{
                  background: activity.workType === type ? 'hsl(var(--ss-accent-soft))' : 'hsl(var(--ss-surface))',
                  border: `1px solid ${activity.workType === type ? 'hsl(var(--ss-accent) / 0.2)' : 'hsl(var(--ss-border))'}`,
                  color: activity.workType === type ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-text-secondary))',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Work start & end time — shown after selecting a work type */}
        {activity.workType && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              Work Hours
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'hsl(var(--ss-text-muted))' }}>Start</label>
                <input
                  type="time"
                  value={activity.workStartTime}
                  onChange={(e) => onUpdate({ ...activity, workStartTime: e.target.value })}
                  className="ss-font-mono text-sm font-semibold w-full px-3 py-2.5 rounded-lg"
                  style={{
                    color: 'hsl(var(--ss-accent))',
                    background: 'hsl(var(--ss-accent-soft))',
                    border: '1px solid hsl(var(--ss-accent) / 0.2)',
                  }}
                />
              </div>
              <span className="text-[13px] mt-4" style={{ color: 'hsl(var(--ss-text-muted))' }}>to</span>
              <div className="flex-1">
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'hsl(var(--ss-text-muted))' }}>End</label>
                <input
                  type="time"
                  value={activity.workEndTime}
                  onChange={(e) => onUpdate({ ...activity, workEndTime: e.target.value })}
                  className="ss-font-mono text-sm font-semibold w-full px-3 py-2.5 rounded-lg"
                  style={{
                    color: 'hsl(var(--ss-accent))',
                    background: 'hsl(var(--ss-accent-soft))',
                    border: '1px solid hsl(var(--ss-accent) / 0.2)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Sports */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Exercise & Sports
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SPORTS.map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => toggleSport(sport)}
                className="ss-pill"
                style={{
                  background: activity.sports.includes(sport) ? 'hsl(var(--ss-accent-soft))' : undefined,
                  borderColor: activity.sports.includes(sport) ? 'hsl(var(--ss-accent))' : undefined,
                  color: activity.sports.includes(sport) ? 'hsl(var(--ss-accent))' : undefined,
                }}
              >
                {activity.sports.includes(sport) && (
                  <svg className="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                )}
                {sport}
              </button>
            ))}
          </div>
        </div>

        {/* Workout time */}
        {activity.sports.length > 0 && !activity.sports.includes('None') && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              Usual Workout Time
            </div>
            <input
              type="time"
              value={activity.workoutTime}
              onChange={(e) => onUpdate({ ...activity, workoutTime: e.target.value })}
              className="ss-font-mono text-sm font-semibold px-4 py-2.5 rounded-lg"
              style={{
                color: 'hsl(var(--ss-accent))',
                background: 'hsl(var(--ss-accent-soft))',
                border: '1px solid hsl(var(--ss-accent) / 0.2)',
              }}
            />
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-2">
        <button type="button" onClick={onBack}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
          style={{ background: 'transparent', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border))' }}>
          Back
        </button>
        <button type="button" onClick={onNext}
          disabled={!canProceed}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-40"
          style={{ background: 'hsl(var(--ss-accent))' }}>
          Next
        </button>
      </div>
    </div>
  );
}
