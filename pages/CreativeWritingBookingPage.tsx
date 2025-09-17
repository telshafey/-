import React, { useState, useEffect, useMemo } from 'react';
// FIX: Replaced namespace import with named imports for 'react-router-dom' to resolve module resolution errors.
import { useLocation, useNavigate } from 'react-router-dom';
import { useCreativeWritingAdmin, Instructor, CreativeWritingPackage, AdditionalService } from '../../contexts/admin/CreativeWritingAdminContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useToast } from '../../contexts/ToastContext.tsx';
// FIX: Added .tsx extension to PageLoader import to resolve module error.
import PageLoader from '../../components/ui/PageLoader.tsx';
import BookingSummary from '../../components/creative-writing/BookingSummary.tsx';
import { CheckCircle, AlertCircle, Package, User, Calendar, Send, Loader2, ArrowLeft, ArrowRight, Users } from 'lucide-react';
import BookingCalendar from '../../components/BookingCalendar.tsx';
// FIX: Added .tsx extension to ShareButtons import to resolve module loading error.
import ShareButtons from '../../components/shared/ShareButtons.tsx';

type BookingStep = 'package' | 'instructor' | 'child' | 'schedule' | 'confirm';

const CreativeWritingBookingPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { 
        instructors, 
        creativeWritingPackages, 
        additionalServices, 
        createBooking, 
        loading,
        fetchInstructorAvailability 
    } = useCreativeWritingAdmin();
    const { currentUser, isLoggedIn, childProfiles } = useAuth();
    const { addToast } = useToast();

    const [step, setStep] = useState<BookingStep>('package');
    const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<CreativeWritingPackage | null>(null);
    const [selectedServices, setSelectedServices] = useState<AdditionalService[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
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
        if (!selectedInstructor || !selectedPackage || !selectedDate || !selectedTime || !selectedChildId) {
            addToast('يرجى استكمال جميع خطوات الحجز.', 'warning');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await createBooking({
                currentUser,
                instructorId: selectedInstructor.id,
                childId: parseInt(selectedChildId),
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
            { key: 'package', title: 'الباقة', icon: <Package /> },
            { key: 'instructor', title: 'المدرب', icon: <User /> },
            { key: 'child', title: 'الطالب', icon: <Users /> },
            { key: 'schedule', title: 'الموعد', icon: <Calendar /> },
            { key: 'confirm', title: 'التأكيد', icon: <CheckCircle /> },
        ];
        const currentStepIndex = steps.findIndex(s => s.key === currentStep);

        return (
            <div className="w-full max-w-4xl mx-auto mb-16 px-4 sm:px-0">
                <div className="relative flex justify-between items-start">
                    {/* The connector line */}
                    <div className="absolute top-6 left-0 w-full h-1 bg-gray-200">
                        <div 
                            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        ></div>
                    </div>

                    {steps.map((s, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        let statusClasses = {
                            iconContainer: 'bg-white border-gray-300 text-gray-400',
                            title: 'text-gray-500'
                        };

                        if (isCompleted) {
                            statusClasses = {
                                iconContainer: 'bg-blue-600 border-blue-600 text-white',
                                title: 'text-blue-600 font-semibold'
                            };
                        } else if (isCurrent) {
                            statusClasses = {
                                iconContainer: 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-200',
                                title: 'text-blue-600 font-bold'
                            };
                        }

                        return (
                            <div key={s.key} className="relative z-10 flex flex-col items-center text-center w-20">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${statusClasses.iconContainer}`}>
                                    {isCompleted ? <CheckCircle /> : s.icon}
                                </div>
                                <p className={`mt-2 text-xs sm:text-sm ${statusClasses.title}`}>{s.title}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleSelectPackage = (pkg: CreativeWritingPackage) => {
        setSelectedPackage(pkg);
        setStep(location.state?.instructorId ? 'child' : 'instructor');
    };

    const handleSelectInstructor = (instructor: Instructor) => {
        setSelectedInstructorId(instructor.id);
        setStep('child');
    };

    const handleSelectChild = (childId: string) => {
        setSelectedChildId(childId);
        setStep(location.state?.selectedDate ? 'confirm' : 'schedule');
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
            case 'child':
                 return (
                     <div>
                        <h2 className="text-2xl font-bold mb-6">3. اختر الطالب</h2>
                        {childProfiles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {childProfiles.map(child => (
                                    <div key={child.id} onClick={() => handleSelectChild(child.id.toString())} className={`p-6 border-2 rounded-xl cursor-pointer text-center flex flex-col items-center transition-colors ${selectedChildId === child.id.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                                         <img src={child.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={child.name} className="w-20 h-20 rounded-full object-cover mb-3 ring-2 ring-blue-100"/>
                                         <h3 className="text-lg font-bold">{child.name}</h3>
                                         <p className="text-sm text-gray-500">{child.age} سنوات</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
                                <h3 className="font-bold text-blue-800">لا يوجد أطفال مضافون</h3>
                                <p className="text-sm text-blue-700 mt-2">
                                    يجب إضافة ملف طفل واحد على الأقل في <a href="#/account" className="font-bold underline">صفحة حسابك</a> لتتمكن من المتابعة.
                                </p>
                            </div>
                        )}
                        <button onClick={() => setStep(selectedInstructorId ? 'package' : 'instructor')} className="mt-8 flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                           <ArrowRight size={16}/> العودة
                        </button>
                    </div>
                );
            case 'schedule':
                if (!selectedInstructor) return <p>الرجاء اختيار مدرب أولاً.</p>;
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">4. اختر الموعد المناسب</h2>
                        {availabilityLoading ? (
                            <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-12 h-12 text-blue-500" /></div>
                        ) : (
                           <BookingCalendar instructor={selectedInstructor} onDateTimeSelect={handleDateTimeSelect} />
                        )}
                        <button onClick={() => setStep('child')} className="mt-8 flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                           <ArrowRight size={16}/> العودة لاختيار الطالب
                        </button>
                    </div>
                );
            case 'confirm':
                return (
                     <div>
                        <h2 className="text-2xl font-bold mb-6">5. تأكيد الحجز</h2>
                         <button onClick={() => setStep('schedule')} className="mt-8 flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                           <ArrowRight size={16}/> العودة لتغيير الموعد
                        </button>
                    </div>
                );
        }
    };
    
    return (
        <div className="bg-white py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">احجز جلستك الإبداعية</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        ابدأ رحلة طفلك في عالم الكتابة بخطوات بسيطة.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <ShareButtons 
                          title='اكتشف برنامج "بداية الرحلة" للكتابة الإبداعية واحجز جلسة لطفلك'
                          url={pageUrl}
                          label="شارك الصفحة:"
                        />
                    </div>
                </div>

                <StepIndicator currentStep={step} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-gray-50 p-8 rounded-2xl shadow-inner border">
                       {renderStepContent()}
                    </div>
                    <div className="lg:sticky top-24">
                        <BookingSummary 
                            instructor={selectedInstructor} 
                            selectedPackage={selectedPackage}
                            selectedServices={selectedServices}
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                        />
                        {step === 'confirm' && (
                            <button 
                                onClick={handleSubmitBooking}
                                disabled={isSubmitting}
                                className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-full hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                                <span>{isSubmitting ? 'جاري إرسال الحجز...' : 'إرسال وتأكيد الحجز'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativeWritingBookingPage;
