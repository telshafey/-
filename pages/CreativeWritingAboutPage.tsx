
import React from 'react';
import { Target, Star, Eye, Shield, Users } from 'lucide-react';
import { BookOpen, BrainCircuit, CheckCircle } from 'lucide-react';

// Re-using the Section component locally
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; id?: string; }> = ({ title, icon, children, id }) => (
    <div id={id} className="bg-white p-8 rounded-2xl shadow-lg mb-12 scroll-mt-24">
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
          {icon}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 ms-4">{title}</h2>
      </div>
      <div className="text-gray-600 leading-relaxed text-lg">
          {children}
      </div>
    </div>
);

const CreativeWritingAboutPage: React.FC = () => {
    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">عن برنامج "بداية الرحلة"</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        "بداية الرحلة" ليس برنامجاً لتعليم الكتابة، بل هو احتفال بالصوت الفريد لكل طفل. إنه المفتاح الذي يفتح أقفال الخيال، والمساحة الآمنة التي تتحول فيها الأفكار الخجولة إلى قصص عظيمة.
                    </p>
                </div>

                <Section title="ماذا نقدم؟" icon={<Target size={24} />}>
                    <p>
                        نحن لا نقدم دروسًا، بل نقدم رحلة شخصية بصحبة مرشد متخصص. في جلسات فردية مباشرة، نأخذ بيد طفلك بعيدًا عن سطوة القواعد الصارمة والتقييم، ونمنحه حرية الورقة البيضاء. هنا، لا توجد إجابات صحيحة أو خاطئة؛ يوجد فقط صوت طفلك، خياله، وقصته التي تنتظر أن تُروى.
                    </p>
                </Section>

                <Section title="التحول الذي نصنعه" icon={<Star size={24} />}>
                    <p>مع نهاية الرحلة، لا يحصل طفلك على مجرد نصوص مكتوبة، بل يحصل على ما هو أثمن:</p>
                     <ul className="space-y-3 list-none mt-6">
                        <li className="flex items-start"><CheckCircle className="text-green-500 mt-1 me-3 flex-shrink-0"/><span><span className="font-bold">الثقة للتعبير:</span> يصبح أكثر جرأة في مشاركة أفكاره ومشاعره.</span></li>
                        <li className="flex items-start"><CheckCircle className="text-green-500 mt-1 me-3 flex-shrink-0"/><span><span className="font-bold">صديق جديد:</span> تصبح الكتابة متنفسًا له، ووسيلة لفهم نفسه والعالم من حوله.</span></li>
                        <li className="flex items-start"><CheckCircle className="text-green-500 mt-1 me-3 flex-shrink-0"/><span><span className="font-bold">قوة الإبداع:</span> يدرك أنه ليس مجرد متلقٍ للقصص، بل هو صانع لها.</span></li>
                    </ul>
                </Section>

                <Section title="المنهجية التعليمية" icon={<Eye size={24} />}>
                    <p>
                    يعتمد البرنامج على مبادئ منهجية مونتيسوري التي تركز على "التعلم من خلال الممارسة العملية"، مما يعزز الاستقلالية والقدرة على حل المشكلات. كما يطبق مبدأ "الكتابة قبل القراءة" للسماح للأطفال بالتعبير بحرية وبناء الثقة باللغة.
                    </p>
                </Section>

                <Section title="ضمانات الأمان والخصوصية" icon={<Shield size={24} />}>
                    <ul className="space-y-2 list-none">
                        <li className="flex items-start"><CheckCircle className="text-green-500 mt-1 me-3 flex-shrink-0"/><span>حماية بيانات الأطفال بأعلى معايير الخصوصية.</span></li>
                        <li className="flex items-start"><CheckCircle className="text-green-500 mt-1 me-3 flex-shrink-0"/><span>إشراك أولياء الأمور في عملية التعلم.</span></li>
                        <li className="flex items-start"><CheckCircle className="text-green-500 mt-1 me-3 flex-shrink-0"/><span>بيئة آمنة خالية من التنمر أو النقد الهدام.</span></li>
                        <li className="flex items-start"><CheckCircle className="text-green-500 mt-1 me-3 flex-shrink-0"/><span>استخدام منصة Jitsi الآمنة للجلسات المباشرة.</span></li>
                    </ul>
                </Section>
                
                <Section title="شروط القبول" icon={<Users size={24} />}>
                    <ul className="space-y-2 list-disc list-inside">
                        <li>القدرة على القراءة والكتابة الأساسية باللغة العربية.</li>
                        <li>توفر جهاز إلكتروني واتصال إنترنت مستقر.</li>
                        <li>دعم أسري والتزام بحضور الجلسات وأداء الأنشطة.</li>
                        <li>أولوية للمهتمين بالكتابة ممن لم يخوضوا تجربة مماثلة.</li>
                    </ul>
                </Section>
            </div>
        </div>
    );
};
export default CreativeWritingAboutPage;