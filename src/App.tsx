import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import Index from "./pages/Index";

const Projects = lazy(() => import("./pages/Projects"));
const Experience = lazy(() => import("./pages/Experience"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Calculator = lazy(() => import("./pages/Calculator"));
const ExpenseTracker = lazy(() => import("./pages/ExpenseTracker"));
const TemperatureConverter = lazy(() => import("./pages/TemperatureConverter"));
const PomodoroTimer = lazy(() => import("./pages/PomodoroTimer"));
const TaskTracker = lazy(() => import("./pages/TaskTracker"));
const GamesMenu = lazy(() => import("./pages/Games"));

// Games (components)
const CrossyRoad = lazy(() => import("./components/CrossyRoad"));
const PacmanGame = lazy(() => import("./components/PacmanGame"));
const CarGame = lazy(() => import("./components/CarRoadGame"));
const SnakeGame = lazy(() => import("./components/SnakeGame"));
const DailyWord = lazy(() => import("./components/DailyWord"));
const ZipGame = lazy(() => import("./components/ZipGame"));
const PatchesGame = lazy(() => import("./components/PatchesGame"));
const SpaceShooterGame = lazy(() => import("./components/SpaceShooterGame"));

// Tools
const PasswordGenerator = lazy(() => import("./pages/PasswordGenerator"));
const JsonFormatter = lazy(() => import("./pages/JsonFormatter"));
const SalaryCalculator = lazy(() => import("./pages/SalaryCalculator"));
const HabitTracker = lazy(() => import("./pages/HabitTracker"));
const CarCalculator = lazy(() => import("./pages/CarCalculator"));
const ReadmeGenerator = lazy(() => import("./pages/ReadmeGenerator"));
const QrCodeGenerator = lazy(() => import("./pages/QrCodeGenerator"));
const MortgageCalculator = lazy(() => import("./pages/MortgageCalculator"));

const queryClient = new QueryClient();

const AppRoutes = () => {
    const location = useLocation();

    return (
        <ErrorBoundary key={location.pathname}>
            <Suspense fallback={null}>
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
                    <Route path="/space-shooter" element={<SpaceShooterGame />} />

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
                    <Route path="/qr-code-generator" element={<QrCodeGenerator />} />

                    {/* Finance & Life */}
                    <Route path="/salary-calculator" element={<SalaryCalculator />} />
                    <Route path="/car-calculator" element={<CarCalculator />} />
                    <Route path="/mortgage-calculator" element={<MortgageCalculator />} />

                    {/* Productivity */}
                    <Route path="/habit-tracker" element={<HabitTracker />} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;