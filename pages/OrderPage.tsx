
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useAdmin, PersonalizedProduct } from '../contexts/AdminContext.tsx';
import { useProduct } from '../contexts/ProductContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import PageLoader from '../components/ui/PageLoader';
import InteractivePreview from '../components/order/InteractivePreview';
import { User, Heart, Image, Edit, Plus, Send, Loader2, AlertCircle, Truck, Sparkles, X } from 'lucide-react';
import { EGYPTIAN_GOVERNORATES } from '../utils/governorates.ts';
import { GoogleGenAI, Type } from "@google/genai";


const storyGoals = [
    { key: 'respect', title: 'الاستئذان والاحترام' },
    { key: 'cooperation', title: 'التعاون والمشاركة' },
    { key: 'honesty', title: 'الصدق والأمانة' },
    { key: 'cleanliness', title: 'النظافة والترتيب' },
    { key: 'time_management', title: 'تنظيم الوقت' },
    { key: 'emotion_management', title: 'إدارة العواطف' },
    { key: 'problem_solving', title: 'حل المشكلات' },
    { key: 'creative_thinking', title: 'التفكير الإبداعي' },
];

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        ideas: {
            type: Type.ARRAY,
            description: "An array of 3 story ideas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy, short title for the story in Arabic." },
                    premise: { type: Type.STRING, description: "A 2-3 sentence premise for the story in Arabic." },
                    goal_key: { type: Type.STRING, description: `The key for the educational goal. Must be one of: ${storyGoals.map(g => `'${g.key}'`).join(', ')}` }
                },
                required: ["title", "premise", "goal_key"]
            }
        }
    },
    required: ["ideas"]
};
const systemInstruction = `You are a creative storyteller for "Alrehla", a platform creating personalized stories for Arab children. Your task is to generate 3 short, magical, and age-appropriate story ideas based on a child's details. Each idea must be unique and directly linked to one of the provided educational goals. The response must be in Arabic and adhere strictly to the provided JSON schema.`;


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
                    {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-lg" loading="lazy" /> : <Image className="text-gray-400" />}
                </div>
                <label htmlFor={id} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    <span>{file ? 'تغيير الصورة' : 'رفع صورة'}</span>
                    <input id={id} name={id} type="file" className="sr-only" onChange={(e) => onFileChange(id, e.target.files ? e.target.files[0] : null)} accept="image/*" />
                </label>
            </div>
        </div>
    );
};


const StoryIdeaGeneratorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelectIdea: (idea: any) => void;
    isGenerating: boolean;
    ideas: any[];
    error: string;
}> = ({ isOpen, onClose, onSelectIdea, isGenerating, ideas, error }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">✨ مولّد أفكار القصص</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                {isGenerating && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="animate-spin text-purple-500" size={48} />
                        <p className="mt-4 text-gray-600 font-semibold">جاري استحضار الأفكار السحرية...</p>
                    </div>
                )}
                {error && <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</p>}
                {!isGenerating && !error && ideas.length > 0 && (
                     <div className="space-y-4">
                        {ideas.map((idea, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                                <h4 className="font-bold text-lg text-blue-800">{idea.title}</h4>
                                <span className="text-xs font-semibold text-white bg-blue-500 px-2 py-0.5 rounded-full my-2 inline-block">
                                    {storyGoals.find(g => g.key === idea.goal_key)?.title}
                                </span>
                                <p className="text-sm text-gray-700">{idea.premise}</p>
                                <div className="text-right mt-4">
                                     <button onClick={() => onSelectIdea(idea)} className="text-sm font-bold bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors">
                                        استخدم هذه الفكرة
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


const OrderPage: React.FC = () => {
    const { productKey } = ReactRouterDOM.useParams<{ productKey: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { addToast } = useToast();
    const { currentUser, childProfiles } = useAuth();
    const { personalizedProducts, loading: adminLoading, createOrder } = useAdmin();
    const { prices, shippingCosts, loading: pricesLoading } = useProduct();

    const [product, setProduct] = useState<PersonalizedProduct | null>(null);
    const [formData, setFormData] = useState({
        childName: '',
        childAge: '',
        childGender: 'ذكر',
        familyNames: '',
        childTraits: '',
        storyValue: 'respect', // Default story value
        customGoal: '',
        deliveryType: 'printed', // for custom_story
        governorate: 'القاهرة',
    });
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        image1: null, image2: null, image3: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Story Idea Generator State
    const [showIdeaGenerator, setShowIdeaGenerator] = useState(false);
    const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatorError, setGeneratorError] = useState('');

    const needsShipping = useMemo(() => {
        if (!product) return false;
        if (product.key === 'custom_story' && formData.deliveryType === 'printed') return true;
        if (product.key === 'gift_box' || product.key === 'coloring_book' || product.key === 'dua_booklet') return true;
        return false;
    }, [product, formData.deliveryType]);


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

    const handleGenerateIdeas = async () => {
        if (!formData.childName || !formData.childAge) {
            addToast('الرجاء إدخال اسم وعمر الطفل أولاً!', 'warning');
            return;
        }

        setIsGenerating(true);
        setGeneratedIdeas([]);
        setGeneratorError('');
        setShowIdeaGenerator(true);
        
        const userPrompt = `Generate story ideas for a child named ${formData.childName}, who is ${formData.childAge} years old and is a ${formData.childGender}. The child's traits are: "${formData.childTraits || 'not specified'}". The ideas must fulfill one of these educational goals: ${storyGoals.map(g => `"${g.title}" (key: ${g.key})`).join(', ')}.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });

            const parsedJson = JSON.parse(response.text.trim());
            setGeneratedIdeas(parsedJson.ideas || []);

        } catch (err) {
            console.error("Gemini API Error:", err);
            setGeneratorError('عذراً، حدث خطأ أثناء توليد الأفكار. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSelectIdea = (idea: any) => {
        setFormData(prev => ({
            ...prev,
            storyValue: idea.goal_key,
        }));
        setShowIdeaGenerator(false);
        addToast('تم اختيار الفكرة وتحديث الهدف التربوي!', 'success');
    };


    const { subtotal, shippingCost, totalPrice, itemSummary } = useMemo(() => {
        if (!product || !prices) return { subtotal: 0, shippingCost: 0, totalPrice: 0, itemSummary: '' };
        
        let sub = 0;
        let summary = product.title;

        if (product.key === 'custom_story') {
            sub = formData.deliveryType === 'printed' ? prices.story.printed : prices.story.electronic;
            summary = `القصة المخصصة (${formData.deliveryType === 'printed' ? 'مطبوعة' : 'إلكترونية'})`;
        } else if (product.key === 'coloring_book') {
            sub = prices.coloringBook;
        } else if (product.key === 'dua_booklet') {
            sub = prices.duaBooklet;
        } else if (product.key === 'gift_box') {
            sub = prices.giftBox;
        }
        
        const shipping = needsShipping && shippingCosts ? (shippingCosts[formData.governorate] ?? 60) : 0;
        const total = sub + shipping;

        return { subtotal: sub, shippingCost: shipping, totalPrice: total, itemSummary: summary };
    }, [product, prices, formData.deliveryType, formData.governorate, needsShipping, shippingCosts]);

    const showFullCustomization = product?.key === 'custom_story' || product?.key === 'gift_box';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !product) return;

        // Validation
        if (showFullCustomization && !files.image1) {
            addToast('الرجاء رفع صورة وجه الطفل على الأقل، فهي إلزامية لتصميم الشخصية.', 'error');
            return;
        }
        if (showFullCustomization && formData.storyValue === 'custom' && !formData.customGoal.trim()) {
            addToast('لقد اخترت هدفًا مخصصًا، يرجى كتابته في الحقل المخصص.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const newOrder = await createOrder({ currentUser, formData, files, totalPrice, itemSummary, shippingCost });
            addToast('تم استلام طلبك! سيتم توجيهك الآن لإتمام عملية الدفع.', 'success');
            navigate('/checkout', { 
                state: { 
                    item: { 
                        id: newOrder.id, 
                        type: 'order',
                        total: newOrder.total,
                        summary: newOrder.item_summary
                    },
                    shippingCost: shippingCost
                } 
            });
        } catch (error: any) {
            addToast(`حدث خطأ: ${error.message}`, 'error');
            setIsSubmitting(false);
        }
    };

    if (adminLoading || pricesLoading || !product || !prices) {
        return <PageLoader text="جاري تجهيز صفحة الطلب..." />;
    }

    return (
        <>
            <StoryIdeaGeneratorModal 
                isOpen={showIdeaGenerator}
                onClose={() => setShowIdeaGenerator(false)}
                onSelectIdea={handleSelectIdea}
                isGenerating={isGenerating}
                ideas={generatedIdeas}
                error={generatorError}
            />
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
                                    <p className="text-sm text-gray-600 mb-4">ارفع 3 صور واضحة للطفل (وجه كامل، جانب، وجسم كامل) لنستخدمها في الرسومات. <span className="font-bold text-red-600">صورة الوجه إلزامية.</span></p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <FileUpload id="image1" label="صورة 1 (الوجه)*" file={files.image1} onFileChange={handleFileChange} />
                                        <FileUpload id="image2" label="صورة 2 (جانبية)" file={files.image2} onFileChange={handleFileChange} />
                                        <FileUpload id="image3" label="صورة 3 (كاملة)" file={files.image3} onFileChange={handleFileChange} />
                                    </div>
                                </section>
                                
                                {/* Customization Details */}
                                {showFullCustomization && (
                                    <section className="space-y-4">
                                        <h2 className="text-xl font-bold mb-4">3. تفاصيل التخصيص</h2>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">صفات الطفل وهواياته</label>
                                            <textarea name="childTraits" value={formData.childTraits} onChange={handleChange} rows={3} className="w-full p-2 border rounded-lg" placeholder="مثال: يحب الرسم والقطط، شجاع، لون عينيه بني..."></textarea>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-bold">الهدف التربوي من القصة*</label>
                                                 <button
                                                    type="button"
                                                    onClick={handleGenerateIdeas}
                                                    disabled={!formData.childName || !formData.childAge || isSubmitting}
                                                    className="flex items-center gap-2 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Sparkles size={16} />
                                                    <span>إلهمني بفكرة!</span>
                                                </button>
                                            </div>
                                            <select name="storyValue" value={formData.storyValue} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                                                {storyGoals.map(goal => (
                                                    <option key={goal.key} value={goal.key}>{goal.title}</option>
                                                ))}
                                                <option value="custom">هدف مخصص (اكتبه بنفسك)</option>
                                            </select>
                                        </div>
                                        {formData.storyValue === 'custom' && (
                                            <div className="animate-fadeIn">
                                                <label className="block text-sm font-bold mb-2">اكتب هدفك المخصص هنا*</label>
                                                <textarea name="customGoal" value={formData.customGoal} onChange={handleChange} rows={3} className="w-full p-2 border rounded-lg" placeholder="مثال: تعليم الطفل أهمية مساعدة كبار السن..." required></textarea>
                                            </div>
                                        )}
                                    </section>
                                )}
                                
                                {/* Delivery Options */}
                                <section>
                                    <h2 className="text-xl font-bold mb-4">4. خيارات الاستلام والشحن</h2>
                                    {product.key === 'custom_story' && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-bold mb-2">نوع النسخة</label>
                                            <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                                                <option value="printed">نسخة مطبوعة + إلكترونية ({prices.story.printed} ج.م)</option>
                                                <option value="electronic">نسخة إلكترونية فقط ({prices.story.electronic} ج.م)</option>
                                            </select>
                                        </div>
                                    )}
                                    {needsShipping && (
                                        <div className="animate-fadeIn">
                                            <label className="block text-sm font-bold mb-2">اختر المحافظة*</label>
                                            <select name="governorate" value={formData.governorate} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                                                {EGYPTIAN_GOVERNORATES.map(gov => (
                                                    <option key={gov} value={gov}>{gov}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </section>
                            </div>
                            <div className="lg:col-span-1">
                                <div className="sticky top-24 space-y-6">
                                    <InteractivePreview formData={formData} product={product} />
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between items-center text-gray-600">
                                                <p>المجموع الفرعي:</p>
                                                <p className="font-semibold">{subtotal} ج.م</p>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-600">
                                                <p>تكلفة الشحن:</p>
                                                <p className="font-semibold">{shippingCost} ج.م</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t pt-4">
                                            <p className="text-lg font-bold text-gray-800">الإجمالي</p>
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
        </>
    );
};

export default OrderPage;
