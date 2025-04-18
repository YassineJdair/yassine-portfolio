
import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Play, Pause, RotateCcw } from 'lucide-react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const PomodoroTimer = () => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  
  const durations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };
  
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            const isWorkMode = mode === 'focus';
            if (isWorkMode) {
              const newCompletedSessions = completedSessions + 1;
              setCompletedSessions(newCompletedSessions);
              
              // After 4 sessions, take a long break
              if (newCompletedSessions % 4 === 0) {
                setMode('longBreak');
                return durations.longBreak;
              } else {
                setMode('shortBreak');
                return durations.shortBreak;
              }
            } else {
              setMode('focus');
              return durations.focus;
            }
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, mode, completedSessions]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(durations[mode]);
  };
  
  const changeMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setSeconds(durations[newMode]);
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const progress = (seconds / durations[mode]) * 100;
  
  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-8">Pomodoro Timer</h1>
          
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-center">
                {mode === 'focus' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-accent/20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * progress) / 100}
                    className={`
                      ${mode === 'focus' ? 'text-red-500' : mode === 'shortBreak' ? 'text-green-500' : 'text-blue-500'}
                      transition-all duration-500 ease-in-out
                    `}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{formatTime(seconds)}</span>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mb-6">
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={toggleTimer}
                  className="h-12 w-12 rounded-full"
                >
                  {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={resetTimer}
                  className="h-12 w-12 rounded-full"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="bg-accent/10 rounded-lg p-2 mb-4">
                <ToggleGroup type="single" value={mode} onValueChange={(value) => value && changeMode(value as TimerMode)}>
                  <ToggleGroupItem value="focus" className="px-4">Focus</ToggleGroupItem>
                  <ToggleGroupItem value="shortBreak" className="px-4">Short Break</ToggleGroupItem>
                  <ToggleGroupItem value="longBreak" className="px-4">Long Break</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Sessions completed: {completedSessions}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PomodoroTimer;
