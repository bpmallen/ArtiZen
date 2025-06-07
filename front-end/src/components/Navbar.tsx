import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

import { RxAvatar } from "react-icons/rx";

interface NavBarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export default function NavBar({ onOpenLogin, onOpenRegister }: NavBarProps) {
  const { isAuthenticated, currentUser, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <Link
        to="/"
        className="text-xl font-heading font-bold text-gray-800"
        // style={{ fontFamily: '"Playfair Display", serif' }}
      >
        ArtiZen
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {/* Show avatar if present */}
            {currentUser?.profileImageUrl ? (
              <img
                src={currentUser.profileImageUrl}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <RxAvatar className="w-8 h-8 text-gray-500" />
            )}
            <span className="font-medium text-gray-700">{currentUser?.username}</span>

            <Link to="/collections" className="text-gray-700 hover:underline">
              My Collections
            </Link>

            {/* New Profile link */}
            <Link to="/profile" className="text-gray-700 hover:underline">
              Profile
            </Link>

            <button onClick={logout} className="text-red-600 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={onOpenLogin} className="text-blue-600 hover:underline">
              Login
            </button>
            <button onClick={onOpenRegister} className="text-green-600 hover:underline">
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
