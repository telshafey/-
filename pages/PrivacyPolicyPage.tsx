import React from 'react';
// FIX: Replaced namespace import with a named import for 'react-router-dom' to resolve module resolution errors.
import { Link } from 'react-router-dom';
import { Shield, FileText, UserCheck, Lock } from 'lucide-react';
// FIX: Added .tsx extension to the import of AdminContext to resolve module loading error.
import { useAdmin } from '../contexts/AdminContext.tsx';
import PageLoader from '../components/ui/PageLoader';
import Section from '../components/ui/Section.tsx';

const PrivacyPolicyPage: React.FC = () => {
  const { siteContent, loading } = useAdmin();
  const privacyContent = siteContent.privacy || {};

  if (loading) {
    return <PageLoader text="جاري تحميل سياسة الخصوصية..." />;
  }

  return (
    <div className="bg-white py-16 sm:py-20 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">{privacyContent.main_title}</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
            {privacyContent.main_subtitle}
          </p>
        </div>
        
        <Section title={privacyContent.intro_title || "مقدمة"} icon={<Shield size={24} />}>
            <p>{privacyContent.intro_text}</p>
            
            <h3>{privacyContent.data_collection_title}</h3>
            <ul>
                {privacyContent.data_collection_list?.split('\n').map((item, i) => <li key={i}>{item}</li>)}
            </ul>

            <h3>{privacyContent.data_usage_title}</h3>
            <ul>
                 {privacyContent.data_usage_list?.split('\n').map((item, i) => <li key={i}>{item}</li>)}
            </ul>

            <h3>{privacyContent.data_sharing_title}</h3>
            <p>{privacyContent.data_sharing_text}</p>

            <h3>{privacyContent.children_title}</h3>
            <p>{privacyContent.children_text}</p>
        </Section>
        
        <Section title={privacyContent.security_title || "أمان البيانات"} icon={<Lock size={24} />}>
            <p>{privacyContent.security_text}</p>
        </Section>
        
        <Section title={privacyContent.rights_title || "حقوقك"} icon={<UserCheck size={24} />}>
            <p>{privacyContent.rights_text}</p>
        </Section>
        
         <Section title={privacyContent.policy_changes_title || 'التغييرات على هذه السياسة'} icon={<FileText size={24} />}>
            <p>{privacyContent.policy_changes_text}</p>
        </Section>
        
        <Section title={privacyContent.contact_us_title || 'اتصل بنا'} icon={<UserCheck size={24} />}>
            <p>
              {privacyContent.contact_us_text?.replace('الدعم والمساعدة', '')}
              <Link to="/support" className="text-blue-600 hover:underline">الدعم والمساعدة</Link>.
            </p>
        </Section>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;