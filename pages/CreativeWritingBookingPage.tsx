import React, { useState, useEffect, useMemo } from 'react';
// FIX: Replaced named imports with a namespace import for 'react-router-dom' to resolve module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useCreativeWritingAdmin, Instructor, CreativeWritingPackage, AdditionalService } from '../contexts/admin/CreativeWritingAdminContext';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext';
import PageLoader from '../components/ui/PageLoader';
import BookingSummary from '../components/creative-writing/BookingSummary';
import { CheckCircle, AlertCircle, Package, User, Calendar, Send, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import BookingCalendar from '../components/BookingCalendar.tsx';
import ShareButtons from '../components/shared/ShareButtons';

type BookingStep = 'package' | 'instructor' | 'schedule' | 'confirm';

const CreativeWritingBookingPage: React.FC = () => {
    const location = ReactRouterDOM.useLocation();
    const navigate = ReactRouterDOM.useNavigate();
    const { 
        instructors, 
        creativeWritingPackages, 
        additionalServices, 
        createBooking, 
        loading,
        fetchInstructorAvailability 
    } = useCreativeWritingAdmin();
    const { currentUser, isLoggedIn } = useAuth();
    const { addToast } = useToast();

    const [step, setStep] = useState<BookingStep>('package');
    const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<CreativeWritingPackage | null>(null);
    const [selectedServices, setSelectedServices] = useState<AdditionalService[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const pageUrl = window.location.href;
    
    const selectedInstructor = useMemo(() => {
        if (!selectedInstructorId) return null;
        return instructors.find(i => i.id === selectedInstructorId);
    }, [instructors, selectedInstructorId]);

     useEffect(() => {
        // This effect handles pre-selections from navigation state (e.g., from instructor profile)
        const { instructorId, selectedDate, selectedTime } = location.state || {};

        if (instructorId && instructors.length > 0) {
            setSelectedInstructorId(instructorId);
        }
        if (selectedDate) {
            setSelectedDate(new Date(selectedDate)); // Convert ISO string back to Date object
        }
        if (selectedTime) {
            setSelectedTime(selectedTime);
        }
    }, [location.state, instructors]);


    useEffect(() => {
        if (step === 'schedule' && selectedInstructor && !selectedInstructor.availability) {
            const fetchAvail = async () => {
                setAvailabilityLoading(true);
                try {
                    await fetchInstructorAvailability(selectedInstructor.id);
                } catch (e) {
                    // error is handled and toasted in context
                } finally {
                    setAvailabilityLoading(false);
                }
            };
            fetchAvail();
        }
    }, [step, selectedInstructor, fetchInstructorAvailability]);

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
                bookingDate: selectedDate,
                bookingTime: selectedTime,
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

    const handleSelectPackage = (pkg: CreativeWritingPackage) => {
        setSelectedPackage(pkg);
        // If instructor and time are pre-selected, jump to confirm step
        if (selectedInstructorId && selectedDate && selectedTime) {
            setStep('confirm');
        } else {
            setStep(location.state?.instructorId ? 'schedule' : 'instructor');
        }
    };

    const handleSelectInstructor = (instructor: Instructor) => {
        setSelectedInstructorId(instructor.id);
        setStep('schedule');
    };

    const renderStepContent = () => {
        switch(step) {
            case 'package':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">1. اختر الباقة المناسبة</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {creativeWritingPackages.map(pkg => (
                                <div key={pkg.id} onClick={() => handleSelectPackage(pkg)} className="p-6 border-2 rounded-xl cursor-pointer transition-all border-gray-200 hover:border-blue-400 hover:bg-blue-50">
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
                                <div key={i.id} onClick={() => handleSelectInstructor(i)} className="p-6 border-2 rounded-xl cursor-pointer text-center flex flex-col items-center border-gray-200 hover:border-blue-400 hover:bg-blue-50">
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
                return (
                     <div>
                        <h2 className="text-2xl font-bold mb-2">3. اختر الموعد المناسب</h2>
                        <p className="text-gray-600 mb-6">تظهر في التقويم المواعيد المتاحة للمدرب: <span className="font-bold">{selectedInstructor?.name}</span></p>
                        
                        {availabilityLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="animate-spin text-blue-500" size={48} />
                            </div>
                        ) : selectedInstructor ? (
                            <BookingCalendar instructor={selectedInstructor} onDateTimeSelect={handleDateTimeSelect} />
                        ) : (
                             <p className="text-center py-8 text-gray-500 bg-gray-100 rounded-lg">
                                حدث خطأ، يرجى العودة واختيار المدرب مرة أخرى.
                            </p>
                        )}

                        <button onClick={() => setStep(location.state?.instructorId ? 'package' : 'instructor')} className="mt-8 flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                            <ArrowRight size={16}/> العودة للخلف
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
