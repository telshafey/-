import React, { useState } from 'react';
import { Database, Link, Loader2 } from 'lucide-react';
import { saveSupabaseCredentials } from '../../lib/supabaseClient.ts';

const SupabaseSetup: React.FC = () => {
    const [url, setUrl] = useState('');
    const [anonKey, setAnonKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim() || !anonKey.trim()) {
            alert('Please fill in both fields.');
            return;
        }
        setIsSaving(true);
        // This function saves to localStorage and reloads the page
        saveSupabaseCredentials(url, anonKey);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg animate-fadeIn">
                <div className="text-center">
                    <img src="https://i.ibb.co/C0bSJJT/favicon.png" alt="شعار الرحلة" className="mx-auto h-20 w-auto mb-4"/>
                    <h1 className="text-3xl font-extrabold text-gray-800">إعداد الاتصال</h1>
                    <p className="mt-2 text-gray-600">
                        مرحباً بك في منصة الرحلة! لتشغيل التطبيق، يرجى ربطه بقاعدة بيانات Supabase الخاصة بك.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="supabaseUrl" className="block text-sm font-bold text-gray-700 mb-2">
                            Supabase Project URL
                        </label>
                        <input
                            type="url"
                            id="supabaseUrl"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://<your-project-ref>.supabase.co"
                            required
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="supabaseKey" className="block text-sm font-bold text-gray-700 mb-2">
                            Supabase Anon Key
                        </label>
                        <input
                            type="text"
                            id="supabaseKey"
                            value={anonKey}
                            onChange={(e) => setAnonKey(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="eyJhbGciOi..."
                            required
                            disabled={isSaving}
                        />
                    </div>

                     <a href="https://supabase.com/dashboard/project/_/settings/api" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-2">
                        <Link size={14} />
                        <span>أين أجد هذه البيانات؟ (اذهب إلى Settings &gt; API في مشروعك)</span>
                    </a>

                    <div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        >
                            {isSaving ? <Loader2 className="animate-spin" /> : <Database />}
                            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ والاتصال'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupabaseSetup;
