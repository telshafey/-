import React from 'react';
import { Book, Award, FileText, GraduationCap } from 'lucide-react';
import Section from '../components/ui/Section.tsx';

const CreativeWritingCurriculumPage: React.FC = () => {
    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">المنهج الدراسي والمخرجات</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        رحلة تعليمية منظمة تضمن تطور طفلك من مرحلة التأسيس إلى الإبداع المتقدم.
                    </p>
                </div>

                 <Section title="مراحل البرنامج التعليمية" icon={<Book size={24} />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-3 font-bold text-gray-700">المرحلة</th>
                                    <th className="border p-3 font-bold text-gray-700">الجلسات</th>
                                    <th className="border p-3 font-bold text-gray-700">الأهداف والمحتوى</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-3 font-semibold">التأسيسية</td>
                                    <td className="border p-3">1-3</td>
                                    <td className="border p-3">التعارف والتحفيز، بناء الثقة وكسر حاجز الخوف من الكتابة، استكشاف الميول، التدريب على مهارات الوصف والسرد البسيط.</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border p-3 font-semibold">التطويرية</td>
                                    <td className="border p-3">4-8</td>
                                    <td className="border p-3">تطوير المهارات النوعية، الطلاقة والمرونة، التجريب الإبداعي باستخدام تقنيات مثل العصف الذهني والكتابة الحرة، التغذية الراجعة البناءة.</td>
                                </tr>
                                <tr>
                                    <td className="border p-3 font-semibold">المتقدمة</td>
                                    <td className="border p-3">9-12</td>
                                    <td className="border p-3">المشاريع الإبداعية المتكاملة، التحرير والمراجعة، الإعداد للعرض والنشر.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Section>

                <Section title="المخرجات والنواتج التعليمية" icon={<Award size={24} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-blue-50 p-6 rounded-lg border-r-4 border-blue-500">
                            <h3 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2"><FileText size={22}/> المحفظة الرقمية الشخصية</h3>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>3-5 نصوص مكتملة (قصص، شعر حر).</li>
                                <li>مسودات تطويرية.</li>
                                <li>تسجيلات صوتية للطالب وهو يقرأ أعماله.</li>
                                <li>تقييم ذاتي لنمو الوعي الإبداعي.</li>
                            </ul>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg border-r-4 border-green-500">
                            <h3 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2"><GraduationCap size={22}/> شهادة التخرج المعتمدة</h3>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>تقرير تطوير شامل.</li>
                                <li>توصيات للمتابعة ومسارات التطوير المستقبلية.</li>
                                <li>شهادة تثبت إتمام البرنامج بنجاح.</li>
                            </ul>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default CreativeWritingCurriculumPage;
