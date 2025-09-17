import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2 } from 'lucide-react';
// FIX: Corrected import path for useCreativeWritingAdmin.
import { useCreativeWritingAdmin } from '../../contexts/admin/CreativeWritingAdminContext';
import { useToast } from '../../contexts/ToastContext';
// FIX: Added .ts extension to resolve module error.
import { Instructor, AvailableSlots } from '../../lib/database.types.ts';
// FIX: Added .ts extension to resolve module error.
import { daysInMonth, firstDayOfMonth } from '../../utils/helpers.ts';

interface AvailabilityManagerProps {
    instructorId?: number;
}

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ instructorId }) => {
    const { instructors, updateInstructorAvailability, loading } = useCreativeWritingAdmin();
    const { addToast } = useToast();
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [newTime, setNewTime] = useState('');

    useEffect(() => {
        if (instructorId) {
            const instructor = instructors.find(i => i.id === instructorId);
            setSelectedInstructor(instructor || null);
        } else if (!selectedInstructor && instructors.length > 0) {
            setSelectedInstructor(instructors[0]);
        }
    }, [instructors, selectedInstructor, instructorId]);

    const availableSlots = (selectedInstructor?.availability as AvailableSlots) || {};

    const handleUpdateSlots = async (newSlots: AvailableSlots) => {
        if (!selectedInstructor) return;
        await updateInstructorAvailability(selectedInstructor.id, newSlots);
    };

    const addTimeSlot = async () => {
        if (!selectedDay || !newTime.trim() || !selectedInstructor) return;

        const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s(ص|م)$/;
        if (!timeRegex.test(newTime.trim())) {
            addToast('الرجاء إدخال وقت صالح بالتنسيق "HH:MM ص/م"', 'error');
            return;
        }

        const dayKey = selectedDay.toString();
        const daySlots = availableSlots[dayKey] || [];
        if (daySlots.includes(newTime)) {
            addToast('هذا الوقت مضاف بالفعل.', 'info');
            return;
        }
        
        const updatedSlots = [...daySlots, newTime].sort();
        const newAvailableSlots = { ...availableSlots, [dayKey]: updatedSlots };

        await handleUpdateSlots(newAvailableSlots);
        addToast(`تمت إضافة الموعد ${newTime} ليوم ${selectedDay}`, 'success');
        setNewTime('');
    };

    const removeTimeSlot = async (timeToRemove: string) => {
        if (!selectedDay || !selectedInstructor) return;
        const dayKey = selectedDay.toString();
        const daySlots = availableSlots[dayKey] || [];
        const updatedSlots = daySlots.filter(time => time !== timeToRemove);
        const newAvailableSlots = { ...availableSlots, [dayKey]: updatedSlots };

        await handleUpdateSlots(newAvailableSlots);
        addToast(`تم حذف الموعد ${timeToRemove} من يوم ${selectedDay}`, 'success');
    };

    const monthName = currentDate.toLocaleString('ar-EG', { month: 'long' });
    const year = currentDate.getFullYear();

    const renderCalendar = () => {
        const totalDays = daysInMonth(currentDate);
        const startingDay = firstDayOfMonth(currentDate);
        const blanks = Array(startingDay).fill(null);
        const days = Array.from({ length: totalDays }, (_, i) => i + 1);

        return [...blanks, ...days].map((day, index) => {
            if (day === null) {
                return <div key={`blank-${index}`} className="p-2 border border-transparent"></div>;
            }
            const isSelected = selectedDay === day;
            const hasSlots = (availableSlots[day.toString()] || []).length > 0;
            const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().setDate(new Date().getDate() -1));

            return (
                <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    disabled={isPast}
                    className={`
                        p-2 border rounded-lg transition-colors text-center aspect-square flex flex-col justify-between items-center
                        ${isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50'}
                        ${isSelected ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-500' : 'bg-white border-gray-200'}
                    `}
                >
                    <span className="font-semibold">{day}</span>
                    {hasSlots && !isPast && (
                         <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'}`}>
                           {availableSlots[day.toString()].length} مواعيد
                        </span>
                    )}
                </button>
            );
        });
    };

    const handleDayClick = (day: number) => {
        setSelectedDay(day);
    };

    return (
        <div className="p-4 bg-gray-100 rounded-2xl shadow-inner border">
            {!instructorId && (
                <div className="mb-4">
                    <label htmlFor="instructor-select" className="block text-sm font-bold text-gray-700 mb-2">
                        اختر مدربًا لإدارة مواعيده:
                    </label>
                    <select
                        id="instructor-select"
                        value={selectedInstructor?.id || ''}
                        onChange={(e) => {
                            const newId = Number(e.target.value);
                            setSelectedInstructor(instructors.find(i => i.id === newId) || null);
                            setSelectedDay(null);
                        }}
                        className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg bg-white"
                        disabled={loading || instructors.length === 0}
                    >
                        {instructors.length > 0 ? (
                        instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)
                        ) : (
                        <option>لا يوجد مدربون</option>
                        )}
                    </select>
                </div>
            )}
            {loading ? <Loader2 className="animate-spin text-blue-500"/> : !selectedInstructor ? (
                <p className="text-center py-8 text-gray-500">الرجاء اختيار مدرب.</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight size={20} /></button>
                            <h3 className="text-lg font-bold text-gray-800">{monthName} {year}</h3>
                            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft size={20} /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2 font-semibold">
                            {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {renderCalendar()}
                        </div>
                    </div>

                    {/* Time Slot Management */}
                    <div className="border-r pr-6 rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            {selectedDay ? `المواعيد المتاحة ليوم ${selectedDay}` : 'اختر يوماً من التقويم'}
                        </h3>
                        {selectedDay && (
                            <div>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        placeholder="مثال: 02:00 م"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button onClick={addTimeSlot} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex-shrink-0">
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {(availableSlots[selectedDay.toString()] || []).length > 0 ? (
                                        (availableSlots[selectedDay.toString()] || []).map(time => (
                                            <div key={time} className="flex justify-between items-center bg-white p-2 rounded-lg border">
                                                <span className="font-mono text-sm font-semibold text-gray-700">{time}</span>
                                                <button onClick={() => removeTimeSlot(time)} className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">لا توجد مواعيد متاحة لهذا اليوم.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailabilityManager;