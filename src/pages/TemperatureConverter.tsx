
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

const TemperatureConverter = () => {
  const [celsius, setCelsius] = useState('');
  const [fahrenheit, setFahrenheit] = useState('');

  const convertToFahrenheit = (celsius: string) => {
    if (!celsius) return '';
    const value = parseFloat(celsius);
    return ((value * 9/5) + 32).toFixed(2);
  };

  const convertToCelsius = (fahrenheit: string) => {
    if (!fahrenheit) return '';
    const value = parseFloat(fahrenheit);
    return ((value - 32) * 5/9).toFixed(2);
  };

  const handleCelsiusChange = (value: string) => {
    setCelsius(value);
    setFahrenheit(convertToFahrenheit(value));
  };

  const handleFahrenheitChange = (value: string) => {
    setFahrenheit(value);
    setCelsius(convertToCelsius(value));
  };

  const swapValues = () => {
    const tempCelsius = celsius;
    setCelsius(fahrenheit);
    setFahrenheit(tempCelsius);
  };

  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-md mx-auto px-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-center">Temperature Converter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="celsius">
                  Celsius (°C)
                </label>
                <Input
                  id="celsius"
                  type="number"
                  value={celsius}
                  onChange={(e) => handleCelsiusChange(e.target.value)}
                  placeholder="Enter temperature in Celsius"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapValues}
                  className="rounded-full"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="fahrenheit">
                  Fahrenheit (°F)
                </label>
                <Input
                  id="fahrenheit"
                  type="number"
                  value={fahrenheit}
                  onChange={(e) => handleFahrenheitChange(e.target.value)}
                  placeholder="Enter temperature in Fahrenheit"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TemperatureConverter;
