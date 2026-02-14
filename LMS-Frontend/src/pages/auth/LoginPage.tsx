import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginAsync } from "../../features/auth/authSlice";
import { BookOpen, Eye, EyeOff } from "lucide-react";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginAsync({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[var(--background)] relative overflow-hidden">

      {/* Background Glow */}
      <div
        className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
        style={{ background: "var(--primary)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
        style={{ background: "var(--secondary)" }}
      />

      <div
        className="relative w-full max-w-md p-10 rounded-3xl shadow-2xl border backdrop-blur-md"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-[var(--primary-light)]">
            <BookOpen className="w-10 h-10 text-[var(--primary)]" />
          </div>

          <h1 className="text-3xl font-black heading-font text-[var(--foreground)] mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl border text-sm"
               style={{
                 background: "rgba(239,68,68,0.08)",
                 borderColor: "rgba(239,68,68,0.3)",
                 color: "rgb(220,38,38)"
               }}>
            <div className="font-semibold mb-1">Authentication Failed</div>
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)"
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)"
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--primary)"
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t text-center text-xs text-[var(--muted-foreground)]"
             style={{ borderColor: "var(--border)" }}>
          Secure authentication powered by JWT
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
