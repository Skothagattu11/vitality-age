import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const NotFound = lazy(() => import("./pages/NotFound"));
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));

const queryClient = new QueryClient();

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
  <QueryClientProvider client={queryClient}>
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
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
