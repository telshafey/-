import React, { useState } from 'react';
import { UserPlus, Eye, Link as LinkIcon } from 'lucide-react';
import { useCommunication, JoinRequest } from '../../contexts/admin/CommunicationContext';
// FIX: Added .ts extension to resolve module error.
import { formatDate } from '../../utils/helpers.ts';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';
import ViewJoinRequestModal from '../../components/admin/ViewJoinRequestModal.tsx';

const AdminJoinRequestsPage: React.FC = () => {
    const { joinRequests, updateJoinRequestStatus, loading, error } = useCommunication();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);

    const statusOptions: JoinRequest['status'][] = ['جديد', 'تمت المراجعة', 'مقبول', 'مرفوض'];

    const getStatusColor = (status: JoinRequest['status']) => {
        switch (status) {
            case 'جديد': return 'bg-blue-100 text-blue-800';
            case 'تمت المراجعة': return 'bg-yellow-100 text-yellow-800';
            case 'مقبول': return 'bg-green-100 text-green-800';
            case 'مرفوض': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleViewRequest = (request: JoinRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    if (loading) return <PageLoader text="جاري تحميل طلبات الانضمام..." />;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <>
            <ViewJoinRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} request={selectedRequest} />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">طلبات الانضمام</h1>
                <AdminSection title="الطلبات الواردة" icon={<UserPlus />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الاسم</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الدور المطلوب</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">تاريخ الإرسال</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الحالة</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {joinRequests.map(request => (
                                    <tr key={request.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4">{request.name}</td>
                                        <td className="py-4 px-4">{request.role}</td>
                                        <td className="py-4 px-4">{formatDate(request.created_at)}</td>
                                        <td className="py-4 px-4">
                                            <select 
                                                value={request.status}
                                                onChange={(e) => updateJoinRequestStatus(request.id, e.target.value as JoinRequest['status'])}
                                                className={`border-0 rounded-full text-xs font-bold px-3 py-1 appearance-none ${getStatusColor(request.status)}`}
                                            >
                                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button onClick={() => handleViewRequest(request)} className="text-gray-500 hover:text-blue-600">
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

export default AdminJoinRequestsPage;
