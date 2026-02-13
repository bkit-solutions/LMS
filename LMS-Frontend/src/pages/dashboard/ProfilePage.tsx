import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../../services/profileApi";
import { useCollegeTheme } from "../../hooks/useCollegeTheme";
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from "../../types";

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">Failed to load profile</p>
                    <button onClick={() => navigate(collegeCode ? `/${collegeCode}/dashboard` : "/dashboard")} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface py-8">
            <div className="max-w-4xl mx-auto px-4">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-primary px-8 py-12 text-white relative">
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{profile.name}</h1>
                                <p className="text-blue-100 text-lg">{profile.email}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                                    {profile.type}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                        <button
                            onClick={() => setEditing(!editing)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            {editing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {editing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem label="Phone Number" value={profile.phoneNumber || "Not provided"} />
                            <InfoItem label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not provided"} />
                            <InfoItem label="City" value={profile.city || "Not provided"} />
                            <InfoItem label="Country" value={profile.country || "Not provided"} />
                            <InfoItem label="Address" value={profile.address || "Not provided"} />
                            <InfoItem label="Member Since" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Unknown"} />
                            {profile.bio && (
                                <div className="md:col-span-2">
                                    <InfoItem label="Bio" value={profile.bio} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Change Password Section */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Security</h2>
                        <button
                            onClick={() => setChangingPassword(!changingPassword)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                        >
                            {changingPassword ? 'Cancel' : 'Change Password'}
                        </button>
                    </div>

                    {changingPassword && (
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                            >
                                Update Password
                            </button>
                        </form>
                    )}

                    {!changingPassword && (
                        <p className="text-gray-600">
                            Last login: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : "Unknown"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
        <div className="text-gray-900">{value}</div>
    </div>
);

export default ProfilePage;
