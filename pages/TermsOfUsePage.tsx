import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, UserCheck, ShieldCheck, CreditCard } from 'lucide-react';
// FIX: Added .tsx extension to the import of AdminContext to resolve module loading error.
import { useAdmin } from '../contexts/AdminContext.tsx';
import PageLoader from '../components/ui/PageLoader';
import Section from '../components/ui/Section.tsx';

const TermsOfUsePage: React.FC = () => {
  const { siteContent, loading } = useAdmin();
  const termsContent = siteContent.terms || {};

  if (loading) {
    return <PageLoader text="جاري تحميل شروط الاستخدام..." />;
  }

  return (
    <div className="bg-white py-16 sm:py-20 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">{termsContent.main_title || 'شروط الاستخدام'}</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
            {termsContent.main_subtitle || 'يرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا.'}
          </p>
        </div>
        
        <Section title={termsContent.approval_title || "الموافقة على الشروط"} icon={<UserCheck size={24} />}>
            <p>{termsContent.approval_text || 'باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من الشروط، فلا يجوز لك استخدام خدماتنا.'}</p>
        </Section>

        <Section title={termsContent.ip_title || "الملكية الفكرية"} icon={<ShieldCheck size={24} />}>
            <p>{termsContent.ip_text || 'جميع المحتويات المعروضة على هذا الموقع، بما في ذلك النصوص والرسومات والشعارات والصور، هي ملك لمنصة الرحلة ومحمية بموجب قوانين حقوق النشر. يُمنع منعًا باتًا إعادة استخدام أو توزيع أي محتوى بدون إذن خطي مسبق.'}</p>
        </Section>
        
        <Section title={termsContent.payment_title || "الدفع والإلغاء"} icon={<CreditCard size={24} />}>
            <p>{termsContent.payment_text || 'تتطلب جميع خدماتنا الدفع المسبق. تخضع عمليات الإلغاء واسترداد الأموال لسياساتنا الموضحة في صفحة كل منتج أو خدمة. نحتفظ بالحق في تغيير الأسعار في أي وقت.'}</p>
        </Section>

        <Section title={termsContent.changes_title || "التغييرات على الشروط"} icon={<FileText size={24} />}>
            <p>{termsContent.changes_text || 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة. استمرارك في استخدام الموقع بعد نشر التغييرات يعتبر موافقة منك على الشروط المعدلة.'}</p>
        </Section>
        
        <Section title={termsContent.contact_title || 'اتصل بنا'} icon={<UserCheck size={24} />}>
            <p>
              إذا كانت لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا عبر صفحة <Link to="/support" className="text-blue-600 hover:underline">الدعم والمساعدة</Link>.
            </p>
        </Section>

      </div>
    </div>
  );
};

export default TermsOfUsePage;
