
import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';

const StudentLoginPage: React.FC = () => {
    const { signInAsDemoUser, loading } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
                <img src="https://i.ibb.co/bF9gYq2/Bidayat-Alrehla-Logo.png" alt="شعار بداية الرحلة" className="mx-auto h-24 w-auto mb-6"/>
                <h1 className="text-2xl font-bold text-gray-800">بوابة الطالب</h1>
                <p className="text-gray-600 mt-2 mb-8">
                    أهلاً بك في مساحتك الإبداعية!
                </p>
                <div className="space-y-4">
                    {/* In a real app, this would be a form with username/password */}
                    <button
                        onClick={() => signInAsDemoUser('student')}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                        {loading ? 'جاري الدخول...' : 'الدخول كـ طالب (تجريبي)'}
                    </button>
                </div>
                 <p className="text-xs text-gray-500 mt-6">
                    هذه الصفحة مخصصة للطلاب فقط. لصفحة أولياء الأمور، يرجى زيارة <a href="#/account" className="text-blue-600 hover:underline">صفحة الحساب</a>.
                </p>
            </div>
        </div>
    );
}

export default StudentLoginPage;
