import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CaseProvider } from "@/contexts/CaseContext";
import Index from "./pages/Index";
import Landing from "./pages/website/Landing";
import Features from "./pages/website/Features";
import Docs from "./pages/website/Docs";
import About from "./pages/website/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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

            {/* Application Routes */}
            <Route path="/app" element={<Index />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CaseProvider>
  </QueryClientProvider>
);

export default App;
