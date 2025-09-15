



import React from 'react';
// FIX: Replaced the 'react-router-dom' namespace import with a named import for 'Link' to resolve component resolution errors.
import { Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import PageLoader from '../components/ui/PageLoader';
// FIX: Added .ts extension to resolve module error.
import { formatDate } from '../utils/helpers.ts';
import { ArrowLeft } from 'lucide-react';

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
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">مدونة "إنها لك"</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                        مقالات ونصائح تربوية وإبداعية لمساعدتكم في رحلة تنمية أطفالكم.
                    </p>
                </div>

                {publishedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {publishedPosts.map(post => (
                            <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 border">
                                <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                                    <img src={post.image_url || 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg'} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                                    <p className="text-sm text-gray-500 mt-2">
                                        بواسطة {post.author_name} &bull; {formatDate(post.published_at)}
                                    </p>
                                    <p className="mt-4 text-gray-600 text-sm flex-grow line-clamp-3">
                                        {post.content}
                                    </p>
                                    <div className="mt-6 flex items-center font-semibold text-blue-600">
                                        <span>اقرأ المزيد</span>
                                        <ArrowLeft size={20} className="ms-2 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <h2 className="text-xl font-semibold">لا توجد مقالات منشورة حالياً</h2>
                        <p>يرجى العودة قريباً للاطلاع على جديدنا.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
