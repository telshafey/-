
import React, { Suspense } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
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
        return <ReactRouterDOM.Navigate to="/account" replace />;
    }
    if (adminOnly && !hasAdminAccess) {
        return <ReactRouterDOM.Navigate to="/" replace />;
    }
    return children;
};


const AppContent: React.FC = () => {
    const location = ReactRouterDOM.useLocation();
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
                    <ReactRouterDOM.Routes>
                        <ReactRouterDOM.Route path="/" element={<PortalPage />} />
                        
                        {/* Enha Lak */}
                        <ReactRouterDOM.Route path="/enha-lak" element={<HomePage />} />
                        <ReactRouterDOM.Route path="/about" element={<AboutPage />} />
                        <ReactRouterDOM.Route path="/store" element={<PersonalizedStoriesPage />} />
                        <ReactRouterDOM.Route path="/order/:productKey" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
                        <ReactRouterDOM.Route path="/support" element={<SupportPage />} />
                        <ReactRouterDOM.Route path="/join-us" element={<JoinUsPage />} />

                        {/* Creative Writing */}
                        <ReactRouterDOM.Route path="/creative-writing" element={<CreativeWritingPage />} />
                        <ReactRouterDOM.Route path="/creative-writing/about" element={<CreativeWritingAboutPage />} />
                        <ReactRouterDOM.Route path="/creative-writing/curriculum" element={<CreativeWritingCurriculumPage />} />
                        <ReactRouterDOM.Route path="/creative-writing/instructors" element={<CreativeWritingInstructorsPage />} />
                        <ReactRouterDOM.Route path="/instructor/:slug" element={<InstructorProfilePage />} />
                        <ReactRouterDOM.Route path="/creative-writing/booking" element={<CreativeWritingBookingPage />} />
                        <ReactRouterDOM.Route path="/creative-writing/support" element={<CreativeWritingSupportPage />} />
                        <ReactRouterDOM.Route path="/creative-writing/join-us" element={<CreativeWritingJoinUsPage />} />
                        <ReactRouterDOM.Route path="/student-login" element={<StudentLoginPage />} />
                        <ReactRouterDOM.Route path="/session/:sessionId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />

                        {/* Shared & System */}
                        <ReactRouterDOM.Route path="/account" element={<AccountPage />} />
                        <ReactRouterDOM.Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <ReactRouterDOM.Route path="/ai-guide" element={<GeminiPage />} />
                        
                        <ReactRouterDOM.Route 
                            path="/admin/*" 
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminLayout />
                                </ProtectedRoute>
                            } 
                        />
                    </ReactRouterDOM.Routes>
                </Suspense>
            </main>
            {shouldShowHeaderFooter && <Footer />}
            {shouldShowHeaderFooter && <FloatingAiButton />}
        </>
    );
};

const App: React.FC = () => {
    return (
        <ReactRouterDOM.HashRouter>
            <ScrollToTop />
            <AdminProvider>
                <CreativeWritingAdminProvider>
                    <CommunicationProvider>
                        <AppContent />
                    </CommunicationProvider>
                </CreativeWritingAdminProvider>
            </AdminProvider>
        </ReactRouterDOM.HashRouter>
    );
};

export default App;