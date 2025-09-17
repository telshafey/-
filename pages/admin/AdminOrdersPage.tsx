import React, { useState, useMemo } from 'react';
import { ShoppingBag, Filter, Search, Eye } from 'lucide-react';
// FIX: Added .tsx extension to the import of AdminContext to resolve module loading error.
import { useAdmin, IOrderDetails } from '../../contexts/AdminContext.tsx';
import { getStatusColor, formatDate } from '../../utils/helpers.ts';
// FIX: Added .tsx extension to AdminSection import to resolve module error.
import AdminSection from '../../components/admin/AdminSection.tsx';
// FIX: Added .tsx extension to PageLoader import to resolve module error.
import PageLoader from '../../components/ui/PageLoader.tsx';
// FIX: Added .tsx extension to ViewOrderModal import to resolve module error.
import ViewOrderModal from '../../components/admin/ViewOrderModal.tsx';

const orderStatusOptions: IOrderDetails['status'][] = ["بانتظار الدفع", "بانتظار المراجعة", "قيد التجهيز", "يحتاج مراجعة", "تم الشحن", "تم التسليم", "ملغي"];

const AdminOrdersPage: React.FC = () => {
    const { orders, updateOrderStatus, loading, error } = useAdmin();
    const [filter, setFilter] = useState<IOrderDetails['status'] | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<IOrderDetails | null>(null);

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => filter === 'all' || order.status === filter)
            .filter(order => 
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [orders, filter, searchTerm]);

    const handleViewOrder = (order: IOrderDetails) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    if (loading) return <PageLoader text="جاري تحميل الطلبات..." />;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <>
            <ViewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة طلبات "إنها لك"</h1>
                
                <AdminSection title="جميع الطلبات" icon={<ShoppingBag />}>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="ابحث بالرقم أو اسم العميل..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <select 
                                value={filter} 
                                onChange={e => setFilter(e.target.value as IOrderDetails['status'] | 'all')}
                                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-full appearance-none bg-white"
                            >
                                <option value="all">كل الحالات</option>
                                {orderStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
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
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4 font-mono text-sm">{order.id}</td>
                                        <td className="py-4 px-4">{order.customer_name}</td>
                                        <td className="py-4 px-4">{formatDate(order.order_date)}</td>
                                        <td className="py-4 px-4">{order.total}</td>
                                        <td className="py-4 px-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value as IOrderDetails['status'])}
                                                className={`border-0 rounded-full text-xs font-bold px-3 py-1 appearance-none ${getStatusColor(order.status)}`}
                                            >
                                                {orderStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button onClick={() => handleViewOrder(order)} className="text-gray-500 hover:text-blue-600">
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد طلبات تطابق معايير البحث.</p>}
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminOrdersPage;
