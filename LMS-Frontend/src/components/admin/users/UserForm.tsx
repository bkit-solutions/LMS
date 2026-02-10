import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { clearError } from "../../../features/auth/authSlice";
import { UserCreationMode } from "../../../types";
import type { UserCreationModeType } from "../../../types";

interface CsvUser {
  name: string;
  email: string;
  password: string;
}

interface CsvResult {
  user: CsvUser;
  success: boolean;
  message: string;
}

interface GenericUserFormProps {
  mode: UserCreationModeType;
  onSubmitAction: (data: any) => any;
  title: string;
  description: string;
  successMessage: string;
  redirectPath: string;
  requireAuth?: boolean;
}

const GenericUserForm: React.FC<GenericUserFormProps> = ({
  mode,
  onSubmitAction,
  title,
  description,
  successMessage,
  redirectPath,
  requireAuth = true,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  // CSV state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvUsers, setCsvUsers] = useState<CsvUser[]>([]);
  const [csvResults, setCsvResults] = useState<CsvResult[]>([]);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [showCsvSection, setShowCsvSection] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(onSubmitAction(formData)).unwrap();
      alert(successMessage);
      navigate(redirectPath);
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  // CSV parsing
  const parseCsv = (text: string): CsvUser[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const header = lines[0]
      .toLowerCase()
      .split(",")
      .map((h) => h.trim());
    const nameIdx = header.findIndex(
      (h) =>
        h === "name" ||
        h === "username" ||
        h === "full name" ||
        h === "fullname",
    );
    const emailIdx = header.findIndex(
      (h) => h === "email" || h === "email address",
    );
    const passIdx = header.findIndex((h) => h === "password" || h === "pass");

    if (nameIdx === -1 || emailIdx === -1 || passIdx === -1) {
      throw new Error("CSV must have columns: name, email, password");
    }

    const users: CsvUser[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(",").map((c) => c.trim());
      const name = cols[nameIdx];
      const email = cols[emailIdx];
      const password = cols[passIdx];
      if (name && email && password) {
        users.push({ name, email, password });
      }
    }
    return users;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);
    setCsvResults([]);

    if (!file.name.endsWith(".csv")) {
      setCsvError("Please upload a .csv file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const users = parseCsv(text);
        if (users.length === 0) {
          setCsvError("No valid users found in the CSV file");
          return;
        }
        setCsvUsers(users);
      } catch (err: any) {
        setCsvError(err.message || "Failed to parse CSV file");
      }
    };
    reader.readAsText(file);
  };

  const handleCsvUpload = async () => {
    if (csvUsers.length === 0) return;
    setCsvUploading(true);
    setCsvError(null);
    const results: CsvResult[] = [];

    for (const user of csvUsers) {
      try {
        await dispatch(onSubmitAction(user)).unwrap();
        results.push({ user, success: true, message: "Created successfully" });
      } catch (err: any) {
        results.push({
          user,
          success: false,
          message: typeof err === "string" ? err : err?.message || "Failed",
        });
      }
    }

    setCsvResults(results);
    setCsvUploading(false);
    dispatch(clearError());

    const successCount = results.filter((r) => r.success).length;
    if (successCount === results.length) {
      alert(`All ${successCount} users created successfully!`);
    } else {
      alert(
        `${successCount} of ${results.length} users created. Check results below for details.`,
      );
    }
  };

  const handleClearCsv = () => {
    setCsvUsers([]);
    setCsvResults([]);
    setCsvError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-text mb-4">Access Denied</h2>
          <p className="text-text-secondary">
            Please log in to perform this action.
          </p>
        </div>
      </div>
    );
  }

  const getIconColor = () => {
    switch (mode) {
      case UserCreationMode.INIT_ROOT_ADMIN:
        return "bg-primary";
      case UserCreationMode.CREATE_SUPER_ADMIN:
        return "bg-secondary";
      case UserCreationMode.CREATE_ADMIN:
        return "bg-secondary";
      case UserCreationMode.CREATE_USER:
        return "bg-accent";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="bg-background flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 ${getIconColor()} rounded-lg flex items-center justify-center mx-auto mb-4`}
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text mb-1">{title}</h2>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text transition-colors"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text transition-colors"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text transition-colors"
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${getIconColor()} hover:opacity-90 disabled:bg-text-secondary text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 disabled:cursor-not-allowed`}
          >
            {loading ? "Processing..." : title}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-md">
            <div className="flex justify-between items-center">
              <p className="text-accent text-sm">{error}</p>
              <button
                onClick={handleClearError}
                className="text-accent hover:text-secondary text-sm font-medium"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* CSV Bulk Upload Section — only for CREATE_USER mode */}
        {mode === UserCreationMode.CREATE_USER && (
          <div className="mt-6 border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setShowCsvSection(!showCsvSection)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-semibold text-text">
                  Bulk Create Users from CSV
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-text-secondary transition-transform ${showCsvSection ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showCsvSection && (
              <div className="mt-4 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 mb-2">
                    Upload a CSV file with columns: <strong>name</strong>,{" "}
                    <strong>email</strong>, <strong>password</strong>
                  </p>
                  <a
                    href="/sample_students.csv"
                    download="sample_students.csv"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download sample CSV
                  </a>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-secondary file:cursor-pointer file:transition-colors"
                  />
                </div>

                {csvError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                    {csvError}
                  </div>
                )}

                {csvUsers.length > 0 && csvResults.length === 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-text mb-2">
                      Preview ({csvUsers.length} users)
                    </h4>
                    <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-text-secondary">
                              #
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-text-secondary">
                              Name
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-text-secondary">
                              Email
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-text-secondary">
                              Password
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {csvUsers.map((u, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 text-text-secondary">
                                {idx + 1}
                              </td>
                              <td className="px-3 py-2 text-text">{u.name}</td>
                              <td className="px-3 py-2 text-text">{u.email}</td>
                              <td className="px-3 py-2 text-text-secondary">
                                {"•".repeat(Math.min(u.password.length, 8))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleCsvUpload}
                        disabled={csvUploading}
                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-secondary transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        {csvUploading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Creating users...
                          </>
                        ) : (
                          `Create ${csvUsers.length} Users`
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleClearCsv}
                        disabled={csvUploading}
                        className="px-4 py-2 border border-border text-text text-sm font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {csvResults.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-text mb-2">
                      Results —{" "}
                      <span className="text-green-600">
                        {csvResults.filter((r) => r.success).length} created
                      </span>
                      {csvResults.some((r) => !r.success) && (
                        <span className="text-red-600">
                          , {csvResults.filter((r) => !r.success).length} failed
                        </span>
                      )}
                    </h4>
                    <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-text-secondary">
                              Name
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-text-secondary">
                              Email
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-text-secondary">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {csvResults.map((r, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 text-text">
                                {r.user.name}
                              </td>
                              <td className="px-3 py-2 text-text">
                                {r.user.email}
                              </td>
                              <td className="px-3 py-2">
                                {r.success ? (
                                  <span className="text-green-600 font-medium">
                                    ✓ Created
                                  </span>
                                ) : (
                                  <span
                                    className="text-red-600 font-medium"
                                    title={r.message}
                                  >
                                    ✗ {r.message}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearCsv}
                      className="mt-3 px-4 py-2 border border-border text-text text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Upload Another CSV
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericUserForm;
