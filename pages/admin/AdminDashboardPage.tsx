import React, { useState, useMemo } from 'react';
import { ShoppingBag, Gift, Users, DollarSign, Feather, CheckSquare, Bell, FileText, MessageSquare, UserPlus, Star } from 'lucide-react';
import { useAdmin, IOrderDetails } from '../../contexts/AdminContext.tsx';
import { useCreativeWritingAdmin } from '../../contexts/admin/CreativeWritingAdminContext.tsx';
import { useCommunication } from '../../contexts/admin/CommunicationContext.tsx';
import { getStatusColor, formatDate } from '../../utils/helpers.ts';
import AdminSection from '../../components/admin/AdminSection.tsx';
import PageLoader from '../../components/ui/PageLoader.tsx';
import BarChart from '../../components/admin/BarChart.tsx';
import ViewOrderModal from '../../components/admin/ViewOrderModal.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import StatCard from '../../components/admin/StatCard.tsx';

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

const AdminDashboardPage: React.FC = () => {
  const { orders, users, personalizedProducts, subscriptions, blogPosts, loading: adminLoading, error: adminError } = useAdmin();
  const { creativeWritingBookings, instructors, loading: cwLoading, error: cwError } = useCreativeWritingAdmin();
  const { supportTickets, joinRequests, loading: commsLoading, error: commsError } = useCommunication();
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderDetails | null>(null);
  
  const loading = adminLoading || cwLoading || commsLoading;
  const error = adminError || cwError || commsError;

  const memoizedStats = useMemo(() => {
    const parseCurrency = (value: string | number | null) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        return 0;
    };

    const completedOrdersRevenue = orders.filter(o => o.status === 'تم التسليم').reduce((acc, order) => acc + parseCurrency(order.total), 0);
    const completedBookingsRevenue = creativeWritingBookings.filter(b => b.status === 'مكتمل').reduce((acc, booking) => acc + parseCurrency(booking.total), 0);
    const totalRevenue = (completedOrdersRevenue + completedBookingsRevenue).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 });

    const uniqueStudentIds = new Set(creativeWritingBookings.map(b => b.user_id));
    const totalStudents = uniqueStudentIds.size;
    
    const publishedPosts = blogPosts.filter(p => p.status === 'published').length;
    
    const newTickets = supportTickets.filter(t => t.status === 'جديدة').length;
    const newRequests = joinRequests.filter(r => r.status === 'جديد').length;

    return { totalRevenue, totalStudents, publishedPosts, newTickets, newRequests };
  }, [orders, creativeWritingBookings, blogPosts, supportTickets, joinRequests]);

  const upcomingRenewals = useMemo(() => {
    if (!subscriptions) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return subscriptions
        .filter(sub => sub.status === 'active')
        .map(sub => ({ ...sub, daysUntilRenewal: Math.ceil((new Date(sub.next_renewal_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) }))
        .filter(sub => sub.daysUntilRenewal >= 0 && sub.daysUntilRenewal <= 7)
        .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
  }, [subscriptions]);

  const monthlyRevenueData = useMemo(() => {
    if (role !== 'super_admin') return [];

    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return { year: d.getFullYear(), month: d.getMonth(), name: d.toLocaleString('ar-EG', { month: 'short' }) };
    }).reverse();

    const revenueByMonth: { [key: string]: number } = {};
    const parseCurrency = (value: string | number | null) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        return 0;
    };

    const completedOrders = orders.filter(o => o.status === 'تم التسليم');
    const completedBookings = creativeWritingBookings.filter(b => b.status === 'مكتمل');

    completedOrders.forEach(order => {
        const orderDate = new Date(order.order_date);
        const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
        revenueByMonth[key] = (revenueByMonth[key] || 0) + parseCurrency(order.total);
    });

    completedBookings.forEach(booking => {
        const bookingDate = new Date(booking.booking_date);
        const key = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`;
        revenueByMonth[key] = (revenueByMonth[key] || 0) + parseCurrency(booking.total);
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

    return months.map((m, index) => {
        const key = `${m.year}-${m.month}`;
        return {
            label: m.name,
            value: Math.round(revenueByMonth[key] || 0),
            color: colors[index % colors.length],
        };
    });
  }, [orders, creativeWritingBookings, role]);

  const orderStatusCounts = useMemo(() => {
    return orders.reduce((acc: { [key: string]: number }, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});
  }, [orders]);

  const orderStatusChartData = useMemo(() => {
    // FIX: Ensure value is a number to match ChartData type.
    return Object.entries(orderStatusCounts).map(([label, value]) => ({
        label, value: Number(value), color: statusColors[label] || '#6B7280',
    }));
  }, [orderStatusCounts]);
  
  const bookingStatusCounts = useMemo(() => {
    return creativeWritingBookings.reduce((acc: { [key: string]: number }, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
    }, {});
  }, [creativeWritingBookings]);

  const bookingStatusChartData = useMemo(() => {
    // FIX: Ensure value is a number to match ChartData type.
    return Object.entries(bookingStatusCounts).map(([label, value]) => ({
        label, value: Number(value), color: statusColors[label] || '#6B7280',
    }));
  }, [bookingStatusCounts]);


  if (loading) return <PageLoader text="جاري تحميل بيانات لوحة التحكم..." />;
  if (error) return <div className="text-center text-red-500 text-lg bg-red-50 p-6 rounded-lg">{error}</div>;
  
  const handleViewOrder = (order: IOrderDetails) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  
  const getDaysRemainingColor = (days: number) => {
    if (days <= 2) return 'text-red-600 font-bold';
    if (days <= 5) return 'text-orange-600 font-semibold';
    return 'text-yellow-700';
  };

  const renderRoleBasedContent = () => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['super_admin', 'enha_lak_supervisor'].includes(role!) && <>
                    <StatCard title="إجمالي الطلبات ('إنها لك')" value={orders.length} icon={<ShoppingBag className="text-white" />} color="bg-blue-500" />
                    <StatCard title="الاشتراكات النشطة" value={subscriptions.filter(s => s.status === 'active').length} icon={<Star className="text-white" />} color="bg-orange-500" />
                    <StatCard title="منتجات 'إنها لك'" value={personalizedProducts.length} icon={<Gift className="text-white" />} color="bg-green-500" />
                </>}
                {['super_admin', 'creative_writing_supervisor'].includes(role!) && <>
                    <StatCard title="إجمالي الحجوزات (الكتابة)" value={creativeWritingBookings.length} icon={<CheckSquare className="text-white" />} color="bg-teal-500" />
                    <StatCard title="إجمالي الطلاب (الكتابة)" value={memoizedStats.totalStudents} icon={<Users className="text-white" />} color="bg-pink-500" />
                    <StatCard title="المدربون" value={instructors.length} icon={<Feather className="text-white" />} color="bg-indigo-500" />
                </>}
                {['super_admin', 'content_editor'].includes(role!) && <>
                    <StatCard title="إجمالي المقالات" value={blogPosts.length} icon={<FileText className="text-white" />} color="bg-gray-500" />
                    <StatCard title="المقالات المنشورة" value={memoizedStats.publishedPosts} icon={<CheckSquare className="text-white" />} color="bg-gray-500" />
                </>}
                {['super_admin', 'support_agent'].includes(role!) && <>
                    <StatCard title="رسائل دعم جديدة" value={memoizedStats.newTickets} icon={<MessageSquare className="text-white" />} color="bg-cyan-500" />
                    <StatCard title="طلبات انضمام جديدة" value={memoizedStats.newRequests} icon={<UserPlus className="text-white" />} color="bg-cyan-500" />
                </>}
                {role === 'super_admin' && <>
                    <StatCard title="الإيرادات المكتملة" value={memoizedStats.totalRevenue} icon={<DollarSign className="text-white" />} color="bg-yellow-500" />
                    <StatCard title="المستخدمون" value={users.length} icon={<Users className="text-white" />} color="bg-purple-500" />
                </>}
            </div>

            {['super_admin', 'enha_lak_supervisor'].includes(role!) && upcomingRenewals.length > 0 && (
                <AdminSection title="تنبيهات تجديد الاشتراك" icon={<Bell />}>
                    <div className="space-y-2">
                        {upcomingRenewals.map(sub => (
                            <div key={sub.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded-md">
                                <p className="text-sm">سيتم تجديد اشتراك الطفل <strong>{sub.child_name}</strong> في {formatDate(sub.next_renewal_date)}</p>
                                <p className={`text-sm ${getDaysRemainingColor(sub.daysUntilRenewal)}`}>
                                    (خلال {sub.daysUntilRenewal} أيام)
                                </p>
                            </div>
                        ))}
                    </div>
                </AdminSection>
            )}

            <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-8">
                {role === 'super_admin' && (
                    <>
                        <BarChart title="توزيع حالات الطلبات" data={orderStatusChartData} />
                        <BarChart title="الإيرادات الشهرية (آخر 6 أشهر)" data={monthlyRevenueData} />
                    </>
                )}
                {role === 'enha_lak_supervisor' && (
                    <div className="xl:col-span-2">
                        <BarChart title="توزيع حالات الطلبات" data={orderStatusChartData} />
                    </div>
                )}
                 {role === 'creative_writing_supervisor' && (
                    <div className="xl:col-span-2">
                        <BarChart title="توزيع حالات الحجوزات" data={bookingStatusChartData} />
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                 {['super_admin', 'enha_lak_supervisor'].includes(role!) && (
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">الطلبات الأخيرة</h2>
                        {/* ... Recent orders table ... */}
                    </div>
                 )}
                 {['super_admin', 'creative_writing_supervisor'].includes(role!) && (
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">الحجوزات الأخيرة</h2>
                        {/* ... Recent bookings table ... */}
                    </div>
                 )}
                 {['super_admin', 'support_agent'].includes(role!) && (
                     <div className="bg-white p-6 rounded-2xl shadow-md">
                         <h2 className="text-xl font-bold text-gray-800 mb-4">أحدث رسائل الدعم</h2>
                         {/* ... Recent tickets table ... */}
                     </div>
                 )}
            </div>
        </>
    );
  }

  return (
    <>
      <ViewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
      <div className="animate-fadeIn">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8">لوحة التحكم</h1>
        {renderRoleBasedContent()}
      </div>
    </>
  );
};

export default AdminDashboardPage;
