import React, { useEffect, useState } from "react";
import { userApi, userManagementApi, type UserResponse } from "../../../../services/authApi";
import { useAppSelector } from "../../../../app/hooks";
import { useCollegeTheme } from "../../../../hooks/useCollegeTheme";
import {
  Plus,
  Search,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Trash2,
  X,
  AlertCircle,
  GraduationCap,
  UserCheck,
  UserX,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";

interface CreateFacultyForm {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  bio?: string;
}

const FacultyManagementPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { applyTheme } = useCollegeTheme();
  const [faculty, setFaculty] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const [formData, setFormData] = useState<CreateFacultyForm>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    bio: "",
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getFaculty();
      if (response.success && response.data) {
        // Transform nested college object if likely returned from generic list
        const processedList = response.data.map((f: any) => {
          if (f.college && !f.collegeId) {
            return {
              ...f,
              collegeId: f.college.id,
              collegeName: f.college.name,
              collegeCode: f.college.code
            };
          }
          return f;
        });

        // Filter by college if admin
        let facultyList = processedList;
        if (user?.type === "ADMIN" && user.collegeId) {
          facultyList = facultyList.filter((f) => f.collegeId === user.collegeId);
        }
        setFaculty(facultyList);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load faculty");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await userManagementApi.createFaculty({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        collegeId: user?.collegeId,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
      });

      if (response.success) {
        setSuccess("Faculty member created successfully");
        setShowForm(false);
        resetForm();
        setTimeout(() => {
          fetchFaculty();
        }, 100);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create faculty");
    }
  };

  const handleToggleStatus = async (facultyId: number) => {
    try {
      const response = await userManagementApi.toggleUserStatus(facultyId);
      if (response.success) {
        setSuccess("Faculty status updated");
        fetchFaculty();
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (facultyId: number) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) {
      return;
    }

    try {
      await userManagementApi.deleteUser(facultyId);
      setSuccess("Faculty member deleted");
      fetchFaculty();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete faculty");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      bio: "",
    });
  };

  const handleExport = () => {
    try {
      // Prepare CSV data
      const headers = ['Name', 'Email', 'Phone Number', 'Bio', 'Status', 'ID'];
      const rows = filteredFaculty.map(f => [
        f.name,
        f.email,
        f.phoneNumber || '',
        f.bio || '',
        f.isActive ? 'Active' : 'Inactive',
        f.id.toString()
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `faculty_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`Exported ${filteredFaculty.length} faculty members successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to export faculty');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setError('CSV file is empty or invalid');
        return;
      }

      // Parse CSV (skip header)
      const facultyMembers = lines.slice(1).map((line) => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        return {
          name: values[0],
          email: values[1],
          password: values[2] || 'faculty123', // Default password
          phoneNumber: values[3] || undefined,
          bio: values[4] || undefined
        };
      });

      // Validate data
      const invalidRows: number[] = [];
      facultyMembers.forEach((faculty, index) => {
        if (!faculty.name || !faculty.email) {
          invalidRows.push(index + 2); // +2 for header and 0-index
        }
      });

      if (invalidRows.length > 0) {
        setError(`Invalid data in rows: ${invalidRows.join(', ')}. Name and Email are required.`);
        return;
      }

      // Import faculty one by one
      let successCount = 0;
      let failCount = 0;

      for (const faculty of facultyMembers) {
        try {
          const response = await userManagementApi.createFaculty({
            ...faculty,
            collegeId: user?.collegeId
          });
          if (response.success) successCount++;
          else failCount++;
        } catch {
          failCount++;
        }
      }

      setSuccess(`Imported ${successCount} faculty members successfully${failCount > 0 ? `. ${failCount} failed.` : ''}`);
      fetchFaculty();
      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      setError('Failed to import faculty. Please check file format.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const headers = ['Name', 'Email', 'Password', 'Phone Number', 'Bio'];
    const sampleData = [
      ['Dr. John Doe', 'john.doe@example.com', 'password123', '+1234567890', 'PhD in Computer Science'],
      ['Prof. Jane Smith', 'jane.smith@example.com', 'password123', '+0987654321', 'Masters in Mathematics']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'faculty_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccess('Template downloaded successfully');
    setTimeout(() => setSuccess(null), 2000);
  };

  const filteredFaculty = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Loading Faculty...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="rounded-3xl border shadow-lg p-8 mb-8" style={{ background: 'var(--gradient-primary)', borderColor: 'var(--primary)' }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3" style={{ color: 'white' }}>
              <div className="p-2 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                <GraduationCap className="w-6 h-6" />
              </div>
              Faculty Management
            </h1>
            <p className="text-white/90 text-lg font-medium">
              Manage teaching staff for your institution
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            style={{ background: 'white', color: 'var(--primary)' }}
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Cancel" : "Add Faculty"}
          </button>
        </div>

        {/* Batch Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleExport}
            disabled={faculty.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
          >
            <Download className="w-4 h-4" />
            Export Faculty
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import Faculty'}
          </button>

          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all hover:opacity-90"
            style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white' }}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Template
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-2xl border px-6 py-4 mb-6 flex items-center justify-between transition-all hover:shadow-md" style={{ background: 'var(--error)', borderColor: 'var(--error)', color: 'white' }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="hover:opacity-70 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border px-6 py-4 mb-6 flex items-center justify-between transition-all hover:shadow-md" style={{ background: 'var(--success)', borderColor: 'var(--success)', color: 'white' }}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="hover:opacity-70 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border shadow-sm p-6 transition-all hover:shadow-lg" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--info)', color: 'white' }}>
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black" style={{ color: 'var(--info)' }}>{faculty.length}</span>
          </div>
          <h4 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Total Faculty</h4>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>All teaching staff</p>
        </div>
        <div className="rounded-2xl border shadow-sm p-6 transition-all hover:shadow-lg" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--success)', color: 'white' }}>
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black" style={{ color: 'var(--success)' }}>{faculty.filter((f) => f.isActive).length}</span>
          </div>
          <h4 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Active</h4>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Currently teaching</p>
        </div>
        <div className="rounded-2xl border shadow-sm p-6 transition-all hover:shadow-lg" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--error)', color: 'white' }}>
              <UserX className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black" style={{ color: 'var(--error)' }}>{faculty.filter((f) => !f.isActive).length}</span>
          </div>
          <h4 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Inactive</h4>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Not currently active</p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-3xl border shadow-lg p-8 mb-8" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--foreground)' }}>Add New Faculty Member</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-offset-0 transition-all"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-offset-0 transition-all"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                placeholder="faculty@college.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-offset-0 transition-all"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-offset-0 transition-all"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-offset-0 transition-all"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                rows={3}
                placeholder="Brief description, qualifications, etc."
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-8 py-3 border rounded-xl font-bold transition-all hover:shadow-md"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--background)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                Create Faculty
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="rounded-2xl border shadow-sm p-4 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border rounded-xl font-medium focus:ring-2 focus:ring-offset-0 transition-all"
            style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Faculty List */}
      <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                  Faculty Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                  Status
                </th>
                <th className="px-8 py-4 text-right text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredFaculty.map((f) => (
                <tr key={f.id} className="hover:bg-[var(--muted)] transition-colors">
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{f.name}</div>
                    {f.bio && (
                      <div className="text-sm truncate max-w-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        {f.bio}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <Mail className="w-4 h-4" />
                        <span className="font-medium">{f.email}</span>
                      </div>
                      {f.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          <Phone className="w-4 h-4" />
                          <span className="font-medium">{f.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className="inline-flex px-3 py-1 text-xs font-bold rounded-full"
                      style={{
                        background: f.isActive ? 'var(--success)' : 'var(--error)',
                        color: 'white'
                      }}
                    >
                      {f.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(f.id)}
                        className="p-2 rounded-xl transition-all hover:shadow-md"
                        style={{
                          background: f.isActive ? 'var(--error)' : 'var(--success)',
                          color: 'white'
                        }}
                        title={f.isActive ? "Deactivate" : "Activate"}
                      >
                        {f.isActive ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-2 rounded-xl transition-all hover:shadow-md"
                        style={{ background: 'var(--error)', color: 'white' }}
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredFaculty.length === 0 && (
        <div className="rounded-3xl border shadow-sm p-16 text-center mt-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <GraduationCap className="w-10 h-10 opacity-50" style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--foreground)' }}>No faculty found</h3>
          <p style={{ color: 'var(--muted-foreground)' }}>
            {searchTerm ? "Try adjusting your search" : "Add your first faculty member"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FacultyManagementPage;
