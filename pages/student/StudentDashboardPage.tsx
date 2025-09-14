
import React from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useCreativeWritingAdmin } from '../../contexts/admin/CreativeWritingAdminContext.tsx';
import PageLoader from '../../components/ui/PageLoader.tsx';
import { Video, Calendar, Clock, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboardPage: React.FC = () => {
    const { currentUser, signOut } = useAuth();
    const { creativeWritingBookings, loading } = useCreativeWritingAdmin();

    if (loading || !currentUser) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }

    const myUpcomingSessions = creativeWritingBookings.filter(
        b => b.user_id === currentUser.id && b.status === 'مؤكد' && new Date(b.booking_date) >= new Date(new Date().setDate(new Date().getDate() - 1))
    ).sort((a,b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                 <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">أهلاً بك، {currentUser.name.split(' ')[0]}!</h1>
                        <p className="text-gray-600">هنا يمكنك رؤية جلساتك القادمة.</p>
                    </div>
                     <button onClick={signOut} className="flex items-center gap-2 text-sm text-gray-600 bg-white border px-3 py-2 rounded-full hover:bg-gray-100">
                        <LogOut size={16}/>
                        <span>تسجيل الخروج</span>
                    </button>
                </header>

                <div className="bg-white p-6 rounded-2xl shadow-lg border">
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
                                    <Link 
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
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-12 text-gray-500">لا توجد لديك جلسات قادمة. سيتم عرضها هنا عند تأكيدها.</p>
                    )}
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 text-center">
                    <p>إذا واجهتك أي مشكلة، يرجى الطلب من ولي الأمر التواصل معنا عبر صفحة الدعم والمساعدة.</p>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboardPage;
