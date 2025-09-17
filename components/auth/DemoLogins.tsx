import React from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Shield, User, Feather, Gift, BookHeart, GraduationCap, FileText, MessageSquare } from 'lucide-react';

const DemoLogins: React.FC = () => {
    const { signIn, loading } = useAuth();
    const DEMO_PASSWORD = '123456'; // The user should set this password for all demo accounts in Supabase.

    const demoAccounts = [
        { email: 'admin@alrehlah.com', label: 'الدخول كـ مدير عام', icon: <Shield size={18} />, color: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400' },
        { email: 'enhalak@alrehlah.com', label: 'الدخول كـ مشرف "إنها لك"', icon: <Gift size={18} />, color: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400' },
        { email: 'cw@alrehlah.com', label: 'الدخول كـ مشرف "بداية الرحلة"', icon: <Feather size={18} />, color: 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400' },
        { email: 'content@alrehlah.com', label: 'الدخول كـ محرر محتوى', icon: <FileText size={18} />, color: 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400' },
        { email: 'support@alrehlah.com', label: 'الدخول كـ وكيل دعم', icon: <MessageSquare size={18} />, color: 'bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400' },
        { email: 'instructor@alrehlah.com', label: 'الدخول كـ مدرب', icon: <BookHeart size={18} />, color: 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400' },
        { email: 'user@alrehlah.com', label: 'الدخول كـ ولي أمر', icon: <User size={18} />, color: 'bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400' },
        { email: 'student@alrehlah.com', label: 'الدخول كـ طالب', icon: <GraduationCap size={18} />, color: 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400' },
    ];

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-gray-100 rounded-2xl border">
            <h3 className="text-center font-bold text-gray-700 mb-4">أو جرب المنصة باستخدام حساب تجريبي:</h3>
            <div className="space-y-3">
                {demoAccounts.map(account => (
                    <button
                        key={account.email}
                        onClick={() => signIn(account.email, DEMO_PASSWORD)}
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 text-white font-bold py-2 px-4 rounded-lg transition-colors ${account.color}`}
                    >
                        {account.icon}
                        <span>{account.label}</span>
                    </button>
                ))}
            </div>
             <p className="text-center text-xs text-gray-500 mt-4">ملاحظة: يرجى التأكد من إنشاء هذه الحسابات في قاعدة البيانات بنفس كلمة المرور (مثلاً: 123456).</p>
        </div>
    );
};

export default DemoLogins;