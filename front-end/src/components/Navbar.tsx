import { useState } from "react";
import { Link } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { useAuth } from "../contexts/useAuth";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function NavBar() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const avatarSrc = currentUser?.profileImageUrl;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <nav className="bg-black px-2 sm:px-4 md:px-8 lg:px-20">
      <div className="flex justify-between items-center py-6 w-full">
        {/* Logo */}
        <Link to="/" className="relative inline-block text-4xl font-heading font-extralight">
          <span
            className="
              block text-white
              mask-conic-from-neutral-900
              transition-opacity duration-[3000ms] ease-in-out
              hover:opacity-0
            "
          >
            ArtiZen
          </span>
          <span
            className="
              absolute inset-0 block text-white
              opacity-0
              transition-opacity duration-[1s] ease-in-out
              hover:opacity-100
            "
          >
            ArtiZen
          </span>
        </Link>

        {/* Avatar + Dropdown */}
        <div className="relative group flex items-center space-x-3">
          {isAuthenticated && currentUser?.username && (
            <span className="text-white font-roboto">{currentUser.username}</span>
          )}
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`${currentUser?.username} avatar`}
              className="w-12 h-12 rounded-full object-cover cursor-pointer"
            />
          ) : (
            <RxAvatar className="w-12 h-12 text-white cursor-pointer" />
          )}

          <div
            className="
            font-roboto
            absolute
            top-full     
            right-0      
            mt-2         
            w-48
            bg-black border border-gray-700 rounded shadow-lg
            invisible group-hover:visible opacity-0 group-hover:opacity-100
            transition-all duration-150 z-50
  "
          >
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block px-4 py-2 text-white hover:bg-gray-800">
                  Profile
                </Link>
                <Link to="/collections" className="block px-4 py-2 text-white hover:bg-gray-800">
                  My Collections
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} />}
    </nav>
  );
}
