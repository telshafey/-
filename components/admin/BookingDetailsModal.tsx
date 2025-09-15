import React, { useState, useEffect, useRef } from 'react';
import { X, User, Package, Calendar, Clock, MessageSquare, Save, Loader2 } from 'lucide-react';
import { useCreativeWritingAdmin, CreativeWritingBooking } from '../../contexts/admin/CreativeWritingAdminContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/helpers';

interface BookingDetailsModalProps {
  booking: CreativeWritingBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, isOpen, onClose }) => {
  const { updateBookingProgressNotes } = useCreativeWritingAdmin();
  const { addToast } = useToast();
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (booking) {
      setNotes(booking.progress_notes || '');
    }
  }, [booking]);
  
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);


  if (!isOpen || !booking) return null;
  
  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
        await updateBookingProgressNotes(booking.id, notes);
        addToast('تم حفظ الملاحظات بنجاح.', 'success');
        onClose();
    } catch (e) {
        addToast('حدث خطأ أثناء حفظ الملاحظات.', 'error');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-12" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 m-4 animate-fadeIn max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="booking-modal-title" className="text-2xl font-bold text-gray-800">تفاصيل الحجز</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border">
                 <div>
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><User size={16}/> الطالب</p>
                    <p className="text-gray-800 font-bold text-lg">{booking.user_name}</p>
                </div>
                 <div>
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><User size={16}/> المدرب</p>
                    <p className="text-gray-800 font-bold text-lg">{(booking as any).instructors?.name || 'غير محدد'}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><Package size={16}/> الباقة</p>
                    <p className="text-gray-800">{booking.package_name}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><Calendar size={16}/> التاريخ</p>
                    <p className="text-gray-800">{formatDate(booking.booking_date)}</p>
                </div>
                 <div>
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><Clock size={16}/> الوقت</p>
                    <p className="text-gray-800">{booking.booking_time}</p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <MessageSquare /> ملاحظات التقدم
                </h3>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="اكتب ملاحظاتك حول تقدم الطالب هنا..."
                />
            </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-6 mt-8 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
            <button 
                onClick={handleSaveNotes} 
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الملاحظات'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;