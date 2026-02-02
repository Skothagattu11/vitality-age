import { motion } from 'framer-motion';
import { 
  User, 
  Armchair, 
  Timer as TimerIcon, 
  Footprints,
  ArrowUp,
  Move
} from 'lucide-react';
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

export function AnimationPlaceholder({ type, className }: AnimationPlaceholderProps) {
  const iconMap = {
    'sit-to-stand': Armchair,
    'wall-sit': TimerIcon,
    'balance': User,
    'march': Footprints,
    'overhead-reach': ArrowUp,
    'cross-legged': Move,
  };

  const labelMap = {
    'sit-to-stand': 'Sit & Stand Motion',
    'wall-sit': 'Wall Sit Hold',
    'balance': 'Single-Leg Balance',
    'march': 'High Knees March',
    'overhead-reach': 'Arms Overhead',
    'cross-legged': 'Cross-Legged Sit',
  };

  const Icon = iconMap[type];

  return (
    <div className={cn(
      'w-full h-full flex flex-col items-center justify-center gap-3 p-4',
      className
    )}>
      <motion.div
        className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Icon className="w-8 h-8 text-primary" />
      </motion.div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{labelMap[type]}</p>
        <p className="text-xs text-muted-foreground mt-1">Animation placeholder</p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
