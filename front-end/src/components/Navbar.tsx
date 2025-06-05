import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

interface NavBarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function NavBar({ onLoginClick, onRegisterClick }: NavBarProps) {
  const { isAuthenticated, currentUser, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <Link to="/" className="text-xl font-bold">
        Exhibition Curator
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {currentUser?.profileImageUrl && (
              <img
                src={currentUser.profileImageUrl}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="font-medium">{currentUser?.username}</span>
            <Link to="/collections" className="hover:underline">
              My Collections
            </Link>
            <Link to="/profile" className="hover:underline">
              Profile
            </Link>
            <button onClick={logout} className="text-red-600 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={onLoginClick} className="hover:underline text-blue-600">
              Login
            </button>
            <button onClick={onRegisterClick} className="hover:underline text-green-600">
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
