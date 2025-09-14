import React, { useState } from 'react';
// FIX: Added .ts extension to resolve module error.
import { Instructor, WeeklySchedule } from '../../lib/database.types.ts';
import { useCreativeWritingAdmin } from '../../contexts/admin/CreativeWritingAdminContext';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2, Send } from 'lucide-react';

interface WeeklyScheduleManagerProps {
    instructor: Instructor;
}

const dayNames = {
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
};

// FIX: Explicitly type dayKeys to be an array of string literals, not just string[].
const dayKeys = Object.keys(dayNames) as Array<keyof typeof dayNames>;

const WeeklyScheduleManager: React.FC<WeeklyScheduleManagerProps> = ({ instructor }) => {
    const { requestScheduleChange } = useCreativeWritingAdmin();
    const { addToast } = useToast();
    const [schedule, setSchedule] = useState<WeeklySchedule>((instructor.weekly_schedule as WeeklySchedule) || {});
    const [newTime, setNewTime] = useState('');
    // FIX: Use the more specific type for the state to avoid type errors with the select element.
    const [selectedDay, setSelectedDay] = useState<typeof dayKeys[number]>('sunday');

    const handleAddTime = () => {
        if (!newTime.trim()) {
            addToast('الرجاء إدخال وقت.', 'warning');
            return;
        }
        
        const daySlots = schedule[selectedDay] || [];
        if (daySlots.includes(newTime)) {
            addToast('هذا الوقت مضاف بالفعل.', 'info');
            return;
        }
        
        const updatedSlots = [...daySlots, newTime].sort();
        setSchedule(prev => ({ ...prev, [selectedDay]: updatedSlots }));
        setNewTime('');
    };

    const handleRemoveTime = (day: keyof WeeklySchedule, timeToRemove: string) => {
        const updatedSlots = (schedule[day] || []).filter(time => time !== timeToRemove);
        setSchedule(prev => ({ ...prev, [day]: updatedSlots }));
    };

    const handleSubmitForApproval = async () => {
        // In a real app, this would also save the `schedule` state to the backend.
        // For now, we just trigger the status change.
        await requestScheduleChange(instructor.id, schedule);
    };
    
    const renderStatusBanner = () => {
        switch (instructor.schedule_status) {
            case 'approved':
                return <div className="p-3 bg-green-50 border-l-4 border-green-400 text-green-800">جدولك الحالي معتمد.</div>;
            case 'pending':
                return <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">تم إرسال جدولك للمراجعة.</div>;
            case 'rejected':
                return <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-800">تم رفض جدولك. يرجى تعديله وإعادة إرساله.</div>;
            default:
                return <div className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800">يرجى إعداد جدولك الأسبوعي وإرساله للمراجعة.</div>;
        }
    };
    
    const isEditable = instructor.schedule_status !== 'pending';

    return (
        <div className="space-y-6">
            {renderStatusBanner()}
            
            <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-bold mb-4">إضافة موعد متكرر</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <select value={selectedDay} onChange={e => setSelectedDay(e.target.value as typeof dayKeys[number])} className="form-select rounded-lg border-gray-300" disabled={!isEditable}>
                        {dayKeys.map(day => <option key={day} value={day}>{dayNames[day]}</option>)}
                    </select>
                    <input type="text" value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="مثال: 03:00 م" className="form-input rounded-lg border-gray-300" disabled={!isEditable} />
                    <button onClick={handleAddTime} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400" disabled={!isEditable}>
                        <Plus />
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    {dayKeys.map(day => (
                        <div key={day}>
                            <h4 className="font-semibold text-gray-700">{dayNames[day]}</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {(schedule[day] || []).length > 0 ? (
                                    (schedule[day] || []).map(time => (
                                        <div key={time} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                                            <span className="text-sm">{time}</span>
                                            <button onClick={() => handleRemoveTime(day, time)} disabled={!isEditable} className="text-red-500 hover:text-red-700 disabled:text-gray-400">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">لا توجد مواعيد</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button onClick={handleSubmitForApproval} disabled={!isEditable} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 disabled:bg-gray-400">
                    <Send size={16} />
                    <span>إرسال للمراجعة</span>
                </button>
            </div>
        </div>
    );
};

export default WeeklyScheduleManager;