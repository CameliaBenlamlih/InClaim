import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn, getStatusColor, getStatusLabel } from '../../lib/utils';

const statusIcons = {
  0: Clock,
  1: CheckCircle,
  2: XCircle,
  3: AlertCircle,
};

export default function StatusBadge({ status, size = 'md', animated = true }) {
  const Icon = statusIcons[status] || Clock;
  const colorClass = getStatusColor(status);
  const label = getStatusLabel(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const Component = animated ? motion.span : 'span';
  const animationProps = animated
    ? {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: 'spring', duration: 0.4 },
      }
    : {};

  return (
    <Component
      {...animationProps}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-pill',
        sizeClasses[size],
        colorClass
      )}
    >
      <Icon className={iconSizes[size]} />
      {label}
    </Component>
  );
}
