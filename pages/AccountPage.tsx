

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Download, Edit, LogIn, LogOut, Loader2, UserPlus, BookHeart, Calendar, FileText, MessageSquare, CreditCard, KeyRound } from 'lucide-react';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAdmin } from '../contexts/AdminContext';
import { getStatusColor, formatDate } from '../utils/helpers';
import PaymentModal from '../components/PaymentModal';
import PageLoader from '../components/ui/PageLoader';

type Tab = 'profile' | 'orders' | 'downloads';

type Order = {
    id: string;
    order_date: string;
    status: string;
    total: string;
    admin_comment: string | null;
}

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const { isLoggedIn, currentUser, signOut, loading, updateUserPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showUpdatePasswordForm, setShowUpdatePasswordForm] = useState(false);

  useEffect(() => {
    const checkRecovery = () => {
        const hash = window.location.hash;
        if (hash.includes('type=recovery') && hash.includes('access_token')) {
            setShowUpdatePasswordForm(true);
        }
    }
    checkRecovery();
    
    window.addEventListener('hashchange', checkRecovery);
    return () => window.removeEventListener('hashchange', checkRecovery);

  }, []);

  const handleLogout = async () => {
    addToast('جاري تسجيل الخروج...', 'info');
    await signOut();
    navigate('/');
    addToast('تم تسجيل الخروج بنجاح.', 'success');
  };

  const renderContent = () => {
    if (!currentUser) return null;
    switch (activeTab) {
      case 'profile':
        return <ProfileSection user={currentUser} />;
      case 'orders':
        return <OrdersSection userId={currentUser.id} />;
      case 'downloads':
        return <DownloadsSection userId={currentUser.id} />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tabId: Tab; icon: React.ReactNode; label: string;}> = ({ tabId, icon, label}) => (
      <button
          onClick={() => setActiveTab(tabId)}
          className={`flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition-colors w-full text-right ${activeTab === tabId ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
      >
          {icon}
          <span>{label}</span>
      </button>
  );

  const renderMainContent = () => {
    if (loading) {
      return <PageLoader text="جاري تحميل بيانات حسابك..." />;
    }
    if (showUpdatePasswordForm) {
        return <UpdatePasswordForm onFinished={() => {
            setShowUpdatePasswordForm(false);
            navigate('/account', { replace: true });
        }}/>;
    }
    if (isLoggedIn && currentUser) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white p-4 rounded-2xl shadow-md space-y-2">
                <TabButton tabId="orders" icon={<ShoppingBag size={20}/>} label="طلباتي"/>
                <TabButton tabId="downloads" icon={<Download size={20}/>} label="ملفاتي"/>
                <TabButton tabId="profile" icon={<User size={20}/>} label="الملف الشخصي"/>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition-colors w-full text-right hover:bg-red-50 text-red-600">
                  <LogOut size={20}/>
                  <span>تسجيل الخروج</span>
                </button>
            </div>
          </aside>
          <main className="lg:col-span-3">
            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-md min-h-[400px]">
              {renderContent()}
            </div>
          </main>
        </div>
      );
    }
    return <AuthForm />;
  };

  return (
    <div className="bg-gray-50 py-12 sm:py-16 animate-fadeIn min-h-[60vh]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">حسابي</h1>
         {isLoggedIn && currentUser && !loading && (
            <p className="text-lg text-gray-600 mb-8">أهلاً بعودتك، {currentUser.name?.split(' ')[0]}!</p>
        )}
        {renderMainContent()}
      </div>
    </div>
  );
};

const ProfileSection: React.FC<{ user: UserProfile }> = ({ user }) => {
    const { addToast } = useToast();
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">الملف الشخصي</h2>
                <button onClick={() => addToast('ميزة تعديل الملف الشخصي قيد التطوير حاليًا.', 'info')} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                    <Edit size={16} />
                    <span>تعديل</span>
                </button>
            </div>
            <div className="space-y-4">
                 <div>
                    <label className="text-sm font-bold text-gray-500">الاسم الكامل</label>
                    <p className="text-lg text-gray-800">{user.name}</p>
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-500">البريد الإلكتروني</label>
                    <p className="text-lg text-gray-800">{user.email}</p>
                </div>
            </div>
        </div>
    )
};

const OrdersSection: React.FC<{ userId: string }> = ({ userId }) => {
    const { orders: allOrders, loading: adminLoading } = useAdmin();
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'order' | 'booking' } | null>(null);

    const fetchUserData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Simulate fetching user-specific orders from the context's mock data
            const userOrders = allOrders.filter(o => o.user_id === userId);
            setMyOrders(userOrders.map(o => ({
                id: o.id,
                order_date: o.order_date,
                status: o.status,
                total: o.total || '0',
                admin_comment: o.admin_comment
            })));
        } catch (err: any) {
            console.error("Error fetching user data:", err);
            setError("فشل تحميل بياناتك. يرجى تحديث الصفحة.");
        } finally {
            setLoading(false);
        }
    }, [userId, allOrders]);

    useEffect(() => {
        if (!adminLoading) {
            fetchUserData();
        }
    }, [fetchUserData, adminLoading]);

    const handleOpenPaymentModal = (id: string, type: 'order' | 'booking') => {
        setSelectedItem({ id, type });
        setPaymentModalOpen(true);
    };
    
    const handlePaymentSuccess = () => {
        setPaymentModalOpen(false);
        setSelectedItem(null);
        fetchUserData();
    };

    if (loading || adminLoading) {
        return <PageLoader text="جاري تحميل طلباتك..." />;
    }
    
    if (error) {
        return <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <>
            <PaymentModal 
              isOpen={isPaymentModalOpen}
              onClose={() => setPaymentModalOpen(false)}
              onSuccess={handlePaymentSuccess}
              item={selectedItem}
            />
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">طلباتي</h2>
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><BookHeart size={20} /> طلبات القصص (إنها لك)</h3>
                        {myOrders.length > 0 ? (
                            <div className="overflow-x-auto">
                               <table className="w-full text-right">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="py-2 px-2 sm:px-3 font-semibold text-sm text-gray-600">رقم الطلب</th>
                                            <th className="py-2 px-2 sm:px-3 font-semibold text-sm text-gray-600">الحالة</th>
                                            <th className="py-2 px-2 sm:px-3 font-semibold text-sm text-gray-600">الإجمالي</th>
                                            <th className="py-2 px-2 sm:px-3 font-semibold text-sm text-gray-600">الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myOrders.map(order => (
                                            <React.Fragment key={order.id}>
                                                <tr className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-2 sm:px-3 font-mono text-xs">{order.id}</td>
                                                    <td className="py-3 px-2 sm:px-3"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                                    <td className="py-3 px-2 sm:px-3">{order.total}</td>
                                                    <td className="py-3 px-2 sm:px-3">
                                                        {order.status === 'بانتظار الدفع' && (
                                                            <button onClick={() => handleOpenPaymentModal(order.id, 'order')} className="flex items-center gap-1 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200">
                                                                <CreditCard size={14}/>
                                                                <span>أكمل الدفع</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {order.admin_comment && (
                                                    <tr className="bg-orange-50">
                                                        <td colSpan={4} className="p-3 text-sm text-orange-800">
                                                            <div className="flex items-start gap-2">
                                                                <MessageSquare size={16} className="mt-1 flex-shrink-0" />
                                                                <div>
                                                                    <span className="font-bold">ملاحظة من الإدارة:</span> {order.admin_comment}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                               </table>
                            </div>
                        ) : (
                            <p className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">لا توجد طلبات قصص حاليًا.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};


const DownloadsSection: React.FC<{ userId: string }> = ({ userId }) => {
    const { orders, loading: adminLoading } = useAdmin();
    const [downloadableFiles, setDownloadableFiles] = useState<{ id: string; name: string; url: string; type: 'story' }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(adminLoading) return;

        const fetchFiles = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate fetching from context
                const userOrdersWithFiles = orders
                    .filter(o => o.user_id === userId && o.file_url)
                    .map(o => ({
                        id: o.id,
                        name: `النسخة الإلكترونية من طلب #${o.id.substring(0, 8)}`,
                        url: o.file_url!,
                        type: 'story' as const
                    }));
                setDownloadableFiles(userOrdersWithFiles);
            } catch (err: any) {
                console.error("Error fetching downloadable files:", err);
                setError("فشل تحميل ملفاتك. يرجى تحديث الصفحة.");
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
    }, [userId, orders, adminLoading]);

    if (loading || adminLoading) {
        return <PageLoader text="جاري تحميل ملفاتك..." />;
    }
    
    if (error) {
        return <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ملفاتي للتنزيل</h2>
            {downloadableFiles.length > 0 ? (
                <div className="space-y-4">
                    {downloadableFiles.map(file => (
                        <a 
                            key={file.id} 
                            href={file.url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <BookHeart className="text-blue-500" />
                                <span className="font-semibold text-gray-800">{file.name}</span>
                            </div>
                            <Download className="text-blue-600" />
                        </a>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <Download className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4">لا توجد ملفات جاهزة للتنزيل.</p>
                     <p className="text-sm">عندما يصبح طلبك الرقمي جاهزاً، ستجده هنا.</p>
                </div>
            )}
        </div>
    );
};


const UpdatePasswordForm: React.FC<{onFinished: () => void}> = ({ onFinished }) => {
    const { updateUserPassword } = useAuth();
    const { addToast } = useToast();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await updateUserPassword(password);
            addToast('تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.', 'success');
            onFinished();
        } catch (err: any) {
             setError('فشل تحديث كلمة المرور. قد يكون الرابط غير صالح أو منتهي الصلاحية.');
             console.error('Update password error', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">إعادة تعيين كلمة المرور</h2>
            <p className="text-gray-600 mb-8 text-center">أدخل كلمة المرور الجديدة لحسابك.</p>
            {error && <p className="bg-red-50 text-red-700 p-3 rounded-lg text-center mb-6">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="new-password" className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الجديدة</label>
                    <input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full transition-transform transform hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="animate-spin" size={24}/> : <KeyRound size={24}/>}
                    <span>{loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}</span>
                </button>
            </form>
        </div>
    );
};

const AuthForm: React.FC = () => {
    const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const { addToast } = useToast();
    const { signIn, signUp, signInWithGoogle, resetPasswordForEmail } = useAuth();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                await signUp({ email, password, name });
                addToast('تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.', 'success');
                setMode('signin');
                setPassword('');
            } else if (mode === 'signin') {
                await signIn({ email, password });
                // Successful sign-in will be handled by the context's auth state change listener
            } else if (mode === 'forgot') {
                await resetPasswordForEmail(email);
                setMessage('إذا كان البريد الإلكتروني مسجلاً، فستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور.');
            }
        } catch (err: any) {
             console.error("Auth error:", err);
             if (mode === 'signup' && err.message.includes('already registered')) {
                setError(
                    <>
                        <p className="font-semibold">هذا البريد الإلكتروني مسجل بالفعل.</p>
                        <button type="button" onClick={() => { setError(null); setMode('signin'); }} className="font-bold text-blue-600 hover:underline focus:outline-none mt-2">
                            الانتقال إلى صفحة تسجيل الدخول
                        </button>
                    </>
                );
            } else if (mode === 'signin') {
                 setError(
                    <>
                        <p className="font-semibold">بيانات الدخول غير صحيحة.</p>
                        <button type="button" onClick={() => { setError(null); setMode('forgot'); }} className="font-bold text-blue-600 hover:underline focus:outline-none mt-2">
                           هل نسيت كلمة المرور؟
                        </button>
                    </>
                );
            } else {
                 setError(err.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى.');
            }
        } finally {
             setLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch(err: any) {
             console.error("Google Auth error:", err);
             setError('فشل تسجيل الدخول باستخدام جوجل. الرجاء المحاولة مرة أخرى.');
             setLoading(false);
        }
    }
    
    const getTitle = () => {
        if (mode === 'signup') return 'إنشاء حساب جديد';
        if (mode === 'forgot') return 'إعادة تعيين كلمة المرور';
        return 'تسجيل الدخول';
    }
    
    const getSubtitle = () => {
        if (mode === 'signup') return 'مرحباً بك في رحلتك الجديدة!';
        if (mode === 'forgot') return 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطًا لإعادة التعيين.';
        return 'أهلاً بعودتك!';
    }


    return (
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">{getTitle()}</h2>
            <p className="text-gray-600 mb-8 text-center min-h-[24px]">{getSubtitle()}</p>
            
            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-center mb-6">
                    {error}
                </div>
            )}
            {message && <p className="bg-green-50 text-green-700 p-3 rounded-lg text-center mb-6">{message}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'signup' && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                )}
                 <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                {mode !== 'forgot' && (
                  <div>
                      <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
                      <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                )}
                 {mode === 'signin' && !error && (
                  <div className="text-right">
                    <button type="button" onClick={() => setMode('forgot')} className="text-sm text-blue-600 hover:underline font-semibold">
                       نسيت كلمة المرور؟
                    </button>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full transition-transform transform hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="animate-spin" size={24}/> : (mode === 'signup' ? <UserPlus size={24}/> : mode === 'signin' ? <LogIn size={24}/> : <KeyRound size={24}/>)}
                    <span>{loading ? 'جاري التحميل...' : (mode === 'signup' ? 'إنشاء حساب' : mode === 'signin' ? 'تسجيل الدخول' : 'إرسال رابط التعيين')}</span>
                </button>
            </form>
            
            {mode !== 'forgot' && (
                <>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">أو</span>
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 border rounded-full font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors border-gray-300 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 48 48">
                              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,36.218,44,30.556,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            </svg>
                            <span>الدخول باستخدام جوجل</span>
                        </button>
                    </div>
                </>
            )}
            
            <div className="mt-6 text-center">
                 {mode === 'forgot' ? (
                     <button onClick={() => setMode('signin')} className="text-sm text-blue-600 hover:underline">
                        العودة لتسجيل الدخول
                     </button>
                 ) : (
                     <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-sm text-blue-600 hover:underline">
                         {mode === 'signin' ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'هل لديك حساب بالفعل؟ تسجيل الدخول'}
                     </button>
                 )}
            </div>
        </div>
    );
};

export default AccountPage;
