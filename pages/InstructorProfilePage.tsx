import React, { useEffect, useState, useMemo } from 'react';
// FIX: Replaced namespace import with named imports for 'react-router-dom' to resolve module resolution errors.
import { Link, useNavigate, useParams } from 'react-router-dom';
// FIX: Corrected import path for useCreativeWritingAdmin.
import { useCreativeWritingAdmin } from '../contexts/admin/CreativeWritingAdminContext.tsx';
// FIX: Added .tsx extension to PageLoader import to resolve module error.
import PageLoader from '../components/ui/PageLoader.tsx';
import { ArrowLeft, Calendar, Star, User, Clock } from 'lucide-react';
// FIX: Added .ts extension to formatDate import to resolve module error.
import { formatDate } from '../utils/helpers.ts';
// FIX: Added .ts extension to WeeklySchedule import to resolve module error.
import { WeeklySchedule } from '../lib/database.types.ts';

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
  const { slug } = useParams<{ slug: string }>();
  const { instructors, reviews, loading } = useCreativeWritingAdmin();
  const navigate = useNavigate();
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
        <Link to="/creative-writing/instructors" className="text-blue-600 hover:underline mt-4 inline-block">
          العودة إلى صفحة المدربين
        </Link>
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
    const selectedDate = getNextDateForDay(dayIndex);
    
    navigate('/creative-writing/booking', {
        state: {
            instructorId: instructor.id,
            selectedDate: selectedDate.toISOString(),
            selectedTime: time,
        }
    });
  };

  return (
    <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/creative-writing/instructors" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors">
              <ArrowLeft size={20} />
              <span>العودة إلى جميع المدربين</span>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border">
            <div className="p-8 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-1 text-center">
                   <div className="relative w-40 h-40 mx-auto">
                      {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"></div>}
                      <img 
                          src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                          alt={instructor.name} 
                          className={`w-40 h-40 rounded-full object-cover ring-4 ring-white shadow-lg mx-auto transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                          loading="lazy"
                          onLoad={() => setImageLoaded(true)}
                      />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">{instructor.name}</h1>
                  <p className="mt-2 text-xl font-semibold text-blue-600">{instructor.specialty}</p>
                   <div className="flex items-center gap-3 mt-4">
                        <StarRating rating={averageRating} />
                        <span className="text-gray-600">({averageRating.toFixed(1)}) - {reviewCount} تقييمات</span>
                    </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t">
                  <h2 className="text-2xl font-bold text-gray-700 mb-4">نبذة عن المدرب</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{instructor.bio || "لا تتوفر نبذة تعريفية حاليًا."}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg border">
             <h2 className="text-2xl font-bold text-gray-700 mb-6">احجز جلستك مع {instructor.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <h3 className="text-xl font-semibold text-gray-800 mb-4">اختر الباقة المناسبة</h3>
                   <p className="text-gray-600 mb-4">حدد الباقة التي تناسب أهدافك ثم اختر الموعد المناسب من الجدول.</p>
                   <button onClick={handleBookClick} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                      <Calendar size={20} />
                      <span>عرض الباقات والحجز</span>
                  </button>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">أو اختر موعداً مباشرة</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {dayOrder.map(day => {
                            const times = (instructor.weekly_schedule as WeeklySchedule)?.[day];
                            if (!times || times.length === 0) return null;
                            return (
                                <div key={day}>
                                    <h4 className="font-bold text-gray-700">{dayNames[day]} (القادم: {formatDate(getNextDateForDay(dayIndexMap[day]).toISOString())})</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {times.map(time => (
                                            <button 
                                                key={time} 
                                                onClick={() => handleTimeSlotSelect(day, time)}
                                                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-blue-100 hover:text-blue-700 font-semibold"
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
              </div>
          </div>
          
           <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg border">
              <h2 className="text-2xl font-bold text-gray-700 mb-6">آراء الطلاب</h2>
              {instructorReviews.length > 0 ? (
                  <div className="space-y-6 max-h-96 overflow-y-auto">
                      {instructorReviews.map(review => (
                          <div key={review.id} className="p-4 bg-gray-50 rounded-lg border">
                              <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full"><User /></div>
                                    <div>
                                      <p className="font-bold text-gray-800">{review.student_name}</p>
                                      <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                                    </div>
                                  </div>
                                  <StarRating rating={review.rating} />
                              </div>
                              <p className="text-gray-600 italic">"{review.comment}"</p>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-center text-gray-500 py-8">لا توجد تقييمات لهذا المدرب بعد.</p>
              )}
          </div>

        </div>
      </div>
    </div>
  );
};

// FIX: Added default export for the component to fix React.lazy() import.
export default InstructorProfilePage;
