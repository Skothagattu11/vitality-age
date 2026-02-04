import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Share, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface AddToHomeScreenProps {
  onDismiss?: () => void;
}

export function AddToHomeScreen({ onDismiss }: AddToHomeScreenProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed/standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Check if already dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem('a2hs-dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS instructions after a short delay
      const timer = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(timer);
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('a2hs-dismissed', new Date().toISOString());
    setShowPrompt(false);
    onDismiss?.();
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Add to Home Screen</h3>
                  <p className="text-xs text-muted-foreground">Quick access anytime</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {isIOS ? (
                /* iOS Instructions */
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Install Entropy Age for quick access:
                  </p>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold">1</span>
                      <span>Tap the <Share className="w-4 h-4 inline mx-1" /> Share button</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold">2</span>
                      <span>Scroll and tap "Add to Home Screen"</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold">3</span>
                      <span>Tap "Add" to confirm</span>
                    </li>
                  </ol>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDismiss}
                    className="w-full mt-2"
                  >
                    Got it
                  </Button>
                </div>
              ) : deferredPrompt ? (
                /* Android/Chrome Install Button */
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Add Entropy Age to your home screen for quick access to track your biological age over time.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDismiss}
                      className="flex-1"
                    >
                      Maybe later
                    </Button>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={handleInstall}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Install
                    </Button>
                  </div>
                </div>
              ) : (
                /* Generic instructions for other browsers */
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Add this page to your home screen for quick access. Look for "Add to Home Screen" or "Install" in your browser menu.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDismiss}
                    className="w-full"
                  >
                    Got it
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
