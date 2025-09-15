
import React, { Suspense } from 'react';
// FIX: Replaced the 'react-router-dom' namespace import with named imports to resolve component and hook resolution errors, and updated the code to use them directly.
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import FloatingAiButton from './components/FloatingAiButton';
import PageLoader from './components/ui/PageLoader';

// Admin Contexts
import { AdminProvider } from './contexts/AdminContext';
import { CreativeWritingAdminProvider } from './contexts/admin/CreativeWritingAdminContext';
import { CommunicationProvider } from './contexts/admin/CommunicationContext';

// FIX: Added .tsx extension to resolve module error.
import { useAuth } from './contexts/AuthContext.tsx';

// Lazy load all pages
// FIX: Add .tsx extension to all lazy-loaded page components to resolve module loading errors.
const HomePage = React.lazy(() => import('./pages/HomePage.tsx'));
const AboutPage = React.lazy(() => import('./pages/AboutPage.tsx'));
const PersonalizedStoriesPage = React.lazy(() => import('./pages/PersonalizedStoriesPage.tsx'));
const OrderPage = React.lazy(() => import('./pages/OrderPage.tsx'));
const AccountPage = React.lazy(() => import('./pages/AccountPage.tsx'));
const SupportPage = React.lazy(() => import('./pages/SupportPage.tsx'));
const JoinUsPage = React.lazy(() => import('./pages/JoinUsPage.tsx'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage.tsx'));
const TermsOfUsePage = React.lazy(() => import('./pages/TermsOfUsePage.tsx'));
const PortalPage = React.lazy(() => import('./pages/PortalPage.tsx'));
const GeminiPage = React.lazy(() => import('./pages/GeminiPage.tsx'));
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
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isSessionRoute = location.pathname.startsWith('/session');
    const isPortalRoute = location.pathname === '/';
    const isStudentLoginRoute = location.pathname.startsWith('/student-login');
    const isCheckoutRoute = location.pathname.startsWith('/checkout');

    const shouldShowHeaderFooter = !isAdminRoute && !isSessionRoute && !isPortalRoute && !isStudentLoginRoute && !isCheckoutRoute;

    return (
        <>
            {shouldShowHeaderFooter && <Header />}
            <main className="flex-grow">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<PortalPage />} />
                        
                        {/* Enha Lak */}
                        <Route path="/enha-lak" element={<HomePage />} />
                        <Route path="/store" element={<PersonalizedStoriesPage />} />
                        <Route path="/order/:productKey" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
                        <Route path="/join-us" element={<JoinUsPage />} />
                        <Route path="/subscription" element={<SubscriptionPage />} />

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
                        <Route path="/ai-guide" element={<GeminiPage />} />
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        
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
            {shouldShowHeaderFooter && <FloatingAiButton />}
        </>
    );
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <ScrollToTop />
            <AdminProvider>
                <CreativeWritingAdminProvider>
                    <CommunicationProvider>
                        <AppContent />
                    </CommunicationProvider>
                </CreativeWritingAdminProvider>
            </AdminProvider>
        </HashRouter>
    );
};

export default App;
