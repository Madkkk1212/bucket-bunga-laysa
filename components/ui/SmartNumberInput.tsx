'use client';

import React, { useState, useEffect } from 'react';

interface SmartNumberInputProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string; // '%', '°', 'px', etc.
  onChange: (val: number) => void;
  className?: string;
  ariaLabel?: string;
  title?: string;
  placeholder?: string;
}

export default function SmartNumberInput({
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  className = '',
  ariaLabel,
  title,
  placeholder,
}: SmartNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localVal, setLocalVal] = useState(String(value));

  // Sync from prop whenever external value changes and not actively focused
  useEffect(() => {
    if (!isFocused) {
      setLocalVal(String(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalVal(raw);

    // Don't clamp while user is typing incomplete characters (e.g. empty or lone negative sign)
    if (raw === '' || raw === '-' || raw === '+') {
      return;
    }

    const num = Number(raw);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  const commitValue = () => {
    setIsFocused(false);
    let num = Number(localVal);
    if (isNaN(num) || localVal === '' || localVal === '-') {
      num = value; // Fallback to current prop value
    } else {
      // Clamp within min and max
      num = Math.max(min, Math.min(max, num));
      if (step >= 1) {
        num = Math.round(num / step) * step;
      }
    }
    setLocalVal(String(num));
    onChange(num);
  };

  return (
    <div className={`smart-number-wrap ${className}`}>
      <input
        type="number"
        className="smart-number-input"
        min={min}
        max={max}
        step={step}
        value={isFocused ? localVal : value}
        placeholder={placeholder}
        onFocus={() => {
          setIsFocused(true);
          setLocalVal(String(value));
        }}
        onChange={handleChange}
        onBlur={commitValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
        aria-label={ariaLabel}
        title={title || ariaLabel}
      />
      {unit && <span className="smart-number-unit">{unit}</span>}
    </div>
  );
}
