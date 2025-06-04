import { type ReactNode } from "react";
import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/Navbar";
import ArtworkListPage from "./pages/ArtworkListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CollectionsPage from "./pages/CollectionsPage";
import { useAuth } from "./contexts/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<ArtworkListPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <CollectionsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

function Footer() {
  const { isAuthenticated, currentUser } = useAuth();
  return (
    <footer style={{ marginTop: 20, fontSize: 12, textAlign: "center" }}>
      {isAuthenticated ? `Logged in as ${currentUser?.username}` : "Not logged in"}
    </footer>
  );
}
export default App;
