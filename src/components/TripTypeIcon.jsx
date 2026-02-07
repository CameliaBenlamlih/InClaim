import { Plane, Train } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TripTypeIcon({ tripType, className }) {
  const Icon = tripType === 0 ? Plane : Train;
  return <Icon className={cn('w-5 h-5', className)} />;
}
