import React, { useState, useEffect, useCallback } from 'react';
import type { Package, Customer, PackageWithCustomer, PackageUpdateData } from './types';
import { fetchPackagesWithCustomers, addPackage as addPackageService, updatePackage as updatePackageService } from './services/supabaseService';
import Header from './components/Header';
import PackageList from './components/PackageList';
import AddPackageModal from './components/AddPackageModal';
import UpdateStatusModal from './components/UpdateStatusModal';
import Spinner from './components/Spinner';
import { PlusIcon } from './components/icons/PlusIcon';

const App: React.FC = () => {
  const [packages, setPackages] = useState<PackageWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageWithCustomer | null>(null);

  const loadPackages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchPackagesWithCustomers();
      setPackages(data);
    } catch (err) {
      setError('אירעה שגיאה בטעינת החבילות.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddPackage = async (newPackageData: Omit<Package, 'id' | 'orderDate' | 'status' | 'customerId'>, newCustomerData: Omit<Customer, 'id'>) => {
    try {
      await addPackageService(newPackageData, newCustomerData);
      handleCloseAddModal();
      await loadPackages(); // Refresh list
    } catch (err) {
      setError('אירעה שגיאה בהוספת החבילה.');
      console.error(err);
    }
  };

  const handleOpenEditModal = (pkg: PackageWithCustomer) => {
    setSelectedPackage(pkg);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedPackage(null);
    setIsEditModalOpen(false);
  };

  const handleUpdatePackage = async (packageId: string, updates: PackageUpdateData) => {
    try {
      await updatePackageService(packageId, updates);
      handleCloseEditModal();
      await loadPackages();
    } catch (err) {
      setError('אירעה שגיאה בעדכון פרטי החבילה.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-700">מעקב משלוחים</h1>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
          >
            <PlusIcon />
            <span>הוסף חבילה חדשה</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : (
          <PackageList packages={packages} onEdit={handleOpenEditModal} />
        )}
      </main>

      {isAddModalOpen && (
        <AddPackageModal
          onClose={handleCloseAddModal}
          onAddPackage={handleAddPackage}
        />
      )}

      {isEditModalOpen && selectedPackage && (
        <UpdateStatusModal
          pkg={selectedPackage}
          onClose={handleCloseEditModal}
          onUpdatePackage={handleUpdatePackage}
        />
      )}
    </div>
  );
};

export default App;