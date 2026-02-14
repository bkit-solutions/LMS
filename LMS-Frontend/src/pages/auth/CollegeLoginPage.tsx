import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { loginAsync } from "../../features/auth/authSlice";
import { collegeApi } from "../../services/collegeApi";
import type { CollegeBranding } from "../../types";
import {
  Eye,
  EyeOff,
  Loader2,
  Building2,
  Mail,
  Lock
} from "lucide-react";

const CollegeLoginPage: React.FC = () => {

  const { collegeCode } =
    useParams<{ collegeCode: string }>();

  const navigate = useNavigate();

  const dispatch = useAppDispatch();



  const [branding, setBranding] =
    useState<CollegeBranding | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);



  /* FETCH BRANDING */

  useEffect(() => {

    if (collegeCode)
      fetchBranding();

  }, [collegeCode]);



  const fetchBranding = async () => {

    try {

      setLoading(true);

      const response =
        await collegeApi.getCollegeBranding(
          collegeCode!
        );

      if (response.success && response.data) {

        setBranding(response.data);

        document.title =
          `Login - ${response.data.name}`;

      }

    }
    catch (err: any) {

      setError(
        err.response?.data?.message ||
        "College not found"
      );

    }
    finally {

      setLoading(false);

    }

  };



  /* LOGIN */

  const handleSubmit =
    async (e: React.FormEvent) => {

      e.preventDefault();

      setError(null);

      setIsSubmitting(true);

      try {

        const result =
          await dispatch(
            loginAsync({
              email,
              password,
              collegeCode: branding?.code
            })
          ).unwrap();

        if (result) {

          navigate(
            `/${branding?.code || collegeCode}/dashboard`
          );

        }

      }
      catch (err: any) {

        setError(
          typeof err === "string"
            ? err
            : "Login failed"
        );

      }
      finally {

        setIsSubmitting(false);

      }

    };



  /* LOADING */

  if (loading)
    return (

      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--surface)" }}
      >

        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "var(--primary)" }}
        />

      </div>

    );



  /* COLLEGE NOT FOUND */

  if (error && !branding)
    return (

      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--surface)" }}
      >

        <div
          className="rounded-lg shadow-lg border p-8 max-w-md w-full text-center"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)"
          }}
        >

          <Building2
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--accent)" }}
          />

          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            College Not Found
          </h2>

          <p
            className="mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            {error}
          </p>

          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 text-white rounded-lg"
            style={{ background: "var(--primary)" }}
          >
            Go to Main Login
          </button>

        </div>

      </div>

    );



  const primaryColor =
    branding?.primaryColor ||
    "var(--primary)";

  const secondaryColor =
    branding?.secondaryColor ||
    "var(--primary)";



  return (

    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--surface)" }}
    >

      <div className="w-full max-w-md">

        {/* CARD */}

        <div
          className="rounded-2xl shadow-xl overflow-hidden border"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)"
          }}
        >



          {/* BANNER */}

          {branding?.bannerUrl
            ? (
              <div
                className="h-32 bg-cover bg-center"
                style={{
                  backgroundImage:
                    `url(${branding.bannerUrl})`
                }}
              />
            )
            : (
              <div
                className="h-32"
                style={{
                  background:
                    `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                }}
              />
            )
          }



          <div className="px-8 pb-8 -mt-16">

            {/* LOGO */}

            {branding?.logoUrl
              ? (
                <div
                  className="w-24 h-24 rounded-full shadow-lg mx-auto mb-4 flex items-center justify-center border-4"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--card)"
                  }}
                >
                  <img
                    src={branding.logoUrl}
                    className="w-full h-full object-contain"
                  />
                </div>
              )
              : (
                <div
                  className="w-24 h-24 rounded-full shadow-lg mx-auto mb-4 flex items-center justify-center border-4"
                  style={{
                    background: primaryColor,
                    borderColor: "var(--card)"
                  }}
                >
                  <Building2 className="w-12 h-12 text-white"/>
                </div>
              )
            }



            {/* TITLE */}

            <div className="text-center mb-6">

              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--text)" }}
              >
                {branding?.name}
              </h1>

              <p
                className="text-sm font-mono"
                style={{
                  color: "var(--text-secondary)"
                }}
              >
                {branding?.code}
              </p>

            </div>



            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {error && (
                <div
                  className="border rounded-lg px-4 py-3 text-sm"
                  style={{
                    background:
                      "var(--primary-soft)",
                    borderColor:
                      "var(--primary)",
                    color:
                      "var(--primary)"
                  }}
                >
                  {error}
                </div>
              )}



              {/* EMAIL */}

              <div>

                <label
                  className="block text-sm mb-2"
                  style={{
                    color:
                      "var(--text-secondary)"
                  }}
                >
                  Email
                </label>

                <div className="relative">

                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{
                      color:
                        "var(--text-secondary)"
                    }}
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor:
                        "var(--border)",
                      background:
                        "var(--surface)",
                      color:
                        "var(--text)"
                    }}
                  />

                </div>

              </div>



              {/* PASSWORD */}

              <div>

                <label
                  className="block text-sm mb-2"
                  style={{
                    color:
                      "var(--text-secondary)"
                  }}
                >
                  Password
                </label>

                <div className="relative">

                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{
                      color:
                        "var(--text-secondary)"
                    }}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor:
                        "var(--border)",
                      background:
                        "var(--surface)",
                      color:
                        "var(--text)"
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      color:
                        "var(--text-secondary)"
                    }}
                  >
                    {showPassword
                      ? <EyeOff className="w-5 h-5"/>
                      : <Eye className="w-5 h-5"/>
                    }
                  </button>

                </div>

              </div>



              {/* BUTTON */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                style={{
                  background:
                    primaryColor
                }}
              >

                {isSubmitting
                  ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin"/>
                      Signing In...
                    </>
                  )
                  : "Sign In"
                }

              </button>

            </form>



            {/* FOOTER */}

            <div className="mt-6 text-center">

              <button
                onClick={() => navigate("/login")}
                className="text-sm"
                style={{
                  color:
                    "var(--text-secondary)"
                }}
              >
                Go to Main Login
              </button>

            </div>

          </div>

        </div>



        <div
          className="mt-4 text-center text-xs"
          style={{
            color:
              "var(--text-secondary)"
          }}
        >
          Secure login to {branding?.name} LMS
        </div>

      </div>

    </div>

  );

};

export default CollegeLoginPage;
