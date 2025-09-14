export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface OrderDetailsJson {
  childName: string;
  childAge: string;
  childGender: string;
  familyNames: string;
  childTraits: string;
  products: string;
  shipping: string;
  images: { [key: string]: string };
}

export interface SocialLinks {
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
}

export interface PersonalizedProduct {
  id: number;
  key: string;
  title: string;
  description: string;
  image_url: string | null;
  features: string[] | null;
  sort_order: number | null;
}

// FIX: Add missing types for creative writing feature
export interface AvailableSlots {
  [day: string]: string[];
}

export interface Instructor {
  id: number;
  name: string;
  specialty: string | null;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  availability: Json | null; // This will hold AvailableSlots
}

export interface CreativeWritingPackage {
  id: number;
  name: string;
  sessions: string;
  price: number;
  features: string[];
  popular: boolean;
}

export interface AdditionalService {
    id: number;
    name: string;
    price: number;
    description: string | null;
}

export interface CreativeWritingBooking {
  id: string;
  user_id: string;
  user_name: string;
  instructor_id: number;
  package_id: number;
  package_name: string;
  booking_date: string;
  booking_time: string;
  status: "بانتظار الدفع" | "بانتظار المراجعة" | "مؤكد" | "مكتمل" | "ملغي";
  total: number;
  session_id: string | null;
  receipt_url: string | null;
  admin_comment: string | null;
}

export interface SupportTicket {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
    status: 'جديدة' | 'تمت المراجعة' | 'مغلقة';
}

export interface JoinRequest {
    id: string;
    name: string;
    email: string;
    role: string;
    portfolio_url: string | null;
    message: string;
    created_at: string;
    status: 'جديد' | 'تمت المراجعة' | 'مقبول' | 'مرفوض';
}


// Simplified Database schema for frontend-only mode
export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          customer_name: string
          order_date: string
          item_summary: string | null
          total: string | null
          status:
            | "بانتظار الدفع"
            | "بانتظار المراجعة"
            | "قيد التجهيز"
            | "يحتاج مراجعة"
            | "تم الشحن"
            | "تم التسليم"
            | "ملغي"
            | "نشط"
          details: Json | null
          user_id: string | null
          file_url: string | null
          receipt_url: string | null
          admin_comment: string | null
        }
        Insert: any
        Update: any
      }
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: "user" | "admin"
        }
        Insert: any
        Update: any
      }
      prices: {
        Row: {
          id: number
          story_printed: number
          story_electronic: number
          coloring_book: number
          dua_booklet: number
          values_story: number
          skills_story: number
          gift_box: number
        }
        Insert: any
        Update: any
      }
      site_branding: {
        Row: {
          id: number
          logo_url: string | null
          hero_image_url: string | null
          about_image_url: string | null
          creative_writing_logo_url: string | null
        }
        Insert: any
        Update: any
      }
      site_config: {
        Row: {
          id: number
          key: string
          value: Json | null
        }
        Insert: any
        Update: any
      }
      site_content: {
        Row: {
          id: number
          page_key: string
          element_key: string
          content: string | null
        }
        Insert: any
        Update: any
      }
      personalized_products: {
        Row: PersonalizedProduct
        Insert: any
        Update: any
      }
      // FIX: Add missing tables for creative writing feature
      instructors: {
        Row: Instructor
        Insert: any
        Update: any
      }
      creative_writing_packages: {
        Row: CreativeWritingPackage
        Insert: any
        Update: any
      }
      additional_services: {
        Row: AdditionalService
        Insert: any
        Update: any
      }
      creative_writing_bookings: {
        Row: CreativeWritingBooking & { instructors: Instructor | null } // for joins
        Insert: any
        Update: any
      }
      support_tickets: {
        Row: SupportTicket;
        Insert: any;
        Update: any;
      }
      join_requests: {
        Row: JoinRequest;
        Insert: any;
        Update: any;
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