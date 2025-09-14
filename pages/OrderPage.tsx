import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Camera, Trash2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin, PersonalizedProduct } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import PageLoader from '../components/ui/PageLoader';
import InteractivePreview from '../components/order/InteractivePreview';
import Accordion from '../components/ui/Accordion';

const storyValues = [
    { key: 'courage', title: 'الشجاعة' },
    { key: 'friendship', title: 'الصداقة' },
    { key: 'honesty', title: 'الصدق' },
    { key: 'kindness', title: 'العطف' },
    { key: 'perseverance', title: 'المثابرة' },
    { key: 'custom', title: 'قيمة أخرى (حددها بنفسك)' },
];


const FileUpload: React.FC<{ label: string; description: string; required?: boolean; file: File | null; setFile: (file: File | null) => void; id: string; disabled?: boolean;}> = ({ label, description, required, file, setFile, id, disabled }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files ? e.target.files[0] : null);
    };
    
    const removeFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFile(null);
    }

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-bold text-gray-700">
                {label}{required && <span className="text-red-500 ms-1">*</span>}
            </label>
            <p className="text-xs text-gray-500 mb-2">{description}</p>
            <div className={`mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors ${!disabled && 'hover:border-blue-400'} ${preview ? 'relative p-2' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" required={required} disabled={disabled} />
                {preview ? (
                   <label htmlFor={id} className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
                        <img src={preview} alt="Preview" className="h-32 w-auto rounded-md object-cover" />
                        {!disabled && 
                            <button onClick={removeFile} className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm rounded-full p-1 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all">
                                <Trash2 size={20} />
                            </button>
                        }
                    </label>
                ) : (
                    <label htmlFor={id} className={`w-full h-full text-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <div className="space-y-1 text-center py-4">
                            <Camera className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600 justify-center">
                                <span className={`font-medium ${!disabled ? 'text-blue-600 hover:text-blue-500' : ''}`}>
                                    اختر ملفًا
                                </span>
                                <p className="ps-1">أو اسحبه هنا</p>
                            </div>
                             <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                    </label>
                )}
            </div>
        </div>
    );
};


const OrderPage: React.FC = () => {
    const { productKey } = useParams<{ productKey: string }>();
    const { prices, loading: pricesLoading } = useProduct();
    const { isLoggedIn, currentUser, loading: authLoading } = useAuth();
    const { createOrder, personalizedProducts, loading: adminLoading } = useAdmin();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [product, setProduct] = useState<PersonalizedProduct | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        childName: '',
        childAge: '',
        childGender: 'ولد',
        familyNames: '',
        childTraits: '',
        characterDescription: '',
        storyValue: '',
        storyCustomValue: '',
        productOptions: {
            storyType: 'printed' as 'printed' | 'electronic',
        },
        shipping: {
            type: 'own', // 'own' or 'gift'
            address: '',
            city: '',
            zip: '',
        }
    });

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        face: null,
        full: null,
        extra1: null,
        extra2: null,
    });
    
    const [totalPrice, setTotalPrice] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        const foundProduct = personalizedProducts.find(p => p.key === productKey);
        if (foundProduct) {
            setProduct(foundProduct);
            setFormError(null);
        } else if (!adminLoading) {
            setFormError(`المنتج المطلوب (${productKey}) غير موجود أو غير متوفر حاليًا.`);
        }
    }, [productKey, personalizedProducts, adminLoading]);


    useEffect(() => {
        if (!prices || !product) {
            setTotalPrice(0);
            return;
        };
        let total = 0;
        switch(product.key) {
            case 'custom_story':
                total = formData.productOptions.storyType === 'printed' ? prices.story.printed : prices.story.electronic;
                break;
            case 'coloring_book':
                total = prices.coloringBook;
                break;
            case 'dua_booklet':
                total = prices.duaBooklet;
                break;
            case 'values_story':
                total = prices.valuesStory;
                break;
            case 'skills_story':
                total = prices.skillsStory;
                break;
            case 'gift_box':
                total = prices.giftBox;
                break;
        }
        setTotalPrice(total);
    }, [formData.productOptions.storyType, product, prices]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const [field, subfield] = name.split('.');
      if (subfield) {
        setFormData(prev => ({ ...prev, shipping: { ...prev.shipping, [subfield]: value } }));
      } else {
        setFormData(prev => ({ ...prev, shipping: { ...prev.shipping, [field]: value } }));
      }
    };
    
    const handleProductOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          productOptions: {
              ...prev.productOptions,
              [name]: value,
          }
      }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn || !currentUser) {
            addToast('يجب تسجيل الدخول أولاً لإرسال الطلب.', 'error');
            navigate('/account');
            return;
        }
        if (!product) {
            addToast('لا يمكن إرسال الطلب لمنتج غير موجود.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await createOrder({
                currentUser,
                formData,
                files,
                totalPrice,
                itemSummary: product.title,
            });
            
            addToast('تم إرسال طلبك بنجاح. يرجى إكمال عملية الدفع من صفحة طلباتي.', 'success');
            navigate('/account');

        } catch (error: any) {
            addToast(`حدث خطأ: ${error.message}`, 'error');
            console.error("Order submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
        
    const isLoading = pricesLoading || authLoading || adminLoading;

    if (isLoading) {
        return <PageLoader text="جاري تحميل صفحة الطلب..." />;
    }

    if (formError) {
        return <div className="min-h-screen flex justify-center items-center text-red-500 text-xl bg-red-50 p-8 rounded-lg">{formError}</div>
    }

    if (!prices || !product) {
        return <PageLoader text="جاري تهيئة المنتج..." />;
    }

    const showChildInfo = ['custom_story', 'coloring_book', 'dua_booklet', 'values_story', 'skills_story', 'gift_box'].includes(product.key);
    const showAdvancedChildInfo = ['custom_story', 'coloring_book', 'dua_booklet', 'values_story', 'skills_story', 'gift_box'].includes(product.key);
    const showStoryValueCustomization = ['custom_story', 'values_story', 'skills_story', 'gift_box'].includes(product.key);
    const showPhotos = ['custom_story', 'coloring_book', 'dua_booklet', 'values_story', 'skills_story', 'gift_box'].includes(product.key);

    return (
        <div className="bg-gray-50 py-12 sm:py-16 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">اطلب: {product.title}</h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">املأ البيانات المطلوبة لإتمام طلبك لهذا المنتج.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        <div className="lg:col-span-1 order-last lg:order-first">
                            <div className="sticky top-24">
                                <InteractivePreview formData={formData} product={product} />
                            </div>
                        </div>

                        <form className="lg:col-span-2" onSubmit={handleSubmit}>
                            {!isLoggedIn && (
                                <div className="p-4 mb-8 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                                <div className="flex items-center gap-3">
                                    <AlertCircle/>
                                    <div className="font-bold">
                                        يرجى <a href="#/account" className="underline">تسجيل الدخول</a> أو <a href="#/account" className="underline">إنشاء حساب</a> أولاً لتتمكن من إرسال طلبك.
                                    </div>
                                </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {showChildInfo && (
                                    <Accordion title="1. بيانات الطفل">
                                        <div className="p-6 space-y-6 bg-gray-50/50">
                                            <div>
                                                <label htmlFor="childName" className="block text-sm font-bold text-gray-700 mb-2">اسم الطفل*</label>
                                                <input type="text" id="childName" name="childName" onChange={handleInputChange} value={formData.childName} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="مثال: أحمد" required />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="childAge" className="block text-sm font-bold text-gray-700 mb-2">العمر*</label>
                                                    <input type="number" id="childAge" name="childAge" onChange={handleInputChange} value={formData.childAge} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="8" required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">الجنس*</label>
                                                    <select id="childGender" name="childGender" onChange={handleInputChange} value={formData.childGender} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" required>
                                                        <option>ولد</option>
                                                        <option>بنت</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {showAdvancedChildInfo && (
                                                <>
                                                    <div className="pt-4 border-t">
                                                        <label htmlFor="characterDescription" className="block text-sm font-bold text-gray-700 mb-2">وصف شكل شخصية الطفل (اختياري)</label>
                                                        <textarea id="characterDescription" name="characterDescription" onChange={handleInputChange} value={formData.characterDescription} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="مثال: شعر بني قصير ومموج، عينان بنيتان، يرتدي نظارة حمراء..."></textarea>
                                                    </div>
                                                    
                                                    <div className="pt-4 border-t">
                                                        <label htmlFor="familyNames" className="block text-sm font-bold text-gray-700 mb-2">أسماء العائلة والأصدقاء (اختياري)</label>
                                                        <input type="text" id="familyNames" name="familyNames" onChange={handleInputChange} value={formData.familyNames} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="الأم: فاطمة، الأخ: علي..."/>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="childTraits" className="block text-sm font-bold text-gray-700 mb-2">صفات الطفل وهواياته</label>
                                                        <textarea id="childTraits" name="childTraits" onChange={handleInputChange} value={formData.childTraits} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="يحب كرة القدم، لطيف، ويساعد أصدقاءه..."></textarea>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </Accordion>
                                )}
                                
                                {showStoryValueCustomization && (
                                    <Accordion title="2. تخصيص القصة">
                                        <div className="p-6 space-y-8 bg-gray-50/50">
                                            <div>
                                                <label htmlFor="storyValue" className="block text-md font-bold text-gray-700 mb-2">اختر قيمة لغرسها في القصة*</label>
                                                 <p className="text-xs text-gray-500 mb-2">سيتم نسج القيمة التي تختارها بذكاء داخل أحداث القصة.</p>
                                                <select id="storyValue" name="storyValue" onChange={handleInputChange} value={formData.storyValue} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" required>
                                                    <option value="" disabled>اختر قيمة أساسية</option>
                                                    {storyValues.map(v => <option key={v.key} value={v.key}>{v.title}</option>)}
                                                </select>
                                            </div>
                                            {formData.storyValue === 'custom' && (
                                                <div>
                                                    <label htmlFor="storyCustomValue" className="block text-sm font-bold text-gray-700 mb-2">القيمة المخصصة*</label>
                                                    <input type="text" id="storyCustomValue" name="storyCustomValue" onChange={handleInputChange} value={formData.storyCustomValue} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="مثال: حب مساعدة كبار السن" required/>
                                                </div>
                                            )}
                                        </div>
                                    </Accordion>
                                )}

                                {showPhotos && (
                                    <Accordion title="3. صور الطفل">
                                        <div className="p-6 bg-gray-50/50">
                                            <p className="text-gray-600 mb-6 text-sm">يرجى رفع 2-4 صور واضحة للطفل من زوايا مختلفة لضمان أفضل نتيجة في الرسومات.</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <FileUpload id="face" label="صورة الوجه" description="صورة واضحة للوجه من الأمام" required file={files.face} setFile={(f) => setFiles(p => ({...p, face: f}))} />
                                                <FileUpload id="full" label="صورة كاملة" description="صورة كاملة للطفل" required file={files.full} setFile={(f) => setFiles(p => ({...p, full: f}))} />
                                                <FileUpload id="extra1" label="صورة من الجانب (اختياري)" description="لزيادة دقة الرسم" file={files.extra1} setFile={(f) => setFiles(p => ({...p, extra1: f}))} />
                                                <FileUpload id="extra2" label="صورة أخرى (اختياري)" description="صورة وهو يمارس هوايته مثلاً" file={files.extra2} setFile={(f) => setFiles(p => ({...p, extra2: f}))} />
                                            </div>
                                        </div>
                                    </Accordion>
                                )}
                                
                                <Accordion title="4. اختيار المنتج والشحن">
                                    <div className="p-6 space-y-8 bg-gray-50/50">
                                        <div className="bg-gray-100 p-6 rounded-lg">
                                            <h3 className="text-xl font-bold text-gray-800">{product.title}</h3>
                                            <p className="text-gray-600 mt-2 text-sm">{product.description}</p>
                                            
                                            {product.key === 'custom_story' && (
                                                <div className="mt-4 space-y-2 pt-4 border-t">
                                                    <label className="block text-sm font-bold text-gray-700">اختر نوع النسخة:</label>
                                                    <div className="flex flex-col sm:flex-row sm:gap-6">
                                                    <label className="flex items-center"><input type="radio" name="storyType" value="printed" checked={formData.productOptions.storyType === 'printed'} onChange={handleProductOptionChange} className="text-blue-600 focus:ring-blue-500"/><span className="ms-2">مطبوعة + إلكترونية ({prices.story.printed} جنيه)</span></label>
                                                    <label className="flex items-center"><input type="radio" name="storyType" value="electronic" checked={formData.productOptions.storyType === 'electronic'} onChange={handleProductOptionChange} className="text-blue-600 focus:ring-blue-500"/><span className="ms-2">إلكترونية فقط ({prices.story.electronic} جنيه)</span></label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 pt-6 border-t">
                                            <h3 className="text-lg font-bold text-gray-700">الشحن والتوصيل</h3>
                                            <div className="space-y-2">
                                                <label className="flex items-center p-4 border rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                                                    <input type="radio" name="shipping.type" value="own" checked={formData.shipping.type === 'own'} onChange={handleShippingChange} className="text-blue-600 focus:ring-blue-500"/>
                                                    <span className="ms-3 font-bold">الشحن إلى عنواني</span>
                                                </label>
                                                <label className="flex items-center p-4 border rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                                                    <input type="radio" name="shipping.type" value="gift" checked={formData.shipping.type === 'gift'} onChange={handleShippingChange} className="text-blue-600 focus:ring-blue-500"/>
                                                    <span className="ms-3 font-bold">إرسال كهدية إلى عنوان آخر</span>
                                                </label>
                                            </div>
                                            <div className="p-4 border-t pt-6 space-y-4">
                                                <h3 className="font-bold text-gray-700">{formData.shipping.type === 'gift' ? 'عنوان المستلم:' : 'عنوان الشحن:'}</h3>
                                                <input type="text" name="shipping.address" onChange={handleShippingChange} placeholder="العنوان بالتفصيل" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required/>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <input type="text" name="shipping.city" onChange={handleShippingChange} placeholder="المدينة" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required/>
                                                    <input type="text" name="shipping.zip" onChange={handleShippingChange} placeholder="الرمز البريدي" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Accordion>

                                <div>
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg text-center">
                                        <p className="text-lg font-semibold text-gray-700">الإجمالي المطلوب للدفع</p>
                                        <p className="text-4xl font-extrabold text-blue-600 tracking-tight">{totalPrice} جنيه مصري</p>
                                    </div>
                                    
                                    <div className="mt-6">
                                        <button type="submit" disabled={isSubmitting || !isLoggedIn} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 transition-colors transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                                            <Send size={18} />
                                            <span>{isSubmitting ? 'جاري إنشاء الطلب...' : 'المتابعة للدفع'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;