import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";

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

const App = () => (
  <BrowserRouter>
    <DeferredProviders>
      <Routes>
        <Route path="/" element={<Index />} />
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
