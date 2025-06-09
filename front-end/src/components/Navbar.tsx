import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { useAuth } from "../contexts/useAuth";

export interface NavBarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export default function NavBar({ onOpenLogin, onOpenRegister }: NavBarProps) {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const avatarSrc = currentUser?.profileImageUrl;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((o) => !o);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const handleNav = (to: string) => {
    navigate(to);
    setMenuOpen(false);
  };

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
        <div className="relative" ref={menuRef}>
          <button
            onClick={toggleMenu}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={isAuthenticated ? "Open user menu" : "Open login menu"}
          >
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
              <RxAvatar className="w-12 h-12 text-white cursor-pointer" aria-hidden="true" />
            )}
          </button>

          <div
            className={`
              font-roboto
              absolute top-full right-0 mt-2 w-48 bg-black border border-gray-700 rounded shadow-lg
              transition-opacity duration-150 z-50
              ${menuOpen ? "visible opacity-100" : "invisible opacity-0"}
            `}
            role="menu"
            aria-label="User menu"
          >
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNav("/profile")}
                  role="menuitem"
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  Profile
                </button>
                <button
                  onClick={() => handleNav("/collections")}
                  role="menuitem"
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  My Collections
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  role="menuitem"
                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMenuOpen(false);
                  }}
                  role="menuitem"
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onOpenRegister();
                    setMenuOpen(false);
                  }}
                  role="menuitem"
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
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
