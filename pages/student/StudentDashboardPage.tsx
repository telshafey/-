import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useCreativeWritingAdmin } from '../../contexts/admin/CreativeWritingAdminContext.tsx';
import PageLoader from '../../components/ui/PageLoader.tsx';
import { Video, Calendar, Clock, User, LogOut, Star, Feather, BookOpen, Award, Sparkles, MessageSquare, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReviewModal from '../../components/creative-writing/ReviewModal.tsx';
import { formatDate } from '../../utils/helpers.ts';

// New JourneyPath Component
const JourneyPath: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
    if (total === 0) return null;
    
    // The line should connect the centers of the circles.
    const pathProgress = total > 1 ? Math.min(100, (completed / (total - 1)) * 100) : (completed > 0 ? 100 : 0);

    return (
        <div className="mt-6 mb-4">
            <div className="relative w-full px-2 sm:px-4">
                 {/* The path line */}
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `calc(${pathProgress}% - 1rem)` }}
                    ></div>
                </div>
                
                {/* The steps */}
                <div className="flex justify-between items-start">
                    {Array.from({ length: total }).map((_, index) => {
                        const sessionNumber = index + 1;
                        const isCompleted = sessionNumber <= completed;
                        const isCurrent = sessionNumber === completed + 1;

                        return (
                            <div key={index} className="relative z-10 flex flex-col items-center text-center w-16">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                        ${isCompleted ? 'bg-green-500 border-green-600 text-white' :
                                        isCurrent ? 'bg-blue-500 border-blue-600 text-white animate-pulse' :
                                        'bg-white border-gray-300 text-gray-500'}`}
                                >
                                    {isCompleted ? <Check size={16} /> : <span className="font-bold">{sessionNumber}</span>}
                                </div>
                                <span className="text-xs mt-2 font-semibold text-gray-600">
                                    الجلسة {sessionNumber}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};


const StudentDashboardPage: React.FC = () => {
    const { currentUser, currentChildProfile, signOut } = useAuth();
    const { creativeWritingBookings, creativeWritingPackages, reviews, loading } = useCreativeWritingAdmin();
    const navigate = useNavigate();
    
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [instructorToReview, setInstructorToReview] = useState<{ id: number; name: string } | null>(null);

    const myJourneyData = useMemo(() => {
        if (!currentUser || !currentChildProfile || creativeWritingBookings.length === 0 || creativeWritingPackages.length === 0) {
            return null;
        }

        const myBookings = creativeWritingBookings.filter(b => b.child_id === currentChildProfile.id);
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
    }, [creativeWritingBookings, creativeWritingPackages, currentUser, currentChildProfile]);

    const milestones = [
        { threshold: 1, title: "كاتب ناشئ", description: "أكملت جلستك الأولى!", icon: <Feather size={24}/> },
        { threshold: 4, title: "سارد القصص", description: "أكملت 4 جلسات بنجاح!", icon: <BookOpen size={24}/> },
        { threshold: 8, title: "مؤلف مغامر", description: "وصلت إلى 8 جلسات!", icon: <Award size={24}/> },
        { threshold: 12, title: "مبدع الكلمات", description: "أتقنت 12 جلسة!", icon: <Sparkles size={24}/> }
    ];

    if (loading || !currentUser || !currentChildProfile) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }

    const mySessions = creativeWritingBookings
        .filter(b => b.child_id === currentChildProfile.id)
        .sort((a,b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());
        
    const myUpcomingSessions = mySessions.filter(
        b => b.status === 'مؤكد' && new Date(b.booking_date) >= new Date(new Date().setDate(new Date().getDate() - 1))
    );

    const myCompletedSessions = mySessions.filter(b => b.status === 'مكتمل');
    const myCompletedSessionsWithNotes = myCompletedSessions.filter(s => s.progress_notes);

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
                        <h1 className="text-3xl font-bold text-gray-800">أهلاً بك، {currentChildProfile.name}!</h1>
                        <p className="text-gray-600">هنا يمكنك رؤية جلساتك القادمة والسابقة.</p>
                    </div>
                     <button onClick={signOut} className="flex items-center gap-2 text-sm text-gray-600 bg-white border px-3 py-2 rounded-full hover:bg-gray-100">
                        <LogOut size={16}/>
                        <span>تسجيل الخروج</span>
                    </button>
                </header>

                {myJourneyData && (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border mb-8">
                        <h2 className="text-xl font-bold text-gray-700 mb-2">رحلتي الإبداعية: <span className="text-blue-600">{myJourneyData.packageName}</span></h2>
                         <p className="text-center text-gray-600 mt-2">
                            أنت على الطريق الصحيح! أكملت <span className="font-bold">{myJourneyData.completedSessions}</span> من <span className="font-bold">{myJourneyData.totalSessions}</span> جلسات. واصل التقدم!
                        </p>
                        <JourneyPath completed={myJourneyData.completedSessions} total={myJourneyData.totalSessions} />
                    </div>
                )}
                
                {myJourneyData && (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border mb-8">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">إنجازاتي</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {milestones.map(milestone => {
                                const isUnlocked = myJourneyData.completedSessions >= milestone.threshold;
                                return (
                                    <div key={milestone.title} className={`p-4 rounded-lg text-center transition-all duration-300 ${isUnlocked ? 'bg-yellow-100 border-2 border-yellow-300 shadow-lg transform scale-105' : 'bg-gray-100 opacity-60'}`}>
                                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-500'}`}>
                                            {milestone.icon}
                                        </div>
                                        <h3 className={`font-bold mt-2 text-sm ${isUnlocked ? 'text-yellow-800' : 'text-gray-600'}`}>{milestone.title}</h3>
                                        {isUnlocked && <p className="text-xs text-yellow-700 font-semibold animate-fadeIn">{milestone.description}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">الجلسات القادمة</h2>
                        {myUpcomingSessions.length > 0 ? (
                            <div className="space-y-4">
                                {myUpcomingSessions.map(session => (
                                    <div key={session.id} className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-blue-800">مع المدرب: {(session as any).instructors?.name}</p>
                                                <div className="flex items-center gap-4 text-sm text-blue-700 mt-2">
                                                    <span className="flex items-center gap-1.5"><Calendar size={14}/> {formatDate(session.booking_date)}</span>
                                                    <span className="flex items-center gap-1.5"><Clock size={14}/> {session.booking_time}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => navigate(`/session/${session.session_id}`)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
                                                <Video size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">لا توجد جلسات قادمة.</p>
                        )}
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">الجلسات المكتملة</h2>
                        {myCompletedSessions.length > 0 ? (
                            <div className="space-y-4 max-h-72 overflow-y-auto">
                                {myCompletedSessions.map(session => {
                                    const hasBeenReviewed = reviews.some(r => r.user_id === currentUser.id && r.instructor_id === session.instructor_id);
                                    return (
                                        <div key={session.id} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-gray-800">مع المدرب: {(session as any).instructors?.name}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(session.booking_date)}</p>
                                                </div>
                                                {!hasBeenReviewed && (
                                                    <button 
                                                        onClick={() => {
                                                            setInstructorToReview({ id: session.instructor_id, name: (session as any).instructors?.name || 'المدرب' });
                                                            setIsReviewModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-1.5 text-sm bg-yellow-400 text-yellow-900 font-semibold px-3 py-1 rounded-full hover:bg-yellow-500"
                                                    >
                                                        <Star size={14}/> قيّم الجلسة
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">لم تكمل أي جلسات بعد.</p>
                        )}
                    </div>
                </div>

                {myCompletedSessionsWithNotes.length > 0 && (
                    <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">ملاحظات من مدربك</h2>
                        <div className="space-y-4 max-h-72 overflow-y-auto">
                            {myCompletedSessionsWithNotes.map(session => (
                                <div key={session.id} className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                                    <p className="font-semibold text-green-800">ملاحظات جلسة {formatDate(session.booking_date)} مع المدرب {(session as any).instructors?.name}:</p>
                                    <p className="text-sm text-green-700 mt-2 flex items-start gap-2">
                                        <MessageSquare size={20} className="flex-shrink-0 mt-0.5"/>
                                        <span className="italic">"{session.progress_notes}"</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default StudentDashboardPage;