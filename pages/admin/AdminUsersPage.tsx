import React from 'react';
import { User as UserIcon, Shield, Loader2, Users } from 'lucide-react';
import { useAdmin, User } from '../../contexts/AdminContext';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';

const AdminUsersPage: React.FC = () => {
    const { users, updateUserRole, loading, error } = useAdmin();

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        await updateUserRole(userId, newRole);
    };
    
    if (loading) {
        return <PageLoader text="جاري تحميل المستخدمين..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 text-lg bg-red-50 p-6 rounded-lg">{error}</div>;
    }


  return (
    <div className="animate-fadeIn space-y-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المستخدمين</h1>
      
      <AdminSection title="جميع المستخدمين المسجلين" icon={<Users />}>
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="border-b-2 border-gray-200">
                    <tr>
                        <th className="py-3 px-4 font-semibold text-gray-600">اسم المستخدم</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">البريد الإلكتروني</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">الدور</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-4 px-4 font-medium text-gray-800">{user.name}</td>
                                <td className="py-4 px-4 text-gray-600">{user.email}</td>
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
                            </tr>
                        ))
                    ) : (
                         <tr>
                            <td colSpan={3} className="text-center py-8 text-gray-500">
                                لا يوجد مستخدمون مسجلون حاليًا.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </AdminSection>
    </div>
  );
};

export default AdminUsersPage;