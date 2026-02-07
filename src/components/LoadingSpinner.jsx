import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function LoadingSpinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <motion.div
      className={cn('relative', sizeClasses[size], className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-dark-200" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-dark-700" />
    </motion.div>
  );
}
