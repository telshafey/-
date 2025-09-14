import React, { useState } from 'react';
import { MessageSquare, Eye, Inbox } from 'lucide-react';
import { useCommunication, SupportTicket } from '../../contexts/admin/CommunicationContext';
import { formatDate } from '../../utils/helpers';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';

const ViewTicketModal: React.FC<{
    ticket: SupportTicket | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ ticket, isOpen, onClose }) => {
    if (!isOpen || !ticket) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4" onClick={e => e.stopPropagation()}>
                 <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل الرسالة</h3>
                 <div className="space-y-4 text-sm">
                    <p><span className="font-semibold text-gray-500">من:</span> {ticket.name} ({ticket.email})</p>
                    <p><span className="font-semibold text-gray-500">الموضوع:</span> {ticket.subject}</p>
                    <div className="p-3 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                        <p className="whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                 </div>
                 <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">إغلاق</button>
                 </div>
            </div>
        </div>
    );
};

const AdminSupportPage: React.FC = () => {
    const { supportTickets, updateSupportTicketStatus, loading, error } = useCommunication();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    const statusOptions: SupportTicket['status'][] = ['جديدة', 'تمت المراجعة', 'مغلقة'];
    
    const getStatusColor = (status: SupportTicket['status']) => {
        switch (status) {
            case 'جديدة': return 'bg-blue-100 text-blue-800';
            case 'تمت المراجعة': return 'bg-yellow-100 text-yellow-800';
            case 'مغلقة': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    if (loading) return <PageLoader text="جاري تحميل رسائل الدعم..." />;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <>
            <ViewTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ticket={selectedTicket} />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">رسائل الدعم</h1>
                <AdminSection title="الرسائل الواردة" icon={<Inbox />}>
                     <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الاسم</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الموضوع</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">تاريخ الإرسال</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الحالة</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supportTickets.map(ticket => (
                                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4">{ticket.name}</td>
                                        <td className="py-4 px-4">{ticket.subject}</td>
                                        <td className="py-4 px-4">{formatDate(ticket.created_at)}</td>
                                        <td className="py-4 px-4">
                                            <select 
                                                value={ticket.status}
                                                onChange={(e) => updateSupportTicketStatus(ticket.id, e.target.value as SupportTicket['status'])}
                                                className={`border-0 rounded-full text-xs font-bold px-3 py-1 appearance-none ${getStatusColor(ticket.status)}`}
                                            >
                                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button onClick={() => handleViewTicket(ticket)} className="text-gray-500 hover:text-blue-600">
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminSupportPage;