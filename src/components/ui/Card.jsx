import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Card({ children, className, hover = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -1, borderColor: '#8c8c8c' } : undefined}
      className={cn('card p-6', className)}
      {...props}
    >
      {children}
    </motion.div>
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
