export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// FIX: Extracted the Row type definition to a named type to resolve invalid 'this' usage.
type ChildProfilesRow = {
  id: number
  user_id: string
  name: string
  age: number
  gender: "ذكر" | "أنثى"
  avatar_url: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      // This is a simplified representation based on context files
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'user' | 'super_admin' | 'enha_lak_supervisor' | 'creative_writing_supervisor' | 'instructor' | 'student'
        }
      }
      child_profiles: {
        Row: ChildProfilesRow
        Insert: Omit<ChildProfilesRow, 'id' | 'created_at'>
        Update: Partial<ChildProfilesRow>
      }
      orders: {
        Row: {
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
        }
      }
      personalized_products: {
        Row: {
            id: number
            key: string
            title: string
            description: string
            image_url: string | null
            features: string[] | null
            sort_order: number | null
        }
      }
      site_content: {
        Row: {
            page_key: string
            content: Json
        }
      }
      social_links: {
          Row: {
              id: number
              facebook_url: string | null
              twitter_url: string | null
              instagram_url: string | null
          }
      }
      support_tickets: {
        Row: {
            id: string
            name: string
            email: string
            subject: string
            message: string
            status: 'جديدة' | 'تمت المراجعة' | 'مغلقة'
            created_at: string
        }
      }
      join_requests: {
        Row: {
            id: string
            name: string
            email: string
            role: string
            portfolio_url: string | null
            message: string
            status: 'جديد' | 'تمت المراجعة' | 'مقبول' | 'مرفوض'
            created_at: string
        }
      }
      // FIX: Added blog_posts table definition.
      blog_posts: {
        Row: {
          id: number
          created_at: string
          title: string
          slug: string
          content: string
          author_name: string
          status: "draft" | "published"
          image_url: string | null
          published_at: string | null
        }
      }
      instructors: {
          Row: {
              id: number
              user_id: string | null
              name: string
              specialty: string | null
              slug: string | null
              bio: string | null
              avatar_url: string | null
              availability: Json | null // AvailableSlots
              weekly_schedule: Json | null // WeeklySchedule
              schedule_status: 'approved' | 'pending' | 'rejected' | null
          }
      }
      creative_writing_packages: {
          Row: {
              id: number
              name: string
              sessions: string
              price: number
              features: string[]
              popular: boolean
          }
      }
      additional_services: {
        Row: {
            id: number
            name: string
            price: number
            description: string | null
        }
      }
      creative_writing_bookings: {
          Row: {
            id: string
            user_id: string
            user_name: string
            instructor_id: number
            package_id: number
            package_name: string
            booking_date: string
            booking_time: string
            status: 'بانتظار الدفع' | 'بانتظار المراجعة' | 'مؤكد' | 'مكتمل' | 'ملغي'
            total: number
            session_id: string | null
            receipt_url: string | null
            admin_comment: string | null
            progress_notes: string | null
          }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Custom types derived from schema for easier use
export type ChildProfile = Database['public']['Tables']['child_profiles']['Row'];
export type SocialLinks = Database['public']['Tables']['social_links']['Row'];
export type PersonalizedProduct = Database['public']['Tables']['personalized_products']['Row'];
export type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];
export type JoinRequest = Database['public']['Tables']['join_requests']['Row'];
// FIX: Export BlogPost type.
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type Instructor = Database['public']['Tables']['instructors']['Row'];
export type CreativeWritingPackage = Database['public']['Tables']['creative_writing_packages']['Row'];
export type AdditionalService = Database['public']['Tables']['additional_services']['Row'];
export type CreativeWritingBooking = Database['public']['Tables']['creative_writing_bookings']['Row'];

// Specific JSON types
export type OrderDetailsJson = {
    childName: string;
    childAge: number;
    childGender: string;
    familyNames?: string;
    childTraits?: string;
    products?: string;
    shipping?: string;
    images?: { [key: string]: string | null };
};

export type AvailableSlots = {
    [day: string]: string[];
};

export type WeeklySchedule = {
    [day in 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday']?: string[];
};