import React, { useState } from 'react';
import { ShoppingBag, Gift, Users, DollarSign } from 'lucide-react';
import { useAdmin, IOrderDetails } from '../../contexts/AdminContext';
import { getStatusColor } from '../../utils/helpers';
import PageLoader from '../../components/ui/PageLoader';
import BarChart from '../../components/admin/BarChart';
import ViewOrderModal from '../../components/admin/ViewOrderModal';

const statusColors: { [key: string]: string } = {
    'تم التسليم': '#10B981', 
    'مكتمل': '#10B981', 
    'تم الشحن': '#3B82F6', 
    'مؤكد': '#3B82F6',
    'قيد التجهيز': '#F59E0B', 
    'بانتظار المراجعة': '#6366F1',
    'بانتظار الدفع': '#9CA3AF',
    'يحتاج مراجعة': '#F97316',
    'ملغي': '#EF4444',
    'نشط': '#6366F1',
};


const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between transition-transform transform hover:-translate-y-1">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-extrabold text-gray-800">{value}</p>
        </div>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
    </div>
);

const AdminDashboardPage: React.FC = () => {
  const { orders, users, personalizedProducts, loading, error } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderDetails | null>(null);
  
  const revenue = "15,750 ج.م"; // Dummy data
  const recentOrders = orders.slice(0, 5);
  
  if (loading) {
      return <PageLoader text="جاري تحميل بيانات لوحة التحكم..." />;
  }

  if (error) {
      return <div className="text-center text-red-500 text-lg bg-red-50 p-6 rounded-lg">{error}</div>;
  }
  
  const handleViewOrder = (order: IOrderDetails) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const orderStatusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const chartData = Object.entries(orderStatusCounts).map(([label, value]) => ({
    label,
    value,
    color: statusColors[label] || '#6B7280', // default gray
  }));

  return (
    <>
      <ViewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
      <div className="animate-fadeIn">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8">لوحة التحكم الرئيسية</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="إجمالي الطلبات" value={orders.length.toString()} icon={<ShoppingBag className="text-white" />} color="bg-blue-500" />
          <StatCard title="عدد المنتجات" value={personalizedProducts.length.toString()} icon={<Gift className="text-white" />} color="bg-green-500" />
          <StatCard title="عدد المستخدمين" value={users.length.toString()} icon={<Users className="text-white" />} color="bg-purple-500" />
          <StatCard title="الإيرادات (تجريبي)" value={revenue} icon={<DollarSign className="text-white" />} color="bg-yellow-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-12">
          <div className="lg:col-span-3">
               <BarChart title="توزيع حالات الطلبات" data={chartData} />
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">الطلبات الأخيرة</h2>
              <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                      <thead>
                          <tr className="border-b">
                              <th className="py-2 px-2 font-semibold text-gray-600">العميل</th>
                              <th className="py-2 px-2 font-semibold text-gray-600">الحالة</th>
                              <th className="py-2 px-2 font-semibold text-gray-600">الإجمالي</th>
                          </tr>
                      </thead>
                      <tbody>
                          {recentOrders.length > 0 ? recentOrders.map(order => (
                             <tr key={order.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleViewOrder(order)}>
                                  <td className="py-3 px-2">{order.customer_name}</td>
                                  <td className="py-3 px-2"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                  <td className="py-3 px-2">{order.total}</td>
                              </tr>
                          )) : (
                              <tr>
                                  <td colSpan={3} className="text-center py-8 text-gray-500">
                                      لا توجد طلبات حديثة.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
