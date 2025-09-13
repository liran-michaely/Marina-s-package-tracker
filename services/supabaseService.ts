import { PackageStatus } from '../types.ts';
import type { Package, Customer, PackageWithCustomer, PackageUpdateData } from '../types.ts';

// --- MOCK DATABASE ---
let mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'ישראל ישראלי', phone: '050-1234567' },
  { id: 'cust_2', name: 'משה כהן', phone: '052-7654321' },
];

let mockPackages: Package[] = [
  { id: 'pkg_1', customerId: 'cust_1', productName: 'עגילים מעוצבים', trackingNumber: 'RR123456789IL', status: PackageStatus.SHIPPED, orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'pkg_2', customerId: 'cust_2', productName: 'שרשרת זהב', trackingNumber: '', status: PackageStatus.PACKING, orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'pkg_3', customerId: 'cust_1', productName: 'צמיד כסף', trackingNumber: 'RR987654321IL', status: PackageStatus.DELIVERED, orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];
// --------------------

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchPackagesWithCustomers = async (): Promise<PackageWithCustomer[]> => {
  await simulateDelay(500);
  const data = mockPackages.map(pkg => {
    const customer = mockCustomers.find(c => c.id === pkg.customerId);
    if (!customer) throw new Error(`Customer not found for package ${pkg.id}`);
    return { ...pkg, customer };
  }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  
  return data;
};

export const addPackage = async (
  newPackageData: Omit<Package, 'id' | 'orderDate' | 'status' | 'customerId'>,
  newCustomerData: Omit<Customer, 'id'>
): Promise<void> => {
  await simulateDelay(500);
  
  // For simplicity, we create a new customer every time. A real app might find or create.
  const newCustomer: Customer = {
    id: `cust_${Date.now()}`,
    ...newCustomerData,
  };
  mockCustomers.push(newCustomer);
  
  const newPackage: Package = {
    id: `pkg_${Date.now()}`,
    customerId: newCustomer.id,
    ...newPackageData,
    status: PackageStatus.RECEIVED,
    orderDate: new Date().toISOString(),
  };
  mockPackages.push(newPackage);
};

export const updatePackage = async (packageId: string, updates: PackageUpdateData): Promise<void> => {
  await simulateDelay(300);
  const packageIndex = mockPackages.findIndex(p => p.id === packageId);
  if (packageIndex === -1) {
    throw new Error('Package not found');
  }
  
  const customerId = mockPackages[packageIndex].customerId;
  const customerIndex = mockCustomers.findIndex(c => c.id === customerId);
  if (customerIndex === -1) {
    throw new Error('Customer not found for package');
  }

  // Update package details
  mockPackages[packageIndex] = {
    ...mockPackages[packageIndex],
    productName: updates.productName,
    trackingNumber: updates.trackingNumber,
    status: updates.status,
  };

  // Update customer details
  mockCustomers[customerIndex] = {
    ...mockCustomers[customerIndex],
    name: updates.customerName,
    phone: updates.customerPhone,
  };
};