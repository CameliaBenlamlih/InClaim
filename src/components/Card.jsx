import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Card({ 
  children, 
  className, 
  hover = false,
  padding = 'md',
  animate = true,
  ...props 
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const Wrapper = animate ? motion.div : 'div';
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Wrapper
      {...animationProps}
      className={cn(
        'card',
        paddingClasses[padding],
        hover && 'hover:border-dark-500 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Wrapper>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-sm font-bold text-dark-900 uppercase tracking-wider', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-dark-500 mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-dark-200', className)}>
      {children}
    </div>
  );
}
