import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';
import { 
    Order, 
    PersonalizedProduct, 
    SocialLinks, 
    BlogPost, 
    Subscription, 
    ChildProfile as DbChildProfile,
    Database,
    Json,
    OrderDetailsJson
} from '../lib/database.types.ts';
import { UserProfile } from './AuthContext.tsx';

// --- Type Exports ---
export type User = UserProfile;
export type ChildProfile = DbChildProfile;
export type { PersonalizedProduct, Subscription, BlogPost };
export interface IOrderDetails extends Order {
    customer_name: string;
}
export interface TextContent {
  [pageKey: string]: {
    [elementKey: string]: string;
  };
}


// --- Context Definition ---
interface AdminContextType {
    orders: IOrderDetails[];
    users: User[];
    allChildProfiles: ChildProfile[];
    personalizedProducts: PersonalizedProduct[];
    socialLinks: SocialLinks;
    siteContent: TextContent;
    blogPosts: BlogPost[];
    subscriptions: Subscription[];
    loading: boolean;
    error: string | null;
    updateOrderStatus: (orderId: string, status: IOrderDetails['status']) => Promise<void>;
    updateOrderComment: (orderId: string, comment: string) => Promise<void>;
    updateUserRole: (userId: string, role: UserProfile['role']) => Promise<void>;
    updatePersonalizedProduct: (payload: any) => Promise<void>;
    addProduct: (payload: any) => Promise<void>;
    updateSocialLinks: (links: SocialLinks) => Promise<void>;
    updateSiteContent: (content: TextContent) => Promise<void>;
    createBlogPost: (post: any) => Promise<void>;
    updateBlogPost: (post: any) => Promise<void>;
    deleteBlogPost: (postId: number) => Promise<void>;
    createSubscription: (userId: string, userName: string, childId: number, childName: string, price: number) => Promise<Subscription>;
    createOrder: (payload: any) => Promise<Order>;
    confirmPayment: (itemId: string, itemType: 'order' | 'booking' | 'subscription', shippingDetails?: any) => Promise<void>;
    linkStudentToChildProfile: (studentUserId: string, childProfileId: number) => Promise<void>;
    unlinkStudentFromChildProfile: (childProfileId: number) => Promise<void>;
    addUser: (payload: any) => Promise<void>;
    updateUser: (userId: string, name: string) => Promise<void>;
    updateReceipt: (payload: {itemId: string, itemType: string, receiptFile: File}) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<IOrderDetails[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [allChildProfiles, setAllChildProfiles] = useState<ChildProfile[]>([]);
    const [personalizedProducts, setPersonalizedProducts] = useState<PersonalizedProduct[]>([]);
    const [socialLinks, setSocialLinks] = useState<SocialLinks>({id: 1, facebook_url: '', twitter_url: '', instagram_url: ''});
    const [siteContent, setSiteContent] = useState<TextContent>({});
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ordersRes, usersRes, productsRes, socialRes, contentRes, blogRes, subsRes, childrenRes] = await Promise.all([
                supabase.from('orders').select('*').order('created_at', { ascending: false }),
                supabase.from('users').select('*'),
                supabase.from('personalized_products').select('*'),
                supabase.from('social_links').select('*').single(),
                supabase.from('site_content').select('*'),
                supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
                supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
                supabase.from('child_profiles').select('*')
            ]);
            
            if (ordersRes.error) throw ordersRes.error;
            if (usersRes.error) throw usersRes.error;
            if (productsRes.error) throw productsRes.error;
            if (socialRes.error) throw socialRes.error;
            if (contentRes.error) throw contentRes.error;
            if (blogRes.error) throw blogRes.error;
            if (subsRes.error) throw subsRes.error;
            if (childrenRes.error) throw childrenRes.error;

            setOrders(ordersRes.data as IOrderDetails[]);
            setUsers(usersRes.data as User[]);
            setPersonalizedProducts(productsRes.data);
            setSocialLinks(socialRes.data);
            setBlogPosts(blogRes.data);
            setSubscriptions(subsRes.data);
            setAllChildProfiles(childrenRes.data as ChildProfile[]);

            const formattedContent: TextContent = {};
            contentRes.data.forEach(item => {
                formattedContent[item.id] = item.content as any;
            });
            setSiteContent(formattedContent);

        } catch (e: any) {
            setError('فشل تحميل بيانات الإدارة.');
            addToast(`Error: ${e.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateOrderStatus = async (orderId: string, status: IOrderDetails['status']) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تم تحديث حالة الطلب.', 'success');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };
    
    const updateOrderComment = async (orderId: string, comment: string) => {
        const { error } = await supabase.from('orders').update({ admin_comment: comment }).eq('id', orderId);
        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تم حفظ التعليق.', 'success');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, admin_comment: comment } : o));
    };

    const updateUserRole = async (userId: string, role: UserProfile['role']) => {
        const { error } = await supabase.from('users').update({ role }).eq('id', userId);
        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تم تحديث دور المستخدم.', 'success');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    };

    const updatePersonalizedProduct = async (payload: any) => {
        let imageUrl = personalizedProducts.find(p => p.id === payload.id)?.image_url;
        if (payload.imageFile) {
            const filePath = `public/products/${payload.id}-${Date.now()}-${payload.imageFile.name}`;
            const { error: uploadError } = await supabase.storage.from('site_assets').upload(filePath, payload.imageFile);
            if (uploadError) throw uploadError;
            imageUrl = supabase.storage.from('site_assets').getPublicUrl(filePath).data.publicUrl;
        }

        const { error } = await supabase.from('personalized_products').update({
            title: payload.title,
            description: payload.description,
            features: payload.features,
            sort_order: payload.sort_order,
            image_url: imageUrl
        }).eq('id', payload.id);

        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تم تحديث المنتج بنجاح.', 'success');
        await fetchData();
    };

    const addProduct = async (payload: any) => {
        let imageUrl = null;
        if (payload.imageFile) {
            const filePath = `public/products/${payload.key}-${Date.now()}-${payload.imageFile.name}`;
            const { error: uploadError } = await supabase.storage.from('site_assets').upload(filePath, payload.imageFile);
            if (uploadError) throw uploadError;
            imageUrl = supabase.storage.from('site_assets').getPublicUrl(filePath).data.publicUrl;
        }

        const { error } = await supabase.from('personalized_products').insert([{
            key: payload.key,
            title: payload.title,
            description: payload.description,
            features: payload.features,
            sort_order: payload.sort_order,
            image_url: imageUrl
        }]);

        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تمت إضافة المنتج بنجاح.', 'success');
        await fetchData();
    };
    
    const createOrder = async (payload: any): Promise<Order> => {
        const { currentUser, childId, formData, files, totalPrice, itemSummary, shippingCost } = payload;
        
        const imageUrls: { [key: string]: string } = {};
        for (const key of Object.keys(files)) {
            if (files[key]) {
                const file = files[key];
                const filePath = `${currentUser.id}/${childId}/${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage.from('order_images').upload(filePath, file);
                if (uploadError) throw uploadError;
                const { data } = supabase.storage.from('order_images').getPublicUrl(filePath);
                imageUrls[key] = data.publicUrl;
            }
        }
        
        const orderDetails: OrderDetailsJson = {
            ...formData,
            images: imageUrls,
            products: itemSummary,
        };
        
        const newOrder: Omit<Order, 'created_at' | 'admin_comment' | 'receipt_url'> = {
            id: `ORD-${Date.now()}`,
            user_id: currentUser.id,
            customer_name: currentUser.name,
            child_id: parseInt(childId),
            item_summary: itemSummary,
            total: totalPrice,
            status: 'بانتظار الدفع',
            order_date: new Date().toISOString(),
            details: orderDetails as unknown as Json,
        };

        const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
        if (error) { addToast(error.message, 'error'); throw error; }
        await fetchData();
        return data as Order;
    };
    
    const updateSocialLinks = async (links: SocialLinks) => {
        const { error } = await supabase.from('social_links').update(links).eq('id', 1);
        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تم تحديث روابط التواصل.', 'success');
        setSocialLinks(links);
    };

    const updateSiteContent = async (content: TextContent) => {
        const updates = Object.keys(content).map(pageKey =>
            supabase.from('site_content').update({ content: content[pageKey] as unknown as Json }).eq('id', pageKey)
        );
        const results = await Promise.all(updates);
        const firstError = results.find(res => res.error);
        if (firstError) { addToast(firstError.error.message, 'error'); throw firstError.error; }
        addToast('تم تحديث محتوى الموقع بنجاح.', 'success');
        setSiteContent(content);
    };
    
    const createBlogPost = async (post: any) => { /* ... */ };
    const updateBlogPost = async (post: any) => { /* ... */ };
    const deleteBlogPost = async (postId: number) => { /* ... */ };
    const createSubscription = async (userId: string, userName: string, childId: number, childName: string, price: number): Promise<Subscription> => {
        const newSub: Omit<Subscription, 'created_at'> = {
            id: `SUB-${Date.now()}`,
            user_id: userId,
            user_name: userName,
            child_id: childId,
            child_name: childName,
            price: price,
            status: 'pending_payment',
            start_date: new Date().toISOString(),
            next_renewal_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        };
        const { data, error } = await supabase.from('subscriptions').insert(newSub).select().single();
        if (error) throw error;
        await fetchData();
        return data as Subscription;
    };

    const confirmPayment = async (itemId: string, itemType: 'order' | 'booking' | 'subscription', shippingDetails?: any) => {
        // This is a simplified confirmation. A real app would verify payment with a provider.
        const tableName = itemType === 'booking' ? 'creative_writing_bookings' : itemType === 'subscription' ? 'subscriptions' : 'orders';
        const newStatus = itemType === 'subscription' ? 'active' : 'بانتظار المراجعة';
        const updatePayload: any = { status: newStatus };

        // For orders, add shipping details to the 'details' JSONB column
        if (itemType === 'order' && shippingDetails) {
            const { data: currentOrder, error: fetchError } = await supabase.from('orders').select('details').eq('id', itemId).single();
            if(fetchError) throw fetchError;
            
            const currentDetails = (currentOrder?.details as unknown as OrderDetailsJson) || {};
            const newDetails = { ...currentDetails, shipping: shippingDetails };
            updatePayload.details = newDetails as unknown as Json;
        }

        const { error } = await supabase.from(tableName).update(updatePayload).eq('id', itemId);
        if (error) throw error;
        await fetchData();
    };

    const linkStudentToChildProfile = async (studentUserId: string, childProfileId: number) => {
        const { error } = await supabase.from('child_profiles').update({ student_user_id: studentUserId }).eq('id', childProfileId);
        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تم ربط حساب الطالب بنجاح.', 'success');
        await fetchData();
    };
    
    const unlinkStudentFromChildProfile = async (childProfileId: number) => {
        const { error } = await supabase.from('child_profiles').update({ student_user_id: null }).eq('id', childProfileId);
        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تم إلغاء ربط حساب الطالب.', 'success');
        await fetchData();
    };

    const addUser = async (payload: any) => { /* ... */ };
    const updateUser = async (userId: string, name: string) => { /* ... */ };
    const updateReceipt = async (payload: {itemId: string, itemType: string, receiptFile: File}) => { /* ... */ };


    const value = {
        orders,
        users,
        allChildProfiles,
        personalizedProducts,
        socialLinks,
        siteContent,
        blogPosts,
        subscriptions,
        loading,
        error,
        updateOrderStatus,
        updateOrderComment,
        updateUserRole,
        updatePersonalizedProduct,
        addProduct,
        updateSocialLinks,
        updateSiteContent,
        createBlogPost,
        updateBlogPost,
        deleteBlogPost,
        createSubscription,
        createOrder,
        confirmPayment,
        linkStudentToChildProfile,
        unlinkStudentFromChildProfile,
        addUser,
        updateUser,
        updateReceipt,
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = (): AdminContextType => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
