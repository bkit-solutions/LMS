import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import {
  BookOpen,
  Menu,
  X,
  ChevronDown,
  User,
  LayoutDashboard,
  GraduationCap,
  BookText,
  FileCheck,
  Award,
} from "lucide-react";
import { useCollegeTheme } from "../../hooks/useCollegeTheme";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { branding } = useCollegeTheme();

  const userRole = user?.type;
  const collegeCode = user?.collegeCode;
  const displayName = user?.name || user?.email;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDashboardPath = (subPath = "") => {
    if (userRole === "ROOTADMIN" || userRole === "SUPERADMIN")
      return `/dashboard${subPath}`;
    return collegeCode
      ? `/${collegeCode}/dashboard${subPath}`
      : "/dashboard";
  };

  const navLinks: Record<string, { label: string; path: string; icon: any }[]> = {
    ROOTADMIN: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Super Admin", path: "/create-superadmin", icon: User },
      { label: "Admin", path: "/create-admin", icon: User },
    ],
    SUPERADMIN: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Colleges", path: "/dashboard/colleges", icon: BookOpen },
      { label: "Users", path: "/dashboard/users", icon: User },
      { label: "Admins", path: "/dashboard/admins", icon: GraduationCap },
      { label: "Courses", path: "/dashboard/courses", icon: BookText },
      { label: "Tests", path: "/dashboard/tests", icon: FileCheck },
    ],
    ADMIN: [
      { label: "Dashboard", path: getDashboardPath(), icon: LayoutDashboard },
      { label: "Faculty", path: getDashboardPath("/users/faculty"), icon: GraduationCap },
      { label: "Students", path: getDashboardPath("/users/students"), icon: User },
      { label: "Courses", path: getDashboardPath("/courses"), icon: BookText },
    ],
    FACULTY: [
      { label: "Dashboard", path: getDashboardPath(), icon: LayoutDashboard },
      { label: "Courses", path: getDashboardPath("/courses"), icon: BookText },
      { label: "Tests", path: getDashboardPath("/tests"), icon: FileCheck },
    ],
    USER: [
      { label: "Dashboard", path: getDashboardPath(), icon: LayoutDashboard },
      { label: "My Courses", path: getDashboardPath("/courses"), icon: BookText },
      { label: "Certificates", path: getDashboardPath("/certificates"), icon: Award },
    ],
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== getDashboardPath() && location.pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 bg-[var(--surface)] border-b border-[var(--border)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">

        {/* BRAND */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-[var(--primary-light)]">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <BookOpen className="w-6 h-6 text-[var(--primary)]" />
            )}
          </div>
          <div className="block">
            <h1 className="text-lg font-black text-[var(--foreground)]">
              {branding ? user?.collegeName : "BKIT LMS"}
            </h1>
            <span className="text-xs text-[var(--muted-foreground)]">LMS</span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center space-x-2">
            {(navLinks[userRole || ""] || []).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                  isActive(link.path)
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* AUTH BUTTONS */}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold">
                Sign Up
              </Link>
            </>
          )}

          {/* DESKTOP PROFILE */}
          {isAuthenticated && (
            <div className="relative hidden lg:block" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--primary-light)] transition"
              >
                <User className="w-5 h-5 text-[var(--primary)]" />
                <ChevronDown className="w-4 h-4" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl py-2">
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{userRole}</p>
                  </div>

                  <Link
                    to={getDashboardPath("/profile")}
                    className="block px-4 py-2 text-sm hover:bg-[var(--muted)]"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[var(--muted)]"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 rounded-md bg-[var(--muted)]"
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileOpen && (
        <div className="lg:hidden bg-[var(--surface)] border-t border-[var(--border)] px-6 py-4 space-y-3">

          {isAuthenticated &&
            (navLinks[userRole || ""] || []).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

          {isAuthenticated && (
            <button
              onClick={() => {
                handleLogout();
                setIsMobileOpen(false);
              }}
              className="block w-full text-left py-2 text-red-600 font-medium"
            >
              Sign Out
            </button>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/login" className="block py-2">Sign In</Link>
              <Link to="/register" className="block py-2">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
