import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Starfield from './components/Starfield';
import AuroraBackground from './components/AuroraBackground';
import SignInModal from './components/SignInModal';
import Home from './pages/Home';
import Info from './pages/Info';
import Library from './pages/Library';
import Wishlist from './pages/Wishlist';
import BookDetail from './pages/BookDetail';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookForm from './pages/admin/AdminBookForm';
import AdminBidders from './pages/admin/AdminBidders';
import { AdminAuthProvider } from './context/AdminAuthContext';

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Starfield />
      <AuroraBackground />
      <Navbar />
      <SignInModal />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col [&>*:first-child]:w-full [&>*:first-child]:flex-1">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/library"
        element={
          <PublicLayout>
            <Library />
          </PublicLayout>
        }
      />
      <Route
        path="/info"
        element={
          <PublicLayout>
            <Info />
          </PublicLayout>
        }
      />
      <Route
        path="/wishlist"
        element={
          <PublicLayout>
            <Wishlist />
          </PublicLayout>
        }
      />
      <Route
        path="/books/:id"
        element={
          <PublicLayout>
            <BookDetail />
          </PublicLayout>
        }
      />

      <Route
        path="/admin/*"
        element={
          <AdminAuthProvider>
            <Routes>
              <Route path="" element={<AdminLogin />} />
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="books/new" element={<AdminBookForm />} />
                <Route path="books/:id/edit" element={<AdminBookForm />} />
                <Route path="books/:id/bidders" element={<AdminBidders />} />
              </Route>
            </Routes>
          </AdminAuthProvider>
        }
      />

      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        }
      />
    </Routes>
  );
}
