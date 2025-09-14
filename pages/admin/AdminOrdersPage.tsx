import React, { useState, useMemo } from 'react';
import { Eye, Search, ShoppingBag } from 'lucide-react';
import ViewOrderModal from '../../components/admin/ViewOrderModal';
import { useAdmin, IOrderDetails } from '../../contexts/AdminContext';
import { getStatusColor, formatDate } from '../../utils/helpers';
import { useToast } from '../../contexts/ToastContext';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';

const statusOptions: IOrderDetails['status'][] = ['بانتظار الدفع', 'بانتظار المراجعة', 'قيد التجهيز', 'يحتاج مراجعة', 'تم الشحن', 'تم التسليم', 'ملغي'];

const AdminOrdersPage: React.FC = () => {
    const { orders, updateOrderStatus, loading, error } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<IOrderDetails | null>(null);
    const { addToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            const matchesSearch = searchTerm.trim() === '' ||
                order.customer_name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase().trim());
            return matchesStatus && matchesSearch;
        });
    }, [orders, searchTerm, statusFilter]);


    const handleStatusChange = async (orderId: string, newStatus: IOrderDetails['status']) => {
        await updateOrderStatus(orderId, newStatus);
    };

    const handleViewOrder = (order: IOrderDetails) => {
        if(order.details) {
            setSelectedOrder(order);
            setIsModalOpen(true);
        } else {
            addToast('لا توجد تفاصيل إضافية لهذا الطلب.', 'info');
        }
    };
    
    if (loading) {
        return <PageLoader text="جاري تحميل الطلبات..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 text-lg bg-red-50 p-6 rounded-lg">{error}</div>;
    }


  return (
    <>
        <div className="animate-fadeIn space-y-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة الطلبات</h1>
        
        <AdminSection title="جميع الطلبات" icon={<ShoppingBag />}>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <input 
                        type="text"
                        placeholder="ابحث بالاسم أو رقم الطلب..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-full bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">كل الحالات</option>
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="border-b-2 border-gray-200">
                        <tr>
                            <th className="py-3 px-4 font-semibold text-gray-600">رقم الطلب</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">العميل</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">التاريخ</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">الإجمالي</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">الحالة</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                    <td className="py-4 px-4 font-mono text-sm text-gray-800">{order.id}</td>
                                    <td className="py-4 px-4 text-gray-600">{order.customer_name}</td>
                                    <td className="py-4 px-4 text-gray-600">{formatDate(order.order_date)}</td>
                                    <td className="py-4 px-4 text-gray-800">{order.total}</td>
                                    <td className="py-4 px-4">
                                        <select 
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as IOrderDetails['status'])}
                                            className={`border-0 rounded-full text-xs font-bold px-3 py-1 appearance-none ${getStatusColor(order.status)}`}
                                        >
                                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button onClick={() => handleViewOrder(order)} className="text-gray-500 hover:text-blue-600" disabled={!order.details}>
                                            <Eye size={20} className={!order.details ? 'opacity-30' : ''}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                    لا توجد طلبات تطابق معايير البحث.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminSection>
        </div>
        <ViewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
    </>
  );
};

export default AdminOrdersPage;
