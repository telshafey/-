import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PortalPage from './pages/PortalPage'; // New Portal Page
import EnhaLakHomePage from './pages/HomePage'; // Renamed conceptually
import AboutPage from './pages/AboutPage';
import PersonalizedStoriesPage from './pages/PersonalizedStoriesPage';
import AccountPage from './pages/AccountPage';
import SupportPage from './pages/SupportPage';
import JoinUsPage from './pages/JoinUsPage';
import OrderPage from './pages/OrderPage';
import GeminiPage from './pages/GeminiPage';
import FloatingAiButton from './components/FloatingAiButton';
import { Loader2 } from 'lucide-react';
import ScrollToTop from './components/ScrollToTop';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CreativeWritingPage from './pages/CreativeWritingPage';
import CreativeWritingAboutPage from './pages/CreativeWritingAboutPage';
import CreativeWritingCurriculumPage from './pages/CreativeWritingCurriculumPage';
import CreativeWritingInstructorsPage from './pages/CreativeWritingInstructorsPage';
import CreativeWritingBookingPage from './pages/CreativeWritingBookingPage';
import InstructorProfilePage from './pages/InstructorProfilePage';
import SessionPage from './pages/SessionPage';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminJoinRequestsPage from './pages/admin/AdminJoinRequestsPage';


import { useAuth } from './contexts/AuthContext';
import AdminLayout from './components/admin/AdminLayout';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAdmin, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return children;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const showLayout = location.pathname !== '/' && !location.pathname.startsWith('/session/');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {showLayout && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<PortalPage />} />
          
          {/* Enha Lak Routes */}
          <Route path="/enha-lak" element={<EnhaLakHomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/store" element={<PersonalizedStoriesPage />} />
          <Route path="/ai-guide" element={<GeminiPage />} />
          <Route path="/order/:productKey" element={<OrderPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/join-us" element={<JoinUsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          
          {/* Creative Writing Routes */}
          <Route path="/creative-writing" element={<CreativeWritingPage />} />
          <Route path="/creative-writing/about" element={<CreativeWritingAboutPage />} />
          <Route path="/creative-writing/curriculum" element={<CreativeWritingCurriculumPage />} />
          <Route path="/creative-writing/instructors" element={<CreativeWritingInstructorsPage />} />
          <Route path="/creative-writing/booking" element={<CreativeWritingBookingPage />} />
          <Route path="/instructor/:slug" element={<InstructorProfilePage />} />
          <Route path="/session/:sessionId" element={<SessionPage />} />

          {/* Shared Route */}
          <Route path="/account" element={<AccountPage />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {showLayout && <Footer />}
      {showLayout && location.pathname !== '/ai-guide' && <FloatingAiButton />}
    </div>
  );
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <AppContent />
    </HashRouter>
  );
};

export default App;