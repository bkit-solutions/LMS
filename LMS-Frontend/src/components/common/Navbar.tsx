import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import { 
  BookOpen, Menu, X, ChevronDown, User, 
  LogOut, Settings, LayoutDashboard, GraduationCap, 
  BookText, FileCheck, Award 
} from "lucide-react";
import { useCollegeTheme } from "../../hooks/useCollegeTheme";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { branding } = useCollegeTheme();

  const userRole = user?.type;
  const collegeName = user?.collegeName;
  const collegeCode = user?.collegeCode;
  const displayName = user?.name || user?.email;

  // Close dropdown on click outside
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
    if (userRole === "ROOTADMIN" || userRole === "SUPERADMIN") return `/dashboard${subPath}`;
    return collegeCode ? `/${collegeCode}/dashboard${subPath}` : "/dashboard";
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
      { label: "Admins", path: "/dashboard/admins", icon: User },
      { label: "Courses", path: "/dashboard/courses", icon: BookText },
      { label: "Topics", path: "/dashboard/topics", icon: BookOpen },
      { label: "Tests", path: "/dashboard/tests", icon: FileCheck },
    ],
    ADMIN: [
      { label: "Dashboard", path: getDashboardPath(), icon: LayoutDashboard },
      { label: "Faculty", path: getDashboardPath("/users/faculty"), icon: GraduationCap },
      { label: "Students", path: getDashboardPath("/users/students"), icon: User },
      { label: "Courses", path: getDashboardPath("/courses"), icon: BookText },
      { label: "Topics", path: getDashboardPath("/topics"), icon: BookOpen },
      { label: "Tests", path: getDashboardPath("/tests"), icon: FileCheck },
    ],
    FACULTY: [
      { label: "Dashboard", path: getDashboardPath(), icon: LayoutDashboard },
      { label: "Courses", path: getDashboardPath("/courses"), icon: BookText },
      { label: "Topics", path: getDashboardPath("/topics"), icon: BookOpen },
      { label: "Tests", path: getDashboardPath("/tests"), icon: FileCheck },
    ],
    USER: [
      { label: "Dashboard", path: getDashboardPath(), icon: LayoutDashboard },
      { label: "My Courses", path: getDashboardPath("/courses"), icon: BookText },
      { label: "Certificates", path: getDashboardPath("/certificates"), icon: Award },
    ]
  };

  const handleLogout = () => {
    // Capture user info before logout clears it
    const currentUserRole = user?.type;
    const currentCollegeCode = user?.collegeCode;

    dispatch(logout());

    // Redirect to college-specific login for college users, general login for system admins
    if (currentUserRole === "ROOTADMIN" || currentUserRole === "SUPERADMIN") {
      navigate("/login");
    } else if (currentCollegeCode) {
      navigate(`/login/${currentCollegeCode}`);
    } else {
      navigate("/login");
    }
  };

  const isActive = (path: string) => location.pathname === path || (path !== getDashboardPath() && location.pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-[100] border-b bg-white/95 backdrop-blur-md" 
            style={{ borderBottomColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* BRANDING SECTION */}
        <Link to="/" className="flex items-center group">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center border transition-all overflow-hidden mr-3"
               style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <BookOpen className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            )}
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
              {branding ? collegeName : "BKIT LMS"}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
              LMS
            </span>
          </div>
        </Link>

        {/* CENTER NAVIGATION (DESKTOP) */}
        {isAuthenticated && (
          <nav className="hidden xl:flex items-center space-x-1">
            {(navLinks[userRole || ""] || []).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2"
                style={{
                  backgroundColor: isActive(link.path) ? 'var(--color-primary)' : 'transparent',
                  color: isActive(link.path) ? 'white' : 'var(--color-text-secondary)'
                }}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        )}

        {/* RIGHT ACTIONS SECTION */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center" ref={profileRef}>
              <div className="hidden md:flex flex-col items-end mr-3">
                <span className="text-xs font-black" style={{ color: 'var(--color-text)' }}>{displayName}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>
                  {userRole}
                </span>
              </div>

              {/* Profile Button */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center p-1 rounded-full border transition-all"
                  style={{ backgroundColor: 'white', borderColor: 'var(--color-border)' }}
                >
                  <div className="h-9 w-9 rounded-full flex items-center justify-center border border-white overflow-hidden"
                       style={{ backgroundColor: 'var(--color-surface)' }}>
                    <User className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ml-1 ${isProfileOpen ? 'rotate-180' : ''}`} 
                               style={{ color: 'var(--color-text-secondary)' }} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border py-2 overflow-hidden"
                       style={{ borderColor: 'var(--color-border)' }}>
                    <div className="px-4 py-3 border-b" style={{ borderBottomColor: 'var(--color-surface)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: 'var(--color-text-secondary)' }}>Account</p>
                      <p className="text-sm font-black truncate" style={{ color: 'var(--color-text)' }}>{displayName}</p>
                    </div>
                    
                    <Link 
                      to={getDashboardPath("/profile")} 
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-black border-t"
                      style={{ color: 'var(--color-primary)', borderTopColor: 'var(--color-surface)' }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login" className="px-5 py-2 text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>Sign In</Link>
              <Link 
                to="/init-rootadmin" 
                className="px-6 py-2 text-white text-sm font-black rounded-xl shadow-lg"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Setup
              </Link>
            </div>
          )}

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl border transition-all"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white border-t px-4 py-6 space-y-2" style={{ borderTopColor: 'var(--color-border)' }}>
          {isAuthenticated && (navLinks[userRole || ""] || []).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center space-x-4 p-4 rounded-2xl font-black transition-all"
              style={{
                backgroundColor: isActive(link.path) ? 'var(--color-surface)' : 'transparent',
                color: isActive(link.path) ? 'var(--color-primary)' : 'var(--color-text-secondary)'
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          ))}
          {!isAuthenticated && (
             <div className="grid grid-cols-2 gap-4 pt-4">
                <Link to="/login" className="p-4 text-center rounded-2xl border font-bold" 
                      style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>Sign In</Link>
                <Link to="/init-rootadmin" className="p-4 text-center rounded-2xl text-white font-bold" 
                      style={{ backgroundColor: 'var(--color-primary)' }}>Setup</Link>
             </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;