import React, { useEffect, useState, useMemo } from 'react';
// FIX: Replaced named imports with a namespace import for 'react-router-dom' to resolve module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useCreativeWritingAdmin } from '../contexts/admin/CreativeWritingAdminContext';
import PageLoader from '../components/ui/PageLoader';
import { ArrowLeft, Calendar, Star, User, Clock } from 'lucide-react';
import { formatDate } from '../utils/helpers.ts';
import { WeeklySchedule } from '../lib/database.types';

const StarRating: React.FC<{ rating: number; totalStars?: number }> = ({ rating, totalStars = 5 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" />)}
            {halfStar && <Star key="half" className="w-5 h-5 text-yellow-400" fill="currentColor" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" />)}
        </div>
    );
};


const InstructorProfilePage: React.FC = () => {
  const { slug } = ReactRouterDOM.useParams<{ slug: string }>();
  const { instructors, reviews, loading } = useCreativeWritingAdmin();
  const navigate = ReactRouterDOM.useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const instructor = instructors.find(i => i.slug === slug);
  
  const instructorReviews = useMemo(() => {
    if (!instructor) return [];
    return reviews.filter(r => r.instructor_id === instructor.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reviews, instructor]);

  const { averageRating, reviewCount } = useMemo(() => {
    if (!instructorReviews || instructorReviews.length === 0) {
        return { averageRating: 0, reviewCount: 0 };
    }
    const totalRating = instructorReviews.reduce((acc, review) => acc + review.rating, 0);
    return {
        averageRating: totalRating / instructorReviews.length,
        reviewCount: instructorReviews.length,
    };
  }, [instructorReviews]);


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
  
  const dayNames: { [key in keyof WeeklySchedule]: string } = {
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
  };

  const dayOrder: (keyof WeeklySchedule)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndexMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

  const getNextDateForDay = (dayIndex: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const distance = (dayIndex - currentDay + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + distance);
    return nextDate;
  };

  const handleTimeSlotSelect = (day: keyof WeeklySchedule, time: string) => {
    const dayIndex = dayIndexMap[day];
    const nextDate = getNextDateForDay(dayIndex);
    
    navigate('/creative-writing/booking', { 
        state: { 
            instructorId: instructor.id, 
            selectedDate: nextDate.toISOString(), // Pass date as string
            selectedTime: time 
        }
    });
  };

  const schedule = instructor.weekly_schedule as WeeklySchedule || {};
  const hasApprovedSchedule = instructor.schedule_status === 'approved' && Object.values(schedule).some(slots => slots && slots.length > 0);

  return (
    <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <ReactRouterDOM.Link to="/creative-writing/instructors" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors">
            <ArrowLeft size={20} />
            <span>العودة إلى جميع المدربين</span>
          </ReactRouterDOM.Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-right">
              <div className="relative w-40 h-40 mb-4">
                  {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"></div>}
                  <img 
                    src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                    alt={instructor.name} 
                    className={`w-40 h-40 rounded-full object-cover ring-4 ring-blue-100 shadow-lg transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                  />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-800">{instructor.name}</h1>
              <p className="text-lg text-blue-600 font-semibold mt-1">{instructor.specialty}</p>
              {reviewCount > 0 && (
                <div className="mt-4 flex items-center gap-2">
                    <StarRating rating={averageRating} />
                    <span className="text-sm text-gray-500">({averageRating.toFixed(1)}) من {reviewCount} مراجعات</span>
                </div>
              )}
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
        
        {hasApprovedSchedule && (
             <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
                <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-100 pb-2 mb-6">الجدول الأسبوعي المتاح</h2>
                 <p className="text-gray-500 text-sm mb-6 -mt-2">اختر أحد المواعيد التالية لحجز الجلسة القادمة مباشرة.</p>
                <div className="space-y-6">
                    {dayOrder.map(day => {
                        const slots = schedule[day];
                        if (!slots || slots.length === 0) return null;
                        
                        return (
                            <div key={day}>
                                <h3 className="font-bold text-lg text-gray-700">{dayNames[day]}</h3>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    {slots.map(time => (
                                        <button 
                                            key={time}
                                            onClick={() => handleTimeSlotSelect(day, time)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
                                        >
                                            <Clock size={16} />
                                            <span>{time}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
             </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-100 pb-2 mb-6">آراء الطلاب ({reviewCount})</h2>
            {instructorReviews.length > 0 ? (
                <div className="space-y-8">
                    {instructorReviews.map(review => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                           <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{review.student_name}</p>
                                    <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                                </div>
                           </div>
                           <div className="flex items-center gap-2 mb-3">
                                <StarRating rating={review.rating} />
                           </div>
                           <p className="text-gray-600 italic">"{review.comment}"</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">لا توجد مراجعات لهذا المدرب حتى الآن.</p>
            )}
        </div>

      </div>
    </div>
  );
};

export default InstructorProfilePage;