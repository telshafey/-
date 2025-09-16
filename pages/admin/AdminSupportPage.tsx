import React, { useState } from 'react';
import { MessageSquare, Eye, Inbox } from 'lucide-react';
import { useCommunication, SupportTicket } from '../../contexts/admin/CommunicationContext';
// FIX: Added .ts extension to resolve module error.
import { formatDate } from '../../utils/helpers.ts';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';
import ViewTicketModal from '../../components/admin/ViewTicketModal.tsx';

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
