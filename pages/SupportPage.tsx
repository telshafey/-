
import React, { useState } from 'react';
import { Mail, HelpCircle, Phone } from 'lucide-react';
import { useCommunication } from '../contexts/admin/CommunicationContext';
import { useToast } from '../contexts/ToastContext';
import SupportForm from '../components/shared/SupportForm';
import FAQSection from '../components/shared/FAQSection';

const faqData = [
    {
        category: 'منتجات "إنها لك"',
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
                q: 'ما هي الأعمار المناسبة للقصص؟',
                a: 'قصصنا مصممة بشكل أساسي للأطفال في الفئة العمرية من 3 إلى 9 سنوات. يتم تكييف مستوى اللغة والمحتوى التربوي ليتناسب مع عمر الطفل الذي تحدده عند الطلب.'
            },
            {
                q: 'هل يمكنني معاينة القصة قبل الطباعة؟',
                a: 'حاليًا، لا نوفر خيار المعاينة المسبقة لضمان سير عملية الإنتاج بكفاءة. لكننا نثق في فريقنا من المبدعين والخبراء التربويين لتقديم عمل يفوق توقعاتك. إذا واجهتك أي مشكلة، فريق الدعم لدينا جاهز للمساعدة.'
            }
        ]
    },
    {
        category: 'برنامج "بداية الرحلة"',
        items: [
            {
                q: 'كيف تتم الجلسات التعليمية؟',
                a: 'تتم الجلسات بشكل فردي ومباشر (واحد لواحد) بين المدرب والطالب عبر منصة فيديو آمنة وسهلة الاستخدام. مدة كل جلسة 45 دقيقة.'
            },
            {
                q: 'هل يمكنني اختيار مدرب معين؟',
                a: 'نعم بالتأكيد! يمكنك تصفح الملفات الشخصية لمدربينا من صفحة "المدربون" واختيار المدرب الذي تفضله عند حجز باقتك.'
            },
            {
                q: 'ما هي المنصة المستخدمة للجلسات؟',
                a: 'نستخدم منصة Jitsi Meet الآمنة والمفتوحة المصدر لإجراء الجلسات المباشرة. لا تتطلب أي برامج معقدة ويمكن الوصول إليها بسهولة من خلال رابط يتم إرساله لك قبل موعد الجلسة.'
            },
            {
                q: 'هل يحصل الطالب على شهادة؟',
                a: 'نعم، عند إتمام أي من باقاتنا (التطويرية أو المتقدمة)، يحصل الطالب على شهادة إتمام معتمدة من منصة الرحلة، بالإضافة إلى تقرير تطوير شامل من المدرب.'
            }
        ]
    },
    {
        category: 'صندوق الرحلة الشهري',
        items: [
            {
                q: 'كيف يعمل الاشتراك في صندوق الرحلة الشهري؟',
                a: 'الاشتراك سنوي، ويتم الدفع مقدمًا. كل شهر، سنقوم بشحن صندوق جديد يحتوي على قصة وأنشطة وهدية مفاجأة إلى عنوانك. يتم تجديد الاشتراك تلقائيًا كل عام، ولكن يمكنك إلغاء التجديد في أي وقت من صفحة حسابك.'
            },
            {
                q: 'هل يمكنني إيقاف اشتراكي مؤقتًا؟',
                a: 'حاليًا، لا ندعم الإيقاف المؤقت للاشتراكات. ومع ذلك، يمكنك إلغاء التجديد التلقائي للاشتراك السنوي القادم من خلال صفحة "حسابي". سيستمر وصول الصناديق إليك حتى نهاية فترة اشتراكك الحالية.'
            },
            {
                q: 'كيف يمكنني تحديث عنوان الشحن الخاص بالاشتراك؟',
                a: 'يمكنك تحديث عنوان الشحن بسهولة من خلال قسم "اشتراكاتي" في صفحة "حسابي". يرجى التأكد من تحديث العنوان قبل موعد الشحن الشهري لضمان وصول الصندوق إلى المكان الصحيح.'
            }
        ]
    },
    {
        category: 'أسئلة عامة',
        items: [
            {
                q: 'ما هي طرق الدفع المتاحة؟ وهل هي آمنة؟',
                a: 'نحن نقبل الدفع عبر Instapay والمحافظ الإلكترونية (مثل فودافون كاش). جميع المعاملات تتم عبر بوابات دفع آمنة وموثوقة لضمان حماية بياناتك المالية.'
            },
            {
                q: 'هل تقومون بالشحن خارج مصر؟',
                a: 'حاليًا، الشحن للمنتجات المطبوعة متاح داخل جمهورية مصر العربية فقط. للمتواجدين خارج مصر، نوصي باختيار النسخة الإلكترونية من منتجاتنا.'
            },
            {
                q: 'كم تبلغ تكلفة الشحن؟',
                a: 'تكلفة الشحن ثابتة لمعظم محافظات مصر، ويتم تحديدها بناءً على المحافظة. يمكنك رؤية التكلفة الدقيقة لمحافظتك عند إتمام الطلب في صفحة الدفع. الشحن داخل القاهرة حالياً مجاني.'
            },
            {
                q: 'كيف يمكنني تتبع طلبي؟',
                a: 'يمكنك متابعة حالة طلبك من خلال صفحة "حسابي" بعد تسجيل الدخول. ستتلقى أيضًا تحديثات عبر البريد الإلكتروني عند كل مرحلة جديدة من مراحل تجهيز وشحن طلبك.'
            }
        ]
    }
];

const supportContent = {
    title: 'الدعم والمساعدة',
    subtitle: 'نحن هنا لمساعدتك. تواصل معنا لأي استفسار يخص منتجاتنا أو برامجنا، أو تصفح الأسئلة الشائعة أدناه.',
    contact_email: 'support@alrehlah.com',
    contact_phone: '+20 100 200 3000',
};

const SupportPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createSupportTicket } = useCommunication();
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

  const subjectOptions = [
    'استفسار عام',
    'استفسار بخصوص منتجات "إنها لك"',
    'استفسار بخصوص برنامج "بداية الرحلة"',
    'مشكلة تقنية',
    'اقتراح أو شكوى',
  ];

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
            <SupportForm onSubmit={handleSubmit} isSubmitting={isSubmitting} subjectOptions={subjectOptions} />
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
              <FAQSection key={section.category} category={section.category} items={section.items} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportPage;
