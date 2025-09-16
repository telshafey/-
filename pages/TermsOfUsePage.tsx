import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { FileText, UserCheck, ShieldCheck, CreditCard } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
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
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">{termsContent.main_title}</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
            {termsContent.main_subtitle}
          </p>
        </div>

        <Section title={termsContent.approval_title || 'الموافقة على الشروط'} icon={<UserCheck size={24} />}>
            <p>{termsContent.approval_text}</p>
        </Section>

        <Section title={termsContent.accounts_title || 'الحسابات'} icon={<UserCheck size={24} />}>
            <p>{termsContent.accounts_text}</p>
        </Section>
        
        <Section title={termsContent.ip_title || 'الملكية الفكرية'} icon={<ShieldCheck size={24} />}>
            {termsContent.ip_text?.split('\n').map((line, i) => <p key={i}>{line}</p>)}
        </Section>
        
        <Section title={termsContent.payment_title || 'الطلبات والدفع'} icon={<CreditCard size={24} />}>
            <p>{termsContent.payment_text}</p>
        </Section>
        
        <Section title={termsContent.policy_changes_title || 'التغييرات على هذه الشروط'} icon={<FileText size={24} />}>
            <p>{termsContent.policy_changes_text}</p>
        </Section>

        <Section title={termsContent.contact_us_title || 'اتصل بنا'} icon={<UserCheck size={24} />}>
            <p>
              {termsContent.contact_us_text?.replace('الدعم والمساعدة', '')}
              <ReactRouterDOM.Link to="/support" className="text-blue-600 hover:underline">الدعم والمساعدة</ReactRouterDOM.Link>.
            </p>
        </Section>
        
      </div>
    </div>
  );
};

export default TermsOfUsePage;
