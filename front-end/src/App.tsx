import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/Navbar";
import ArtworkListPage from "./pages/ArtworkListPage";
// import LoginPage from './pages/LoginPage';      //
// import RegisterPage from './pages/RegisterPage';//
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionDetailPage from "./pages/CollectionDetailPage";
// import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./contexts/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <BrowserRouter>
      <NavBar
        onLoginClick={() => setShowLoginModal(true)}
        onRegisterClick={() => setShowRegisterModal(true)}
      />
      <Routes>
        <Route path="/" element={<ArtworkListPage />} />

        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <CollectionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/:collectionName"
          element={
            <ProtectedRoute>
              <CollectionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} />}
      <Footer />
    </BrowserRouter>
  );
  function Footer() {
    const { isAuthenticated, currentUser } = useAuth();
    return (
      <footer style={{ marginTop: 20, fontSize: 12, textAlign: "center" }}>
        {isAuthenticated ? `Logged in as ${currentUser?.username}` : "Not logged in"}
      </footer>
    );
  }
}
