export enum PackageStatus {
  RECEIVED = 'התקבלה',
  PACKING = 'נארזת',
  SHIPPED = 'נשלחה',
  IN_TRANSIT = 'בדרך',
  DELIVERED = 'נמסרה',
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface Package {
  id: string;
  customerId: string;
  productName: string;
  trackingNumber: string;
  status: PackageStatus;
  orderDate: string;
}

export interface PackageWithCustomer extends Package {
  customer: Customer;
}

export interface PackageUpdateData {
  customerName: string;
  customerPhone: string;
  productName: string;
  trackingNumber: string;
  status: PackageStatus;
}