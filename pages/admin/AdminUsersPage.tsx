import React, { useState, useMemo } from 'react';
import { User as UserIcon, Shield, Users, Search, Link as LinkIcon, Link2Off, Plus, Edit } from 'lucide-react';
import { useAdmin, User, ChildProfile } from '../../contexts/AdminContext.tsx';
// FIX: Corrected import path for useCreativeWritingAdmin.
import { useCreativeWritingAdmin, CreativeWritingBooking } from '../../contexts/admin/CreativeWritingAdminContext.tsx';
// FIX: Added .tsx extension to AdminSection import to resolve module error.
import AdminSection from '../../components/admin/AdminSection.tsx';
// FIX: Added .tsx extension to PageLoader import to resolve module error.
import PageLoader from '../../components/ui/PageLoader.tsx';
// FIX: Added .ts extension to formatDate import to resolve module error.
import { formatDate } from '../../utils/helpers.ts';
// FIX: Added .tsx extension to ViewUserModal import to resolve module error.
import ViewUserModal from '../../components/admin/ViewUserModal.tsx';
import { UserProfile } from '../../contexts/AuthContext.tsx';
import LinkStudentModal from '../../components/admin/LinkStudentModal.tsx';
import EditUserModal from '../../components/admin/EditUserModal.tsx';

const roleNames: { [key in UserProfile['role']]: string } = {
    user: 'مستخدم',
    super_admin: 'مدير عام',
    enha_lak_supervisor: 'مشرف "إنها لك"',
    creative_writing_supervisor: 'مشرف "بداية الرحلة"',
    instructor: 'مدرب',
    student: 'طالب',
    content_editor: 'محرر محتوى',
    support_agent: 'وكيل دعم'
};

const staffRoles: UserProfile['role'][] = [
    'user',
    'super_admin',
    'enha_lak_supervisor',
    'creative_writing_supervisor',
    'instructor',
    'student',
    'content_editor',
    'support_agent'
];

const AdminUsersPage: React.FC = () => {
    const { users, updateUserRole, orders, allChildProfiles, addUser, updateUser, loading, error } = useAdmin();
    const { creativeWritingBookings } = useCreativeWritingAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);
    
    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleOpenLinkModal = (user: User) => {
        setSelectedUser(user);
        setIsLinkModalOpen(true);
    };
    
    const handleOpenEditModal = (user: User | null) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (payload: any) => {
        setIsSaving(true);
        try {
            if (payload.id) { // Editing existing user
                await updateUser(payload.id, payload.name);
            } else { // Adding new user
                await addUser(payload);
            }
            setIsEditModalOpen(false);
        } catch (e) {
            // Error is handled by context's toast
        } finally {
            setIsSaving(false);
        }
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
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            user={selectedUser}
            userOrders={selectedUser ? orders.filter(o => o.user_id === selectedUser.id) : []}
            userBookings={selectedUser ? creativeWritingBookings.filter(b => b.user_id === selectedUser.id) : []}
        />
        <LinkStudentModal
            isOpen={isLinkModalOpen}
            onClose={() => setIsLinkModalOpen(false)}
            user={selectedUser}
        />
        <EditUserModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={selectedUser}
            onSave={handleSaveUser}
            isSaving={isSaving}
        />
        <div className="animate-fadeIn space-y-12">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المستخدمين</h1>
                <button onClick={() => handleOpenEditModal(null)} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
                    <Plus size={18}/> <span>إضافة مستخدم جديد</span>
                </button>
            </div>
            
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
                                <th className="py-3 px-4 font-semibold text-gray-600">تاريخ التسجيل</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">الدور</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">الطفل المرتبط</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const linkedChild = user.role === 'student' ? allChildProfiles.find(c => c.student_user_id === user.id) : null;
                                    return (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="py-4 px-4">
                                                <p className="font-medium text-gray-800">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </td>
                                            {/* FIX: user.created_at is now available on the UserProfile type */}
                                            <td className="py-4 px-4 text-gray-600">{formatDate(user.created_at)}</td>
                                            <td className="py-4 px-4">
                                                {/* FIX: Cast e.target.value to the expected role type to satisfy TypeScript */}
                                                <select 
                                                    value={user.role}
                                                    onChange={(e) => updateUserRole(user.id, e.target.value as UserProfile['role'])}
                                                    className="border rounded-full text-xs font-bold px-3 py-1 appearance-none bg-gray-100 text-gray-800 border-gray-200"
                                                >
                                                   {staffRoles.map(role => (
                                                        <option key={role} value={role}>{roleNames[role]}</option>
                                                   ))}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                {user.role === 'student' ? (
                                                    linkedChild ? (
                                                        <span className="text-sm font-semibold text-green-700">{linkedChild.name}</span>
                                                    ) : (
                                                        <span className="text-sm text-yellow-700">غير مربوط</span>
                                                    )
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 flex items-center gap-2">
                                                <button onClick={() => handleViewUser(user)} className="p-2 text-gray-500 hover:text-blue-600" title="عرض التفاصيل">
                                                    <UserIcon size={18} />
                                                </button>
                                                 <button onClick={() => handleOpenEditModal(user)} className="p-2 text-gray-500 hover:text-yellow-600" title="تعديل المستخدم">
                                                    <Edit size={18} />
                                                </button>
                                                {user.role === 'student' && (
                                                    <button onClick={() => handleOpenLinkModal(user)} className="p-2 text-gray-500 hover:text-green-600" title="ربط بحساب طفل">
                                                        <LinkIcon size={18} />
                                                    </button>
                                                )}
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
