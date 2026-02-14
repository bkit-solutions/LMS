import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../../services/profileApi";
import { useCollegeTheme } from "../../hooks/useCollegeTheme";
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from "../../types";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Lock,
  Building2,
  GraduationCap,
  ShieldCheck,
  Crown,
  UserCog,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { applyTheme } = useCollegeTheme();
    const collegeCode = window.location.pathname.split("/")[1];
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        applyTheme();
    }, [applyTheme]);
    const [changingPassword, setChangingPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState<UpdateProfileRequest>({
        name: "",
        phoneNumber: "",
        bio: "",
        dateOfBirth: "",
        address: "",
        city: "",
        country: "",
    });

    const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await profileApi.getUserProfile();
            if (response.success && response.data) {
                setProfile(response.data);
                // Pre-fill form data
                setFormData({
                    name: response.data.name || "",
                    phoneNumber: response.data.phoneNumber || "",
                    bio: response.data.bio || "",
                    dateOfBirth: response.data.dateOfBirth || "",
                    address: response.data.address || "",
                    city: response.data.city || "",
                    country: response.data.country || "",
                });
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to load profile' });
            }
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
                localStorage.removeItem("token");
                navigate("/login", { replace: true });
                return;
            }
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await profileApi.updateProfile(formData);
            if (response.success && response.data) {
                setProfile(response.data);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setEditing(false);
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }
        try {
            const response = await profileApi.changePassword(passwordData);
            if (response.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setChangingPassword(false);
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to change password' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
        }
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "ROOTADMIN": return <Crown className="w-5 h-5" />;
            case "SUPERADMIN": return <ShieldCheck className="w-5 h-5" />;
            case "ADMIN": return <UserCog className="w-5 h-5" />;
            case "FACULTY": return <GraduationCap className="w-5 h-5" />;
            case "USER": return <User className="w-5 h-5" />;
            default: return <User className="w-5 h-5" />;
        }
    };

    const getRoleDisplay = (role: string) => {
        switch (role) {
            case "ROOTADMIN": return "Root Administrator";
            case "SUPERADMIN": return "Super Administrator";
            case "ADMIN": return "College Administrator";
            case "FACULTY": return "Faculty Member";
            case "USER": return "Student";
            default: return role;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
                    <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
                <div className="text-center space-y-4">
                    <AlertCircle className="w-16 h-16 mx-auto" style={{ color: 'var(--error)' }} />
                    <p className="text-lg font-bold" style={{ color: 'var(--error)' }}>Failed to load profile</p>
                    <button 
                        onClick={() => navigate(collegeCode ? `/${collegeCode}/dashboard` : "/dashboard")} 
                        className="px-6 py-2 rounded-lg font-medium transition-colors"
                        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--background)' }}>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Alert Messages */}
                {message && (
                    <div 
                        className="rounded-xl border p-4 flex items-center gap-3"
                        style={{
                            background: message.type === 'success' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                            borderColor: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                            color: message.type === 'success' ? 'var(--success)' : 'var(--error)'
                        }}
                    >
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-medium">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="ml-auto">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Profile Header */}
                <div className="rounded-3xl border shadow-lg overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="px-8 py-12 relative" style={{ background: 'var(--gradient-primary)' }}>
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
                        </div>
                        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl font-black shadow-2xl" style={{ color: 'white' }}>
                                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-4xl font-black mb-2" style={{ color: 'white' }}>{profile.name}</h1>
                                <div className="flex flex-col md:flex-row gap-3 items-center md:items-start">
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm font-medium">{profile.email}</span>
                                    </div>
                                    <div 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm"
                                        style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                                    >
                                        {getRoleIcon(profile.type)}
                                        {getRoleDisplay(profile.type)}
                                    </div>
                                </div>
                                {profile.bio && (
                                    <p className="mt-4 text-white/80 text-sm max-w-2xl">{profile.bio}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="rounded-3xl border shadow-sm p-8" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Profile Information</h2>
                        </div>
                        <button
                            onClick={() => setEditing(!editing)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
                            style={{ 
                                background: editing ? 'var(--muted)' : 'var(--primary)', 
                                color: editing ? 'var(--foreground)' : 'var(--primary-foreground)' 
                            }}
                        >
                            {editing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
                        </button>
                    </div>

                    {editing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                        <User className="w-3 h-3 inline mr-1" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium"
                                        style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                        <Phone className="w-3 h-3 inline mr-1" /> Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium"
                                        style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                        <Calendar className="w-3 h-3 inline mr-1" /> Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium"
                                        style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                        <MapPin className="w-3 h-3 inline mr-1" /> City
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium"
                                        style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                        <MapPin className="w-3 h-3 inline mr-1" /> Country
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium"
                                        style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                        <Building2 className="w-3 h-3 inline mr-1" /> Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium"
                                        style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                    About You
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium"
                                    style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                                    style={{ background: 'var(--success)', color: 'white' }}
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoCard icon={<Phone className="w-4 h-4" />} label="Phone Number" value={profile.phoneNumber || "Not provided"} />
                            <InfoCard icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not provided"} />
                            <InfoCard icon={<MapPin className="w-4 h-4" />} label="City" value={profile.city || "Not provided"} />
                            <InfoCard icon={<MapPin className="w-4 h-4" />} label="Country" value={profile.country || "Not provided"} />
                            <InfoCard icon={<Building2 className="w-4 h-4" />} label="Address" value={profile.address || "Not provided"} />
                            <InfoCard icon={<Clock className="w-4 h-4" />} label="Member Since" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Unknown"} />
                        </div>
                    )}
                </div>

                {/* Change Password Section */}
                <div className="rounded-3xl border shadow-sm p-8" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ background: 'rgba(234, 88, 12, 0.1)', color: 'var(--warning)' }}>
                                <Lock className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Security Settings</h2>
                        </div>
                        <button
                            onClick={() => setChangingPassword(!changingPassword)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
                            style={{ 
                                background: changingPassword ? 'var(--muted)' : 'var(--warning)', 
                                color: changingPassword ? 'var(--foreground)' : 'white' 
                            }}
                        >
                            {changingPassword ? <><X className="w-4 h-4" /> Cancel</> : <><Lock className="w-4 h-4" /> Change Password</>}
                        </button>
                    </div>

                    {changingPassword && (
                        <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                    <Lock className="w-3 h-3 inline mr-1" /> Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium"
                                    style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                    <Lock className="w-3 h-3 inline mr-1" /> New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium"
                                    style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    required
                                />
                                <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>Minimum 6 characters</p>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                    <Lock className="w-3 h-3 inline mr-1" /> Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium"
                                    style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                                style={{ background: 'var(--warning)', color: 'white' }}
                            >
                                <Shield className="w-4 h-4" />
                                Update Password
                            </button>
                        </form>
                    )}

                    {!changingPassword && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                                <Clock className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Last Login</p>
                                    <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                                        {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString('en-US', { 
                                            month: 'long', 
                                            day: 'numeric', 
                                            year: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        }) : "Unknown"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                                <Shield className="w-5 h-5" style={{ color: 'var(--success)' }} />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Account Security</p>
                                    <p className="text-sm font-bold" style={{ color: 'var(--success)' }}>Protected & Verified</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="p-5 rounded-2xl border transition-all hover:shadow-md" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {icon}
            </div>
            <div className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
        </div>
        <div className="text-base font-bold pl-10" style={{ color: 'var(--foreground)' }}>{value}</div>
    </div>
);

export default ProfilePage;
