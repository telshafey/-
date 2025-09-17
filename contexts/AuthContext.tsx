import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.ts';
import { useToast } from './ToastContext.tsx';
import type { ChildProfile } from '../lib/database.types.ts';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    // FIX: Added created_at to the UserProfile interface to match database schema and fix type errors.
    created_at: string;
    role: 'user' | 'super_admin' | 'enha_lak_supervisor' | 'creative_writing_supervisor' | 'instructor' | 'student' | 'content_editor' | 'support_agent';
}

interface AddChildProfilePayload {
    name: string;
    age: number;
    gender: 'ذكر' | 'أنثى';
    avatarFile: File | null;
    interests?: string[];
    strengths?: string[];
}

interface UpdateChildProfilePayload extends Partial<ChildProfile> {
    id: number;
    avatarFile?: File | null;
}


interface AuthContextType {
    isLoggedIn: boolean;
    currentUser: UserProfile | null;
    currentChildProfile: ChildProfile | null;
    hasAdminAccess: boolean;
    childProfiles: ChildProfile[];
    loading: boolean;
    error: string | null;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
    addChildProfile: (profileData: AddChildProfilePayload) => Promise<void>;
    updateChildProfile: (profileData: UpdateChildProfilePayload) => Promise<void>;
    deleteChildProfile: (childId: number) => Promise<void>;
    fetchAiChatHistory: () => Promise<any[]>;
    saveAiChatHistory: (history: any[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [currentChildProfile, setCurrentChildProfile] = useState<ChildProfile | null>(null);
    const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const fetchUserProfile = useCallback(async (user: SupabaseUser | null): Promise<UserProfile | null> => {
        if (!user) return null;
        const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
        return data as UserProfile;
    }, []);

    const fetchChildProfiles = useCallback(async (userId: string) => {
        const { data, error } = await supabase.from('child_profiles').select('*').eq('user_id', userId);
        if (error) {
            addToast('فشل تحميل ملفات الأطفال.', 'error');
            return;
        }
        setChildProfiles(data || []);
    }, [addToast]);
    
    const fetchCurrentChildProfileForStudent = useCallback(async (studentUserId: string) => {
        const { data, error } = await supabase.from('child_profiles').select('*').eq('student_user_id', studentUserId).single();
        if (error) {
            console.warn("Could not find linked child profile for student:", error.message);
            return;
        }
        setCurrentChildProfile(data);
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setLoading(true);
            const user = session?.user ?? null;
            const profile = await fetchUserProfile(user);
            setCurrentUser(profile);
            if (profile) {
                if (profile.role === 'student') {
                    await fetchCurrentChildProfileForStudent(profile.id);
                } else {
                    await fetchChildProfiles(profile.id);
                }
            } else {
                setChildProfiles([]);
                setCurrentChildProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [fetchUserProfile, fetchChildProfiles, fetchCurrentChildProfileForStudent]);

    const signIn = async (email: string, pass: string) => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
            setError(error.message);
            addToast('فشل تسجيل الدخول. تحقق من بياناتك.', 'error');
        } else {
            addToast('تم تسجيل الدخول بنجاح!', 'success');
            const { data: { user } } = await supabase.auth.getUser();
            const profile = await fetchUserProfile(user);
            if (profile?.role === 'student') {
                navigate('/student/dashboard');
            } else if (profile && ['super_admin', 'enha_lak_supervisor', 'creative_writing_supervisor', 'instructor', 'content_editor', 'support_agent'].includes(profile.role)) {
                navigate('/admin');
            } else {
                 navigate('/account');
            }
        }
        setLoading(false);
    };
    
    const signUp = async (email: string, pass: string, name: string) => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password: pass,
            options: {
                data: {
                    name: name
                }
            }
        });
        if (error) {
            setError(error.message);
            addToast(`فشل إنشاء الحساب: ${error.message}`, 'error');
        } else if (data.user) {
            const { error: profileError } = await supabase.from('users').insert({
                id: data.user.id,
                email: data.user.email!,
                name: name,
                role: 'user'
            });
            if (profileError) {
                 setError(profileError.message);
                 addToast(`فشل إنشاء ملف المستخدم: ${profileError.message}`, 'error');
            } else {
                addToast('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.', 'success');
                navigate('/account');
            }
        }
        setLoading(false);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setChildProfiles([]);
        setCurrentChildProfile(null);
        navigate('/');
    };
    
    const addChildProfile = async (profileData: AddChildProfilePayload) => {
        if (!currentUser) throw new Error("User not logged in");

        let avatar_url = null;
        if (profileData.avatarFile) {
            const filePath = `${currentUser.id}/${Date.now()}-${profileData.avatarFile.name}`;
            const { error: uploadError } = await supabase.storage.from('child_avatars').upload(filePath, profileData.avatarFile);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('child_avatars').getPublicUrl(filePath);
            avatar_url = data.publicUrl;
        }

        const { error } = await supabase.from('child_profiles').insert({
            user_id: currentUser.id,
            name: profileData.name,
            age: profileData.age,
            gender: profileData.gender,
            avatar_url: avatar_url,
            interests: profileData.interests,
            strengths: profileData.strengths,
        });
        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تمت إضافة الطفل بنجاح!', 'success');
        await fetchChildProfiles(currentUser.id);
    };

    const updateChildProfile = async (profileData: UpdateChildProfilePayload) => {
        if (!currentUser) throw new Error("User not logged in");
        let avatar_url = profileData.avatar_url;
        if (profileData.avatarFile) {
             const filePath = `${currentUser.id}/${profileData.id}/${Date.now()}-${profileData.avatarFile.name}`;
             const { error: uploadError } = await supabase.storage.from('child_avatars').upload(filePath, profileData.avatarFile);
             if (uploadError) throw uploadError;
             const { data } = supabase.storage.from('child_avatars').getPublicUrl(filePath);
             avatar_url = data.publicUrl;
        }
        
        const { error } = await supabase.from('child_profiles').update({
            name: profileData.name,
            age: profileData.age,
            gender: profileData.gender,
            avatar_url,
            interests: profileData.interests,
            strengths: profileData.strengths,
        }).eq('id', profileData.id);
        
        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تم تحديث ملف الطفل بنجاح!', 'success');
        await fetchChildProfiles(currentUser.id);
    };
    
    const deleteChildProfile = async (childId: number) => {
        if (!currentUser) throw new Error("User not logged in");
        const { error } = await supabase.from('child_profiles').delete().eq('id', childId).eq('user_id', currentUser.id);
        if (error) { addToast(error.message, 'error'); throw error; }
        addToast('تم حذف ملف الطفل.', 'success');
        await fetchChildProfiles(currentUser.id);
    };
    
    const fetchAiChatHistory = async (): Promise<any[]> => {
        if (!currentUser) return [];
        // FIX: The 'ai_chat_history' table does not exist in the database.
        // This function is modified to return an empty array immediately to prevent runtime errors.
        // The chat will still function but history will not be persisted across sessions.
        console.warn("Bypassing fetchAiChatHistory: 'ai_chat_history' table not found in the database.");
        return [];
    };
    
    const saveAiChatHistory = async (history: any[]) => {
        if (!currentUser) return;
        // FIX: The 'ai_chat_history' table does not exist.
        // This function is modified to do nothing to prevent errors.
        console.warn("Bypassing saveAiChatHistory: 'ai_chat_history' table not found in the database.");
        return;
    };
    
    const value = {
        isLoggedIn: !!currentUser,
        currentUser,
        currentChildProfile,
        hasAdminAccess: !!currentUser && currentUser.role !== 'user' && currentUser.role !== 'student',
        childProfiles,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        addChildProfile,
        updateChildProfile,
        deleteChildProfile,
        fetchAiChatHistory,
        saveAiChatHistory,
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