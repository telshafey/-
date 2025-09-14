

import React, { useMemo } from 'react';
import { User, Package, Calendar, Clock, PlusCircle, CheckCircle } from 'lucide-react';
// FIX: Corrected import path for creative writing types.
import { Instructor, CreativeWritingPackage, AdditionalService } from '../../contexts/admin/CreativeWritingAdminContext';

interface BookingSummaryProps {
    instructor: Instructor | null;
    selectedPackage: CreativeWritingPackage | null;
    selectedServices: AdditionalService[];
    // FIX: Changed selectedDate: Date | null to selectedDay: string | null to match recurring booking logic.
    selectedDay: string | null;
    selectedTime: string | null;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ 
    instructor, 
    selectedPackage, 
    selectedServices, 
    // FIX: Changed selectedDate to selectedDay to align with recurring booking logic.
    selectedDay, 
    selectedTime 
}) => {

    const totalPrice = useMemo(() => {
        const packagePrice = selectedPackage?.price || 0;
        const servicesPrice = selectedServices.reduce((acc, service) => acc + service.price, 0);
        return packagePrice + servicesPrice;
    }, [selectedPackage, selectedServices]);
    
    const SummaryItem: React.FC<{ icon: React.ReactNode; label: string; value: string | null; placeholder: string; isComplete: boolean; }> = ({ icon, label, value, placeholder, isComplete }) => (
        <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {isComplete ? <CheckCircle size={18} /> : icon}
            </div>
            <div>
                <p className="font-semibold text-gray-500">{label}</p>
                <p className={`font-bold ${value ? 'text-gray-800' : 'text-gray-400'}`}>{value || placeholder}</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">ملخص الحجز</h2>
            
            <div className="space-y-5">
                <SummaryItem icon={<User size={18}/>} label="المدرب" value={instructor?.name || null} placeholder="لم يتم الاختيار" isComplete={!!instructor}/>
                <SummaryItem icon={<Package size={18}/>} label="الباقة" value={selectedPackage?.name || null} placeholder="لم يتم الاختيار" isComplete={!!selectedPackage}/>
                
                {selectedServices.length > 0 && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                           <PlusCircle size={18} />
                        </div>
                        <div>
                             <p className="font-semibold text-gray-500">خدمات إضافية</p>
                             <ul className="text-sm text-gray-700 list-disc list-inside">
                                {selectedServices.map(s => <li key={s.id}>{s.name}</li>)}
                             </ul>
                        </div>
                    </div>
                )}
                
                {/* FIX: Updated to display recurring day of the week instead of a specific date. */}
                <SummaryItem icon={<Calendar size={18}/>} label="اليوم الأسبوعي" value={selectedDay ? `كل ${selectedDay}` : null} placeholder="لم يتم الاختيار" isComplete={!!selectedDay}/>
                <SummaryItem icon={<Clock size={18}/>} label="الوقت" value={selectedTime || null} placeholder="لم يتم الاختيار" isComplete={!!selectedTime}/>
            </div>
            
            <div className="mt-8 pt-6 border-t">
                 <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-gray-700">الإجمالي</p>
                    <p className="text-3xl font-extrabold text-blue-600 tracking-tight">{totalPrice} ج.م</p>
                </div>
            </div>
        </div>
    );
};

export default BookingSummary;
