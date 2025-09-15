import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useAdmin } from '../contexts/AdminContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useNavigate } from 'react-router-dom';
import { Star, Gift, CheckCircle, Package, Loader2 } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext.tsx';
import PageLoader from '../components/ui/PageLoader.tsx';
import ShareButtons from '../components/shared/ShareButtons.tsx';

const SubscriptionPage: React.FC = () => {
    const { isLoggedIn, currentUser, childProfiles } = useAuth();
    const { createSubscription } = useAdmin();
    const { prices, loading: pricesLoading } = useProduct();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [selectedChild, setSelectedChild] = useState<string>('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const pageUrl = window.location.href;

    const handleSubscribe = async () => {
        if (!isLoggedIn || !currentUser) {
            addToast('يرجى تسجيل الدخول أولاً للاشتراك.', 'warning');
            navigate('/account');
            return;
        }
        if (!selectedChild) {
            addToast('يرجى اختيار الطفل الذي سيحصل على الاشتراك.', 'warning');
            return;
        }

        setIsSubscribing(true);
        try {
            const annualPrice = prices!.subscriptionBox * 12;
            const newSubscription = await createSubscription(currentUser.id, currentUser.name, selectedChild, annualPrice);
            
            addToast('تم إنشاء طلب الاشتراك! سيتم توجيهك الآن لإتمام عملية الدفع.', 'success');

            navigate('/checkout', {
                state: {
                    item: {
                        id: newSubscription.id,
                        type: 'subscription',
                        total: newSubscription.price,
                        summary: `اشتراك سنوي لصندوق الرحلة (${selectedChild})`
                    }
                }
            });
        } catch (error: any) {
            addToast(`حدث خطأ: ${error.message}`, 'error');
        } finally {
            setIsSubscribing(false);
        }
    };

    if (pricesLoading || !prices) {
        return <PageLoader text="جاري تحميل تفاصيل الاشتراك..." />;
    }

    return (
        <div className="bg-white py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-500">صندوق الرحلة الشهري</h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                            رحلة متجددة من الإبداع والمرح تصل إلى باب منزلكم كل شهر!
                        </p>
                        <div className="mt-6 flex justify-center">
                            <ShareButtons 
                              title='اكتشف صندوق الرحلة الشهري - مغامرة إبداعية متجددة لطفلك!' 
                              url={pageUrl}
                              label="شارك الاشتراك:"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                             <img src="https://i.ibb.co/dK5zZ7s/product-gift-box.png" alt="صندوق الرحلة الشهري" className="rounded-2xl shadow-xl w-full" />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-800">ماذا يوجد في الصندوق؟</h2>
                            <p className="text-gray-600">
                                كل شهر، يقوم فريقنا من الخبراء التربويين والكتاب المبدعين بتصميم صندوق فريد يحتوي على منتجات وأنشطة جديدة ومختلفة، مصممة خصيصًا لتناسب عمر طفلك وتنمي مهاراته.
                            </p>
                             <ul className="space-y-3">
                                <li className="flex items-start"><CheckCircle className="w-6 h-6 text-green-500 me-3 mt-1 flex-shrink-0"/><span><span className="font-bold">قصة جديدة:</span> قصة قصيرة مطبوعة بجودة عالية لغرس قيمة أو مهارة جديدة.</span></li>
                                <li className="flex items-start"><CheckCircle className="w-6 h-6 text-green-500 me-3 mt-1 flex-shrink-0"/><span><span className="font-bold">نشاط إبداعي:</span> نشاط عملي أو فني مرتبط بموضوع القصة (مثل أدوات صنع مجسم، بطاقات لعب، إلخ).</span></li>
                                <li className="flex items-start"><CheckCircle className="w-6 h-6 text-green-500 me-3 mt-1 flex-shrink-0"/><span><span className="font-bold">هدية مفاجأة:</span> هدية صغيرة ومميزة لإسعاد طفلك.</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-20 bg-gray-50 p-8 sm:p-12 rounded-2xl shadow-inner border text-center">
                        <h2 className="text-3xl font-bold text-gray-800">اشترك الآن وابدأ الرحلة!</h2>
                        <p className="mt-4 text-5xl font-extrabold text-orange-500">
                           {prices.subscriptionBox * 12} ج.م <span className="text-2xl text-gray-500 font-medium">/ سنوياً</span>
                        </p>
                        <p className="mt-1 text-gray-500">(بواقع {prices.subscriptionBox} ج.م شهرياً)</p>
                        <p className="mt-2 text-gray-500">(شامل الشحن داخل القاهرة فقط. تطبق رسوم شحن إضافية لباقي المحافظات)</p>


                        <div className="mt-8 max-w-md mx-auto">
                            {isLoggedIn ? (
                                childProfiles.length > 0 ? (
                                    <div className="space-y-4">
                                        <select
                                            value={selectedChild}
                                            onChange={(e) => setSelectedChild(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                                        >
                                            <option value="">-- اختر الطفل --</option>
                                            {childProfiles.map(child => (
                                                <option key={child.id} value={child.name}>{child.name}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={handleSubscribe} 
                                            disabled={isSubscribing || !selectedChild}
                                            className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400"
                                        >
                                           {isSubscribing ? <Loader2 className="animate-spin" /> : <Star />}
                                           <span>{isSubscribing ? 'جاري الاشتراك...' : `اشترك الآن لـ ${selectedChild || ''}`}</span>
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">يرجى <a href="#/account" className="text-blue-600 hover:underline">إضافة ملف طفل</a> أولاً في حسابك لتتمكن من الاشتراك.</p>
                                )
                            ) : (
                                <button 
                                    onClick={() => navigate('/account')}
                                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    سجل الدخول للاشتراك
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;