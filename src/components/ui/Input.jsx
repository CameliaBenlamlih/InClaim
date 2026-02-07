import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(function Input(
  { label, error, className, type = 'text', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'input-field',
          error && 'border-red-500/50 focus:border-red-400',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-400 font-mono">{error}</p>
      )}
    </div>
  );
});

export default Input;
