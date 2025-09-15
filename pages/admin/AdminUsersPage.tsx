import React, { useState, useMemo } from 'react';
import { User as UserIcon, Shield, Users, Search, Eye } from 'lucide-react';
import { useAdmin, User, IOrderDetails } from '../../contexts/AdminContext';
import { useCreativeWritingAdmin, CreativeWritingBooking } from '../../contexts/admin/CreativeWritingAdminContext';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';
import { formatDate } from '../../utils/helpers';
import ViewUserModal from '../../components/admin/ViewUserModal';

const AdminUsersPage: React.FC = () => {
    const { users, updateUserRole, orders, loading, error } = useAdmin();
    const { creativeWritingBookings } = useCreativeWritingAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        await updateUserRole(userId, newRole);
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);
    
    const userOrderCount = useMemo(() => {
        const counts = new Map<string, { orders: number, bookings: number }>();
        orders.forEach(o => {
            if (o.user_id) {
                const current = counts.get(o.user_id) || { orders: 0, bookings: 0 };
                current.orders++;
                counts.set(o.user_id, current);
            }
        });
         creativeWritingBookings.forEach(b => {
            if (b.user_id) {
                const current = counts.get(b.user_id) || { orders: 0, bookings: 0 };
                current.bookings++;
                counts.set(b.user_id, current);
            }
        });
        return counts;
    }, [orders, creativeWritingBookings]);

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    if (loading) {
        return <PageLoader text="جاري تحميل المستخدمين..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 text-lg bg-red-50 p-6 rounded-lg">{error}</div>;
    }

  return (
    <>
        <ViewUserModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            user={selectedUser}
            userOrders={selectedUser ? orders.filter(o => o.user_id === selectedUser.id) : []}
            userBookings={selectedUser ? creativeWritingBookings.filter(b => b.user_id === selectedUser.id) : []}
        />
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المستخدمين</h1>
            
            <AdminSection title="جميع المستخدمين المسجلين" icon={<Users />}>
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-300 rounded-full"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className="py-3 px-4 font-semibold text-gray-600">اسم المستخدم</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">البريد الإلكتروني</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">تاريخ التسجيل</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">الطلبات / الحجوزات</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">الدور</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const counts = userOrderCount.get(user.id) || { orders: 0, bookings: 0 };
                                    return (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="py-4 px-4 font-medium text-gray-800">{user.name}</td>
                                            <td className="py-4 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-4 px-4 text-gray-600">{formatDate(user.created_at)}</td>
                                            <td className="py-4 px-4 text-gray-600">{counts.orders} / {counts.bookings}</td>
                                            <td className="py-4 px-4">
                                                <select 
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                                                    className={`border rounded-full text-xs font-bold px-3 py-1 appearance-none ${user.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
                                                >
                                                    <option value="user">مستخدم</option>
                                                    <option value="admin">مدير</option>
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <button onClick={() => handleViewUser(user)} className="text-gray-500 hover:text-blue-600">
                                                    <Eye size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        لا يوجد مستخدمون يطابقون معايير البحث.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </AdminSection>
        </div>
    </>
  );
};

export default AdminUsersPage;