import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PaymentStatusPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { confirmPayment } = useAdmin();

    const [processing, setProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { status, item, shippingDetails } = location.state || {};

    useEffect(() => {
        if (!status || !item) {
            navigate('/account');
            return;
        }

        const processPayment = async () => {
            if (status === 'success') {
                try {
                    await confirmPayment(item.id, item.type, shippingDetails);
                } catch (e: any) {
                    setError('حدث خطأ أثناء تأكيد طلبك في نظامنا. يرجى التواصل مع الدعم.');
                }
            }
            setProcessing(false);
            
            // Redirect after a delay
            setTimeout(() => {
                navigate('/account');
            }, 5000);
        };

        processPayment();
        
    }, [status, item, confirmPayment, navigate, shippingDetails]);

    if (processing) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
                <p className="mt-4 text-gray-600">جاري معالجة الدفع...</p>
            </div>
        );
    }

    if (error) {
         return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100 text-center p-4">
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-3xl font-bold text-gray-800">خطأ في تأكيد الدفع</h1>
                <p className="mt-2 text-gray-600 max-w-md">{error}</p>
                 <p className="mt-6 text-sm text-gray-500">سيتم توجيهك إلى صفحة حسابك الآن...</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100 text-center p-4">
            {status === 'success' ? (
                <>
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800">تم الدفع بنجاح!</h1>
                    <p className="mt-2 text-gray-600">شكراً لك. طلبك الآن قيد المراجعة من قبل فريقنا.</p>
                </>
            ) : (
                <>
                    <XCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800">فشلت عملية الدفع</h1>
                    <p className="mt-2 text-gray-600">يرجى المحاولة مرة أخرى من صفحة حسابك أو التواصل مع الدعم.</p>
                </>
            )}
             <p className="mt-6 text-sm text-gray-500">سيتم توجيهك إلى صفحة حسابك الآن...</p>
        </div>
    );
};

export default PaymentStatusPage;
