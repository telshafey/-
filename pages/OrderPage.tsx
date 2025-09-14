
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
// FIX: Imported the `Prices` type to resolve type errors.
import { useProduct, Prices } from '../contexts/ProductContext';
// FIX: Added .tsx extension to resolve module error.
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext';
import PageLoader from '../components/ui/PageLoader';
import { Loader2, Send, User, BookHeart, Camera, Sparkles, Package, Check, PlusCircle, Award, Target, Truck } from 'lucide-react';
import InteractivePreview from '../components/order/InteractivePreview';

const storyGoals = [
    { key: 'respect', title: 'الاستئذان والاحترام' },
    { key: 'cooperation', title: 'التعاون والمشاركة' },
    { key: 'honesty', title: 'الصدق والأمانة' },
    { key: 'cleanliness', title: 'النظافة والترتيب' },
    { key: 'time_management', title: 'تنظيم الوقت' },
    { key: 'emotion_management', title: 'إدارة العواطف' },
    { key: 'problem_solving', title: 'حل المشكلات' },
    { key: 'creative_thinking', title: 'التفكير الإبداعي' },
    { key: 'custom', title: 'هدف آخر (أحدده بنفسي)' },
];


const Section: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b-2 border-blue-100 pb-3">
            {icon} {title}
        </h2>
        <div className="space-y-6">{children}</div>
    </div>
);

const FileUpload: React.FC<{ name: string, label: string, file: File | null, onFileChange: (name: string, file: File | null) => void }> = ({ name, label, file, onFileChange }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
        setPreview(null);
    }, [file]);

    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors hover:border-blue-400`}>
                <div className="space-y-1 text-center">
                    {preview ? (
                         <img src={preview} alt="Preview" className="h-24 w-auto mx-auto rounded-md object-cover" />
                    ) : (
                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor={name} className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500`}>
                            <span>{file ? 'تغيير الصورة' : 'اختر صورة'}</span>
                            <input id={name} name={name} type="file" className="sr-only" onChange={(e) => onFileChange(name, e.target.files ? e.target.files[0] : null)} accept="image/*" />
                        </label>
                    </div>
                    <p className="text-xs text-gray-500">{file ? file.name : 'PNG, JPG'}</p>
                </div>
            </div>
        </div>
    );
};


const OrderPage: React.FC = () => {
    const { productKey } = ReactRouterDOM.useParams<{ productKey: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { addToast } = useToast();
    const { personalizedProducts, loading: productsLoading, createOrder } = useAdmin();
    const { prices, loading: pricesLoading } = useProduct();
    const { currentUser, isLoggedIn, childProfiles } = useAuth();

    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [formData, setFormData] = useState({
        childName: '',
        childAge: '',
        childGender: 'ذكر' as 'ذكر' | 'أنثى',
        childTraits: '',
        familyNames: '',
        storyValue: 'respect',
        customGoal: '',
    });
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        facePhoto: null,
        fullBodyPhoto: null,
        sidePhoto: null,
        extraPhoto: null,
    });
    const [orderOptions, setOrderOptions] = useState({
        format: 'printed',
        addons: [] as string[],
    });
     const [shippingDetails, setShippingDetails] = useState({
        address: '',
        isGift: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const product = useMemo(() => 
        personalizedProducts.find(p => p.key === productKey), 
    [personalizedProducts, productKey]);

    useEffect(() => {
        if (!productsLoading && !product) {
            addToast('المنتج المطلوب غير موجود.', 'error');
            navigate('/store');
        }
    }, [productsLoading, product, navigate, addToast]);
    
    useEffect(() => {
        if (selectedChildId) {
            const child = childProfiles.find(c => c.id.toString() === selectedChildId);
            if (child) {
                setFormData(prev => ({
                    ...prev,
                    childName: child.name,
                    childAge: child.age.toString(),
                    childGender: child.gender,
                }));
            }
        }
    }, [selectedChildId, childProfiles]);

    const addonsAvailable = useMemo(() => {
        return personalizedProducts.filter(p => ['coloring_book', 'dua_booklet'].includes(p.key));
    }, [personalizedProducts]);

    const totalPrice = useMemo(() => {
        if (!prices || !product) return 0;
        let total = 0;
        if (product.key === 'custom_story') {
            total = orderOptions.format === 'printed' ? prices.story.printed : prices.story.electronic;
        } else if (product.key === 'gift_box') {
            total = prices.giftBox;
        } else if (['coloring_book', 'dua_booklet'].includes(product.key)) {
            const key = product.key as keyof Omit<Prices, 'story' | 'valuesStory' | 'skillsStory'>;
            total = prices[key];
        }

        if(product.key === 'custom_story') {
            orderOptions.addons.forEach(addonKey => {
                 const key = addonKey as keyof Omit<Prices, 'story' | 'valuesStory' | 'skillsStory'>;
                if (key in prices) {
                    total += prices[key];
                }
            });
        }
        return total;
    }, [prices, product, orderOptions]);
    
    const showFullCustomization = product?.key === 'custom_story' || product?.key === 'gift_box';
    const showImageUpload = true; 
    const showOptions = product?.key === 'custom_story';
    const isCustomGoalSelected = showFullCustomization && formData.storyValue === 'custom';
    const isPhysicalOrder = !showOptions || (showOptions && orderOptions.format === 'printed');


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

     const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setShippingDetails(prev => ({ ...prev, [name]: checked }));
        } else {
            setShippingDetails(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFileChange = (name: string, file: File | null) => {
        setFiles(prev => ({ ...prev, [name]: file }));
    };

    const handleAddonChange = (addonKey: string) => {
        setOrderOptions(prev => {
            const newAddons = prev.addons.includes(addonKey)
                ? prev.addons.filter(a => a !== addonKey)
                : [...prev.addons, addonKey];
            return { ...prev, addons: newAddons };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn || !currentUser) {
            addToast('يجب تسجيل الدخول أولاً لإتمام الطلب.', 'error');
            navigate('/account');
            return;
        }
        if (!formData.childName || !formData.childAge) {
            addToast('يرجى ملء بيانات الطفل.', 'warning');
            return;
        }
        if (!files.facePhoto || !files.fullBodyPhoto) {
            addToast('يرجى رفع صورة الوجه والصورة الكاملة للطفل.', 'warning');
            return;
        }
        if (isPhysicalOrder && !shippingDetails.address.trim()) {
            addToast('يرجى إدخال عنوان الشحن للمنتجات المطبوعة.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const baseItem = product?.title || 'منتج';
            const formatText = showOptions ? (orderOptions.format === 'printed' ? ' (مطبوعة)' : ' (إلكترونية)') : '';
            const addonsText = showOptions ? orderOptions.addons.map(key => addonsAvailable.find(p => p.key === key)?.title).join('، ') : '';
            const itemSummary = `${baseItem}${formatText}${addonsText ? ` + ${addonsText}` : ''}`;

            const details: any = {
                productKey: product!.key,
                productTitle: product!.title,
                childName: formData.childName,
                childAge: parseInt(formData.childAge),
                childGender: formData.childGender,
                products: itemSummary,
                shippingAddress: shippingDetails.address,
                isGift: shippingDetails.isGift,
            };

            if (showFullCustomization) {
                details.childTraits = formData.childTraits;
                details.familyNames = formData.familyNames;
                details.storyValue = formData.storyValue === 'custom' ? formData.customGoal : storyGoals.find(v => v.key === formData.storyValue)?.title;
            }
            if (showOptions) {
                details.format = orderOptions.format;
                details.addons = orderOptions.addons;
            }
            
            await createOrder({
                currentUser,
                formData: details,
                files,
                totalPrice,
                itemSummary,
            });
            addToast('تم إنشاء طلبك بنجاح! سيتم توجيهك لصفحة حسابك لإتمام الدفع.', 'success');
            navigate('/account');
        } catch (error: any) {
            addToast(`حدث خطأ: ${error.message}`, 'error');
            setIsSubmitting(false);
        }
    };
    
    if (productsLoading || pricesLoading || !product || !prices) {
        return <PageLoader text="جاري تحميل صفحة الطلب..." />;
    }

    const OrderSummary = () => (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100 flex items-center gap-3">
                <Package className="text-blue-500" /> ملخص الطلب
            </h2>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">{product.title}{showOptions && ` (${orderOptions.format === 'printed' ? 'مطبوعة' : 'إلكترونية'})`}</span>
                    <span className="font-semibold">
                        {product.key === 'custom_story' ? (orderOptions.format === 'printed' ? prices.story.printed : prices.story.electronic) : (prices as any)[product.key as keyof Omit<Prices, 'story' | 'valuesStory' | 'skillsStory'>]} ج.م
                    </span>
                </div>
                {showOptions && orderOptions.addons.map(key => {
                     const addon = addonsAvailable.find(p => p.key === key);
                     return (
                         <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-500">إضافة: {addon?.title}</span>
                            <span className="font-semibold">{(prices as any)[key as keyof Omit<Prices, 'story' | 'valuesStory' | 'skillsStory'>]} ج.م</span>
                        </div>
                     )
                })}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-dashed">
                <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-800">الإجمالي</p>
                    <p className="text-3xl font-extrabold text-blue-600">{totalPrice} ج.م</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-blue-600">طلب {product.title}</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">{product.description}</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-8">
                            <Section title="الخطوة 1: اختيار ملف الطفل" icon={<User size={22} />}>
                                <div>
                                    <label htmlFor="child-select" className="block text-sm font-bold text-gray-700 mb-2">اختر طفلاً محفوظاً (اختياري)</label>
                                    <select 
                                        id="child-select"
                                        value={selectedChildId} 
                                        onChange={(e) => setSelectedChildId(e.target.value)} 
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-white" 
                                    >
                                        <option value="">-- اختر لملء البيانات تلقائياً --</option>
                                        {childProfiles.map(child => (
                                            <option key={child.id} value={child.id}>{child.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2">
                                        أو يمكنك <ReactRouterDOM.Link to="/account" target="_blank" className="text-blue-600 hover:underline">إضافة ملف طفل جديد</ReactRouterDOM.Link> من صفحة حسابك.
                                    </p>
                                </div>
                            </Section>

                             <Section title="الخطوة 2: بيانات بطل القصة" icon={<BookHeart size={22}/>}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="childName" className="block text-sm font-bold text-gray-700 mb-2">اسم الطفل*</label>
                                        <input type="text" name="childName" value={formData.childName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                    </div>
                                     <div>
                                        <label htmlFor="childAge" className="block text-sm font-bold text-gray-700 mb-2">عمر الطفل*</label>
                                        <input type="number" name="childAge" value={formData.childAge} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">جنس الطفل*</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center"><input type="radio" name="childGender" value="ذكر" checked={formData.childGender === 'ذكر'} onChange={handleChange} className="h-4 w-4 text-blue-600"/> <span className="ms-2">ذكر</span></label>
                                        <label className="flex items-center"><input type="radio" name="childGender" value="أنثى" checked={formData.childGender === 'أنثى'} onChange={handleChange} className="h-4 w-4 text-pink-600"/> <span className="ms-2">أنثى</span></label>
                                    </div>
                                </div>
                            </Section>
                             
                            {showFullCustomization && (
                                <Section title="الخطوة 3: تخصيص القصة" icon={<Sparkles size={22} />}>
                                    <div>
                                        <label htmlFor="childTraits" className="block text-sm font-bold text-gray-700 mb-2">صفات الطفل وهواياته</label>
                                        <textarea name="childTraits" value={formData.childTraits} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="مثال: يحب الديناصورات، ذكي، خجول قليلاً"></textarea>
                                    </div>
                                     <div>
                                        <label htmlFor="familyNames" className="block text-sm font-bold text-gray-700 mb-2">أسماء أفراد العائلة أو الأصدقاء (اختياري)</label>
                                        <input type="text" name="familyNames" value={formData.familyNames} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="مثال: أخوه علي، صديقته المقربة فاطمة"/>
                                    </div>
                                     <div>
                                        <label htmlFor="storyValue" className="block text-sm font-bold text-gray-700 mb-2">الهدف الأساسي للقصة*</label>
                                        <select name="storyValue" value={formData.storyValue} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg bg-white">
                                            {storyGoals.map(v => <option key={v.key} value={v.key}>{v.title}</option>)}
                                        </select>
                                    </div>
                                </Section>
                            )}
                            
                             {isCustomGoalSelected && (
                                <Section title="تحديد الهدف المخصص" icon={<Target size={22}/>}>
                                    <label htmlFor="customGoal" className="block text-sm font-bold text-gray-700 mb-2">حدد هدفك أو القيمة التي تريدها*</label>
                                    <input type="text" name="customGoal" value={formData.customGoal} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                                </Section>
                             )}

                            {showImageUpload && (
                                <Section title="الخطوة 4: رفع الصور" icon={<Camera size={22} />}>
                                    <p className="text-sm text-gray-600 -mt-4 mb-4">لأفضل نتيجة، يرجى رفع صور واضحة وعالية الجودة للطفل.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FileUpload name="facePhoto" label="صورة الوجه (واضحة للوجه من الأمام)*" file={files.facePhoto} onFileChange={handleFileChange} />
                                        <FileUpload name="fullBodyPhoto" label="صورة كاملة للطفل*" file={files.fullBodyPhoto} onFileChange={handleFileChange} />
                                        <FileUpload name="sidePhoto" label="صورة إضافية (من الجانب - اختياري)" file={files.sidePhoto} onFileChange={handleFileChange} />
                                        <FileUpload name="extraPhoto" label="صورة أخرى (اختياري)" file={files.extraPhoto} onFileChange={handleFileChange} />
                                    </div>
                                </Section>
                            )}
                             
                            {showOptions && (
                                 <Section title="الخطوة 5: خيارات إضافية" icon={<PlusCircle size={22} />}>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">اختر نسخة القصة*</label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <label className="flex items-center p-3 border rounded-lg flex-1"><input type="radio" name="format" value="printed" checked={orderOptions.format === 'printed'} onChange={e => setOrderOptions(p => ({...p, format: e.target.value}))} className="h-4 w-4"/> <span className="ms-2">مطبوعة (+ نسخة إلكترونية مجانية) - {prices.story.printed} ج.م</span></label>
                                            <label className="flex items-center p-3 border rounded-lg flex-1"><input type="radio" name="format" value="electronic" checked={orderOptions.format === 'electronic'} onChange={e => setOrderOptions(p => ({...p, format: e.target.value}))} className="h-4 w-4"/> <span className="ms-2">إلكترونية فقط - {prices.story.electronic} ج.م</span></label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">أضف لطلبك (اختياري)</label>
                                        <div className="space-y-2">
                                            {addonsAvailable.map(addon => (
                                                 <label key={addon.key} className="flex items-center"><input type="checkbox" checked={orderOptions.addons.includes(addon.key)} onChange={() => handleAddonChange(addon.key)} className="h-4 w-4 rounded"/> <span className="ms-2">{addon.title} - {(prices as any)[addon.key as keyof Omit<Prices, 'story' | 'valuesStory' | 'skillsStory'>]} ج.م</span></label>
                                            ))}
                                        </div>
                                    </div>
                                 </Section>
                            )}

                             {isPhysicalOrder && (
                                <Section title="الخطوة 6: الشحن والتوصيل" icon={<Truck size={22}/>}>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2">عنوان الشحن*</label>
                                        <textarea name="address" id="address" value={shippingDetails.address} onChange={handleShippingChange} rows={3} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="اكتب العنوان بالتفصيل..."></textarea>
                                    </div>
                                    <div>
                                        <label className="flex items-center">
                                            <input type="checkbox" name="isGift" checked={shippingDetails.isGift} onChange={handleShippingChange} className="h-4 w-4 rounded"/>
                                            <span className="ms-2">إرسال كهدية (للتغليف الخاص)</span>
                                        </label>
                                    </div>
                                </Section>
                            )}

                        </div>
                        <div className="lg:col-span-1 sticky top-24 space-y-6">
                           <InteractivePreview 
                                formData={formData}
                                product={product} 
                           />
                           <OrderSummary />
                        </div>
                    </div>
                    <div className="mt-10 text-center">
                        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-3 px-12 py-4 bg-blue-600 text-white font-bold text-lg rounded-full hover:bg-blue-700 disabled:bg-gray-400 shadow-lg transform hover:scale-105 transition-transform">
                             {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                            <span>{isSubmitting ? 'جاري إرسال الطلب...' : `إتمام الطلب والدفع`}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderPage;