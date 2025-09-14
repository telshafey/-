
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdmin, Instructor, CreativeWritingPackage, AdditionalService } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PageLoader from '../components/ui/PageLoader';
import BookingCalendar from '../components/BookingCalendar';
import BookingSummary from '../components/creative-writing/BookingSummary';
import { CheckCircle, AlertCircle, Package, Calendar, Send, Loader2 } from 'lucide-react';

type BookingStep = 'package' | 'schedule' | 'confirm';

const CreativeWritingBookingPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { 
        instructors, 
        creativeWritingPackages, 
        additionalServices, 
        createBooking, 
        loading 
    } = useAdmin();
    const { currentUser, isLoggedIn } = useAuth();
    const { addToast } = useToast();

    const [step, setStep] = useState<BookingStep>('package');
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<CreativeWritingPackage | null>(null);
    const [selectedServices, setSelectedServices] = useState<AdditionalService[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const preselectedInstructorId = location.state?.instructorId;
        if (preselectedInstructorId && instructors.length > 0) {
            const instructor = instructors.find(i => i.id === preselectedInstructorId);
            setSelectedInstructor(instructor || null);
        } else if (instructors.length > 0) {
            setSelectedInstructor(instructors[0]);
        }
    }, [location.state, instructors]);

    const handleSelectService = (service: AdditionalService) => {
        setSelectedServices(prev => 
            prev.some(s => s.id === service.id) 
                ? prev.filter(s => s.id !== service.id) 
                : [...prev, service]
        );
    };

    const handleDateTimeSelect = (date: Date, time: string) => {
        setSelectedDate(date);
        setSelectedTime(time);
        setStep('confirm');
    };

    const handleSubmitBooking = async () => {
        if (!isLoggedIn || !currentUser) {
            addToast('يجب تسجيل الدخول أولاً لإتمام الحجز.', 'error');
            navigate('/account');
            return;
        }
        if (!selectedInstructor || !selectedPackage || !selectedDate || !selectedTime) {
            addToast('يرجى استكمال جميع خطوات الحجز.', 'warning');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await createBooking({
                currentUser,
                instructorId: selectedInstructor.id,
                selectedPackage,
                selectedServices,
                selectedDate,
                selectedTime,
            });
            addToast('تم إنشاء حجزك بنجاح. يرجى إكمال الدفع من صفحة طلباتي.', 'success');
            navigate('/account');
        } catch (error: any) {
            addToast(`حدث خطأ: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) {
        return <PageLoader text="جاري تحميل صفحة الحجز..." />;
    }
    
    const StepIndicator: React.FC<{ currentStep: BookingStep }> = ({ currentStep }) => {
        const steps: { key: BookingStep; title: string; icon: React.ReactNode }[] = [
            { key: 'package', title: 'اختيار الباقة', icon: <Package /> },
            { key: 'schedule', title: 'اختيار الموعد', icon: <Calendar /> },
            { key: 'confirm', title: 'التأكيد والدفع', icon: <CheckCircle /> },
        ];
        const currentStepIndex = steps.findIndex(s => s.key === currentStep);

        return (
            <div className="flex justify-center items-center mb-12">
                {steps.map((s, index) => (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${index <= currentStepIndex ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                {s.icon}
                            </div>
                            <p className={`mt-2 text-sm font-semibold ${index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'}`}>{s.title}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-grow h-1 mx-4 ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'}`}></div>}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">حجز جلسة في برنامج "بداية الرحلة"</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        ابدأ رحلة طفلك الإبداعية في خطوات بسيطة.
                    </p>
                </div>
                
                <StepIndicator currentStep={step} />

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        {/* Step 1: Package Selection */}
                        {step === 'package' && (
                             <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <h2 className="text-2xl font-bold mb-6">1. اختر المدرب والباقة</h2>
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">اختر المدرب</label>
                                    <select value={selectedInstructor?.id || ''} onChange={(e) => setSelectedInstructor(instructors.find(i => i.id === +e.target.value) || null)} className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg bg-white">
                                        {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {creativeWritingPackages.map(pkg => (
                                        <div key={pkg.id} onClick={() => setSelectedPackage(pkg)} className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${selectedPackage?.id === pkg.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-400'}`}>
                                            {pkg.popular && <div className="text-xs font-bold text-white bg-red-500 inline-block px-2 py-0.5 rounded-full mb-2">الأكثر شيوعاً</div>}
                                            <h3 className="text-xl font-bold text-gray-800">{pkg.name}</h3>
                                            <p className="text-2xl font-extrabold text-blue-600 my-2">{pkg.price} ج.م</p>
                                            <p className="text-sm text-gray-500 mb-4">{pkg.sessions}</p>
                                            <ul className="space-y-2 text-sm">
                                                {pkg.features.map((f, i) => <li key={i} className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 me-2 mt-0.5 flex-shrink-0"/><span>{f}</span></li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                <h2 className="text-2xl font-bold mb-4">خدمات إضافية (اختياري)</h2>
                                <div className="space-y-4">
                                    {additionalServices.map(service => (
                                        <label key={service.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                                            <div>
                                                <h4 className="font-bold">{service.name}</h4>
                                                <p className="text-sm text-gray-500">{service.description}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-blue-600">{service.price} ج.م</span>
                                                <input type="checkbox" checked={selectedServices.some(s => s.id === service.id)} onChange={() => handleSelectService(service)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"/>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-8 text-right">
                                    <button onClick={() => setStep('schedule')} disabled={!selectedPackage || !selectedInstructor} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 disabled:bg-gray-400">
                                        التالي: اختيار الموعد
                                    </button>
                                </div>
                             </div>
                        )}
                        
                        {/* Step 2: Schedule */}
                        {step === 'schedule' && selectedInstructor && (
                             <div className="bg-white p-8 rounded-2xl shadow-lg">
                                 <h2 className="text-2xl font-bold mb-2">2. اختر الموعد المناسب</h2>
                                 <p className="text-gray-600 mb-6">اختر يوماً ثم وقتاً متاحاً للمدرب: <span className="font-bold">{selectedInstructor.name}</span></p>
                                <BookingCalendar instructor={selectedInstructor} onDateTimeSelect={handleDateTimeSelect}/>
                                <button onClick={() => setStep('package')} className="mt-6 text-sm text-gray-600 hover:text-blue-600">العودة لاختيار الباقة</button>
                             </div>
                        )}

                        {/* Step 3: Confirm */}
                        {step === 'confirm' && (
                             <div className="bg-white p-8 rounded-2xl shadow-lg">
                                 <h2 className="text-2xl font-bold mb-6">3. التأكيد وإتمام الحجز</h2>
                                  {!isLoggedIn && (
                                    <div className="p-4 mb-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle/>
                                            <div className="font-bold">
                                                يرجى <a href="#/account" className="underline">تسجيل الدخول</a> أو <a href="#/account" className="underline">إنشاء حساب</a> لإتمام الحجز.
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <p className="text-gray-600 mb-6">يرجى مراجعة تفاصيل حجزك. بعد الضغط على "تأكيد الحجز"، سيتم توجيهك لصفحة حسابك لإتمام عملية الدفع.</p>
                                <div className="mt-8 flex justify-between items-center">
                                     <button onClick={() => setStep('schedule')} className="text-sm text-gray-600 hover:text-blue-600">تغيير الموعد</button>
                                     <button onClick={handleSubmitBooking} disabled={isSubmitting || !isLoggedIn} className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 disabled:bg-gray-400">
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                                        <span>تأكيد الحجز</span>
                                     </button>
                                </div>
                             </div>
                        )}
                    </div>
                    
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <BookingSummary 
                                instructor={selectedInstructor}
                                selectedPackage={selectedPackage}
                                selectedServices={selectedServices}
                                selectedDate={selectedDate}
                                selectedTime={selectedTime}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativeWritingBookingPage;
