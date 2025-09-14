import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const PersonalizedStoriesPage = React.lazy(() => import('./pages/PersonalizedStoriesPage'));
const OrderPage = React.lazy(() => import('./pages/OrderPage'));
const AccountPage = React.lazy(() => import('./pages/AccountPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));
const JoinUsPage = React.lazy(() => import('./pages/JoinUsPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const PortalPage = React.lazy(() => import('./pages/PortalPage'));
const GeminiPage = React.lazy(() => import('./pages/GeminiPage'));
const CreativeWritingPage = React.lazy(() => import('./pages/CreativeWritingPage'));
const CreativeWritingAboutPage = React.lazy(() => import('./pages/CreativeWritingAboutPage'));
const CreativeWritingCurriculumPage = React.lazy(() => import('./pages/CreativeWritingCurriculumPage'));
const CreativeWritingInstructorsPage = React.lazy(() => import('./pages/CreativeWritingInstructorsPage'));
const InstructorProfilePage = React.lazy(() => import('./pages/InstructorProfilePage'));
const CreativeWritingBookingPage = React.lazy(() => import('./pages/CreativeWritingBookingPage'));
const CreativeWritingSupportPage = React.lazy(() => import('./pages/CreativeWritingSupportPage'));
const CreativeWritingJoinUsPage = React.lazy(() => import('./pages/CreativeWritingJoinUsPage'));
const SessionPage = React.lazy(() => import('./pages/SessionPage'));
const StudentLoginPage = React.lazy(() => import('./pages/StudentLoginPage'));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));


const ProtectedRoute: React.FC<{ children: React.ReactElement, adminOnly?: boolean }> = ({ children, adminOnly }) => {
    const { isLoggedIn, hasAdminAccess } = useAuth();
    if (!isLoggedIn) {
        return <Navigate to="/account" replace />;
    }
    if (adminOnly && !hasAdminAccess) {
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

    const shouldShowHeaderFooter = !isAdminRoute && !isSessionRoute && !isPortalRoute && !isStudentLoginRoute;

    return (
        <>
            {shouldShowHeaderFooter && <Header />}
            <main className="flex-grow">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<PortalPage />} />
                        
                        {/* Enha Lak */}
                        <Route path="/enha-lak" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/store" element={<PersonalizedStoriesPage />} />
                        <Route path="/order/:productKey" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/join-us" element={<JoinUsPage />} />

                        {/* Creative Writing */}
                        <Route path="/creative-writing" element={<CreativeWritingPage />} />
                        <Route path="/creative-writing/about" element={<CreativeWritingAboutPage />} />
                        <Route path="/creative-writing/curriculum" element={<CreativeWritingCurriculumPage />} />
                        <Route path="/creative-writing/instructors" element={<CreativeWritingInstructorsPage />} />
                        <Route path="/instructor/:slug" element={<InstructorProfilePage />} />
                        <Route path="/creative-writing/booking" element={<CreativeWritingBookingPage />} />
                        <Route path="/creative-writing/support" element={<CreativeWritingSupportPage />} />
                        <Route path="/creative-writing/join-us" element={<CreativeWritingJoinUsPage />} />
                        <Route path="/student-login" element={<StudentLoginPage />} />
                        <Route path="/session/:sessionId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />

                        {/* Shared & System */}
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="/ai-guide" element={<GeminiPage />} />
                        
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
        <Router>
            <ScrollToTop />
            <AdminProvider>
                <CreativeWritingAdminProvider>
                    <CommunicationProvider>
                        <AppContent />
                    </CommunicationProvider>
                </CreativeWritingAdminProvider>
            </AdminProvider>
        </Router>
    );
};

export default App;
