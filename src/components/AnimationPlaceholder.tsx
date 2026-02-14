import { cn } from '@/lib/utils';
import {
  SitToStandAnim,
  WallSitAnim,
  BalanceAnim,
  MarchAnim,
  OverheadReachAnim,
  CrossLeggedAnim,
} from '@/components/animations';

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

const animations: Record<AnimationType, React.FC> = {
  'sit-to-stand': SitToStandAnim,
  'wall-sit': WallSitAnim,
  'balance': BalanceAnim,
  'march': MarchAnim,
  'overhead-reach': OverheadReachAnim,
  'cross-legged': CrossLeggedAnim,
};

const labels: Record<AnimationType, string> = {
  'sit-to-stand': 'Stand up fully, then sit back down',
  'wall-sit': 'Hold with thighs parallel to ground',
  'balance': 'Stand on one leg, arms relaxed at sides',
  'march': 'Lift knees to hip height',
  'overhead-reach': 'Reach overhead with back flat',
  'cross-legged': 'Cross legs, sit tall with straight spine',
};

export function AnimationPlaceholder({ type, className }: AnimationPlaceholderProps) {
  const AnimComponent = animations[type];

  return (
    <div className={cn(
      'w-full h-full flex flex-col items-center justify-center gap-3 p-4',
      className
    )}>
      <div className="w-full max-w-[220px] aspect-[4/3]">
        <AnimComponent />
      </div>
      <p className="text-xs text-muted-foreground text-center font-medium">
        {labels[type]}
      </p>
    </div>
  );
}
