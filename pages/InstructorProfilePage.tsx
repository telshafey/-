
import React, { useEffect } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useCreativeWritingAdmin } from '../contexts/admin/CreativeWritingAdminContext';
import PageLoader from '../components/ui/PageLoader';
import { ArrowLeft, Calendar } from 'lucide-react';

const InstructorProfilePage: React.FC = () => {
  const { slug } = ReactRouterDOM.useParams<{ slug: string }>();
  const { instructors, loading } = useCreativeWritingAdmin();
  const navigate = ReactRouterDOM.useNavigate();

  const instructor = instructors.find(i => i.slug === slug);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return <PageLoader text="جاري تحميل ملف المدرب..." />;
  }

  if (!instructor) {
    return (
      <div className="text-center py-20 min-h-[50vh] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800">لم يتم العثور على المدرب</h1>
        <ReactRouterDOM.Link to="/creative-writing/instructors" className="text-blue-600 hover:underline mt-4 inline-block">
          العودة إلى صفحة المدربين
        </ReactRouterDOM.Link>
      </div>
    );
  }

  const handleBookClick = () => {
    // Navigate to the booking page and pass the instructor ID in the state
    navigate('/creative-writing/booking', { 
        state: { instructorId: instructor.id }
    });
  };

  return (
    <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <ReactRouterDOM.Link to="/creative-writing/instructors" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors">
            <ArrowLeft size={20} />
            <span>العودة إلى جميع المدربين</span>
          </ReactRouterDOM.Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-right">
              <img 
                src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                alt={instructor.name} 
                className="w-40 h-40 rounded-full object-cover mb-4 ring-4 ring-blue-100 shadow-lg"
              />
              <h1 className="text-3xl font-extrabold text-gray-800">{instructor.name}</h1>
              <p className="text-lg text-blue-600 font-semibold mt-1">{instructor.specialty}</p>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-100 pb-2 mb-4">نبذة تعريفية</h2>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                {instructor.bio ? (
                  instructor.bio.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>لا توجد نبذة تعريفية متاحة لهذا المدرب حاليًا.</p>
                )}
              </div>
              <div className="mt-8">
                <button
                  onClick={handleBookClick}
                  className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
                >
                  <Calendar size={20} />
                  <span>{`احجز جلسة مع ${instructor.name.split(' ')[0]}`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfilePage;