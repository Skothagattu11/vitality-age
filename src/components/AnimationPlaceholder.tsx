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

function VideoAnimation({ src }: { src: string }) {
  return (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-contain rounded-lg"
    />
  );
}

const videoSources: Record<AnimationType, string> = {
  'sit-to-stand': '/videos/sit-to-stand.mp4',
  'wall-sit': '/videos/wall-sit.mp4',
  'balance': '/videos/balance.mp4',
  'march': '/videos/march.mp4',
  'overhead-reach': '/videos/overhead-reach.mp4',
  'cross-legged': '/videos/cross-legged.mp4',
};

export function AnimationPlaceholder({ type, className }: AnimationPlaceholderProps) {
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
        <VideoAnimation src={videoSources[type]} />
      </div>
      <p className="text-xs text-muted-foreground text-center font-medium">
        {labels[type]}
      </p>
    </div>
  );
}
