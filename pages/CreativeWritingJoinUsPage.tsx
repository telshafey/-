import React, { useState } from 'react';
import { Send, Feather, Users, BrainCircuit, HeartHandshake } from 'lucide-react';
import { useCommunication } from '../contexts/admin/CommunicationContext';
import { useToast } from '../contexts/ToastContext';

const OpportunityCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center h-full flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4 mx-auto">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-600 flex-grow">{description}</p>
    </div>
);

const opportunities = [
    {
        icon: <Feather size={32} />,
        title: "مدربون متخصصون",
        description: "نبحث عن مدربين لديهم خبرة في الكتابة الإبداعية والتعامل مع الأطفال والشباب لإلهام الجيل القادم."
    },
    {
        icon: <BrainCircuit size={32} />,
        title: "خبراء مناهج",
        description: "للمساعدة في تطوير وتحديث محتوانا التعليمي ليتناسب مع مختلف الفئات العمرية والاحتياجات."
    },
    {
        icon: <Users size={32} />,
        title: "شركاء تعليميون",
        description: "نرحب بالتعاون مع المدارس والمراكز التعليمية والمبادرات التي تشاركنا رؤيتنا في تنمية المواهب الشابة."
    },
    {
        icon: <HeartHandshake size={32} />,
        title: "متطوعون",
        description: "نؤمن بقوة المجتمع، ونفتح الباب للمتطوعين للمساهمة في تنظيم الفعاليات أو تقديم الدعم التقني."
    }
];

const CreativeWritingJoinUsPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createJoinRequest } = useCommunication();
  const { addToast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
        name: formData.get('fullName') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as string,
        portfolio_url: formData.get('portfolio') as string || null,
        message: formData.get('message') as string,
    };

    try {
        await createJoinRequest(data);
        addToast('تم إرسال طلبك بنجاح! سنراجعه ونتواصل معك.', 'success');
        e.currentTarget.reset();
    } catch (error: any) {
        addToast(`حدث خطأ: ${error.message}`, 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">انضم إلى فريق "بداية الرحلة"</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              هل أنت مدرب متخصص، خبير تربوي، أو شغوف بتعليم الأطفال؟ نبحث عن مواهب مثلك للانضمام لبرنامجنا.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">فرص التعاون المتاحة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {opportunities.map(op => (
                    <OpportunityCard key={op.title} icon={op.icon} title={op.title} description={op.description} />
                ))}
            </div>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">استمارة التقديم</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل*</label>
                  <input type="text" id="fullName" name="fullName" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني*</label>
                  <input type="email" id="email" name="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-bold text-gray-700 mb-2">أنا مهتم بالانضمام كـ*</label>
                <select id="role" name="role" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" required>
                  <option>مدرب كتابة إبداعية</option>
                  <option>خبير مناهج</option>
                  <option>شريك تعليمي</option>
                  <option>متطوع</option>
                  <option>أخرى</option>
                </select>
              </div>
              <div>
                <label htmlFor="portfolio" className="block text-sm font-bold text-gray-700 mb-2">رابط معرض الأعمال (Portfolio) أو السيرة الذاتية</label>
                <input type="url" id="portfolio" name="portfolio" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="https://example.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">حدثنا عن خبراتك ولماذا تريد الانضمام إلينا*</label>
                <textarea id="message" name="message" rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed">
                <Send size={18} />
                <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeWritingJoinUsPage;