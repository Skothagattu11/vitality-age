import { useState } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email' })
    .max(255, { message: 'Email is too long' }),
});

interface NotifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolName: string;
  onSubmit: (email: string) => void;
}

export function NotifyModal({ open, onOpenChange, toolName, onSubmit }: NotifyModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    // Simulate brief delay for UX
    setTimeout(() => {
      onSubmit(result.data.email);
      setEmail('');
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{toolName}</DialogTitle>
          <DialogDescription>
            Get notified when this age tool becomes available.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              aria-label="Email address"
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !email.trim()}
          >
            <Bell className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Notify me'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            We'll email only when this tool is ready.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
