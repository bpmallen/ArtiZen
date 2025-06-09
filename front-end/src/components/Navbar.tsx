import { Link } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { useAuth } from "../contexts/useAuth";

export interface NavBarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export default function NavBar({ onOpenLogin, onOpenRegister }: NavBarProps) {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const avatarSrc = currentUser?.profileImageUrl;

  return (
    <nav
      className="bg-black px-2 sm:px-4 md:px-8 lg:px-20"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-between items-center py-6 w-full">
        {/* Logo */}
        <Link
          to="/"
          className="relative inline-block text-4xl font-heading font-extralight focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Go to homepage"
        >
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
            <span
              className="text-white font-roboto"
              aria-label={`Logged in as ${currentUser.username}`}
            >
              {currentUser.username}
            </span>
          )}

          {/* Make avatar a button or link for keyboard focus */}
          <button
            className="focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={isAuthenticated ? "Open user menu" : "Open login menu"}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={`${currentUser?.username} avatar`}
                className="w-12 h-12 rounded-full object-cover cursor-pointer"
              />
            ) : (
              <RxAvatar className="w-12 h-12 text-white cursor-pointer" aria-hidden="true" />
            )}
          </button>

          {/* Dropdown menu */}
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
            role="menu"
            aria-label="User menu"
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  role="menuitem"
                  className="block px-4 py-2 text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  Profile
                </Link>
                <Link
                  to="/collections"
                  role="menuitem"
                  className="block px-4 py-2 text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  My Collections
                </Link>
                <button
                  onClick={logout}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  Login
                </button>
                <button
                  onClick={onOpenRegister}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
