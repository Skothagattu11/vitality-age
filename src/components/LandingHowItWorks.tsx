import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function LandingHowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="link" className="text-muted-foreground">
            <Info className="w-4 h-4 mr-1" />
            How it works
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How Entropy Age Works</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Entropy Age estimates your functional biological age through
              5 simple at-home tests that measure:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span><strong>Lower-body strength</strong> - Chair sit-to-stand test</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span><strong>Muscular endurance</strong> - Wall sit hold</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span><strong>Balance & proprioception</strong> - Single-leg balance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span><strong>Cardiovascular recovery</strong> - 60-second march</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">5.</span>
                <span><strong>Mobility</strong> - Overhead reach & seated flexibility</span>
              </li>
            </ul>
            <p>
              Your answers are scored against age-adjusted benchmarks to
              estimate how well your body functions compared to your
              chronological age.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
