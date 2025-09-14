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
                        مساحة آمنة وملهمة للأطفال والشباب للتعبير عن أنفسهم من خلال الكلمة المكتوبة.
                    </p>
                </div>

                <Section title="رسالة البرنامج" icon={<Target size={24} />}>
                    <p>
                        في زمن يزداد فيه التركيز على التحصيل والنتائج، يقدم البرنامج مساحة آمنة للأطفال ليعبّروا عن أنفسهم من خلال الكتابة دون الحاجة للمحاكمة أو التقييد بالمعايير الأكاديمية التقليدية. يركز البرنامج على تعريف الطفل بالكتابة كأداة للتعبير الذاتي وليس فقط كمهارة مدرسية.
                    </p>
                </Section>

                <Section title="الأهداف التعليمية والتربوية" icon={<Star size={24} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2"><BookOpen size={22}/> الأهداف الأساسية:</h3>
                            <ul className="space-y-2 list-disc list-inside">
                                <li><span className="font-semibold">تطوير الهوية الكتابية:</span> تمكين الطفل من اكتشاف صوته الخاص في الكتابة وتطوير أسلوبه الشخصي.</li>
                                <li><span className="font-semibold">تعزيز الثقة بالنفس:</span> بناء الثقة في التعبير الشخصي من خلال بيئة آمنة ومحفزة.</li>
                                <li><span className="font-semibold">تنمية المهارات الإبداعية:</span> تطوير مهارات الطلاقة والمرونة والأصالة في الكتابة.</li>
                                <li><span className="font-semibold">الربط العاطفي:</span> تدريب الطفل على ربط مشاعره وأفكاره بصور لغوية بسيطة.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2"><BrainCircuit size={22}/> الأهداف التطويرية:</h3>
                            <ul className="space-y-2 list-disc list-inside">
                                <li><span className="font-semibold">تحسين العلاقة بالكتابة:</span> تحويل النظرة التقليدية للكتابة من واجب أكاديمي إلى متعة شخصية.</li>
                                <li><span className="font-semibold">تطوير الخيال:</span> إثارة خيال الطالب وزيادة الإبداع لديهم من خلال التدريب على نماذج مختلفة للكتابة.</li>
                                <li><span className="font-semibold">إنتاج نهائي ملموس:</span> إنتاج نص مكتوب في نهاية البرنامج يعكس صوت الطفل الخاص.</li>
                            </ul>
                        </div>
                    </div>
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
