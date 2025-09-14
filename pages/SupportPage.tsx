import React, { useState } from 'react';
import { Mail, HelpCircle, Phone, Send, ChevronDown } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';

const AccordionItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full py-5 text-right"
            >
                <span className="font-semibold text-lg text-gray-800">{question}</span>
                <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-blue-500' : ''}`} />
            </button>
            <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="pt-2 pb-4 pr-4 text-gray-600 leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const faqData = [
    {
        category: 'مشروع "إنها لك"',
        items: [
            {
                q: 'كيف تتم عملية تخصيص القصة؟',
                a: 'بعد اختيارك "القصة المخصصة" من صفحة الطلب، ستقوم بملء بيانات طفلك مثل الاسم والعمر، ورفع صوره. يقوم فريقنا من الكتاب والرسامين باستخدام هذه المعلومات لتأليف ورسم قصة فريدة يكون فيها طفلك هو البطل.'
            },
            {
                q: 'كم من الوقت يستغرق تجهيز الطلب؟',
                a: 'لأن كل قصة تصنع بحب وعناية من البداية، فإنها تحتاج من 5 إلى 7 أيام عمل لتكون جاهزة للشحن أو للتسليم الإلكتروني.'
            },
            {
                q: 'ما الفرق بين النسخة المطبوعة والإلكترونية؟',
                a: 'النسخة المطبوعة هي كتاب مقوى بجودة عالية يصلك إلى عنوانك. النسخة الإلكترونية هي ملف PDF عالي الجودة يمكنك تحميله وقراءته على أي جهاز، وهو خيار رائع للمقيمين خارج مصر.'
            }
        ]
    },
    {
        category: 'أسئلة عامة',
        items: [
            {
                q: 'ما هي طرق الدفع المتاحة؟',
                a: 'نقبل حاليًا الدفع عبر التحويل البنكي، المحافظ الإلكترونية (مثل فودافون كاش)، وبطاقات الائتمان. ستجد كل التفاصيل عند إتمام الطلب.'
            },
            {
                q: 'هل تقومون بالشحن خارج مصر؟',
                a: 'حاليًا، الشحن للمنتجات المطبوعة متاح داخل جمهورية مصر العربية فقط. للمتواجدين خارج مصر، نوصي باختيار النسخة الإلكترونية من منتجاتنا.'
            }
        ]
    }
];

const supportContent = {
    title: 'الدعم والمساعدة',
    subtitle: 'نحن هنا لمساعدتك. تواصل معنا لأي استفسار أو تصفح الأسئلة الشائعة أدناه.',
    contact_email: 'support@alrehlah.com',
    contact_phone: '+20 100 200 3000',
};

const SupportPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createSupportTicket } = useAdmin();
  const { addToast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as { name: string; email: string; subject: string; message: string; };

    try {
        await createSupportTicket(data);
        addToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
        e.currentTarget.reset();
    } catch (error: any) {
        addToast(`حدث خطأ: ${error.message}`, 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-16 sm:py-20 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">{supportContent.title}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">{supportContent.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-3 bg-gray-50 p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">أرسل لنا رسالة</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">الاسم</label>
                <input type="text" name="name" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
                <input type="email" name="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">الموضوع</label>
                <input type="text" name="subject" id="subject" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">رسالتك</label>
                <textarea id="message" name="message" rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed">
                <Send size={18} />
                <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال'}</span>
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 space-y-8 mt-4 md:mt-0">
            <h3 className="text-2xl font-bold text-gray-800">طرق تواصل أخرى</h3>
                <>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full flex-shrink-0">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700">البريد الإلكتروني</h4>
                            <a href={`mailto:${supportContent.contact_email}`} className="text-gray-600 hover:text-blue-500 break-all">{supportContent.contact_email}</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-full flex-shrink-0">
                            <Phone size={24} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700">الهاتف</h4>
                            <p className="text-gray-600" dir="ltr">{supportContent.contact_phone}</p>
                        </div>
                    </div>
                </>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">الأسئلة الشائعة</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              هل لديك سؤال؟ لقد أجبنا على أكثر الاستفسارات شيوعًا هنا.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            {faqData.map(section => (
              <div key={section.category} className="mb-10">
                <h3 className="text-2xl font-bold text-blue-600 mb-4 pb-2 border-b-2 border-blue-100">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map(item => (
                    <AccordionItem key={item.q} question={item.q}>
                      <p>{item.a}</p>
                    </AccordionItem>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportPage;