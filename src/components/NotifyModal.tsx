import { useState } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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
  toolId: string;
  toolName: string;
  toolDescription: string;
  sessionId?: string | null;
  onSuccess: (email: string) => void;
}

export function NotifyModal({ 
  open, 
  onOpenChange, 
  toolId,
  toolName, 
  toolDescription,
  sessionId,
  onSuccess 
}: NotifyModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error: insertError } = await supabase
        .from('tool_subscriptions')
        .insert({
          email: result.data.email,
          tool_id: toolId,
          session_id: sessionId || undefined,
        });
      
      if (insertError) {
        // Check for unique constraint violation
        if (insertError.code === '23505') {
          setError('This email is already subscribed for this tool');
        } else {
          console.error('Subscription error:', insertError);
          setError('Something went wrong. Please try again.');
        }
        return;
      }
      
      onSuccess(result.data.email);
      setEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{toolName}</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {toolDescription}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Be the first to access this age metric
            </label>
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
            {isSubmitting ? 'Submitting...' : 'Notify me when this is ready'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            We'll email only when this tool is ready.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
