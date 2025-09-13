import React from 'react';
import type { PackageWithCustomer } from '../types.ts';
import { STATUS_STYLES } from '../constants.ts';

interface PackageListItemProps {
  pkg: PackageWithCustomer;
  onEdit: (pkg: PackageWithCustomer) => void;
}

const PackageListItem: React.FC<PackageListItemProps> = ({ pkg, onEdit }) => {
  const statusStyle = STATUS_STYLES[pkg.status];
  
  const formattedDate = new Date(pkg.orderDate).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg p-5 border-r-4" style={{borderColor: statusStyle.dot.replace('bg-', '--tw-bg-').replace('500', ' #38bdf8')}}>
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
        <div className="lg:col-span-1">
          <p className="font-bold text-lg text-slate-800">{pkg.customer.name}</p>
          <p className="text-sm text-slate-500">{pkg.customer.phone}</p>
        </div>
        <div className="lg:col-span-1">
          <p className="font-semibold text-slate-700">{pkg.productName}</p>
          <p className="text-sm text-slate-500">תאריך: {formattedDate}</p>
        </div>
        <div className="lg:col-span-1">
          <p className="text-sm text-slate-500">מספר מעקב</p>
          <p className="font-mono text-slate-700 tracking-wider">{pkg.trackingNumber || 'לא הונפק'}</p>
        </div>
        <div className="lg:col-span-1 flex justify-start md:justify-center">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`}></span>
            {pkg.status}
          </span>
        </div>
        <div className="lg:col-span-1 flex justify-end">
          <button
            onClick={() => onEdit(pkg)}
            className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            עריכה
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageListItem;