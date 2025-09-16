import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useCreativeWritingAdmin } from '../../contexts/admin/CreativeWritingAdminContext.tsx';
import PageLoader from '../../components/ui/PageLoader.tsx';
import { Video, Calendar, Clock, User, LogOut, Star, Feather, BookOpen, Award, Sparkles } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import ReviewModal from '../../components/creative-writing/ReviewModal.tsx';

const StudentDashboardPage: React.FC = () => {
    const { currentUser, signOut } = useAuth();
    const { creativeWritingBookings, creativeWritingPackages, reviews, loading } = useCreativeWritingAdmin();
    
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [instructorToReview, setInstructorToReview] = useState<{ id: number; name: string } | null>(null);

    const myJourneyData = useMemo(() => {
        if (!currentUser || creativeWritingBookings.length === 0 || creativeWritingPackages.length === 0) {
            return null;
        }

        const myBookings = creativeWritingBookings.filter(b => b.user_id === currentUser.id);
        if (myBookings.length === 0) return null;

        let mainPackage = null;
        let maxSessions = 0;

        myBookings.forEach(booking => {
            const pkg = creativeWritingPackages.find(p => p.id === booking.package_id);
            if (pkg) {
                const sessionCount = parseInt(pkg.sessions, 10);
                if (!isNaN(sessionCount) && sessionCount > maxSessions) {
                    maxSessions = sessionCount;
                    mainPackage = pkg;
                }
            }
        });
        
        if (!mainPackage) return null;

        const completedSessions = myBookings.filter(b => b.status === 'مكتمل').length;
        const totalSessions = maxSessions;
        const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
        
        return {
            packageName: mainPackage.name,
            completedSessions,
            totalSessions,
            progress: Math.min(progress, 100), // Cap progress at 100%
        };
    }, [creativeWritingBookings, creativeWritingPackages, currentUser]);

    const milestones = [
        { threshold: 1, title: "كاتب ناشئ", description: "أكملت جلستك الأولى!", icon: <Feather size={24}/> },
        { threshold: 4, title: "سارد القصص", description: "أكملت 4 جلسات بنجاح!", icon: <BookOpen size={24}/> },
        { threshold: 8, title: "مؤلف مغامر", description: "وصلت إلى 8 جلسات!", icon: <Award size={24}/> },
        { threshold: 12, title: "مبدع الكلمات", description: "أتقنت 12 جلسة!", icon: <Sparkles size={24}/> }
    ];

    if (loading || !currentUser) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }

    const mySessions = creativeWritingBookings
        .filter(b => b.user_id === currentUser.id)
        .sort((a,b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());
        
    const myUpcomingSessions = mySessions.filter(
        b => b.status === 'مؤكد' && new Date(b.booking_date) >= new Date(new Date().setDate(new Date().getDate() - 1))
    );

    const myCompletedSessions = mySessions.filter(b => b.status === 'مكتمل');

    return (
        <>
        <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            instructorId={instructorToReview?.id}
            instructorName={instructorToReview?.name}
            studentName={currentUser.name}
            userId={currentUser.id}
        />
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                 <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">أهلاً بك، {currentUser.name.split(' ')[0]}!</h1>
                        <p className="text-gray-600">هنا يمكنك رؤية جلساتك القادمة والسابقة.</p>
                    </div>
                     <button onClick={signOut} className="flex items-center gap-2 text-sm text-gray-600 bg-white border px-3 py-2 rounded-full hover:bg-gray-100">
                        <LogOut size={16}/>
                        <span>تسجيل الخروج</span>
                    </button>
                </header>

                {myJourneyData && (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border mb-8">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">رحلتي الإبداعية: <span className="text-blue-600">{myJourneyData.packageName}</span></h2>
                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner transition-all duration-500"
                                style={{ width: `${myJourneyData.progress}%` }}
                            >
                                {Math.round(myJourneyData.progress)}%
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-3">
                            لقد أكملت <span className="font-bold">{myJourneyData.completedSessions}</span> من أصل <span className="font-bold">{myJourneyData.totalSessions}</span> جلسات. واصل التقدم!
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {milestones.map(milestone => {
                                const isUnlocked = myJourneyData.completedSessions >= milestone.threshold;
                                return (
                                    <div key={milestone.title} className={`p-4 rounded-lg text-center transition-all ${isUnlocked ? 'bg-yellow-100' : 'bg-gray-100 opacity-60'}`}>
                                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-500'}`}>
                                            {milestone.icon}
                                        </div>
                                        <h3 className={`font-bold mt-2 text-sm ${isUnlocked ? 'text-yellow-800' : 'text-gray-600'}`}>{milestone.title}</h3>
                                        <p className={`text-xs ${isUnlocked ? 'text-yellow-700' : 'text-gray-500'}`}>{milestone.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}


                <div className="bg-white p-6 rounded-2xl shadow-lg border mb-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2"><Calendar/> جلساتك القادمة</h2>
                    
                    {myUpcomingSessions.length > 0 ? (
                        <div className="space-y-4">
                            {myUpcomingSessions.map(session => (
                                <div key={session.id} className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex-grow">
                                        <p className="font-bold text-blue-800">{session.package_name}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                                            <span className="flex items-center gap-1.5"><Clock size={14}/> {new Date(session.booking_date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {session.booking_time}</span>
                                            <span className="flex items-center gap-1.5"><User size={14}/> مع المدرب: {session.instructors?.name}</span>
                                        </div>
                                    </div>
                                    <ReactRouterDOM.Link 
                                        to={`/session/${session.session_id}`}
                                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-full font-semibold transition-colors ${
                                            session.session_id 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        }`}
                                        onClick={(e) => !session.session_id && e.preventDefault()}
                                        aria-disabled={!session.session_id}
                                    >
                                        <Video size={18}/>
                                        <span>{session.session_id ? 'انضم الآن' : 'بانتظار الرابط'}</span>
                                    </ReactRouterDOM.Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-12 text-gray-500">لا توجد لديك جلسات قادمة. سيتم عرضها هنا عند تأكيدها.</p>
                    )}
                </div>

                 <div className="bg-white p-6 rounded-2xl shadow-lg border">
                    <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2"><Calendar/> جلساتك السابقة</h2>
                     {myCompletedSessions.length > 0 ? (
                        <div className="space-y-4">
                            {myCompletedSessions.map(session => {
                                const hasReviewed = reviews.some(r => r.instructor_id === session.instructor_id && r.user_id === currentUser.id);
                                return (
                                <div key={session.id} className="p-4 bg-gray-50 border-l-4 border-gray-300 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-800">{session.package_name}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                                            <span className="flex items-center gap-1.5"><Clock size={14}/> {new Date(session.booking_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</span>
                                            <span className="flex items-center gap-1.5"><User size={14}/> مع: {session.instructors?.name}</span>
                                        </div>
                                    </div>
                                    {!hasReviewed && (
                                        <button 
                                            onClick={() => {
                                                setInstructorToReview({ id: session.instructor_id, name: session.instructors?.name || ''});
                                                setIsReviewModalOpen(true);
                                            }}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-full font-semibold transition-colors bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
                                        >
                                            <Star size={18}/>
                                            <span>اترك تقييمًا</span>
                                        </button>
                                    )}
                                </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-center py-12 text-gray-500">لا توجد لديك جلسات مكتملة بعد.</p>
                    )}
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 text-center">
                    <p>إذا واجهتك أي مشكلة، يرجى الطلب من ولي الأمر التواصل معنا عبر صفحة الدعم والمساعدة.</p>
                </div>
            </div>
        </div>
        </>
    );
}

export default StudentDashboardPage;