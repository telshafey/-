import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext.tsx';
import PageLoader from '../components/ui/PageLoader';
import { formatDate } from '../utils/helpers.ts';
import { ArrowLeft, BookOpen } from 'lucide-react';
import PostCard from '../components/shared/PostCard.tsx';


const BlogPage: React.FC = () => {
    const { blogPosts, loading, error } = useAdmin();

    const publishedPosts = blogPosts.filter(p => p.status === 'published');

    if (loading) {
        return <PageLoader text="جاري تحميل المدونة..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="bg-white py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">مدونة "الرحلة"</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        مقالات ونصائح تربوية وإبداعية لمساعدتكم في رحلة تنمية أطفالكم.
                    </p>
                </div>

                {publishedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {publishedPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
                        <h2 className="mt-4 text-xl font-semibold">لا توجد مقالات منشورة حالياً</h2>
                        <p>يرجى العودة قريباً للاطلاع على جديدنا.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
