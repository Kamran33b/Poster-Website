/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ShopByCategory } from './components/ShopByCategory';
import { BestSellersSection } from './components/BestSellersSection';
import { NewArrivalsSection } from './components/NewArrivalsSection';
import { WallInspiration } from './components/WallInspiration';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { ShopPage } from './components/ShopPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AccountModal } from './components/AccountModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AIChatBubble } from './components/AIChatBubble';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    toastMessage, 
    showToast,
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    isAdminAuthModalOpen,
    setIsAdminAuthModalOpen
  } = useStore();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 font-sans antialiased flex flex-col selection:bg-stone-900 selection:text-amber-300 relative">
      {/* If admin view is active and authenticated, show Admin Dashboard */}
      {currentView === 'admin' && isAdminAuthenticated ? (
        <AdminDashboard />
      ) : (
        <>
          <Header />

          {/* Main View Router */}
          <main className="flex-1">
            {currentView === 'home' && (
              <>
                <Hero />
                <ShopByCategory />
                <BestSellersSection />
                <WallInspiration />
                <NewArrivalsSection />
                <CustomerReviewsSection />
                <Newsletter />
              </>
            )}

            {currentView === 'shop' && <ShopPage />}
            {currentView === 'product-detail' && <ProductDetailPage />}
            {currentView === 'checkout' && <CheckoutModal />}
            {currentView === 'order-confirmation' && <OrderConfirmationModal />}
            {currentView === 'account' && <AccountModal />}
          </main>

          {/* Global Customer Footer */}
          <Footer />
        </>
      )}

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* AI Customer Support Chat Bubble */}
      <AIChatBubble />

      {/* Admin Password & OTP Auth Modal - Placed above every layer and centered */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsAdminAuthModalOpen(false);
          setCurrentView('admin');
          showToast('Admin portal unlocked successfully.');
        }}
      />

      {/* Real-time Global Toast Alert */}
      {toastMessage && <ToastNotification message={toastMessage} />}
    </div>
  );
};

const ToastNotification: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-stone-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 text-xs font-medium max-w-md">
        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
        <span className="flex-1 leading-snug">{message}</span>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
