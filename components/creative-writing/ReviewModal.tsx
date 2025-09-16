import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Star, Send } from 'lucide-react';
import { useCreativeWritingAdmin } from '../../contexts/admin/CreativeWritingAdminContext';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    instructorId?: number;
    instructorName?: string;
    studentName: string;
    userId: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, instructorId, instructorName, studentName, userId }) => {
    const { addReview } = useCreativeWritingAdmin();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setHoverRating(0);
            setComment('');
        }
    }, [isOpen]);

     useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        closeButtonRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instructorId || rating === 0) {
            alert('Please provide a rating.');
            return;
        }
        setIsSaving(true);
        try {
            await addReview({
                instructorId,
                rating,
                comment,
                studentName,
                userId,
            });
            onClose();
        } catch (error) {
            console.error("Failed to save review", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="review-modal-title" className="text-2xl font-bold text-gray-800">تقييم الجلسة</h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <p className="text-center text-gray-600 mb-6">ما هو تقييمك للجلسة مع المدرب <span className="font-bold">{instructorName}</span>؟</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 text-center">التقييم*</label>
                        <div className="flex justify-center items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    className="p-1"
                                    aria-label={`Rate ${star} stars`}
                                >
                                    <Star 
                                        size={32}
                                        className={`transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                        fill="currentColor"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="comment" className="block text-sm font-bold text-gray-700 mb-2">أضف تعليقًا (اختياري)</label>
                        <textarea 
                            id="comment" 
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                            rows={4}
                            placeholder="شاركنا رأيك في الجلسة..."
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">
                            إلغاء
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving || rating === 0} 
                            className="w-40 flex items-center justify-center gap-2 px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                        >
                           {isSaving ? <Loader2 className="animate-spin"/> : <Send size={16}/>}
                           <span>{isSaving ? 'جاري الإرسال' : 'إرسال التقييم'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
