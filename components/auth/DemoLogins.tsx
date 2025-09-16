import React from 'react';
import { useAuth, UserProfile } from '../../contexts/AuthContext.tsx';

const DemoLogins: React.FC = () => {
    const { signInAsDemoUser } = useAuth();

    const roles: { role: UserProfile['role']; label: string }[] = [
        { role: 'super_admin', label: 'مدير عام' },
        { role: 'enha_lak_supervisor', label: 'مشرف "إنها لك"' },
        { role: 'creative_writing_supervisor', label: 'مشرف "بداية الرحلة"' },
        { role: 'instructor', label: 'مدرب' },
        { role: 'user', label: 'ولي أمر' },
        { role: 'student', label: 'طالب' },
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

export default DemoLogins;
