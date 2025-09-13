import React from 'react';
import type { PackageWithCustomer } from '../types';
import PackageListItem from './PackageListItem';

interface PackageListProps {
  packages: PackageWithCustomer[];
  onEdit: (pkg: PackageWithCustomer) => void;
}

const PackageList: React.FC<PackageListProps> = ({ packages, onEdit }) => {
  if (packages.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold text-slate-700">לא נמצאו חבילות</h3>
        <p className="text-slate-500 mt-2">לחץ על "הוסף חבילה חדשה" כדי להתחיל.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {packages.map(pkg => (
        <PackageListItem key={pkg.id} pkg={pkg} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default PackageList;