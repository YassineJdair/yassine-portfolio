
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const clearAll = () => {
    setDisplay('0');
    setCurrentValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (currentValue === null) {
      setCurrentValue(display);
    } else if (operator) {
      const result = calculate(parseFloat(currentValue), inputValue, operator);
      setDisplay(String(result));
      setCurrentValue(String(result));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (a: number, b: number, op: string) => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 'Error';
      default:
        return b;
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader>
            <CardTitle className="text-center">Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-card/70 border border-border/40 rounded p-4 mb-4 text-right">
              <div className="text-3xl font-mono">{display}</div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={clearAll} className="col-span-2">
                AC
              </Button>
              <Button variant="outline" onClick={() => setDisplay(display.slice(0, -1) || '0')}>
                ⌫
              </Button>
              <Button variant="outline" onClick={() => performOperation('÷')}>
                ÷
              </Button>
              
              <Button variant="outline" onClick={() => inputDigit('7')}>7</Button>
              <Button variant="outline" onClick={() => inputDigit('8')}>8</Button>
              <Button variant="outline" onClick={() => inputDigit('9')}>9</Button>
              <Button variant="outline" onClick={() => performOperation('×')}>×</Button>
              
              <Button variant="outline" onClick={() => inputDigit('4')}>4</Button>
              <Button variant="outline" onClick={() => inputDigit('5')}>5</Button>
              <Button variant="outline" onClick={() => inputDigit('6')}>6</Button>
              <Button variant="outline" onClick={() => performOperation('-')}>-</Button>
              
              <Button variant="outline" onClick={() => inputDigit('1')}>1</Button>
              <Button variant="outline" onClick={() => inputDigit('2')}>2</Button>
              <Button variant="outline" onClick={() => inputDigit('3')}>3</Button>
              <Button variant="outline" onClick={() => performOperation('+')}>+</Button>
              
              <Button variant="outline" onClick={() => inputDigit('0')} className="col-span-2">
                0
              </Button>
              <Button variant="outline" onClick={inputDecimal}>.</Button>
              <Button 
                variant="default" 
                onClick={() => performOperation('=')}
                className="bg-primary text-primary-foreground"
              >
                =
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Calculator;
