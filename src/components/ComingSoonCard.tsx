import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';

interface ComingSoonTool {
  id: string;
  name: string;
  description: string;
}

interface ComingSoonCardProps {
  tool: ComingSoonTool;
  isSubscribed: boolean;
  onNotifyClick: () => void;
}

export function ComingSoonCard({ tool, isSubscribed, onNotifyClick }: ComingSoonCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-foreground">{tool.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
        </div>
        
        <Button
          variant={isSubscribed ? "subtle" : "outline"}
          size="sm"
          className="w-full"
          onClick={onNotifyClick}
          disabled={isSubscribed}
        >
          {isSubscribed ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Subscribed
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Notify me
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
