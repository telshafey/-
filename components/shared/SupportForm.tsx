
import React from 'react';
import { Send, Loader2 } from 'lucide-react';

interface SupportFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  subjectOptions: string[];
}

const SupportForm: React.FC<SupportFormProps> = ({ onSubmit, isSubmitting, subjectOptions }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">الاسم</label>
          <input type="text" name="name" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
          <input type="email" name="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">الموضوع</label>
        <select name="subject" id="subject" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" required>
            {subjectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">رسالتك</label>
        <textarea id="message" name="message" rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required></textarea>
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed">
        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال'}</span>
      </button>
    </form>
  );
};

export default SupportForm;