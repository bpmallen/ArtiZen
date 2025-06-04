import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NavBar from "./components/Navbar";
import ArtworkListPage from "./pages/ArtworkListPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./contexts/useAuth";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<ArtworkListPage />} />
        <Route path="login" element={<LoginPage />} />
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
