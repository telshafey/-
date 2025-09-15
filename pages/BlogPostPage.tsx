
import React, { useEffect } from 'react';
// FIX: Replaced the 'react-router-dom' namespace import with named imports to resolve component and hook resolution errors, and updated the code to use them directly.
import { useParams, Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import PageLoader from '../components/ui/PageLoader';
// FIX: Added .ts extension to resolve module error.
import { formatDate } from '../utils/helpers.ts';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import ShareButtons from '../components/shared/ShareButtons';

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { blogPosts, loading, error } = useAdmin();
    const postUrl = window.location.href;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);
    
    if (loading) {
        return <PageLoader text="جاري تحميل المقال..." />;
    }

    const post = blogPosts.find(p => p.slug === slug && p.status === 'published');

    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }

    if (!post) {
        return (
            <div className="text-center py-20 min-h-[50vh] flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold text-gray-800">لم يتم العثور على المقال</h1>
                <Link to="/blog" className="text-blue-600 hover:underline mt-4 inline-block">
                    العودة إلى المدونة
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8">
                    <Link to="/blog" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors">
                        <ArrowLeft size={20} />
                        <span>العودة إلى جميع المقالات</span>
                    </Link>
                </div>

                <article>
                    <header className="mb-6 border-b pb-6">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 leading-tight mb-4">{post.title}</h1>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <User size={16} />
                                    <span>{post.author_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{formatDate(post.published_at)}</span>
                                </div>
                            </div>
                            <ShareButtons title={post.title} url={postUrl} label="شارك المقال:" />
                        </div>
                    </header>

                    {post.image_url && (
                        <div className="my-10 rounded-2xl overflow-hidden shadow-xl">
                            <img src={post.image_url} alt={post.title} className="w-full h-auto object-cover" loading="lazy" />
                        </div>
                    )}

                    <div className="prose prose-lg max-w-none text-gray-700 leading-loose">
                        {post.content.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPostPage;
