import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { loginAsync } from "../../features/auth/authSlice";
import { collegeApi } from "../../services/collegeApi";
import type { CollegeBranding } from "../../types";
import { Eye, EyeOff, Loader2, Building2, Mail, Lock } from "lucide-react";

const CollegeLoginPage: React.FC = () => {
  const { collegeCode } = useParams<{ collegeCode: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [branding, setBranding] = useState<CollegeBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (collegeCode) {
      fetchBranding();
    }
  }, [collegeCode]);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const response = await collegeApi.getCollegeBranding(collegeCode!);
      if (response.success && response.data) {
        setBranding(response.data);
        document.title = `Login - ${response.data.name}`;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "College not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await dispatch(
        loginAsync({ 
          email, 
          password,
          collegeCode: branding?.code 
        })
      ).unwrap();
      
      if (result) {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(typeof err === 'string' ? err : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error && !branding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-border p-8 max-w-md w-full text-center">
          <Building2 className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-text mb-2">College Not Found</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            Go to Main Login
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = branding?.primaryColor || "#dc2626";
  const secondaryColor = branding?.secondaryColor || "#991b1b";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* College Branding Card */}
        <div className="bg-white rounded-t-2xl shadow-xl overflow-hidden">
          {branding?.bannerUrl && (
            <div
              className="h-32 bg-cover bg-center"
              style={{ backgroundImage: `url(${branding.bannerUrl})` }}
            >
              <div className="h-full bg-gradient-to-b from-transparent to-white/90" />
            </div>
          )}
          {!branding?.bannerUrl && (
            <div
              className="h-32"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            />
          )}

          <div className="px-8 pb-8 -mt-16 relative">
            {/* Logo */}
            {branding?.logoUrl ? (
              <div className="w-24 h-24 bg-white rounded-full shadow-lg p-2 mx-auto mb-4 border-4 border-white">
                <img
                  src={branding.logoUrl}
                  alt={branding.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                className="w-24 h-24 rounded-full shadow-lg mx-auto mb-4 flex items-center justify-center border-4 border-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Building2 className="w-12 h-12 text-white" />
              </div>
            )}

            {/* College Info */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-text mb-1">{branding?.name}</h1>
              <p className="text-sm text-text-secondary font-mono">{branding?.code}</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  backgroundColor: primaryColor,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = secondaryColor;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = primaryColor;
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-text-secondary hover:text-primary transition-colors"
              >
                Go to Main Login
              </button>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="bg-white/50 backdrop-blur-sm rounded-b-2xl shadow-lg px-8 py-4 text-center">
          <p className="text-xs text-text-secondary">
            Secure login to {branding?.name} Learning Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollegeLoginPage;
