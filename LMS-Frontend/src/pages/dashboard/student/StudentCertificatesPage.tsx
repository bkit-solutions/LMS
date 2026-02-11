import React, { useEffect, useState } from "react";
import { certificateApi } from "../../../services/certificateApi";
import type { CertificateResponse } from "../../../types";

const StudentCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificateApi.getMyCertificates();
      if (response.success && response.data) {
        setCertificates(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text mb-2">My Certificates</h1>
      <p className="text-text-secondary mb-6">
        View and download your earned certificates
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-xl shadow-md border border-border overflow-hidden"
          >
            {/* Certificate header with college branding */}
            <div className="bg-primary p-4">
              <div className="flex items-center gap-3">
                {cert.collegeLogoUrl && (
                  <img
                    src={cert.collegeLogoUrl}
                    alt={cert.collegeName}
                    className="w-10 h-10 rounded-full bg-white object-contain p-1"
                  />
                )}
                <div className="text-white">
                  <p className="text-xs opacity-80">Issued by</p>
                  <p className="font-semibold text-sm">{cert.collegeName}</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold text-text">{cert.courseTitle}</h3>
              <p className="text-sm text-text-secondary mt-1">
                Awarded to: <span className="font-medium text-text">{cert.studentName}</span>
              </p>
              <p className="text-xs text-text-secondary mt-2">
                Issued: {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "N/A"}
              </p>
              <p className="text-xs font-mono text-text-secondary mt-1 bg-surface px-2 py-1 rounded">
                ID: {cert.certificateUid}
              </p>

              <div className="mt-4 flex gap-2">
                {cert.downloadUrl && (
                  <a
                    href={cert.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-secondary transition-colors"
                  >
                    Download
                  </a>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cert.certificateUid);
                  }}
                  className="flex-1 text-center py-2 rounded-lg bg-surface text-text-secondary text-sm font-medium hover:bg-border transition-colors"
                >
                  Copy ID
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {certificates.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎓</div>
          <p className="text-text-secondary text-lg">No certificates earned yet.</p>
          <p className="text-text-secondary text-sm mt-1">
            Complete courses to earn certificates.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentCertificatesPage;
