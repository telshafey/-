import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
// FIX: Added .ts extension to resolve module error.
import { ChildProfile } from '../lib/database.types.ts';

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'super_admin' | 'enha_lak_supervisor' | 'creative_writing_supervisor' | 'instructor' | 'student';
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  hasAdminAccess: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsDemoUser: (role: Exclude<UserProfile['role'], 'student'>) => void;
  childProfiles: ChildProfile[];
  addChildProfile: (profile: Omit<ChildProfile, 'id' | 'user_id' | 'created_at'> & { avatarFile: File | null }) => Promise<void>;
  updateChildProfile: (profile: Omit<ChildProfile, 'user_id' | 'created_at'> & { avatarFile: File | null }) => Promise<void>;
  deleteChildProfile: (profileId: number) => Promise<void>;
}

// MOCK DATA
const MOCK_DEMO_USERS: { [key in Exclude<UserProfile['role'], 'student'>]: UserProfile } = {
    super_admin: { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', email: 'admin@alrehlah.com', name: 'المدير العام', role: 'super_admin' },
    enha_lak_supervisor: { id: 'enha-lak-supervisor-id', email: 'enhalak@example.com', name: 'مشرف إنها لك', role: 'enha_lak_supervisor' },
    creative_writing_supervisor: { id: 'cw-supervisor-id', email: 'cw@example.com', name: 'مشرف بداية الرحلة', role: 'creative_writing_supervisor' },
    instructor: { id: 'd1e2f3a4-b5c6-d789-e123-f456a789b0cd', email: 'instructor@example.com', name: 'أحمد المصري (مدرب)', role: 'instructor' },
    user: { id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba', email: 'user@alrehlah.com', name: 'فاطمة علي (مستخدم)', role: 'user' },
};

const MOCK_USER: UserProfile = MOCK_DEMO_USERS.user;
const MOCK_ADMIN: UserProfile = MOCK_DEMO_USERS.super_admin;

const MOCK_CHILD_PROFILES: ChildProfile[] = [
    { id: 1, user_id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba', name: 'سارة', age: 5, gender: 'أنثى', avatar_url: null, created_at: new Date().toISOString() },
    { id: 2, user_id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba', name: 'يوسف', age: 8, gender: 'ذكر', avatar_url: null, created_at: new Date().toISOString() }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
    const { addToast } = useToast();

    const fetchMockData = useCallback(() => {
        setLoading(true);
        // Simulate checking session.
        setCurrentUser(null); 
        setChildProfiles(MOCK_CHILD_PROFILES);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMockData();
    }, [fetchMockData]);
    
    const signIn = async (email: string, pass: string) => {
        setLoading(true); setError(null);
        await new Promise(res => setTimeout(res, 500));
        if (email === 'admin@alrehlah.com') {
            setCurrentUser(MOCK_ADMIN);
            addToast('مرحباً بعودتك أيها المدير!', 'success');
        } else {
            setCurrentUser(MOCK_USER);
            addToast('تم تسجيل الدخول بنجاح!', 'success');
        }
        setLoading(false);
    };

    const signInAsDemoUser = (role: Exclude<UserProfile['role'], 'student'>) => {
        const userToSignIn = MOCK_DEMO_USERS[role];
        if (userToSignIn) {
            setCurrentUser(userToSignIn);
            addToast(`تم تسجيل الدخول كـ "${userToSignIn.name}"`, 'info');
        } else {
            addToast('الدور المحدد غير موجود.', 'error');
        }
    };

    const signUp = async (email: string, pass: string, name: string) => {
        setLoading(true); setError(null);
        await new Promise(res => setTimeout(res, 500));
        const newUser = { ...MOCK_USER, email, name };
        setCurrentUser(newUser);
        addToast('تم إنشاء حسابك بنجاح!', 'success');
        setLoading(false);
    };

    const signOut = async () => {
        setCurrentUser(null);
        addToast('تم تسجيل الخروج.', 'info');
    };

    const addChildProfile = async (profile: Omit<ChildProfile, 'id' | 'user_id' | 'created_at'> & { avatarFile: File | null }) => {
        if(!currentUser) throw new Error("User not logged in");
        const newProfile: ChildProfile = {
            id: Date.now(),
            user_id: currentUser.id,
            created_at: new Date().toISOString(),
            name: profile.name,
            age: profile.age,
            gender: profile.gender,
            avatar_url: profile.avatarFile ? URL.createObjectURL(profile.avatarFile) : null,
        };
        setChildProfiles(prev => [...prev, newProfile]);
        addToast(`تمت إضافة ملف ${profile.name} بنجاح!`, 'success');
    };

    const updateChildProfile = async (profile: Omit<ChildProfile, 'user_id' | 'created_at'> & { avatarFile: File | null }) => {
        setChildProfiles(prev => prev.map(p => p.id === profile.id ? { 
            ...p, 
            name: profile.name, 
            age: profile.age, 
            gender: profile.gender,
            avatar_url: profile.avatarFile ? URL.createObjectURL(profile.avatarFile) : profile.avatar_url,
        } : p));
        addToast(`تم تحديث ملف ${profile.name} بنجاح!`, 'success');
    };

    const deleteChildProfile = async (profileId: number) => {
        setChildProfiles(prev => prev.filter(p => p.id !== profileId));
        addToast('تم حذف ملف الطفل.', 'success');
    };


    const value = {
        currentUser,
        isLoggedIn: !!currentUser,
        hasAdminAccess: !!currentUser && currentUser.role !== 'user' && currentUser.role !== 'student',
        loading,
        error,
        signIn,
        signUp,
        signOut,
        signInAsDemoUser,
        childProfiles,
        addChildProfile,
        updateChildProfile,
        deleteChildProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};