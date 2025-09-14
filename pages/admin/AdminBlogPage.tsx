import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdmin, BlogPost } from '../../contexts/AdminContext';
import { formatDate } from '../../utils/helpers';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';
import BlogPostModal from '../../components/admin/BlogPostModal';

const AdminBlogPage: React.FC = () => {
    const { blogPosts, loading, error, createBlogPost, updateBlogPost, deleteBlogPost } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenModal = (post: BlogPost | null) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const handleSavePost = async (payload: any) => {
        setIsSaving(true);
        try {
            if (payload.id) {
                await updateBlogPost(payload);
            } else {
                await createBlogPost(payload);
            }
            setIsModalOpen(false);
        } catch(e) {
            console.error(e); // Toast is handled in context
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المقال؟')) {
            await deleteBlogPost(postId);
        }
    };

    if (loading) return <PageLoader text="جاري تحميل المدونة..." />;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <>
            <BlogPostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePost}
                post={selectedPost}
                isSaving={isSaving}
            />
            <div className="animate-fadeIn space-y-12">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المدونة</h1>
                    <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
                        <Plus size={18} /><span>مقال جديد</span>
                    </button>
                </div>

                <AdminSection title="جميع المقالات" icon={<BookOpen />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 font-semibold text-gray-600">العنوان</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الكاتب</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">تاريخ النشر</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الحالة</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogPosts.map(post => (
                                    <tr key={post.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4 font-semibold text-gray-800">{post.title}</td>
                                        <td className="py-4 px-4 text-gray-600">{post.author_name}</td>
                                        <td className="py-4 px-4 text-gray-600">{post.published_at ? formatDate(post.published_at) : '-'}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {post.status === 'published' ? 'منشور' : 'مسودة'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 flex items-center gap-4">
                                            <button onClick={() => handleOpenModal(post)} className="text-gray-500 hover:text-blue-600"><Edit size={20} /></button>
                                            <button onClick={() => handleDeletePost(post.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={20} /></button>
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

export default AdminBlogPage;