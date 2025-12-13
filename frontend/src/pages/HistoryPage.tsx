// ...existing code...

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store';
import { apiClient } from '../api';

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      apiClient.getAttemptHistory(user.id)
        .then(res => {
          setAttempts(res.data.attempts || []);
        })
        .catch(err => {
          setError(err.response?.data?.error || 'Failed to load history');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">Attempt History</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : attempts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-300">
            No attempts found.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Quiz</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map(a => (
                  <tr key={a.attemptId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-2 font-semibold">{a.quizTitle}</td>
                    <td className="py-2">{a.endTime ? new Date(a.endTime).toLocaleString() : '-'}</td>
                    <td className="py-2">{a.score} / {a.totalMarks}</td>
                    <td className="py-2">
                      {a.isPassed ? (
                        <span className="text-green-600 font-bold">Passed</span>
                      ) : (
                        <span className="text-red-600 font-bold">Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
