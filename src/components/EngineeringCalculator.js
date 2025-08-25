import React, { useState } from 'react';

export default function EngineeringCalculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [angleMode, setAngleMode] = useState('DEG'); // DEG or RAD

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
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

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '^':
        return Math.pow(firstValue, secondValue);
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const toDegrees = (radians) => radians * (180 / Math.PI);

  const handleFunction = (func) => {
    const value = parseFloat(display);
    let result;

    switch (func) {
      case 'sin':
        result = angleMode === 'DEG' ? Math.sin(toRadians(value)) : Math.sin(value);
        break;
      case 'cos':
        result = angleMode === 'DEG' ? Math.cos(toRadians(value)) : Math.cos(value);
        break;
      case 'tan':
        result = angleMode === 'DEG' ? Math.tan(toRadians(value)) : Math.tan(value);
        break;
      case 'ln':
        result = value > 0 ? Math.log(value) : NaN;
        break;
      case 'log':
        result = value > 0 ? Math.log10(value) : NaN;
        break;
      case 'sqrt':
        result = value >= 0 ? Math.sqrt(value) : NaN;
        break;
      case 'square':
        result = value * value;
        break;
      case 'reciprocal':
        result = value !== 0 ? 1 / value : Infinity;
        break;
      case 'factorial':
        result = factorial(Math.floor(Math.abs(value)));
        break;
      case 'exp':
        result = Math.exp(value);
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      default:
        result = value;
    }

    setDisplay(isNaN(result) ? 'Error' : String(result));
    setWaitingForOperand(true);
  };

  const factorial = (n) => {
    if (n < 0 || n > 170) return NaN; // Prevent overflow
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const toggleAngleMode = () => {
    setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG');
  };

  return (
    <div className="calculator-modal">
      <div className="calculator-container engineering">
        <div className="calculator-header">
          <h3>Engineering Calculator</h3>
          <div className="angle-mode">
            <button className="mode-toggle" onClick={toggleAngleMode}>
              {angleMode}
            </button>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="calculator-display">
          <div className="display-text">{display}</div>
        </div>
        
        <div className="calculator-buttons engineering-grid">
          {/* Row 1 - Functions */}
          <button className="calc-btn function" onClick={() => handleFunction('sin')}>sin</button>
          <button className="calc-btn function" onClick={() => handleFunction('cos')}>cos</button>
          <button className="calc-btn function" onClick={() => handleFunction('tan')}>tan</button>
          <button className="calc-btn function" onClick={() => handleFunction('ln')}>ln</button>
          <button className="calc-btn function" onClick={() => handleFunction('log')}>log</button>
          
          {/* Row 2 - More Functions */}
          <button className="calc-btn function" onClick={() => handleFunction('sqrt')}>√</button>
          <button className="calc-btn function" onClick={() => handleFunction('square')}>x²</button>
          <button className="calc-btn function" onClick={() => performOperation('^')}>x^y</button>
          <button className="calc-btn function" onClick={() => handleFunction('exp')}>eˣ</button>
          <button className="calc-btn function" onClick={() => handleFunction('factorial')}>x!</button>
          
          {/* Row 3 - Constants and Clear */}
          <button className="calc-btn function" onClick={() => handleFunction('pi')}>π</button>
          <button className="calc-btn function" onClick={() => handleFunction('e')}>e</button>
          <button className="calc-btn function" onClick={() => handleFunction('reciprocal')}>1/x</button>
          <button className="calc-btn function" onClick={clear}>C</button>
          <button className="calc-btn operator" onClick={() => performOperation('÷')}>÷</button>
          
          {/* Row 4 - Numbers */}
          <button className="calc-btn number" onClick={() => inputNumber(7)}>7</button>
          <button className="calc-btn number" onClick={() => inputNumber(8)}>8</button>
          <button className="calc-btn number" onClick={() => inputNumber(9)}>9</button>
          <button className="calc-btn operator" onClick={() => performOperation('×')}>×</button>
          <button className="calc-btn number" onClick={() => inputNumber(4)}>4</button>
          
          {/* Row 5 - Numbers */}
          <button className="calc-btn number" onClick={() => inputNumber(5)}>5</button>
          <button className="calc-btn number" onClick={() => inputNumber(6)}>6</button>
          <button className="calc-btn operator" onClick={() => performOperation('-')}>−</button>
          <button className="calc-btn number" onClick={() => inputNumber(1)}>1</button>
          <button className="calc-btn number" onClick={() => inputNumber(2)}>2</button>
          
          {/* Row 6 - Numbers */}
          <button className="calc-btn number" onClick={() => inputNumber(3)}>3</button>
          <button className="calc-btn operator" onClick={() => performOperation('+')}>+</button>
          <button className="calc-btn number zero" onClick={() => inputNumber(0)}>0</button>
          <button className="calc-btn number" onClick={inputDecimal}>.</button>
          <button className="calc-btn equals" onClick={handleEquals}>=</button>
        </div>
      </div>
    </div>
  );
}
