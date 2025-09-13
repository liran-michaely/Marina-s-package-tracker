import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// BUNDLED CODE:
// The following code is a bundle of all the application's TypeScript and React components
// into a single file. This is a workaround for deployment environments like GitHub Pages
// that do not support serving .ts/.tsx files with the correct MIME type and where a
// build step (bundler) is not available.

// ===== From: types.ts =====
enum PackageStatus {
  RECEIVED = 'התקבלה',
  PACKING = 'נארזת',
  SHIPPED = 'נשלחה',
  IN_TRANSIT = 'בדרך',
  DELIVERED = 'נמסרה',
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Package {
  id: string;
  customerId: string;
  productName: string;
  trackingNumber: string;
  status: PackageStatus;
  orderDate: string;
}

interface PackageWithCustomer extends Package {
  customer: Customer;
}

interface PackageUpdateData {
  customerName: string;
  customerPhone: string;
  productName: string;
  trackingNumber: string;
  status: PackageStatus;
}


// ===== From: constants.ts =====
const PACKAGE_STATUSES: PackageStatus[] = [
  PackageStatus.RECEIVED,
  PackageStatus.PACKING,
  PackageStatus.SHIPPED,
  PackageStatus.IN_TRANSIT,
  PackageStatus.DELIVERED,
];

const STATUS_STYLES: Record<PackageStatus, { text: string; bg: string; dot: string; }> = {
  [PackageStatus.RECEIVED]: { text: 'text-blue-800', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  [PackageStatus.PACKING]: { text: 'text-yellow-800', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  [PackageStatus.SHIPPED]: { text: 'text-purple-800', bg: 'bg-purple-100', dot: 'bg-purple-500' },
  [PackageStatus.IN_TRANSIT]: { text: 'text-cyan-800', bg: 'bg-cyan-100', dot: 'bg-cyan-500' },
  [PackageStatus.DELIVERED]: { text: 'text-green-800', bg: 'bg-green-100', dot: 'bg-green-500' },
};


// ===== From: components/icons/PlusIcon.tsx =====
const PlusIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);


// ===== From: components/icons/CopyIcon.tsx =====
const CopyIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-slate-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);


// ===== From: components/icons/CheckIcon.tsx =====
const CheckIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);


// ===== From: components/Spinner.tsx =====
const Spinner: React.FC = () => {
  return (
    <div
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-sky-500 motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        טוען...
      </span>
    </div>
  );
};


// ===== From: services/geminiService.ts =====
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface NotificationDetails {
  customerName: string;
  productName: string;
  status: string;
  trackingNumber?: string;
}

const generateNotificationMessage = async ({
  customerName,
  productName,
  status,
  trackingNumber,
}: NotificationDetails): Promise<string> => {
  const model = 'gemini-2.5-flash';

  const prompt = `את מרינה, בעלת עסק ששולחת מוצרים ללקוחות.
המשימה שלך היא לכתוב הודעת עדכון קצרה, ידידותית וחיובית ללקוח/ה.
ההודעה צריכה להיות בעברית.

פרטי ההזמנה:
- שם הלקוח/ה: ${customerName}
- שם המוצר: ${productName}
- סטטוס חדש: ${status}
- מספר מעקב (אם קיים): ${trackingNumber || 'אין עדיין'}

נא לנסח הודעה קצרה (2-3 משפטים) שתכלול את הפרטים האלה. התחילי בפנייה אישית ללקוח/ה.
לדוגמה, אם הסטטוס הוא 'נשלחה', תוכלי לכלול את מספר המעקב ולציין שהחבילה בדרך.
אם הסטטוס הוא 'נמסרה', ודאי שהלקוח/ה קיבל/ה את החבילה ותאחלי שיהנו מהמוצר.
הקפידי על טון חם ואישי.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    return `היי ${customerName}, עדכון לגבי ההזמנה שלך (${productName}). הסטטוס שונה ל: ${status}.`;
  }
};


// ===== From: services/supabaseService.ts =====
let mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'ישראל ישראלי', phone: '050-1234567' },
  { id: 'cust_2', name: 'משה כהן', phone: '052-7654321' },
];

let mockPackages: Package[] = [
  { id: 'pkg_1', customerId: 'cust_1', productName: 'עגילים מעוצבים', trackingNumber: 'RR123456789IL', status: PackageStatus.SHIPPED, orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'pkg_2', customerId: 'cust_2', productName: 'שרשרת זהב', trackingNumber: '', status: PackageStatus.PACKING, orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'pkg_3', customerId: 'cust_1', productName: 'צמיד כסף', trackingNumber: 'RR987654321IL', status: PackageStatus.DELIVERED, orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const fetchPackagesWithCustomers = async (): Promise<PackageWithCustomer[]> => {
  await simulateDelay(500);
  const data = mockPackages.map(pkg => {
    const customer = mockCustomers.find(c => c.id === pkg.customerId);
    if (!customer) throw new Error(`Customer not found for package ${pkg.id}`);
    return { ...pkg, customer };
  }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  
  return data;
};

const addPackage = async (
  newPackageData: Omit<Package, 'id' | 'orderDate' | 'status' | 'customerId'>,
  newCustomerData: Omit<Customer, 'id'>
): Promise<void> => {
  await simulateDelay(500);
  
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

const updatePackage = async (packageId: string, updates: PackageUpdateData): Promise<void> => {
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

  mockPackages[packageIndex] = {
    ...mockPackages[packageIndex],
    productName: updates.productName,
    trackingNumber: updates.trackingNumber,
    status: updates.status,
  };

  mockCustomers[customerIndex] = {
    ...mockCustomers[customerIndex],
    name: updates.customerName,
    phone: updates.customerPhone,
  };
};


// ===== From: components/Header.tsx =====
const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-sky-600">
          Marina's Package Tracker
        </div>
        <div className="text-slate-600">
          ניהול קל וחכם למשלוחים שלך
        </div>
      </div>
    </header>
  );
};


// ===== From: components/PackageListItem.tsx =====
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


// ===== From: components/PackageList.tsx =====
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


// ===== From: components/AddPackageModal.tsx =====
interface AddPackageModalProps {
  onClose: () => void;
  onAddPackage: (newPackageData: Omit<Package, 'id' | 'orderDate' | 'status' | 'customerId'>, newCustomerData: Omit<Customer, 'id'>) => Promise<void>;
}

const AddPackageModal: React.FC<AddPackageModalProps> = ({ onClose, onAddPackage }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onAddPackage(
      { productName, trackingNumber },
      { name: customerName, phone: customerPhone }
    );
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">הוספת חבילה חדשה</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-slate-700 mb-1">שם הלקוח/ה</label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
            <input
              type="tel"
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-slate-700 mb-1">שם המוצר</label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label htmlFor="trackingNumber" className="block text-sm font-medium text-slate-700 mb-1">מספר מעקב (אופציונלי)</label>
            <input
              type="text"
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">ביטול</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 disabled:bg-sky-300"
            >
              {isSubmitting ? 'מוסיף...' : 'הוסף חבילה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ===== From: components/UpdateStatusModal.tsx =====
interface UpdateStatusModalProps {
  pkg: PackageWithCustomer;
  onClose: () => void;
  onUpdatePackage: (packageId: string, updates: PackageUpdateData) => Promise<void>;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ pkg, onClose, onUpdatePackage }) => {
  const [customerName, setCustomerName] = useState(pkg.customer.name);
  const [customerPhone, setCustomerPhone] = useState(pkg.customer.phone);
  const [productName, setProductName] = useState(pkg.productName);
  const [trackingNumber, setTrackingNumber] = useState(pkg.trackingNumber);
  const [status, setStatus] = useState<PackageStatus>(pkg.status);
  
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    const isChanged = customerName !== pkg.customer.name ||
                      customerPhone !== pkg.customer.phone ||
                      productName !== pkg.productName ||
                      trackingNumber !== pkg.trackingNumber ||
                      status !== pkg.status;
    setHasChanged(isChanged);
  }, [customerName, customerPhone, productName, trackingNumber, status, pkg]);

  const handleGenerateMessage = useCallback(async () => {
    if (status !== pkg.status) {
      setIsGenerating(true);
      setGeneratedMessage('');
      try {
        const message = await generateNotificationMessage({
          customerName: customerName,
          productName: productName,
          status: status,
          trackingNumber: trackingNumber,
        });
        setGeneratedMessage(message);
      } catch (error) {
        console.error("Failed to generate message", error);
        setGeneratedMessage("שגיאה ביצירת ההודעה. ניתן לעדכן את הסטטוס ידנית.");
      } finally {
        setIsGenerating(false);
      }
    } else {
      setGeneratedMessage('');
    }
  }, [status, pkg.status, customerName, productName, trackingNumber]);
  
  useEffect(() => {
    handleGenerateMessage();
  }, [status, handleGenerateMessage]);


  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!hasChanged) return;
    setIsSubmitting(true);
    await onUpdatePackage(pkg.id, {
        customerName,
        customerPhone,
        productName,
        trackingNumber,
        status,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">עריכת פרטי חבילה</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-slate-700 mb-1">שם הלקוח/ה</label>
              <input type="text" id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
              <input type="tel" id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-slate-700 mb-1">שם המוצר</label>
              <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>
             <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-slate-700 mb-1">מספר מעקב</label>
                <input type="text" id="trackingNumber" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">סטטוס</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as PackageStatus)} className="w-full px-3 py-2 border bg-white text-slate-900 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                {PACKAGE_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
                </select>
            </div>

            {(isGenerating || generatedMessage) && (
            <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-2">הודעה מוצעת ללקוח/ה (ניתן לערוך):</h3>
                {isGenerating ? (
                    <div className="flex items-center gap-2 text-slate-500">
                        <Spinner />
                        <span>מייצר הודעה...</span>
                    </div>
                ) : (
                    <div className="relative">
                        <textarea
                            value={generatedMessage}
                            onChange={(e) => setGeneratedMessage(e.target.value)}
                            className="w-full h-32 p-2 bg-white border border-slate-300 rounded-md resize-none"
                            rows={4}
                        />
                        <button type="button" onClick={handleCopyToClipboard} className="absolute top-2 left-2 p-1.5 bg-slate-100 rounded-md hover:bg-slate-200">
                            {copySuccess ? <CheckIcon /> : <CopyIcon />}
                        </button>
                    </div>
                )}
            </div>
            )}
        </form>
        
        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">
            ביטול
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !hasChanged}
            className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 disabled:bg-sky-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>
    </div>
  );
};


// ===== From: App.tsx =====
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
      await addPackage(newPackageData, newCustomerData);
      handleCloseAddModal();
      await loadPackages();
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
      await updatePackage(packageId, updates);
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


// ===== From: index.tsx (original) =====
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
