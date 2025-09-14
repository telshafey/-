import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useAdmin, PersonalizedProduct } from '../contexts/AdminContext.tsx';
import { useProduct } from '../contexts/ProductContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import PageLoader from '../components/ui/PageLoader';
import InteractivePreview from '../components/order/InteractivePreview';
import { User, Heart, Image, Edit, Plus, Send, Loader2, AlertCircle } from 'lucide-react';

// Form Components
const FileUpload: React.FC<{ id: string; label: string; onFileChange: (id: string, file: File | null) => void; file: File | null }> = ({ id, label, onFileChange, file }) => {
    const [preview, setPreview] = useState<string | null>(null);
    useEffect(() => {
        if (!file) { setPreview(null); return; }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <div className="mt-1 flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-lg" /> : <Image className="text-gray-400" />}
                </div>
                <label htmlFor={id} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    <span>{file ? 'تغيير الصورة' : 'رفع صورة'}</span>
                    <input id={id} name={id} type="file" className="sr-only" onChange={(e) => onFileChange(id, e.target.files ? e.target.files[0] : null)} accept="image/*" />
                </label>
            </div>
        </div>
    );
};


const OrderPage: React.FC = () => {
    const { productKey } = ReactRouterDOM.useParams<{ productKey: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { addToast } = useToast();
    const { currentUser, childProfiles } = useAuth();
    const { personalizedProducts, loading: adminLoading, createOrder } = useAdmin();
    const { prices, loading: pricesLoading } = useProduct();

    const [product, setProduct] = useState<PersonalizedProduct | null>(null);
    const [formData, setFormData] = useState({
        childName: '',
        childAge: '',
        childGender: 'ذكر',
        familyNames: '',
        childTraits: '',
        storyValue: 'respect',
        customGoal: '',
        deliveryType: 'printed', // for custom_story
    });
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        image1: null, image2: null, image3: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!adminLoading) {
            const currentProduct = personalizedProducts.find(p => p.key === productKey);
            if (currentProduct) {
                setProduct(currentProduct);
            } else {
                addToast('المنتج المطلوب غير متوفر.', 'error');
                navigate('/store');
            }
        }
    }, [productKey, personalizedProducts, adminLoading, navigate, addToast]);
    
    const handleChildProfileSelect = (childId: string) => {
        const child = childProfiles.find(c => c.id.toString() === childId);
        if (child) {
            setFormData(prev => ({ ...prev, childName: child.name, childAge: child.age.toString(), childGender: child.gender }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (id: string, file: File | null) => {
        setFiles({ ...files, [id]: file });
    };

    const { totalPrice, itemSummary } = useMemo(() => {
        if (!product || !prices) return { totalPrice: 0, itemSummary: '' };
        let total = 0;
        let summary = product.title;

        if (product.key === 'custom_story') {
            total = formData.deliveryType === 'printed' ? prices.story.printed : prices.story.electronic;
            summary = `القصة المخصصة (${formData.deliveryType === 'printed' ? 'مطبوعة' : 'إلكترونية'})`;
        } else if (product.key === 'coloring_book') {
            total = prices.coloringBook;
        } else if (product.key === 'dua_booklet') {
            total = prices.duaBooklet;
        } else if (product.key === 'gift_box') {
            total = prices.giftBox;
        }
        return { totalPrice: total, itemSummary: summary };
    }, [product, prices, formData.deliveryType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSubmitting(true);
        try {
            await createOrder({ currentUser, formData, files, totalPrice, itemSummary });
            addToast('تم استلام طلبك بنجاح! سيتم توجيهك لصفحة حسابك لإتمام الدفع.', 'success');
            navigate('/account');
        } catch (error: any) {
            addToast(`حدث خطأ: ${error.message}`, 'error');
            setIsSubmitting(false);
        }
    };

    if (adminLoading || pricesLoading || !product || !prices) {
        return <PageLoader text="جاري تجهيز صفحة الطلب..." />;
    }

    const showFullCustomization = product.key === 'custom_story' || product.key === 'gift_box';

    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-blue-600">اطلب منتجك المخصص</h1>
                    <p className="mt-2 text-lg text-gray-600">املأ البيانات التالية لنصنع تحفة فنية خاصة لطفلك.</p>
                </div>

                 {!currentUser && <p>Please login</p>}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg space-y-8">
                            {/* Child Profiles */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="font-bold mb-2">لديك ملف محفوظ؟ اختر طفلاً لتعبئة بياناته تلقائياً.</h3>
                                <select onChange={e => handleChildProfileSelect(e.target.value)} className="w-full max-w-sm p-2 border rounded-lg bg-white">
                                    <option value="">-- اختر من ملفات أطفالك --</option>
                                    {childProfiles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Basic Info */}
                            <section>
                                <h2 className="text-xl font-bold mb-4">1. بيانات الطفل الأساسية</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">اسم الطفل*</label>
                                        <input type="text" name="childName" value={formData.childName} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">العمر*</label>
                                        <input type="number" name="childAge" value={formData.childAge} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">الجنس*</label>
                                        <select name="childGender" value={formData.childGender} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                                            <option>ذكر</option>
                                            <option>أنثى</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                             {/* Image Uploads */}
                            <section>
                                <h2 className="text-xl font-bold mb-4">2. صور الطفل</h2>
                                <p className="text-sm text-gray-600 mb-4">ارفع 3 صور واضحة للطفل (وجه كامل، جانب، وجسم كامل) لنستخدمها في الرسومات. </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <FileUpload id="image1" label="صورة 1 (الوجه)" file={files.image1} onFileChange={handleFileChange} />
                                    <FileUpload id="image2" label="صورة 2 (جانبية)" file={files.image2} onFileChange={handleFileChange} />
                                    <FileUpload id="image3" label="صورة 3 (كاملة)" file={files.image3} onFileChange={handleFileChange} />
                                </div>
                            </section>
                            
                             {/* Customization Details */}
                            {showFullCustomization && (
                                <section>
                                    <h2 className="text-xl font-bold mb-4">3. تفاصيل التخصيص</h2>
                                     <div>
                                        <label className="block text-sm font-bold mb-2">صفات الطفل وهواياته</label>
                                        <textarea name="childTraits" value={formData.childTraits} onChange={handleChange} rows={3} className="w-full p-2 border rounded-lg" placeholder="مثال: يحب الرسم والقطط، شجاع، لون عينيه بني..."></textarea>
                                    </div>
                                </section>
                            )}
                            
                            {/* Delivery Options */}
                             {product.key === 'custom_story' && (
                                <section>
                                     <h2 className="text-xl font-bold mb-4">4. خيارات الاستلام</h2>
                                     <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                                        <option value="printed">نسخة مطبوعة + إلكترونية ({prices.story.printed} ج.م)</option>
                                        <option value="electronic">نسخة إلكترونية فقط ({prices.story.electronic} ج.م)</option>
                                     </select>
                                </section>
                            )}
                        </div>
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <InteractivePreview formData={formData} product={product} />
                                <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg font-semibold text-gray-700">الإجمالي</p>
                                        <p className="text-3xl font-extrabold text-blue-600">{totalPrice} ج.م</p>
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-full hover:bg-green-700 disabled:bg-gray-400">
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                                        <span>{isSubmitting ? 'جاري إرسال الطلب...' : 'إرسال الطلب'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderPage;
