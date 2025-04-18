
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Calculator from "./pages/Calculator";
import ExpenseTracker from "./pages/ExpenseTracker";
import TemperatureConverter from "./pages/TemperatureConverter";
import PomodoroTimer from "./pages/PomodoroTimer";
import TaskTracker from "./pages/TaskTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/temperature-converter" element={<TemperatureConverter />} />
          <Route path="/pomodoro-timer" element={<PomodoroTimer />} />
          <Route path="/task-tracker" element={<TaskTracker />} />
          <Route path="/expense-tracker" element={<ExpenseTracker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
