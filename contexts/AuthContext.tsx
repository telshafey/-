import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

interface SignInCredentials { email: string; password?: string; }
interface SignUpCredentials extends SignInCredentials { name: string; }

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  currentUser: UserProfile | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  switchUser: (role: 'user' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Mock Data ---
const MOCK_ADMIN_USER: UserProfile = {
  id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  name: 'المدير العام',
  email: 'admin@alrehlah.com',
  role: 'admin',
};

const MOCK_REGULAR_USER: UserProfile = {
  id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba',
  name: 'فاطمة علي',
  email: 'user@alrehlah.com',
  role: 'user',
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { addToast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate checking session on initial load
  useEffect(() => {
    setLoading(true);
    const sessionUser = localStorage.getItem('mockUserSession');
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    if (email === MOCK_ADMIN_USER.email) {
      setCurrentUser(MOCK_ADMIN_USER);
      localStorage.setItem('mockUserSession', JSON.stringify(MOCK_ADMIN_USER));
    } else {
      setCurrentUser(MOCK_REGULAR_USER);
      localStorage.setItem('mockUserSession', JSON.stringify(MOCK_REGULAR_USER));
    }
    setLoading(false);
  };

  const signUp = async ({ name, email }: SignUpCredentials) => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 800));
    // In a real mock, you might store this new user in localStorage
    // For now, just simulate success.
    console.log(`Mock sign up for ${name} with email ${email}`);
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 300));
    setCurrentUser(null);
    localStorage.removeItem('mockUserSession');
    setLoading(false);
  };
  
  const signInWithGoogle = async () => {
      addToast('تسجيل الدخول عبر جوجل غير متاح في الوضع التجريبي.', 'info');
      await signIn({email: MOCK_REGULAR_USER.email}); // Log in as regular user for demo
  };

  const resetPasswordForEmail = async (email: string) => {
      addToast(`تم إرسال رابط إعادة التعيين (تجريبيًا) إلى ${email}`, 'success');
  }

  const updateUserPassword = async (password: string) => {
      console.log('Mock password updated to:', password);
  }
  
  const switchUser = (role: 'user' | 'admin') => {
    setLoading(true);
    if (role === 'admin') {
      setCurrentUser(MOCK_ADMIN_USER);
      localStorage.setItem('mockUserSession', JSON.stringify(MOCK_ADMIN_USER));
    } else {
      setCurrentUser(MOCK_REGULAR_USER);
      localStorage.setItem('mockUserSession', JSON.stringify(MOCK_REGULAR_USER));
    }
    setLoading(false);
    addToast(`تم التبديل إلى حساب ${role === 'admin' ? 'المدير' : 'المستخدم'}.`, 'info');
};

  const value: AuthContextType = {
    isLoggedIn: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    currentUser,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPasswordForEmail,
    updateUserPassword,
    switchUser,
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
