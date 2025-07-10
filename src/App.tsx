
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocationProvider } from "@/hooks/useLocationState";
import Index from "./pages/Index";
import FishingCalendar from "./pages/FishingCalendar";
import Settings from "./pages/Settings";
import LocationOnboardingStep1 from "./pages/LocationOnboardingStep1";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LocationProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/fishing-calendar" element={<FishingCalendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/location-onboarding-step1" element={<LocationOnboardingStep1 />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LocationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
