import React, { useState } from 'react';
import { UserPlus, Eye, Link as LinkIcon } from 'lucide-react';
import { useAdmin, JoinRequest } from '../../contexts/AdminContext';
import { formatDate } from '../../utils/helpers';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';

const ViewRequestModal: React.FC<{
    request: JoinRequest | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ request, isOpen, onClose }) => {
    if (!isOpen || !request) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4" onClick={e => e.stopPropagation()}>
                 <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل الطلب</h3>
                 <div className="space-y-4 text-sm">
                    <p><span className="font-semibold text-gray-500">الاسم:</span> {request.name}</p>
                    <p><span className="font-semibold text-gray-500">البريد الإلكتروني:</span> {request.email}</p>
                    <p><span className="font-semibold text-gray-500">مهتم بالانضمام كـ:</span> {request.role}</p>
                     {request.portfolio_url && (
                        <p className="flex items-center gap-2">
                           <span className="font-semibold text-gray-500">معرض الأعمال:</span> 
                           <a href={request.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                             <LinkIcon size={14}/> <span>رابط</span>
                           </a>
                        </p>
                    )}
                    <div className="p-3 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                        <p className="whitespace-pre-wrap">{request.message}</p>
                    </div>
                 </div>
                 <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">إغلاق</button>
                 </div>
            </div>
        </div>
    );
};

const AdminJoinRequestsPage: React.FC = () => {
    const { joinRequests, updateJoinRequestStatus, loading, error } = useAdmin();
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
            <ViewRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} request={selectedRequest} />
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
