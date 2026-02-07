import { motion } from 'framer-motion';
import { cn, getStatusColor, getStatusLabel } from '../lib/utils';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const statusIcons = {
  0: Clock,        // ACTIVE
  1: CheckCircle,  // CLAIMED
  2: XCircle,      // REJECTED
  3: AlertCircle,  // EXPIRED
};

export default function StatusBadge({ status, size = 'md', animate = true }) {
  const Icon = statusIcons[status] || AlertCircle;
  const label = getStatusLabel(status);
  const colorClasses = getStatusColor(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const Badge = animate ? motion.span : 'span';
  const animationProps = animate
    ? {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Badge
      {...animationProps}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        colorClasses,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {label}
    </Badge>
  );
}
