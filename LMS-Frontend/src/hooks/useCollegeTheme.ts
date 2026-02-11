import { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import { collegeApi } from "../services/collegeApi";
import type { CollegeBranding } from "../types";

interface CollegeTheme {
  branding: CollegeBranding | null;
  loading: boolean;
  error: string | null;
  primaryColor: string;
  secondaryColor: string;
  applyTheme: () => void;
}

export const useCollegeTheme = (): CollegeTheme => {
  const { user } = useAppSelector((state) => state.auth);
  const [branding, setBranding] = useState<CollegeBranding | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultPrimaryColor = "#dc2626";
  const defaultSecondaryColor = "#991b1b";

  useEffect(() => {
    const fetchBranding = async () => {
      // Only fetch branding for college-associated users
      if (!user?.collegeCode || user.type === "ROOTADMIN" || user.type === "SUPERADMIN") {
        return;
      }

      try {
        setLoading(true);
        const response = await collegeApi.getCollegeBranding(user.collegeCode);
        if (response.success && response.data) {
          setBranding(response.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load college branding");
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, [user?.collegeCode, user?.type]);

  const applyTheme = () => {
    if (branding) {
      document.documentElement.style.setProperty("--color-primary", branding.primaryColor || defaultPrimaryColor);
      document.documentElement.style.setProperty("--color-secondary", branding.secondaryColor || defaultSecondaryColor);
    } else {
      document.documentElement.style.setProperty("--color-primary", defaultPrimaryColor);
      document.documentElement.style.setProperty("--color-secondary", defaultSecondaryColor);
    }
  };

  useEffect(() => {
    applyTheme();
  }, [branding]);

  return {
    branding,
    loading,
    error,
    primaryColor: branding?.primaryColor || defaultPrimaryColor,
    secondaryColor: branding?.secondaryColor || defaultSecondaryColor,
    applyTheme,
  };
};
