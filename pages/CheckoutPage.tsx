import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import PageLoader from '../components/ui/PageLoader';
import { ArrowLeft, CreditCard, Home, Loader2, Lock, Truck, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { EGYPTIAN_GOVERNORATES } from '../utils/governorates.ts';

const PAYMENT_LINK = 'https://ipn.eg/S/gm2000/instapay/0dqErO';

const FileUpload: React.FC<{ file: File | null; setFile: (file: File | null) => void; disabled?: boolean }> = ({ file, setFile, disabled }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) { setPreview(null); return; }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors ${!disabled && 'hover:border-blue-400'}`}>
            <div className="space-y-1 text-center">
                {preview ? (
                     <img src={preview} alt="Preview" className="h-24 w-auto mx-auto rounded-md object-cover" />
                ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="receipt-file-upload" className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500`}>
                        <span>{file ? 'تغيير الملف' : 'اختر ملفًا'}</span>
                        <input id="receipt-file-upload" name="receipt-file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} accept="image/*" required disabled={disabled} />
                    </label>
                    <p className="ps-1">{file ? file.name : 'أو اسحبه هنا'}</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
        </div>
    );
};

const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { updateReceipt } = useAdmin();
    
    const item = location.state?.item as { id: string, type: 'order' | 'booking' | 'subscription', total: string | number | null, summary: string | null } | null;
    const shippingCost = location.state?.shippingCost as number ?? 0;

    const [shippingInfo, setShippingInfo] = useState({ address: '', governorate: 'القاهرة', phone: '' });
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!item) {
            addToast('لا يوجد عنصر للدفع. تم توجيهك إلى حسابك.', 'error');
            navigate('/account');
        }
    }, [item, navigate, addToast]);

    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setShippingInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleConfirmPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiptFile) {
            addToast('يرجى رفع إيصال الدفع أولاً.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateReceipt({
                itemId: item!.id,
                itemType: item!.type,
                receiptFile,
                shippingDetails: item?.type === 'order' ? shippingInfo : null
            });
            addToast('تم رفع الإيصال بنجاح! طلبك قيد المراجعة الآن.', 'success');
            navigate('/account');
        } catch (error: any) {
            addToast(`حدث خطأ: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!item) {
        return <PageLoader text="جاري التوجيه..." />;
    }

    const needsShipping = item.type === 'order';
    
    const parseTotal = (total: string | number | null): number => {
        if (typeof total === 'number') return total;
        if (typeof total === 'string') return parseFloat(total.replace(/[^0-9.]/g, '')) || 0;
        return 0;
    };
    
    const totalAmount = parseTotal(item.total);
    const subtotal = totalAmount - shippingCost;

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <img src="https://i.ibb.co/C0bSJJT/favicon.png" alt="شعار الرحلة" className="h-12 w-auto"/>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                         <span>العودة</span> <ArrowLeft size={16} />
                    </button>
                </div>
            </header>
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <form onSubmit={handleConfirmPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border space-y-8">
                        {needsShipping && (
                             <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Truck/> معلومات الشحن</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">العنوان بالتفصيل*</label>
                                        <input type="text" name="address" value={shippingInfo.address} onChange={handleShippingChange} className="w-full p-2 border rounded-lg" required />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2">المحافظة*</label>
                                            <select name="governorate" value={shippingInfo.governorate} onChange={handleShippingChange} className="w-full p-2 border rounded-lg bg-white" required>
                                                {EGYPTIAN_GOVERNORATES.map(gov => (
                                                    <option key={gov} value={gov}>{gov}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">رقم الهاتف*</label>
                                            <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleShippingChange} className="w-full p-2 border rounded-lg" required />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                       
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><CreditCard/> إتمام الدفع</h2>
                             <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg space-y-4">
                                <p className="font-semibold text-gray-700">1. قم بالدفع عبر الرابط التالي:</p>
                                <a href={PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 transition-colors">
                                    <LinkIcon size={18} />
                                    <span>افتح رابط الدفع (Instapay)</span>
                                </a>
                                <div className="flex items-center gap-2 text-sm text-blue-700">
                                    <AlertCircle size={32}/>
                                    <span>يرجى ملاحظة أن هذا الرابط سينقلك إلى موقع خارجي لإتمام عملية الدفع.</span>
                                </div>
                                <p className="font-semibold text-gray-700 mt-6">2. ارفع صورة إيصال الدفع هنا:</p>
                                <FileUpload file={receiptFile} setFile={setReceiptFile} disabled={isSubmitting} />
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-lg border">
                            <h3 className="text-xl font-bold mb-4 pb-3 border-b">ملخص الطلب</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المنتج:</span>
                                    <span className="font-semibold text-right">{item.summary || `طلب رقم ${item.id}`}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-gray-600">المجموع الفرعي:</span>
                                    <span className="font-semibold">{subtotal.toFixed(2)} ج.م</span>
                                </div>
                                {needsShipping && (
                                     <div className="flex justify-between">
                                        <span className="text-gray-600">تكلفة الشحن:</span>
                                        <span className="font-semibold">{shippingCost.toFixed(2)} ج.م</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 pt-4 border-t">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>الإجمالي المطلوب:</span>
                                    <span>{totalAmount.toFixed(2)} ج.م</span>
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting || !receiptFile || (needsShipping && (!shippingInfo.address || !shippingInfo.governorate || !shippingInfo.phone))}
                                className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin"/> : <Lock />}
                                <span>{isSubmitting ? 'جاري التأكيد...' : 'تأكيد الطلب والدفع'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CheckoutPage;