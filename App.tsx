import React, { Suspense, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
// FIX: Added .tsx extension to Header import to resolve module error.
import Header from './components/Header.tsx';
// FIX: Added .tsx extension to Footer import to resolve module error.
import Footer from './components/Footer.tsx';
// FIX: Added .tsx extension to ScrollToTop import to resolve module error.
import ScrollToTop from './components/ScrollToTop.tsx';
// FIX: Added .tsx extension to FloatingAiButton import to resolve module error.
import FloatingAiButton from './components/FloatingAiButton.tsx';
// FIX: Added .tsx extension to PageLoader import to resolve module error.
import PageLoader from './components/ui/PageLoader.tsx';
import { AdminProvider } from './contexts/AdminContext.tsx';
import { CreativeWritingAdminProvider } from './contexts/admin/CreativeWritingAdminContext.tsx';
import { CommunicationProvider } from './contexts/admin/CommunicationContext.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { isSupabaseConfigured } from './lib/supabaseClient.ts';
// FIX: Added .tsx extension to ChatWidget import to resolve module error.
import ChatWidget from './components/ChatWidget.tsx';
import PortalPage from './pages/PortalPage.tsx';

// Lazy load all pages except the portal
const AboutPage = React.lazy(() => import('./pages/AboutPage.tsx'));
const PersonalizedStoriesPage = React.lazy(() => import('./pages/PersonalizedStoriesPage.tsx'));
const OrderPage = React.lazy(() => import('./pages/OrderPage.tsx'));
const AccountPage = React.lazy(() => import('./pages/AccountPage.tsx'));
const SupportPage = React.lazy(() => import('./pages/SupportPage.tsx'));
const JoinUsPage = React.lazy(() => import('./pages/JoinUsPage.tsx'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage.tsx'));
const TermsOfUsePage = React.lazy(() => import('./pages/TermsOfUsePage.tsx'));
const CreativeWritingPage = React.lazy(() => import('./pages/CreativeWritingPage.tsx'));
const CreativeWritingAboutPage = React.lazy(() => import('./pages/CreativeWritingAboutPage.tsx'));
const CreativeWritingCurriculumPage = React.lazy(() => import('./pages/CreativeWritingCurriculumPage.tsx'));
const CreativeWritingInstructorsPage = React.lazy(() => import('./pages/CreativeWritingInstructorsPage.tsx'));
const InstructorProfilePage = React.lazy(() => import('./pages/InstructorProfilePage.tsx'));
const CreativeWritingBookingPage = React.lazy(() => import('./pages/CreativeWritingBookingPage.tsx'));
const CreativeWritingJoinUsPage = React.lazy(() => import('./pages/CreativeWritingJoinUsPage.tsx'));
const SessionPage = React.lazy(() => import('./pages/SessionPage.tsx'));
const StudentLoginPage = React.lazy(() => import('./pages/StudentLoginPage.tsx'));
const StudentDashboardPage = React.lazy(() => import('./pages/student/StudentDashboardPage.tsx'));
const BlogPage = React.lazy(() => import('./pages/BlogPage.tsx'));
const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage.tsx'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage.tsx'));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout.tsx'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage.tsx'));
const PaymentStatusPage = React.lazy(() => import('./pages/PaymentStatusPage.tsx'));
const SupabaseSetup = React.lazy(() => import('./components/setup/SupabaseSetup.tsx'));


const ProtectedRoute: React.FC<{ children: React.ReactElement, adminOnly?: boolean, studentOnly?: boolean }> = ({ children, adminOnly, studentOnly }) => {
    const { isLoggedIn, hasAdminAccess, currentUser } = useAuth();
    
    if (!isLoggedIn) {
        const target = studentOnly ? '/student-login' : '/account';
        return <Navigate to={target} replace />;
    }
    
    if (adminOnly && !hasAdminAccess) {
        return <Navigate to="/" replace />;
    }

    if (studentOnly && currentUser?.role !== 'student') {
        return <Navigate to="/" replace />;
    }

    return children;
};


const AppContent: React.FC = () => {
    const location = useLocation();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const isAdminRoute = location.pathname.startsWith('/admin');
    const isSessionRoute = location.pathname.startsWith('/session');
    const isStudentLoginRoute = location.pathname.startsWith('/student-login');
    const isCheckoutRoute = location.pathname.startsWith('/checkout');
    const isPaymentStatusRoute = location.pathname.startsWith('/payment/status');

    const shouldShowHeaderFooter = !isAdminRoute && !isSessionRoute && !isStudentLoginRoute && !isCheckoutRoute && !isPaymentStatusRoute;

    return (
        <div className="flex flex-col min-h-screen">
            {shouldShowHeaderFooter && <Header />}
            <main className="flex-grow">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route index element={<PortalPage />} />
                        
                        {/* Enha Lak */}
                        <Route path="/enha-lak/store" element={<PersonalizedStoriesPage />} />
                        <Route path="/enha-lak/order/:productKey" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
                        <Route path="/enha-lak/join-us" element={<JoinUsPage />} />
                        <Route path="/enha-lak/subscription" element={<SubscriptionPage />} />

                        {/* Creative Writing */}
                        <Route path="/creative-writing" element={<CreativeWritingPage />} />
                        <Route path="/creative-writing/about" element={<CreativeWritingAboutPage />} />
                        <Route path="/creative-writing/curriculum" element={<CreativeWritingCurriculumPage />} />
                        <Route path="/creative-writing/instructors" element={<CreativeWritingInstructorsPage />} />
                        <Route path="/instructor/:slug" element={<InstructorProfilePage />} />
                        <Route path="/creative-writing/booking" element={<CreativeWritingBookingPage />} />
                        <Route path="/creative-writing/join-us" element={<CreativeWritingJoinUsPage />} />
                        
                         {/* Shared Pages */}
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:slug" element={<BlogPostPage />} />
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms-of-use" element={<TermsOfUsePage />} />

                        {/* Student Routes */}
                        <Route path="/student-login" element={<StudentLoginPage />} />
                         <Route 
                            path="/student/dashboard" 
                            element={
                                <ProtectedRoute studentOnly>
                                    <StudentDashboardPage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/session/:sessionId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />

                        {/* System Pages */}
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/payment/status" element={<ProtectedRoute><PaymentStatusPage /></ProtectedRoute>} />
                        
                        <Route 
                            path="/admin/*" 
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminLayout />
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </Suspense>
            </main>
            {shouldShowHeaderFooter && <Footer />}
            {shouldShowHeaderFooter && (
                <>
                    <FloatingAiButton onClick={() => setIsChatOpen(true)} isChatOpen={isChatOpen} />
                    <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                </>
            )}
        </div>
    );
};

const App: React.FC = () => {
    const configured = isSupabaseConfigured();

    if (!configured) {
        return (
            <Suspense fallback={<PageLoader />}>
                <SupabaseSetup />
            </Suspense>
        );
    }

    return (
        <>
            <ScrollToTop />
            <AdminProvider>
                <CreativeWritingAdminProvider>
                    <CommunicationProvider>
                        <AppContent />
                    </CommunicationProvider>
                </CreativeWritingAdminProvider>
            </AdminProvider>
        </>
    );
};

export default App;