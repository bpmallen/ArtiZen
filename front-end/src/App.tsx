import "./App.css";
import ArtworkListPage from "./pages/ArtworkListPage";
import { useAuth } from "./contexts/useAuth";

function Footer() {
  const { isAuthenticated, currentUser } = useAuth();
  return (
    <footer style={{ marginTop: 20, fontSize: 12 }}>
      {isAuthenticated ? `Logged in as ${currentUser?.username}` : "Not logged in"}
    </footer>
  );
}

function App() {
  return (
    <div>
      <h1>Exhibition Curation Platform</h1>
      <ArtworkListPage />
      <Footer />
    </div>
  );
}

export default App;
