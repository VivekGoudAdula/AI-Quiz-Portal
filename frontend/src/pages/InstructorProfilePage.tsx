


import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store';
import { User, Mail } from 'lucide-react';

const InstructorProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -mx-4 px-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">No user data found</h1>
            <p>Please log in to view your profile.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -mx-4 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                  <User className="text-white" size={40} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {user.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Instructor Profile</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-105' : ''}`}>
                    <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={user.email}
                      readOnly
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg dark:bg-gray-700 dark:text-white bg-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 cursor-not-allowed"
                    />
                  </div>
                </div>
                {/* Add more fields here if available in user */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InstructorProfilePage;
