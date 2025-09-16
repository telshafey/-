import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
// FIX: Added .ts extension to resolve module error.
// FIX: Import BlogPost type.
// FIX: Import Subscription type.
import { Database, SocialLinks, PersonalizedProduct, Json, BlogPost, Subscription } from '../lib/database.types.ts';
// FIX: Added .tsx extension to resolve module error.
import { UserProfile } from './AuthContext.tsx';


// --- Re-defining types locally since DB connection is removed ---
export type IOrderDetails = {
  id: string;
  customer_name: string;
  order_date: string;
  item_summary: string | null;
  total: string | null;
  status: "بانتظار الدفع" | "بانتظار المراجعة" | "قيد التجهيز" | "يحتاج مراجعة" | "تم الشحن" | "تم التسليم" | "ملغي" | "نشط";
  details: Json | null;
  user_id: string | null;
  file_url: string | null;
  receipt_url: string | null;
  admin_comment: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
};

export interface TextContent {
  [pageKey: string]: {
      [elementKey: string]: string;
  };
}

// FIX: Re-export BlogPost type.
export type { PersonalizedProduct, BlogPost, Subscription };

// --- Mock Data Generation ---

const MOCK_USERS: User[] = [
    { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'المدير العام', email: 'admin@alrehlah.com', role: 'admin', created_at: new Date('2024-01-01T10:00:00Z').toISOString() },
    { id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba', name: 'فاطمة علي', email: 'user@alrehlah.com', role: 'user', created_at: new Date('2024-07-15T11:00:00Z').toISOString() },
    { id: '12345678-abcd-efgh-ijkl-mnopqrstuvwx', name: 'أحمد محمود', email: 'user2@alrehlah.com', role: 'user', created_at: new Date('2024-07-18T14:30:00Z').toISOString() },
];

const MOCK_ORDERS: IOrderDetails[] = [
    {
        id: 'ORD-1678886400000',
        customer_name: 'فاطمة علي',
        order_date: new Date('2024-07-15T12:00:00Z').toISOString(),
        item_summary: 'القصة (مطبوعة)، دفتر تلوين',
        total: '850 ج.م',
        // FIX: Added missing 'status' property to satisfy the IOrderDetails type.
        status: 'تم التسليم',
        details: { childName: 'سارة', childAge: '5', products: 'قصة ودفتر تلوين', shippingCost: 50, governorate: 'الإسكندرية', shippingDetails: { address: '123 شارع النصر', governorate: 'الإسكندرية', phone: '0123456789' } } as any,
        user_id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba',
        file_url: 'https://example.com/story.pdf',
        receipt_url: null,
        admin_comment: 'تم التواصل مع العميل للتأكيد.',
    },
    {
        id: 'ORD-1678972800000',
        customer_name: 'أحمد محمود',
        order_date: new Date('2024-07-18T15:30:00Z').toISOString(),
        item_summary: 'بوكس الهدية',
        total: '1200 ج.م',
        status: 'قيد التجهيز',
        details: { childName: 'علي', childAge: '7', products: 'بوكس الهدية', shippingCost: 0, governorate: 'القاهرة' } as any,
        user_id: '12345678-abcd-efgh-ijkl-mnopqrstuvwx',
        file_url: null,
        receipt_url: 'https://example.com/receipt.jpg',
        admin_comment: null,
    },
];

const MOCK_PERSONALIZED_PRODUCTS: PersonalizedProduct[] = [
    { 
        id: 1, 
        key: 'custom_story', 
        title: 'القصة المخصصة: مرآة الروح وكنز البطل', 
        description: 'ليست مجرد صفحات ملونة، بل هي أول كنز يمتلكه طفلك ويجد فيه انعكاس ذاته. كل كلمة هي همسة تشجيع، وكل رسمة هي نافذة يطل منها على مغامراته التي يحلم بها. نحن نمنحه كتاباً لا يقرأه فحسب، بل يعيشه ويتنفسه، ليصبح تذكاراً ثميناً لرحلة بناء ثقته بنفسه، وجسراً يربطه باللغة العربية، وحبه الأبدي للكلمة.',
        image_url: 'https://i.ibb.co/P9tGk1X/product-custom-story.png', 
        features: [
            '20 صفحة مع الغلاف',
            'ورق مقوى عالي الجودة مقاس A5',
            'رسومات تحتوي على صورة طفلك',
            'اسم الطفل وعائلته في القصة',
            'متوفر كنسخة إلكترونية أو مطبوعة',
            'تسليم خلال 5-7 أيام عمل'
        ], 
        sort_order: 1 
    },
    { 
        id: 2, 
        key: 'coloring_book', 
        title: 'دفتر التلوين: لوحة أحلامه الخاصة', 
        description: 'ماذا لو امتدت مغامرة القصة إلى ما بعد الكلمات؟ دفتر التلوين هذا ليس مجرد رسومات، بل هو دعوة للطفل ليشارك في إبداع عالمه. هنا، يمسك بزمام الألوان ليكمل قصته، ويضيف لمسته الخاصة على شخصيته التي أحبها في كتابه. إنها مساحة حرة يطلق فيها العنان لخياله، ويحول الحلم إلى حقيقة تضج بالحياة والألوان.',
        image_url: 'https://i.ibb.co/m9xG3yS/product-coloring-book.png', 
        features: [
            '20 صفحة تلوين مقاس A5',
            'يحتوي على شخصيات من قصة طفلك',
            'ورق عالي الجودة مناسب للتلوين',
            'يعزز التفاعل والإبداع'
        ], 
        sort_order: 2 
    },
    { 
        id: 3, 
        key: 'dua_booklet', 
        title: 'كتيب الأذكار والأدعية: همسة سلام لقلبه الصغير', 
        description: 'نؤمن بأن الإيمان ينمو بالحب لا بالتلقين. هذا الكتيب ليس مجرد أدعية محفوظة، بل هو رفيق يومي هادئ، يظهر فيه الطفل نفسه في رسومات ملائكية وهو يناجي خالقه. يصبح الدعاء حواراً شخصياً دافئاً، وتصبح الأذكار درعاً من الطمأنينة يحيط بروحه الصغيرة، مما يغرس فيه حب الله بطريقة تلامس قلبه النقي.',
        image_url: 'https://i.ibb.co/R4k5p1S/product-dua-booklet.png', 
        features: [
            '40 صفحة مقاس A5',
            'ورق مقوى متين ومناسب للأطفال',
            'رسومات مخصصة تشبه طفلك',
            'محتوى متخصص من الأدعية والأذكار اليومية'
        ], 
        sort_order: 5
    },
    { 
        id: 6, 
        key: 'gift_box', 
        title: 'بوكس الهدية: صندوق العجائب الكامل', 
        description: 'عندما تجتمع كل الأمنيات في مكان واحد! هذا الصندوق ليس مجرد هدية، بل هو احتفال متكامل بالطفل. يفتحه ليجد عالمه كله في انتظاره: قصته التي تحكي عنه، دفتر تلوينه ليبدع فيه، وكتيب أدعيته ليرعاه. إنه عناق دافئ يأتي على هيئة صندوق، ورسالة تقول: "أنت مميز، وكل هذا العالم صنع من أجلك."',
        image_url: 'https://i.ibb.co/dK5zZ7s/product-gift-box.png', 
        features: [
            'قصة طفلك المخصصة (مطبوعة)',
            'دفتر التلوين الخاص بالقصة',
            'كتيب الأذكار والأدعية',
            'هدية مفاجأة من اختيارنا'
        ], 
        sort_order: 6 
    }
];

const MOCK_SITE_CONTENT: TextContent = {
    about: {
        title: 'منصة "الرحلة"',
        subtitle: 'حيث تبدأ كل قصة، وتُصنع كل موهبة',
        intro_title: 'منظومة تربوية إبداعية متكاملة',
        intro_text: '"الرحلة" ليست مجرد منصة، بل هي منظومة تربوية إبداعية متكاملة، صُممت لتكون الرفيق الأمين لكل طفل في رحلته نحو اكتشاف ذاته وإطلاق العنان لقدراته. نحن نؤمن بأن كل طفل يحمل في داخله بطلاً ينتظر قصته، وكاتباً ينتظر قلمه، ومبدعاً ينتظر فرصته. من هذا الإيمان، انطلقت "الرحلة" بجناحيها الرئيسيين:',
        project1_title: 'مشروع "إنها لك": رحلة اكتشاف الذات',
        project1_text: 'هنا، نحول الطفل من مجرد قارئ إلى بطل حقيقي للحكاية. "إنها لك" ليست مجرد خدمة لطباعة قصص بأسماء مخصصة؛ إنها تجربة نفسية وتربوية عميقة. نحن ننسج اسم الطفل، صورته، وتفاصيل عالمه الخاص في مغامرات شيقة ومصورة بإتقان. عندما يرى الطفل نفسه بطلاً على صفحات الكتاب، فإنه لا يقرأ قصة، بل يعيشها. هذه التجربة السحرية تبني جسراً من الثقة بالنفس، تعزز هويته وارتباطه بلغته وثقافته، وتغرس فيه القيم النبيلة بأسلوب يلامس قلبه وعقله، لتصبح القراءة متعة شخصية وتذكاراً لا يُنسى.',
        project2_title: 'برنامج "بداية الرحلة": رحلة صناعة الإبداع',
        project2_text: 'هنا، نأخذ بيد الطفل لينتقل من كونه بطل القصة إلى صانعها. "بداية الرحلة" هو برنامج متخصص في الكتابة الإبداعية، يقدم مساحة آمنة وملهمة للأطفال والشباب للتعبير عن أنفسهم بحرية. من خلال جلسات فردية مباشرة مع مدربين خبراء، نحرر الطفل من قيود الكتابة المدرسية التقليدية ونعلمه كيف يستخدم الكلمة كأداة لاستكشاف خياله، تنظيم أفكاره، والتعبير عن مشاعره. نحن لا نعلمهم قواعد الكتابة فحسب، بل نطلق العنان لأصواتهم الفريدة، ونمنحهم الأدوات ليصبحوا رواة قصص المستقبل، قادرين على التعبير عن أنفسهم بثقة وإبداع.',
        conclusion_title: 'رحلة متكاملة نحو المستقبل',
        conclusion_text: 'تجمع المنصة بين هذين العالمين لتشكل رحلة متكاملة: تبدأ باكتشاف الطفل لذاته كبطل في "إنها لك"، وتتطور لتصل به إلى صناعة عوالمه الخاصة في "بداية الرحلة". إنها استثمار في عقل الطفل وروحه، وبوابة تفتح له آفاقاً لا نهائية من الخيال والمعرفة والتعبير.',
    },
    terms: {
        main_title: 'شروط الاستخدام',
        main_subtitle: 'باستخدامك لمنصتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام.',
        approval_title: 'الموافقة على الشروط',
        approval_text: 'باستخدامك لمنصة "الرحلة"، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق، يرجى عدم استخدام المنصة.',
        accounts_title: 'الحسابات',
        accounts_text: 'عند إنشاء حساب معنا، يجب عليك تزويدنا بمعلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور.',
        ip_title: 'الملكية الفكرية',
        ip_text: 'جميع المحتويات والقصص والرسومات والتصاميم على المنصة هي ملك حصري لمشروع "الرحلة" ومحمية بموجب قوانين حقوق النشر. يُمنع منعًا باتًا استخدام أو نسخ أو توزيع أي من محتوياتنا لأغراض تجارية دون الحصول على إذن خطي مسبق.',
        payment_title: 'الطلبات والدفع',
        payment_text: 'نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب من الأسباب، بما في ذلك عدم توفر المنتج أو وجود أخطاء في التسعير. عند تقديم طلب، فإنك توافق على دفع السعر المعلن للمنتج بالإضافة إلى أي رسوم شحن مطبقة.',
        policy_changes_title: 'التغييرات على هذه الشروط',
        policy_changes_text: 'قد نقوم بتحديث شروط الاستخدام من وقت لآخر. سنقوم بإعلامك بأي تغييرات عن طريق نشر الشروط الجديدة على هذه الصفحة. يُنصح بمراجعة هذه الصفحة بشكل دوري.',
        contact_us_title: 'اتصل بنا',
        contact_us_text: 'إذا كان لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا عبر صفحة الدعم والمساعدة.',
    },
    privacy: {
        main_title: 'سياسة الخصوصية',
        main_subtitle: 'نحن نهتم بخصوصيتك. توضح هذه الصفحة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية.',
        intro_title: 'سياسة الخصوصية',
        intro_text: 'توضح هذه السياسة كيفية تعاملنا مع معلوماتك الشخصية التي نجمعها منك عند استخدامك للمنصة.',
        data_collection_title: 'المعلومات التي نجمعها',
        data_collection_list: 'معلومات الحساب: الاسم، البريد الإلكتروني.\nمعلومات الطفل: الاسم، العمر، الجنس، الصور، وأي تفاصيل أخرى تقدمها لتخصيص القصة.\nمعلومات الدفع: تفاصيل المعاملات المالية.',
        data_usage_title: 'كيف نستخدم معلوماتك',
        data_usage_list: 'لتخصيص وإنشاء المنتجات التي تطلبها.\nلمعالجة طلباتك ومدفوعاتك.\nللتواصل معك بخصوص طلباتك أو لتقديم الدعم الفني.\nلتحسين خدماتنا وتجربة المستخدم على المنصة.',
        data_sharing_title: 'مشاركة المعلومات',
        data_sharing_text: 'نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية أو معلومات طفلك مع أي طرف ثالث لأغراض تسويقية. قد نشارك المعلومات فقط مع مزودي الخدمات الذين يساعدوننا في تشغيل المنصة (مثل بوابات الدفع) والذين يلتزمون بالحفاظ على سرية هذه المعلومات.',
        children_title: 'خصوصية الأطفال',
        children_text: 'نحن نأخذ خصوصية الأطفال على محمل الجد. يتم استخدام المعلومات المقدمة عن الأطفال فقط لغرض وحيد وهو إنشاء المنتج المخصص المطلوب. لا يتم استخدام هذه المعلومات لأي غرض آخر.',
        security_title: 'أمان البيانات',
        security_text: 'نتخذ إجراءات أمنية معقولة لحماية معلوماتك من الوصول غير المصرح به. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100%.',
        rights_title: 'حقوقك',
        rights_text: 'لديك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها. يمكنك القيام بذلك عن طريق التواصل معنا.',
        policy_changes_title: 'التغييرات على هذه السياسة',
        policy_changes_text: 'قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإعلامك بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة. يُنصح بمراجعة هذه الصفحة بشكل دوري.',
        contact_us_title: 'اتصل بنا',
        contact_us_text: 'إذا كان لديك أي أسئلة حول هذه السياسة، يرجى التواصل معنا عبر صفحة الدعم والمساعدة.',
    },
};

const MOCK_SOCIAL_LINKS: SocialLinks = {
    id: 1,
    facebook_url: 'https://facebook.com',
    twitter_url: 'https://twitter.com',
    instagram_url: 'https://instagram.com',
};

// FIX: Add mock data for blog posts.
const MOCK_BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        created_at: new Date('2024-07-20T10:00:00Z').toISOString(),
        title: 'أهمية القصة المخصصة في تنمية شخصية الطفل',
        slug: 'importance-of-personalized-stories',
        content: 'تعتبر القصة المخصصة أداة تربوية فعالة... عندما يرى الطفل نفسه بطلاً للقصة، يزداد ارتباطه بها وتأثيرها الإيجابي عليه. هذا يعزز ثقته بنفسه ويساعده على استيعاب القيم التربوية بشكل أعمق. في منصة "إنها لك"، نصنع كل قصة بحب لتكون تجربة فريدة لطفلك.',
        author_name: 'فريق المنصة',
        status: 'published',
        image_url: 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg',
        published_at: new Date('2024-07-21T12:00:00Z').toISOString(),
    },
    {
        id: 2,
        created_at: new Date('2024-07-15T11:00:00Z').toISOString(),
        title: 'كيف تشجع طفلك على الكتابة الإبداعية؟',
        slug: 'encourage-creative-writing',
        content: 'الكتابة الإبداعية هي مهارة أساسية تساعد الطفل على التعبير عن أفكاره ومشاعره. يمكنك تشجيعه بتوفير بيئة داعمة، والاحتفاء بمحاولاته، والمشاركة في برنامج متخصص مثل "بداية الرحلة" الذي نقدمه.',
        author_name: 'أحمد المصري',
        status: 'published',
        image_url: 'https://i.ibb.co/Xz9d9J2/creative-writing-promo.jpg',
        published_at: new Date('2024-07-18T09:00:00Z').toISOString(),
    },
    {
        id: 3,
        created_at: new Date('2024-07-22T09:00:00Z').toISOString(),
        title: 'أفكار جديدة لأنشطة صيفية (مسودة)',
        slug: 'summer-activities-draft',
        content: 'الصيف فرصة رائعة للتعلم والمرح. يمكنكم تجربة صناعة مجسمات، أو كتابة يوميات مصورة، أو حتى تأليف قصة قصيرة معًا.',
        author_name: 'فريق المنصة',
        status: 'draft',
        image_url: null,
        published_at: null,
    },
];

const renewalDate = new Date();
renewalDate.setDate(renewalDate.getDate() + 5);

const MOCK_SUBSCRIPTIONS: Subscription[] = [
    {
        id: 'SUB-1',
        user_id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba',
        user_name: 'فاطمة علي',
        child_name: 'سارة',
        status: 'active',
        start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
        next_renewal_date: renewalDate.toISOString(),
        price: 4200
    },
    {
        id: 'SUB-2',
        user_id: '12345678-abcd-efgh-ijkl-mnopqrstuvwx',
        user_name: 'أحمد محمود',
        child_name: 'علي',
        status: 'active',
        start_date: new Date('2024-01-01T10:00:00Z').toISOString(),
        next_renewal_date: new Date('2025-01-01T10:00:00Z').toISOString(),
        price: 4200
    },
    {
        id: 'SUB-3',
        user_id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba',
        user_name: 'فاطمة علي',
        child_name: 'يوسف',
        status: 'cancelled',
        start_date: new Date('2023-05-01T10:00:00Z').toISOString(),
        next_renewal_date: new Date('2024-05-01T10:00:00Z').toISOString(),
        price: 4200
    }
];

// --- Context Definition ---

interface CreateOrderPayload {
    currentUser: UserProfile;
    formData: any;
    files: { [key: string]: File | null };
    totalPrice: number;
    itemSummary: string;
    shippingCost: number;
}

interface UpdateReceiptPayload {
    itemId: string;
    itemType: 'order' | 'booking' | 'subscription';
    receiptFile: File;
    shippingDetails?: {
        address: string;
        governorate: string;
        phone: string;
    } | null;
}


interface UpdateProductPayload {
    id: number;
    title: string;
    description: string;
    features: string[] | null;
    imageFile: File | null;
}

interface AdminContextType {
    orders: IOrderDetails[];
    updateOrderStatus: (orderId: string, newStatus: IOrderDetails['status']) => Promise<void>;
    updateOrderComment: (orderId: string, comment: string) => Promise<void>;
    createOrder: (payload: CreateOrderPayload) => Promise<IOrderDetails>;
    
    users: User[];
    updateUserRole: (userId: string, newRole: 'user' | 'admin') => Promise<void>;
    
    updateReceipt: (payload: UpdateReceiptPayload) => Promise<void>;
    
    loading: boolean;
    error: string | null;

    siteContent: TextContent;
    updateSiteContent: (newContent: TextContent) => Promise<void>;
    
    socialLinks: SocialLinks;
    updateSocialLinks: (links: SocialLinks) => Promise<void>;

    personalizedProducts: PersonalizedProduct[];
    updatePersonalizedProduct: (payload: UpdateProductPayload) => Promise<void>;

    // FIX: Add blog post properties to the context type.
    blogPosts: BlogPost[];
    createBlogPost: (payload: any) => Promise<void>;
    updateBlogPost: (payload: any) => Promise<void>;
    deleteBlogPost: (postId: number) => Promise<void>;

    subscriptions: Subscription[];
    createSubscription: (userId: string, userName: string, childName: string, price: number) => Promise<Subscription>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [orders, setOrders] = useState<IOrderDetails[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [personalizedProducts, setPersonalizedProducts] = useState<PersonalizedProduct[]>([]);
    const [siteContent, setSiteContent] = useState<TextContent>({});
    const [socialLinks, setSocialLinks] = useState<SocialLinks>(MOCK_SOCIAL_LINKS);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        // Simulate async fetch
        await new Promise(res => setTimeout(res, 200)); 
        setOrders(MOCK_ORDERS);
        setUsers(MOCK_USERS);
        setPersonalizedProducts(MOCK_PERSONALIZED_PRODUCTS);
        setSiteContent(MOCK_SITE_CONTENT);
        setSocialLinks(MOCK_SOCIAL_LINKS);
        setBlogPosts(MOCK_BLOG_POSTS);
        setSubscriptions(MOCK_SUBSCRIPTIONS);
        setLoading(false);
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createOrder = async ({ currentUser, formData, files, totalPrice, itemSummary, shippingCost }: CreateOrderPayload) => {
        const orderId = `ORD-${Date.now()}`;
        
        const imageUrls: { [key: string]: string | null } = {};
        for (const key in files) {
            const file = files[key];
            if (file) {
                imageUrls[key] = URL.createObjectURL(file);
            }
        }

        const newOrder: IOrderDetails = {
            id: orderId,
            customer_name: currentUser.name,
            item_summary: itemSummary,
            total: `${totalPrice} ج.م`,
            details: { ...formData, images: imageUrls, shippingCost } as any,
            user_id: currentUser.id,
            status: 'بانتظار الدفع',
            order_date: new Date().toISOString(),
            file_url: null,
            receipt_url: null,
            admin_comment: null,
        };

        setOrders(prev => [newOrder, ...prev]);
        console.log("Mock Order Created:", newOrder);
        return newOrder;
    };
    
    const updateReceipt = async ({ itemId, itemType, receiptFile, shippingDetails }: UpdateReceiptPayload) => {
        console.log(`Mock receipt uploaded for ${itemType} ${itemId}:`, receiptFile.name);
        const receipt_url = URL.createObjectURL(receiptFile); // Create local preview URL
        
        if (itemType === 'order') {
          setOrders(prev => prev.map(o => {
            if (o.id === itemId) {
                const currentDetails = o.details as any || {};
                const newDetails = { ...currentDetails, shippingDetails };
                return { ...o, status: 'بانتظار المراجعة', receipt_url, details: newDetails };
            }
            return o;
          }));
        } else if (itemType === 'subscription') {
            setSubscriptions(prev => prev.map(s => {
                if (s.id === itemId) {
                    return { ...s, status: 'active' };
                }
                return s;
            }));
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: IOrderDetails['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        addToast(`تم تحديث حالة الطلب (تجريبي)`, 'success');
    };

    const updateOrderComment = async (orderId: string, comment: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, admin_comment: comment } : o));
        addToast('تم حفظ التعليق بنجاح (تجريبي)', 'success');
    };
    
    const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        addToast(`تم تحديث دور المستخدم (تجريبي)`, 'success');
    };

    const updateSiteContent = async (newContent: TextContent) => {
        setSiteContent(newContent);
        console.log("Mock Site Content Updated:", newContent);
    };
    
    const updateSocialLinks = async (links: SocialLinks) => {
        setSocialLinks(links);
        console.log("Mock Social Links Updated:", links);
    };

    const updatePersonalizedProduct = async ({ id, title, description, features, imageFile }: UpdateProductPayload) => {
        setPersonalizedProducts(prev => prev.map(p => {
            if (p.id === id) {
                const updatedProduct = { ...p, title, description, features };
                if (imageFile) {
                    (updatedProduct as any).image_url = URL.createObjectURL(imageFile);
                }
                return updatedProduct;
            }
            return p;
        }));
        addToast('تم تحديث المنتج بنجاح (تجريبي)!', 'success');
    };

    const createBlogPost = async (payload: any) => {
        const newPost: BlogPost = {
            id: Date.now(),
            created_at: new Date().toISOString(),
            published_at: payload.status === 'published' ? new Date().toISOString() : null,
            image_url: payload.imageFile ? URL.createObjectURL(payload.imageFile) : null,
            ...payload
        };
        setBlogPosts(prev => [newPost, ...prev]);
        addToast('تم إنشاء المقال بنجاح!', 'success');
    };

    const updateBlogPost = async (payload: any) => {
        setBlogPosts(prev => prev.map(p => {
            if (p.id === payload.id) {
                const updatedPost = { ...p, ...payload };
                if (payload.imageFile) {
                    updatedPost.image_url = URL.createObjectURL(payload.imageFile);
                }
                if(payload.status === 'published' && !p.published_at) {
                    updatedPost.published_at = new Date().toISOString();
                } else if(payload.status === 'draft') {
                    updatedPost.published_at = null;
                }
                delete (updatedPost as any).imageFile;
                return updatedPost as BlogPost;
            }
            return p;
        }));
        addToast('تم تحديث المقال بنجاح!', 'success');
    };

    const deleteBlogPost = async (postId: number) => {
        setBlogPosts(prev => prev.filter(p => p.id !== postId));
        addToast('تم حذف المقال بنجاح.', 'success');
    };

    const createSubscription = async (userId: string, userName: string, childName: string, price: number): Promise<Subscription> => {
        const startDate = new Date();
        const nextRenewalDate = new Date(startDate);
        nextRenewalDate.setFullYear(startDate.getFullYear() + 1);

        const newSubscription: Subscription = {
            id: `SUB-${Date.now()}`,
            user_id: userId,
            user_name: userName,
            child_name: childName,
            status: 'pending_payment',
            start_date: startDate.toISOString(),
            next_renewal_date: nextRenewalDate.toISOString(),
            price: price
        };
        setSubscriptions(prev => [...prev, newSubscription]);
        return newSubscription;
    };

    return (
        <AdminContext.Provider value={{
            orders, updateOrderStatus, updateOrderComment, createOrder,
            users, updateUserRole,
            updateReceipt,
            loading, error,
            siteContent, updateSiteContent,
            socialLinks, updateSocialLinks,
            personalizedProducts, updatePersonalizedProduct,
            blogPosts, createBlogPost, updateBlogPost, deleteBlogPost,
            subscriptions, createSubscription,
        }}>
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