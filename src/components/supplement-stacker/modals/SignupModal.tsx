import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignupModalProps {
  open: boolean;
  onSuccess: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function SignupModal({ open, onSuccess, onSkip, onClose }: SignupModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  if (!open) return null;

  const handleEmailAuth = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password: password || email.trim(), // fallback password
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (err) throw err;
      // OAuth redirects — onSuccess will be called after redirect
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[310] flex items-center justify-center p-5"
         style={{ background: 'hsl(0 0% 0% / 0.35)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-[360px] rounded-2xl p-6"
           style={{ background: 'hsl(var(--ss-bg))', border: '1px solid hsl(var(--ss-border))', boxShadow: 'var(--ss-shadow-lg)' }}>
        {/* Close */}
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-sm" style={{ color: 'hsl(var(--ss-text-muted))' }}>&times;</button>
        </div>

        <h2 className="ss-heading text-lg mb-1.5">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          {mode === 'signup'
            ? 'Save your stack and set up daily reminders.'
            : 'Sign in to access your saved stack.'
          }
        </p>

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3.5 py-3 rounded-lg text-sm mb-2"
          style={{ background: 'hsl(var(--ss-surface-raised))', border: '1px solid hsl(var(--ss-border))', color: 'hsl(var(--ss-text))' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
          className="w-full px-3.5 py-3 rounded-lg text-sm mb-3"
          style={{ background: 'hsl(var(--ss-surface-raised))', border: '1px solid hsl(var(--ss-border))', color: 'hsl(var(--ss-text))' }}
        />

        {error && (
          <p className="text-[11px] mb-3" style={{ color: 'hsl(var(--ss-danger))' }}>{error}</p>
        )}

        <button
          type="button"
          onClick={handleEmailAuth}
          disabled={loading || !email.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-50 mb-3"
          style={{ background: 'hsl(var(--ss-accent))' }}
        >
          {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </button>

        {/* Divider */}
        <div className="relative text-center my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: '1px solid hsl(var(--ss-border))' }} />
          </div>
          <span className="relative px-3 text-[11px]" style={{ background: 'hsl(var(--ss-bg))', color: 'hsl(var(--ss-text-muted))' }}>or</span>
        </div>

        {/* Google login */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))', color: 'hsl(var(--ss-text))' }}
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Toggle mode */}
        <p className="text-center text-[12px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
          {mode === 'signup' ? (
            <>Already have an account? <button type="button" onClick={() => setMode('login')} className="font-semibold bg-transparent border-none cursor-pointer" style={{ color: 'hsl(var(--ss-accent))' }}>Sign in</button></>
          ) : (
            <>Need an account? <button type="button" onClick={() => setMode('signup')} className="font-semibold bg-transparent border-none cursor-pointer" style={{ color: 'hsl(var(--ss-accent))' }}>Sign up</button></>
          )}
        </p>

        {/* Skip */}
        <button
          type="button"
          onClick={onSkip}
          className="w-full py-2 mt-3 text-[12px] font-medium bg-transparent border-none cursor-pointer"
          style={{ color: 'hsl(var(--ss-text-muted))' }}
        >
          Skip — continue without account
        </button>
      </div>
    </div>
  );
}
