import React, { useState, useEffect, useRef } from 'react';
import { X, User, Gift, Truck, Image, MessageSquare, Receipt, Save, Loader2 } from 'lucide-react';
import { useAdmin, IOrderDetails } from '../../contexts/AdminContext';
// FIX: Added .ts extension to resolve module error.
import { OrderDetailsJson } from '../../lib/database.types.ts';


interface ViewOrderModalProps {
  order: IOrderDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailSection: React.FC<{title: string; icon: React.ReactNode; children: React.ReactNode}> = ({ title, icon, children }) => (
    <div>
        <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2 border-b pb-2">
            {icon} {title}
        </h3>
        <div className="space-y-3 text-sm">{children}</div>
    </div>
);

const DetailItem: React.FC<{label: string; value: string | undefined | null}> = ({ label, value }) => (
    value ? (
        <div>
            <p className="font-semibold text-gray-500">{label}</p>
            <p className="text-gray-800">{value}</p>
        </div>
    ) : null
);

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({ order, isOpen, onClose }) => {
  const { updateOrderComment } = useAdmin();
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (order?.admin_comment) {
      setComment(order.admin_comment);
    } else {
      setComment('');
    }
  }, [order]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus trapping
    const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    closeButtonRef.current?.focus();

    const handleTabKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
            if (event.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    };
    
    const currentModalRef = modalRef.current;
    currentModalRef?.addEventListener('keydown', handleTabKeyPress);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
        currentModalRef?.removeEventListener('keydown', handleTabKeyPress);
    };
  }, [isOpen, onClose]);


  if (!isOpen || !order) return null;
  
  // FIX: Cast to 'unknown' first to satisfy TypeScript's strict type checking when converting from a broad 'Json' type to a specific interface.
  const typedDetails = order.details as unknown as OrderDetailsJson | null;

  const handleSaveComment = async () => {
    setIsSaving(true);
    await updateOrderComment(order.id, comment);
    setIsSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-12" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 m-4 animate-fadeIn max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 id="order-modal-title" className="text-2xl font-bold text-gray-800">تفاصيل الطلب: <span className="font-mono text-xl">{order.id}</span></h2>
            <p className="text-sm text-gray-500">للعميل: {order.customer_name}</p>
          </div>
          <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
            {typedDetails ? (
                <>
                    <DetailSection title="بيانات الطفل" icon={<User size={18}/>}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <DetailItem label="الاسم" value={typedDetails.childName} />
                            <DetailItem label="العمر" value={typedDetails.childAge?.toString()} />
                            <DetailItem label="الجنس" value={typedDetails.childGender} />
                        </div>
                        <DetailItem label="أسماء العائلة والأصدقاء" value={typedDetails.familyNames} />
                        <DetailItem label="صفات الطفل وهواياته" value={typedDetails.childTraits} />
                    </DetailSection>

                    <DetailSection title="المنتجات المطلوبة" icon={<Gift size={18}/>}>
                         <DetailItem label="المنتجات" value={typedDetails.products} />
                    </DetailSection>

                     <DetailSection title="الشحن والتوصيل" icon={<Truck size={18}/>}>
                         <DetailItem label="عنوان الشحن" value={typedDetails.shipping} />
                    </DetailSection>

                    <DetailSection title="الصور المرفقة" icon={<Image size={18}/>}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(typedDetails.images || {}).map(([key, url]) => (
                                url ? (
                                    <div key={key}>
                                        <a href={url as string} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden hover:ring-2 ring-blue-500">
                                            <img src={url as string} alt={key} className="w-full h-auto aspect-square object-cover" />
                                        </a>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </DetailSection>
                </>
            ) : <p className="text-center text-gray-500">لا توجد تفاصيل إضافية لهذا الطلب.</p>}

            {order.receipt_url && (
                <DetailSection title="مراجعة الدفع" icon={<Receipt size={18} />}>
                    <a href={order.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-100 text-blue-800 font-bold py-2 px-4 rounded-lg hover:bg-blue-200">
                        عرض إيصال الدفع
                    </a>
                </DetailSection>
            )}

            <DetailSection title="تعليقات الإدارة" icon={<MessageSquare size={18} />}>
                <p className="text-xs text-gray-500">سيظهر هذا التعليق للعميل في صفحة "طلباتي".</p>
                <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="اكتب ملاحظاتك هنا..."
                />
                 <button 
                    onClick={handleSaveComment} 
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-gray-700 transition-colors disabled:bg-gray-400">
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعليق'}</span>
                </button>
            </DetailSection>

        </div>
        
        <div className="flex justify-end gap-4 pt-6 mt-8 border-t">
            <button type="button" onClick={onClose} className="px-8 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors">إغلاق</button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;