import { Card, CardContent } from '@/components/ui/card';
import { Check, ChevronRight } from 'lucide-react';

interface ComingSoonTool {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
}

interface ComingSoonCardProps {
  tool: ComingSoonTool;
  isSubscribed: boolean;
  onViewMore: () => void;
}

export function ComingSoonCard({ tool, isSubscribed, onViewMore }: ComingSoonCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-foreground">{tool.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
        </div>
        
        {isSubscribed ? (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Check className="w-4 h-4" />
            <span>You'll be notified</span>
          </div>
        ) : (
          <button
            onClick={onViewMore}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View more
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}
