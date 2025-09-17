import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, FileText, Plus, Edit, Trash, ChevronDown, ShoppingBag, CheckSquare, Star, Gift, Package, Frown, Activity, CalendarCheck, Bell, Sparkles, Zap } from 'lucide-react';
// FIX: Added .tsx extension to resolve module error.
import { useAuth, UserProfile } from '../contexts/AuthContext.tsx';
// FIX: Added .ts extension to database.types import to resolve module error.
import type { ChildProfile } from '../lib/database.types.ts';
// FIX: Added .tsx extension to the import of AdminContext to resolve module loading error.
import { useAdmin, IOrderDetails, Subscription } from '../contexts/AdminContext.tsx';
// FIX: Corrected import path for useCreativeWritingAdmin.
import { useCreativeWritingAdmin, CreativeWritingBooking } from '../contexts/admin/CreativeWritingAdminContext.tsx';
// FIX: Added .ts extension to resolve module error.
import { getStatusColor, formatDate } from '../utils/helpers.ts';
import ChildProfileModal from '../components/order/ChildProfileModal.tsx';
import AuthForm from '../components/auth/AuthForm.tsx';
import DemoLogins from '../components/auth/DemoLogins.tsx';


const NotificationPanel: React.FC = () => (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex items-start gap-4 animate-fadeIn">
        <Bell size={24} className="text-blue-500 flex-shrink-0 mt-1" />
        <div>
            <h3 className="font-bold text-blue-800">تنبيهات هامة</h3>
            <p className="text-sm text-blue-700 mt-1">
                طلب "قصة المغامرة" لطفلك "أحمد" قيد التجهيز الآن! يمكنك متابعة حالته من خلال ملفه الشخصي. <span className="text-xs opacity-70">(هذا تنبيه تجريبي)</span>
            </p>
        </div>
    </div>
);


// Child Card Component
const ChildCard: React.FC<{
    child: ChildProfile;
    orders: IOrderDetails[];
    bookings: CreativeWritingBooking[];
    onEdit: (child: ChildProfile) => void;
    onDelete: (childId: number) => void;
    onPay: (item: { id: string, type: 'order' | 'booking' | 'subscription', total: string | number | null, summary: string | null }) => void;
}> = ({ child, orders, bookings, onEdit, onDelete, onPay }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const childOrders = useMemo(() => orders.filter(o => o.child_id === child.id), [orders, child.id]);
    const childBookings = useMemo(() => bookings.filter(b => b.child_id === child.id), [bookings, child.id]);
    
    const { upcomingSession, lastActivity } = useMemo(() => {
        const now = new Date();

        const futureBookings = bookings
            .filter(b => b.child_id === child.id && b.status === 'مؤكد' && new Date(b.booking_date) >= now)
            .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());
        
        const upcomingSession = futureBookings[0] || null;

        const allItems = [
            ...orders.filter(o => o.child_id === child.id).map(o => ({ ...o, date: o.order_date, type: 'order', summary: o.item_summary })),
            ...bookings.filter(b => b.child_id === child.id).map(b => ({ ...b, date: b.booking_date, type: 'booking', summary: b.package_name }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const lastActivity = allItems[0] || null;

        return { upcomingSession, lastActivity };
    }, [orders, bookings, child.id]);


    return (
        <div className="bg-white rounded-2xl shadow-lg border transition-shadow hover:shadow-xl">
            <div className="p-6">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                            {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"></div>}
                            <img 
                                src={child.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                                alt={child.name} 
                                className={`w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                loading="lazy"
                                onLoad={() => setImageLoaded(true)}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{child.name}</h3>
                            <p className="text-sm text-gray-500">{child.age} سنوات</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => onEdit(child)} className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100" aria-label={`تعديل ملف ${child.name}`}><Edit size={18}/></button>
                        <button onClick={() => onDelete(child.id)} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100" aria-label={`حذف ملف ${child.name}`}><Trash size={18}/></button>
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100" aria-label={`عرض تفاصيل ${child.name}`}>
                            <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                 <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                        <CalendarCheck size={16} className="text-purple-500 flex-shrink-0" />
                        <span className="font-semibold">الجلسة القادمة:</span>
                        {upcomingSession ? (
                            <span className="font-bold text-gray-800">{formatDate(upcomingSession.booking_date)} مع المدرب {(upcomingSession as any).instructors?.name}</span>
                        ) : (
                            <span className="text-gray-500">لا يوجد جلسات قادمة محجوزة</span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                        <Activity size={16} className="text-blue-500 flex-shrink-0" />
                        <span className="font-semibold">آخر نشاط:</span>
                        {lastActivity ? (
                            <span className="font-bold text-gray-800">
                                {lastActivity.summary}
                                (<span className={`font-mono text-xs px-1 rounded`}>{lastActivity.status}</span>)
                            </span>
                        ) : (
                            <span className="text-gray-500">لا توجد أنشطة مسجلة</span>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t p-6 bg-gray-50/50">
                    <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold flex items-center gap-2 text-gray-700 mb-2"><Sparkles size={16}/> اهتمامات الطفل</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(child.interests && child.interests.length > 0) ? child.interests.map(interest => (
                                        <span key={interest} className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-1 rounded-full">{interest}</span>
                                    )) : <p className="text-sm text-gray-500">لم تضف اهتمامات بعد.</p>}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-bold flex items-center gap-2 text-gray-700 mb-2"><Zap size={16}/> نقاط القوة</h4>
                                 <div className="flex flex-wrap gap-2">
                                    {(child.strengths && child.strengths.length > 0) ? child.strengths.map(strength => (
                                        <span key={strength} className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-1 rounded-full">{strength}</span>
                                    )) : <p className="text-sm text-gray-500">لم تضف نقاط قوة بعد.</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold flex items-center gap-2 text-gray-700 mb-2"><ShoppingBag size={16}/> طلبات "إنها لك"</h4>
                            {childOrders.length > 0 ? (
                                <div className="space-y-2">
                                    {childOrders.map(o => (
                                        <div key={o.id} className="text-sm p-3 bg-white rounded-lg border flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{o.item_summary}</p>
                                                <p className="text-xs text-gray-500">رقم الطلب: {o.id}</p>
                                            </div>
                                            <div className="text-left">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(o.status)}`}>{o.status}</span>
                                                {o.status === 'بانتظار الدفع' && <button onClick={() => onPay({ id: o.id, type: 'order', total: o.total, summary: o.item_summary })} className="mt-1 text-xs text-blue-600 font-bold hover:underline block">إتمام الدفع</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-gray-500 bg-white p-3 rounded-lg border">لا توجد طلبات لهذا الطفل.</p>}
                        </div>
                        <div>
                             <h4 className="font-bold flex items-center gap-2 text-gray-700 mb-2 pt-4 border-t"><CheckSquare size={16}/> حجوزات "بداية الرحلة"</h4>
                             {childBookings.length > 0 ? (
                                <div className="space-y-2">
                                    {childBookings.map(b => (
                                        <div key={b.id} className="text-sm p-3 bg-white rounded-lg border flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{b.package_name}</p>
                                                <p className="text-xs text-gray-500">رقم الحجز: {b.id}</p>
                                            </div>
                                            <div className="text-left">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(b.status)}`}>{b.status}</span>
                                                {b.status === 'بانتظار الدفع' && <button onClick={() => onPay({ id: b.id, type: 'booking', total: b.total, summary: b.package_name })} className="mt-1 text-xs text-blue-600 font-bold hover:underline block">إتمام الدفع</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-gray-500 bg-white p-3 rounded-lg border">لا توجد حجوزات لهذا الطفل.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


// Main Account Page Component
const AccountPage: React.FC = () => {
    const { isLoggedIn, currentUser, signOut, childProfiles, deleteChildProfile } = useAuth();
    const { orders, subscriptions } = useAdmin();
    const { creativeWritingBookings } = useCreativeWritingAdmin();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('family');
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const [childToEdit, setChildToEdit] = useState<ChildProfile | null>(null);

    // FIX: Memoize user-specific data before any potential early returns to ensure consistent hook calls.
    const userOrders = useMemo(() => {
        if (!currentUser) return [];
        return orders.filter(o => o.user_id === currentUser.id);
    }, [orders, currentUser]);

    const userBookings = useMemo(() => {
        if (!currentUser) return [];
        return creativeWritingBookings.filter(b => b.user_id === currentUser.id);
    }, [creativeWritingBookings, currentUser]);

    const userSubscriptions = useMemo(() => {
        if (!currentUser) return [];
        return subscriptions.filter(s => s.user_id === currentUser.id);
    }, [subscriptions, currentUser]);
    
    const unifiedItems = useMemo(() => [
        ...userOrders.map(o => ({
            id: o.id,
            type: 'order' as const,
            date: o.order_date,
            summary: o.item_summary,
            total: o.total,
            status: o.status,
            details: null,
        })),
        ...userBookings.map(b => ({
            id: b.id,
            type: 'booking' as const,
            date: b.booking_date,
            summary: b.package_name,
            total: `${b.total} ج.م`,
            status: b.status,
            details: `مع المدرب: ${b.instructors?.name || 'غير محدد'}`,
        })),
        ...userSubscriptions
            .filter(s => s.status === 'pending_payment')
            .map(s => ({
                id: s.id,
                type: 'subscription' as const,
                date: s.start_date,
                summary: `اشتراك سنوي لصندوق الرحلة (${s.child_name})`,
                total: `${s.price} ج.م`,
                status: 'بانتظار الدفع' as const,
                details: null
            }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [userOrders, userBookings, userSubscriptions]);

    if (!isLoggedIn || !currentUser) {
        return (
            <div className="bg-gray-50 py-16 sm:py-20">
                <div className="container mx-auto px-4">
                    <AuthForm />
                    <DemoLogins />
                </div>
            </div>
        );
    }

    const handleEditChild = (child: ChildProfile) => {
        setChildToEdit(child);
        setIsChildModalOpen(true);
    };

    const handleDeleteChild = async (childId: number) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف ملف هذا الطفل؟')) {
           await deleteChildProfile(childId);
        }
    };
    
    const openPaymentPage = (item: { id: string, type: 'order' | 'booking' | 'subscription', total: string | number | null, summary: string | null }) => {
        navigate('/checkout', { state: { item } });
    };

    const tabs = [
        { key: 'family', label: 'عائلتي', icon: <Heart size={18} /> },
        { key: 'orders', label: 'طلباتي', icon: <ShoppingBag size={18} /> },
        { key: 'subscriptions', label: 'اشتراكاتي', icon: <Star size={18} /> },
        { key: 'profile', label: 'ملفي الشخصي', icon: <User size={18} /> },
    ];

    return (
        <>
            <ChildProfileModal isOpen={isChildModalOpen} onClose={() => setIsChildModalOpen(false)} childToEdit={childToEdit} />
            <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-blue-600">المركز العائلي</h1>
                        <p className="mt-2 text-lg text-gray-600">مرحباً بعودتك، {currentUser.name}!</p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8 border-b border-gray-200">
                            <nav className="-mb-px flex justify-center space-x-6 rtl:space-x-reverse" aria-label="Tabs">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div>
                            {activeTab === 'family' && (
                                <div className="space-y-8">
                                    <NotificationPanel />
                                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-md">
                                        <h2 className="text-2xl font-bold">ملفات أطفالي</h2>
                                        <button onClick={() => { setChildToEdit(null); setIsChildModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105"><Plus size={16}/> إضافة طفل</button>
                                    </div>
                                    <div className="space-y-6">
                                        {childProfiles.map(child => (
                                            <ChildCard 
                                                key={child.id} 
                                                child={child}
                                                orders={userOrders}
                                                bookings={userBookings}
                                                onEdit={handleEditChild}
                                                onDelete={handleDeleteChild}
                                                onPay={openPaymentPage}
                                            />
                                        ))}
                                         {childProfiles.length === 0 && (
                                            <p className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-md">
                                                لم تقم بإضافة أي أطفال بعد.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'orders' && (
                                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-6">
                                    <h2 className="text-2xl font-bold mb-4">كل الطلبات والحجوزات</h2>
                                    {unifiedItems.length > 0 ? (
                                        unifiedItems.map(item => (
                                            <div key={`${item.type}-${item.id}`} className="p-4 border rounded-lg bg-gray-50/70 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-3">
                                                        {item.type === 'order' ? <ShoppingBag className="text-blue-500"/> : item.type === 'subscription' ? <Star className="text-orange-500" /> : <CheckSquare className="text-purple-500"/>}
                                                        <p className="font-bold text-lg text-gray-800">
                                                            {item.type === 'order' ? 'طلبية' : item.type === 'subscription' ? 'اشتراك' : 'حجز'}: <span className="font-mono text-sm">{item.id}</span>
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2 ms-9">{item.summary}</p>
                                                    {item.details && <p className="text-sm text-gray-500 ms-9">{item.details}</p>}
                                                </div>
                                                <div className="flex-shrink-0 w-full sm:w-auto text-center sm:text-left">
                                                    <p className="text-sm text-gray-500 mb-1">{formatDate(item.date)}</p>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                                                    <p className="font-bold text-lg mt-2">{item.total}</p>
                                                </div>
                                                 {item.status === 'بانتظار الدفع' && (
                                                    <button onClick={() => openPaymentPage({ id: item.id, type: item.type, total: item.total, summary: item.summary })} className="w-full sm:w-auto flex-shrink-0 bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition-transform transform hover:scale-105">
                                                        إتمام الدفع
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-16">
                                            <Frown className="mx-auto h-16 w-16 text-gray-400" />
                                            <h3 className="mt-4 text-lg font-semibold text-gray-800">لا يوجد شيء هنا بعد</h3>
                                            <p className="mt-1 text-gray-500">لم تقم بأي طلبات أو حجوزات حتى الآن.</p>
                                            <div className="mt-6 flex justify-center gap-4">
                                                <Link to="/enha-lak/store" className="px-5 py-2 border border-blue-600 text-base font-medium rounded-full text-blue-600 bg-white hover:bg-blue-50">
                                                    تصفح متجر "إنها لك"
                                                </Link>
                                                 <Link to="/creative-writing/booking" className="px-5 py-2 border border-purple-600 text-base font-medium rounded-full text-purple-600 bg-white hover:bg-purple-50">
                                                    احجز جلسة "بداية الرحلة"
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                             {activeTab === 'subscriptions' && (
                                <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
                                    <h2 className="text-2xl font-bold mb-4">صندوق الرحلة الشهري</h2>
                                    {userSubscriptions.filter(s => s.status === 'active').length > 0 ? (
                                        userSubscriptions.filter(s => s.status === 'active').map(sub => (
                                            <div key={sub.id} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                                                <div className="flex items-center gap-3">
                                                    <Gift className="text-orange-500" />
                                                    <p className="font-bold text-lg text-gray-800">اشتراك نشط للطفل: {sub.child_name}</p>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">تاريخ التجديد القادم: <span className="font-semibold">{formatDate(sub.next_renewal_date)}</span></p>
                                                <div className="mt-4">
                                                    <button className="text-sm text-gray-500 hover:underline">إدارة الاشتراك</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500 mb-4">ليس لديك أي اشتراكات نشطة حاليًا.</p>
                                            <Link to="/enha-lak/subscription" className="text-blue-600 font-bold hover:underline">اكتشف صندوق الرحلة الشهري</Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="bg-white p-8 rounded-2xl shadow-lg">
                                    <h2 className="text-2xl font-bold mb-4">ملفي الشخصي</h2>
                                    <p><span className="font-semibold">الاسم:</span> {currentUser.name}</p>
                                    <p><span className="font-semibold">البريد الإلكتروني:</span> {currentUser.email}</p>
                                    <button onClick={signOut} className="mt-6 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">تسجيل الخروج</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountPage;