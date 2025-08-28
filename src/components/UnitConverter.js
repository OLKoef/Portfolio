import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiRefreshCw } from 'react-icons/fi';

export default function UnitConverter({ onClose }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElement = useRef(null);
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');

  // Focus management
  useEffect(() => {
    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Focus the close button when modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Handle escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Trap focus within modal
    const handleTabKey = (event) => {
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);

      // Return focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [onClose]);

  const unitCategories = {
    length: {
      name: 'Length',
      units: {
        meter: { name: 'Meter (m)', factor: 1 },
        kilometer: { name: 'Kilometer (km)', factor: 1000 },
        centimeter: { name: 'Centimeter (cm)', factor: 0.01 },
        millimeter: { name: 'Millimeter (mm)', factor: 0.001 },
        inch: { name: 'Inch (in)', factor: 0.0254 },
        foot: { name: 'Foot (ft)', factor: 0.3048 },
        yard: { name: 'Yard (yd)', factor: 0.9144 },
        mile: { name: 'Mile (mi)', factor: 1609.344 },
        nauticalMile: { name: 'Nautical Mile', factor: 1852 }
      }
    },
    weight: {
      name: 'Weight/Mass',
      units: {
        kilogram: { name: 'Kilogram (kg)', factor: 1 },
        gram: { name: 'Gram (g)', factor: 0.001 },
        pound: { name: 'Pound (lb)', factor: 0.453592 },
        ounce: { name: 'Ounce (oz)', factor: 0.0283495 },
        ton: { name: 'Metric Ton (t)', factor: 1000 },
        stone: { name: 'Stone (st)', factor: 6.35029 }
      }
    },
    temperature: {
      name: 'Temperature',
      units: {
        celsius: { name: 'Celsius (°C)', factor: 1 },
        fahrenheit: { name: 'Fahrenheit (°F)', factor: 1 },
        kelvin: { name: 'Kelvin (K)', factor: 1 }
      }
    },
    volume: {
      name: 'Volume',
      units: {
        liter: { name: 'Liter (L)', factor: 1 },
        milliliter: { name: 'Milliliter (mL)', factor: 0.001 },
        gallon: { name: 'Gallon (US)', factor: 3.78541 },
        quart: { name: 'Quart (US)', factor: 0.946353 },
        pint: { name: 'Pint (US)', factor: 0.473176 },
        cup: { name: 'Cup (US)', factor: 0.236588 },
        fluidOunce: { name: 'Fluid Ounce (US)', factor: 0.0295735 },
        tablespoon: { name: 'Tablespoon (US)', factor: 0.0147868 }
      }
    },
    area: {
      name: 'Area',
      units: {
        squareMeter: { name: 'Square Meter (m²)', factor: 1 },
        squareKilometer: { name: 'Square Kilometer (km²)', factor: 1000000 },
        squareCentimeter: { name: 'Square Centimeter (cm²)', factor: 0.0001 },
        squareFoot: { name: 'Square Foot (ft²)', factor: 0.092903 },
        squareInch: { name: 'Square Inch (in²)', factor: 0.00064516 },
        acre: { name: 'Acre', factor: 4046.86 },
        hectare: { name: 'Hectare (ha)', factor: 10000 }
      }
    },
    time: {
      name: 'Time',
      units: {
        second: { name: 'Second (s)', factor: 1 },
        minute: { name: 'Minute (min)', factor: 60 },
        hour: { name: 'Hour (h)', factor: 3600 },
        day: { name: 'Day', factor: 86400 },
        week: { name: 'Week', factor: 604800 },
        month: { name: 'Month (30 days)', factor: 2592000 },
        year: { name: 'Year (365 days)', factor: 31536000 }
      }
    }
  };

  // Set default units when category changes
  useEffect(() => {
    const units = Object.keys(unitCategories[category].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setInputValue('');
    setResult('');
  }, [category]);

  // Convert units
  useEffect(() => {
    if (inputValue && fromUnit && toUnit) {
      const value = parseFloat(inputValue);
      if (!isNaN(value)) {
        let convertedValue;

        if (category === 'temperature') {
          convertedValue = convertTemperature(value, fromUnit, toUnit);
        } else {
          const fromFactor = unitCategories[category].units[fromUnit].factor;
          const toFactor = unitCategories[category].units[toUnit].factor;
          convertedValue = (value * fromFactor) / toFactor;
        }

        setResult(formatResult(convertedValue));
      } else {
        setResult('');
      }
    } else {
      setResult('');
    }
  }, [inputValue, fromUnit, toUnit, category]);

  const convertTemperature = (value, from, to) => {
    // Convert to Celsius first
    let celsius;
    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * 5/9;
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }

    // Convert from Celsius to target unit
    switch (to) {
      case 'celsius':
        return celsius;
      case 'fahrenheit':
        return celsius * 9/5 + 32;
      case 'kelvin':
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  const formatResult = (value) => {
    if (value === 0) return '0';
    if (Math.abs(value) >= 1e6 || Math.abs(value) < 1e-4) {
      return value.toExponential(6);
    }
    return parseFloat(value.toFixed(8)).toString();
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const clearAll = () => {
    setInputValue('');
    setResult('');
  };

  return (
    <div className="calculator-modal" role="dialog" aria-modal="true" aria-labelledby="converter-title">
      <div className="unit-converter-container" ref={modalRef}>
        <div className="calculator-header">
          <h3 id="converter-title">Unit Converter</h3>
          <button
            ref={closeButtonRef}
            className="close-button"
            onClick={onClose}
            aria-label="Close unit converter"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="converter-content">
          {/* Category Selection */}
          <div className="category-selector">
            <label htmlFor="category">Category:</label>
            <select 
              id="category"
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              {Object.entries(unitCategories).map(([key, cat]) => (
                <option key={key} value={key}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* From Unit */}
          <div className="conversion-row">
            <div className="unit-input-group">
              <label htmlFor="from-value">From:</label>
              <div className="input-unit-pair">
                <input
                  id="from-value"
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Enter value"
                  className="value-input"
                />
                <select 
                  value={fromUnit} 
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="unit-select"
                >
                  {Object.entries(unitCategories[category].units).map(([key, unit]) => (
                    <option key={key} value={key}>{unit.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="swap-row">
            <button className="swap-button" onClick={swapUnits} title="Swap units">
              ⇅
            </button>
          </div>

          {/* To Unit */}
          <div className="conversion-row">
            <div className="unit-input-group">
              <label htmlFor="to-value">To:</label>
              <div className="input-unit-pair">
                <input
                  id="to-value"
                  type="text"
                  value={result}
                  readOnly
                  placeholder="Result"
                  className="value-input result-input"
                />
                <select 
                  value={toUnit} 
                  onChange={(e) => setToUnit(e.target.value)}
                  className="unit-select"
                >
                  {Object.entries(unitCategories[category].units).map(([key, unit]) => (
                    <option key={key} value={key}>{unit.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="converter-actions">
            <button className="converter-btn clear" onClick={clearAll}>
              Clear
            </button>
            <button 
              className="converter-btn copy" 
              onClick={() => navigator.clipboard?.writeText(result)}
              disabled={!result}
            >
              Copy Result
            </button>
          </div>

          {/* Quick Reference */}
          {inputValue && result && (
            <div className="conversion-summary">
              <p>
                <strong>{inputValue}</strong> {unitCategories[category].units[fromUnit].name} = 
                <strong> {result}</strong> {unitCategories[category].units[toUnit].name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
