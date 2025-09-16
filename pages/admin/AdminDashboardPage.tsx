import React, { useState, useMemo } from 'react';
import { ShoppingBag, Gift, Users, DollarSign, Feather, CheckSquare, Bell } from 'lucide-react';
import { useAdmin, IOrderDetails, Subscription } from '../../contexts/AdminContext';
import { useCreativeWritingAdmin } from '../../contexts/admin/CreativeWritingAdminContext';
// FIX: Added .ts extension to resolve module error.
import { getStatusColor, formatDate } from '../../utils/helpers.ts';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';
import BarChart from '../../components/admin/BarChart';
import ViewOrderModal from '../../components/admin/ViewOrderModal';
// FIX: Added .tsx extension to resolve module error.
import { useAuth } from '../../contexts/AuthContext.tsx';

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
  const { orders, users, personalizedProducts, subscriptions, loading: adminLoading, error: adminError } = useAdmin();
  const { creativeWritingBookings, instructors, loading: cwLoading, error: cwError } = useCreativeWritingAdmin();
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderDetails | null>(null);
  
  const loading = adminLoading || cwLoading;
  const error = adminError || cwError;

  const { totalRevenue, totalStudents } = useMemo(() => {
    const parseCurrency = (value: string | number | null) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        }
        return 0;
    };

    const completedOrdersRevenue = orders
        .filter(o => o.status === 'تم التسليم')
        .reduce((acc, order) => acc + parseCurrency(order.total), 0);

    const completedBookingsRevenue = creativeWritingBookings
        .filter(b => b.status === 'مكتمل')
        .reduce((acc, booking) => acc + parseCurrency(booking.total), 0);

    const totalRevenue = completedOrdersRevenue + completedBookingsRevenue;

    const uniqueStudentIds = new Set(creativeWritingBookings.map(b => b.user_id));
    const totalStudents = uniqueStudentIds.size;
    
    return { 
        totalRevenue: totalRevenue.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }),
        totalStudents
    };
  }, [orders, creativeWritingBookings]);

  const upcomingRenewals = useMemo(() => {
    if (!subscriptions) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return subscriptions
        .filter(sub => sub.status === 'active')
        .map(sub => {
            const renewalDate = new Date(sub.next_renewal_date);
            renewalDate.setHours(0, 0, 0, 0);
            const diffTime = renewalDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { ...sub, daysUntilRenewal: diffDays };
        })
        .filter(sub => sub.daysUntilRenewal >= 0 && sub.daysUntilRenewal <= 7)
        .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
  }, [subscriptions]);

  const recentOrders = orders.slice(0, 5);
  const recentBookings = creativeWritingBookings.slice(0, 5);
  
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
  
  const getDaysRemainingColor = (days: number) => {
    if (days <= 2) return 'text-red-600 font-bold';
    if (days <= 5) return 'text-orange-600 font-semibold';
    return 'text-yellow-700';
  };

  return (
    <>
      <ViewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
      <div className="animate-fadeIn">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8">لوحة التحكم</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(role === 'super_admin' || role === 'enha_lak_supervisor') && (
            <StatCard title="إجمالي الطلبات ('إنها لك')" value={orders.length.toString()} icon={<ShoppingBag className="text-white" />} color="bg-blue-500" />
          )}
          {(role === 'super_admin' || role === 'creative_writing_supervisor') && (
            <StatCard title="إجمالي الحجوزات (الكتابة)" value={creativeWritingBookings.length.toString()} icon={<CheckSquare className="text-white" />} color="bg-teal-500" />
          )}
          {role === 'super_admin' && (
            <>
              <StatCard title="الإيرادات المكتملة" value={totalRevenue} icon={<DollarSign className="text-white" />} color="bg-yellow-500" />
              <StatCard title="المستخدمون" value={users.length.toString()} icon={<Users className="text-white" />} color="bg-purple-500" />
            </>
          )}
           {(role === 'super_admin' || role === 'enha_lak_supervisor') && (
            <StatCard title="منتجات 'إنها لك'" value={personalizedProducts.length.toString()} icon={<Gift className="text-white" />} color="bg-green-500" />
          )}
          {(role === 'super_admin' || role === 'creative_writing_supervisor') && (
            <StatCard title="المدربون" value={instructors.length.toString()} icon={<Feather className="text-white" />} color="bg-indigo-500" />
          )}
           {(role === 'super_admin' || role === 'creative_writing_supervisor') && (
            <StatCard title="إجمالي الطلاب (الكتابة)" value={totalStudents.toString()} icon={<Users className="text-white" />} color="bg-pink-500" />
          )}
        </div>

        {(role === 'super_admin' || role === 'enha_lak_supervisor') && upcomingRenewals.length > 0 && (
             <div className="mt-12">
                <AdminSection title="تنبيهات تجديد الاشتراك" icon={<Bell />}>
                    <div className="space-y-4">
                        {upcomingRenewals.map(sub => (
                            <div key={sub.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <p className="font-bold text-gray-800">{sub.user_name} (الطفل: {sub.child_name})</p>
                                    <p className="text-sm text-gray-600">تاريخ التجديد: {formatDate(sub.next_renewal_date)}</p>
                                </div>
                                <div className={`text-sm text-right ${getDaysRemainingColor(sub.daysUntilRenewal)}`}>
                                   {sub.daysUntilRenewal === 0 ? 'اليوم' : `يتبقى ${sub.daysUntilRenewal} أيام`}
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminSection>
             </div>
        )}

        {(role === 'super_admin' || role === 'enha_lak_supervisor') && (
            <div className="mt-12">
                <BarChart title="توزيع حالات الطلبات" data={chartData} />
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {(role === 'super_admin' || role === 'enha_lak_supervisor') && (
            <div className="bg-white p-6 rounded-2xl shadow-md">
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
          )}
           {(role === 'super_admin' || role === 'creative_writing_supervisor') && (
                <div className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">الحجوزات الأخيرة</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 px-2 font-semibold text-gray-600">العميل</th>
                                <th className="py-2 px-2 font-semibold text-gray-600">المدرب</th>
                                <th className="py-2 px-2 font-semibold text-gray-600">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.length > 0 ? recentBookings.map(booking => (
                               <tr key={booking.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-2">{booking.user_name}</td>
                                    <td className="py-3 px-2">{booking.instructors?.name || '-'}</td>
                                    <td className="py-3 px-2"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-gray-500">
                                        لا توجد حجوزات حديثة.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </div>
           )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;