// ...existing code...


import React, { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store';
import { apiClient } from '../api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient.getCurrentUser()
      .then(res => {
        setUser(res.data.user);
        setName(res.data.user?.name || '');
        setPhotoURL(res.data.user?.photoURL || '');
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, [setUser]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoURL(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    // Simulate upload to a public image host (replace with real upload in production)
    const formData = new FormData();
    formData.append('file', photoFile);
    // For demo: use https://api.imgbb.com/1/upload or similar, here we just use a fake URL
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Replace this with your real upload logic
      // const uploadRes = await fetch('YOUR_IMAGE_UPLOAD_ENDPOINT', { method: 'POST', body: formData });
      // const data = await uploadRes.json();
      // const uploadedUrl = data.url;
      // For now, just use a local preview
      const uploadedUrl = photoURL;
      await apiClient.updateProfile(name, uploadedUrl);
      setUser({ ...user, name, photoURL: uploadedUrl });
      setSuccess('Profile photo updated!');
    } catch (err: any) {
      setError('Failed to upload photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.updateProfile(name, photoURL);
      setUser({ ...user, name, photoURL });
      setSuccess('Profile updated!');
    } catch (err: any) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">My Profile</h1>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Avatar and Upload */}
          <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
            <div className="relative">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-500 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              )}
              <button
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            {photoFile && (
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={handlePhotoUpload}
                disabled={loading}
              >
                Upload Photo
              </button>
            )}
          </div>

          {/* Profile Form */}
          <form className="flex-1 space-y-6 w-full" onSubmit={handleProfileSave}>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white focus:outline-none"
                value={user?.email || ''}
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Role</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white focus:outline-none"
                value={user?.role || ''}
                disabled
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
              disabled={loading}
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
