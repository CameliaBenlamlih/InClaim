import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function dateToTimestamp(dateString) {
  return Math.floor(new Date(dateString).getTime() / 1000);
}

export function timestampToDateInput(timestamp) {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString().split('T')[0];
}

export function formatC2FLR(wei) {
  if (!wei) return '0';
  const value = Number(wei) / 1e18;
  return value.toFixed(value < 0.01 ? 6 : 2);
}

export function parseC2FLR(value) {
  return BigInt(Math.floor(Number(value) * 1e18));
}

export function getStatusColor(status) {
  switch (status) {
    case 0: // ACTIVE
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 1: // CLAIMED
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 2: // REJECTED
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 3: // EXPIRED
      return 'bg-dark-100 text-dark-500 border-dark-200';
    default:
      return 'bg-dark-100 text-dark-500 border-dark-200';
  }
}

export function getStatusLabel(status) {
  const labels = ['Active', 'Claimed', 'Rejected', 'Expired'];
  return labels[status] || 'Unknown';
}

export function getTripTypeLabel(tripType) {
  return tripType === 0 ? 'Flight' : 'Train';
}

export function getTripTypeIcon(tripType) {
  return tripType === 0 ? 'Plane' : 'Train';
}
