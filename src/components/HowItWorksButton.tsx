import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface HowItWorksButtonProps {
  testName: string;
  measure: string;
  relevance: string;
}

export function HowItWorksButton({ testName, measure, relevance }: HowItWorksButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <HelpCircle className="w-4 h-4 mr-1" />
          How it works
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{testName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-foreground mb-1">What we measure</h4>
            <p className="text-muted-foreground">{measure}</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Why it matters for functional age</h4>
            <p className="text-muted-foreground">{relevance}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
