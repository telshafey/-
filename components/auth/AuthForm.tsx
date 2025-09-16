import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';

export const AuthForm: React.FC = () => {
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

export default AuthForm;
