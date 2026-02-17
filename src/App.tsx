import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";

const FunctionalAge = lazy(() => import("./pages/FunctionalAge"));
const BrainAge = lazy(() => import("./pages/BrainAge"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));

function DeferredProviders({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);
  return (
    <>
      {children}
      {ready && <Suspense fallback={null}><Toaster /><Sonner /></Suspense>}
    </>
  );
}

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <BrowserRouter>
    <DeferredProviders>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/functional-age" element={
          <Suspense fallback={<PageLoader />}>
            <FunctionalAge />
          </Suspense>
        } />
        <Route path="/brain-age" element={
          <Suspense fallback={<PageLoader />}>
            <BrainAge />
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={null}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </DeferredProviders>
    <Analytics />
  </BrowserRouter>
);

export default App;
