
import { PackageStatus } from './types.ts';

export const PACKAGE_STATUSES: PackageStatus[] = [
  PackageStatus.RECEIVED,
  PackageStatus.PACKING,
  PackageStatus.SHIPPED,
  PackageStatus.IN_TRANSIT,
  PackageStatus.DELIVERED,
];

export const STATUS_STYLES: Record<PackageStatus, { text: string; bg: string; dot: string; }> = {
  [PackageStatus.RECEIVED]: { text: 'text-blue-800', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  [PackageStatus.PACKING]: { text: 'text-yellow-800', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  [PackageStatus.SHIPPED]: { text: 'text-purple-800', bg: 'bg-purple-100', dot: 'bg-purple-500' },
  [PackageStatus.IN_TRANSIT]: { text: 'text-cyan-800', bg: 'bg-cyan-100', dot: 'bg-cyan-500' },
  [PackageStatus.DELIVERED]: { text: 'text-green-800', bg: 'bg-green-100', dot: 'bg-green-500' },
};