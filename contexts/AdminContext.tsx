import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { Database, SocialLinks, PersonalizedProduct, Json, Instructor, CreativeWritingPackage, AdditionalService, CreativeWritingBooking, AvailableSlots, SupportTicket, JoinRequest } from '../lib/database.types';
import { UserProfile } from './AuthContext';


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
};

export interface TextContent {
  [pageKey: string]: {
      [elementKey: string]: string;
  };
}

export type { Instructor, CreativeWritingPackage, AdditionalService, CreativeWritingBooking, AvailableSlots, PersonalizedProduct, SupportTicket, JoinRequest };

// --- Mock Data Generation ---

const MOCK_USERS: User[] = [
    { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'المدير العام', email: 'admin@alrehlah.com', role: 'admin' },
    { id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba', name: 'فاطمة علي', email: 'user@alrehlah.com', role: 'user' },
    { id: '12345678-abcd-efgh-ijkl-mnopqrstuvwx', name: 'أحمد محمود', email: 'user2@alrehlah.com', role: 'user' },
];

const MOCK_ORDERS: IOrderDetails[] = [
    {
        id: 'ORD-1678886400000',
        customer_name: 'فاطمة علي',
        order_date: new Date('2024-07-15T12:00:00Z').toISOString(),
        item_summary: 'القصة (مطبوعة)، دفتر تلوين',
        total: '850 ج.م',
        status: 'تم التسليم',
        details: { childName: 'سارة', childAge: '5', products: 'قصة ودفتر تلوين' } as any,
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
        details: { childName: 'علي', childAge: '7', products: 'بوكس الهدية' } as any,
        user_id: '12345678-abcd-efgh-ijkl-mnopqrstuvwx',
        file_url: null,
        receipt_url: 'https://example.com/receipt.jpg',
        admin_comment: null,
    },
];

const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
    { id: 'TKT-1', name: 'سارة إبراهيم', email: 'sara@example.com', subject: 'استفسار عن الشحن', message: 'مرحباً، أود أن أسأل عن مدة الشحن لمدينة الإسكندرية. شكراً لكم.', created_at: new Date('2024-07-20T10:00:00Z').toISOString(), status: 'جديدة' },
    { id: 'TKT-2', name: 'محمد حسن', email: 'mohamed@example.com', subject: 'مشكلة في الدفع', message: 'أواجه مشكلة عند محاولة الدفع باستخدام بطاقة الائتمان، هل هناك طريقة أخرى؟', created_at: new Date('2024-07-19T14:20:00Z').toISOString(), status: 'تمت المراجعة' },
];

const MOCK_JOIN_REQUESTS: JoinRequest[] = [
    { id: 'JOIN-1', name: 'نور الهدى', email: 'nour@artist.com', role: 'رسام/مصمم جرافيك', portfolio_url: 'https://portfolio.example.com/nour', message: 'أنا رسامة متخصصة في كتب الأطفال وأحببت مشروعكم كثيراً. أتمنى أن تتاح لي فرصة التعاون معكم. هذا رابط أعمالي.', created_at: new Date('2024-07-18T09:00:00Z').toISOString(), status: 'جديد' },
];


const MOCK_PERSONALIZED_PRODUCTS: PersonalizedProduct[] = [
    { id: 1, key: 'custom_story', title: 'القصة المخصصة', description: "عندما يكون الطفل هو الشخصية الرئيسية في قصة تعكس اسمه وسماته، فإن ذلك يخلق 'تأثير المرآة' القوي الذي يعزز إدراكه الإيجابي لذاته، يزيد ثقته بنفسه، ويعمق استيعاب القيم، مما يحول المنتج من مجرد ترفيه إلى أداة مهمة لتكوين الهوية.", image_url: 'https://i.ibb.co/P9tGk1X/product-custom-story.png', features: ['تدمج اسم الطفل وصفاته وقيمه', 'رسومات كرتونية احترافية', 'أداة قوية لتكوين الهوية وبناء الثقة'], sort_order: 1 },
    { id: 2, key: 'coloring_book', title: 'دفتر التلوين', description: 'دع طفلك يطلق العنان لإبداعه مع دفتر تلوين يحتوي على شخصيات من قصته المخصصة، مطبوع على ورق عالي الجودة لمتعة لا تنتهي.', image_url: 'https://i.ibb.co/m9xG3yS/product-coloring-book.png', features: ['شخصيات من قصة طفلك', 'ورق عالي الجودة', 'يطلق العنان للإبداع'], sort_order: 2 },
    { id: 3, key: 'dua_booklet', title: 'كتيب الأذكار والأدعية', description: 'محتوى متخصص ومصمم بشكل محبب للأطفال، يشمل الأدعية والأذكار اليومية وقصصاً قصيرة تعزز الهوية الدينية والثقافية لطفلك.', image_url: 'https://i.ibb.co/R4k5p1S/product-dua-booklet.png', features: ['محتوى متخصص يشمل الأدعية اليومية', 'قصص تعزز الهوية الدينية والثقافية', 'تصاميم محببة للأطفال'], sort_order: 3 },
    { id: 4, key: 'values_story', title: 'قصة الآداب والقيم', description: "مجموعة من القصص التربوية العامة التي تركز على غرس الآداب والقيم الأساسية مثل الاستئذان، والتعاون، والصدق، والنظافة بأسلوب قصصي ممتع ومؤثر يميل الأطفال لتقليد شخصياته المحببة.", image_url: 'https://i.ibb.co/kH7X6tT/product-values-story.png', features: ['تركز على غرس الآداب والقيم الأساسية', 'موضوعات مثل الصدق، التعاون، والاحترام', 'أسلوب قصصي ممتع ومؤثر'], sort_order: 4 },
    { id: 5, key: 'skills_story', title: 'قصة المهارات الحياتية', description: "قصص موجهة لتعليم الأطفال مهارات حياتية أساسية، مثل تنظيم الوقت، إدارة العواطف، وحل المشكلات، وهي ضرورية لتكيف الطفل مع عالم معقد ونجاحه في المستقبل.", image_url: 'https://i.ibb.co/2d1h4fS/product-skills-story.png', features: ['تعليم مهارات حياتية قيمة للأطفال', 'مواضيع مثل تنظيم الوقت وإدارة العواطف', 'تساعد على النجاح والتكيف في المستقبل'], sort_order: 5 },
    { id: 6, key: 'gift_box', title: 'بوكس الهدية', description: 'الهدية المتكاملة التي لا تنسى، في صندوق أنيق يجمع بين القصة المخصصة المطبوعة ودفتر التلوين وكتيب الأدعية وهدية إضافية مميزة.', image_url: 'https://i.ibb.co/dK5zZ7s/product-gift-box.png', features: ['المجموعة الكاملة في صندوق أنيق', 'يشمل القصة ودفتر التلوين والكتيب', 'هدية متكاملة لا تنسى'], sort_order: 6 }
];

const MOCK_SITE_CONTENT: TextContent = {
    about: {
        title: 'عن مشروع "إنها لك"',
        subtitle: 'منصة رقمية رائدة لتقديم قصص مخصصة للأطفال العرب.',
        intro_title: 'رؤية لمستقبل قصص الأطفال',
        intro_text: '"انها لك" هو مشروع رقمي رائد يهدف إلى تطوير منصة متقدمة لتقديم قصص مخصصة للأطفال العرب. تتميز هذه المنصة بدمج اسم الطفل وصفاته الشخصية في قصص تفاعلية، مصحوبة برسومات كرتونية احترافية. تظهر الملاحظات السوقية وجود فجوة كبيرة في المحتوى العربي الرقمي المخصص للأطفال. "انها لك" لا يدخل سوقًا موجودًا فحسب، بل يعالج هذه الفجوة الواضحة، مما يتيح له بناء مكانة تنافسية قوية كمتخصص في هذا المجال الفريد.',
        vision_title: 'رؤيتنا',
        vision_text: 'تتمثل رؤية المشروع في الجمع بين التكنولوجيا الحديثة والإبداع الثقافي لتعزيز حب القراءة وغرس القيم الإيجابية لدى الأطفال من خلال تجربة قراءة فريدة وشخصية.',
        mission_title: 'رسالتنا',
        mission_text: 'نصنع بحب وشغف قصة مخصصة تتراوح صفحاتها حوالي 20 صفحة، مصممة ككتاب PDF باحترافية عالية، تحمل اسم الطفل وتتحدث عنه وعن طبيعته وصفاته، مع إمكانية غرس قيم محددة يود أولياء الأمور تعزيزها.',
        goals_title: 'أهدافنا',
        goals: 'تعزيز حب القراءة لدى الأطفال بجعلها تجربة شخصية.\nغرس القيم الإيجابية والأخلاق الحميدة بطريقة محببة.\nتنمية الذكاء العاطفي والمهارات المعرفية للطفل.\nبناء جسر من التواصل بين الطفل والكتاب.\nإثراء المحتوى العربي الرقمي الموجه للطفل بمنتجات عالية الجودة.',
    },
    privacy: {
        main_title: 'سياسة الخصوصية والاستخدام',
        main_subtitle: 'نحن نهتم بخصوصيتك. توضح هذه الصفحة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية.',
        terms_title: 'شروط الاستخدام',
        terms_approval_title: 'الموافقة على الشروط',
        terms_approval_text: 'باستخدامك لمنصة "إنها لك"، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق، يرجى عدم استخدام المنصة.',
        terms_accounts_title: 'الحسابات',
        terms_accounts_text: 'عند إنشاء حساب معنا، يجب عليك تزويدنا بمعلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور.',
        terms_ip_title: 'الملكية الفكرية',
        terms_ip_text: 'جميع المحتويات والقصص والرسومات والتصاميم على المنصة هي ملك حصري لمشروع "إنها لك" ومحمية بموجب قوانين حقوق النشر. يُمنع منعًا باتًا استخدام أو نسخ أو توزيع أي من محتوياتنا لأغراض تجارية دون الحصول على إذن خطي مسبق.',
        terms_payment_title: 'الطلبات والدفع',
        terms_payment_text: 'نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب من الأسباب، بما في ذلك عدم توفر المنتج أو وجود أخطاء في التسعير. عند تقديم طلب، فإنك توافق على دفع السعر المعلن للمنتج بالإضافة إلى أي رسوم شحن مطبقة.',
        privacy_title: 'سياسة الخصوصية',
        privacy_intro: 'توضح هذه السياسة كيفية تعاملنا مع معلوماتك الشخصية التي نجمعها منك عند استخدامك للمنصة.',
        privacy_data_collection_title: 'المعلومات التي نجمعها',
        privacy_data_collection_list: 'معلومات الحساب: الاسم، البريد الإلكتروني.\nمعلومات الطفل: الاسم، العمر، الجنس، الصور، وأي تفاصيل أخرى تقدمها لتخصيص القصة.\nمعلومات الدفع: تفاصيل المعاملات المالية.',
        privacy_data_usage_title: 'كيف نستخدم معلوماتك',
        privacy_data_usage_list: 'لتخصيص وإنشاء المنتجات التي تطلبها.\nلمعالجة طلباتك ومدفوعاتك.\nللتواصل معك بخصوص طلباتك أو لتقديم الدعم الفني.\nلتحسين خدماتنا وتجربة المستخدم على المنصة.',
        privacy_data_sharing_title: 'مشاركة المعلومات',
        privacy_data_sharing_text: 'نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية أو معلومات طفلك مع أي طرف ثالث لأغراض تسويقية. قد نشارك المعلومات فقط مع مزودي الخدمات الذين يساعدوننا في تشغيل المنصة (مثل بوابات الدفع) والذين يلتزمون بالحفاظ على سرية هذه المعلومات.',
        privacy_children_title: 'خصوصية الأطفال',
        privacy_children_text: 'نحن نأخذ خصوصية الأطفال على محمل الجد. يتم استخدام المعلومات المقدمة عن الأطفال فقط لغرض وحيد وهو إنشاء المنتج المخصص المطلوب. لا يتم استخدام هذه المعلومات لأي غرض آخر.',
        privacy_security_title: 'أمان البيانات',
        privacy_security_text: 'نتخذ إجراءات أمنية معقولة لحماية معلوماتك من الوصول غير المصرح به. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100%.',
        privacy_rights_title: 'حقوقك',
        privacy_rights_text: 'لديك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها. يمكنك القيام بذلك عن طريق التواصل معنا.',
        policy_changes_title: 'التغييرات على هذه السياسة',
        policy_changes_text: 'قد نقوم بتحديث سياسة الخصوصية وشروط الاستخدام من وقت لآخر. سنقوم بإعلامك بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة. يُنصح بمراجعة هذه الصفحة بشكل دوري.',
        contact_us_title: 'اتصل بنا',
        contact_us_text: 'إذا كان لديك أي أسئلة حول هذه السياسة، يرجى التواصل معنا عبر صفحة الدعم والمساعدة.',
    },
};

const MOCK_SOCIAL_LINKS: SocialLinks = {
    facebook_url: 'https://facebook.com',
    twitter_url: 'https://twitter.com',
    instagram_url: 'https://instagram.com',
};

const MOCK_INSTRUCTORS: Instructor[] = [
    { id: 1, name: 'أحمد المصري', specialty: 'متخصص في كتابة القصة القصيرة', slug: 'ahmed-masri', bio: 'كاتب ومحرر شغوف، متخصص في مساعدة الأطفال على اكتشاف أصواتهم الإبداعية من خلال القصص. لديه خبرة 5 سنوات في ورش عمل الكتابة الإبداعية.', avatar_url: 'https://i.ibb.co/2S4xT8w/male-avatar.png', availability: { '15': ['10:00 ص', '11:00 ص'], '17': ['02:00 م'] } },
    { id: 2, name: 'نورة خالد', specialty: 'خبيرة في الشعر والنصوص الحرة', slug: 'noura-khaled', bio: 'شاعرة وفنانة، تؤمن بأن لكل طفل قصة تستحق أن تروى. تستخدم أساليب مبتكرة لإطلاق العنان لخيال الأطفال وتحويل أفكارهم إلى كلمات.', avatar_url: 'https://i.ibb.co/yYg5b1c/alrehlah-logo.png', availability: { '16': ['09:00 ص', '12:00 م'], '18': ['03:00 م'] } },
];

const MOCK_CW_PACKAGES: CreativeWritingPackage[] = [
    { id: 1, name: 'الباقة التأسيسية', sessions: '3 جلسات فردية', price: 1200, features: ['جلسة تعريفية', '3 جلسات فردية', 'متابعة عبر البريد'], popular: false },
    { id: 2, name: 'الباقة التطويرية', sessions: '8 جلسات فردية', price: 2800, features: ['8 جلسات فردية', 'ملف إنجاز رقمي', 'جلسة ختامية مع ولي الأمر'], popular: true },
    { id: 3, name: 'الباقة المتقدمة', sessions: '12 جلسة فردية', price: 4000, features: ['12 جلسة فردية', 'مشروع كتابي متكامل', 'نشر القصة في مدونة المنصة'], popular: false },
    { id: 4, name: 'جلسة استشارية', sessions: 'جلسة واحدة', price: 500, features: ['تقييم مستوى', 'خطة تطوير شخصية', 'إجابة على الاستفسارات'], popular: false },
];

const MOCK_ADDITIONAL_SERVICES: AdditionalService[] = [
    { id: 1, name: 'جلسة متابعة إضافية', price: 450, description: 'جلسة فردية إضافية بعد انتهاء الباقة.' },
    { id: 2, name: 'تحرير وتدقيق لغوي', price: 200, description: 'مراجعة احترافية لنصوص الطالب.' },
    { id: 3, name: 'نشر إلكتروني', price: 300, description: 'تصميم ونشر عمل الطالب ككتاب إلكتروني.' },
];

const MOCK_CW_BOOKINGS: (CreativeWritingBooking & { instructors: Instructor | null })[] = [
    { id: 'BK-1', user_id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba', user_name: 'فاطمة علي', instructor_id: 1, package_id: 2, package_name: 'الباقة التطويرية', booking_date: '2024-07-25', booking_time: '10:00 ص', status: 'مؤكد', total: 2800, session_id: 'abc-123', receipt_url: 'https://example.com/receipt.jpg', admin_comment: null, instructors: MOCK_INSTRUCTORS[0] },
    { id: 'BK-2', user_id: '12345678-abcd-efgh-ijkl-mnopqrstuvwx', user_name: 'أحمد محمود', instructor_id: 2, package_id: 1, package_name: 'الباقة التأسيسية', booking_date: '2024-07-26', booking_time: '09:00 ص', status: 'بانتظار الدفع', total: 1200, session_id: null, receipt_url: null, admin_comment: null, instructors: MOCK_INSTRUCTORS[1] },
];

// --- Context Definition ---

interface CreateOrderPayload {
    currentUser: UserProfile;
    formData: any;
    files: { [key: string]: File | null };
    totalPrice: number;
    itemSummary: string;
}

interface UpdateProductPayload {
    id: number;
    title: string;
    description: string;
    features: string[] | null;
    imageFile: File | null;
}

interface CreateSupportTicketPayload { name: string; email: string; subject: string; message: string; }
interface CreateJoinRequestPayload { name: string; email: string; role: string; portfolio_url: string | null; message: string; }


interface AdminContextType {
    orders: IOrderDetails[];
    updateOrderStatus: (orderId: string, newStatus: IOrderDetails['status']) => Promise<void>;
    updateOrderComment: (orderId: string, comment: string) => Promise<void>;
    createOrder: (payload: CreateOrderPayload) => Promise<void>;
    
    users: User[];
    updateUserRole: (userId: string, newRole: 'user' | 'admin') => Promise<void>;
    
    updateReceipt: (itemId: string, itemType: 'order' | 'booking', receiptFile: File) => Promise<void>;
    
    loading: boolean;
    error: string | null;

    siteContent: TextContent;
    updateSiteContent: (newContent: TextContent) => Promise<void>;
    
    socialLinks: SocialLinks;
    updateSocialLinks: (links: SocialLinks) => Promise<void>;

    personalizedProducts: PersonalizedProduct[];
    updatePersonalizedProduct: (payload: UpdateProductPayload) => Promise<void>;
    
    instructors: Instructor[];
    addInstructor: (payload: { name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; }) => Promise<void>;
    updateInstructor: (payload: { id: number; name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; }) => Promise<void>;
    updateInstructorAvailability: (instructorId: number, availability: AvailableSlots) => Promise<void>;
    creativeWritingPackages: CreativeWritingPackage[];
    updateCreativeWritingPackages: (packages: CreativeWritingPackage[]) => Promise<void>;
    additionalServices: AdditionalService[];
    updateAdditionalServices: (services: AdditionalService[]) => Promise<void>;
    creativeWritingBookings: (CreativeWritingBooking & { instructors: Instructor | null })[];
    updateBookingStatus: (bookingId: string, newStatus: CreativeWritingBooking['status']) => Promise<void>;
    createBooking: (payload: any) => Promise<void>;
    generateAndSetSessionId: (bookingId: string) => Promise<string | null>;

    supportTickets: SupportTicket[];
    createSupportTicket: (payload: CreateSupportTicketPayload) => Promise<void>;
    updateSupportTicketStatus: (ticketId: string, newStatus: SupportTicket['status']) => Promise<void>;

    joinRequests: JoinRequest[];
    createJoinRequest: (payload: CreateJoinRequestPayload) => Promise<void>;
    updateJoinRequestStatus: (requestId: string, newStatus: JoinRequest['status']) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [orders, setOrders] = useState<IOrderDetails[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [personalizedProducts, setPersonalizedProducts] = useState<PersonalizedProduct[]>([]);
    const [siteContent, setSiteContent] = useState<TextContent>({});
    const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [creativeWritingPackages, setCreativeWritingPackages] = useState<CreativeWritingPackage[]>([]);
    const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
    const [creativeWritingBookings, setCreativeWritingBookings] = useState<(CreativeWritingBooking & { instructors: Instructor | null })[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

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
        setInstructors(MOCK_INSTRUCTORS);
        setCreativeWritingPackages(MOCK_CW_PACKAGES);
        setAdditionalServices(MOCK_ADDITIONAL_SERVICES);
        setCreativeWritingBookings(MOCK_CW_BOOKINGS);
        setSupportTickets(MOCK_SUPPORT_TICKETS);
        setJoinRequests(MOCK_JOIN_REQUESTS);
        setLoading(false);
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createOrder = async ({ currentUser, formData, files, totalPrice, itemSummary }: CreateOrderPayload) => {
        const orderId = `ORD-${Date.now()}`;
        
        const newOrder: IOrderDetails = {
            id: orderId,
            customer_name: currentUser.name,
            item_summary: itemSummary,
            total: `${totalPrice} ج.م`,
            details: { ...formData, images: {} } as any, // Mock images
            user_id: currentUser.id,
            status: 'بانتظار الدفع',
            order_date: new Date().toISOString(),
            file_url: null,
            receipt_url: null,
            admin_comment: null,
        };

        setOrders(prev => [newOrder, ...prev]);
        console.log("Mock Order Created:", newOrder);
    };
    
    const updateReceipt = async (itemId: string, itemType: 'order' | 'booking', receiptFile: File) => {
        console.log(`Mock receipt uploaded for ${itemType} ${itemId}:`, receiptFile.name);
        const receipt_url = URL.createObjectURL(receiptFile); // Create local preview URL
        
        if (itemType === 'order') {
          setOrders(prev => prev.map(o => o.id === itemId ? { ...o, status: 'بانتظار المراجعة', receipt_url } : o));
        } else if (itemType === 'booking') {
            setCreativeWritingBookings(prev => prev.map(b => b.id === itemId ? { ...b, status: 'بانتظار المراجعة', receipt_url } : b));
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

    const addInstructor = async (payload: { name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; }) => {
        const newId = Math.max(...instructors.map(i => i.id), 0) + 1;
        const newInstructor: Instructor = {
            id: newId,
            name: payload.name,
            specialty: payload.specialty,
            slug: payload.slug,
            bio: payload.bio,
            avatar_url: payload.avatarFile ? URL.createObjectURL(payload.avatarFile) : null,
            availability: {}
        };
        setInstructors(prev => [...prev, newInstructor]);
        addToast('تمت إضافة المدرب بنجاح (تجريبيًا).', 'success');
    };

    const updateInstructor = async (payload: { id: number; name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; }) => {
        setInstructors(prev => prev.map(i => {
            if (i.id === payload.id) {
                return {
                    ...i,
                    name: payload.name,
                    specialty: payload.specialty,
                    slug: payload.slug,
                    bio: payload.bio,
                    avatar_url: payload.avatarFile ? URL.createObjectURL(payload.avatarFile) : i.avatar_url,
                };
            }
            return i;
        }));
        addToast('تم تحديث بيانات المدرب بنجاح (تجريبيًا).', 'success');
    };

    const updateInstructorAvailability = async (instructorId: number, availability: AvailableSlots) => {
        setInstructors(prev => prev.map(i => i.id === instructorId ? { ...i, availability: availability as Json } : i));
        // No toast here to avoid clutter during frequent updates. Toast is in the component.
    };

    const updateCreativeWritingPackages = async (packages: CreativeWritingPackage[]) => {
        setCreativeWritingPackages(packages);
        addToast('تم تحديث الباقات بنجاح (تجريبيًا).', 'success');
    };

    const updateAdditionalServices = async (services: AdditionalService[]) => {
        setAdditionalServices(services);
        addToast('تم تحديث الخدمات الإضافية بنجاح (تجريبيًا).', 'success');
    };
    
    const createBooking = async (payload: any) => {
        const newBooking: CreativeWritingBooking & { instructors: Instructor | null } = {
            id: `BK-${Date.now()}`,
            user_id: payload.currentUser.id,
            user_name: payload.currentUser.name,
            instructor_id: payload.instructorId,
            package_id: payload.selectedPackage.id,
            package_name: payload.selectedPackage.name,
            booking_date: payload.selectedDate.toISOString().split('T')[0],
            booking_time: payload.selectedTime,
            status: 'بانتظار الدفع',
            total: payload.selectedPackage.price,
            session_id: null,
            receipt_url: null,
            admin_comment: null,
            instructors: instructors.find(i => i.id === payload.instructorId) || null,
        };
        setCreativeWritingBookings(prev => [newBooking, ...prev]);
        console.log("Mock Booking Created:", newBooking);
    };

    const updateBookingStatus = async (bookingId: string, newStatus: CreativeWritingBooking['status']) => {
        setCreativeWritingBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        addToast('تم تحديث حالة الحجز (تجريبيًا).', 'success');
    };

    const generateAndSetSessionId = async (bookingId: string) => {
        const newSessionId = `mock-session-${Math.random().toString(36).substring(7)}`;
        setCreativeWritingBookings(prev => prev.map(b => b.id === bookingId ? { ...b, session_id: newSessionId } : b));
        return newSessionId;
    };

    const createSupportTicket = async (payload: CreateSupportTicketPayload) => {
        const newTicket: SupportTicket = {
            id: `TKT-${Date.now()}`,
            ...payload,
            created_at: new Date().toISOString(),
            status: 'جديدة',
        };
        setSupportTickets(prev => [newTicket, ...prev]);
    };

    const updateSupportTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
        setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        addToast('تم تحديث حالة الرسالة.', 'success');
    };

    const createJoinRequest = async (payload: CreateJoinRequestPayload) => {
        const newRequest: JoinRequest = {
            id: `JOIN-${Date.now()}`,
            ...payload,
            created_at: new Date().toISOString(),
            status: 'جديد',
        };
        setJoinRequests(prev => [newRequest, ...prev]);
    };

    const updateJoinRequestStatus = async (requestId: string, newStatus: JoinRequest['status']) => {
        setJoinRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
        addToast('تم تحديث حالة الطلب.', 'success');
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
            instructors,
            addInstructor,
            updateInstructor,
            updateInstructorAvailability,
            creativeWritingPackages,
            updateCreativeWritingPackages,
            additionalServices,
            updateAdditionalServices,
            creativeWritingBookings,
            updateBookingStatus,
            createBooking,
            generateAndSetSessionId,
            supportTickets, createSupportTicket, updateSupportTicketStatus,
            joinRequests, createJoinRequest, updateJoinRequestStatus,
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