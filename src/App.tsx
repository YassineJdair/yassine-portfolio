import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";

import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Experience from "./pages/Experience";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Calculator from "./pages/Calculator";
import ExpenseTracker from "./pages/ExpenseTracker";
import TemperatureConverter from "./pages/TemperatureConverter";
import PomodoroTimer from "./pages/PomodoroTimer";
import TaskTracker from "./pages/TaskTracker";
import GamesMenu from "./pages/Games";

// Games (components)
import CrossyRoad from "./components/CrossyRoad";
import PacmanGame from "./components/PacmanGame";
import CarGame from "./components/CarRoadGame";
import SnakeGame from "./components/SnakeGame";
import DailyWord from "./components/DailyWord";
import ZipGame from "./components/ZipGame";
import PatchesGame from "./components/PatchesGame";

// Tools
import PasswordGenerator from "./pages/PasswordGenerator";
import JsonFormatter from "./pages/JsonFormatter";
import SalaryCalculator from "./pages/SalaryCalculator";
import HabitTracker from "./pages/HabitTracker";
import CarCalculator from "./pages/CarCalculator";
import ReadmeGenerator from "./pages/ReadmeGenerator";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        {/* Main */}
                        <Route path="/" element={<Index />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/experience" element={<Experience />} />
                        <Route path="/about" element={<About />} />

                        {/* Games */}
                        <Route path="/games" element={<GamesMenu />} />
                        <Route path="/crossyroad" element={<CrossyRoad />} />
                        <Route path="/pacmangame" element={<PacmanGame />} />
                        <Route path="/carroadgame" element={<CarGame />} />
                        <Route path="/snake" element={<SnakeGame />} />
                        <Route path="/dailyword" element={<DailyWord />} />
                        <Route path="/zip" element={<ZipGame />} />
                        <Route path="/patches" element={<PatchesGame />} />

                        {/* Original tools */}
                        <Route path="/calculator" element={<Calculator />} />
                        <Route path="/temperature-converter" element={<TemperatureConverter />} />
                        <Route path="/pomodoro-timer" element={<PomodoroTimer />} />
                        <Route path="/task-tracker" element={<TaskTracker />} />
                        <Route path="/expense-tracker" element={<ExpenseTracker />} />

                        {/* Dev tools */}
                        <Route path="/password-generator" element={<PasswordGenerator />} />
                        <Route path="/json-formatter" element={<JsonFormatter />} />
                        <Route path="/readme-generator" element={<ReadmeGenerator />} />

                        {/* Finance & Life */}
                        <Route path="/salary-calculator" element={<SalaryCalculator />} />
                        <Route path="/car-calculator" element={<CarCalculator />} />

                        {/* Productivity */}
                        <Route path="/habit-tracker" element={<HabitTracker />} />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;