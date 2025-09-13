import React, { useState, useEffect, useCallback } from 'react';
import type { PackageWithCustomer, PackageStatus, PackageUpdateData } from '../types.ts';
import { PACKAGE_STATUSES } from '../constants.ts';
import { generateNotificationMessage } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';
import { CopyIcon } from './icons/CopyIcon.tsx';
import { CheckIcon } from './icons/CheckIcon.tsx';

interface UpdateStatusModalProps {
  pkg: PackageWithCustomer;
  onClose: () => void;
  onUpdatePackage: (packageId: string, updates: PackageUpdateData) => Promise<void>;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ pkg, onClose, onUpdatePackage }) => {
  // Form state
  const [customerName, setCustomerName] = useState(pkg.customer.name);
  const [customerPhone, setCustomerPhone] = useState(pkg.customer.phone);
  const [productName, setProductName] = useState(pkg.productName);
  const [trackingNumber, setTrackingNumber] = useState(pkg.trackingNumber);
  const [status, setStatus] = useState<PackageStatus>(pkg.status);
  
  // Message generation state
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
    // The modal will be closed by the parent component, so we don't need to call onClose here.
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

export default UpdateStatusModal;