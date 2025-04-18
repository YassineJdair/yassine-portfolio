
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2 } from 'lucide-react';

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;

    const newExpense: Expense = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      category
    };

    setExpenses([...expenses, newExpense]);
    setDescription('');
    setAmount('');
    setCategory('');
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const chartData = expenses.reduce((acc: { name: string; value: number }[], expense) => {
    const existingCategory = acc.find(item => item.name === expense.category);
    if (existingCategory) {
      existingCategory.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, []);

  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Add Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addExpense} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Add Expense
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {expenses.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No expenses yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-border/50">
              <CardHeader>
                <CardTitle>Expense List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map(expense => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 bg-accent/20 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{expense.description}</h4>
                        <p className="text-sm text-muted-foreground">{expense.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">${expense.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteExpense(expense.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No expenses added yet
                    </div>
                  )}
                </div>
                {expenses.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex justify-between font-medium">
                      <span>Total Expenses</span>
                      <span>${totalExpenses.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExpenseTracker;
