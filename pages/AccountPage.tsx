import React, { useState } from 'react';
import { User, Heart, FileText, Plus, Edit, Trash } from 'lucide-react';
// FIX: Added .tsx extension to resolve module error.
import { useAuth, UserProfile } from '../contexts/AuthContext.tsx';
// FIX: Import ChildProfile from its source to resolve module export error.
import type { ChildProfile } from '../lib/database.types';
import { useAdmin, IOrderDetails } from '../contexts/AdminContext';
import { useCreativeWritingAdmin, CreativeWritingBooking } from '../contexts/admin/CreativeWritingAdminContext';
import { getStatusColor } from '../utils/helpers';
import ChildProfileModal from '../components/order/ChildProfileModal';
import PaymentModal from '../components/PaymentModal';

// Components for Auth (Login/Signup)
const AuthForm: React.FC = () => {
    // A simplified form
    const { signIn, signUp, loading, error } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            signIn(email, password);
        } else {
            signUp(email, password, name);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label className="block text-sm font-bold mb-2">الاسم</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2">كلمة المرور</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                    {loading ? 'جاري...' : (isLogin ? 'دخول' : 'إنشاء حساب')}
                </button>
            </form>
            <p className="text-center mt-4 text-sm">
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline font-semibold ms-2">
                    {isLogin ? 'أنشئ حسابًا' : 'سجل الدخول'}
                </button>
            </p>
        </div>
    );
};

const DemoLogins: React.FC = () => {
    const { signInAsDemoUser } = useAuth();

    const roles: { role: Exclude<UserProfile['role'], 'student'>; label: string }[] = [
        { role: 'super_admin', label: 'مدير عام' },
        { role: 'enha_lak_supervisor', label: 'مشرف "إنها لك"' },
        { role: 'creative_writing_supervisor', label: 'مشرف "بداية الرحلة"' },
        { role: 'instructor', label: 'مدرب' },
        { role: 'user', label: 'مستخدم عادي' },
    ];

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg mt-8 border-t-4 border-blue-100">
            <h3 className="text-lg font-bold text-center text-gray-700 mb-4">تسجيل الدخول السريع (للتجربة)</h3>
            <div className="grid grid-cols-1 gap-3">
                {roles.map(({ role, label }) => (
                    <button
                        key={role}
                        onClick={() => signInAsDemoUser(role)}
                        className="w-full bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        الدخول كـ {label}
                    </button>
                ))}
            </div>
        </div>
    );
};


// Main Account Page Component
const AccountPage: React.FC = () => {
    const { isLoggedIn, currentUser, signOut, childProfiles, deleteChildProfile } = useAuth();
    const { orders } = useAdmin();
    const { creativeWritingBookings } = useCreativeWritingAdmin();

    const [activeTab, setActiveTab] = useState('orders');
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const [childToEdit, setChildToEdit] = useState<ChildProfile | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [itemToPay, setItemToPay] = useState<{ id: string; type: 'order' | 'booking' } | null>(null);

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
    
    const userOrders = orders.filter(o => o.user_id === currentUser.id);
    const userBookings = creativeWritingBookings.filter(b => b.user_id === currentUser.id);

    const handleEditChild = (child: ChildProfile) => {
        setChildToEdit(child);
        setIsChildModalOpen(true);
    };

    const handleDeleteChild = async (childId: number) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف ملف هذا الطفل؟')) {
           await deleteChildProfile(childId);
        }
    };
    
    const openPaymentModal = (item: { id: string, type: 'order' | 'booking' }) => {
        setItemToPay(item);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        setItemToPay(null);
        // Data will be re-fetched by context
    };

    const tabs = [
        { key: 'orders', label: 'طلباتي', icon: <FileText size={18} /> },
        { key: 'children', label: 'ملفات أطفالي', icon: <Heart size={18} /> },
        { key: 'profile', label: 'ملفي الشخصي', icon: <User size={18} /> },
    ];

    return (
        <>
            <ChildProfileModal isOpen={isChildModalOpen} onClose={() => setIsChildModalOpen(false)} childToEdit={childToEdit} />
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} item={itemToPay} onSuccess={handlePaymentSuccess} />
            <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-blue-600">صفحة حسابي</h1>
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

                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            {activeTab === 'orders' && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-4">طلبات "إنها لك"</h2>
                                    {userOrders.length > 0 ? userOrders.map(o => (
                                        <div key={o.id} className="border-b py-4">
                                            <p>رقم الطلب: {o.id}</p>
                                            <p>الحالة: <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(o.status)}`}>{o.status}</span></p>
                                            {o.status === 'بانتظار الدفع' && <button onClick={() => openPaymentModal({ id: o.id, type: 'order' })} className="text-blue-600">إتمام الدفع</button>}
                                        </div>
                                    )) : <p>لا توجد طلبات.</p>}

                                     <h2 className="text-2xl font-bold mb-4 mt-8">حجوزات "بداية الرحلة"</h2>
                                     {userBookings.length > 0 ? userBookings.map(b => (
                                        <div key={b.id} className="border-b py-4">
                                            <p>رقم الحجز: {b.id}</p>
                                            <p>الحالة: <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(b.status)}`}>{b.status}</span></p>
                                            {b.status === 'بانتظار الدفع' && <button onClick={() => openPaymentModal({ id: b.id, type: 'booking' })} className="text-blue-600">إتمام الدفع</button>}
                                        </div>
                                    )) : <p>لا توجد حجوزات.</p>}
                                </div>
                            )}

                            {activeTab === 'children' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold">ملفات أطفالي</h2>
                                        <button onClick={() => { setChildToEdit(null); setIsChildModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full"><Plus size={16}/> إضافة طفل</button>
                                    </div>
                                    {childProfiles.map(child => (
                                        <div key={child.id} className="flex justify-between items-center border-b p-4">
                                            <p>{child.name} - {child.age} سنوات</p>
                                            <div>
                                                <button onClick={() => handleEditChild(child)} className="text-gray-500 hover:text-blue-600 p-2"><Edit size={18}/></button>
                                                <button onClick={() => handleDeleteChild(child.id)} className="text-gray-500 hover:text-red-600 p-2"><Trash size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-4">ملفي الشخصي</h2>
                                    <p>الاسم: {currentUser.name}</p>
                                    <p>البريد: {currentUser.email}</p>
                                    <button onClick={signOut} className="mt-6 bg-red-500 text-white py-2 px-4 rounded-lg">تسجيل الخروج</button>
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