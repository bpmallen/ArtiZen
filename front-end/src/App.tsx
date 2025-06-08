import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/Navbar";
import ArtworkListPage from "./pages/ArtworkListPage";
import ArtworkDetailPage from "./pages/ArtworkDetailPage";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionDetailPage from "./pages/CollectionDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <BrowserRouter>
      <NavBar
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenRegister={() => setShowRegisterModal(true)}
      />
      <Routes>
        <Route path="/" element={<ArtworkListPage />} />
        <Route path="/artwork/:source/:artworkId" element={<ArtworkDetailPage />} />

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
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} />}
    </BrowserRouter>
  );
}
