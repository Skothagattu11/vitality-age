import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load pages for faster initial load
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load UI providers - not needed for initial render
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));

const queryClient = new QueryClient();

// Global function to remove loader - called when content is ready
function removeInitialLoader() {
  const loader = document.getElementById("initial-loader");
  if (loader && loader.style.opacity !== "0") {
    loader.style.transition = "opacity 0.3s ease-out";
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 300);
  }
}

// PageLoader that keeps static HTML visible
const PageLoader = () => {
  // Static HTML in index.html stays visible - don't show anything here
  // This prevents a flash of empty content
  return null;
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

// Wrapper that removes loader only after content mounts
function ContentReady({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Content has mounted - now safe to remove static HTML
    removeInitialLoader();
  }, []);

  return <>{children}</>;
}

// Main app content
function AppContent() {
  return (
    <DeferredProviders>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<ContentReady><Index /></ContentReady>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<ContentReady><NotFound /></ContentReady>} />
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
