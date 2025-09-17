import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import PageLoader from '../components/ui/PageLoader';
import { ArrowLeft, CreditCard, Home, Loader2, Lock, Truck, Landmark, Wallet } from 'lucide-react';
import { EGYPTIAN_GOVERNORATES } from '../utils/governorates.ts';

const PaymentOption: React.FC<{ value: string; selected: string; onChange: (val: string) => void; title: string; icon: React.ReactNode }> = ({ value, selected, onChange, title, icon }) => (
    <label htmlFor={value} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selected === value ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
        <input type="radio" id={value} name="paymentMethod" value={value} checked={selected === value} onChange={() => onChange(value)} className="hidden" />
        <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 ${selected === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {icon}
        </div>
        <span className="font-bold text-gray-800">{title}</span>
    </label>
);

const CreditCardForm: React.FC = () => (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mt-4 animate-fadeIn space-y-4">
        <p className="text-sm text-gray-500 text-center">سيتم عرض نموذج إدخال بيانات البطاقة هنا (لأغراض العرض فقط).</p>
        <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">رقم البطاقة</label>
            <input type="text" placeholder="•••• •••• •••• ••••" className="w-full p-2 border rounded-md bg-white disabled:bg-gray-200" disabled />
        </div>
         <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">تاريخ الانتهاء</label>
                <input type="text" placeholder="MM / YY" className="w-full p-2 border rounded-md bg-white disabled:bg-gray-200" disabled />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">CVV</label>
                <input type="text" placeholder="•••" className="w-full p-2 border rounded-md bg-white disabled:bg-gray-200" disabled />
            </div>
        </div>
    </div>
);

const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const item = location.state?.item as { id: string, type: 'order' | 'booking' | 'subscription', total: string | number | null, summary: string | null } | null;
    const shippingCost = location.state?.shippingCost as number ?? 0;

    const [shippingInfo, setShippingInfo] = useState({ address: '', governorate: 'القاهرة', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState('');
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

    const handleProceedToPayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        addToast('جاري توجيهك إلى بوابة الدفع...', 'info');

        setTimeout(() => {
            const isPaymentSuccessful = Math.random() > 0.1;

            navigate('/payment/status', {
                replace: true,
                state: {
                    status: isPaymentSuccessful ? 'success' : 'failure',
                    item: item,
                    shippingDetails: item?.type === 'order' ? shippingInfo : null
                }
            });
        }, 2000);
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
                <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border space-y-8">
                        <h1 className="text-3xl font-extrabold text-gray-800">إتمام الطلب</h1>
                        {needsShipping && (
                             <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Truck/> 1. معلومات الشحن</h2>
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
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><CreditCard/> 2. طريقة الدفع</h2>
                             <div className="space-y-4">
                                <PaymentOption value="card" selected={paymentMethod} onChange={setPaymentMethod} title="البطاقة الائتمانية" icon={<CreditCard />} />
                                {paymentMethod === 'card' && <CreditCardForm />}
                                <PaymentOption value="instapay" selected={paymentMethod} onChange={setPaymentMethod} title="Instapay" icon={<Landmark />} />
                                <PaymentOption value="wallet" selected={paymentMethod} onChange={setPaymentMethod} title="المحافظ الإلكترونية (فودافون كاش، إلخ)" icon={<Wallet />} />
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
                                disabled={isSubmitting || !paymentMethod || (needsShipping && (!shippingInfo.address || !shippingInfo.governorate || !shippingInfo.phone))}
                                className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin"/> : <Lock />}
                                <span>{isSubmitting ? 'جاري التوجيه...' : 'الانتقال للدفع الآمن'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CheckoutPage;