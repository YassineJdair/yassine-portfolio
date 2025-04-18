
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Clock, Trash2, Plus } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  date: string;
}

const TaskTracker = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Research React best practices', completed: false, date: '2025-04-20' },
    { id: 2, text: 'Complete project documentation', completed: true, date: '2025-04-19' },
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now(),
        text: newTaskText,
        completed: false,
        date: new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };

  const toggleComplete = (id: number) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-8">Task Tracker</h1>
          
          <Card className="mb-6 border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addTask} className="flex items-center gap-3">
                <Input 
                  type="text" 
                  placeholder="Enter a new task..." 
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks yet. Add a task to get started!
              </div>
            ) : (
              tasks.map(task => (
                <Card key={task.id} className={`border-border/50 ${task.completed ? 'bg-accent/20' : 'bg-card/70'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button 
                          size="icon" 
                          variant={task.completed ? "default" : "outline"}
                          className={`h-8 w-8 rounded-full ${task.completed ? 'bg-primary' : ''}`}
                          onClick={() => toggleComplete(task.id)}
                        >
                          {task.completed && <Check className="h-4 w-4" />}
                        </Button>
                        <div>
                          <p className={`text-foreground ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.text}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1" /> {task.date}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteTask(task.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaskTracker;
