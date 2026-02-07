import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Select = forwardRef(function Select(
  { label, error, options, className, placeholder, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'input-field appearance-none pr-10',
            error && 'border-red-500/50 focus:border-red-400',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 font-mono">{error}</p>
      )}
    </div>
  );
});

export default Select;
