import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'text-dark-500 hover:text-dark-900 px-4 py-2 text-sm font-medium',
  danger: 'bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 px-6 py-3 font-medium text-sm rounded-pill',
  success: 'bg-green-50 border border-green-200 hover:bg-green-100 text-green-600 px-6 py-3 font-medium text-sm rounded-pill',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className,
    onClick,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        variants[variant],
        variant !== 'ghost' && sizes[size],
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
});

export default Button;
