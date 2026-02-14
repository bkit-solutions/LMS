import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  FileText,
  ChevronDown,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";

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



  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { loading, error, isAuthenticated } =
    useAppSelector((state) => state.auth);



  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });



  /* CSV STATE */

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvUsers, setCsvUsers] = useState<CsvUser[]>([]);

  const [csvUploading, setCsvUploading] = useState(false);

  const [csvError, setCsvError] = useState<string | null>(null);

  const [showCsvSection, setShowCsvSection] = useState(false);



  /* INPUT CHANGE */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  };



  /* SINGLE USER SUBMIT */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      await dispatch(
        onSubmitAction(formData)
      ).unwrap();

      alert(successMessage);

      navigate(redirectPath);

    }
    catch {

      // handled by slice

    }

  };







  /* CSV PARSE */

  const parseCsv = (
    text: string
  ): CsvUser[] => {

    const lines = text.trim().split("\n");

    if (lines.length < 2) return [];

    const header =
      lines[0]
        .toLowerCase()
        .split(",")
        .map((h) => h.trim());

    const nameIdx =
      header.findIndex(
        (h) =>
          h === "name" ||
          h === "username" ||
          h === "full name" ||
          h === "fullname"
      );

    const emailIdx =
      header.findIndex(
        (h) =>
          h === "email" ||
          h === "email address"
      );

    const passIdx =
      header.findIndex(
        (h) =>
          h === "password" ||
          h === "pass"
      );

    if (
      nameIdx === -1 ||
      emailIdx === -1 ||
      passIdx === -1
    ) {

      throw new Error(
        "CSV must have columns: name, email, password"
      );

    }



    const users: CsvUser[] = [];

    for (let i = 1; i < lines.length; i++) {

      const cols =
        lines[i]
          .split(",")
          .map((c) => c.trim());

      const name = cols[nameIdx];

      const email = cols[emailIdx];

      const password = cols[passIdx];

      if (name && email && password) {

        users.push({
          name,
          email,
          password,
        });

      }

    }

    return users;

  };



  /* CSV FILE CHANGE */

  const handleFileChange =
    (e: React.ChangeEvent<HTMLInputElement>) => {

      const file = e.target.files?.[0];

      if (!file) return;

      setCsvError(null);

      if (!file.name.endsWith(".csv")) {

        setCsvError("Please upload CSV file");

        return;

      }

      const reader = new FileReader();

      reader.onload = (event) => {

        try {

          const users =
            parseCsv(
              event.target?.result as string
            );

          if (!users.length) {

            setCsvError(
              "No valid users found"
            );

            return;

          }

          setCsvUsers(users);

        }
        catch (err: any) {

          setCsvError(err.message);

        }

      };

      reader.readAsText(file);

    };



  /* CSV UPLOAD */

  const handleCsvUpload = async () => {

    if (!csvUsers.length) return;

    setCsvUploading(true);

    const results: CsvResult[] = [];

    for (const user of csvUsers) {

      try {

        await dispatch(
          onSubmitAction(user)
        ).unwrap();

        results.push({
          user,
          success: true,
          message: "Created",
        });

      }
      catch (err: any) {

        results.push({
          user,
          success: false,
          message:
            err?.message || "Failed",
        });

      }

    }

    setCsvUploading(false);

  };







  /* AUTH BLOCK */

  if (requireAuth && !isAuthenticated) {

    return (

      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "var(--surface)"
        }}
      >

        <div
          className="p-8 rounded-lg text-center"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)"
          }}
        >

          <h2
            style={{ color: "var(--text)" }}
            className="text-xl font-bold mb-2"
          >
            Access Denied
          </h2>

          <p style={{ color: "var(--text-secondary)" }}>
            Please login first
          </p>

        </div>

      </div>

    );

  }



  /* ICON COLOR */

  const getIconColor = () => {

    switch (mode) {

      case UserCreationMode.CREATE_USER:
        return "var(--primary)";

      case UserCreationMode.CREATE_ADMIN:
        return "var(--secondary)";

      default:
        return "var(--primary)";

    }

  };



  /* UI */

  return (

    <div
      className="flex items-center justify-center p-4"
      style={{ background: "var(--surface)" }}
    >

      <div
        className="p-8 rounded-xl w-full max-w-md"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)"
        }}
      >



        {/* HEADER */}

        <div className="text-center mb-6">

          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: getIconColor()
            }}
          >

            <User className="w-8 h-8 text-white" />

          </div>


          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text)" }}
          >
            {title}
          </h2>


          <p
            className="text-sm"
            style={{
              color: "var(--text-secondary)"
            }}
          >
            {description}
          </p>

        </div>



        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)"
            }}
          />


          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)"
            }}
          />


          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)"
            }}
          />


          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-white font-semibold"
            style={{
              background: "var(--primary)"
            }}
          >

            {loading
              ? "Processing..."
              : title}

          </button>

        </form>



        {/* ERROR */}

        {error && (

          <div
            className="mt-4 p-3 rounded-lg"
            style={{
              background: "var(--primary-soft)",
              color: "var(--primary)"
            }}
          >

            {error}

          </div>

        )}



        {/* CSV SECTION */}

        {mode === UserCreationMode.CREATE_USER && (

          <div className="mt-6">

            <button
              onClick={() =>
                setShowCsvSection(!showCsvSection)
              }
              className="flex items-center gap-2"
              style={{
                color: "var(--primary)"
              }}
            >

              <FileText className="w-4 h-4" />

              Bulk Upload CSV

              <ChevronDown
                className={`w-4 h-4 ${
                  showCsvSection
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>



            {showCsvSection && (

              <div className="mt-4 space-y-3">

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />


                {csvError && (

                  <div
                    style={{
                      color: "var(--primary)"
                    }}
                  >
                    {csvError}
                  </div>

                )}



                {csvUsers.length > 0 && (

                  <button
                    onClick={handleCsvUpload}
                    disabled={csvUploading}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{
                      background: "var(--primary)"
                    }}
                  >

                    {csvUploading
                      ? "Creating..."
                      : `Create ${csvUsers.length} users`}

                  </button>

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
