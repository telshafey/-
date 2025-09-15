
import React, { useState, useEffect } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useCreativeWritingAdmin, Instructor, CreativeWritingPackage, AdditionalService } from '../contexts/admin/CreativeWritingAdminContext';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext';
import PageLoader from '../components/ui/PageLoader';
import BookingSummary from '../components/creative-writing/BookingSummary';
import { CheckCircle, AlertCircle, Package, User, Calendar, Send, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { WeeklySchedule } from '../lib/database.types';
import ShareButtons from '../components/shared/ShareButtons';

type BookingStep = 'package' | 'instructor' | 'schedule' | 'confirm';

const dayNames: { [key in keyof WeeklySchedule]: string } = {
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
};


const CreativeWritingBookingPage: React.FC = () => {
    const location = ReactRouterDOM.useLocation();
    const navigate = ReactRouterDOM.useNavigate();
    const { 
        instructors, 
        creativeWritingPackages, 
        additionalServices, 
        createBooking, 
        loading 
    } = useCreativeWritingAdmin();
    const { currentUser, isLoggedIn } = useAuth();
    const { addToast } = useToast();

    const [step, setStep] = useState<BookingStep>('package');
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<CreativeWritingPackage | null>(null);
    const [selectedServices, setSelectedServices] = useState<AdditionalService[]>([]);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const pageUrl = window.location.href;
    
    useEffect(() => {
        const preselectedInstructorId = location.state?.instructorId;
        if (preselectedInstructorId && instructors.length > 0) {
            const instructor = instructors.find(i => i.id === preselectedInstructorId);
            if(instructor) {
                setSelectedInstructor(instructor);
                setStep('schedule'); // If coming from instructor page, go directly to schedule after picking a package
            }
        }
    }, [location.state, instructors]);

    const handleSelectService = (service: AdditionalService) => {
        setSelectedServices(prev => 
            prev.some(s => s.id === service.id) 
                ? prev.filter(s => s.id !== service.id) 
                : [...prev, service]
        );
    };

    const handleTimeSelect = (day: string, time: string) => {
        setSelectedDay(day);
        setSelectedTime(time);
        setStep('confirm');
    };

    const handleSubmitBooking = async () => {
        if (!isLoggedIn || !currentUser) {
            addToast('يجب تسجيل الدخول أولاً لإتمام الحجز.', 'error');
            navigate('/account');
            return;
        }
        if (!selectedInstructor || !selectedPackage || !selectedDay || !selectedTime) {
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
                recurringDay: selectedDay,
                recurringTime: selectedTime,
            });
            addToast('تم إنشاء حجزك بنجاح. يرجى إكمال الدفع من صفحة حسابك.', 'success');
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
            { key: 'instructor', title: 'اختيار المدرب', icon: <User /> },
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

    const renderStepContent = () => {
        switch(step) {
            case 'package':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">1. اختر الباقة المناسبة</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {creativeWritingPackages.map(pkg => (
                                <div key={pkg.id} onClick={() => { setSelectedPackage(pkg); setStep('instructor'); }} className="p-6 border-2 rounded-xl cursor-pointer transition-all border-gray-200 hover:border-blue-400 hover:bg-blue-50">
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
                    </div>
                );
            case 'instructor':
                return (
                     <div>
                        <h2 className="text-2xl font-bold mb-6">2. اختر المدرب</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {instructors.map(i => (
                                <div key={i.id} onClick={() => { setSelectedInstructor(i); setStep('schedule'); }} className="p-6 border-2 rounded-xl cursor-pointer text-center flex flex-col items-center border-gray-200 hover:border-blue-400 hover:bg-blue-50">
                                     <img src={i.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={i.name} className="w-20 h-20 rounded-full object-cover mb-3 ring-2 ring-blue-100"/>
                                     <h3 className="text-lg font-bold">{i.name}</h3>
                                     <p className="text-sm text-blue-600 flex-grow">{i.specialty}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setStep('package')} className="mt-8 flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                           <ArrowRight size={16}/> العودة لاختيار الباقة
                        </button>
                    </div>
                );
            case 'schedule':
                const weeklySchedule = selectedInstructor?.weekly_schedule as WeeklySchedule || {};
                const hasSchedule = Object.values(weeklySchedule).some(times => Array.isArray(times) && times.length > 0);
                return (
                     <div>
                        <h2 className="text-2xl font-bold mb-2">3. اختر الموعد الأسبوعي الثابت</h2>
                        <p className="text-gray-600 mb-6">اختر الموعد الذي سيتكرر أسبوعيًا لجلسات: <span className="font-bold">{selectedInstructor?.name}</span></p>
                        
                        {hasSchedule ? (
                            <div className="space-y-4">
                                {Object.entries(weeklySchedule).map(([day, times]) => (
                                    (Array.isArray(times) && times.length > 0) &&
                                    <div key={day}>
                                        <h3 className="font-bold text-gray-700 mb-2">{dayNames[day as keyof typeof dayNames]}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {times.map(time => (
                                                <button key={time} onClick={() => handleTimeSelect(day, time)} className="px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-blue-100 transition-colors">
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-gray-500 bg-gray-100 rounded-lg">
                                عذراً، هذا المدرب لم يحدد جدول مواعيده بعد.
                            </p>
                        )}

                        <button onClick={() => setStep('instructor')} className="mt-8 flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                            <ArrowRight size={16}/> العودة لاختيار المدرب
                        </button>
                     </div>
                );
            case 'confirm':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">4. التأكيد وإتمام الحجز</h2>
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
                            <button onClick={() => setStep('schedule')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                                <ArrowRight size={16}/> تغيير الموعد
                            </button>
                            <button onClick={handleSubmitBooking} disabled={isSubmitting || !isLoggedIn} className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 disabled:bg-gray-400">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                                <span>تأكيد الحجز</span>
                            </button>
                        </div>
                    </div>
                );
        }
    }


    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">حجز جلسة في برنامج "بداية الرحلة"</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        ابدأ رحلة طفلك الإبداعية في خطوات بسيطة.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <ShareButtons 
                          title='احجز جلسة لطفلك في برنامج "بداية الرحلة" للكتابة الإبداعية' 
                          url={pageUrl}
                          label="شارك صفحة الحجز:"
                        />
                    </div>
                </div>
                
                <StepIndicator currentStep={step} />

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
                       {renderStepContent()}
                    </div>
                    
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <BookingSummary 
                                instructor={selectedInstructor}
                                selectedPackage={selectedPackage}
                                selectedServices={selectedServices}
                                selectedDay={selectedDay ? dayNames[selectedDay as keyof typeof dayNames] : null}
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