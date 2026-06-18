import { Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAdmin } from "./lib/auth.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import SiteShell from "./components/SiteShell.jsx";

import HomePage from "./pages/HomePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import DestinationPage from "./pages/DestinationPage.jsx";
import DestinationsIndexPage from "./pages/DestinationsIndexPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import CookiesPage from "./pages/CookiesPage.jsx";
import SitemapPage from "./pages/SitemapPage.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminPackagesPage from "./pages/admin/AdminPackagesPage.jsx";
import AdminPackageForm from "./pages/admin/AdminPackageForm.jsx";
import AdminDestinationsPage from "./pages/admin/AdminDestinationsPage.jsx";
import AdminLeadsPage from "./pages/admin/AdminLeadsPage.jsx";
import AdminStaysPage from "./pages/admin/AdminStaysPage.jsx";
import AdminPoliciesPage from "./pages/admin/AdminPoliciesPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <SiteShell>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/packages/:slug" element={<ProductPage />} />
          <Route path="/destinations" element={<DestinationsIndexPage />} />
          <Route path="/destinations/:slug" element={<DestinationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/sitemap" element={<SitemapPage />} />

          {/* ADMIN */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="packages" element={<AdminPackagesPage />} />
            <Route path="packages/new" element={<AdminPackageForm />} />
            <Route path="packages/:id" element={<AdminPackageForm />} />
            <Route path="destinations" element={<AdminDestinationsPage />} />
            <Route path="stays" element={<AdminStaysPage />} />
            <Route path="policies" element={<AdminPoliciesPage />} />
            <Route path="leads" element={<AdminLeadsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SiteShell>
    </AuthProvider>
  );
}
