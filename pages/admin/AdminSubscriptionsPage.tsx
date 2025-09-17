import React from 'react';
import { Star } from 'lucide-react';
// FIX: Added .tsx extension to the import of AdminContext to resolve module loading error.
import { useAdmin, Subscription } from '../../contexts/AdminContext.tsx';
// FIX: Added .ts extension to resolve module error.
import { formatDate } from '../../utils/helpers.ts';
// FIX: Added .tsx extension to AdminSection import to resolve module error.
import AdminSection from '../../components/admin/AdminSection.tsx';
// FIX: Added .tsx extension to PageLoader import to resolve module error.
import PageLoader from '../../components/ui/PageLoader.tsx';

const AdminSubscriptionsPage: React.FC = () => {
    const { subscriptions, loading, error } = useAdmin();

    const getStatusColor = (status: Subscription['status']) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getStatusText = (status: Subscription['status']) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'paused': return 'متوقف مؤقتاً';
            case 'cancelled': return 'ملغي';
            default: return status;
        }
    }

    if (loading) {
        // FIX: Replaced empty return with a PageLoader component to ensure a valid React node is always returned, fixing the component type and lazy loading errors.
        return <PageLoader text="جاري تحميل الاشتراكات..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة الاشتراكات</h1>
            <AdminSection title="جميع الاشتراكات" icon={<Star />}>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className="py-3 px-4 font-semibold text-gray-600">المشترك</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">الطفل</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">تاريخ البدء</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">التجديد القادم</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map(sub => (
                                <tr key={sub.id} className="border-b hover:bg-gray-50">
                                    <td className="py-4 px-4">{sub.user_name}</td>
                                    <td className="py-4 px-4">{sub.child_name}</td>
                                    <td className="py-4 px-4">{formatDate(sub.start_date)}</td>
                                    <td className="py-4 px-4">{formatDate(sub.next_renewal_date)}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(sub.status)}`}>
                                            {getStatusText(sub.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {subscriptions.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد اشتراكات حاليًا.</p>}
                </div>
            </AdminSection>
        </div>
    );
};

export default AdminSubscriptionsPage;
