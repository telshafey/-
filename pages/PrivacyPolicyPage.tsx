


import React from 'react';
// FIX: Replaced named imports with a namespace import for 'react-router-dom' to resolve module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { Shield, FileText, UserCheck, Lock, Database } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import PageLoader from '../components/ui/PageLoader';

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="mb-12">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
          {icon}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 ms-4">{title}</h2>
      </div>
      <div className="prose prose-lg max-w-none text-gray-600 leading-loose">
          {children}
      </div>
    </div>
);

const SectionSkeleton: React.FC = () => (
    <div className="mb-12 animate-pulse">
        <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 ms-4"></div>
        </div>
        <div className="space-y-4">
            <div className="h-5 bg-gray-200 rounded w-full"></div>
            <div className="h-5 bg-gray-200 rounded w-5/6"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>
    </div>
)

const PrivacyPolicyPage: React.FC = () => {
  const { siteContent, loading } = useAdmin();
  const privacyContent = siteContent.privacy || {};

  if (loading) {
    return (
        <div className="bg-white py-16 sm:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="text-center mb-16 animate-pulse">
                    <div className="h-12 bg-gray-300 rounded w-1/2 mx-auto"></div>
                    <div className="mt-4 h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
                <SectionSkeleton />
                <SectionSkeleton />
            </div>
        </div>
    );
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
              <ReactRouterDOM.Link to="/support" className="text-blue-600 hover:underline">الدعم والمساعدة</ReactRouterDOM.Link>.
            </p>
        </Section>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;