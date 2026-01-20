import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CaseProvider } from "@/contexts/CaseContext";
import Landing from "./pages/website/Landing";
import Features from "./pages/website/Features";
import Docs from "./pages/website/Docs";
import About from "./pages/website/About";
import Impact from "./pages/website/Impact";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

// Lazy load the main application to keep the website bundle lightweight
const Index = lazy(() => import("./pages/Index"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
      <p className="text-slate-600 font-medium">Loading PathoAssist...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CaseProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Website Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/about" element={<About />} />
            <Route path="/impact" element={<Impact />} />

            {/* Application Routes - Lazy Loaded */}
            <Route
              path="/app"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Index />
                </Suspense>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CaseProvider>
  </QueryClientProvider>
);

export default App;
