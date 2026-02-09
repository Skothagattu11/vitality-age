import { lazy, Suspense, useEffect, useState, useLayoutEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load pages for faster initial load
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load UI providers - not needed for initial render
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));

const queryClient = new QueryClient();

// Remove static HTML loader once React is ready
function useRemoveInitialLoader() {
  useLayoutEffect(() => {
    const loader = document.getElementById("initial-loader");
    if (loader) {
      // Add fade-out animation
      loader.style.transition = "opacity 0.3s ease-out";
      loader.style.opacity = "0";
      // Remove from DOM after animation
      setTimeout(() => {
        loader.remove();
      }, 300);
    }
  }, []);
}

// Minimal loading fallback that matches static HTML styling
const PageLoader = () => {
  // Don't show spinner if static HTML is still visible
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    // Only show spinner if loading takes longer than expected
    const timer = setTimeout(() => setShowSpinner(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!showSpinner) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

// Deferred UI components - load after main content
function DeferredProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load UI providers after a short delay to not block initial render
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {children}
      {mounted && (
        <Suspense fallback={null}>
          <Toaster />
          <Sonner />
        </Suspense>
      )}
    </>
  );
}

// Wrapper to handle initial loader removal
function AppContent() {
  useRemoveInitialLoader();

  return (
    <DeferredProviders>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </DeferredProviders>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
